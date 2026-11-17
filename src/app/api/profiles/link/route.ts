import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  isValidRelationship,
  RELATIONSHIP_LABELS,
  validateRelationshipAges,
} from '@/lib/genealogy';
import { applyRelationship, removeRelationship } from '@/services/familyLinks';

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

    if (payload.role !== 'admin' && profA.createdBy !== payload.userId) {
      return NextResponse.json(
        { error: 'Solo puedes gestionar los vínculos de tu propio perfil' },
        { status: 403 }
      );
    }

    const ageCheck = validateRelationshipAges(profA, relationship, profB);
    if (!ageCheck.valid) {
      return NextResponse.json(
        {
          error: ageCheck.error,
          suggestedRelationship: ageCheck.suggestedRelationship,
          suggestedLabel: ageCheck.suggestedLabel,
        },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      await applyRelationship(tx, profA.id, relationship, profB.id);
    });

    return NextResponse.json({
      success: true,
      message: `Vínculo de ${RELATIONSHIP_LABELS[relationship]} establecido entre ${profA.name} y ${profB.name}`,
    });
  } catch (error) {
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

    if (payload.role !== 'admin' && profA.createdBy !== payload.userId) {
      return NextResponse.json(
        { error: 'Solo puedes modificar los vínculos de tu propio perfil' },
        { status: 403 }
      );
    }

    const ageCheck = validateRelationshipAges(profA, newRelationship, newProfB);
    if (!ageCheck.valid) {
      return NextResponse.json(
        {
          error: ageCheck.error,
          suggestedRelationship: ageCheck.suggestedRelationship,
          suggestedLabel: ageCheck.suggestedLabel,
        },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      await removeRelationship(tx, profA.id, oldRelationship, oldProfB.id);
      await applyRelationship(tx, profA.id, newRelationship, newProfB.id);
    });

    return NextResponse.json({
      success: true,
      message: `Vínculo actualizado: ${profA.name} (${RELATIONSHIP_LABELS[newRelationship]}) ↔ ${newProfB.name}`,
    });
  } catch (error) {
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
      message: `Vínculo de ${RELATIONSHIP_LABELS[relationship]} eliminado entre ${profA.name} y ${profB.name}`,
    });
  } catch (error) {
    console.error('Family link DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar el vínculo familiar' }, { status: 500 });
  }
}
