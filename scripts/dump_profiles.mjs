import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.birthProfile.findMany({
    include: {
      planetaryPositions: true,
      houses: true,
      chartPoints: true,
    }
  });

  for (const p of profiles) {
    const sun = p.planetaryPositions.find(x => x.body === 'Sun');
    const moon = p.planetaryPositions.find(x => x.body === 'Moon');
    const asc = p.chartPoints.find(x => x.point === 'Ascendant');
    const mc = p.chartPoints.find(x => x.point === 'MC');
    console.log(`=== [${p.name}] ===`);
    console.log(`Fecha: ${p.birthDate} Hora: ${p.birthTime} (${p.city}, ${p.country}) Lat: ${p.latitude}, Lng: ${p.longitude}, Tz: ${p.timezone}`);
    console.log(`Sol: ${sun?.sign} ${sun?.degree}°${sun?.minute}' (Casa ${sun?.house})`);
    console.log(`Luna: ${moon?.sign} ${moon?.degree}°${moon?.minute}' (Casa ${moon?.house})`);
    console.log(`Asc: ${asc?.sign} ${asc?.degree}°${asc?.minute}' | MC: ${mc?.sign} ${mc?.degree}°${mc?.minute}'`);
  }
}

main().finally(() => prisma.$disconnect());
