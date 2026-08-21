/**
 * Astral Family - SQLite to PostgreSQL Migration & Seeder
 * Transfers 100% of data (Users, BirthProfiles, Charts, Aspects, Houses, Themes)
 * from the JSON dump into the target database (PostgreSQL or SQLite).
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new PrismaClient();

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 ASTRAL FAMILY // MIGRACIÓN A BASE DE DATOS LOCAL');
  console.log('====================================================');

  const dumpPath = path.resolve(__dirname, '../backups/latest_sqlite_dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.error(`❌ Error: No se encontró el archivo de backup en ${dumpPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dumpPath, 'utf8');
  const backup = JSON.parse(rawData);

  console.log(`📦 Leyendo dump generado en: ${backup.exportedAt || 'N/A'}`);
  console.log(`👤 Usuarios a migrar: ${backup.users.length}`);
  console.log(`🎡 Cartas astrales a migrar: ${backup.birthProfiles.length}`);

  // 1. Migrate Users
  console.log('\n[1/4] Migrando Usuarios...');
  for (const u of backup.users) {
    const existing = await db.user.findUnique({ where: { id: u.id } });
    if (!existing) {
      await db.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role || 'member',
          avatar: u.avatar || null,
          birthDate: u.birthDate || null,
          birthTime: u.birthTime || null,
          city: u.city || null,
          country: u.country || null,
          timezone: u.timezone || null,
          isActive: u.isActive ?? true,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
        },
      });
      console.log(`  + Usuario creado: ${u.name} (${u.email})`);
    } else {
      await db.user.update({
        where: { id: u.id },
        data: {
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role || 'member',
          birthDate: u.birthDate,
          birthTime: u.birthTime,
        },
      });
      console.log(`  ✓ Usuario actualizado: ${u.name}`);
    }

    // Theme settings
    if (u.themeSettings) {
      const ts = u.themeSettings;
      await db.themeSettings.upsert({
        where: { userId: u.id },
        create: {
          userId: u.id,
          themeType: ts.themeType || 'midnight',
          primaryColor: ts.primaryColor || '#a855f7',
          secondaryColor: ts.secondaryColor || '#ec4899',
          accentColor: ts.accentColor || '#f59e0b',
          backgroundType: ts.backgroundType || 'gradient',
          backgroundColor: ts.backgroundColor || null,
          backgroundImage: ts.backgroundImage || null,
          gradientColors: ts.gradientColors || '["#0f0a1a","#1a0a2e","#0f0a1a"]',
          cardOpacity: ts.cardOpacity ?? 0.85,
          borderRadius: ts.borderRadius ?? 12,
          shadowIntensity: ts.shadowIntensity ?? 0.5,
          textSize: ts.textSize || 'medium',
          infoDensity: ts.infoDensity || 'normal',
        },
        update: {
          primaryColor: ts.primaryColor,
          secondaryColor: ts.secondaryColor,
          accentColor: ts.accentColor,
          gradientColors: ts.gradientColors,
          cardOpacity: ts.cardOpacity,
          borderRadius: ts.borderRadius,
        },
      });
    }
  }

  // 2. Migrate Birth Profiles (Phase A: Base entity without self-references)
  console.log('\n[2/4] Migrando Cartas Astrales (Fase Base)...');
  for (const p of backup.birthProfiles) {
    const existing = await db.birthProfile.findUnique({ where: { id: p.id } });
    if (!existing) {
      await db.birthProfile.create({
        data: {
          id: p.id,
          name: p.name,
          birthDate: p.birthDate,
          birthTime: p.birthTime,
          timeUnknown: p.timeUnknown ?? false,
          city: p.city || 'Ciudad Guayana',
          country: p.country || 'Venezuela',
          latitude: p.latitude || 8.3512,
          longitude: p.longitude || -62.6414,
          timezone: p.timezone || 'America/Caracas',
          createdBy: p.createdBy,
          isCalculated: p.isCalculated ?? true,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        },
      });
      console.log(`  + Carta creada: ${p.name}`);
    }
  }

  // 3. Migrate Relational Links (Phase B: Parents, Partners, Siblings)
  console.log('\n[3/4] Conectando Relaciones del Árbol Genealógico...');
  for (const p of backup.birthProfiles) {
    await db.birthProfile.update({
      where: { id: p.id },
      data: {
        parentId: p.parentId || null,
        parent2Id: p.parent2Id || null,
        partnerId: p.partnerId || null,
        siblingId: p.siblingId || null,
      },
    });
  }
  console.log('  ✓ Todas las relaciones genealógicas vinculadas exitosamente.');

  // 4. Migrate Astrological Positions, Houses, Aspects, Chart Points
  console.log('\n[4/4] Migrando Posiciones Planetarias, Casas y Aspectos...');
  for (const p of backup.birthProfiles) {
    // Planetary positions
    if (p.planetaryPositions?.length) {
      for (const pos of p.planetaryPositions) {
        await db.planetaryPosition.upsert({
          where: { birthProfileId_body: { birthProfileId: p.id, body: pos.body } },
          create: {
            birthProfileId: p.id,
            body: pos.body,
            sign: pos.sign,
            degree: pos.degree,
            minute: pos.minute,
            retrograde: pos.retrograde ?? false,
            house: pos.house || null,
          },
          update: {
            sign: pos.sign,
            degree: pos.degree,
            minute: pos.minute,
            retrograde: pos.retrograde ?? false,
            house: pos.house || null,
          },
        });
      }
    }

    // Houses
    if (p.houses?.length) {
      for (const h of p.houses) {
        await db.house.upsert({
          where: { birthProfileId_houseNumber: { birthProfileId: p.id, houseNumber: h.houseNumber } },
          create: {
            birthProfileId: p.id,
            houseNumber: h.houseNumber,
            sign: h.sign,
            degree: h.degree,
            minute: h.minute,
          },
          update: {
            sign: h.sign,
            degree: h.degree,
            minute: h.minute,
          },
        });
      }
    }

    // Chart Points
    if (p.chartPoints?.length) {
      for (const cp of p.chartPoints) {
        await db.chartPoint.upsert({
          where: { birthProfileId_point: { birthProfileId: p.id, point: cp.point } },
          create: {
            birthProfileId: p.id,
            point: cp.point,
            sign: cp.sign,
            degree: cp.degree,
            minute: cp.minute,
            house: cp.house || null,
          },
          update: {
            sign: cp.sign,
            degree: cp.degree,
            minute: cp.minute,
            house: cp.house || null,
          },
        });
      }
    }

    // Aspects
    if (p.aspects?.length) {
      // Clear existing aspects and re-insert
      await db.aspect.deleteMany({ where: { birthProfileId: p.id } });
      for (const a of p.aspects) {
        await db.aspect.create({
          data: {
            birthProfileId: p.id,
            body1: a.body1,
            body2: a.body2,
            type: a.type,
            angle: a.angle,
            orb: a.orb,
            degree1: a.degree1,
            degree2: a.degree2,
          },
        });
      }
    }
  }

  // 5. Invitations
  if (backup.invitations?.length) {
    for (const inv of backup.invitations) {
      await db.invitation.upsert({
        where: { code: inv.code },
        create: {
          id: inv.id,
          code: inv.code,
          createdBy: inv.createdBy,
          maxUses: inv.maxUses ?? 1,
          currentUses: inv.currentUses ?? 0,
          isActive: inv.isActive ?? true,
          expiresAt: inv.expiresAt ? new Date(inv.expiresAt) : null,
          createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
        },
        update: {
          currentUses: inv.currentUses,
          isActive: inv.isActive,
        },
      });
    }
  }

  const finalUsers = await db.user.count();
  const finalProfiles = await db.birthProfile.count();

  console.log('\n====================================================');
  console.log('✅ MIGRACIÓN COMPLETADA CON ÉXITO');
  console.log(`   Total Usuarios en Base de Datos: ${finalUsers}`);
  console.log(`   Total Cartas Astrales en Base de Datos: ${finalProfiles}`);
  console.log('====================================================\n');
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error durante la migración:', err);
    process.exit(1);
  });
