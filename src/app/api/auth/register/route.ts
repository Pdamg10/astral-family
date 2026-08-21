import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success, reset } = checkRateLimit(`register:${ip}`, 5, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: `Demasiados intentos de registro. Por favor espera ${reset} segundos.` },
        { status: 429 }
      );
    }

    const { name, email, password, invitationCode, birthDate, birthTime, city, country, timezone, latitude, longitude } = await request.json();

    if (!name || !email || !password || !invitationCode) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const cleanCode = invitationCode.trim().toUpperCase();

    const invitation = await db.invitation.findUnique({
      where: { code: cleanCode },
    });

    if (!invitation || !invitation.isActive) {
      return NextResponse.json(
        { error: 'El código de invitación ingresado es inválido o ya no se encuentra activo.' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (invitation.expiresAt && invitation.expiresAt < now) {
      // Mark as inactive since it has expired
      await db.invitation.update({
        where: { id: invitation.id },
        data: { isActive: false },
      });
      return NextResponse.json(
        { error: 'El código de invitación ha expirado y ya no es válido para registrar nuevas cuentas.' },
        { status: 400 }
      );
    }

    if (invitation.currentUses >= invitation.maxUses) {
      // Mark as inactive since max uses reached
      await db.invitation.update({
        where: { id: invitation.id },
        data: { isActive: false },
      });
      return NextResponse.json(
        { error: 'Este código de invitación ya ha sido utilizado el número máximo de veces permitido.' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este correo electrónico.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    
    // Register user and log invitation usage in atomic transaction
    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
          role: 'member',
          birthDate: birthDate ? String(birthDate).trim() : null,
          birthTime: birthTime ? String(birthTime).trim() : null,
          city: city ? String(city).trim() : null,
          country: country ? String(country).trim() : null,
          timezone: timezone ? String(timezone).trim() : null,
        },
      });

      // Record invitation usage audit log
      await tx.invitationUsage.create({
        data: {
          invitationId: invitation.id,
          userId: newUser.id,
          usedAt: new Date(),
        },
      });

      // Update invitation uses count
      const nextUses = invitation.currentUses + 1;
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          currentUses: nextUses,
          isActive: nextUses < invitation.maxUses,
        },
      });

      const themeSettings = await tx.themeSettings.create({
        data: { userId: newUser.id },
      });

      return { user: newUser, themeSettings };
    });

    // If birth info was supplied, calculate birth chart
    if (birthDate) {
      try {
        const { syncUserAndBirthProfile } = await import('@/services/astrology/profileSync');
        await syncUserAndBirthProfile({
          userId: result.user.id,
          name: result.user.name,
          birthDate,
          birthTime,
          city,
          country,
          timezone,
          latitude,
          longitude,
        });
      } catch (chartErr) {
        console.error('Error creating birth profile on register:', chartErr);
      }
    }

    const token = await createToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        themeSettings: result.themeSettings,
      },
      theme: result.themeSettings,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'No fue posible crear la cuenta. Verifica la información e inténtalo nuevamente.' },
      { status: 500 }
    );
  }
}
