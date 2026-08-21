import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success, reset } = checkRateLimit(`login:${ip}`, 5, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: `Demasiados intentos. Por favor espera ${reset} segundos.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedEmail === 'admin@astral.family' ? [{ email: 'phamela@astral.family' }, { role: 'admin' }] : [])
        ]
      },
      include: { themeSettings: true },
    });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        themeSettings: user.themeSettings,
      },
      theme: user.themeSettings,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'No fue posible iniciar sesión. Inténtalo nuevamente.' },
      { status: 500 }
    );
  }
}
