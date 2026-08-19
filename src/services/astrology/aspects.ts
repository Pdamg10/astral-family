import { AspectData, AspectType, CHART_POINTS } from '@/types/astrology';
import { normalizeDegree, getAspectOrb, getAspectAngle } from './utils';

export function calculateAspects(
  positions: { body: string; absoluteDegree: number }[]
): AspectData[] {
  const aspects: AspectData[] = [];
  const aspectTypes: AspectType[] = [
    'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'
  ];

  // Only check between planets (not all chart points for simplicity)
  const bodies = positions.filter(p =>
    !['NorthNode', 'SouthNode', 'Chiron', 'Lilith', 'PartOfFortune'].includes(p.body)
  );

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const d1 = normalizeDegree(bodies[i].absoluteDegree);
      const d2 = normalizeDegree(bodies[j].absoluteDegree);
      let diff = Math.abs(d1 - d2);
      if (diff > 180) diff = 360 - diff;

      for (const type of aspectTypes) {
        const angle = getAspectAngle(type);
        const orb = getAspectOrb(type);
        const aspectDiff = Math.abs(diff - angle);

        if (aspectDiff <= orb) {
          aspects.push({
            body1: bodies[i].body,
            body2: bodies[j].body,
            type,
            angle,
            orb: Math.round(aspectDiff * 10) / 10,
            degree1: Math.round(d1 * 10) / 10,
            degree2: Math.round(d2 * 10) / 10,
          });
          break; // Only take the closest aspect between two bodies
        }
      }
    }
  }

  return aspects;
}
