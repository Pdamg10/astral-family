import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

type RelationshipType = 'partner' | 'sibling' | 'parent' | 'child';

const VALID_RELATIONSHIPS = new Set<string>(['partner', 'sibling', 'parent', 'child']);

const REL_LABELS: Record<RelationshipType, string> = {
  partner: 'pareja',
  sibling: 'hermano/a',
  parent: 'padre/madre',
  child: 'hijo/a',
};

function isValidRelationship(rel: unknown): rel is RelationshipType {
  return typeof rel === 'string' && VALID_RELATIONSHIPS.has(rel);
}

async function applyRelationship(
  tx: Prisma.TransactionClient,
  profileIdA: string,
  relationship: RelationshipType,
  profileIdB: string,
  isAdmin: boolean
) {
  const [profA, profB] = await Promise.all([
    tx.birthProfile.findUnique({ where: { id: profileIdA } }),
    tx.birthProfile.findUnique({ where: { id: profileIdB } }),
  ]);
  if (!profA || !profB) throw new Error('Uno o ambos perfiles no existen');

  if (relationship === 'partner') {
    // Non-admin cannot overwrite another member's existing partner link with a third person
    if (!isAdmin && profB.partnerId && profB.partnerId !== profA.id) {
      throw new Error(`CONFLICT:${profB.name} ya tiene una pareja vinculada. Pide al administrador o a ${profB.name} que la actualice primero.`);
    }

    // Clear any stale reciprocal partner links so neither profile stays linked to an old partner
    await tx.birthProfile.updateMany({
      where: {
        OR: [{ partnerId: profA.id }, { partnerId: profB.id }],
        NOT: { id: { in: [profA.id, profB.id] } },
      },
      data: { partnerId: null },
    });

    await tx.birthProfile.update({ where: { id: profA.id }, data: { partnerId: profB.id } });
    await tx.birthProfile.update({ where: { id: profB.id }, data: { partnerId: profA.id } });
  } else if (relationship === 'sibling') {
    // Preserve existing sibling chain when possible while linking A <-> B
    if (!profA.siblingId || profA.siblingId === profB.id) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { siblingId: profB.id } });
    }
    if (!profB.siblingId || profB.siblingId === profA.id) {
      await tx.birthProfile.update({ where: { id: profB.id }, data: { siblingId: profA.id } });
    }
    if (profA.siblingId && profA.siblingId !== profB.id && profB.siblingId && profB.siblingId !== profA.id) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { siblingId: profB.id } });
    }

    // Inherit parents if one has parents and the other doesn't
    if ((profB.parentId || profB.parent2Id) && !profA.parentId && !profA.parent2Id) {
      await tx.birthProfile.update({
        where: { id: profA.id },
        data: { parentId: profB.parentId || null, parent2Id: profB.parent2Id || null },
      });
    } else if ((profA.parentId || profA.parent2Id) && !profB.parentId && !profB.parent2Id) {
      await tx.birthProfile.update({
        where: { id: profB.id },
        data: { parentId: profA.parentId || null, parent2Id: profA.parent2Id || null },
      });
    }
  } else {
    // 'parent' => profA is Parent of profB; 'child' => profB is Parent of profA
    const childProf = relationship === 'parent' ? profB : profA;
    const parentProf = relationship === 'parent' ? profA : profB;

    if (childProf.parentId === parentProf.id || childProf.parent2Id === parentProf.id) {
      return; // Already linked
    }

    const field = !childProf.parentId ? 'parentId' : 'parent2Id';
    await tx.birthProfile.update({
      where: { id: childProf.id },
      data: { [field]: parentProf.id },
    });
  }
}

async function removeRelationship(
  tx: Prisma.TransactionClient,
  profileIdA: string,
  relationship: RelationshipType,
  profileIdB: string
) {
  const [profA, profB] = await Promise.all([
    tx.birthProfile.findUnique({ where: { id: profileIdA } }),
    tx.birthProfile.findUnique({ where: { id: profileIdB } }),
  ]);
  if (!profA || !profB) throw new Error('Uno o ambos perfiles no existen');

  if (relationship === 'partner') {
    if (profA.partnerId === profB.id) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { partnerId: null } });
    }
    if (profB.partnerId === profA.id) {
      await tx.birthProfile.update({ where: { id: profB.id }, data: { partnerId: null } });
    }
  } else if (relationship === 'sibling') {
    if (profA.siblingId === profB.id) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { siblingId: null } });
    }
    if (profB.siblingId === profA.id) {
      await tx.birthProfile.update({ where: { id: profB.id }, data: { siblingId: null } });
    }
  } else {
    // 'parent' => profA is Parent of profB; 'child' => profB is Parent of profA
    const childProf = relationship === 'parent' ? profB : profA;
    const parentProf = relationship === 'parent' ? profA : profB;

    const updates: { parentId?: string | null; parent2Id?: string | null } = {};
    if (childProf.parentId === parentProf.id) {
      // Promote parent2Id into parentId slot to keep records tidy
      updates.parentId = childProf.parent2Id && childProf.parent2Id !== parentProf.id ? childProf.parent2Id : null;
      updates.parent2Id = null;
    } else if (childProf.parent2Id === parentProf.id) {
      updates.parent2Id = null;
    }

    if (Object.keys(updates).length > 0) {
      await tx.birthProfile.update({ where: { id: childProf.id }, data: updates });
    }
  }
}

// POST /api/profiles/link - Create a family link
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

    const body = await request.json();
    const { profileIdA, relationship, profileIdB } = body;

    if (!profileIdA || !profileIdB || !isValidRelationship(relationship)) {
      return NextResponse.json(
        { error: 'profileIdA, relationship válido y profileIdB son requeridos' },
        { status: 400 }
      );
    }

    if (profileIdA === profileIdB) {
      return NextResponse.json(
        { error: 'No puedes vincular un perfil consigo mismo' },
        { status: 400 }
      );
    }

    const [profA, profB] = await Promise.all([
      db.birthProfile.findUnique({ where: { id: profileIdA } }),
      db.birthProfile.findUnique({ where: { id: profileIdB } }),
    ]);

    if (!profA || !profB) {
      return NextResponse.json({ error: 'Uno o ambos perfiles no existen' }, { status: 404 });
    }

    // Strict ownership: Admin can link any profile; regular users can only link their own profile(s)
    if (payload.role !== 'admin' && profA.createdBy !== payload.userId) {
      return NextResponse.json(
        { error: 'Solo puedes gestionar los vínculos de tu propio perfil' },
        { status: 403 }
      );
    }

    await db.$transaction(async (tx) => {
      await applyRelationship(tx, profA.id, relationship, profB.id, payload.role === 'admin');
    });

    return NextResponse.json({
      success: true,
      message: `Vínculo de ${REL_LABELS[relationship]} establecido entre ${profA.name} y ${profB.name}`,
    });
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.startsWith('CONFLICT:')) {
      return NextResponse.json({ error: error.message.slice(9) }, { status: 409 });
    }
    console.error('Family link POST error:', error);
    return NextResponse.json({ error: 'Error al vincular familiares' }, { status: 500 });
  }
}

// PUT /api/profiles/link - Modify/replace an existing family link atomically
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

    const body = await request.json();
    const { profileIdA, oldRelationship, oldProfileIdB, newRelationship, newProfileIdB } = body;

    if (
      !profileIdA ||
      !oldProfileIdB ||
      !newProfileIdB ||
      !isValidRelationship(oldRelationship) ||
      !isValidRelationship(newRelationship)
    ) {
      return NextResponse.json(
        { error: 'Faltan parámetros válidos para modificar el vínculo familiar' },
        { status: 400 }
      );
    }

    if (profileIdA === newProfileIdB) {
      return NextResponse.json(
        { error: 'No puedes vincular un perfil consigo mismo' },
        { status: 400 }
      );
    }

    const [profA, oldProfB, newProfB] = await Promise.all([
      db.birthProfile.findUnique({ where: { id: profileIdA } }),
      db.birthProfile.findUnique({ where: { id: oldProfileIdB } }),
      db.birthProfile.findUnique({ where: { id: newProfileIdB } }),
    ]);

    if (!profA || !oldProfB || !newProfB) {
      return NextResponse.json({ error: 'Uno o más perfiles especificados no existen' }, { status: 404 });
    }

    // Strict ownership: Admin can edit anyone's links; regular users can only edit their own profile's links
    if (payload.role !== 'admin' && profA.createdBy !== payload.userId) {
      return NextResponse.json(
        { error: 'Solo puedes modificar los vínculos de tu propio perfil' },
        { status: 403 }
      );
    }

    await db.$transaction(async (tx) => {
      await removeRelationship(tx, profA.id, oldRelationship, oldProfB.id);
      await applyRelationship(tx, profA.id, newRelationship, newProfB.id, payload.role === 'admin');
    });

    return NextResponse.json({
      success: true,
      message: `Vínculo actualizado: ${profA.name} (${REL_LABELS[newRelationship]}) ↔ ${newProfB.name}`,
    });
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.startsWith('CONFLICT:')) {
      return NextResponse.json({ error: error.message.slice(9) }, { status: 409 });
    }
    console.error('Family link PUT error:', error);
    return NextResponse.json({ error: 'Error al modificar el vínculo familiar' }, { status: 500 });
  }
}

// DELETE /api/profiles/link - Remove an existing family link
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { payload } = auth;

    const { searchParams } = new URL(request.url);
    let profileIdA = searchParams.get('profileIdA');
    let relationship: unknown = searchParams.get('relationship');
    let profileIdB = searchParams.get('profileIdB');

    if (!profileIdA || !relationship || !profileIdB) {
      const body = await request.json().catch(() => ({}));
      profileIdA = profileIdA || body.profileIdA;
      relationship = relationship || body.relationship;
      profileIdB = profileIdB || body.profileIdB;
    }

    if (!profileIdA || !profileIdB || !isValidRelationship(relationship)) {
      return NextResponse.json(
        { error: 'profileIdA, relationship válido y profileIdB son requeridos' },
        { status: 400 }
      );
    }

    const [profA, profB] = await Promise.all([
      db.birthProfile.findUnique({ where: { id: profileIdA } }),
      db.birthProfile.findUnique({ where: { id: profileIdB } }),
    ]);

    if (!profA || !profB) {
      return NextResponse.json({ error: 'Uno o ambos perfiles no existen' }, { status: 404 });
    }

    // Strict ownership: Admin can unlink any pair; regular users can only unlink links involving their own profile(s)
    if (payload.role !== 'admin' && profA.createdBy !== payload.userId && profB.createdBy !== payload.userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar vínculos de otros usuarios' },
        { status: 403 }
      );
    }

    await db.$transaction(async (tx) => {
      await removeRelationship(tx, profA.id, relationship, profB.id);
    });

    return NextResponse.json({
      success: true,
      message: `Vínculo de ${REL_LABELS[relationship]} eliminado entre ${profA.name} y ${profB.name}`,
    });
  } catch (error) {
    console.error('Family link DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar el vínculo familiar' }, { status: 500 });
  }
}
