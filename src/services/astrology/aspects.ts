import { AspectData, AspectType } from '@/types/astrology';
import { normalizeDegree, getAspectOrb, getAspectAngle } from './utils';

export function calculateAspects(
  positions: { body: string; absoluteDegree: number }[]
): AspectData[] {
  const aspects: AspectData[] = [];
  const aspectTypes: AspectType[] = [
    'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'
  ];

  // Exclude redundant points if needed, but include Ascendant, MC, NorthNode, Chiron, Lilith
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
          break; // Take the closest primary aspect between two bodies
        }
      }
    }
  }

  // Sort aspects by orb ascending (tightest aspects first)
  aspects.sort((a, b) => a.orb - b.orb);

  return aspects;
}
