import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;
  let userCount = 0;
  let profileCount = 0;

  try {
    const dbStart = Date.now();
    userCount = await db.user.count();
    profileCount = await db.birthProfile.count();
    dbLatencyMs = Date.now() - dbStart;
  } catch (err: any) {
    dbStatus = 'unhealthy';
    console.error('[Healthcheck] Database error:', err?.message || err);
  }

  const isHealthy = dbStatus === 'healthy';
  const totalDurationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'astral-family-web',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        stats: {
          users: userCount,
          profiles: profileCount,
        },
      },
      durationMs: totalDurationMs,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
