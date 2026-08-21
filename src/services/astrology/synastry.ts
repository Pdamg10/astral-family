import {
  AspectType,
  PlanetaryPosition,
  SynastryAspect,
  SynastryResult,
  TransitAspect,
  TransitResult,
} from '@/types/astrology';
import { normalizeDegree, getAspectAngle, getAspectOrb } from './utils';
import { calculatePlanetaryPositions } from './ephemeris';

const ASPECT_TYPES: AspectType[] = [
  'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'
];

/**
 * Calculates inter-aspects between two sets of celestial positions (Synastry)
 */
export function calculateSynastryAspects(
  positionsA: { body: string; absoluteDegree: number }[],
  positionsB: { body: string; absoluteDegree: number }[]
): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];

  for (const posA of positionsA) {
    for (const posB of positionsB) {
      const d1 = normalizeDegree(posA.absoluteDegree);
      const d2 = normalizeDegree(posB.absoluteDegree);
      let diff = Math.abs(d1 - d2);
      if (diff > 180) diff = 360 - diff;

      for (const type of ASPECT_TYPES) {
        const angle = getAspectAngle(type);
        const orb = getAspectOrb(type);
        const aspectDiff = Math.abs(diff - angle);

        if (aspectDiff <= orb) {
          let harmony: 'harmonic' | 'tense' | 'neutral' = 'neutral';
          if (type === 'trine' || type === 'sextile') harmony = 'harmonic';
          else if (type === 'square' || type === 'opposition') harmony = 'tense';
          else if (type === 'conjunction') {
            // Conjunctions between benefics are harmonic, between malefics or mixed can be tense
            const tenseBodies = ['Mars', 'Saturn', 'Pluto'];
            harmony = (tenseBodies.includes(posA.body) || tenseBodies.includes(posB.body)) ? 'tense' : 'harmonic';
          }

          aspects.push({
            body1: posA.body,
            body2: posB.body,
            type,
            angle,
            orb: Math.round(aspectDiff * 10) / 10,
            degree1: Math.round(d1 * 10) / 10,
            degree2: Math.round(d2 * 10) / 10,
            harmony,
          });
          break; // Keep the primary aspect between this pair
        }
      }
    }
  }

  return aspects;
}

/**
 * Generates a full synastry comparison analysis between two profiles
 */
export function calculateSynastry(
  nameA: string,
  positionsA: PlanetaryPosition[],
  nameB: string,
  positionsB: PlanetaryPosition[]
): SynastryResult {
  const simplifiedA = positionsA.map(p => ({ body: p.body, absoluteDegree: p.absoluteDegree }));
  const simplifiedB = positionsB.map(p => ({ body: p.body, absoluteDegree: p.absoluteDegree }));

  const aspects = calculateSynastryAspects(simplifiedA, simplifiedB);

  const harmonicCount = aspects.filter(a => a.harmony === 'harmonic').length;
  const tenseCount = aspects.filter(a => a.harmony === 'tense').length;
  const neutralCount = aspects.filter(a => a.harmony === 'neutral').length;

  const totalWeighted = (harmonicCount * 1.5) + (neutralCount * 1.0) + (tenseCount * 0.4);
  const maxPossible = Math.max(1, (harmonicCount + tenseCount + neutralCount) * 1.5);
  const compatibilityScore = Math.min(100, Math.max(10, Math.round((totalWeighted / maxPossible) * 100)));

  let dominantDynamic = 'Dinámica equilibrada de crecimiento mutuo';
  if (harmonicCount > tenseCount * 2) {
    dominantDynamic = 'Alta fluidez, complementariedad y armonía natural';
  } else if (tenseCount > harmonicCount * 1.5) {
    dominantDynamic = 'Dinámica intensa de aprendizaje, retos y transformación';
  } else if (harmonicCount > tenseCount) {
    dominantDynamic = 'Afinidad constructiva y entendimiento profundo';
  }

  return {
    profileAName: nameA,
    profileBName: nameB,
    aspects,
    harmonicCount,
    tenseCount,
    neutralCount,
    compatibilityScore,
    dominantDynamic,
  };
}

/**
 * Calculates current real-time transits against natal planetary positions
 */
export function calculateCurrentTransits(
  natalPositions: PlanetaryPosition[],
  date: Date = new Date(),
  lat: number = 0,
  lon: number = 0
): TransitResult {
  const transitPositions = calculatePlanetaryPositions(date, lat, lon, 'UTC');
  const transitSimplified = transitPositions.map(p => ({ body: p.body, absoluteDegree: p.absoluteDegree }));
  const natalSimplified = natalPositions.map(p => ({ body: p.body, absoluteDegree: p.absoluteDegree }));

  const aspects: TransitAspect[] = [];

  for (const tPos of transitSimplified) {
    for (const nPos of natalSimplified) {
      const d1 = normalizeDegree(tPos.absoluteDegree);
      const d2 = normalizeDegree(nPos.absoluteDegree);
      let diff = Math.abs(d1 - d2);
      if (diff > 180) diff = 360 - diff;

      for (const type of ASPECT_TYPES) {
        const angle = getAspectAngle(type);
        // Tighter orb for transits (up to 3 degrees)
        const maxOrb = Math.min(3.5, getAspectOrb(type));
        const aspectDiff = Math.abs(diff - angle);

        if (aspectDiff <= maxOrb) {
          aspects.push({
            transitBody: tPos.body,
            natalBody: nPos.body,
            type,
            angle,
            orb: Math.round(aspectDiff * 10) / 10,
            transitDegree: Math.round(d1 * 10) / 10,
            natalDegree: Math.round(d2 * 10) / 10,
          });
          break;
        }
      }
    }
  }

  return {
    transitDate: date.toISOString().split('T')[0],
    transitPositions,
    aspects,
  };
}
