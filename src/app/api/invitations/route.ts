import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ASTRAL-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }
    const invitations = await db.invitation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Invitations GET error:', error);
    return NextResponse.json({ error: 'Error al obtener invitaciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Solo los administradores pueden generar invitaciones' }, { status: 403 });
    }

    const { maxUses, expiresAt } = await request.json();
    let code = generateCode();
    while (await db.invitation.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const invitation = await db.invitation.create({
      data: {
        code,
        createdBy: payload.userId,
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Invitations POST error:', error);
    return NextResponse.json(
      { error: 'No fue posible generar la invitación' },
      { status: 500 }
    );
  }
}
