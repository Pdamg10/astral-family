import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import HoroscopeModule from 'circular-natal-horoscope-js';

const { Origin, Horoscope } = HoroscopeModule;
const prisma = new PrismaClient();

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function normalizeDegree(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function degreesToSign(degree) {
  const d = normalizeDegree(degree);
  const signIndex = Math.floor(d / 30) % 12;
  const rem = d - signIndex * 30;
  const totalSeconds = Math.round(rem * 3600);
  const degreeInSign = Math.floor(totalSeconds / 3600);
  const remSeconds = totalSeconds % 3600;
  const minute = Math.floor(remSeconds / 60);
  const second = remSeconds % 60;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degreeInSign,
    minute,
    second,
    formatted: `${degreeInSign}°${minute.toString().padStart(2, '0')}'`,
  };
}

function parseBirthDateTimeToUtc(birthDate, birthTime, timezone) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hours, minutes] = (birthTime || '12:00').split(':').map(Number);

  const offsetMatch = timezone.match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (offsetMatch) {
    const sign = offsetMatch[1] === '-' ? -1 : 1;
    const h = parseInt(offsetMatch[2], 10);
    const m = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0;
    const totalMinutes = sign * (h * 60 + m);
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0) - totalMinutes * 60000);
  }

  try {
    const tempUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(tempUtc);
    const partMap = {};
    for (const p of parts) {
      if (p.type !== 'literal') partMap[p.type] = parseInt(p.value, 10);
    }
    const asTzUtc = Date.UTC(
      partMap.year,
      partMap.month - 1,
      partMap.day,
      partMap.hour % 24,
      partMap.minute,
      partMap.second || 0
    );
    const offsetMs = asTzUtc - tempUtc.getTime();
    return new Date(tempUtc.getTime() - offsetMs);
  } catch {
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  }
}

function isDegreeInHouse(degree, cuspStart, cuspEnd) {
  const d = normalizeDegree(degree);
  const start = normalizeDegree(cuspStart);
  const end = normalizeDegree(cuspEnd);
  if (start < end) {
    return d >= start && d < end;
  } else {
    return d >= start || d < end;
  }
}

function getHouseForDegree(degree, houseCusps) {
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i];
    const end = houseCusps[(i + 1) % 12];
    if (isDegreeInHouse(degree, start, end)) {
      return i + 1;
    }
  }
  return 1;
}

function getAspectOrb(type) {
  const map = { conjunction: 10, opposition: 8, trine: 8, square: 8, sextile: 6, quincunx: 3 };
  return map[type] ?? 6;
}

function getAspectAngle(type) {
  const map = { conjunction: 0, opposition: 180, trine: 120, square: 90, sextile: 60, quincunx: 150 };
  return map[type] ?? 0;
}

function calculateAspects(positions) {
  const aspects = [];
  const aspectTypes = ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'];
  const bodies = positions.filter(p => !['DESC', 'IC', 'PartOfFortune'].includes(p.body));

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const d1 = normalizeDegree(bodies[i].absoluteDegree);
      const d2 = normalizeDegree(bodies[j].absoluteDegree);
      let diff = Math.abs(d1 - d2);
      if (diff > 180) diff = 360 - diff;

      for (const type of aspectTypes) {
        const angle = getAspectAngle(type);
        const maxOrb = getAspectOrb(type);
        const aspectDiff = Math.abs(diff - angle);

        if (aspectDiff <= maxOrb) {
          aspects.push({
            body1: bodies[i].body,
            body2: bodies[j].body,
            type,
            angle,
            orb: Math.round(aspectDiff * 100) / 100,
            degree1: Math.round(d1 * 100) / 100,
            degree2: Math.round(d2 * 100) / 100,
          });
          break;
        }
      }
    }
  }
  aspects.sort((a, b) => a.orb - b.orb);
  return aspects;
}

async function recalculate() {
  console.log('🔄 Iniciando Recálculo de Alta Precisión de todas las Cartas Astrales...');

  const profiles = await prisma.birthProfile.findMany();
  console.log(`Encontrados ${profiles.length} perfiles.`);

  for (const profile of profiles) {
    console.log(`\nCalculando carta de alta precisión para: ${profile.name} (${profile.birthDate} ${profile.birthTime || '12:00'}, ${profile.city})`);

    const utcDate = parseBirthDateTimeToUtc(profile.birthDate, profile.birthTime, profile.timezone);

    const origin = new Origin({
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth(),
      date: utcDate.getUTCDate(),
      hour: utcDate.getUTCHours(),
      minute: utcDate.getUTCMinutes(),
      latitude: profile.latitude,
      longitude: profile.longitude,
    });

    const horoscope = new Horoscope({
      origin,
      houseSystem: 'placidus',
      zodiac: 'tropical',
    });

    const houseCusps = (horoscope.Houses || []).map(h => normalizeDegree(h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees));

    const planetKeyMap = {
      sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
      jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
    };

    const planetsData = [];
    for (const [key, bodyName] of Object.entries(planetKeyMap)) {
      const celestial = horoscope.CelestialBodies?.[key];
      if (!celestial) continue;
      const absDeg = normalizeDegree(celestial.ChartPosition.Ecliptic.DecimalDegrees);
      const signInfo = degreesToSign(absDeg);
      const houseId = celestial.House?.id ?? getHouseForDegree(absDeg, houseCusps);
      const isRetrograde = Boolean(celestial.isRetrograde);

      planetsData.push({
        birthProfileId: profile.id,
        body: bodyName,
        sign: signInfo.sign,
        degree: signInfo.degreeInSign,
        minute: signInfo.minute,
        retrograde: isRetrograde,
        house: houseId,
        absDeg,
      });
    }

    const housesData = (horoscope.Houses || []).map(h => {
      const startDeg = normalizeDegree(h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
      const signInfo = degreesToSign(startDeg);
      return {
        birthProfileId: profile.id,
        houseNumber: h.id,
        sign: signInfo.sign,
        degree: signInfo.degreeInSign,
        minute: signInfo.minute,
      };
    });

    const ascDeg = normalizeDegree(horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees);
    const mcDeg = normalizeDegree(horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees);
    const descDeg = normalizeDegree(ascDeg + 180);
    const icDeg = normalizeDegree(mcDeg + 180);

    const T = (utcDate.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
    const northNodeDeg = normalizeDegree(125.04452 - 1934.136261 * T + 0.0020708 * T * T + 2.2e-6 * T * T * T);
    const southNodeDeg = normalizeDegree(northNodeDeg + 180);
    const lilithDeg = normalizeDegree(83.353243 + 4069.0137287 * T - 0.01032 * T * T - 1.2e-5 * T * T * T);
    const chironDeg = horoscope.CelestialBodies?.chiron
      ? normalizeDegree(horoscope.CelestialBodies.chiron.ChartPosition.Ecliptic.DecimalDegrees)
      : 0;

    const sunAbs = planetsData.find(p => p.body === 'Sun')?.absDeg || 0;
    const moonAbs = planetsData.find(p => p.body === 'Moon')?.absDeg || 0;
    const sunHouse = planetsData.find(p => p.body === 'Sun')?.house || 1;
    const isDayBirth = sunHouse >= 7;
    const pofDeg = isDayBirth
      ? normalizeDegree(ascDeg + moonAbs - sunAbs)
      : normalizeDegree(ascDeg + sunAbs - moonAbs);

    const chartPointsData = [
      { point: 'Ascendant', deg: ascDeg, house: 1 },
      { point: 'MC', deg: mcDeg, house: 10 },
      { point: 'DESC', deg: descDeg, house: 7 },
      { point: 'IC', deg: icDeg, house: 4 },
      { point: 'NorthNode', deg: northNodeDeg, house: getHouseForDegree(northNodeDeg, houseCusps) },
      { point: 'SouthNode', deg: southNodeDeg, house: getHouseForDegree(southNodeDeg, houseCusps) },
      { point: 'Chiron', deg: chironDeg, house: getHouseForDegree(chironDeg, houseCusps) },
      { point: 'Lilith', deg: lilithDeg, house: getHouseForDegree(lilithDeg, houseCusps) },
      { point: 'PartOfFortune', deg: pofDeg, house: getHouseForDegree(pofDeg, houseCusps) },
    ].map(cp => {
      const s = degreesToSign(cp.deg);
      return {
        birthProfileId: profile.id,
        point: cp.point,
        sign: s.sign,
        degree: s.degreeInSign,
        minute: s.minute,
        house: cp.house,
      };
    });

    const aspectBodies = [
      ...planetsData.map(p => ({ body: p.body, absoluteDegree: p.absDeg })),
      { body: 'Ascendant', absoluteDegree: ascDeg },
      { body: 'MC', absoluteDegree: mcDeg },
      { body: 'NorthNode', absoluteDegree: northNodeDeg },
      { body: 'Chiron', absoluteDegree: chironDeg },
      { body: 'Lilith', absoluteDegree: lilithDeg },
    ];
    const calculatedAspects = calculateAspects(aspectBodies).map(a => ({
      birthProfileId: profile.id,
      body1: a.body1,
      body2: a.body2,
      type: a.type,
      angle: a.angle,
      orb: a.orb,
      degree1: a.degree1,
      degree2: a.degree2,
    }));

    // Save to Database
    await prisma.$transaction([
      prisma.planetaryPosition.deleteMany({ where: { birthProfileId: profile.id } }),
      prisma.house.deleteMany({ where: { birthProfileId: profile.id } }),
      prisma.aspect.deleteMany({ where: { birthProfileId: profile.id } }),
      prisma.chartPoint.deleteMany({ where: { birthProfileId: profile.id } }),
      prisma.planetaryPosition.createMany({
        data: planetsData.map(({ absDeg, ...rest }) => rest),
      }),
      prisma.house.createMany({ data: housesData }),
      prisma.chartPoint.createMany({ data: chartPointsData }),
      prisma.aspect.createMany({ data: calculatedAspects }),
      prisma.birthProfile.update({
        where: { id: profile.id },
        data: { isCalculated: true },
      }),
    ]);

    console.log(`  ✓ Guardado: 10 planetas, 12 casas Placidus, 9 puntos, ${calculatedAspects.length} aspectos.`);
  }

  console.log('\n✅ ¡Todos los perfiles han sido recalculados con máxima precisión astronómica!');
  await prisma.$disconnect();
}

recalculate().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
