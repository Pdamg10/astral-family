import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

const INVITATION_INCLUDE = {
  creator: { select: { id: true, name: true, email: true } },
  usages: {
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: { usedAt: 'desc' as const },
  },
};

const EXPIRATION_HOURS: Record<string, number> = {
  '1h': 1,
  '6h': 6,
  '24h': 24,
  '1d': 24,
  '3d': 72,
  '7d': 168,
  '30d': 720,
};

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ASTRAL-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/invitations - List all invitations with usage audit log (Admin Only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, 'Solo el administrador tiene acceso a la gestión de invitaciones');
    if (auth.response) return auth.response;

    const now = new Date();

    // Auto-update expired invitations that were active
    await db.invitation.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: now },
      },
      data: { isActive: false },
    });

    const invitations = await db.invitation.findMany({
      include: INVITATION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Invitations GET error:', error);
    return NextResponse.json({ error: 'Error al obtener invitaciones' }, { status: 500 });
  }
}

// POST /api/invitations - Create a new invitation with expiration (Admin Only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, 'Solo el administrador puede generar códigos de invitación');
    if (auth.response) return auth.response;
    const { payload } = auth;

    const body = await request.json();
    const { maxUses = 1, expirationPreset = '24h', customExpiresAt } = body;

    const now = Date.now();
    let calculatedExpiresAt: Date | null = null;

    if (expirationPreset === 'never') {
      calculatedExpiresAt = null;
    } else if (expirationPreset === 'custom' && customExpiresAt) {
      calculatedExpiresAt = new Date(customExpiresAt);
    } else {
      const hours = EXPIRATION_HOURS[expirationPreset] ?? 24;
      calculatedExpiresAt = new Date(now + hours * 60 * 60 * 1000);
    }

    let code = generateCode();
    while (await db.invitation.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const invitation = await db.invitation.create({
      data: {
        code,
        createdBy: payload.userId,
        maxUses: Number(maxUses) > 0 ? Number(maxUses) : 1,
        expiresAt: calculatedExpiresAt,
        isActive: true,
      },
      include: INVITATION_INCLUDE,
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

// PATCH /api/invitations - Revoke/Toggle an invitation code (Admin Only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, 'Sin permisos');
    if (auth.response) return auth.response;

    const { id, isActive } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID de invitación requerido' }, { status: 400 });

    const updated = await db.invitation.update({
      where: { id },
      data: { isActive: !!isActive },
      include: INVITATION_INCLUDE,
    });

    return NextResponse.json({ invitation: updated });
  } catch (error) {
    console.error('Invitations PATCH error:', error);
    return NextResponse.json({ error: 'Error al actualizar invitación' }, { status: 500 });
  }
}

// DELETE /api/invitations - Remove invitation (Admin Only)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, 'Sin permisos');
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await db.invitation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invitations DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar invitación' }, { status: 500 });
  }
}
