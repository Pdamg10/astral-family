import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';
import { findCityLocation } from '@/lib/cities';

const profileInclude = {
  planetaryPositions: true,
  houses: true,
  aspects: true,
  chartPoints: true,
  parent: { select: { id: true, name: true, birthDate: true } },
  parent2: { select: { id: true, name: true, birthDate: true } },
  partner: { select: { id: true, name: true, birthDate: true } },
  partnerOf: { select: { id: true, name: true, birthDate: true } },
  sibling: { select: { id: true, name: true, birthDate: true } },
  siblingOf: { select: { id: true, name: true, birthDate: true } },
  children1: { select: { id: true, name: true, birthDate: true } },
  children2: { select: { id: true, name: true, birthDate: true } },
  creator: { select: { id: true, name: true } },
};

function formatAllProfiles(rawProfiles: any[]) {
  // Pass 1: compute direct relationships for each profile
  const baseList = rawProfiles.map((p) => {
    const childrenMap = new Map();
    (p.children1 || []).forEach((c: any) => childrenMap.set(c.id, c));
    (p.children2 || []).forEach((c: any) => childrenMap.set(c.id, c));
    const effectivePartner = p.partner || (p.partnerOf && p.partnerOf[0]) || null;

    // Siblings map
    const siblingsMap = new Map();
    if (p.sibling) siblingsMap.set(p.sibling.id, p.sibling);
    (p.siblingOf || []).forEach((s: any) => siblingsMap.set(s.id, s));

    if (p.parentId || p.parent2Id) {
      const myParents = [p.parentId, p.parent2Id].filter(Boolean);
      rawProfiles.forEach((other) => {
        if (other.id !== p.id && (other.parentId || other.parent2Id)) {
          const otherParents = [other.parentId, other.parent2Id].filter(Boolean);
          const sharesParent = myParents.some(parentId => otherParents.includes(parentId));
          if (sharesParent) {
            siblingsMap.set(other.id, { id: other.id, name: other.name, birthDate: other.birthDate });
          }
        }
      });
    }

    return {
      ...p,
      partner: effectivePartner,
      children: Array.from(childrenMap.values()),
      siblings: Array.from(siblingsMap.values()),
    };
  });

  const profileMap = new Map(baseList.map((p) => [p.id, p]));

  // Pass 2: compute full kinship network for each profile
  return baseList.map((p) => {
    const inLawsMap = new Map();
    const unclesAuntsMap = new Map();
    const niecesNephewsMap = new Map();
    const grandparentsMap = new Map();
    const grandchildrenMap = new Map();
    const cousinsMap = new Map();
    const parentsInLawMap = new Map();
    const childrenInLawMap = new Map();

    const parentProfiles: any[] = [];
    if (p.parentId) {
      const p1 = profileMap.get(p.parentId);
      if (p1) parentProfiles.push(p1);
    }
    if (p.parent2Id) {
      const p2 = profileMap.get(p.parent2Id);
      if (p2) parentProfiles.push(p2);
    }

    // 1. Grandparents (Abuelos)
    parentProfiles.forEach((par) => {
      if (par.parentId) {
        const gp1 = profileMap.get(par.parentId);
        if (gp1) grandparentsMap.set(gp1.id, { id: gp1.id, name: gp1.name, birthDate: gp1.birthDate });
      }
      if (par.parent2Id) {
        const gp2 = profileMap.get(par.parent2Id);
        if (gp2) grandparentsMap.set(gp2.id, { id: gp2.id, name: gp2.name, birthDate: gp2.birthDate });
      }
    });

    // 2. Grandchildren (Nietos) & Children-in-law (Yernos/Nueras)
    p.children.forEach((chRef: any) => {
      const chProf = profileMap.get(chRef.id);
      if (chProf?.children) {
        chProf.children.forEach((gch: any) => {
          grandchildrenMap.set(gch.id, { id: gch.id, name: gch.name, birthDate: gch.birthDate });
        });
      }
      if (chProf?.partner) {
        childrenInLawMap.set(chProf.partner.id, { id: chProf.partner.id, name: chProf.partner.name, birthDate: chProf.partner.birthDate });
      }
    });

    // 3. Uncles and Aunts (Tíos / Tías) & Cousins (Primos)
    parentProfiles.forEach((par) => {
      if (par.siblings) {
        par.siblings.forEach((uncleRef: any) => {
          if (uncleRef.id !== p.id) {
            unclesAuntsMap.set(uncleRef.id, { id: uncleRef.id, name: uncleRef.name, birthDate: uncleRef.birthDate });

            const uncleProf = profileMap.get(uncleRef.id);
            if (uncleProf?.partner && uncleProf.partner.id !== p.id) {
              unclesAuntsMap.set(uncleProf.partner.id, { id: uncleProf.partner.id, name: uncleProf.partner.name, birthDate: uncleProf.partner.birthDate });
            }

            if (uncleProf?.children) {
              uncleProf.children.forEach((cousinRef: any) => {
                if (cousinRef.id !== p.id && !p.siblings.some((s: any) => s.id === cousinRef.id)) {
                  cousinsMap.set(cousinRef.id, { id: cousinRef.id, name: cousinRef.name, birthDate: cousinRef.birthDate });
                }
              });
            }
          }
        });
      }
    });

    // 4. Nieces and Nephews (Sobrinos / Sobrinas)
    p.siblings.forEach((sibRef: any) => {
      const sibProf = profileMap.get(sibRef.id);
      if (sibProf?.children) {
        sibProf.children.forEach((nieceRef: any) => {
          niecesNephewsMap.set(nieceRef.id, { id: nieceRef.id, name: nieceRef.name, birthDate: nieceRef.birthDate });
        });
      }
      if (sibProf?.partner && sibProf.partner.id !== p.id) {
        inLawsMap.set(sibProf.partner.id, { id: sibProf.partner.id, name: sibProf.partner.name, birthDate: sibProf.partner.birthDate });
      }
    });

    // If I have a partner:
    if (p.partner?.id) {
      const partProf = profileMap.get(p.partner.id);
      if (partProf) {
        if (partProf.siblings) {
          partProf.siblings.forEach((sibRef: any) => {
            if (sibRef.id !== p.id) {
              inLawsMap.set(sibRef.id, { id: sibRef.id, name: sibRef.name, birthDate: sibRef.birthDate });

              const partSibProf = profileMap.get(sibRef.id);
              if (partSibProf?.children) {
                partSibProf.children.forEach((nieceRef: any) => {
                  niecesNephewsMap.set(nieceRef.id, { id: nieceRef.id, name: nieceRef.name, birthDate: nieceRef.birthDate });
                });
              }
            }
          });
        }

        if (partProf.parentId) {
          const s1 = profileMap.get(partProf.parentId);
          if (s1) parentsInLawMap.set(s1.id, { id: s1.id, name: s1.name, birthDate: s1.birthDate });
        }
        if (partProf.parent2Id) {
          const s2 = profileMap.get(partProf.parent2Id);
          if (s2) parentsInLawMap.set(s2.id, { id: s2.id, name: s2.name, birthDate: s2.birthDate });
        }
      }
    }

    return {
      ...p,
      inLaws: Array.from(inLawsMap.values()),
      unclesAunts: Array.from(unclesAuntsMap.values()),
      niecesNephews: Array.from(niecesNephewsMap.values()),
      grandparents: Array.from(grandparentsMap.values()),
      grandchildren: Array.from(grandchildrenMap.values()),
      cousins: Array.from(cousinsMap.values()),
      parentsInLaw: Array.from(parentsInLawMap.values()),
      childrenInLaw: Array.from(childrenInLawMap.values()),
    };
  });
}

function formatProfile(p: any, rawProfiles: any[] = []) {
  if (!p) return null;
  const allFormatted = formatAllProfiles(rawProfiles.length > 0 ? rawProfiles : [p]);
  return allFormatted.find((x) => x.id === p.id) || allFormatted[0] || p;
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const rawProfiles = await db.birthProfile.findMany({
      include: profileInclude,
      orderBy: { createdAt: 'desc' },
    });

    const profiles = formatAllProfiles(rawProfiles);

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
    const { name, birthDate, birthTime, timeUnknown, city, country, latitude, longitude, timezone, parentId, parent2Id, partnerId, siblingId } = body;

    if (!name || !birthDate) {
      return NextResponse.json(
        { error: 'El nombre y la fecha de nacimiento son requeridos' },
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

    // Resolve geographic location
    const location = findCityLocation(city, country, latitude, longitude, timezone);

    // If siblingId is provided and parents not set, inherit parents from sibling if available
    let effectiveParentId = parentId || null;
    let effectiveParent2Id = parent2Id || null;
    if (siblingId && !effectiveParentId && !effectiveParent2Id) {
      const siblingProf = await db.birthProfile.findUnique({
        where: { id: siblingId },
        select: { parentId: true, parent2Id: true },
      });
      if (siblingProf) {
        effectiveParentId = siblingProf.parentId || null;
        effectiveParent2Id = siblingProf.parent2Id || null;
      }
    }

    const profile = await db.birthProfile.create({
      data: {
        name: name.trim(),
        birthDate,
        birthTime: timeUnknown ? null : birthTime || '12:00',
        timeUnknown: timeUnknown || false,
        city: location.city,
        country: location.country,
        latitude: location.lat,
        longitude: location.lng,
        timezone: location.tz,
        createdBy: payload.userId,
        parentId: effectiveParentId,
        parent2Id: effectiveParent2Id,
        partnerId: partnerId || null,
        siblingId: siblingId || null,
      },
      include: profileInclude,
    });

    // Calculate chart
    const { calculateFullChart } = await import('@/services/astrology/chart');
    const chartData = await calculateFullChart({
      birthDate,
      birthTime: timeUnknown ? '12:00' : birthTime || '12:00',
      timeUnknown: !!timeUnknown,
      city: location.city,
      country: location.country,
      latitude: location.lat,
      longitude: location.lng,
      timezone: location.tz,
    });

    // Save all astrological data in atomic transaction
    await db.$transaction(async (tx) => {
      if (chartData.planetaryPositions?.length) {
        await tx.planetaryPosition.createMany({
          data: chartData.planetaryPositions.map((pos) => ({
            birthProfileId: profile.id,
            body: pos.body,
            sign: pos.sign,
            degree: pos.degree,
            minute: pos.minute,
            retrograde: pos.retrograde || false,
            house: pos.house || 1,
          })),
        });
      }

      if (chartData.houses?.length) {
        await tx.house.createMany({
          data: chartData.houses.map((house) => ({
            birthProfileId: profile.id,
            houseNumber: house.houseNumber,
            sign: house.sign,
            degree: house.degree,
            minute: house.minute,
          })),
        });
      }

      if (chartData.chartPoints?.length) {
        await tx.chartPoint.createMany({
          data: chartData.chartPoints.map((cp) => ({
            birthProfileId: profile.id,
            point: cp.point,
            sign: cp.sign,
            degree: cp.degree,
            minute: cp.minute,
            house: cp.house || 1,
          })),
        });
      }

      if (chartData.aspects?.length) {
        await tx.aspect.createMany({
          data: chartData.aspects.map((asp) => ({
            birthProfileId: profile.id,
            body1: asp.body1,
            body2: asp.body2,
            type: asp.type,
            angle: asp.angle,
            orb: asp.orb,
            degree1: asp.degree1,
            degree2: asp.degree2,
          })),
        });
      }

      await tx.birthProfile.update({
        where: { id: profile.id },
        data: { isCalculated: true },
      });
    });

    const rawFullProfile = await db.birthProfile.findUnique({
      where: { id: profile.id },
      include: profileInclude,
    });

    const fullProfile = formatProfile(rawFullProfile);

    return NextResponse.json({ profile: fullProfile, chartData }, { status: 201 });
  } catch (error) {
    console.error('Profiles POST error:', error);
    return NextResponse.json({ error: 'Error al crear perfil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const body = await request.json();
    const { id, name, birthDate, birthTime, timeUnknown, city, country, latitude, longitude, timezone, parentId, parent2Id, partnerId, siblingId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de perfil requerido' }, { status: 400 });
    }

    const existing = await db.birthProfile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    if (payload.role !== 'admin' && existing.createdBy !== payload.userId) {
      return NextResponse.json({ error: 'Sin permisos para editar este perfil' }, { status: 403 });
    }

    const updatedName = name ? String(name).trim() : existing.name;
    const updatedBirthDate = birthDate || existing.birthDate;
    const updatedBirthTime = timeUnknown ? null : (birthTime !== undefined ? birthTime : existing.birthTime);
    const updatedCity = city || existing.city;
    const updatedCountry = country || existing.country;
    let updatedParentId = parentId !== undefined ? (parentId || null) : existing.parentId;
    let updatedParent2Id = parent2Id !== undefined ? (parent2Id || null) : existing.parent2Id;
    const updatedPartnerId = partnerId !== undefined ? (partnerId || null) : existing.partnerId;
    const updatedSiblingId = siblingId !== undefined ? (siblingId || null) : existing.siblingId;

    // Sibling parent inheritance
    if (updatedSiblingId && !updatedParentId && !updatedParent2Id) {
      const siblingProf = await db.birthProfile.findUnique({
        where: { id: updatedSiblingId },
        select: { parentId: true, parent2Id: true },
      });
      if (siblingProf) {
        updatedParentId = siblingProf.parentId || null;
        updatedParent2Id = siblingProf.parent2Id || null;
      }
    }

    // Resolve geographic location
    const location = findCityLocation(
      updatedCity,
      updatedCountry,
      latitude != null ? Number(latitude) : (city && city !== existing.city ? null : existing.latitude),
      longitude != null ? Number(longitude) : (city && city !== existing.city ? null : existing.longitude),
      timezone || existing.timezone
    );

    const { calculateFullChart } = await import('@/services/astrology/chart');
    const chartData = await calculateFullChart({
      birthDate: updatedBirthDate,
      birthTime: updatedBirthTime || '12:00',
      timeUnknown: !!timeUnknown,
      city: location.city,
      country: location.country,
      latitude: location.lat,
      longitude: location.lng,
      timezone: location.tz,
    });

    await db.$transaction(async (tx) => {
      await tx.birthProfile.update({
        where: { id },
        data: {
          name: updatedName,
          birthDate: updatedBirthDate,
          birthTime: updatedBirthTime,
          timeUnknown: !!timeUnknown,
          city: location.city,
          country: location.country,
          latitude: location.lat,
          longitude: location.lng,
          timezone: location.tz,
          parentId: updatedParentId,
          parent2Id: updatedParent2Id,
          partnerId: updatedPartnerId,
          siblingId: updatedSiblingId,
          isCalculated: true,
        },
      });

      await tx.planetaryPosition.deleteMany({ where: { birthProfileId: id } });
      await tx.house.deleteMany({ where: { birthProfileId: id } });
      await tx.chartPoint.deleteMany({ where: { birthProfileId: id } });
      await tx.aspect.deleteMany({ where: { birthProfileId: id } });

      if (chartData.planetaryPositions?.length) {
        await tx.planetaryPosition.createMany({
          data: chartData.planetaryPositions.map((pos) => ({
            birthProfileId: id,
            body: pos.body,
            sign: pos.sign,
            degree: pos.degree,
            minute: pos.minute,
            retrograde: pos.retrograde || false,
            house: pos.house || 1,
          })),
        });
      }

      if (chartData.houses?.length) {
        await tx.house.createMany({
          data: chartData.houses.map((house) => ({
            birthProfileId: id,
            houseNumber: house.houseNumber,
            sign: house.sign,
            degree: house.degree,
            minute: house.minute,
          })),
        });
      }

      if (chartData.chartPoints?.length) {
        await tx.chartPoint.createMany({
          data: chartData.chartPoints.map((cp) => ({
            birthProfileId: id,
            point: cp.point,
            sign: cp.sign,
            degree: cp.degree,
            minute: cp.minute,
            house: cp.house || 1,
          })),
        });
      }

      if (chartData.aspects?.length) {
        await tx.aspect.createMany({
          data: chartData.aspects.map((asp) => ({
            birthProfileId: id,
            body1: asp.body1,
            body2: asp.body2,
            type: asp.type,
            angle: asp.angle,
            orb: asp.orb,
            degree1: asp.degree1,
            degree2: asp.degree2,
          })),
        });
      }

      // Sync matching User if one exists
      if (existing.createdBy) {
        await tx.user.updateMany({
          where: { id: existing.createdBy },
          data: {
            name: updatedName,
            birthDate: updatedBirthDate,
            birthTime: updatedBirthTime,
            city: location.city,
            country: location.country,
            timezone: location.tz,
          },
        });
      }
    });

    const rawUpdatedProfile = await db.birthProfile.findUnique({
      where: { id },
      include: profileInclude,
    });

    const updatedProfile = formatProfile(rawUpdatedProfile);

    return NextResponse.json({ profile: updatedProfile, chartData });
  } catch (error) {
    console.error('Profiles PUT error:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'ID de perfil requerido' }, { status: 400 });

    const existing = await db.birthProfile.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

    if (payload.role !== 'admin' && existing.createdBy !== payload.userId) {
      return NextResponse.json({ error: 'Sin permisos para eliminar este perfil' }, { status: 403 });
    }

    await db.$transaction([
      db.planetaryPosition.deleteMany({ where: { birthProfileId: id } }),
      db.house.deleteMany({ where: { birthProfileId: id } }),
      db.aspect.deleteMany({ where: { birthProfileId: id } }),
      db.chartPoint.deleteMany({ where: { birthProfileId: id } }),
      db.birthProfile.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profiles DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar perfil' }, { status: 500 });
  }
}