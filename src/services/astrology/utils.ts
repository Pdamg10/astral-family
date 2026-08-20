import {   ZodiacSign, Element, Modality, Planet, AspectType,   ZODIAC_SIGNS, ELEMENTS, MODALITIES,} from '@/types/astrology';

export function normalizeDegree(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function degreesToSign(degree: number): { sign: ZodiacSign; degreeInSign: number; minute: number } {
  const d = normalizeDegree(degree);
  const signIndex = Math.floor(d / 30);
  const degreeInSign = d - signIndex * 30;
  const minute = (degreeInSign - Math.floor(degreeInSign)) * 60;
  return {
    sign: ZODIAC_SIGNS[signIndex % 12],
    degreeInSign: Math.floor(degreeInSign),
    minute: Math.round(minute * 10) / 10,
  };
}

export function getSignElement(sign: ZodiacSign): Element {
  const fireSigns: ZodiacSign[] = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns: ZodiacSign[] = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns: ZodiacSign[] = ['Gemini', 'Libra', 'Aquarius'];
  if (fireSigns.includes(sign)) return 'Fire';
  if (earthSigns.includes(sign)) return 'Earth';
  if (airSigns.includes(sign)) return 'Air';
  return 'Water';
}

export function getSignModality(sign: ZodiacSign): Modality {
  const cardinal: ZodiacSign[] = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
  const fixed: ZodiacSign[] = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
  if (cardinal.includes(sign)) return 'Cardinal';
  if (fixed.includes(sign)) return 'Fixed';
  return 'Mutable';
}

export function getSignEmoji(sign: ZodiacSign): string {
  const map: Record<ZodiacSign, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
    Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
    Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
  };
  return map[sign];
}

export function getPlanetSymbol(planet: string): string {
  const map: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
    Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅',
    Neptune: '♆', Pluto: '♇', NorthNode: '☊', SouthNode: '☋',
    Chiron: '♧', Lilith: '☽', PartOfFortune: '⚕',
    Ascendant: '↑', MC: '☼', DESC: '↓', IC: '☿',
  };
  return map[planet] || planet;
}

export function getAspectSymbol(type: AspectType): string {
  const map: Record<AspectType, string> = {
    conjunction: '☌', opposition: '◇', trine: '△',
    square: '□', sextile: '◦', quincunx: '✱',
  };
  return map[type];
}

export function getAspectAngle(type: AspectType): number {
  const map: Record<AspectType, number> = {
    conjunction: 0, opposition: 180, trine: 120,
    square: 90, sextile: 60, quincunx: 150,
  };
  return map[type];
}

export function getAspectOrb(type: AspectType): number {
  const map: Record<AspectType, number> = {
    conjunction: 8, opposition: 8, trine: 7,
    square: 7, sextile: 5, quincunx: 3,
  };
  return map[type];
}

export function getElementDistribution(
  positions: { sign: ZodiacSign; body: string }[]
): { Fire: number; Earth: number; Air: number; Water: number; dominant: Element; least: Element } {
  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  for (const p of positions) {
    if (p.body === 'Lilith') continue;
    counts[getSignElement(p.sign)]++;
  }
  const entries = Object.entries(counts) as [Element, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return {
    ...counts,
    dominant: entries[0][0],
    least: entries[entries.length - 1][0],
  };
}

export function getModalityDistribution(
  positions: { sign: ZodiacSign; body: string }[]
): { Cardinal: number; Fixed: number; Mutable: number; dominant: Modality; least: Modality } {
  const counts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const p of positions) {
    if (p.body === 'Lilith') continue;
    counts[getSignModality(p.sign)]++;
  }
  const entries = Object.entries(counts) as [Modality, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return {
    ...counts,
    dominant: entries[0][0],
    least: entries[entries.length - 1][0],
  };
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function julianDay(year: number, month: number, day: number, hour: number = 0): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24.0 + B - 1524.5;
}

export function daysSinceJ2000(jd: number): number {
  return jd - 2451545.0;
}
