import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { calculateFullChart } from '@/services/astrology/chart';

const cities: Record<string, { lat: number; lng: number; tz: string }> = {
  'Caracas, Venezuela': { lat: 10.4806, lng: -66.9036, tz: 'America/Caracas' },
  'Ciudad Guayana, Venezuela': { lat: 8.3512, lng: -62.6414, tz: 'America/Caracas' },
  'Puerto Ordaz, Venezuela': { lat: 8.2833, lng: -62.75, tz: 'America/Caracas' },
  'Valencia, Venezuela': { lat: 10.1627, lng: -68.0078, tz: 'America/Caracas' },
  'Maracaibo, Venezuela': { lat: 10.6427, lng: -71.6225, tz: 'America/Caracas' },
  'Barquisimeto, Venezuela': { lat: 10.0646, lng: -69.3568, tz: 'America/Caracas' },
  'Maracay, Venezuela': { lat: 10.2468, lng: -67.5958, tz: 'America/Caracas' },
  'Maturín, Venezuela': { lat: 9.7457, lng: -63.1831, tz: 'America/Caracas' },
  'Cumaná, Venezuela': { lat: 10.4597, lng: -64.1753, tz: 'America/Caracas' },
  'Mérida, Venezuela': { lat: 8.5981, lng: -71.1406, tz: 'America/Caracas' },
  'Madrid, España': { lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid' },
  'Barcelona, España': { lat: 41.3874, lng: 2.1686, tz: 'Europe/Madrid' },
  'Valencia, España': { lat: 39.4699, lng: -0.3763, tz: 'Europe/Madrid' },
  'Bogotá, Colombia': { lat: 4.711, lng: -74.0721, tz: 'America/Bogota' },
  'Medellín, Colombia': { lat: 6.2442, lng: -75.5812, tz: 'America/Bogota' },
  'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City' },
  'Buenos Aires, Argentina': { lat: -34.6037, lng: -58.3816, tz: 'America/Buenos_Aires' },
  'Córdoba, Argentina': { lat: -31.4201, lng: -64.1888, tz: 'America/Argentina/Cordoba' },
  'Lima, Peru': { lat: -12.0464, lng: -77.0428, tz: 'America/Lima' },
  'Santiago, Chile': { lat: -33.4489, lng: -70.6693, tz: 'America/Santiago' },
  'New York, USA': { lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  'Miami, USA': { lat: 25.7617, lng: -80.1918, tz: 'America/New_York' },
  'Los Ángeles, USA': { lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
  'Panamá, Panamá': { lat: 8.9824, lng: -79.5199, tz: 'America/Panama' },
  'San José, Costa Rica': { lat: 9.9281, lng: -84.0907, tz: 'America/Costa_Rica' },
  'Quito, Ecuador': { lat: -0.1807, lng: -78.4678, tz: 'America/Guayaquil' },
  'La Habana, Cuba': { lat: 23.1136, lng: -82.3666, tz: 'America/Havana' },
  'Santo Domingo, República Dominicana': { lat: 18.4861, lng: -69.9312, tz: 'America/Santo_Domingo' },
  'San Juan, Puerto Rico': { lat: 18.4655, lng: -66.1057, tz: 'America/Puerto_Rico' },
};

// 14 miembros de la familia con datos de nacimiento diversos
const familyMembers = [
  // Miembro 1 - Admin (Phamela)
  { name: 'Phamela Morey', email: 'admin@astral.family', password: 'admin123', role: 'admin' as const,
    birthDate: '1998-04-10', birthTime: '13:30', city: 'Ciudad Guayana, Venezuela', country: 'Venezuela' },
  // Miembro 2
  { name: 'Carlos', email: 'carlos@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1995-06-15', birthTime: '08:45', city: 'Caracas, Venezuela', country: 'Venezuela' },
  // Miembro 3
  { name: 'Sofía', email: 'sofia@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2000-11-22', birthTime: '22:15', city: 'Madrid, España', country: 'España' },
  // Miembro 4
  { name: 'Diego', email: 'diego@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1992-03-08', birthTime: '06:00', city: 'Bogotá, Colombia', country: 'Colombia' },
  // Miembro 5
  { name: 'Valentina', email: 'valentina@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1997-07-29', birthTime: '16:20', city: 'Buenos Aires, Argentina', country: 'Argentina' },
  // Miembro 6
  { name: 'Andrés', email: 'andres@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1988-01-14', birthTime: '11:10', city: 'Maracaibo, Venezuela', country: 'Venezuela' },
  // Miembro 7
  { name: 'Gabriela', email: 'gabriela@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2001-09-05', birthTime: '19:50', city: 'Valencia, Venezuela', country: 'Venezuela' },
  // Miembro 8
  { name: 'Miguel', email: 'miguel@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1990-12-25', birthTime: '03:30', city: 'Barquisimeto, Venezuela', country: 'Venezuela' },
  // Miembro 9
  { name: 'Isabella', email: 'isabella@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2003-05-18', birthTime: '14:00', city: 'Maracay, Venezuela', country: 'Venezuela' },
  // Miembro 10
  { name: 'Roberto', email: 'roberto@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1985-08-30', birthTime: '07:15', city: 'Maturín, Venezuela', country: 'Venezuela' },
  // Miembro 11
  { name: 'Daniela', email: 'daniela@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1999-02-14', birthTime: '20:45', city: 'Cumaná, Venezuela', country: 'Venezuela' },
  // Miembro 12
  { name: 'Alejandro', email: 'alejandro@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1993-10-31', birthTime: '23:55', city: 'Mérida, Venezuela', country: 'Venezuela' },
  // Miembro 13
  { name: 'Camila', email: 'camila@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2005-06-21', birthTime: '10:00', city: 'Barcelona, España', country: 'España' },
  // Miembro 14
  { name: 'Sebastián', email: 'sebastian@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1996-04-02', birthTime: '05:25', city: 'Medellín, Colombia', country: 'Colombia' },
];

export async function POST() {
  try {
    // ─── 1. Crear usuarios y sus perfiles de nacimiento ───
    for (const member of familyMembers) {
      const userHash = await hashPassword(member.password);
      const user = await db.user.upsert({
        where: { email: member.email },
        update: { name: member.name },
        create: {
          name: member.name,
          email: member.email,
          passwordHash: userHash,
          role: member.role,
          isActive: true,
        },
      });

      // Crear tema personalizado por defecto
      await db.themeSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });

      // Crear perfil de nacimiento y calcular carta
      const existingProfile = await db.birthProfile.findFirst({
        where: { name: member.name, createdBy: user.id },
      });

      if (!existingProfile) {
        const loc = cities[member.city];
        if (!loc) {
          console.error(`Ciudad no encontrada: ${member.city}`);
          continue;
        }

        const profile = await db.birthProfile.create({
          data: {
            name: member.name,
            birthDate: member.birthDate,
            birthTime: member.birthTime,
            timeUnknown: false,
            city: member.city.split(',')[0],
            country: member.country,
            latitude: loc.lat,
            longitude: loc.lng,
            timezone: loc.tz,
            createdBy: user.id,
          },
        });

        try {
          const chartData = await calculateFullChart({
            birthDate: member.birthDate,
            birthTime: member.birthTime,
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

          console.log(`✓ Carta calculada: ${member.name}`);
        } catch (calcError) {
          console.error(`Error calculando carta para ${member.name}:`, calcError);
        }
      }
    }

    // ─── 2. Crear códigos de invitación adicionales ───
    const existingInvitations = await db.invitation.count();
    if (existingInvitations === 0) {
      const admin = await db.user.findUnique({ where: { email: 'admin@astral.family' } });
      if (admin) {
        await db.invitation.createMany({
          data: [
            { code: 'ASTRAL-FAMILY-DEMO', createdBy: admin.id, maxUses: 14, isActive: true },
            { code: 'ASTRAL-INV-001', createdBy: admin.id, maxUses: 1, isActive: true },
            { code: 'ASTRAL-INV-002', createdBy: admin.id, maxUses: 1, isActive: true },
            { code: 'ASTRAL-INV-003', createdBy: admin.id, maxUses: 1, isActive: true },
            { code: 'ASTRAL-INV-004', createdBy: admin.id, maxUses: 1, isActive: true },
            { code: 'ASTRAL-INV-005', createdBy: admin.id, maxUses: 1, isActive: true },
          ],
        });
      }
    }

    // ─── 3. Marcar todos los perfiles como calculados (fallback) ───
    await db.birthProfile.updateMany({
      where: { isCalculated: false },
      data: { isCalculated: true },
    });

    const totalUsers = await db.user.count();
    const totalProfiles = await db.birthProfile.count();
    const calculatedProfiles = await db.birthProfile.count({ where: { isCalculated: true } });
    const totalInvitations = await db.invitation.count();

    return NextResponse.json({
      success: true,
      message: `Datos inicializados: ${totalUsers} usuarios, ${calculatedProfiles}/${totalProfiles} cartas calculadas, ${totalInvitations} invitaciones`,
      stats: { totalUsers, totalProfiles, calculatedProfiles, totalInvitations },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Error al inicializar datos' }, { status: 500 });
  }
}
