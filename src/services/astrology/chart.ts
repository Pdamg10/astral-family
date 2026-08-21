import {
  FullChartData,
  PlanetaryPosition,
  HouseData,
  AspectData,
  ChartPointData,
  BirthData,
  ChartPointName,
  Planet,
} from '@/types/astrology';
import { calculatePlanetaryPositions } from './ephemeris';
import { calculateHouses, assignPlanetsToHouses, getHouseForDegree, createOrigin } from './houses';
import { calculateAspects } from './aspects';
import {
  degreesToSign,
  normalizeDegree,
  parseBirthDateTimeToUtc,
  getElementDistribution,
  getModalityDistribution,
} from './utils';
import HoroscopeModule from 'circular-natal-horoscope-js';

const { Horoscope } = HoroscopeModule;

export async function calculateFullChart(data: BirthData): Promise<FullChartData> {
  const { utcDate } = parseBirthDateTimeToUtc(data.birthDate, data.birthTime, data.timezone);

  // 1. Calculate Houses & Angles (Placidus) using local birth date/time and coordinates
  const { houses: rawHouses, ascendantDegree, mcDegree } = calculateHouses(
    data.birthDate,
    data.birthTime || '12:00',
    data.latitude,
    data.longitude,
    'placidus'
  );

  // 2. Calculate Planetary Positions
  const planetaryPositions = calculatePlanetaryPositions(
    data.birthDate,
    data.birthTime || '12:00',
    data.latitude,
    data.longitude
  );

  // 3. Calculate Chart Points (Chiron, Nodes, Lilith, Part of Fortune, DESC, IC)
  const origin = createOrigin(data.birthDate, data.birthTime || '12:00', data.latitude, data.longitude);
  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
  });

  // Chiron
  const chironDeg = horoscope.CelestialBodies?.chiron
    ? normalizeDegree(horoscope.CelestialBodies.chiron.ChartPosition.Ecliptic.DecimalDegrees)
    : 0;

  // Mean North Node & South Node
  // T: Julian centuries since J2000.0
  const T = (utcDate.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
  const northNodeDeg = normalizeDegree(
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + 2.2e-6 * T * T * T
  );
  const southNodeDeg = normalizeDegree(northNodeDeg + 180);

  // Mean Lilith (Lunar Apogee = Perigee + 180°)
  const lilithDeg = normalizeDegree(
    263.353243 + 4069.0137287 * T - 0.01032 * T * T - 1.2e-5 * T * T * T
  );

  // Descendant & IC
  const descDeg = normalizeDegree(ascendantDegree + 180);
  const icDeg = normalizeDegree(mcDegree + 180);

  // Part of Fortune
  const sunPos = planetaryPositions.find(p => p.body === 'Sun');
  const moonPos = planetaryPositions.find(p => p.body === 'Moon');
  const sunDeg = sunPos ? sunPos.absoluteDegree : 0;
  const moonDeg = moonPos ? moonPos.absoluteDegree : 0;
  const isDayBirth = sunPos?.house ? sunPos.house >= 7 : false;
  const pofDeg = isDayBirth
    ? normalizeDegree(ascendantDegree + moonDeg - sunDeg)
    : normalizeDegree(ascendantDegree + sunDeg - moonDeg);

  // Build Chart Points
  const pointsDef: { point: ChartPointName; deg: number; fixedHouse?: number }[] = [
    { point: 'Ascendant', deg: ascendantDegree, fixedHouse: 1 },
    { point: 'MC', deg: mcDegree, fixedHouse: 10 },
    { point: 'DESC', deg: descDeg, fixedHouse: 7 },
    { point: 'IC', deg: icDeg, fixedHouse: 4 },
    { point: 'NorthNode', deg: northNodeDeg },
    { point: 'SouthNode', deg: southNodeDeg },
    { point: 'Chiron', deg: chironDeg },
    { point: 'Lilith', deg: lilithDeg },
    { point: 'PartOfFortune', deg: pofDeg },
  ];

  const chartPoints: ChartPointData[] = pointsDef.map(p => {
    const s = degreesToSign(p.deg);
    const house = p.fixedHouse ?? getHouseForDegree(p.deg, rawHouses);
    return {
      point: p.point,
      sign: s.sign,
      degree: s.degreeInSign,
      minute: s.minute,
      absoluteDegree: p.deg,
      house,
    };
  });

  // Assign house numbers to planets
  for (const pos of planetaryPositions) {
    if (!pos.house) {
      pos.house = getHouseForDegree(pos.absoluteDegree, rawHouses);
    }
  }

  // Assign planets to houses
  const houses = assignPlanetsToHouses(
    planetaryPositions.map(p => ({ body: p.body, absoluteDegree: p.absoluteDegree })),
    rawHouses
  );

  // 4. Calculate Aspects
  const allAspectBodies = [
    ...planetaryPositions.map(p => ({
      body: p.body,
      absoluteDegree: p.absoluteDegree,
    })),
    { body: 'Ascendant', absoluteDegree: ascendantDegree },
    { body: 'MC', absoluteDegree: mcDegree },
    { body: 'NorthNode', absoluteDegree: northNodeDeg },
    { body: 'Chiron', absoluteDegree: chironDeg },
  ];

  const aspects: AspectData[] = calculateAspects(allAspectBodies);

  // 5. Element & Modality Distributions
  const elements = getElementDistribution(planetaryPositions);
  const modalities = getModalityDistribution(planetaryPositions);

  return {
    birthData: data,
    planetaryPositions,
    houses,
    aspects,
    chartPoints,
    elements,
    modalities,
    ascendantSign: degreesToSign(ascendantDegree).sign,
    mcSign: degreesToSign(mcDegree).sign,
    sunSign: sunPos?.sign ?? 'Aries',
    moonSign: moonPos?.sign ?? 'Aries',
  };
}