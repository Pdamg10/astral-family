import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, invitationCode } = await request.json();

    if (!name || !email || !password || !invitationCode) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const invitation = await db.invitation.findUnique({
      where: { code: invitationCode.toUpperCase() },
    });

    if (!invitation || !invitation.isActive) {
      return NextResponse.json(
        { error: 'Código de invitación inválido o inactivo' },
        { status: 400 }
      );
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'La invitación ha expirado' },
        { status: 400 }
      );
    }

    if (invitation.currentUses >= invitation.maxUses) {
      return NextResponse.json(
        { error: 'La invitación ya ha sido utilizada el máximo de veces' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este correo' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'member',
      },
    });

    await db.invitation.update({
      where: { id: invitation.id },
      data: { currentUses: { increment: 1 } },
    });

    await db.themeSettings.create({
      data: { userId: user.id },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
