import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

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
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

    const body = await request.json();
    const {
      themeType, primaryColor, secondaryColor, accentColor,
      backgroundType, backgroundColor, backgroundImage, gradientColors,
      cardOpacity, borderRadius, shadowIntensity, textSize, infoDensity,
    } = body;

    const themeFields = {
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
    };

    const theme = await db.themeSettings.upsert({
      where: { userId: payload.userId },
      update: themeFields,
      create: { userId: payload.userId, ...themeFields },
    });

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Theme PUT error:', error);
    return NextResponse.json({ error: 'Error al guardar el tema' }, { status: 500 });
  }
}