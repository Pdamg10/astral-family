import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/users - List users (Admin gets all, non-admin gets own profile)
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const currentUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });

    if (!currentUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    if (currentUser.role === 'admin') {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          birthDate: true,
          birthTime: true,
          city: true,
          country: true,
          timezone: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              birthProfiles: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json({ users });
    } else {
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          birthDate: true,
          birthTime: true,
          city: true,
          country: true,
          timezone: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
      });
      return NextResponse.json({ users: user ? [user] : [] });
    }
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// PUT /api/users - Update user data & automatically recalculate matching astral birth profile
export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const currentUser = await db.user.findUnique({
      where: { id: payload.userId },
    });
    if (!currentUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const body = await request.json();
    const {
      targetUserId,
      name,
      email,
      role,
      avatar,
      birthDate,
      birthTime,
      city,
      country,
      timezone,
      latitude,
      longitude,
      currentPassword,
      newPassword,
    } = body;

    const userIdToUpdate = targetUserId || currentUser.id;

    // Permissions check: Only Admin can update other users
    if (userIdToUpdate !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos para modificar otros usuarios' }, { status: 403 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userIdToUpdate },
    });
    if (!targetUser) return NextResponse.json({ error: 'Usuario objetivo no encontrado' }, { status: 404 });

    const updateData: any = {};

    // Validate and update name
    if (name !== undefined && typeof name === 'string') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 });
      }
      updateData.name = trimmedName;
    }

    // Validate and update email
    if (email !== undefined && typeof email === 'string') {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail !== targetUser.email) {
        const existing = await db.user.findUnique({ where: { email: trimmedEmail } });
        if (existing) {
          return NextResponse.json({ error: 'El correo electrónico ya está registrado por otro usuario' }, { status: 400 });
        }
        updateData.email = trimmedEmail;
      }
    }

    // Avatar update
    if (avatar !== undefined) {
      updateData.avatar = avatar ? String(avatar).trim() : null;
    }

    // Birth info updates
    if (birthDate !== undefined) {
      updateData.birthDate = birthDate ? String(birthDate).trim() : null;
    }
    if (birthTime !== undefined) {
      updateData.birthTime = birthTime ? String(birthTime).trim() : null;
    }
    if (city !== undefined) {
      updateData.city = city ? String(city).trim() : null;
    }
    if (country !== undefined) {
      updateData.country = country ? String(country).trim() : null;
    }
    if (timezone !== undefined) {
      updateData.timezone = timezone ? String(timezone).trim() : null;
    }

    // Role modification (Only Admin can change roles)
    if (role && (role === 'admin' || role === 'member')) {
      if (currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Solo el administrador puede cambiar roles' }, { status: 403 });
      }
      // Safeguard: Prevent admin from demoting themselves if they are the only admin
      if (userIdToUpdate === currentUser.id && role !== 'admin') {
        const adminCount = await db.user.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
          return NextResponse.json({ error: 'No puedes degradar tu rol porque eres el único administrador' }, { status: 400 });
        }
      }
      updateData.role = role;
    }

    // Password modification
    if (newPassword && typeof newPassword === 'string') {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      }

      // If user is updating their own password, verify current password
      if (userIdToUpdate === currentUser.id && currentPassword) {
        const valid = await bcrypt.compare(currentPassword, targetUser.passwordHash);
        if (!valid) {
          return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
        }
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await db.user.update({
      where: { id: userIdToUpdate },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        birthDate: true,
        birthTime: true,
        city: true,
        country: true,
        timezone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // ─── AUTOMATICALLY RECALCULATE & SYNC ASSOCIATED BIRTH PROFILE ───
    try {
      const { syncUserAndBirthProfile } = await import('@/services/astrology/profileSync');
      await syncUserAndBirthProfile({
        userId: targetUser.id,
        name: updated.name,
        birthDate: updated.birthDate,
        birthTime: updated.birthTime,
        city: updated.city,
        country: updated.country,
        timezone: updated.timezone,
        latitude: latitude != null ? Number(latitude) : undefined,
        longitude: longitude != null ? Number(longitude) : undefined,
      });
    } catch (syncError) {
      console.error('Error syncing astral profile with user update:', syncError);
    }

    return NextResponse.json({
      success: true,
      user: updated,
      message: 'Datos y carta astral actualizados exitosamente',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// DELETE /api/users - Delete user (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const currentUser = await db.user.findUnique({
      where: { id: payload.userId },
    });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Solo el administrador puede eliminar usuarios' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const idToDelete = searchParams.get('id');
    if (!idToDelete) {
      return NextResponse.json({ error: 'Se requiere el ID del usuario' }, { status: 400 });
    }

    if (idToDelete === currentUser.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador activa' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: idToDelete } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Clean up related records in transaction
    await db.$transaction(async (tx) => {
      // Delete theme settings
      await tx.themeSettings.deleteMany({ where: { userId: idToDelete } });
      // Delete invitations created by this user
      await tx.invitation.deleteMany({ where: { createdBy: idToDelete } });
      // Delete invitation usages by this user
      await tx.invitationUsage.deleteMany({ where: { userId: idToDelete } });
      // Delete activity events
      await tx.activityEvent.deleteMany({ where: { userId: idToDelete } });
      // Delete birth profiles created by this user
      await tx.birthProfile.deleteMany({ where: { createdBy: idToDelete } });
      // Delete the user
      await tx.user.delete({ where: { id: idToDelete } });
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${targetUser.name} eliminado exitosamente`,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
