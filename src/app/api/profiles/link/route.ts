import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const body = await request.json();
    const { profileIdA, relationship, profileIdB } = body;

    if (!profileIdA || !profileIdB || !relationship) {
      return NextResponse.json(
        { error: 'profileIdA, relationship y profileIdB son requeridos' },
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

    // Role check: admin can link any, regular user can link their own profile
    if (payload.role !== 'admin' && profA.createdBy !== payload.userId && profB.createdBy !== payload.userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para vincular estos perfiles' },
        { status: 403 }
      );
    }

    await db.$transaction(async (tx) => {
      if (relationship === 'partner') {
        // Reciprocal partner
        await tx.birthProfile.update({
          where: { id: profA.id },
          data: { partnerId: profB.id },
        });
        await tx.birthProfile.update({
          where: { id: profB.id },
          data: { partnerId: profA.id },
        });
      } else if (relationship === 'sibling') {
        // Direct sibling link
        await tx.birthProfile.update({
          where: { id: profA.id },
          data: { siblingId: profB.id },
        });
        await tx.birthProfile.update({
          where: { id: profB.id },
          data: { siblingId: profA.id },
        });

        // Inherit parents if one has and other doesn't
        if ((profB.parentId || profB.parent2Id) && (!profA.parentId && !profA.parent2Id)) {
          await tx.birthProfile.update({
            where: { id: profA.id },
            data: {
              parentId: profB.parentId || null,
              parent2Id: profB.parent2Id || null,
            },
          });
        } else if ((profA.parentId || profA.parent2Id) && (!profB.parentId && !profB.parent2Id)) {
          await tx.birthProfile.update({
            where: { id: profB.id },
            data: {
              parentId: profA.parentId || null,
              parent2Id: profA.parent2Id || null,
            },
          });
        }
      } else if (relationship === 'parent') {
        // profA is Parent of profB
        if (!profB.parentId || profB.parentId === profA.id) {
          await tx.birthProfile.update({
            where: { id: profB.id },
            data: { parentId: profA.id },
          });
        } else {
          await tx.birthProfile.update({
            where: { id: profB.id },
            data: { parent2Id: profA.id },
          });
        }
      } else if (relationship === 'child') {
        // profA is Child of profB (profB is parent of profA)
        if (!profA.parentId || profA.parentId === profB.id) {
          await tx.birthProfile.update({
            where: { id: profA.id },
            data: { parentId: profB.id },
          });
        } else {
          await tx.birthProfile.update({
            where: { id: profA.id },
            data: { parent2Id: profB.id },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Vínculo de ${relationship} establecido exitosamente entre ${profA.name} y ${profB.name}`,
    });
  } catch (error) {
    console.error('Family link error:', error);
    return NextResponse.json({ error: 'Error al vincular familiares' }, { status: 500 });
  }
}
