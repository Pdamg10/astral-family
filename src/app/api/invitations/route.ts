import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ASTRAL-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/invitations - List all invitations with usage audit log (Admin Only)
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo el administrador tiene acceso a la gestión de invitaciones' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Auto-update expired invitations that were active
    await db.invitation.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: now },
      },
      data: { isActive: false },
    });

    const invitations = await db.invitation.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        usages: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { usedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Invitations GET error:', error);
    return NextResponse.json({ error: 'Error al obtener invitaciones' }, { status: 500 });
  }
}

// POST /api/invitations - Create a new invitation with expiration (Admin Only)
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo el administrador puede generar códigos de invitación' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { maxUses = 1, expirationPreset = '24h', customExpiresAt } = body;

    const now = new Date();
    let calculatedExpiresAt: Date | null = null;

    if (expirationPreset === '1h') {
      calculatedExpiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    } else if (expirationPreset === '6h') {
      calculatedExpiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    } else if (expirationPreset === '24h' || expirationPreset === '1d') {
      calculatedExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (expirationPreset === '3d') {
      calculatedExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    } else if (expirationPreset === '7d') {
      calculatedExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (expirationPreset === '30d') {
      calculatedExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (expirationPreset === 'custom' && customExpiresAt) {
      calculatedExpiresAt = new Date(customExpiresAt);
    } else if (expirationPreset === 'never') {
      calculatedExpiresAt = null;
    } else {
      // Default 24 hours
      calculatedExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    let code = generateCode();
    while (await db.invitation.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const invitation = await db.invitation.create({
      data: {
        code,
        createdBy: payload.userId,
        maxUses: Number(maxUses) > 0 ? Number(maxUses) : 1,
        expiresAt: calculatedExpiresAt,
        isActive: true,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        usages: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Invitations POST error:', error);
    return NextResponse.json(
      { error: 'No fue posible generar la invitación' },
      { status: 500 }
    );
  }
}

// PATCH /api/invitations - Revoke/Toggle an invitation code (Admin Only)
export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { id, isActive } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID de invitación requerido' }, { status: 400 });

    const updated = await db.invitation.update({
      where: { id },
      data: { isActive: !!isActive },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        usages: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    return NextResponse.json({ invitation: updated });
  } catch (error) {
    console.error('Invitations PATCH error:', error);
    return NextResponse.json({ error: 'Error al actualizar invitación' }, { status: 500 });
  }
}

// DELETE /api/invitations - Remove invitation (Admin Only)
export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await db.invitation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invitations DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar invitación' }, { status: 500 });
  }
}
