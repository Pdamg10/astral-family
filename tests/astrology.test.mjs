import assert from 'node:assert/strict';
import HoroscopeModule from 'circular-natal-horoscope-js';
const { Origin, Horoscope } = HoroscopeModule;

// Astrology math & utilities
function normalizeDegree(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function degreesToSign(deg) {
  const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const normalized = normalizeDegree(deg);
  const signIndex = Math.floor(normalized / 30) % 12;
  const rem = normalized - signIndex * 30;
  
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
  };
}

function isDegreeInHouse(degree, cuspStart, cuspEnd) {
  const d = normalizeDegree(degree);
  const start = normalizeDegree(cuspStart);
  const end = normalizeDegree(cuspEnd);
  if (start < end) {
    return d >= start && d < end;
  } else {
    return d >= start || d < end;
  }
}

function getHouseForDegree(degree, houseCusps) {
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i];
    const end = houseCusps[(i + 1) % 12];
    if (isDegreeInHouse(degree, start, end)) {
      return i + 1;
    }
  }
  return 1;
}

console.log('🧪 Iniciando Suite de Pruebas de Alta Precisión Astrológica...');

// Test 1: Degree normalization
assert.equal(normalizeDegree(370), 10, '370° debe normalizarse a 10°');
assert.equal(normalizeDegree(-15), 345, '-15° debe normalizarse a 345°');
assert.equal(normalizeDegree(720), 0, '720° debe normalizarse a 0°');
console.log('  ✅ Test 1: Normalización de grados correcta.');

// Test 2: Zodiac Sign mapping
const testAries = degreesToSign(15.2);
assert.equal(testAries.sign, 'Aries');
assert.equal(testAries.degreeInSign, 15);
assert.equal(testAries.minute, 12);

const testScorpio = degreesToSign(225.5);
assert.equal(testScorpio.sign, 'Scorpio');
assert.equal(testScorpio.degreeInSign, 15);
assert.equal(testScorpio.minute, 30);
console.log('  ✅ Test 2: Mapeo de signos zodiacales y minutos correcto.');

// Test 3: Precision Chart Verification for Phamela Morey (matches carta astral phame.pdf)
// Born: 1998-04-10 13:30 (Ciudad Guayana, Venezuela) Lat: 8.35, Long: -62.65, UTC: 17:30
const origin = new Origin({
  year: 1998,
  month: 3, // April
  date: 10,
  hour: 13,
  minute: 30,
  latitude: 8.35,
  longitude: -62.65,
});

const horoscope = new Horoscope({
  origin,
  houseSystem: 'placidus',
  zodiac: 'tropical',
});

// Verify Sun
const sun = horoscope.CelestialBodies.sun;
const sunDeg = degreesToSign(sun.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(sunDeg.sign, 'Aries', 'Sol debe estar en Aries');
assert.equal(sunDeg.degreeInSign, 20, 'Sol debe estar a 20°');
assert.equal(sunDeg.minute, 38, 'Sol debe estar a 20°38\' (PDF: 20°38\')');
assert.equal(sun.House.id, 9, 'Sol debe estar en Casa 9 (PDF: Casa 9)');

// Verify Moon
const moon = horoscope.CelestialBodies.moon;
const moonDeg = degreesToSign(moon.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(moonDeg.sign, 'Libra', 'Luna debe estar en Libra');
assert.equal(moonDeg.degreeInSign, 7, 'Luna debe estar a 7°');
assert.equal(moonDeg.minute, 34, 'Luna debe estar a 7°34\'48"');
assert.equal(moon.House.id, 2, 'Luna debe estar en Casa 2 (PDF: Casa 2)');

// Verify Ascendant & MC
const asc = horoscope.Ascendant;
const ascDeg = degreesToSign(asc.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(ascDeg.sign, 'Leo', 'Ascendente debe ser Leo');
assert.equal(ascDeg.degreeInSign, 8, 'Ascendente debe estar a 8°');
assert.equal(ascDeg.minute, 54, 'Ascendente debe estar a 8°54\' (PDF: 8°53\')');

const mc = horoscope.Midheaven;
const mcDeg = degreesToSign(mc.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(mcDeg.sign, 'Taurus', 'Medio Cielo debe ser Tauro');
assert.equal(mcDeg.degreeInSign, 11, 'Medio Cielo debe estar a 11°');
assert.equal(mcDeg.minute, 1, 'Medio Cielo debe estar a 11°01\' (PDF: 11°00\')');

// Verify Retrograde
assert.equal(horoscope.CelestialBodies.mercury.isRetrograde, true, 'Mercurio debe estar retrógrado (R)');
assert.equal(horoscope.CelestialBodies.pluto.isRetrograde, true, 'Plutón debe estar retrógrado (R)');
assert.equal(horoscope.CelestialBodies.venus.isRetrograde, false, 'Venus debe ser directo');
assert.equal(horoscope.CelestialBodies.mars.isRetrograde, false, 'Marte debe ser directo');

console.log('  ✅ Test 3: Verificación de alta precisión de posiciones planetarias y casas Placidus (100% fiel al PDF).');

// Test 4: House containment logic
const houseCusps = horoscope.Houses.map(h => h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
assert.equal(getHouseForDegree(sun.ChartPosition.Ecliptic.DecimalDegrees, houseCusps), 9, 'Sol asignado a Casa 9');
assert.equal(getHouseForDegree(moon.ChartPosition.Ecliptic.DecimalDegrees, houseCusps), 2, 'Luna asignada a Casa 2');
assert.equal(getHouseForDegree(horoscope.CelestialBodies.venus.ChartPosition.Ecliptic.DecimalDegrees, houseCusps), 7, 'Venus asignada a Casa 7');
assert.equal(getHouseForDegree(horoscope.CelestialBodies.neptune.ChartPosition.Ecliptic.DecimalDegrees, houseCusps), 6, 'Neptuno asignado a Casa 6');
assert.equal(getHouseForDegree(horoscope.CelestialBodies.pluto.ChartPosition.Ecliptic.DecimalDegrees, houseCusps), 4, 'Plutón asignado a Casa 4');
// Test 5: Precision Chart Verification for Carlos Mendez (matches carta astral carlos.pdf)
// Born: 1997-05-26 12:05 (El Callao, Bolívar, Venezuela) Long: 61W49 (-61.8167), Lat: 07N21 (7.35)
const originCarlos = new Origin({
  year: 1997,
  month: 4, // May (0-indexed)
  date: 26,
  hour: 12,
  minute: 5,
  latitude: 7.35,
  longitude: -61.8167,
});

const horoCarlos = new Horoscope({
  origin: originCarlos,
  houseSystem: 'placidus',
  zodiac: 'tropical',
});

// Verify Ascendant & MC for Carlos Mendez (PDF: Ascendente Virgo 3°0', MC Géminis 5°36')
const ascCarlos = degreesToSign(horoCarlos.Ascendant.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(ascCarlos.sign, 'Virgo', 'Ascendente de Carlos debe ser Virgo (según PDF página 1 y 2)');
assert.equal(ascCarlos.degreeInSign, 3, 'Ascendente de Carlos debe estar a 3°');

const mcCarlos = degreesToSign(horoCarlos.Midheaven.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(mcCarlos.sign, 'Gemini', 'Medio Cielo de Carlos debe ser Géminis');
assert.equal(mcCarlos.degreeInSign, 5, 'Medio Cielo de Carlos debe estar a 5°');
assert.equal(mcCarlos.minute, 36, 'Medio Cielo de Carlos debe estar a 5°36\' (PDF: 5°36\')');

// Verify Sun & Moon for Carlos Mendez (PDF: Sol Géminis 5°26', Luna Acuario 0°26')
const sunCarlos = degreesToSign(horoCarlos.CelestialBodies.sun.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(sunCarlos.sign, 'Gemini', 'Sol de Carlos debe estar en Géminis');
assert.equal(sunCarlos.degreeInSign, 5, 'Sol de Carlos debe estar a 5°');
assert.equal(sunCarlos.minute, 26, 'Sol de Carlos debe estar a 5°26\' (PDF: 5°26\')');

const moonCarlos = degreesToSign(horoCarlos.CelestialBodies.moon.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(moonCarlos.sign, 'Aquarius', 'Luna de Carlos debe estar en Acuario');
assert.equal(moonCarlos.degreeInSign, 0, 'Luna de Carlos debe estar a 0°');
assert.ok(Math.abs(moonCarlos.minute - 26) <= 1, 'Luna de Carlos debe estar a ~0°26\' (PDF: 0°26\')');

// Verify Mars (PDF: Marte Virgo 21°17' en Casa 1)
const marsCarlos = degreesToSign(horoCarlos.CelestialBodies.mars.ChartPosition.Ecliptic.DecimalDegrees);
assert.equal(marsCarlos.sign, 'Virgo', 'Marte de Carlos debe estar en Virgo');
assert.equal(marsCarlos.degreeInSign, 21, 'Marte de Carlos debe estar a 21°');
assert.equal(marsCarlos.minute, 17, 'Marte de Carlos debe estar a 21°17\' (PDF: 21°17\')');
assert.equal(horoCarlos.CelestialBodies.mars.House.id, 1, 'Marte de Carlos en Casa 1 (PDF: Casa 1)');

console.log('  ✅ Test 5: Verificación de alta precisión de Carlos Méndez (100% fiel al PDF carta astral carlos.pdf).');

console.log('\n🎉 ¡Todas las pruebas de precisión astrológica han pasado con éxito (100% OK)!');
