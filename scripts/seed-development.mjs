/**
 * Astral Family - Development Demo Seed
 * Generates synthetic, non-real demo data for development environments.
 * NEVER use real family data in development seeds.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function runDevSeed() {
  console.log('🌱 Generando datos demo ficticios para entorno de desarrollo...');

  const demoHash = await bcrypt.hash('demopass123', 10);

  // 1. Create Demo Admin
  const admin = await db.user.upsert({
    where: { email: 'demo-admin@astral.example.com' },
    create: {
      name: 'Persona Demo Admin',
      email: 'demo-admin@astral.example.com',
      role: 'admin',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      city: 'Demo City',
      country: 'Demo Land',
      passwordHash: demoHash,
      isActive: true,
    },
    update: {},
  });

  // 2. Create Demo Members
  const member1 = await db.user.upsert({
    where: { email: 'demo-member1@astral.example.com' },
    create: {
      name: 'Persona Demo 1',
      email: 'demo-member1@astral.example.com',
      role: 'member',
      birthDate: '1995-05-15',
      birthTime: '08:30',
      city: 'Demo City',
      country: 'Demo Land',
      passwordHash: demoHash,
      isActive: true,
    },
    update: {},
  });

  const member2 = await db.user.upsert({
    where: { email: 'demo-member2@astral.example.com' },
    create: {
      name: 'Persona Demo 2',
      email: 'demo-member2@astral.example.com',
      role: 'member',
      birthDate: '1998-09-20',
      birthTime: '16:45',
      city: 'Demo City',
      country: 'Demo Land',
      passwordHash: demoHash,
      isActive: true,
    },
    update: {},
  });

  // 3. Create Sample Demo Profiles
  const profileAdmin = await db.birthProfile.upsert({
    where: { id: 'demo-profile-admin' },
    create: {
      id: 'demo-profile-admin',
      name: 'Persona Demo Admin',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      city: 'Demo City',
      country: 'Demo Land',
      latitude: 0.0,
      longitude: 0.0,
      timezone: 'UTC',
      createdBy: admin.id,
      isCalculated: true,
    },
    update: {},
  });

  const profile1 = await db.birthProfile.upsert({
    where: { id: 'demo-profile-1' },
    create: {
      id: 'demo-profile-1',
      name: 'Persona Demo 1',
      birthDate: '1995-05-15',
      birthTime: '08:30',
      city: 'Demo City',
      country: 'Demo Land',
      latitude: 0.0,
      longitude: 0.0,
      timezone: 'UTC',
      createdBy: member1.id,
      partnerId: profileAdmin.id,
      isCalculated: true,
    },
    update: {
      partnerId: profileAdmin.id,
    },
  });

  await db.birthProfile.update({
    where: { id: profileAdmin.id },
    data: { partnerId: profile1.id },
  });

  console.log('✅ Seed de desarrollo completado con éxito (datos 100% ficticios).');
}

runDevSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error en seed de desarrollo:', err);
    process.exit(1);
  });
