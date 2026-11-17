import { PlanetaryPosition, Planet } from '@/types/astrology';
import { degreesToSign, normalizeDegree } from './utils';
import { createOrigin } from './houses';
import HoroscopeModule from 'circular-natal-horoscope-js';

const { Horoscope } = HoroscopeModule;

const PLANET_KEY_MAP: Record<string, Planet> = {
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

export function extractPositionsFromHoroscope(horoscope: any): PlanetaryPosition[] {
  const positions: PlanetaryPosition[] = [];

  for (const [key, bodyName] of Object.entries(PLANET_KEY_MAP)) {
    const celestial = horoscope.CelestialBodies?.[key];
    if (!celestial) continue;

    const absDeg = normalizeDegree(celestial.ChartPosition.Ecliptic.DecimalDegrees);
    const signInfo = degreesToSign(absDeg);
    const houseId = celestial.House?.id ?? undefined;
    const isRetrograde = Boolean(celestial.isRetrograde);

    positions.push({
      body: bodyName,
      sign: signInfo.sign,
      degree: signInfo.degreeInSign,
      minute: signInfo.minute,
      absoluteDegree: absDeg,
      retrograde: isRetrograde,
      house: houseId,
    });
  }

  return positions;
}

export function calculatePlanetaryPositions(
  dateOrString: Date | string,
  timeOrLat?: string | number,
  latitudeOrLon?: number,
  longitudeOrTz?: number | string
): PlanetaryPosition[] {
  let lat = 0;
  let lon = 0;
  let timeStr: string | undefined = undefined;

  if (typeof timeOrLat === 'number') {
    // Signature: (date, latitude, longitude)
    lat = timeOrLat;
    lon = latitudeOrLon || 0;
  } else {
    // Signature: (dateString, timeString, latitude, longitude)
    timeStr = timeOrLat;
    lat = latitudeOrLon || 0;
    lon = typeof longitudeOrTz === 'number' ? longitudeOrTz : 0;
  }

  const origin = createOrigin(dateOrString, timeStr, lat, lon);

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
  });

  return extractPositionsFromHoroscope(horoscope);
}