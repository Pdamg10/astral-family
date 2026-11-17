import { Prisma } from '@prisma/client';
import { RelationshipType } from '@/lib/genealogy';

/**
 * Maps an extended relationship (A is <rel> of B) into canonical (fromId, toId, canonicalRel)
 * stored in the FamilyLink table:
 * - Directed: grandparent (gp -> gc), uncle_aunt (uncle -> niece), parent_in_law (pil -> cil)
 * - Symmetric: cousin, in_law (sorted [minId, maxId])
 */
function toCanonicalFamilyLink(
  profileIdA: string,
  relationship: RelationshipType,
  profileIdB: string
): { fromId: string; toId: string; relationship: string } | null {
  switch (relationship) {
    case 'grandparent':
      return { fromId: profileIdA, toId: profileIdB, relationship: 'grandparent' };
    case 'grandchild':
      return { fromId: profileIdB, toId: profileIdA, relationship: 'grandparent' };
    case 'uncle_aunt':
      return { fromId: profileIdA, toId: profileIdB, relationship: 'uncle_aunt' };
    case 'niece_nephew':
      return { fromId: profileIdB, toId: profileIdA, relationship: 'uncle_aunt' };
    case 'parent_in_law':
      return { fromId: profileIdA, toId: profileIdB, relationship: 'parent_in_law' };
    case 'child_in_law':
      return { fromId: profileIdB, toId: profileIdA, relationship: 'parent_in_law' };
    case 'cousin':
    case 'in_law': {
      const [fromId, toId] = [profileIdA, profileIdB].sort();
      return { fromId, toId, relationship };
    }
    default:
      return null;
  }
}

export async function applyRelationship(
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
    const [pA, pB] = [profA.id, profB.id].sort();
    await tx.partnerLink.upsert({
      where: { profileAId_profileBId: { profileAId: pA, profileBId: pB } },
      create: { profileAId: pA, profileBId: pB },
      update: {},
    });

    if (!profA.partnerId) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { partnerId: profB.id } });
    }
    if (!profB.partnerId) {
      await tx.birthProfile.update({ where: { id: profB.id }, data: { partnerId: profA.id } });
    }
    return;
  }

  if (relationship === 'sibling') {
    if (!profA.siblingId || profA.siblingId === profB.id) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { siblingId: profB.id } });
    }
    if (!profB.siblingId || profB.siblingId === profA.id) {
      await tx.birthProfile.update({ where: { id: profB.id }, data: { siblingId: profA.id } });
    }
    if (profA.siblingId && profA.siblingId !== profB.id && profB.siblingId && profB.siblingId !== profA.id) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { siblingId: profB.id } });
    }

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
    return;
  }

  if (relationship === 'parent' || relationship === 'child') {
    const childProf = relationship === 'parent' ? profB : profA;
    const parentProf = relationship === 'parent' ? profA : profB;

    if (childProf.parentId === parentProf.id || childProf.parent2Id === parentProf.id) {
      return;
    }

    const field = !childProf.parentId ? 'parentId' : 'parent2Id';
    await tx.birthProfile.update({
      where: { id: childProf.id },
      data: { [field]: parentProf.id },
    });
    return;
  }

  const canonical = toCanonicalFamilyLink(profA.id, relationship, profB.id);
  if (canonical) {
    await tx.familyLink.upsert({
      where: {
        fromId_toId_relationship: {
          fromId: canonical.fromId,
          toId: canonical.toId,
          relationship: canonical.relationship,
        },
      },
      create: canonical,
      update: {},
    });
  }
}

export async function removeRelationship(
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
    const [pA, pB] = [profA.id, profB.id].sort();
    await tx.partnerLink.deleteMany({
      where: { profileAId: pA, profileBId: pB },
    });

    if (profA.partnerId === profB.id) {
      const remainingA = await tx.partnerLink.findFirst({
        where: { OR: [{ profileAId: profA.id }, { profileBId: profA.id }] },
      });
      const nextPartnerA = remainingA
        ? (remainingA.profileAId === profA.id ? remainingA.profileBId : remainingA.profileAId)
        : null;
      await tx.birthProfile.update({ where: { id: profA.id }, data: { partnerId: nextPartnerA } });
    }
    if (profB.partnerId === profA.id) {
      const remainingB = await tx.partnerLink.findFirst({
        where: { OR: [{ profileAId: profB.id }, { profileBId: profB.id }] },
      });
      const nextPartnerB = remainingB
        ? (remainingB.profileAId === profB.id ? remainingB.profileBId : remainingB.profileAId)
        : null;
      await tx.birthProfile.update({ where: { id: profB.id }, data: { partnerId: nextPartnerB } });
    }
    return;
  }

  if (relationship === 'sibling') {
    if (profA.siblingId === profB.id) {
      await tx.birthProfile.update({ where: { id: profA.id }, data: { siblingId: null } });
    }
    if (profB.siblingId === profA.id) {
      await tx.birthProfile.update({ where: { id: profB.id }, data: { siblingId: null } });
    }
    return;
  }

  if (relationship === 'parent' || relationship === 'child') {
    const childProf = relationship === 'parent' ? profB : profA;
    const parentProf = relationship === 'parent' ? profA : profB;

    const updates: { parentId?: string | null; parent2Id?: string | null } = {};
    if (childProf.parentId === parentProf.id) {
      updates.parentId = childProf.parent2Id && childProf.parent2Id !== parentProf.id ? childProf.parent2Id : null;
      updates.parent2Id = null;
    } else if (childProf.parent2Id === parentProf.id) {
      updates.parent2Id = null;
    }

    if (Object.keys(updates).length > 0) {
      await tx.birthProfile.update({ where: { id: childProf.id }, data: updates });
    }
    return;
  }

  const canonical = toCanonicalFamilyLink(profA.id, relationship, profB.id);
  if (canonical) {
    await tx.familyLink.deleteMany({
      where: {
        fromId: canonical.fromId,
        toId: canonical.toId,
        relationship: canonical.relationship,
      },
    });
  }
}
