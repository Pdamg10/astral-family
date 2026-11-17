import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { findCityLocation } from '@/lib/cities';
import { calculateFullChart } from '@/services/astrology/chart';
import { replaceProfileChartData } from '@/services/astrology/profileSync';
import { isValidRelationship, validateRelationshipAges } from '@/lib/genealogy';
import { applyRelationship } from '@/services/familyLinks';

const profileInclude = {
  planetaryPositions: true,
  houses: true,
  aspects: true,
  chartPoints: true,
  parent: { select: { id: true, name: true, birthDate: true } },
  parent2: { select: { id: true, name: true, birthDate: true } },
  partner: { select: { id: true, name: true, birthDate: true } },
  partnerOf: { select: { id: true, name: true, birthDate: true } },
  partnerLinksA: { include: { profileB: { select: { id: true, name: true, birthDate: true } } } },
  partnerLinksB: { include: { profileA: { select: { id: true, name: true, birthDate: true } } } },
  familyLinksFrom: { include: { toProfile: { select: { id: true, name: true, birthDate: true } } } },
  familyLinksTo: { include: { fromProfile: { select: { id: true, name: true, birthDate: true } } } },
  sibling: { select: { id: true, name: true, birthDate: true } },
  siblingOf: { select: { id: true, name: true, birthDate: true } },
  children1: { select: { id: true, name: true, birthDate: true } },
  children2: { select: { id: true, name: true, birthDate: true } },
  creator: { select: { id: true, name: true } },
};

function formatAllProfiles(rawProfiles: any[]) {
  // Build undirected sibling adjacency graph (direct sibling links + shared parents)
  // so sibling groups are transitive (e.g. if A-B and B-C are siblings, A-C are siblings too)
  const rawById = new Map(rawProfiles.map((p) => [p.id, p]));
  const siblingAdj = new Map<string, Set<string>>();
  const ensureNode = (id: string) => {
    if (!siblingAdj.has(id)) siblingAdj.set(id, new Set());
    return siblingAdj.get(id)!;
  };
  const connectSiblings = (a: string, b: string) => {
    if (!a || !b || a === b) return;
    ensureNode(a).add(b);
    ensureNode(b).add(a);
  };

  for (const p of rawProfiles) {
    ensureNode(p.id);
    if (p.sibling?.id) connectSiblings(p.id, p.sibling.id);
    for (const s of p.siblingOf || []) connectSiblings(p.id, s.id);
    if (p.parentId || p.parent2Id) {
      const myParents = [p.parentId, p.parent2Id].filter(Boolean);
      for (const other of rawProfiles) {
        if (other.id !== p.id && (other.parentId || other.parent2Id)) {
          const otherParents = [other.parentId, other.parent2Id].filter(Boolean);
          if (myParents.some(parentId => otherParents.includes(parentId))) {
            connectSiblings(p.id, other.id);
          }
        }
      }
    }
  }

  // BFS per node to collect full sibling component
  const getTransitiveSiblings = (startId: string) => {
    const visited = new Set<string>([startId]);
    const queue = [startId];
    const result: { id: string; name: string; birthDate?: string }[] = [];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const nextId of siblingAdj.get(curr) || []) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push(nextId);
          const prof = rawById.get(nextId);
          if (prof) {
            result.push({ id: prof.id, name: prof.name, birthDate: prof.birthDate });
          }
        }
      }
    }
    return result;
  };

  // Pass 1: compute direct relationships (including ALL partners) for each profile
  const baseList = rawProfiles.map((p) => {
    const childrenMap = new Map();
    (p.children1 || []).forEach((c: any) => childrenMap.set(c.id, c));
    (p.children2 || []).forEach((c: any) => childrenMap.set(c.id, c));

    // Merge ALL partners (legacy partner/partnerOf + many-to-many PartnerLink)
    const partnersMap = new Map<string, { id: string; name: string; birthDate?: string }>();
    const addPartner = (ref?: { id: string; name: string; birthDate?: string } | null) => {
      if (ref && ref.id !== p.id) {
        partnersMap.set(ref.id, { id: ref.id, name: ref.name, birthDate: ref.birthDate });
      }
    };
    addPartner(p.partner);
    (p.partnerOf || []).forEach((other: any) => addPartner(other));
    (p.partnerLinksA || []).forEach((link: any) => addPartner(link.profileB));
    (p.partnerLinksB || []).forEach((link: any) => addPartner(link.profileA));

    const partners = Array.from(partnersMap.values());
    const effectivePartner = partners[0] || null;
    const siblings = getTransitiveSiblings(p.id);

    return {
      ...p,
      partner: effectivePartner,
      partners,
      children: Array.from(childrenMap.values()),
      siblings,
    };
  });

  const profileMap = new Map(baseList.map((p) => [p.id, p]));

  // Pass 2: compute full kinship network for each profile (propagating across ALL partners)
  return baseList.map((p) => {
    const inLawsMap = new Map();
    const unclesAuntsMap = new Map();
    const niecesNephewsMap = new Map();
    const grandparentsMap = new Map();
    const grandchildrenMap = new Map();
    const cousinsMap = new Map();
    const parentsInLawMap = new Map();
    const childrenInLawMap = new Map();

    const myPartnerIds = new Set((p.partners || []).map((pr: any) => pr.id));

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

    // 2. Grandchildren (Nietos) & Children-in-law (Yernos/Nueras - ALL partners of children)
    p.children.forEach((chRef: any) => {
      const chProf = profileMap.get(chRef.id);
      if (chProf?.children) {
        chProf.children.forEach((gch: any) => {
          grandchildrenMap.set(gch.id, { id: gch.id, name: gch.name, birthDate: gch.birthDate });
        });
      }
      (chProf?.partners || []).forEach((chPartner: any) => {
        if (chPartner.id !== p.id) {
          childrenInLawMap.set(chPartner.id, { id: chPartner.id, name: chPartner.name, birthDate: chPartner.birthDate });
        }
      });
    });

    // 3. Uncles and Aunts (Tíos / Tías - including ALL partners of parent's siblings) & Cousins (Primos)
    parentProfiles.forEach((par) => {
      if (par.siblings) {
        par.siblings.forEach((uncleRef: any) => {
          if (uncleRef.id !== p.id) {
            unclesAuntsMap.set(uncleRef.id, { id: uncleRef.id, name: uncleRef.name, birthDate: uncleRef.birthDate });

            const uncleProf = profileMap.get(uncleRef.id);
            (uncleProf?.partners || []).forEach((unclePartner: any) => {
              if (unclePartner.id !== p.id) {
                unclesAuntsMap.set(unclePartner.id, { id: unclePartner.id, name: unclePartner.name, birthDate: unclePartner.birthDate });
              }
            });

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

    // 4. Nieces/Nephews & In-Laws via ALL partners of EVERY sibling
    p.siblings.forEach((sibRef: any) => {
      const sibProf = profileMap.get(sibRef.id);
      if (sibProf?.children) {
        sibProf.children.forEach((nieceRef: any) => {
          niecesNephewsMap.set(nieceRef.id, { id: nieceRef.id, name: nieceRef.name, birthDate: nieceRef.birthDate });
        });
      }
      (sibProf?.partners || []).forEach((sibPartner: any) => {
        if (sibPartner.id !== p.id && !myPartnerIds.has(sibPartner.id)) {
          inLawsMap.set(sibPartner.id, { id: sibPartner.id, name: sibPartner.name, birthDate: sibPartner.birthDate });
        }
      });
    });

    // 5. Relatives via ALL of my own partners (1, 2, or more!)
    (p.partners || []).forEach((partRef: any) => {
      const partProf = profileMap.get(partRef.id);
      if (!partProf) return;

      if (partProf.siblings) {
        partProf.siblings.forEach((sibRef: any) => {
          if (sibRef.id !== p.id && !myPartnerIds.has(sibRef.id)) {
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
        if (s1 && s1.id !== p.id) parentsInLawMap.set(s1.id, { id: s1.id, name: s1.name, birthDate: s1.birthDate });
      }
      if (partProf.parent2Id) {
        const s2 = profileMap.get(partProf.parent2Id);
        if (s2 && s2.id !== p.id) parentsInLawMap.set(s2.id, { id: s2.id, name: s2.name, birthDate: s2.birthDate });
      }
    });

    // 6. Merge direct extended FamilyLink records (grandparent/grandchild, uncle/niece, cousin, suegro/yerno, cuñado)
    const directFamilyLinks: { relationship: string; targetId: string; targetName: string }[] = [];
    const addToMap = (map: Map<any, any>, ref?: { id: string; name: string; birthDate?: string } | null) => {
      if (ref && ref.id !== p.id) {
        map.set(ref.id, { id: ref.id, name: ref.name, birthDate: ref.birthDate });
      }
    };

    for (const link of p.familyLinksFrom || []) {
      const target = link.toProfile;
      if (!target || target.id === p.id) continue;
      if (link.relationship === 'grandparent') {
        addToMap(grandchildrenMap, target);
        directFamilyLinks.push({ relationship: 'grandparent', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'uncle_aunt') {
        addToMap(niecesNephewsMap, target);
        directFamilyLinks.push({ relationship: 'uncle_aunt', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'parent_in_law') {
        addToMap(childrenInLawMap, target);
        directFamilyLinks.push({ relationship: 'parent_in_law', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'cousin') {
        addToMap(cousinsMap, target);
        directFamilyLinks.push({ relationship: 'cousin', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'in_law') {
        addToMap(inLawsMap, target);
        directFamilyLinks.push({ relationship: 'in_law', targetId: target.id, targetName: target.name });
      }
    }

    for (const link of p.familyLinksTo || []) {
      const target = link.fromProfile;
      if (!target || target.id === p.id) continue;
      const targetFull = profileMap.get(target.id);
      if (link.relationship === 'grandparent') {
        addToMap(grandparentsMap, target);
        // Also propagate grandparent's partner(s) as grandparents
        (targetFull?.partners || []).forEach((gpPartner: any) => addToMap(grandparentsMap, gpPartner));
        directFamilyLinks.push({ relationship: 'grandchild', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'uncle_aunt') {
        addToMap(unclesAuntsMap, target);
        (targetFull?.partners || []).forEach((uPartner: any) => addToMap(unclesAuntsMap, uPartner));
        directFamilyLinks.push({ relationship: 'niece_nephew', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'parent_in_law') {
        addToMap(parentsInLawMap, target);
        directFamilyLinks.push({ relationship: 'child_in_law', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'cousin') {
        addToMap(cousinsMap, target);
        directFamilyLinks.push({ relationship: 'cousin', targetId: target.id, targetName: target.name });
      } else if (link.relationship === 'in_law') {
        addToMap(inLawsMap, target);
        directFamilyLinks.push({ relationship: 'in_law', targetId: target.id, targetName: target.name });
      }
    }

    return {
      ...p,
      directFamilyLinks,
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
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

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
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

    const body = await request.json();
    const {
      name, birthDate, birthTime, timeUnknown, city, country, latitude, longitude, timezone,
      parentId, parent2Id, partnerId, siblingId, linkTargetId, linkRelationship,
    } = body;

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

    // Validate generational ages when linking directly during creation
    const newPersonRef = { name: name.trim(), birthDate };
    if (linkTargetId && isValidRelationship(linkRelationship)) {
      const targetProf = await db.birthProfile.findUnique({ where: { id: linkTargetId } });
      if (targetProf) {
        const ageCheck = validateRelationshipAges(newPersonRef, linkRelationship, targetProf);
        if (!ageCheck.valid) {
          return NextResponse.json(
            {
              error: ageCheck.error,
              suggestedRelationship: ageCheck.suggestedRelationship,
              suggestedLabel: ageCheck.suggestedLabel,
            },
            { status: 400 }
          );
        }
      }
    }
    for (const pId of [parentId, parent2Id].filter(Boolean)) {
      const parentProf = await db.birthProfile.findUnique({ where: { id: pId } });
      if (parentProf) {
        const ageCheck = validateRelationshipAges(newPersonRef, 'child', parentProf);
        if (!ageCheck.valid) {
          return NextResponse.json(
            {
              error: ageCheck.error,
              suggestedRelationship: ageCheck.suggestedRelationship,
              suggestedLabel: ageCheck.suggestedLabel,
            },
            { status: 400 }
          );
        }
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
      if (linkTargetId && isValidRelationship(linkRelationship)) {
        await applyRelationship(tx, profile.id, linkRelationship, linkTargetId);
      } else if (partnerId) {
        const [pA, pB] = [profile.id, partnerId].sort();
        await tx.partnerLink.upsert({
          where: { profileAId_profileBId: { profileAId: pA, profileBId: pB } },
          create: { profileAId: pA, profileBId: pB },
          update: {},
        });
      }
      await replaceProfileChartData(tx, profile.id, chartData, false);
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
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

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

      await replaceProfileChartData(tx, id, chartData, true);

      // Sync User record only if this profile matches the creator's own name (avoid overwriting admin user when editing relatives)
      if (existing.createdBy) {
        await tx.user.updateMany({
          where: {
            id: existing.createdBy,
            name: existing.name,
          },
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
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

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