import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { calculateFullChart } from '@/services/astrology/chart';

// Demo cities with coordinates
const cities: Record<string, { lat: number; lng: number; tz: string }> = {
  'Caracas, Venezuela': { lat: 10.4806, lng: -66.9036, tz: 'America/Caracas' },
  'Madrid, España': { lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid' },
  'Bogotá, Colombia': { lat: 4.711, lng: -74.0721, tz: 'America/Bogota' },
  'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City' },
  'Buenos Aires, Argentina': { lat: -34.6037, lng: -58.3816, tz: 'America/Buenos_Aires' },
  'Lima, Peru': { lat: -12.0464, lng: -77.0428, tz: 'America/Lima' },
  'Santiago, Chile': { lat: -33.4489, lng: -70.6693, tz: 'America/Santiago' },
  'New York, USA': { lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  'Miami, USA': { lat: 25.7617, lng: -80.1918, tz: 'America/New_York' },
  'Barcelona, España': { lat: 41.3874, lng: 2.1686, tz: 'Europe/Madrid' },
};

const demoPeople = [
  { name: 'Phamela', birthDate: '1998-04-10', birthTime: '13:30', city: 'Caracas, Venezuela', country: 'Venezuela' },
  { name: 'Carlos', birthDate: '1995-06-15', birthTime: '08:45', city: 'Caracas, Venezuela', country: 'Venezuela' },
  { name: 'Sofía', birthDate: '2000-11-22', birthTime: '22:15', city: 'Madrid, España', country: 'España' },
  { name: 'Diego', birthDate: '1992-03-08', birthTime: '06:00', city: 'Bogotá, Colombia', country: 'Colombia' },
  { name: 'Valentina', birthDate: '1997-07-29', birthTime: '16:20', city: 'Buenos Aires, Argentina', country: 'Argentina' },
];

export async function POST() {
  try {
    // Create admin user
    const adminHash = await hashPassword('admin123');
    const admin = await db.user.upsert({
      where: { email: 'admin@astral.family' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@astral.family',
        passwordHash: adminHash,
        role: 'admin',
      },
    });

    await db.themeSettings.upsert({
      where: { userId: admin.id },
      update: {},
      create: { userId: admin.id },
    });

    // Create invitation codes
    const existingInvitations = await db.invitation.findMany();
    if (existingInvitations.length === 0) {
      await db.invitation.createMany({
        data: [
          { code: 'ASTRAL-FAMILY-DEMO1', createdBy: admin.id, maxUses: 14, isActive: true },
          { code: 'ASTRAL-FAMILY-DEMO2', createdBy: admin.id, maxUses: 5, isActive: true },
          { code: 'ASTRAL-FAMILY-DEMO3', createdBy: admin.id, maxUses: 1, isActive: true },
        ],
      });
    }

    // Create demo profiles
    const existingProfiles = await db.birthProfile.findMany();
    if (existingProfiles.length === 0) {
      for (const person of demoPeople) {
        const loc = cities[person.city];
        if (!loc) continue;

        const profile = await db.birthProfile.create({
          data: {
            name: person.name,
            birthDate: person.birthDate,
            birthTime: person.birthTime,
            timeUnknown: false,
            city: person.city.split(',')[0],
            country: person.country,
            latitude: loc.lat,
            longitude: loc.lng,
            timezone: loc.tz,
            createdBy: admin.id,
          },
        });

        try {
          const chartData = await calculateFullChart({
            birthDate: person.birthDate,
            birthTime: person.birthTime,
            timeUnknown: false,
            latitude: loc.lat,
            longitude: loc.lng,
            timezone: loc.tz,
          });

          for (const pos of chartData.planetaryPositions) {
            await db.planetaryPosition.create({
              data: {
                birthProfileId: profile.id,
                body: pos.body,
                sign: pos.sign,
                degree: pos.degree,
                minute: pos.minute,
                retrograde: pos.retrograde,
                house: pos.house || null,
              },
            });
          }

          for (const house of chartData.houses) {
            await db.house.create({
              data: {
                birthProfileId: profile.id,
                houseNumber: house.houseNumber,
                sign: house.sign,
                degree: house.degree,
                minute: house.minute,
              },
            });
          }

          for (const aspect of chartData.aspects) {
            await db.aspect.create({
              data: {
                birthProfileId: profile.id,
                body1: aspect.body1,
                body2: aspect.body2,
                type: aspect.type,
                angle: aspect.angle,
                orb: aspect.orb,
                degree1: aspect.degree1,
                degree2: aspect.degree2,
              },
            });
          }

          for (const cp of chartData.chartPoints) {
            await db.chartPoint.create({
              data: {
                birthProfileId: profile.id,
                point: cp.point,
                sign: cp.sign,
                degree: cp.degree,
                minute: cp.minute,
                house: cp.house || null,
              },
            });
          }

          await db.birthProfile.update({
            where: { id: profile.id },
            data: { isCalculated: true },
          });
        } catch (calcError) {
          console.error(`Error calculating chart for ${person.name}:`, calcError);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Datos de demostración creados' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Error al crear datos de demostración' }, { status: 500 });
  }
}