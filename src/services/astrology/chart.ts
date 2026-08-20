import {   FullChartData, PlanetaryPosition, HouseData, AspectData, ChartPointData,   BirthData, ChartPointName, ZodiacSign,} from '@/types/astrology';
import { calculatePlanetaryPositions } from './ephemeris';
import { calculateHouses, calculateAscendant, calculateMC, assignPlanetsToHouses } from './houses';
import { calculateAspects } from './aspects';
import {   degreesToSign, normalizeDegree, julianDay, daysSinceJ2000, getElementDistribution, getModalityDistribution,} from './utils';

function parseBirthDateTime(data: BirthData): Date {
  const [year, month, day] = data.birthDate.split('-').map(Number);
  if (data.timeUnknown || !data.birthTime) {
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Noon if unknown
  }
  const [hours, minutes] = data.birthTime.split(':').map(Number);
  // Parse timezone offset (e.g., "-04:00" or "America/Caracas")
  let tzOffsetHours = 0;
  if (data.timezone.includes('/') && !data.timezone.startsWith('+') && !data.timezone.startsWith('-')) {
    // IANA timezone string (e.g., "America/Caracas", "Europe/Madrid", "Atlantic/Canary")
    const tzMap: Record<string, number> = {
      'America/New_York': -5, 'America/Chicago': -6, 'America/Denver': -7,
      'America/Los_Angeles': -8, 'America/Phoenix': -7, 'America/Anchorage': -9,
      'America/Caracas': -4, 'America/Bogota': -5, 'America/Lima': -5,
      'America/Santiago': -4, 'America/Buenos_Aires': -3, 'America/Sao_Paulo': -3,
      'America/Mexico_City': -6, 'America/Havana': -5, 'America/Panama': -5,
      'America/Puerto_Rico': -4, 'America/Manaus': -4, 'America/La_Paz': -4,
      'America/Guayaquil': -5, 'America/Montevideo': -3, 'America/Asuncion': -4,
      'America/Indiana/Indianapolis': -5, 'America/Detroit': -5,
      // Argentina sub-zones
      'America/Argentina/Buenos_Aires': -3, 'America/Argentina/Cordoba': -3,
      'America/Argentina/Mendoza': -3, 'America/Argentina/Tucuman': -3,
      'America/Argentina/Salta': -3, 'America/Argentina/Jujuy': -3,
      // Mexico sub-zones
      'America/Cancun': -5, 'America/Merida': -6, 'America/Tijuana': -8,
      'America/Monterrey': -6,
      // Central America
      'America/Costa_Rica': -6, 'America/Managua': -6,
      'America/El_Salvador': -6, 'America/Tegucigalpa': -6, 'America/Guatemala': -6,
      'America/Santo_Domingo': -4,
      // Atlantic
      'Atlantic/Canary': 0,
      // Europe
      'Europe/Madrid': 1, 'Europe/Paris': 1, 'Europe/Berlin': 1, 'Europe/Rome': 1,
      'Europe/London': 0, 'Europe/Moscow': 3, 'Europe/Athens': 2,
      'Europe/Lisbon': 0, 'Europe/Dublin': 0, 'Europe/Amsterdam': 1,
      'Europe/Zurich': 1, 'Europe/Vienna': 1,
      // Asia & Pacific
      'Asia/Tokyo': 9, 'Asia/Shanghai': 8, 'Asia/Hong_Kong': 8,
      'Asia/Kolkata': 5.5, 'Asia/Dubai': 4, 'Asia/Singapore': 8,
      'Australia/Sydney': 10, 'Pacific/Auckland': 12,
    };
    tzOffsetHours = tzMap[data.timezone] ?? 0;
  } else {
    // Try to parse as offset like "-04:00"
    const match = data.timezone.match(/^([+-]?\d{1,2}):(\d{2})$/);
    if (match) {
      tzOffsetHours = parseInt(match[1]) + parseInt(match[2]) / 60;
    }
  }

  // Convert local time to UTC
  const utcHours = hours - tzOffsetHours;
  const date = new Date(Date.UTC(year, month - 1, day, utcHours, minutes, 0));
  return date;
}

function calculateNorthNode(d: number): number {
  // Mean North Node (simplified)
  // The lunar nodes complete a revolution in about 18.6 years
  // At J2000.0, the mean longitude of the ascending node was ~125.0445°
  const nodeRate = -0.0529538; // degrees per day
  return normalizeDegree(125.0445 + nodeRate * d);
}

function calculateChiron(d: number): number {
  // Chiron orbital period ~50.9 years
  // Simplified: L0 at J2000 ~ 209.2°, rate ~0.0702°/day
  return normalizeDegree(209.2 + 0.0702 * d);
}

function calculateLilith(d: number): number {
  // Mean Lilith (Moon's apogee)
  // Period ~8.85 years, L0 at J2000 ~ 118.31°, rate ~0.1114°/day
  return normalizeDegree(118.31 + 0.1114 * d);
}

function calculatePartOfFortune(
  ascendantDeg: number,
  sunDeg: number,
  moonDeg: number,
  isDayBirth: boolean
): number {
  // Day birth: PoF = ASC + Moon - Sun
  // Night birth: PoF = ASC + Sun - Moon
  if (isDayBirth) {
    return normalizeDegree(ascendantDeg + moonDeg - sunDeg);
  } else {
    return normalizeDegree(ascendantDeg + sunDeg - moonDeg);
  }
}

export async function calculateFullChart(data: BirthData): Promise<FullChartData> {
  const utcDate = parseBirthDateTime(data);

  // Julian day and days since J2000
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const hour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60.0;
  const jd = julianDay(year, month, day, hour);
  const d = daysSinceJ2000(jd);

  // Calculate planetary positions
  const planetaryPositions = calculatePlanetaryPositions(
    utcDate, data.latitude, data.longitude, data.timezone
  );

  // Calculate Ascendant and MC
  const ascendantDeg = data.timeUnknown
    ? normalizeDegree(Math.floor(Math.random() * 360)) // Random if unknown
    : calculateAscendant(d, data.latitude, data.longitude);
  const mcDeg = data.timeUnknown
    ? normalizeDegree(ascendantDeg + 90)
    : calculateMC(d, data.latitude, data.longitude);

  // Calculate houses
  let houses = calculateHouses(ascendantDeg);

  // Calculate chart points
  const sunDeg = planetaryPositions.find(p => p.body === 'Sun')!.absoluteDegree;
  const moonDeg = planetaryPositions.find(p => p.body === 'Moon')!.absoluteDegree;

  const northNodeDeg = calculateNorthNode(d);
  const southNodeDeg = normalizeDegree(northNodeDeg + 180);
  const chironDeg = calculateChiron(d);
  const lilithDeg = calculateLilith(d);
  const isDayBirth = (utcDate.getUTCHours() >= 6 && utcDate.getUTCHours() < 18);
  const pofDeg = data.timeUnknown ? 0 : calculatePartOfFortune(ascendantDeg, sunDeg, moonDeg, isDayBirth);
  const descDeg = normalizeDegree(ascendantDeg + 180);
  const icDeg = normalizeDegree(mcDeg + 180);

  // Determine house for Ascendant
  const ascSign = degreesToSign(ascendantDeg);
  const mcSign = degreesToSign(mcDeg);

  const chartPoints: ChartPointData[] = [
    { point: 'Ascendant' as ChartPointName, sign: ascSign.sign, degree: ascSign.degreeInSign, minute: ascSign.minute, absoluteDegree: ascendantDeg, house: 1 },
    { point: 'MC' as ChartPointName, sign: mcSign.sign, degree: mcSign.degreeInSign, minute: mcSign.minute, absoluteDegree: mcDeg, house: 10 },
    { point: 'DESC' as ChartPointName, sign: degreesToSign(descDeg).sign, degree: degreesToSign(descDeg).degreeInSign, minute: degreesToSign(descDeg).minute, absoluteDegree: descDeg, house: 7 },
    { point: 'IC' as ChartPointName, sign: degreesToSign(icDeg).sign, degree: degreesToSign(icDeg).degreeInSign, minute: degreesToSign(icDeg).minute, absoluteDegree: icDeg, house: 4 },
    { point: 'NorthNode' as ChartPointName, sign: degreesToSign(northNodeDeg).sign, degree: degreesToSign(northNodeDeg).degreeInSign, minute: degreesToSign(northNodeDeg).minute, absoluteDegree: northNodeDeg },
    { point: 'SouthNode' as ChartPointName, sign: degreesToSign(southNodeDeg).sign, degree: degreesToSign(southNodeDeg).degreeInSign, minute: degreesToSign(southNodeDeg).minute, absoluteDegree: southNodeDeg },
    { point: 'Chiron' as ChartPointName, sign: degreesToSign(chironDeg).sign, degree: degreesToSign(chironDeg).degreeInSign, minute: degreesToSign(chironDeg).minute, absoluteDegree: chironDeg },
    { point: 'Lilith' as ChartPointName, sign: degreesToSign(lilithDeg).sign, degree: degreesToSign(lilithDeg).degreeInSign, minute: degreesToSign(lilithDeg).minute, absoluteDegree: lilithDeg },
    { point: 'PartOfFortune' as ChartPointName, sign: degreesToSign(pofDeg).sign, degree: degreesToSign(pofDeg).degreeInSign, minute: degreesToSign(pofDeg).minute, absoluteDegree: pofDeg },
  ];

  // Assign planets to houses
  const allBodies = [
    ...planetaryPositions.map(p => ({ body: p.body, absoluteDegree: p.absoluteDegree })),
    ...chartPoints.map(cp => ({ body: cp.point, absoluteDegree: cp.absoluteDegree })),
  ];
  houses = assignPlanetsToHouses(houses, allBodies);

  // Assign houses to planetary positions
  for (const pos of planetaryPositions) {
    for (const house of houses) {
      const posSignIndex = Math.floor(normalizeDegree(pos.absoluteDegree) / 30) % 12;
      const houseSignIndex = Math.floor(house.absoluteDegree / 30) % 12;
      if (posSignIndex === houseSignIndex) {
        pos.house = house.houseNumber;
        break;
      }
    }
  }

  // Assign houses to chart points
  for (const cp of chartPoints) {
    if (cp.house) continue;
    for (const house of houses) {
      const cpSignIndex = Math.floor(normalizeDegree(cp.absoluteDegree) / 30) % 12;
      const houseSignIndex = Math.floor(house.absoluteDegree / 30) % 12;
      if (cpSignIndex === houseSignIndex) {
        cp.house = house.houseNumber;
        break;
      }
    }
  }

  // Calculate aspects
  const aspectBodies = [
    ...planetaryPositions.map(p => ({ body: p.body, absoluteDegree: p.absoluteDegree })),
    ...chartPoints
      .filter(cp => ['NorthNode', 'Chiron'].includes(cp.point))
      .map(cp => ({ body: cp.point, absoluteDegree: cp.absoluteDegree })),
  ];
  const aspects = calculateAspects(aspectBodies);

  // Calculate element and modality distributions
  const signPositions = planetaryPositions.map(p => ({ sign: p.sign, body: p.body }));
  const elements = getElementDistribution(signPositions);
  const modalities = getModalityDistribution(signPositions);

  return {
    planetaryPositions,
    houses,
    aspects,
    chartPoints,
    elements,
    modalities,
  };
}