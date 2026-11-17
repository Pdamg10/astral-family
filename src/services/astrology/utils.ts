import {
  ZodiacSign,
  Element,
  Modality,
  AspectType,
  ZODIAC_SIGNS,
} from '@/types/astrology';

export function normalizeDegree(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function degreesToSign(degree: number): {
  sign: ZodiacSign;
  degreeInSign: number;
  minute: number;
  second: number;
  formatted: string;
} {
  const d = normalizeDegree(degree);
  const signIndex = Math.floor(d / 30) % 12;
  const rem = d - signIndex * 30;
  
  // Total arcseconds in sign rounded to integer
  const totalSeconds = Math.round(rem * 3600);
  const degreeInSign = Math.floor(totalSeconds / 3600);
  const remSeconds = totalSeconds % 3600;
  const minute = Math.floor(remSeconds / 60);
  const second = remSeconds % 60;

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degreeInSign,
    minute,
    second,
    formatted: `${degreeInSign}°${minute.toString().padStart(2, '0')}'`,
  };
}

export function formatDegreeMinute(degree: number, minute?: number): string {
  if (minute !== undefined && Number.isInteger(degree)) {
    return `${degree}°${Math.round(minute).toString().padStart(2, '0')}'`;
  }
  const d = degreesToSign(degree);
  return d.formatted;
}

export function parseBirthDateTimeToUtc(
  birthDate: string,
  birthTime: string | null,
  timezone: string
): { utcDate: Date; offsetHours: number } {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hours, minutes] = (birthTime || '12:00').split(':').map(Number);

  // If timezone is offset format like "-04:00" or "+02:00"
  const offsetMatch = timezone.match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (offsetMatch) {
    const sign = offsetMatch[1] === '-' ? -1 : 1;
    const h = parseInt(offsetMatch[2], 10);
    const m = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0;
    const totalMinutes = sign * (h * 60 + m);
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0) - totalMinutes * 60000);
    return { utcDate, offsetHours: totalMinutes / 60 };
  }

  // If timezone is IANA name like "America/Caracas" or "Europe/Madrid"
  try {
    const tempUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(tempUtc);
    const partMap: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== 'literal') {
        partMap[p.type] = parseInt(p.value, 10);
      }
    }
    const asTzUtc = Date.UTC(
      partMap.year,
      partMap.month - 1,
      partMap.day,
      partMap.hour % 24,
      partMap.minute,
      partMap.second || 0
    );
    const offsetMs = asTzUtc - tempUtc.getTime();
    const utcDate = new Date(tempUtc.getTime() - offsetMs);
    return { utcDate, offsetHours: offsetMs / 3600000 };
  } catch {
    // Fallback if timezone string is unrecognized
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    return { utcDate, offsetHours: 0 };
  }
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

export function getSignEmoji(sign: ZodiacSign | string): string {
  const map: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
    Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
    Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
  };
  return map[sign] || '✦';
}

export function getPlanetSymbol(planet: string): string {
  const map: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
    Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅',
    Neptune: '♆', Pluto: '♇', NorthNode: '☊', SouthNode: '☋',
    Chiron: '⚷', Lilith: '⚸', PartOfFortune: '⊕',
    Ascendant: 'AC', MC: 'MC', DESC: 'DC', IC: 'IC',
  };
  return map[planet] || planet;
}

export function getAspectSymbol(type: AspectType | string): string {
  const map: Record<string, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    quincunx: '⚻',
  };
  return map[type] || '✦';
}

export function getAspectAngle(type: AspectType): number {
  const map: Record<AspectType, number> = {
    conjunction: 0,
    opposition: 180,
    trine: 120,
    square: 90,
    sextile: 60,
    quincunx: 150,
  };
  return map[type] ?? 0;
}

export function getAspectOrb(type: AspectType): number {
  const map: Record<AspectType, number> = {
    conjunction: 10,
    opposition: 8,
    trine: 8,
    square: 8,
    sextile: 6,
    quincunx: 3,
  };
  return map[type] ?? 6;
}

export function getElementDistribution(
  positions: { sign: ZodiacSign | string; body: string }[]
): { Fire: number; Earth: number; Air: number; Water: number; dominant: Element; least: Element } {
  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  for (const p of positions) {
    if (['Lilith', 'PartOfFortune', 'SouthNode'].includes(p.body)) continue;
    const elem = getSignElement(p.sign as ZodiacSign);
    if (counts[elem] !== undefined) {
      counts[elem]++;
    }
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
  positions: { sign: ZodiacSign | string; body: string }[]
): { Cardinal: number; Fixed: number; Mutable: number; dominant: Modality; least: Modality } {
  const counts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const p of positions) {
    if (['Lilith', 'PartOfFortune', 'SouthNode'].includes(p.body)) continue;
    const mod = getSignModality(p.sign as ZodiacSign);
    if (counts[mod] !== undefined) {
      counts[mod]++;
    }
  }
  const entries = Object.entries(counts) as [Modality, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return {
    ...counts,
    dominant: entries[0][0],
    least: entries[entries.length - 1][0],
  };
}

export const SIGN_NAMES_ES: Record<ZodiacSign, string> = {
  Aries: 'Aries',
  Taurus: 'Tauro',
  Gemini: 'Géminis',
  Cancer: 'Cáncer',
  Leo: 'Leo',
  Virgo: 'Virgo',
  Libra: 'Libra',
  Scorpio: 'Escorpio',
  Sagittarius: 'Sagitario',
  Capricorn: 'Capricornio',
  Aquarius: 'Acuario',
  Pisces: 'Piscis',
};

export const PLANET_NAMES_ES: Record<string, string> = {
  Sun: 'Sol',
  Moon: 'Luna',
  Mercury: 'Mercurio',
  Venus: 'Venus',
  Mars: 'Marte',
  Jupiter: 'Júpiter',
  Saturn: 'Saturno',
  Uranus: 'Urano',
  Neptune: 'Neptuno',
  Pluto: 'Plutón',
  Ascendant: 'Ascendente (AC)',
  MC: 'Medio Cielo (MC)',
  DESC: 'Descendente (DC)',
  IC: 'Fondo Cielo (IC)',
  NorthNode: 'Nodo Norte',
  SouthNode: 'Nodo Sur',
  Chiron: 'Quirón',
  Lilith: 'Lilith (Luna Negra)',
  PartOfFortune: 'Parte de Fortuna',
};

/**
 * Normalizes sign names (English or Spanish) to the canonical English ZodiacSign key
 */
export function canonicalSignName(rawSign?: string): ZodiacSign {
  if (!rawSign) return 'Aries';
  const s = rawSign.trim().toLowerCase();
  if (s.startsWith('ari')) return 'Aries';
  if (s.startsWith('tau')) return 'Taurus';
  if (s.startsWith('gém') || s.startsWith('gem')) return 'Gemini';
  if (s.startsWith('cán') || s.startsWith('can')) return 'Cancer';
  if (s.startsWith('leo')) return 'Leo';
  if (s.startsWith('vir')) return 'Virgo';
  if (s.startsWith('lib')) return 'Libra';
  if (s.startsWith('esc') || s.startsWith('sco')) return 'Scorpio';
  if (s.startsWith('sag')) return 'Sagittarius';
  if (s.startsWith('cap')) return 'Capricorn';
  if (s.startsWith('acu') || s.startsWith('aqu')) return 'Aquarius';
  if (s.startsWith('pis')) return 'Pisces';
  return 'Aries';
}

export function getSignNameEs(sign: string): string {
  const canonical = canonicalSignName(sign);
  return SIGN_NAMES_ES[canonical] || sign;
}

export function getPlanetNameEs(body: string): string {
  return PLANET_NAMES_ES[body] || body;
}

export function signToAbsoluteDegree(sign: string, degree: number, minute: number = 0): number {
  const canonical = canonicalSignName(sign);
  const index = ZODIAC_SIGNS.indexOf(canonical);
  return (index >= 0 ? index * 30 : 0) + degree + minute / 60;
}

export function formatBirthDate(ds?: string): string {
  if (!ds) return '';
  try {
    const parts = ds.includes('-') ? ds.split('-') : ds.split('/');
    if (parts.length < 3) return ds;
    const [y, m, d] = parts;
    const ms = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIdx = parseInt(m, 10) - 1;
    const dayNum = parseInt(d, 10);
    if (isNaN(dayNum) || isNaN(monthIdx) || !ms[monthIdx]) return ds;
    return `${dayNum} de ${ms[monthIdx]} de ${y}`;
  } catch {
    return ds || '';
  }
}

export function calculateAge(birthDateStr?: string): number {
  if (!birthDateStr) return 0;
  try {
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  } catch {
    return 0;
  }
}
