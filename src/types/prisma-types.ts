// Prisma-generated types for frontend use

export interface BirthProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string | null;
  timeUnknown: boolean;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  createdBy: string;
  parentId?: string | null;
  parent2Id?: string | null;
  partnerId?: string | null;
  siblingId?: string | null;
  isCalculated: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: { id: string; name: string; birthDate?: string } | null;
  parent2?: { id: string; name: string; birthDate?: string } | null;
  partner?: { id: string; name: string; birthDate?: string } | null;
  partnerOf?: { id: string; name: string; birthDate?: string }[];
  sibling?: { id: string; name: string; birthDate?: string } | null;
  siblingOf?: { id: string; name: string; birthDate?: string }[];
  siblings?: { id: string; name: string; birthDate?: string }[];
  inLaws?: { id: string; name: string; birthDate?: string }[];
  unclesAunts?: { id: string; name: string; birthDate?: string }[];
  niecesNephews?: { id: string; name: string; birthDate?: string }[];
  grandparents?: { id: string; name: string; birthDate?: string }[];
  grandchildren?: { id: string; name: string; birthDate?: string }[];
  cousins?: { id: string; name: string; birthDate?: string }[];
  parentsInLaw?: { id: string; name: string; birthDate?: string }[];
  childrenInLaw?: { id: string; name: string; birthDate?: string }[];
  children1?: { id: string; name: string; birthDate?: string }[];
  children2?: { id: string; name: string; birthDate?: string }[];
  children?: { id: string; name: string; birthDate?: string }[];
  planetaryPositions: PlanetaryPosition[];
  houses: House[];
  aspects: Aspect[];
  chartPoints: ChartPoint[];
  creator: { id: string; name: string };
}

export interface PlanetaryPosition {
  id: string;
  birthProfileId: string;
  body: string;
  sign: string;
  degree: number;
  minute: number;
  retrograde: boolean;
  house: number | null;
}

export interface House {
  id: string;
  birthProfileId: string;
  houseNumber: number;
  sign: string;
  degree: number;
  minute: number;
}

export interface Aspect {
  id: string;
  birthProfileId: string;
  body1: string;
  body2: string;
  type: string;
  angle: number;
  orb: number;
  degree1: number;
  degree2: number;
}

export interface ChartPoint {
  id: string;
  birthProfileId: string;
  point: string;
  sign: string;
  degree: number;
  minute: number;
  house: number | null;
}

export interface ThemeSettings {
  id: string;
  userId: string;
  themeType: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundType: string;
  backgroundColor: string | null;
  backgroundImage?: string | null;
  gradientColors: string;
  cardOpacity: number;
  borderRadius: number;
  shadowIntensity: number;
  textSize: string;
  infoDensity: string;
}
