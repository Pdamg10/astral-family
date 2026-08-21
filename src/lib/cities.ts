export interface CityData {
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
}

export const CITIES: CityData[] = [
  // ═══════════════════════════════════════════════
  // VENEZUELA (35 ciudades y pueblos)
  // ═══════════════════════════════════════════════
  { city: 'El Callao', state: 'Bolívar', country: 'Venezuela', lat: 7.3500, lng: -61.8167, tz: 'America/Caracas' },
  { city: 'Ciudad Guayana', state: 'Bolívar', country: 'Venezuela', lat: 8.3512, lng: -62.6414, tz: 'America/Caracas' },
  { city: 'Puerto Ordaz', state: 'Bolívar', country: 'Venezuela', lat: 8.2833, lng: -62.7500, tz: 'America/Caracas' },
  { city: 'San Félix', state: 'Bolívar', country: 'Venezuela', lat: 8.3333, lng: -62.6667, tz: 'America/Caracas' },
  { city: 'Ciudad Bolívar', state: 'Bolívar', country: 'Venezuela', lat: 8.1292, lng: -63.5408, tz: 'America/Caracas' },
  { city: 'Upata', state: 'Bolívar', country: 'Venezuela', lat: 8.0086, lng: -62.3989, tz: 'America/Caracas' },
  { city: 'Guasipati', state: 'Bolívar', country: 'Venezuela', lat: 7.4667, lng: -61.9000, tz: 'America/Caracas' },
  { city: 'Tumeremo', state: 'Bolívar', country: 'Venezuela', lat: 7.2978, lng: -61.5056, tz: 'America/Caracas' },
  { city: 'Santa Elena de Uairén', state: 'Bolívar', country: 'Venezuela', lat: 4.6025, lng: -61.1097, tz: 'America/Caracas' },
  { city: 'Caracas', state: 'Distrito Capital', country: 'Venezuela', lat: 10.4806, lng: -66.9036, tz: 'America/Caracas' },
  { city: 'Valencia', state: 'Carabobo', country: 'Venezuela', lat: 10.1627, lng: -68.0078, tz: 'America/Caracas' },
  { city: 'Maracaibo', state: 'Zulia', country: 'Venezuela', lat: 10.6427, lng: -71.6225, tz: 'America/Caracas' },
  { city: 'Cabimas', state: 'Zulia', country: 'Venezuela', lat: 10.4000, lng: -71.4500, tz: 'America/Caracas' },
  { city: 'Ciudad Ojeda', state: 'Zulia', country: 'Venezuela', lat: 10.2000, lng: -71.3000, tz: 'America/Caracas' },
  { city: 'Barquisimeto', state: 'Lara', country: 'Venezuela', lat: 10.0646, lng: -69.3568, tz: 'America/Caracas' },
  { city: 'Maracay', state: 'Aragua', country: 'Venezuela', lat: 10.2468, lng: -67.5958, tz: 'America/Caracas' },
  { city: 'Turmero', state: 'Aragua', country: 'Venezuela', lat: 10.2294, lng: -67.2925, tz: 'America/Caracas' },
  { city: 'La Victoria', state: 'Aragua', country: 'Venezuela', lat: 10.2306, lng: -67.3314, tz: 'America/Caracas' },
  { city: 'Mérida', state: 'Mérida', country: 'Venezuela', lat: 8.5981, lng: -71.1406, tz: 'America/Caracas' },
  { city: 'El Vigía', state: 'Mérida', country: 'Venezuela', lat: 8.6236, lng: -71.6506, tz: 'America/Caracas' },
  { city: 'Punto Fijo', state: 'Falcón', country: 'Venezuela', lat: 11.6833, lng: -70.1833, tz: 'America/Caracas' },
  { city: 'Coro', state: 'Falcón', country: 'Venezuela', lat: 11.4044, lng: -69.6731, tz: 'America/Caracas' },
  { city: 'Barinas', state: 'Barinas', country: 'Venezuela', lat: 8.6236, lng: -70.2186, tz: 'America/Caracas' },
  { city: 'Maturín', state: 'Monagas', country: 'Venezuela', lat: 9.7457, lng: -63.1831, tz: 'America/Caracas' },
  { city: 'Cumaná', state: 'Sucre', country: 'Venezuela', lat: 10.4597, lng: -64.1753, tz: 'America/Caracas' },
  { city: 'Carúpano', state: 'Sucre', country: 'Venezuela', lat: 10.6678, lng: -63.2585, tz: 'America/Caracas' },
  { city: 'Puerto La Cruz', state: 'Anzoátegui', country: 'Venezuela', lat: 10.2167, lng: -64.6333, tz: 'America/Caracas' },
  { city: 'Barcelona', state: 'Anzoátegui', country: 'Venezuela', lat: 10.1333, lng: -64.7000, tz: 'America/Caracas' },
  { city: 'El Tigre', state: 'Anzoátegui', country: 'Venezuela', lat: 8.8883, lng: -64.2567, tz: 'America/Caracas' },
  { city: 'San Cristóbal', state: 'Táchira', country: 'Venezuela', lat: 7.7646, lng: -72.2297, tz: 'America/Caracas' },
  { city: 'La Grita', state: 'Táchira', country: 'Venezuela', lat: 7.8186, lng: -72.0192, tz: 'America/Caracas' },
  { city: 'Trujillo', state: 'Trujillo', country: 'Venezuela', lat: 9.3667, lng: -70.4333, tz: 'America/Caracas' },
  { city: 'Valera', state: 'Trujillo', country: 'Venezuela', lat: 9.3178, lng: -70.6036, tz: 'America/Caracas' },
  { city: 'Guatire', state: 'Miranda', country: 'Venezuela', lat: 10.4681, lng: -66.5308, tz: 'America/Caracas' },
  { city: 'Guarenas', state: 'Miranda', country: 'Venezuela', lat: 10.4689, lng: -66.6264, tz: 'America/Caracas' },
  { city: 'Los Teques', state: 'Miranda', country: 'Venezuela', lat: 10.3453, lng: -66.8825, tz: 'America/Caracas' },
  { city: 'Petare', state: 'Miranda', country: 'Venezuela', lat: 10.4725, lng: -66.8164, tz: 'America/Caracas' },
  { city: 'San Felipe', state: 'Yaracuy', country: 'Venezuela', lat: 10.3397, lng: -68.7456, tz: 'America/Caracas' },
  { city: 'Tucupita', state: 'Delta Amacuro', country: 'Venezuela', lat: 9.0744, lng: -61.5817, tz: 'America/Caracas' },
  { city: 'Porlamar', state: 'Nueva Esparta', country: 'Venezuela', lat: 10.9578, lng: -63.9519, tz: 'America/Caracas' },
  { city: 'Acarigua', state: 'Portuguesa', country: 'Venezuela', lat: 9.5550, lng: -69.2356, tz: 'America/Caracas' },
  { city: 'Guanare', state: 'Portuguesa', country: 'Venezuela', lat: 9.0439, lng: -69.7422, tz: 'America/Caracas' },
  { city: 'San Fernando de Apure', state: 'Apure', country: 'Venezuela', lat: 7.8939, lng: -67.4722, tz: 'America/Caracas' },
  { city: 'Puerto Ayacucho', state: 'Amazonas', country: 'Venezuela', lat: 5.6603, lng: -67.6236, tz: 'America/Caracas' },

  // ═══════════════════════════════════════════════
  // ESPAÑA (18 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Madrid', state: 'Comunidad de Madrid', country: 'España', lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid' },
  { city: 'Barcelona', state: 'Cataluña', country: 'España', lat: 41.3874, lng: 2.1686, tz: 'Europe/Madrid' },
  { city: 'Valencia', state: 'Comunidad Valenciana', country: 'España', lat: 39.4699, lng: -0.3763, tz: 'Europe/Madrid' },
  { city: 'Sevilla', state: 'Andalucía', country: 'España', lat: 37.3891, lng: -5.9845, tz: 'Europe/Madrid' },
  { city: 'Málaga', state: 'Andalucía', country: 'España', lat: 36.7213, lng: -4.4214, tz: 'Europe/Madrid' },
  { city: 'Bilbao', state: 'País Vasco', country: 'España', lat: 43.2630, lng: -2.9350, tz: 'Europe/Madrid' },
  { city: 'Zaragoza', state: 'Aragón', country: 'España', lat: 41.6488, lng: -0.8891, tz: 'Europe/Madrid' },
  { city: 'Alicante', state: 'Comunidad Valenciana', country: 'España', lat: 38.3452, lng: -0.4815, tz: 'Europe/Madrid' },
  { city: 'Palma de Mallorca', state: 'Islas Baleares', country: 'España', lat: 39.6953, lng: 2.7505, tz: 'Europe/Madrid' },
  { city: 'Las Palmas de Gran Canaria', state: 'Canarias', country: 'España', lat: 28.1235, lng: -15.4363, tz: 'Atlantic/Canary' },
  { city: 'Santa Cruz de Tenerife', state: 'Canarias', country: 'España', lat: 28.4636, lng: -16.2518, tz: 'Atlantic/Canary' },
  { city: 'Murcia', state: 'Región de Murcia', country: 'España', lat: 37.9870, lng: -1.1303, tz: 'Europe/Madrid' },
  { city: 'Cádiz', state: 'Andalucía', country: 'España', lat: 36.5267, lng: -6.2884, tz: 'Europe/Madrid' },
  { city: 'Granada', state: 'Andalucía', country: 'España', lat: 37.1773, lng: -3.5986, tz: 'Europe/Madrid' },
  { city: 'Vigo', state: 'Galicia', country: 'España', lat: 42.2328, lng: -8.7226, tz: 'Europe/Madrid' },
  { city: 'Gijón', state: 'Asturias', country: 'España', lat: 43.5322, lng: -5.6611, tz: 'Europe/Madrid' },
  { city: 'A Coruña', state: 'Galicia', country: 'España', lat: 43.3688, lng: -8.3960, tz: 'Europe/Madrid' },

  // ═══════════════════════════════════════════════
  // COLOMBIA (10 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Bogotá', state: 'Cundinamarca', country: 'Colombia', lat: 4.7110, lng: -74.0721, tz: 'America/Bogota' },
  { city: 'Medellín', state: 'Antioquia', country: 'Colombia', lat: 6.2442, lng: -75.5812, tz: 'America/Bogota' },
  { city: 'Cali', state: 'Valle del Cauca', country: 'Colombia', lat: 3.4516, lng: -76.5320, tz: 'America/Bogota' },
  { city: 'Barranquilla', state: 'Atlántico', country: 'Colombia', lat: 10.9685, lng: -74.7813, tz: 'America/Bogota' },
  { city: 'Cartagena', state: 'Bolívar', country: 'Colombia', lat: 10.3910, lng: -75.5364, tz: 'America/Bogota' },
  { city: 'Bucaramanga', state: 'Santander', country: 'Colombia', lat: 7.1254, lng: -73.1198, tz: 'America/Bogota' },
  { city: 'Santa Marta', state: 'Magdalena', country: 'Colombia', lat: 11.2408, lng: -74.1990, tz: 'America/Bogota' },
  { city: 'Pereira', state: 'Risaralda', country: 'Colombia', lat: 4.8133, lng: -75.6961, tz: 'America/Bogota' },
  { city: 'Manizales', state: 'Caldas', country: 'Colombia', lat: 5.0689, lng: -75.5174, tz: 'America/Bogota' },
  { city: 'Ibagué', state: 'Tolima', country: 'Colombia', lat: 4.4388, lng: -75.2322, tz: 'America/Bogota' },

  // ═══════════════════════════════════════════════
  // MÉXICO (12 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Ciudad de México', state: 'CDMX', country: 'México', lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City' },
  { city: 'Guadalajara', state: 'Jalisco', country: 'México', lat: 20.6597, lng: -103.3496, tz: 'America/Mexico_City' },
  { city: 'Monterrey', state: 'Nuevo León', country: 'México', lat: 25.6866, lng: -100.3161, tz: 'America/Monterrey' },
  { city: 'Puebla', state: 'Puebla', country: 'México', lat: 19.0414, lng: -98.2063, tz: 'America/Mexico_City' },
  { city: 'Cancún', state: 'Quintana Roo', country: 'México', lat: 21.1619, lng: -86.8515, tz: 'America/Cancun' },
  { city: 'Tijuana', state: 'Baja California', country: 'México', lat: 32.5149, lng: -117.0382, tz: 'America/Tijuana' },
  { city: 'León', state: 'Guanajuato', country: 'México', lat: 21.1167, lng: -101.6819, tz: 'America/Mexico_City' },
  { city: 'Mérida', state: 'Yucatán', country: 'México', lat: 20.9674, lng: -89.5926, tz: 'America/Merida' },
  { city: 'Querétaro', state: 'Querétaro', country: 'México', lat: 20.5888, lng: -100.3881, tz: 'America/Mexico_City' },
  { city: 'Veracruz', state: 'Veracruz', country: 'México', lat: 19.1738, lng: -96.1342, tz: 'America/Mexico_City' },
  { city: 'Aguascalientes', state: 'Aguascalientes', country: 'México', lat: 21.8853, lng: -102.2916, tz: 'America/Mexico_City' },
  { city: 'Oaxaca', state: 'Oaxaca', country: 'México', lat: 17.0732, lng: -96.7266, tz: 'America/Mexico_City' },

  // ═══════════════════════════════════════════════
  // ARGENTINA (10 ciudades)
  // ═══════════════════════════════════════════════
  { city: 'Buenos Aires', state: 'CABA', country: 'Argentina', lat: -34.6037, lng: -58.3816, tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Córdoba', state: 'Córdoba', country: 'Argentina', lat: -31.4201, lng: -64.1888, tz: 'America/Argentina/Cordoba' },
  { city: 'Rosario', state: 'Santa Fe', country: 'Argentina', lat: -32.9468, lng: -60.6393, tz: 'America/Argentina/Cordoba' },
  { city: 'Mendoza', state: 'Mendoza', country: 'Argentina', lat: -32.8895, lng: -68.8458, tz: 'America/Argentina/Mendoza' },
  { city: 'La Plata', state: 'Buenos Aires', country: 'Argentina', lat: -34.9214, lng: -57.9545, tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Tucumán', state: 'Tucumán', country: 'Argentina', lat: -26.8241, lng: -65.2226, tz: 'America/Argentina/Tucuman' },
  { city: 'Mar del Plata', state: 'Buenos Aires', country: 'Argentina', lat: -38.0014, lng: -57.5576, tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Salta', state: 'Salta', country: 'Argentina', lat: -24.7829, lng: -65.4232, tz: 'America/Argentina/Salta' },
  { city: 'Santa Fe', state: 'Santa Fe', country: 'Argentina', lat: -31.6240, lng: -60.6956, tz: 'America/Argentina/Cordoba' },
  { city: 'Corrientes', state: 'Corrientes', country: 'Argentina', lat: -27.4806, lng: -58.8341, tz: 'America/Argentina/Cordoba' },

  // ═══════════════════════════════════════════════
  // OTROS PAÍSES
  // ═══════════════════════════════════════════════
  { city: 'Lima', state: 'Lima', country: 'Perú', lat: -12.0464, lng: -77.0428, tz: 'America/Lima' },
  { city: 'Santiago', state: 'Región Metropolitana', country: 'Chile', lat: -33.4489, lng: -70.6693, tz: 'America/Santiago' },
  { city: 'Panamá', state: 'Panamá', country: 'Panamá', lat: 8.9824, lng: -79.5199, tz: 'America/Panama' },
  { city: 'San José', state: 'San José', country: 'Costa Rica', lat: 9.9281, lng: -84.0907, tz: 'America/Costa_Rica' },
  { city: 'Quito', state: 'Pichincha', country: 'Ecuador', lat: -0.1807, lng: -78.4678, tz: 'America/Guayaquil' },
  { city: 'Guayaquil', state: 'Guayas', country: 'Ecuador', lat: -2.1708, lng: -79.9225, tz: 'America/Guayaquil' },
  { city: 'La Habana', state: 'La Habana', country: 'Cuba', lat: 23.1136, lng: -82.3666, tz: 'America/Havana' },
  { city: 'Santo Domingo', state: 'Distrito Nacional', country: 'República Dominicana', lat: 18.4861, lng: -69.9312, tz: 'America/Santo_Domingo' },
  { city: 'San Juan', state: 'San Juan', country: 'Puerto Rico', lat: 18.4655, lng: -66.1057, tz: 'America/Puerto_Rico' },
  { city: 'Miami', state: 'Florida', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918, tz: 'America/New_York' },
  { city: 'New York', state: 'New York', country: 'Estados Unidos', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
  { city: 'Los Ángeles', state: 'California', country: 'Estados Unidos', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
  { city: 'Houston', state: 'Texas', country: 'Estados Unidos', lat: 29.7604, lng: -95.3698, tz: 'America/Chicago' },
  { city: 'Orlando', state: 'Florida', country: 'Estados Unidos', lat: 28.5383, lng: -81.3792, tz: 'America/New_York' },
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function searchCities(query: string): CityData[] {
  if (!query || query.length < 2) return [];
  const q = normalizeText(query);
  return CITIES.filter(c =>
    normalizeText(c.city).includes(q) ||
    (c.state && normalizeText(c.state).includes(q)) ||
    normalizeText(c.country).includes(q)
  ).slice(0, 10);
}

export function findCityLocation(
  cityName?: string | null,
  countryName?: string | null,
  fallbackLat?: number | null,
  fallbackLng?: number | null,
  fallbackTz?: string | null
): { lat: number; lng: number; tz: string; city: string; country: string; state?: string } {
  if (cityName) {
    const normCity = normalizeText(cityName);
    const normCountry = countryName ? normalizeText(countryName) : '';

    // 1. Direct exact or partial match in CITIES database
    let match = CITIES.find(c => {
      const cCity = normalizeText(c.city);
      const cCountry = normalizeText(c.country);
      if (normCountry && cCountry === normCountry) {
        return cCity === normCity || normCity.includes(cCity) || cCity.includes(normCity);
      }
      return cCity === normCity;
    });

    if (!match) {
      match = CITIES.find(c => {
        const cCity = normalizeText(c.city);
        return normCity.includes(cCity) || cCity.includes(normCity);
      });
    }

    if (match) {
      return {
        lat: match.lat,
        lng: match.lng,
        tz: match.tz,
        city: match.city,
        country: match.country,
        state: match.state,
      };
    }
  }

  // 2. If valid fallback coordinates were provided
  if (
    fallbackLat != null &&
    fallbackLng != null &&
    !isNaN(Number(fallbackLat)) &&
    !isNaN(Number(fallbackLng)) &&
    (Number(fallbackLat) !== 0 || Number(fallbackLng) !== 0)
  ) {
    const tz = (fallbackTz && !fallbackTz.includes('@')) ? fallbackTz : 'America/Caracas';
    return {
      lat: Number(fallbackLat),
      lng: Number(fallbackLng),
      tz,
      city: cityName?.trim() || 'Ciudad Guayana',
      country: countryName?.trim() || 'Venezuela',
    };
  }

  // 3. Country-level intelligent default
  const normCountry = countryName ? normalizeText(countryName) : '';
  if (normCountry.includes('venezuela')) {
    return { lat: 8.3512, lng: -62.6414, tz: 'America/Caracas', city: cityName?.trim() || 'Ciudad Guayana', country: 'Venezuela' };
  } else if (normCountry.includes('espan') || normCountry.includes('spain')) {
    return { lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid', city: cityName?.trim() || 'Madrid', country: 'España' };
  } else if (normCountry.includes('colombia')) {
    return { lat: 4.7110, lng: -74.0721, tz: 'America/Bogota', city: cityName?.trim() || 'Bogotá', country: 'Colombia' };
  } else if (normCountry.includes('mexic')) {
    return { lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City', city: cityName?.trim() || 'Ciudad de México', country: 'México' };
  } else if (normCountry.includes('argentin')) {
    return { lat: -34.6037, lng: -58.3816, tz: 'America/Argentina/Buenos_Aires', city: cityName?.trim() || 'Buenos Aires', country: 'Argentina' };
  }

  // Default fallback
  return {
    lat: 8.3512,
    lng: -62.6414,
    tz: (fallbackTz && !fallbackTz.includes('@')) ? fallbackTz : 'America/Caracas',
    city: cityName?.trim() || 'Ciudad Guayana',
    country: countryName?.trim() || 'Venezuela',
  };
}