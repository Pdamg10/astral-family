import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const theme = await db.themeSettings.findUnique({ where: { userId: payload.userId } });
    if (!theme) {
      const newTheme = await db.themeSettings.create({ data: { userId: payload.userId } });
      return NextResponse.json({ theme: newTheme });
    }
    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Theme GET error:', error);
    return NextResponse.json({ error: 'Error al obtener tema' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const body = await request.json();
    const {
      themeType, primaryColor, secondaryColor, accentColor,
      backgroundType, backgroundColor, backgroundImage, gradientColors,
      cardOpacity, borderRadius, shadowIntensity, textSize, infoDensity,
    } = body;

    const theme = await db.themeSettings.upsert({
      where: { userId: payload.userId },
      update: {
        ...(themeType !== undefined && { themeType }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(backgroundType !== undefined && { backgroundType }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(backgroundImage !== undefined && { backgroundImage }),
        ...(gradientColors !== undefined && {
          gradientColors: typeof gradientColors === 'string' ? gradientColors : JSON.stringify(gradientColors),
        }),
        ...(cardOpacity !== undefined && { cardOpacity }),
        ...(borderRadius !== undefined && { borderRadius }),
        ...(shadowIntensity !== undefined && { shadowIntensity }),
        ...(textSize !== undefined && { textSize }),
        ...(infoDensity !== undefined && { infoDensity }),
      },
      create: {
        userId: payload.userId,
        ...(themeType !== undefined && { themeType }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(backgroundType !== undefined && { backgroundType }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(backgroundImage !== undefined && { backgroundImage }),
        ...(gradientColors !== undefined && {
          gradientColors: typeof gradientColors === 'string' ? gradientColors : JSON.stringify(gradientColors),
        }),
        ...(cardOpacity !== undefined && { cardOpacity }),
        ...(borderRadius !== undefined && { borderRadius }),
        ...(shadowIntensity !== undefined && { shadowIntensity }),
        ...(textSize !== undefined && { textSize }),
        ...(infoDensity !== undefined && { infoDensity }),
      },
    });

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Theme PUT error:', error);
    return NextResponse.json({ error: 'Error al guardar el tema' }, { status: 500 });
  }
}