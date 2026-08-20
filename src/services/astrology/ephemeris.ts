import { PlanetaryPosition, Planet, ZodiacSign } from '@/types/astrology';
import { degreesToSign, normalizeDegree, toRad, toDeg, julianDay, daysSinceJ2000 } from './utils';

// Simplified orbital elements (J2000.0 epoch = Jan 1.5 2000)
// [L0 (mean longitude), rate (deg/day), period]
const SUN_MEAN_LONG_J2000 = 280.46646;
const SUN_RATE = 0.9856474;

const MOON_MEAN_LONG_J2000 = 218.3165;
const MOON_MEAN_LONG_RATE = 13.176396;
const MOON_ANOMALY_J2000 = 134.9634;
const MOON_ANOMALY_RATE = 13.064993;
const MOON_NODE_J2000 = 125.0445;
const MOON_NODE_RATE = -0.0529538;

// Planet data: [L0 at J2000, rate deg/day, inclination, longitude of perihelion, eccentricity]
const PLANET_ELEMENTS: Record<string, { l0: number; rate: number; a: number; w: number; e: number; size: string }> = {
  Mercury: { l0: 252.251, rate: 4.09233, a: 0.387, w: 77.458, e: 0.2056, size: 'inner' },
  Venus:   { l0: 181.980, rate: 1.60214, a: 0.723, w: 131.564, e: 0.0068, size: 'inner' },
  Mars:    { l0: 355.433, rate: 0.52402, a: 1.524, w: 336.060, e: 0.0934, size: 'inner' },
  Jupiter: { l0: 34.351,  rate: 0.08309, a: 5.203, w: 14.331,  e: 0.0484, size: 'outer' },
  Saturn:  { l0: 50.077,  rate: 0.03346, a: 9.537, w: 93.057,  e: 0.0542, size: 'outer' },
  Uranus:  { l0: 314.055, rate: 0.01177, a: 19.19, w: 173.005, e: 0.0472, size: 'outer' },
  Neptune: { l0: 304.349, rate: 0.00607, a: 30.07, w: 48.124,  e: 0.0086, size: 'outer' },
  Pluto:   { l0: 238.929, rate: 0.00404, a: 39.48, w: 224.068, e: 0.2488, size: 'outer' },
};

// Approximate Mercury and Mars retrograde periods (day-of-year ranges, Northern hemisphere perspective)
// Mercury retrograde ~3 times/year for ~3 weeks each
// Mars retrograde ~every 2 years for ~2.5 months
function isMercuryRetrograde(d: number): boolean {
  // Mercury retrograde periods (approximate, repeating pattern)
  // Using a simplified cycle: retrograde roughly when Mercury is at certain elongations
  const year = d / 365.25;
  // Simplified: Mercury goes retrograde approximately 3 times per year
  // The pattern repeats roughly every 116 days
  const cycle = ((d % 116) + 116) % 116;
  return cycle > 96 && cycle < 116;
}

function isMarsRetrograde(d: number): boolean {
  // Mars retrograde approximately every 780 days (synodic period) for ~72 days
  const cycle = ((d % 780) + 780) % 780;
  return cycle > 630 && cycle < 702;
}

function isVenusRetrograde(d: number): boolean {
  // Venus retrograde approximately every 584 days for ~42 days
  const cycle = ((d % 584) + 584) % 584;
  return cycle > 530 && cycle < 572;
}

function isJupiterRetrograde(d: number): boolean {
  // Jupiter retrograde approximately every 399 days for ~120 days
  const cycle = ((d % 399) + 399) % 399;
  return cycle > 240 && cycle < 360;
}

function isSaturnRetrograde(d: number): boolean {
  // Saturn retrograde approximately every 378 days for ~140 days
  const cycle = ((d % 378) + 378) % 378;
  return cycle > 220 && cycle < 360;
}

function isOuterRetrograde(planet: string, d: number): boolean {
  // Uranus, Neptune, Pluto are retrograde for ~5 months each year
  const cycle = ((d % 365.25) + 365.25) % 365.25;
  return cycle > 150 && cycle < 300;
}

function calculateSunPosition(d: number): number {
  // Mean anomaly of the Sun
  const g = normalizeDegree((357.529 + 0.98560028 * d) % 360);
  // Mean longitude
  const q = normalizeDegree((280.459 + 0.98564736 * d) % 360);
  // Ecliptic longitude (equation of center)
  const L = normalizeDegree(q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g)));
  return L;
}

function calculateMoonPosition(d: number): number {
  // Moon's mean longitude
  const L = normalizeDegree(MOON_MEAN_LONG_J2000 + MOON_MEAN_LONG_RATE * d);
  // Moon's mean anomaly
  const M = normalizeDegree(MOON_ANOMALY_J2000 + MOON_ANOMALY_RATE * d);
  // Moon's argument of latitude
  const F = normalizeDegree(93.272 + 13.22935 * d);
  // Moon's ascending node longitude
  const Ω = normalizeDegree(MOON_NODE_J2000 + MOON_NODE_RATE * d);
  
  // Main lunar perturbation terms
  let longitude = L
    + 6.289 * Math.sin(toRad(M))
    - 1.274 * Math.sin(toRad(M - 2 * F))
    + 0.658 * Math.sin(toRad(2 * F))
    + 0.214 * Math.sin(toRad(2 * M))
    - 0.186 * Math.sin(toRad(M + Ω - 135))
    + 0.114 * Math.sin(toRad(2 * F - Ω))
    - 0.059 * Math.sin(toRad(M + 2 * F))
    - 0.057 * Math.sin(toRad(M - Ω + 135));

  return normalizeDegree(longitude);
}

function calculatePlanetPosition(planet: string, d: number): number {
  const el = PLANET_ELEMENTS[planet];
  if (!el) return 0;

  // Mean longitude
  let L = normalizeDegree(el.l0 + el.rate * d);
  
  // Simplified equation of center
  const meanAnomaly = normalizeDegree(L - el.w);
  const C = el.e * (1.915 * Math.sin(toRad(meanAnomaly)) 
    + 0.020 * Math.sin(toRad(2 * meanAnomaly)));
  
  // True longitude
  const trueLongitude = normalizeDegree(L + C);
  return trueLongitude;
}

export function calculatePlanetaryPositions(
  date: Date,
  _latitude: number,
  _longitude: number,
  _timezone: string
): PlanetaryPosition[] {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60.0 + date.getUTCSeconds() / 3600.0;

  const jd = julianDay(year, month, day, hour);
  const d = daysSinceJ2000(jd);

  const positions: PlanetaryPosition[] = [];

  // Sun
  const sunDeg = calculateSunPosition(d);
  const sunSign = degreesToSign(sunDeg);
  positions.push({
    body: 'Sun' as Planet,
    sign: sunSign.sign,
    degree: sunSign.degreeInSign,
    minute: sunSign.minute,
    absoluteDegree: sunDeg,
    retrograde: false,
  });

  // Moon
  const moonDeg = calculateMoonPosition(d);
  const moonSign = degreesToSign(moonDeg);
  positions.push({
    body: 'Moon' as Planet,
    sign: moonSign.sign,
    degree: moonSign.degreeInSign,
    minute: moonSign.minute,
    absoluteDegree: moonDeg,
    retrograde: false,
  });

  // Planets
  const planetList: Planet[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  for (const planet of planetList) {
    const deg = calculatePlanetPosition(planet, d);
    const sign = degreesToSign(deg);
    let retrograde = false;
    if (planet === 'Mercury') retrograde = isMercuryRetrograde(d);
    else if (planet === 'Venus') retrograde = isVenusRetrograde(d);
    else if (planet === 'Mars') retrograde = isMarsRetrograde(d);
    else if (planet === 'Jupiter') retrograde = isJupiterRetrograde(d);
    else if (planet === 'Saturn') retrograde = isSaturnRetrograde(d);
    else retrograde = isOuterRetrograde(planet, d);

    positions.push({
      body: planet,
      sign: sign.sign,
      degree: sign.degreeInSign,
      minute: sign.minute,
      absoluteDegree: deg,
      retrograde,
    });
  }

  return positions;
}