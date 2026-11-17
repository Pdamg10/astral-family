export type RelationshipType =
  | 'grandparent'
  | 'parent'
  | 'partner'
  | 'sibling'
  | 'child'
  | 'grandchild'
  | 'uncle_aunt'
  | 'niece_nephew'
  | 'cousin'
  | 'parent_in_law'
  | 'child_in_law'
  | 'in_law';

export interface RelationshipMeta {
  id: RelationshipType;
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
  badgeClass: string;
  activeBg: string;
  group: 'direct' | 'extended' | 'political';
}

export const RELATIONSHIP_OPTIONS: RelationshipMeta[] = [
  // Direct lineage (Abuelos -> Padres -> Pareja/Hermanos -> Hijos -> Nietos)
  {
    id: 'grandparent',
    label: '👴 Es Abuelo/a de',
    shortLabel: '👴 Abuelo/a',
    description: 'Generación mayor (abuelo o abuela)',
    badge: '🧒 Nieto/a',
    badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
    activeBg: 'border-yellow-500 bg-yellow-500/20 shadow-yellow-500/20',
    group: 'direct',
  },
  {
    id: 'parent',
    label: '👨‍👩‍👧 Es Padre/Madre de',
    shortLabel: '👨‍👩‍👧 Padre/Madre',
    description: 'Progenitor(a) directo',
    badge: '👶 Hijo/a',
    badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    activeBg: 'border-purple-500 bg-purple-500/20 shadow-purple-500/20',
    group: 'direct',
  },
  {
    id: 'partner',
    label: '💍 Es Pareja de',
    shortLabel: '💍 Pareja',
    description: 'Cónyuge o pareja (1 o más)',
    badge: '💍 Pareja',
    badgeClass: 'bg-pink-500/20 text-pink-200 border-pink-500/40',
    activeBg: 'border-pink-500 bg-pink-500/20 shadow-pink-500/20',
    group: 'direct',
  },
  {
    id: 'sibling',
    label: '👥 Es Hermano/a de',
    shortLabel: '👥 Hermano/a',
    description: 'Hermano o hermana',
    badge: '👥 Hermano/a',
    badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-500/40',
    activeBg: 'border-sky-500 bg-sky-500/20 shadow-sky-500/20',
    group: 'direct',
  },
  {
    id: 'child',
    label: '👶 Es Hijo/a de',
    shortLabel: '👶 Hijo/a',
    description: 'Descendencia directa',
    badge: '👨‍👩‍👧 Padre/Madre',
    badgeClass: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
    activeBg: 'border-amber-500 bg-amber-500/20 shadow-amber-500/20',
    group: 'direct',
  },
  {
    id: 'grandchild',
    label: '🧒 Es Nieto/a de',
    shortLabel: '🧒 Nieto/a',
    description: 'Hijo/a de un hijo/a',
    badge: '👴 Abuelo/a',
    badgeClass: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
    activeBg: 'border-rose-500 bg-rose-500/20 shadow-rose-500/20',
    group: 'direct',
  },
  // Extended blood family
  {
    id: 'uncle_aunt',
    label: '🧓 Es Tío/a de',
    shortLabel: '🧓 Tío/a',
    description: 'Hermano/a de padre o madre',
    badge: '🧸 Sobrino/a',
    badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40',
    activeBg: 'border-emerald-500 bg-emerald-500/20 shadow-emerald-500/20',
    group: 'extended',
  },
  {
    id: 'niece_nephew',
    label: '🧸 Es Sobrino/a de',
    shortLabel: '🧸 Sobrino/a',
    description: 'Hijo/a de hermano/a',
    badge: '🧓 Tío/a',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
    activeBg: 'border-indigo-500 bg-indigo-500/20 shadow-indigo-500/20',
    group: 'extended',
  },
  {
    id: 'cousin',
    label: '🫂 Es Primo/a de',
    shortLabel: '🫂 Primo/a',
    description: 'Primo o prima',
    badge: '🫂 Primo/a',
    badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
    activeBg: 'border-cyan-500 bg-cyan-500/20 shadow-cyan-500/20',
    group: 'extended',
  },
  // Political family (In-laws)
  {
    id: 'parent_in_law',
    label: '🏛️ Es Suegro/a de',
    shortLabel: '🏛️ Suegro/a',
    description: 'Padre/Madre de la pareja',
    badge: '💐 Yerno/Nuera',
    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/40',
    activeBg: 'border-violet-500 bg-violet-500/20 shadow-violet-500/20',
    group: 'political',
  },
  {
    id: 'child_in_law',
    label: '💐 Es Yerno/Nuera de',
    shortLabel: '💐 Yerno/Nuera',
    description: 'Pareja de un hijo/a',
    badge: '🏛️ Suegro/a',
    badgeClass: 'bg-violet-500/20 text-violet-200 border-violet-500/40',
    activeBg: 'border-fuchsia-500 bg-fuchsia-500/20 shadow-fuchsia-500/20',
    group: 'political',
  },
  {
    id: 'in_law',
    label: '🤝 Es Cuñado/a de',
    shortLabel: '🤝 Cuñado/a',
    description: 'Hermano/a de pareja o pareja de hermano/a',
    badge: '🤝 Cuñado/a',
    badgeClass: 'bg-teal-500/20 text-teal-200 border-teal-500/40',
    activeBg: 'border-teal-500 bg-teal-500/20 shadow-teal-500/20',
    group: 'political',
  },
];

export const VALID_RELATIONSHIPS = new Set<string>(RELATIONSHIP_OPTIONS.map(r => r.id));

export function isValidRelationship(rel: unknown): rel is RelationshipType {
  return typeof rel === 'string' && VALID_RELATIONSHIPS.has(rel);
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  grandparent: 'abuelo/a',
  parent: 'padre/madre',
  partner: 'pareja',
  sibling: 'hermano/a',
  child: 'hijo/a',
  grandchild: 'nieto/a',
  uncle_aunt: 'tío/a',
  niece_nephew: 'sobrino/a',
  cousin: 'primo/a',
  parent_in_law: 'suegro/a',
  child_in_law: 'yerno/nuera',
  in_law: 'cuñado/a',
};

export interface AgeValidationResult {
  valid: boolean;
  error?: string;
  suggestedRelationship?: RelationshipType;
  suggestedLabel?: string;
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const MIN_PARENT_GAP = 12;
const MAX_PARENT_GAP = 55;
const SENIOR_AGE = 60;
const SENIOR_GRANDPARENT_GAP = 50;
const MIN_GRANDPARENT_GAP = 28;

function parseDateSafe(ds?: string | null): Date | null {
  if (!ds) return null;
  const d = new Date(ds);
  return isNaN(d.getTime()) ? null : d;
}

function getAgeYears(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return Math.max(0, age);
}

/**
 * Validates biological/generational age consistency for a proposed family link:
 *   `personA` is `<relationship>` of `personB`.
 *
 * Key rules:
 * - Parent/Child: parent must be at least 12 years older and at most 55 years older
 *   (and a 60+ senior cannot be parent of someone >= 50 years younger — must be Grandparent/Grandchild).
 * - Grandparent/Grandchild: grandparent must be at least 28 years older.
 * - Parent-in-law/Child-in-law: parent-in-law must be at least 12 years older.
 */
export function validateRelationshipAges(
  personA: { name: string; birthDate?: string | null },
  relationship: RelationshipType,
  personB: { name: string; birthDate?: string | null }
): AgeValidationResult {
  const dateA = parseDateSafe(personA.birthDate);
  const dateB = parseDateSafe(personB.birthDate);
  if (!dateA || !dateB) return { valid: true };

  const ageA = getAgeYears(dateA);
  const ageB = getAgeYears(dateB);
  // Positive when A is older than B (B was born after A)
  const aOlderThanB = (dateB.getTime() - dateA.getTime()) / MS_PER_YEAR;
  const bOlderThanA = -aOlderThanB;

  if (relationship === 'parent') {
    if (aOlderThanB < MIN_PARENT_GAP) {
      if (bOlderThanA > MAX_PARENT_GAP || (ageB >= SENIOR_AGE && bOlderThanA >= SENIOR_GRANDPARENT_GAP)) {
        return {
          valid: false,
          error: `${personA.name} (${ageA} años) es menor que ${personB.name} (${ageB} años) por ${Math.round(bOlderThanA)} años. No puede ser su Padre/Madre; corresponde el vínculo de Nieto/a.`,
          suggestedRelationship: 'grandchild',
          suggestedLabel: '🧒 Es Nieto/a de',
        };
      }
      if (bOlderThanA >= MIN_PARENT_GAP) {
        return {
          valid: false,
          error: `${personA.name} (${ageA} años) es menor que ${personB.name} (${ageB} años) y no puede ser su Padre/Madre. ¿Quisiste indicar que es Hijo/a?`,
          suggestedRelationship: 'child',
          suggestedLabel: '👶 Es Hijo/a de',
        };
      }
      return {
        valid: false,
        error: `Inconsistencia de edad: ${personA.name} (${ageA} años) debe ser al menos ${MIN_PARENT_GAP} años mayor que ${personB.name} (${ageB} años) para ser su Padre/Madre.`,
      };
    }

    if (aOlderThanB > MAX_PARENT_GAP || (ageA >= SENIOR_AGE && aOlderThanB >= SENIOR_GRANDPARENT_GAP)) {
      return {
        valid: false,
        error: `Inconsistencia generacional: ${personA.name} (${ageA} años) le lleva ${Math.round(aOlderThanB)} años a ${personB.name} (${ageB} años) y no puede ser su Padre/Madre; debe vincularse como Abuelo/a.`,
        suggestedRelationship: 'grandparent',
        suggestedLabel: '👴 Es Abuelo/a de',
      };
    }
  }

  if (relationship === 'child') {
    if (bOlderThanA < MIN_PARENT_GAP) {
      if (aOlderThanB > MAX_PARENT_GAP || (ageA >= SENIOR_AGE && aOlderThanB >= SENIOR_GRANDPARENT_GAP)) {
        return {
          valid: false,
          error: `${personA.name} (${ageA} años) es mayor que ${personB.name} (${ageB} años) por ${Math.round(aOlderThanB)} años. No puede ser su Hijo/a; corresponde el vínculo de Abuelo/a.`,
          suggestedRelationship: 'grandparent',
          suggestedLabel: '👴 Es Abuelo/a de',
        };
      }
      if (aOlderThanB >= MIN_PARENT_GAP) {
        return {
          valid: false,
          error: `${personA.name} (${ageA} años) es mayor que ${personB.name} (${ageB} años) y no puede ser su Hijo/a. ¿Quisiste indicar que es Padre/Madre?`,
          suggestedRelationship: 'parent',
          suggestedLabel: '👨‍👩‍👧 Es Padre/Madre de',
        };
      }
      return {
        valid: false,
        error: `Inconsistencia de edad: ${personB.name} (${ageB} años) debe ser al menos ${MIN_PARENT_GAP} años mayor que ${personA.name} (${ageA} años) para ser su Padre/Madre.`,
      };
    }

    if (bOlderThanA > MAX_PARENT_GAP || (ageB >= SENIOR_AGE && bOlderThanA >= SENIOR_GRANDPARENT_GAP)) {
      return {
        valid: false,
        error: `Inconsistencia generacional: ${personB.name} (${ageB} años) le lleva ${Math.round(bOlderThanA)} años a ${personA.name} (${ageA} años) y no puede ser su Padre/Madre; ${personA.name} debe vincularse como Nieto/a.`,
        suggestedRelationship: 'grandchild',
        suggestedLabel: '🧒 Es Nieto/a de',
      };
    }
  }

  if (relationship === 'grandparent') {
    if (aOlderThanB < MIN_GRANDPARENT_GAP) {
      if (aOlderThanB >= MIN_PARENT_GAP) {
        return {
          valid: false,
          error: `${personA.name} (${ageA} años) solo le lleva ${Math.round(aOlderThanB)} años a ${personB.name} (${ageB} años) para ser Abuelo/a (mínimo ${MIN_GRANDPARENT_GAP} años). Corresponde Padre/Madre.`,
          suggestedRelationship: 'parent',
          suggestedLabel: '👨‍👩‍👧 Es Padre/Madre de',
        };
      }
      if (bOlderThanA >= MIN_GRANDPARENT_GAP) {
        return {
          valid: false,
          error: `${personA.name} (${ageA} años) es menor que ${personB.name} (${ageB} años). ¿Quisiste indicar que es Nieto/a?`,
          suggestedRelationship: 'grandchild',
          suggestedLabel: '🧒 Es Nieto/a de',
        };
      }
      return {
        valid: false,
        error: `Inconsistencia generacional: ${personA.name} (${ageA} años) debe ser al menos ${MIN_GRANDPARENT_GAP} años mayor que ${personB.name} (${ageB} años) para ser su Abuelo/a.`,
      };
    }
  }

  if (relationship === 'grandchild') {
    if (bOlderThanA < MIN_GRANDPARENT_GAP) {
      if (bOlderThanA >= MIN_PARENT_GAP) {
        return {
          valid: false,
          error: `${personB.name} (${ageB} años) solo le lleva ${Math.round(bOlderThanA)} años a ${personA.name} (${ageA} años) para ser Abuelo/a (mínimo ${MIN_GRANDPARENT_GAP} años). Corresponde Hijo/a.`,
          suggestedRelationship: 'child',
          suggestedLabel: '👶 Es Hijo/a de',
        };
      }
      if (aOlderThanB >= MIN_GRANDPARENT_GAP) {
        return {
          valid: false,
          error: `${personA.name} (${ageA} años) es mayor que ${personB.name} (${ageB} años). ¿Quisiste indicar que es Abuelo/a?`,
          suggestedRelationship: 'grandparent',
          suggestedLabel: '👴 Es Abuelo/a de',
        };
      }
      return {
        valid: false,
        error: `Inconsistencia generacional: ${personB.name} (${ageB} años) debe ser al menos ${MIN_GRANDPARENT_GAP} años mayor que ${personA.name} (${ageA} años) para ser Abuelo/a.`,
      };
    }
  }

  if (relationship === 'parent_in_law' && aOlderThanB < MIN_PARENT_GAP) {
    if (bOlderThanA >= MIN_PARENT_GAP) {
      return {
        valid: false,
        error: `${personA.name} (${ageA} años) es menor que ${personB.name} (${ageB} años). ¿Quisiste indicar que es Yerno/Nuera?`,
        suggestedRelationship: 'child_in_law',
        suggestedLabel: '💐 Es Yerno/Nuera de',
      };
    }
    return {
      valid: false,
      error: `Inconsistencia de edad: ${personA.name} (${ageA} años) debe ser al menos ${MIN_PARENT_GAP} años mayor que ${personB.name} (${ageB} años) para ser su Suegro/a.`,
    };
  }

  if (relationship === 'child_in_law' && bOlderThanA < MIN_PARENT_GAP) {
    if (aOlderThanB >= MIN_PARENT_GAP) {
      return {
        valid: false,
        error: `${personA.name} (${ageA} años) es mayor que ${personB.name} (${ageB} años). ¿Quisiste indicar que es Suegro/a?`,
        suggestedRelationship: 'parent_in_law',
        suggestedLabel: '🏛️ Es Suegro/a de',
      };
    }
    return {
      valid: false,
      error: `Inconsistencia de edad: ${personB.name} (${ageB} años) debe ser al menos ${MIN_PARENT_GAP} años mayor que ${personA.name} (${ageA} años) para ser su Suegro/a.`,
    };
  }

  return { valid: true };
}
