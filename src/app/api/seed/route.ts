import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, requireAdmin } from '@/lib/auth';
import { findCityLocation } from '@/lib/cities';
import { calculateFullChart } from '@/services/astrology/chart';
import { replaceProfileChartData } from '@/services/astrology/profileSync';

// 14 miembros de demostración con datos de nacimiento diversos
const familyMembers = [
  { name: 'Phamela Morey', email: 'admin@astral.family', password: 'admin123', role: 'admin' as const,
    birthDate: '1998-04-10', birthTime: '13:30', city: 'Ciudad Guayana', country: 'Venezuela' },
  { name: 'Carlos', email: 'carlos@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1995-06-15', birthTime: '08:45', city: 'Caracas', country: 'Venezuela' },
  { name: 'Sofía', email: 'sofia@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2000-11-22', birthTime: '22:15', city: 'Madrid', country: 'España' },
  { name: 'Diego', email: 'diego@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1992-03-08', birthTime: '06:00', city: 'Bogotá', country: 'Colombia' },
  { name: 'Valentina', email: 'valentina@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1997-07-29', birthTime: '16:20', city: 'Buenos Aires', country: 'Argentina' },
  { name: 'Andrés', email: 'andres@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1988-01-14', birthTime: '11:10', city: 'Maracaibo', country: 'Venezuela' },
  { name: 'Gabriela', email: 'gabriela@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2001-09-05', birthTime: '19:50', city: 'Valencia', country: 'Venezuela' },
  { name: 'Miguel', email: 'miguel@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1990-12-25', birthTime: '03:30', city: 'Barquisimeto', country: 'Venezuela' },
  { name: 'Isabella', email: 'isabella@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2003-05-18', birthTime: '14:00', city: 'Maracay', country: 'Venezuela' },
  { name: 'Roberto', email: 'roberto@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1985-08-30', birthTime: '07:15', city: 'Maturín', country: 'Venezuela' },
  { name: 'Daniela', email: 'daniela@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1999-02-14', birthTime: '20:45', city: 'Cumaná', country: 'Venezuela' },
  { name: 'Alejandro', email: 'alejandro@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1993-10-31', birthTime: '23:55', city: 'Mérida', country: 'Venezuela' },
  { name: 'Camila', email: 'camila@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '2005-06-21', birthTime: '10:00', city: 'Barcelona', country: 'España' },
  { name: 'Sebastián', email: 'sebastian@astral.family', password: 'familia2024', role: 'member' as const,
    birthDate: '1996-04-02', birthTime: '05:25', city: 'Medellín', country: 'Colombia' },
];

export async function POST(request: NextRequest) {
  try {
    // Protect seed endpoint in production: require authenticated admin
    if (process.env.NODE_ENV === 'production') {
      const auth = await requireAdmin(request, 'El endpoint de seed requiere permisos de administrador en producción');
      if (auth.response) return auth.response;
    }

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

      await db.themeSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });

      const existingProfile = await db.birthProfile.findFirst({
        where: { name: member.name, createdBy: user.id },
      });

      if (!existingProfile) {
        const loc = findCityLocation(member.city, member.country);

        const profile = await db.birthProfile.create({
          data: {
            name: member.name,
            birthDate: member.birthDate,
            birthTime: member.birthTime,
            timeUnknown: false,
            city: loc.city,
            country: loc.country,
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

          await db.$transaction(async (tx) => {
            await replaceProfileChartData(tx, profile.id, chartData, false);
            await tx.birthProfile.update({
              where: { id: profile.id },
              data: { isCalculated: true },
            });
          });
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

    const [totalUsers, totalProfiles, calculatedProfiles, totalInvitations] = await Promise.all([
      db.user.count(),
      db.birthProfile.count(),
      db.birthProfile.count({ where: { isCalculated: true } }),
      db.invitation.count(),
    ]);

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
