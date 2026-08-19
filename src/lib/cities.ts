export interface CityData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
}

export const CITIES: CityData[] = [
  { city: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036, tz: 'America/Caracas' },
  { city: 'Valencia', country: 'Venezuela', lat: 10.1627, lng: -68.0078, tz: 'America/Caracas' },
  { city: 'Maracaibo', country: 'Venezuela', lat: 10.6427, lng: -71.6225, tz: 'America/Caracas' },
  { city: 'Barquisimeto', country: 'Venezuela', lat: 10.0646, lng: -69.3568, tz: 'America/Caracas' },
  { city: 'Maracay', country: 'Venezuela', lat: 10.2468, lng: -67.5958, tz: 'America/Caracas' },
  { city: 'Mérida', country: 'Venezuela', lat: 8.5981, lng: -71.1406, tz: 'America/Caracas' },
  { city: 'Madrid', country: 'España', lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid' },
  { city: 'Barcelona', country: 'España', lat: 41.3874, lng: 2.1686, tz: 'Europe/Madrid' },
  { city: 'Valencia', country: 'España', lat: 39.4699, lng: -0.3763, tz: 'Europe/Madrid' },
  { city: 'Sevilla', country: 'España', lat: 37.3891, lng: -5.9845, tz: 'Europe/Madrid' },
  { city: 'Bogotá', country: 'Colombia', lat: 4.711, lng: -74.0721, tz: 'America/Bogota' },
  { city: 'Medellín', country: 'Colombia', lat: 6.2442, lng: -75.5812, tz: 'America/Bogota' },
  { city: 'Cali', country: 'Colombia', lat: 3.4516, lng: -76.532, tz: 'America/Bogota' },
  { city: 'Ciudad de México', country: 'México', lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City' },
  { city: 'Guadalajara', country: 'México', lat: 20.6597, lng: -103.3496, tz: 'America/Mexico_City' },
  { city: 'Monterrey', country: 'México', lat: 25.6866, lng: -100.3161, tz: 'America/Monterrey' },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, tz: 'America/Buenos_Aires' },
  { city: 'Córdoba', country: 'Argentina', lat: -31.4201, lng: -64.1888, tz: 'America/Argentina/Cordoba' },
  { city: 'Rosario', country: 'Argentina', lat: -32.9468, lng: -60.6393, tz: 'America/Argentina/Cordoba' },
  { city: 'Lima', country: 'Perú', lat: -12.0464, lng: -77.0428, tz: 'America/Lima' },
  { city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, tz: 'America/Santiago' },
  { city: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127, tz: 'America/Santiago' },
  { city: 'New York', country: 'Estados Unidos', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  { city: 'Miami', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918, tz: 'America/New_York' },
  { city: 'Los Ángeles', country: 'Estados Unidos', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
  { city: 'San Juan', country: 'Puerto Rico', lat: 18.4655, lng: -66.1057, tz: 'America/Puerto_Rico' },
  { city: 'Santo Domingo', country: 'República Dominicana', lat: 18.4861, lng: -69.9312, tz: 'America/Santo_Domingo' },
  { city: 'La Habana', country: 'Cuba', lat: 23.1136, lng: -82.3666, tz: 'America/Havana' },
  { city: 'Quito', country: 'Ecuador', lat: -0.1807, lng: -78.4678, tz: 'America/Guayaquil' },
  { city: 'San José', country: 'Costa Rica', lat: 9.9281, lng: -84.0907, tz: 'America/Costa_Rica' },
  { city: 'Panamá', country: 'Panamá', lat: 8.9824, lng: -79.5199, tz: 'America/Panama' },
  { city: 'Managua', country: 'Nicaragua', lat: 12.1148, lng: -86.2362, tz: 'America/Managua' },
  { city: 'San Salvador', country: 'El Salvador', lat: 13.6989, lng: -89.1914, tz: 'America/El_Salvador' },
  { city: 'Tegucigalpa', country: 'Honduras', lat: 14.0723, lng: -87.1921, tz: 'America/Tegucigalpa' },
  { city: 'Guatemala', country: 'Guatemala', lat: 14.6349, lng: -90.5069, tz: 'America/Guatemala' },
  { city: 'Lisboa', country: 'Portugal', lat: 38.7223, lng: -9.1393, tz: 'Europe/Lisbon' },
  { city: 'Roma', country: 'Italia', lat: 41.9028, lng: 12.4964, tz: 'Europe/Rome' },
  { city: 'París', country: 'Francia', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
  { city: 'Londres', country: 'Reino Unido', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
];

export function searchCities(query: string): CityData[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return CITIES.filter(c =>
    c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  ).slice(0, 10);
}