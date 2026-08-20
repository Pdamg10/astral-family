import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const profiles = await db.birthProfile.findMany({
      include: {
        planetaryPositions: true,
        houses: true,
        aspects: true,
        chartPoints: true,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Profiles GET error:', error);
    return NextResponse.json({ error: 'Error al obtener perfiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const body = await request.json();
    const { name, birthDate, birthTime, timeUnknown, city, country, latitude, longitude, timezone } = body;

    if (!name || !birthDate || !city || !country || latitude == null || longitude == null || !timezone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validate date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return NextResponse.json({ error: 'Fecha de nacimiento inválida' }, { status: 400 });
    }

    // Validate time if provided
    if (!timeUnknown && birthTime) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(birthTime)) {
        return NextResponse.json({ error: 'Hora de nacimiento inválida' }, { status: 400 });
      }
      const [h, m] = birthTime.split(':').map(Number);
      if (h < 0 || h > 23 || m < 0 || m > 59) {
        return NextResponse.json({ error: 'Hora de nacimiento fuera de rango' }, { status: 400 });
      }
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Coordenadas geográficas inválidas' }, { status: 400 });
    }

    const profile = await db.birthProfile.create({
      data: {
        name,
        birthDate,
        birthTime: timeUnknown ? null : birthTime || null,
        timeUnknown: timeUnknown || false,
        city,
        country,
        latitude,
        longitude,
        timezone,
        createdBy: payload.userId,
      },
      include: {
        planetaryPositions: true,
        houses: true,
        aspects: true,
        chartPoints: true,
        creator: { select: { id: true, name: true } },
      },
    });

    // Calculate chart if time is known
    if (!timeUnknown && birthTime) {
      try {
        const { calculateFullChart } = await import('@/services/astrology/chart');
        const chartData = await calculateFullChart({
          birthDate,
          birthTime,
          timeUnknown: false,
          latitude,
          longitude,
          timezone,
        });

        // Save planetary positions
        for (const pos of chartData.planetaryPositions) {
          await db.planetaryPosition.create({
            data: {
              birthProfileId: profile.id,
              body: pos.body,
              sign: pos.sign,
              degree: pos.degree,
              minute: pos.minute,
              retrograde: pos.retrograde,
              house: pos.house || null,
            },
          });
        }

        // Save houses
        for (const house of chartData.houses) {
          await db.house.create({
            data: {
              birthProfileId: profile.id,
              houseNumber: house.houseNumber,
              sign: house.sign,
              degree: house.degree,
              minute: house.minute,
            },
          });
        }

        // Save aspects
        for (const aspect of chartData.aspects) {
          await db.aspect.create({
            data: {
              birthProfileId: profile.id,
              body1: aspect.body1,
              body2: aspect.body2,
              type: aspect.type,
              angle: aspect.angle,
              orb: aspect.orb,
              degree1: aspect.degree1,
              degree2: aspect.degree2,
            },
          });
        }

        // Save chart points
        for (const cp of chartData.chartPoints) {
          await db.chartPoint.create({
            data: {
              birthProfileId: profile.id,
              point: cp.point,
              sign: cp.sign,
              degree: cp.degree,
              minute: cp.minute,
              house: cp.house || null,
            },
          });
        }

        await db.birthProfile.update({
          where: { id: profile.id },
          data: { isCalculated: true },
        });

        // Reload with all data
        const updatedProfile = await db.birthProfile.findUnique({
          where: { id: profile.id },
          include: {
            planetaryPositions: true,
            houses: true,
            aspects: true,
            chartPoints: true,
            creator: { select: { id: true, name: true } },
          },
        });

        return NextResponse.json({ profile: updatedProfile }, { status: 201 });
      } catch (calcError) {
        console.error('Chart calculation error:', calcError);
        return NextResponse.json({ profile, warning: 'La carta astral no pudo ser calculada' }, { status: 201 });
      }
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Profiles POST error:', error);
    return NextResponse.json(
      { error: 'No fue posible guardar los datos. Verifica la información e inténtalo nuevamente.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const profile = await db.birthProfile.findUnique({ where: { id } });
    if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

    if (payload.role !== 'admin' && profile.createdBy !== payload.userId) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    await db.birthProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profiles DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar el perfil' }, { status: 500 });
  }
}