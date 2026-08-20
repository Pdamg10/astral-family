export interface CityData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
}

export const CITIES: CityData[] = [
  // ═══════════════════════════════════════════════
  // VENEZUELA (30 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036, tz: 'America/Caracas' },
  { city: 'Valencia', country: 'Venezuela', lat: 10.1627, lng: -68.0078, tz: 'America/Caracas' },
  { city: 'Maracaibo', country: 'Venezuela', lat: 10.6427, lng: -71.6225, tz: 'America/Caracas' },
  { city: 'Barquisimeto', country: 'Venezuela', lat: 10.0646, lng: -69.3568, tz: 'America/Caracas' },
  { city: 'Maracay', country: 'Venezuela', lat: 10.2468, lng: -67.5958, tz: 'America/Caracas' },
  { city: 'Mérida', country: 'Venezuela', lat: 8.5981, lng: -71.1406, tz: 'America/Caracas' },
  { city: 'Ciudad Guayana', country: 'Venezuela', lat: 8.3512, lng: -62.6414, tz: 'America/Caracas' },
  { city: 'Puerto Ordaz', country: 'Venezuela', lat: 8.2833, lng: -62.75, tz: 'America/Caracas' },
  { city: 'San Félix', country: 'Venezuela', lat: 8.3333, lng: -62.6667, tz: 'America/Caracas' },
  { city: 'Punto Fijo', country: 'Venezuela', lat: 11.6833, lng: -70.1833, tz: 'America/Caracas' },
  { city: 'Coro', country: 'Venezuela', lat: 11.4044, lng: -69.6731, tz: 'America/Caracas' },
  { city: 'Barinas', country: 'Venezuela', lat: 8.6236, lng: -70.2186, tz: 'America/Caracas' },
  { city: 'Maturín', country: 'Venezuela', lat: 9.7457, lng: -63.1831, tz: 'America/Caracas' },
  { city: 'Cumaná', country: 'Venezuela', lat: 10.4597, lng: -64.1753, tz: 'America/Caracas' },
  { city: 'Puerto La Cruz', country: 'Venezuela', lat: 10.2167, lng: -64.6333, tz: 'America/Caracas' },
  { city: 'San Cristóbal', country: 'Venezuela', lat: 7.7646, lng: -72.2297, tz: 'America/Caracas' },
  { city: 'Trujillo', country: 'Venezuela', lat: 9.3667, lng: -70.4333, tz: 'America/Caracas' },
  { city: 'Turmero', country: 'Venezuela', lat: 10.2294, lng: -67.2925, tz: 'America/Caracas' },
  { city: 'La Victoria', country: 'Venezuela', lat: 10.2306, lng: -67.3314, tz: 'America/Caracas' },
  { city: 'Guatire', country: 'Venezuela', lat: 10.4681, lng: -66.5308, tz: 'America/Caracas' },
  { city: 'Guarenas', country: 'Venezuela', lat: 10.4689, lng: -66.6264, tz: 'America/Caracas' },
  { city: 'Los Teques', country: 'Venezuela', lat: 10.3453, lng: -66.8825, tz: 'America/Caracas' },
  { city: 'Petare', country: 'Venezuela', lat: 10.4725, lng: -66.8164, tz: 'America/Caracas' },
  { city: 'Ciudad Bolívar', country: 'Venezuela', lat: 8.1292, lng: -63.5408, tz: 'America/Caracas' },
  { city: 'El Tigre', country: 'Venezuela', lat: 8.8883, lng: -64.2567, tz: 'America/Caracas' },
  { city: 'San Felipe', country: 'Venezuela', lat: 10.3397, lng: -68.7456, tz: 'America/Caracas' },
  { city: 'La Grita', country: 'Venezuela', lat: 7.8186, lng: -72.0192, tz: 'America/Caracas' },
  { city: 'Tucupita', country: 'Venezuela', lat: 9.0744, lng: -61.5817, tz: 'America/Caracas' },
  { city: 'Porlamar', country: 'Venezuela', lat: 10.9578, lng: -63.9519, tz: 'America/Caracas' },
  { city: 'Acarigua', country: 'Venezuela', lat: 9.555, lng: -69.2356, tz: 'America/Caracas' },

  // ═══════════════════════════════════════════════
  // ESPAÑA (18 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Madrid', country: 'España', lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid' },
  { city: 'Barcelona', country: 'España', lat: 41.3874, lng: 2.1686, tz: 'Europe/Madrid' },
  { city: 'Valencia', country: 'España', lat: 39.4699, lng: -0.3763, tz: 'Europe/Madrid' },
  { city: 'Sevilla', country: 'España', lat: 37.3891, lng: -5.9845, tz: 'Europe/Madrid' },
  { city: 'Málaga', country: 'España', lat: 36.7213, lng: -4.4214, tz: 'Europe/Madrid' },
  { city: 'Bilbao', country: 'España', lat: 43.263, lng: -2.935, tz: 'Europe/Madrid' },
  { city: 'Zaragoza', country: 'España', lat: 41.6488, lng: -0.8891, tz: 'Europe/Madrid' },
  { city: 'Alicante', country: 'España', lat: 38.3452, lng: -0.4815, tz: 'Europe/Madrid' },
  { city: 'Palma de Mallorca', country: 'España', lat: 39.6953, lng: 2.7505, tz: 'Europe/Madrid' },
  { city: 'Las Palmas de Gran Canaria', country: 'España', lat: 28.1235, lng: -15.4363, tz: 'Atlantic/Canary' },
  { city: 'Santa Cruz de Tenerife', country: 'España', lat: 28.4636, lng: -16.2518, tz: 'Atlantic/Canary' },
  { city: 'Murcia', country: 'España', lat: 37.987, lng: -1.1303, tz: 'Europe/Madrid' },
  { city: 'Cádiz', country: 'España', lat: 36.5267, lng: -6.2884, tz: 'Europe/Madrid' },
  { city: 'Granada', country: 'España', lat: 37.1773, lng: -3.5986, tz: 'Europe/Madrid' },
  { city: 'Vigo', country: 'España', lat: 42.2328, lng: -8.7226, tz: 'Europe/Madrid' },
  { city: 'Gijón', country: 'España', lat: 43.5322, lng: -5.6611, tz: 'Europe/Madrid' },
  { city: 'A Coruña', country: 'España', lat: 43.3688, lng: -8.396, tz: 'Europe/Madrid' },
  { city: 'Valencia de Alcántara', country: 'España', lat: 39.8, lng: -7.35, tz: 'Europe/Madrid' },

  // ═══════════════════════════════════════════════
  // COLOMBIA (10 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Bogotá', country: 'Colombia', lat: 4.711, lng: -74.0721, tz: 'America/Bogota' },
  { city: 'Medellín', country: 'Colombia', lat: 6.2442, lng: -75.5812, tz: 'America/Bogota' },
  { city: 'Cali', country: 'Colombia', lat: 3.4516, lng: -76.532, tz: 'America/Bogota' },
  { city: 'Barranquilla', country: 'Colombia', lat: 10.9685, lng: -74.7813, tz: 'America/Bogota' },
  { city: 'Cartagena', country: 'Colombia', lat: 10.391, lng: -75.5364, tz: 'America/Bogota' },
  { city: 'Bucaramanga', country: 'Colombia', lat: 7.1254, lng: -73.1198, tz: 'America/Bogota' },
  { city: 'Santa Marta', country: 'Colombia', lat: 11.2408, lng: -74.199, tz: 'America/Bogota' },
  { city: 'Pereira', country: 'Colombia', lat: 4.8133, lng: -75.6961, tz: 'America/Bogota' },
  { city: 'Manizales', country: 'Colombia', lat: 5.0689, lng: -75.5174, tz: 'America/Bogota' },
  { city: 'Ibagué', country: 'Colombia', lat: 4.4388, lng: -75.2322, tz: 'America/Bogota' },

  // ═══════════════════════════════════════════════
  // MÉXICO (12 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Ciudad de México', country: 'México', lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City' },
  { city: 'Guadalajara', country: 'México', lat: 20.6597, lng: -103.3496, tz: 'America/Mexico_City' },
  { city: 'Monterrey', country: 'México', lat: 25.6866, lng: -100.3161, tz: 'America/Monterrey' },
  { city: 'Puebla', country: 'México', lat: 19.0414, lng: -98.2063, tz: 'America/Mexico_City' },
  { city: 'Cancún', country: 'México', lat: 21.1619, lng: -86.8515, tz: 'America/Cancun' },
  { city: 'Tijuana', country: 'México', lat: 32.5149, lng: -117.0382, tz: 'America/Tijuana' },
  { city: 'León', country: 'México', lat: 21.1167, lng: -101.6819, tz: 'America/Mexico_City' },
  { city: 'Mérida', country: 'México', lat: 20.9674, lng: -89.5926, tz: 'America/Merida' },
  { city: 'Querétaro', country: 'México', lat: 20.5888, lng: -100.3881, tz: 'America/Mexico_City' },
  { city: 'Veracruz', country: 'México', lat: 19.1738, lng: -96.1342, tz: 'America/Mexico_City' },
  { city: 'Aguascalientes', country: 'México', lat: 21.8853, lng: -102.2916, tz: 'America/Mexico_City' },
  { city: 'Oaxaca', country: 'México', lat: 17.0732, lng: -96.7266, tz: 'America/Mexico_City' },

  // ═══════════════════════════════════════════════
  // ARGENTINA (10 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Córdoba', country: 'Argentina', lat: -31.4201, lng: -64.1888, tz: 'America/Argentina/Cordoba' },
  { city: 'Rosario', country: 'Argentina', lat: -32.9468, lng: -60.6393, tz: 'America/Argentina/Cordoba' },
  { city: 'Mendoza', country: 'Argentina', lat: -32.8895, lng: -68.8458, tz: 'America/Argentina/Mendoza' },
  { city: 'La Plata', country: 'Argentina', lat: -34.9214, lng: -57.9545, tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Tucumán', country: 'Argentina', lat: -26.8241, lng: -65.2226, tz: 'America/Argentina/Tucuman' },
  { city: 'Mar del Plata', country: 'Argentina', lat: -38.0014, lng: -57.5576, tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Salta', country: 'Argentina', lat: -24.7829, lng: -65.4232, tz: 'America/Argentina/Salta' },
  { city: 'Santa Fe', country: 'Argentina', lat: -31.624, lng: -60.6956, tz: 'America/Argentina/Cordoba' },
  { city: 'Corrientes', country: 'Argentina', lat: -27.4806, lng: -58.8341, tz: 'America/Argentina/Cordoba' },

  // ═══════════════════════════════════════════════
  // CENTROAMÉRICA Y CARIBE (14 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Lima', country: 'Perú', lat: -12.0464, lng: -77.0428, tz: 'America/Lima' },
  { city: 'Cusco', country: 'Perú', lat: -13.532, lng: -71.9675, tz: 'America/Lima' },
  { city: 'Arequipa', country: 'Perú', lat: -16.409, lng: -71.5375, tz: 'America/Lima' },
  { city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, tz: 'America/Santiago' },
  { city: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127, tz: 'America/Santiago' },
  { city: 'Concepción', country: 'Chile', lat: -36.827, lng: -73.0498, tz: 'America/Santiago' },
  { city: 'Panamá', country: 'Panamá', lat: 8.9824, lng: -79.5199, tz: 'America/Panama' },
  { city: 'San José', country: 'Costa Rica', lat: 9.9281, lng: -84.0907, tz: 'America/Costa_Rica' },
  { city: 'Quito', country: 'Ecuador', lat: -0.1807, lng: -78.4678, tz: 'America/Guayaquil' },
  { city: 'Guayaquil', country: 'Ecuador', lat: -2.1708, lng: -79.9225, tz: 'America/Guayaquil' },
  { city: 'La Habana', country: 'Cuba', lat: 23.1136, lng: -82.3666, tz: 'America/Havana' },
  { city: 'Santo Domingo', country: 'República Dominicana', lat: 18.4861, lng: -69.9312, tz: 'America/Santo_Domingo' },
  { city: 'San Juan', country: 'Puerto Rico', lat: 18.4655, lng: -66.1057, tz: 'America/Puerto_Rico' },
  { city: 'Managua', country: 'Nicaragua', lat: 12.1148, lng: -86.2362, tz: 'America/Managua' },
  { city: 'San Salvador', country: 'El Salvador', lat: 13.6989, lng: -89.1914, tz: 'America/El_Salvador' },
  { city: 'Tegucigalpa', country: 'Honduras', lat: 14.0723, lng: -87.1921, tz: 'America/Tegucigalpa' },
  { city: 'Guatemala', country: 'Guatemala', lat: 14.6349, lng: -90.5069, tz: 'America/Guatemala' },

  // ═══════════════════════════════════════════════
  // ESTADOS UNIDOS (10 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'New York', country: 'Estados Unidos', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  { city: 'Miami', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918, tz: 'America/New_York' },
  { city: 'Los Ángeles', country: 'Estados Unidos', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
  { city: 'Houston', country: 'Estados Unidos', lat: 29.7604, lng: -95.3698, tz: 'America/Chicago' },
  { city: 'Chicago', country: 'Estados Unidos', lat: 41.8781, lng: -87.6298, tz: 'America/Chicago' },
  { city: 'Orlando', country: 'Estados Unidos', lat: 28.5383, lng: -81.3792, tz: 'America/New_York' },
  { city: 'San Francisco', country: 'Estados Unidos', lat: 37.7749, lng: -122.4194, tz: 'America/Los_Angeles' },
  { city: 'Dallas', country: 'Estados Unidos', lat: 32.7767, lng: -96.797, tz: 'America/Chicago' },
  { city: 'Atlanta', country: 'Estados Unidos', lat: 33.749, lng: -84.388, tz: 'America/New_York' },
  { city: 'Tampa', country: 'Estados Unidos', lat: 27.9506, lng: -82.4572, tz: 'America/New_York' },

  // ═══════════════════════════════════════════════
  // EUROPA (12 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Lisboa', country: 'Portugal', lat: 38.7223, lng: -9.1393, tz: 'Europe/Lisbon' },
  { city: 'Oporto', country: 'Portugal', lat: 41.1579, lng: -8.6291, tz: 'Europe/Lisbon' },
  { city: 'Roma', country: 'Italia', lat: 41.9028, lng: 12.4964, tz: 'Europe/Rome' },
  { city: 'Milán', country: 'Italia', lat: 45.4642, lng: 9.19, tz: 'Europe/Rome' },
  { city: 'Nápoles', country: 'Italia', lat: 40.8518, lng: 14.2681, tz: 'Europe/Rome' },
  { city: 'París', country: 'Francia', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
  { city: 'Londres', country: 'Reino Unido', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { city: 'Dublín', country: 'Irlanda', lat: 53.3498, lng: -6.2603, tz: 'Europe/Dublin' },
  { city: 'Berlín', country: 'Alemania', lat: 52.52, lng: 13.405, tz: 'Europe/Berlin' },
  { city: 'Ámsterdam', country: 'Países Bajos', lat: 52.3676, lng: 4.9041, tz: 'Europe/Amsterdam' },
  { city: 'Zúrich', country: 'Suiza', lat: 47.3769, lng: 8.5417, tz: 'Europe/Zurich' },
  { city: 'Viena', country: 'Austria', lat: 48.2082, lng: 16.3738, tz: 'Europe/Vienna' },
];

export function searchCities(query: string): CityData[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return CITIES.filter(c =>
    c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  ).slice(0, 10);
}