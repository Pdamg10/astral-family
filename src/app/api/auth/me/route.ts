import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: { themeSettings: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        city: user.city,
        country: user.country,
        timezone: user.timezone,
        themeSettings: user.themeSettings,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del usuario' },
      { status: 500 }
    );
  }
}