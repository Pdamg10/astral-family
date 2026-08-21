import { HouseData, ZodiacSign } from '@/types/astrology';
import { normalizeDegree, degreesToSign } from './utils';
import HoroscopeModule from 'circular-natal-horoscope-js';

const { Origin, Horoscope } = HoroscopeModule;

export type HouseSystem = 'placidus' | 'whole_sign' | 'equal';

export function createOrigin(
  dateOrString: Date | string,
  timeOrUndefined?: string,
  latitude: number = 0,
  longitude: number = 0
) {
  if (typeof dateOrString === 'string') {
    const parts = dateOrString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed (0=Jan...11=Dec)
    const date = parseInt(parts[2], 10);
    let hour = 12;
    let minute = 0;
    if (timeOrUndefined) {
      const tParts = timeOrUndefined.split(':');
      hour = parseInt(tParts[0], 10) || 0;
      minute = parseInt(tParts[1], 10) || 0;
    }
    return new Origin({
      year,
      month,
      date,
      hour,
      minute,
      latitude,
      longitude,
    });
  } else {
    return new Origin({
      year: dateOrString.getFullYear(),
      month: dateOrString.getMonth(),
      date: dateOrString.getDate(),
      hour: dateOrString.getHours(),
      minute: dateOrString.getMinutes(),
      latitude,
      longitude,
    });
  }
}

export function getHoroscopeInstance(
  dateOrString: Date | string,
  timeOrUndefined: string | number,
  latitude?: number,
  longitude?: number,
  houseSystem: HouseSystem = 'placidus'
) {
  let lat = 0;
  let lon = 0;
  let timeStr: string | undefined = undefined;

  if (typeof timeOrUndefined === 'number') {
    // Legacy signature: (utcDate, latitude, longitude, houseSystem)
    lat = timeOrUndefined;
    lon = latitude || 0;
  } else {
    timeStr = timeOrUndefined;
    lat = latitude || 0;
    lon = longitude || 0;
  }

  const origin = createOrigin(dateOrString, timeStr, lat, lon);

  return new Horoscope({
    origin,
    houseSystem,
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
}

export function calculateHouses(
  dateOrString: Date | string,
  timeOrLat: string | number,
  latitudeOrLon?: number,
  longitudeOrSystem?: number | HouseSystem,
  system: HouseSystem = 'placidus'
): { houses: HouseData[]; ascendantDegree: number; mcDegree: number } {
  let houseSystem: HouseSystem = system;
  let lat = 0;
  let lon = 0;
  let timeStr: string | undefined = undefined;

  if (typeof timeOrLat === 'number') {
    // Signature: (date, latitude, longitude, system)
    lat = timeOrLat;
    lon = latitudeOrLon || 0;
    if (typeof longitudeOrSystem === 'string') {
      houseSystem = longitudeOrSystem as HouseSystem;
    }
  } else {
    // Signature: (dateString, timeString, latitude, longitude, system)
    timeStr = timeOrLat;
    lat = latitudeOrLon || 0;
    lon = typeof longitudeOrSystem === 'number' ? longitudeOrSystem : 0;
  }

  const horoscope = getHoroscopeInstance(dateOrString, timeStr || lat, lat, lon, houseSystem);

  const ascDeg = normalizeDegree(horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees);
  const mcDeg = normalizeDegree(horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees);

  const houses: HouseData[] = [];

  if (houseSystem === 'placidus' && horoscope.Houses?.length === 12) {
    for (const h of horoscope.Houses) {
      const startDeg = normalizeDegree(h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
      const signInfo = degreesToSign(startDeg);
      houses.push({
        houseNumber: h.id,
        sign: signInfo.sign,
        degree: signInfo.degreeInSign,
        minute: signInfo.minute,
        absoluteDegree: startDeg,
        planets: [],
      });
    }
  } else if (houseSystem === 'equal') {
    for (let i = 0; i < 12; i++) {
      const houseDeg = normalizeDegree(ascDeg + i * 30);
      const signInfo = degreesToSign(houseDeg);
      houses.push({
        houseNumber: i + 1,
        sign: signInfo.sign,
        degree: signInfo.degreeInSign,
        minute: signInfo.minute,
        absoluteDegree: houseDeg,
        planets: [],
      });
    }
  } else {
    // Whole Sign
    const ascSignIndex = Math.floor(ascDeg / 30) % 12;
    const ZODIAC_SIGNS: ZodiacSign[] = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    for (let i = 0; i < 12; i++) {
      const signIndex = (ascSignIndex + i) % 12;
      houses.push({
        houseNumber: i + 1,
        sign: ZODIAC_SIGNS[signIndex],
        degree: 0,
        minute: 0,
        absoluteDegree: signIndex * 30,
        planets: [],
      });
    }
  }

  return { houses, ascendantDegree: ascDeg, mcDegree: mcDeg };
}

export function isDegreeInHouse(degree: number, cuspStart: number, cuspEnd: number): boolean {
  const d = normalizeDegree(degree);
  const start = normalizeDegree(cuspStart);
  const end = normalizeDegree(cuspEnd);

  if (start < end) {
    return d >= start && d < end;
  } else {
    return d >= start || d < end;
  }
}

export function getHouseForDegree(degree: number, houses: HouseData[]): number {
  if (!houses || houses.length !== 12) return 1;

  for (let i = 0; i < 12; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % 12];
    if (isDegreeInHouse(degree, currentHouse.absoluteDegree, nextHouse.absoluteDegree)) {
      return currentHouse.houseNumber;
    }
  }

  return 1;
}

export function assignPlanetsToHouses(
  planets: { body: any; absoluteDegree: number }[],
  houses: HouseData[]
): HouseData[] {
  const housesCopy: HouseData[] = houses.map(h => ({
    ...h,
    planets: [],
  }));

  for (const planet of planets) {
    const houseNumber = getHouseForDegree(planet.absoluteDegree, housesCopy);
    const houseIndex = housesCopy.findIndex(h => h.houseNumber === houseNumber);
    if (houseIndex !== -1) {
      housesCopy[houseIndex].planets.push(planet.body);
    }
  }

  return housesCopy;
}