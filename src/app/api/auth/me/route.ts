import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

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