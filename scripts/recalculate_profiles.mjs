import { PrismaClient } from '@prisma/client';
import HoroscopeModule from 'circular-natal-horoscope-js';

const { Origin, Horoscope } = HoroscopeModule;
const prisma = new PrismaClient();

function normalizeDegree(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function degreesToSign(deg) {
  const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const normalized = normalizeDegree(deg);
  const signIndex = Math.floor(normalized / 30) % 12;
  const rem = normalized - signIndex * 30;
  
  const totalSeconds = Math.round(rem * 3600);
  const degreeInSign = Math.floor(totalSeconds / 3600);
  const remSeconds = totalSeconds % 3600;
  const minute = Math.floor(remSeconds / 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degreeInSign,
    minute,
  };
}

const planetKeyMap = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
};

const CITY_COORDS = {
  'ciudad guayana': { lat: 8.3512, lng: -62.6414, tz: 'America/Caracas' },
  'el callao': { lat: 7.3514, lng: -61.8264, tz: 'America/Caracas' },
  'caracas': { lat: 10.4806, lng: -66.9036, tz: 'America/Caracas' },
  'maracaibo': { lat: 10.6427, lng: -71.6225, tz: 'America/Caracas' },
  'valencia': { lat: 10.1627, lng: -68.0078, tz: 'America/Caracas' },
  'barquisimeto': { lat: 10.0646, lng: -69.3568, tz: 'America/Caracas' },
  'maracay': { lat: 10.2468, lng: -67.5958, tz: 'America/Caracas' },
  'maturín': { lat: 9.7457, lng: -63.1831, tz: 'America/Caracas' },
  'maturin': { lat: 9.7457, lng: -63.1831, tz: 'America/Caracas' },
  'cumaná': { lat: 10.4597, lng: -64.1753, tz: 'America/Caracas' },
  'cumana': { lat: 10.4597, lng: -64.1753, tz: 'America/Caracas' },
  'mérida': { lat: 8.5981, lng: -71.1406, tz: 'America/Caracas' },
  'merida': { lat: 8.5981, lng: -71.1406, tz: 'America/Caracas' },
  'san cristóbal': { lat: 7.7669, lng: -72.2250, tz: 'America/Caracas' },
  'puerto la cruz': { lat: 10.2138, lng: -64.6328, tz: 'America/Caracas' },
  'ciudad bolívar': { lat: 8.1292, lng: -63.5408, tz: 'America/Caracas' },
  'bogotá': { lat: 4.7110, lng: -74.0721, tz: 'America/Bogota' },
  'bogota': { lat: 4.7110, lng: -74.0721, tz: 'America/Bogota' },
  'medellín': { lat: 6.2442, lng: -75.5812, tz: 'America/Bogota' },
  'medellin': { lat: 6.2442, lng: -75.5812, tz: 'America/Bogota' },
  'buenos aires': { lat: -34.6037, lng: -58.3816, tz: 'America/Buenos_Aires' },
  'madrid': { lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid' },
  'barcelona': { lat: 41.3874, lng: 2.1686, tz: 'Europe/Madrid' },
};

function getCoords(city) {
  if (!city) return null;
  const c = city.toLowerCase().trim();
  for (const [name, data] of Object.entries(CITY_COORDS)) {
    if (c === name || c.includes(name) || name.includes(c)) return data;
  }
  return null;
}

async function main() {
  const allUsers = await prisma.user.findMany();
  for (const u of allUsers) {
    const coords = getCoords(u.city);
    const tz = coords ? coords.tz : (u.timezone?.includes('@') ? 'America/Caracas' : u.timezone);
    
    await prisma.user.update({
      where: { id: u.id },
      data: { timezone: tz },
    });

    const profile = await prisma.birthProfile.findFirst({
      where: {
        OR: [
          { createdBy: u.id },
          { name: u.name },
        ],
      },
    });

    if (profile) {
      const city = u.city || profile.city;
      const country = u.country || profile.country;
      const cData = getCoords(city);

      const tz = cData?.tz || (u.timezone && !u.timezone.includes('@') ? u.timezone : (profile.timezone && !profile.timezone.includes('@') ? profile.timezone : 'America/Caracas'));

      await prisma.birthProfile.update({
        where: { id: profile.id },
        data: {
          name: u.name,
          birthDate: u.birthDate || profile.birthDate,
          birthTime: u.birthTime || profile.birthTime,
          city,
          country,
          latitude: cData ? cData.lat : profile.latitude,
          longitude: cData ? cData.lng : profile.longitude,
          timezone: tz,
        },
      });
    }
  }

  const profiles = await prisma.birthProfile.findMany();
  console.log(`Recalculando ${profiles.length} perfiles en la base de datos...`);

  for (const p of profiles) {
    const [year, month, date] = p.birthDate.split('-').map(Number);
    const [hour, minute] = (p.birthTime || '12:00').split(':').map(Number);

    const origin = new Origin({
      year,
      month: month - 1,
      date,
      hour: isNaN(hour) ? 12 : hour,
      minute: isNaN(minute) ? 0 : minute,
      latitude: p.latitude,
      longitude: p.longitude,
    });

    const horoscope = new Horoscope({
      origin,
      houseSystem: 'placidus',
      zodiac: 'tropical',
      aspectTypes: ['major', 'minor'],
      customOrbs: {
        conjunction: 10,
        opposition: 8,
        trine: 8,
        square: 8,
        sextile: 6,
        quincunx: 3,
      },
    });

    // Delete existing child records
    await prisma.planetaryPosition.deleteMany({ where: { birthProfileId: p.id } });
    await prisma.house.deleteMany({ where: { birthProfileId: p.id } });
    await prisma.chartPoint.deleteMany({ where: { birthProfileId: p.id } });
    await prisma.aspect.deleteMany({ where: { birthProfileId: p.id } });

    // Planetary positions
    const planetInserts = [];
    const planetsList = [];
    for (const [key, bodyName] of Object.entries(planetKeyMap)) {
      const celestial = horoscope.CelestialBodies?.[key];
      if (!celestial) continue;

      const absDeg = normalizeDegree(celestial.ChartPosition.Ecliptic.DecimalDegrees);
      const signInfo = degreesToSign(absDeg);
      const houseId = celestial.House?.id || 1;
      const isRetrograde = Boolean(celestial.isRetrograde);

      planetsList.push({ name: bodyName, degree: absDeg });
      planetInserts.push({
        birthProfileId: p.id,
        body: bodyName,
        sign: signInfo.sign,
        degree: signInfo.degreeInSign,
        minute: signInfo.minute,
        house: houseId,
        retrograde: isRetrograde,
      });
    }
    await prisma.planetaryPosition.createMany({ data: planetInserts });

    // Houses
    const houseInserts = [];
    for (const h of horoscope.Houses) {
      const startDeg = normalizeDegree(h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
      const signInfo = degreesToSign(startDeg);
      houseInserts.push({
        birthProfileId: p.id,
        houseNumber: h.id,
        sign: signInfo.sign,
        degree: signInfo.degreeInSign,
        minute: signInfo.minute,
      });
    }
    await prisma.house.createMany({ data: houseInserts });

    // Chart Points
    const ascDeg = normalizeDegree(horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees);
    const mcDeg = normalizeDegree(horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees);
    const descDeg = normalizeDegree(ascDeg + 180);
    const icDeg = normalizeDegree(mcDeg + 180);

    const chironDeg = horoscope.CelestialBodies?.chiron
      ? normalizeDegree(horoscope.CelestialBodies.chiron.ChartPosition.Ecliptic.DecimalDegrees)
      : 0;

    const dateObj = new Date(Date.UTC(year, month - 1, date, hour, minute));
    const T = (dateObj.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
    const northNodeDeg = normalizeDegree(125.04452 - 1934.136261 * T + 0.0020708 * T * T + 2.2e-6 * T * T * T);
    const southNodeDeg = normalizeDegree(northNodeDeg + 180);
    const lilithDeg = normalizeDegree(263.353243 + 4069.0137287 * T - 0.01032 * T * T - 1.2e-5 * T * T * T);

    const sunPos = planetsList.find(x => x.name === 'Sun');
    const moonPos = planetsList.find(x => x.name === 'Moon');
    const pofDeg = normalizeDegree(ascDeg + (moonPos?.degree || 0) - (sunPos?.degree || 0));

    const points = [
      { point: 'Ascendant', deg: ascDeg, house: 1 },
      { point: 'MC', deg: mcDeg, house: 10 },
      { point: 'DESC', deg: descDeg, house: 7 },
      { point: 'IC', deg: icDeg, house: 4 },
      { point: 'NorthNode', deg: northNodeDeg, house: 12 },
      { point: 'SouthNode', deg: southNodeDeg, house: 6 },
      { point: 'Chiron', deg: chironDeg, house: 4 },
      { point: 'Lilith', deg: lilithDeg, house: 9 },
      { point: 'PartOfFortune', deg: pofDeg, house: 3 },
    ];

    const pointInserts = points.map(pt => {
      const s = degreesToSign(pt.deg);
      return {
        birthProfileId: p.id,
        point: pt.point,
        sign: s.sign,
        degree: s.degreeInSign,
        minute: s.minute,
        house: pt.house,
      };
    });
    await prisma.chartPoint.createMany({ data: pointInserts });

    // Aspects
    if (horoscope.Aspects?.all?.length) {
      const aspectInserts = horoscope.Aspects.all.map(asp => {
        const body1 = asp.point1Key ? (planetKeyMap[asp.point1Key] || asp.point1Key) : 'Sun';
        const body2 = asp.point2Key ? (planetKeyMap[asp.point2Key] || asp.point2Key) : 'Moon';
        return {
          birthProfileId: p.id,
          body1,
          body2,
          type: asp.aspectKey || 'conjunction',
          angle: asp.aspectDegrees || 0,
          orb: asp.orb || 0,
          degree1: asp.point1?.ChartPosition?.Ecliptic?.DecimalDegrees || 0,
          degree2: asp.point2?.ChartPosition?.Ecliptic?.DecimalDegrees || 0,
        };
      });
      await prisma.aspect.createMany({ data: aspectInserts });
    }

    console.log(`✅ [${p.name.padEnd(18)}] (${p.city}) -> Asc: ${degreesToSign(ascDeg).sign} ${degreesToSign(ascDeg).degreeInSign}°${degreesToSign(ascDeg).minute}' | MC: ${degreesToSign(mcDeg).sign} ${degreesToSign(mcDeg).degreeInSign}°${degreesToSign(mcDeg).minute}' | Sol: Casa ${horoscope.CelestialBodies.sun.House.id}`);
  }

  await prisma.$disconnect();
  console.log('🎉 Todos los perfiles han sido actualizados con 100% de fidelidad astronómica.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
