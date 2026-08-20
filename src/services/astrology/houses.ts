import { HouseData, ZodiacSign, CHART_POINTS } from '@/types/astrology';
import { normalizeDegree, degreesToSign, toRad, toDeg, julianDay, daysSinceJ2000 } from './utils';

// Obliquity of the ecliptic at J2000.0
const OBLIQUITY_J2000 = 23.439291;

function obliquity(d: number): number {
  // Obliquity of the ecliptic (simplified)
  return OBLIQUITY_J2000 - 0.00000036 * d;
}

export function calculateAscendant(
  d: number,
  latitude: number,
  longitude: number
): number {
  const T = d / 36525;
  const θ0 = 280.46061837 + 360.98564736629 * (d) + 0.000387933 * T * T - T * T * T / 38710000;
  // GMST at 0h UT
  const GMST0 = normalizeDegree(θ0);
  
  // Approximate UT hours from d (fractional part)
  const utHours = (d - Math.floor(daysSinceJ2000(julianDay(2000, 1, 1.5, 0)))) * 24;
  const UT = Math.abs(utHours % 24);
  
  // Local sidereal time
  const RAMC = normalizeDegree(GMST0 + UT * 15 + longitude);
  const ramcRad = toRad(RAMC);
  const latRad = toRad(latitude);
  const epsRad = toRad(obliquity(d));
  
  // Ascendant calculation
  const ascDeg = toDeg(Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))
  ));
  
  return normalizeDegree(ascDeg);
}

export function calculateMC(
  d: number,
  latitude: number,
  longitude: number
): number {
  const T = d / 36525;
  const θ0 = 280.46061837 + 360.98564736629 * (d) + 0.000387933 * T * T - T * T * T / 38710000;
  const GMST0 = normalizeDegree(θ0);
  
  const utHours = (d - Math.floor(daysSinceJ2000(julianDay(2000, 1, 1.5, 0)))) * 24;
  const UT = Math.abs(utHours % 24);
  
  const RAMC = normalizeDegree(GMST0 + UT * 15 + longitude);
  const ramcRad = toRad(RAMC);
  const latRad = toRad(latitude);
  const epsRad = toRad(obliquity(d));
  
  // MC calculation
  const mcDeg = toDeg(Math.atan2(
    Math.sin(ramcRad),
    Math.cos(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad)
  ));
  
  return normalizeDegree(mcDeg);
}

export function calculateHouses(ascendantDegree: number): HouseData[] {
  // Whole Sign houses: each house starts at 0° of the sign containing the Ascendant
  const ascSignIndex = Math.floor(ascendantDegree / 30) % 12;
  
  const houses: HouseData[] = [];
  for (let i = 0; i < 12; i++) {
    const signIndex = (ascSignIndex + i) % 12;
    const ZODIAC_SIGNS: ZodiacSign[] = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    houses.push({
      houseNumber: i + 1,
      sign: ZODIAC_SIGNS[signIndex],
      degree: 0,
      minute: 0,
      absoluteDegree: signIndex * 30,
      planets: [],
    });
  }
  
  return houses;
}

export function assignPlanetsToHouses(
  houses: HouseData[],
  planetDegrees: { body: string; absoluteDegree: number }[]
): HouseData[] {
  const housesWithPlanets = houses.map(h => ({ ...h, planets: [] }));
  
  for (const planet of planetDegrees) {
    const planetDeg = normalizeDegree(planet.absoluteDegree);
    const signIndex = Math.floor(planetDeg / 30) % 12;
    
    for (const house of housesWithPlanets) {
      const houseSignIndex = Math.floor(house.absoluteDegree / 30) % 12;
      if (houseSignIndex === signIndex) {
        house.planets.push(planet.body);
        break;
      }
    }
  }
  
  return housesWithPlanets;
}