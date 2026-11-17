'use client';
import React, { useState, useMemo } from 'react';
import type { BirthProfile } from '@/types/prisma-types';
import {
  RelationshipType,
  RELATIONSHIP_OPTIONS,
  isValidRelationship,
  validateRelationshipAges,
} from '@/lib/genealogy';
import { calculateAge } from '@/services/astrology/utils';

interface ExistingLinkItem {
  key: string;
  relationship: RelationshipType;
  targetId: string;
  targetName: string;
  badge: string;
  badgeClass: string;
  inheritedViaParents?: boolean;
}

interface LinkFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: BirthProfile[];
  initialProfileAId?: string | null;
  initialProfileBId?: string | null;
  initialRelationship?: RelationshipType;
  userRole?: string;
  currentUserId?: string;
  currentUserName?: string;
  token?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg?: string;
  borderRadius?: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onRegisterNew?: (memberId?: string, relType?: RelationshipType) => void;
}

const BADGE_FOR_REL: Record<RelationshipType, { badge: string; badgeClass: string }> = {
  grandparent: { badge: '🧒 Nieto/a', badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-500/40' },
  parent: { badge: '👶 Hijo/a', badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-500/40' },
  partner: { badge: '💍 Pareja', badgeClass: 'bg-pink-500/20 text-pink-200 border-pink-500/40' },
  sibling: { badge: '👥 Hermano/a', badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-500/40' },
  child: { badge: '👨‍👩‍👧 Padre/Madre', badgeClass: 'bg-purple-500/20 text-purple-200 border-purple-500/40' },
  grandchild: { badge: '👴 Abuelo/a', badgeClass: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40' },
  uncle_aunt: { badge: '🧸 Sobrino/a', badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40' },
  niece_nephew: { badge: '🧓 Tío/a', badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' },
  cousin: { badge: '🫂 Primo/a', badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' },
  parent_in_law: { badge: '💐 Yerno/Nuera', badgeClass: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/40' },
  child_in_law: { badge: '🏛️ Suegro/a', badgeClass: 'bg-violet-500/20 text-violet-200 border-violet-500/40' },
  in_law: { badge: '🤝 Cuñado/a', badgeClass: 'bg-teal-500/20 text-teal-200 border-teal-500/40' },
};

const GROUP_SECTIONS: { id: 'direct' | 'extended' | 'political'; title: string }[] = [
  { id: 'direct', title: 'Línea Directa (Abuelos → Nietos)' },
  { id: 'extended', title: 'Familia Extendida' },
  { id: 'political', title: 'Familia Política' },
];

function formatPersonOption(p: BirthProfile): string {
  if (!p.birthDate) return `👤 ${p.name}`;
  const age = calculateAge(p.birthDate);
  const year = p.birthDate.split('-')[0];
  return `👤 ${p.name} (${age} años · nac. ${year})`;
}

export default function LinkFamilyModal({
  isOpen,
  onClose,
  profiles,
  initialProfileAId,
  initialProfileBId,
  initialRelationship = 'partner',
  userRole = 'member',
  currentUserId,
  currentUserName,
  token,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  cardBg = 'rgba(15, 12, 28, 0.95)',
  borderRadius = '16px',
  onSuccess,
  onError,
  onRegisterNew,
}: LinkFamilyModalProps) {
  const isUserAdmin = userRole === 'admin';

  // Strict ownership: Admins can manage any profile; members ONLY their own profile(s)
  const selectableAsA = useMemo(() => {
    if (isUserAdmin) return profiles;
    return profiles.filter(
      p =>
        (currentUserId && p.createdBy === currentUserId) ||
        (currentUserName && p.name.trim().toLowerCase() === currentUserName.trim().toLowerCase())
    );
  }, [isUserAdmin, profiles, currentUserId, currentUserName]);

  const [selectedAId, setSelectedAId] = useState<string | null>(null);
  const [relationship, setRelationship] = useState<RelationshipType>(initialRelationship);
  const [selectedBId, setSelectedBId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<ExistingLinkItem | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validInitialA =
    initialProfileAId && selectableAsA.some(p => p.id === initialProfileAId)
      ? initialProfileAId
      : null;

  const profileAId =
    (selectedAId && selectableAsA.some(p => p.id === selectedAId) ? selectedAId : null) ||
    validInitialA ||
    selectableAsA[0]?.id ||
    '';

  const remainingProfiles = useMemo(
    () => profiles.filter(p => p.id !== profileAId),
    [profiles, profileAId]
  );

  const profileBId =
    (selectedBId && remainingProfiles.some(p => p.id === selectedBId) ? selectedBId : null) ||
    (initialProfileBId && initialProfileBId !== profileAId ? initialProfileBId : null) ||
    remainingProfiles[0]?.id ||
    '';

  const profA = profiles.find(p => p.id === profileAId);
  const profB = profiles.find(p => p.id === profileBId);

  // Real-time biological & generational age check
  const ageValidation = useMemo(() => {
    if (!profA || !profB) return { valid: true };
    return validateRelationshipAges(profA, relationship, profB);
  }, [profA, relationship, profB]);

  // Build list of existing links for profA
  const existingLinks = useMemo<ExistingLinkItem[]>(() => {
    if (!profA) return [];
    const items: ExistingLinkItem[] = [];
    const seen = new Set<string>();

    const pushUnique = (item: ExistingLinkItem) => {
      if (seen.has(item.key)) return;
      seen.add(item.key);
      items.push(item);
    };

    // 1. Partners (all many-to-many + legacy partners)
    (profA.partners || []).forEach(other => {
      pushUnique({
        key: `partner:${other.id}`,
        relationship: 'partner',
        targetId: other.id,
        targetName: other.name,
        ...BADGE_FOR_REL.partner,
      });
    });
    if (profA.partner) {
      pushUnique({
        key: `partner:${profA.partner.id}`,
        relationship: 'partner',
        targetId: profA.partner.id,
        targetName: profA.partner.name,
        ...BADGE_FOR_REL.partner,
      });
    }
    (profA.partnerOf || []).forEach(other => {
      pushUnique({
        key: `partner:${other.id}`,
        relationship: 'partner',
        targetId: other.id,
        targetName: other.name,
        ...BADGE_FOR_REL.partner,
      });
    });

    // 2. Parents (profA is 'child' of parent)
    [profA.parent, profA.parent2].filter(Boolean).forEach(par => {
      pushUnique({
        key: `child:${par!.id}`,
        relationship: 'child',
        targetId: par!.id,
        targetName: par!.name,
        ...BADGE_FOR_REL.child,
      });
    });

    // 3. Children (profA is 'parent' of child)
    (profA.children || []).forEach(ch => {
      pushUnique({
        key: `parent:${ch.id}`,
        relationship: 'parent',
        targetId: ch.id,
        targetName: ch.name,
        ...BADGE_FOR_REL.parent,
      });
    });

    // 4. Siblings (direct vs inherited via shared parents/chain)
    const directSiblingIds = new Set<string>();
    if (profA.sibling) directSiblingIds.add(profA.sibling.id);
    (profA.siblingOf || []).forEach(s => directSiblingIds.add(s.id));

    (profA.siblings || []).forEach(sib => {
      const isDirect = directSiblingIds.has(sib.id);
      pushUnique({
        key: `sibling:${sib.id}`,
        relationship: 'sibling',
        targetId: sib.id,
        targetName: sib.name,
        ...BADGE_FOR_REL.sibling,
        inheritedViaParents: !isDirect,
      });
    });

    // 5. Direct extended genealogical links (Abuelos, Nietos, Tíos, Sobrinos, Primos, Suegros, Yernos/Nueras, Cuñados)
    (profA.directFamilyLinks || []).forEach(fl => {
      if (!isValidRelationship(fl.relationship)) return;
      pushUnique({
        key: `${fl.relationship}:${fl.targetId}`,
        relationship: fl.relationship,
        targetId: fl.targetId,
        targetName: fl.targetName,
        ...BADGE_FOR_REL[fl.relationship],
      });
    });

    return items;
  }, [profA]);

  if (!isOpen) return null;

  const handleSelectProfileA = (newId: string) => {
    setSelectedAId(newId);
    setEditingLink(null);
    setConfirmDeleteKey(null);
  };

  const handleStartEdit = (link: ExistingLinkItem) => {
    setEditingLink(link);
    setRelationship(link.relationship);
    setSelectedBId(link.targetId);
    setConfirmDeleteKey(null);
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setRelationship(initialRelationship);
  };

  const handleSave = async () => {
    if (!profileAId || !profileBId) {
      onError('Por favor selecciona ambos miembros familiares');
      return;
    }
    if (profileAId === profileBId) {
      onError('No puedes vincular un perfil consigo mismo');
      return;
    }
    if (!ageValidation.valid) {
      onError(ageValidation.error || 'Inconsistencia generacional en las edades');
      return;
    }

    setIsLoading(true);
    try {
      const isEditing = Boolean(editingLink);
      const res = await fetch('/api/profiles/link', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          isEditing
            ? {
                profileIdA: profileAId,
                oldRelationship: editingLink!.relationship,
                oldProfileIdB: editingLink!.targetId,
                newRelationship: relationship,
                newProfileIdB: profileBId,
              }
            : {
                profileIdA: profileAId,
                relationship,
                profileIdB: profileBId,
              }
        ),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el vínculo');
      }

      setEditingLink(null);
      onSuccess(data.message || (isEditing ? 'Vínculo actualizado con éxito' : 'Vínculo establecido con éxito'));
    } catch (err: any) {
      onError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (link: ExistingLinkItem) => {
    if (!profileAId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        profileIdA: profileAId,
        relationship: link.relationship,
        profileIdB: link.targetId,
      });
      const res = await fetch(`/api/profiles/link?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar el vínculo');
      }
      if (editingLink?.key === link.key) {
        setEditingLink(null);
      }
      setConfirmDeleteKey(null);
      onSuccess(data.message || 'Vínculo eliminado con éxito');
    } catch (err: any) {
      onError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const getSummaryText = () => {
    if (!profA || !profB) return '';
    switch (relationship) {
      case 'grandparent':
        return `👴 ${profA.name} quedará registrado como Abuelo/a de ${profB.name} (y ${profB.name} como su Nieto/a).`;
      case 'parent':
        return `👨‍👩‍👧 ${profA.name} quedará registrado como Padre/Madre de ${profB.name}.`;
      case 'partner':
        return `💍 ${profA.name} y ${profB.name} quedarán vinculados como Pareja.`;
      case 'sibling':
        return `👥 ${profA.name} y ${profB.name} quedarán vinculados como Hermanos/as.`;
      case 'child':
        return `👶 ${profA.name} quedará registrado como Hijo/a de ${profB.name}.`;
      case 'grandchild':
        return `🧒 ${profA.name} quedará registrado como Nieto/a de ${profB.name} (y ${profB.name} como su Abuelo/a).`;
      case 'uncle_aunt':
        return `🧓 ${profA.name} quedará registrado como Tío/a de ${profB.name}.`;
      case 'niece_nephew':
        return `🧸 ${profA.name} quedará registrado como Sobrino/a de ${profB.name}.`;
      case 'cousin':
        return `🫂 ${profA.name} y ${profB.name} quedarán vinculados como Primos/as.`;
      case 'parent_in_law':
        return `🏛️ ${profA.name} quedará registrado como Suegro/a de ${profB.name}.`;
      case 'child_in_law':
        return `💐 ${profA.name} quedará registrado como Yerno/Nuera de ${profB.name}.`;
      case 'in_law':
        return `🤝 ${profA.name} y ${profB.name} quedarán vinculados como Cuñados/as.`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 shadow-2xl text-white relative space-y-5"
        style={{ background: cardBg, borderRadius }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <div>
              <h2 className="text-base font-semibold text-white">Gestionar Vínculos del Árbol Genealógico</h2>
              <p className="text-[11px] text-white/40">
                {isUserAdmin
                  ? 'Como Admin puedes gestionar todos los vínculos desde Abuelos hasta Nietos de cualquier integrante'
                  : 'Agrega, corrige o elimina los vínculos genealógicos de tu propio perfil'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {selectableAsA.length === 0 ? (
          <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <p className="text-xs text-amber-200 font-medium">
              Aún no tienes un perfil astral propio asociado para gestionar vínculos.
            </p>
            <p className="text-[11px] text-white/50">
              Completa tus datos de nacimiento en Configuración de Cuenta o registra tu carta natal primero.
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Member A */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center justify-between">
                <span>1. Integrante Principal:</span>
                <span className="text-[10px] text-purple-300">
                  {isUserAdmin ? '👑 Admin: todos los perfiles' : '🔒 Solo tus perfiles'}
                </span>
              </label>
              <select
                value={profileAId}
                onChange={e => handleSelectProfileA(e.target.value)}
                disabled={!isUserAdmin && selectableAsA.length <= 1}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition-colors [color-scheme:dark] cursor-pointer disabled:opacity-75"
              >
                {selectableAsA.map(p => (
                  <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                    {formatPersonOption(p)}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Existing Links List (Edit / Remove) */}
            {profA && (
              <div className="p-3.5 rounded-xl bg-black/35 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Vínculos actuales de {profA.name}</span>
                  </span>
                  <span className="text-[10px] text-white/40">{existingLinks.length} registrados</span>
                </div>

                {existingLinks.length === 0 ? (
                  <p className="text-[11px] text-white/40 text-center py-2">
                    Sin vínculos familiares registrados todavía.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {existingLinks.map(link => {
                      const isBeingEdited = editingLink?.key === link.key;
                      const isConfirmingDelete = confirmDeleteKey === link.key;

                      return (
                        <div
                          key={link.key}
                          className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-xs transition-all ${
                            isBeingEdited
                              ? 'bg-purple-500/20 border-purple-400/60'
                              : 'bg-white/[0.04] border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${link.badgeClass}`}>
                              {link.badge}
                            </span>
                            <span className="text-white/90 font-medium truncate">{link.targetName}</span>
                            {link.inheritedViaParents && (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 whitespace-nowrap"
                                title="Vínculo inferido automáticamente por padres/hermanos compartidos."
                              >
                                automático
                              </span>
                            )}
                          </div>

                          {!link.inheritedViaParents && (
                            <div className="flex items-center gap-1 shrink-0">
                              {isConfirmingDelete ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleDeleteLink(link)}
                                    className="px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => setConfirmDeleteKey(null)}
                                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/70 text-[10px] cursor-pointer"
                                  >
                                    No
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handleStartEdit(link)}
                                    title="Modificar tipo de parentesco o persona vinculada"
                                    className="px-2 py-1 rounded-md bg-white/5 hover:bg-purple-500/30 border border-white/10 hover:border-purple-400/50 text-white/80 hover:text-white text-[10px] transition-colors cursor-pointer"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => setConfirmDeleteKey(link.key)}
                                    title="Eliminar este vínculo"
                                    className="px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/20 text-rose-300 text-[10px] transition-colors cursor-pointer"
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Form Section: Create or Edit */}
            <div
              className={`p-4 rounded-xl border space-y-4 transition-all ${
                editingLink
                  ? 'bg-purple-950/30 border-purple-400/50'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>{editingLink ? '✏️' : '➕'}</span>
                  <span>
                    {editingLink
                      ? `Editando vínculo con ${editingLink.targetName}`
                      : 'Agregar nuevo vínculo'}
                  </span>
                </span>
                {editingLink && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-[11px] text-white/50 hover:text-white underline cursor-pointer"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {/* Step 2: Member B (select relative first or alongside relationship) */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  2. {editingLink ? 'Familiar vinculado:' : 'Vincular con:'}
                </label>
                <select
                  value={profileBId}
                  onChange={e => setSelectedBId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition-colors [color-scheme:dark] cursor-pointer"
                >
                  {remainingProfiles.map(p => (
                    <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                      {formatPersonOption(p)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Complete Genealogical Relationship Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/70">
                  3. ¿Qué parentesco tiene <strong className="text-purple-200">{profA?.name || 'este integrante'}</strong> con{' '}
                  <strong className="text-purple-200">{profB?.name || 'el otro miembro'}</strong>?
                </label>

                {GROUP_SECTIONS.map(section => {
                  const opts = RELATIONSHIP_OPTIONS.filter(o => o.group === section.id);
                  return (
                    <div key={section.id} className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block">
                        {section.title}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {opts.map(opt => {
                          const isSelected = relationship === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setRelationship(opt.id)}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? `${opt.activeBg} border-2 shadow-md`
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                              }`}
                            >
                              <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
                              <span className="text-[9px] text-white/45 mt-0.5 leading-tight">{opt.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Generational Age Validation Warning + 1-Click Auto-Fix */}
              {!ageValidation.valid ? (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/50 space-y-2.5">
                  <p className="text-xs text-amber-200 leading-relaxed">
                    ⚠️ {ageValidation.error}
                  </p>
                  {ageValidation.suggestedRelationship && (
                    <button
                      type="button"
                      onClick={() => setRelationship(ageValidation.suggestedRelationship!)}
                      className="px-3 py-1.5 rounded-lg bg-amber-400/25 hover:bg-amber-400/35 border border-amber-300/60 text-amber-100 text-xs font-semibold transition-all cursor-pointer"
                    >
                      ✨ Cambiar automáticamente a {ageValidation.suggestedLabel}
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-white/90 font-medium">{getSummaryText()}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {onRegisterNew && !editingLink && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRegisterNew(profileAId, relationship);
                    }}
                    className="text-[11px] text-purple-300 hover:text-purple-200 underline cursor-pointer transition-colors"
                  >
                    + Registrar nuevo miembro
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading || !profileAId || !profileBId || !ageValidation.valid}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : editingLink ? (
                      <>
                        <span>💾</span>
                        <span>Guardar Cambios</span>
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        <span>Guardar Vínculo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
