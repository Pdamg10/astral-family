'use client';
import React, { useState, useEffect } from 'react';
import type { BirthProfile } from '@/types/prisma-types';

interface LinkFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: BirthProfile[];
  initialProfileAId?: string | null;
  initialProfileBId?: string | null;
  initialRelationship?: 'partner' | 'sibling' | 'parent' | 'child';
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
  onRegisterNew?: (memberId?: string, relType?: 'partner' | 'sibling' | 'parent' | 'child') => void;
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
  accentColor = '#f59e0b',
  cardBg = 'rgba(15, 12, 28, 0.95)',
  borderRadius = '16px',
  onSuccess,
  onError,
  onRegisterNew,
}: LinkFamilyModalProps) {
  const isUserAdmin = userRole === 'admin';

  // Available options for Profile A:
  // If admin: all profiles. If member: member's own profiles.
  const myProfiles = profiles.filter(
    p => p.createdBy === currentUserId || (currentUserName && p.name.trim().toLowerCase() === currentUserName.trim().toLowerCase())
  );
  const selectableAsA = isUserAdmin ? profiles : (myProfiles.length > 0 ? myProfiles : profiles);

  const [profileAId, setProfileAId] = useState<string>(initialProfileAId || selectableAsA[0]?.id || '');
  const [relationship, setRelationship] = useState<'partner' | 'sibling' | 'parent' | 'child'>(initialRelationship);
  const [profileBId, setProfileBId] = useState<string>(initialProfileBId || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialProfileAId) {
      setProfileAId(initialProfileAId);
    } else if (selectableAsA.length > 0 && !selectableAsA.some(p => p.id === profileAId)) {
      setProfileAId(selectableAsA[0].id);
    }
  }, [initialProfileAId, selectableAsA]);

  useEffect(() => {
    if (initialProfileBId) {
      setProfileBId(initialProfileBId);
    } else {
      const remaining = profiles.filter(p => p.id !== profileAId);
      if (remaining.length > 0 && !remaining.some(p => p.id === profileBId)) {
        setProfileBId(remaining[0].id);
      }
    }
  }, [profileAId, initialProfileBId, profiles]);

  if (!isOpen) return null;

  const profA = profiles.find(p => p.id === profileAId);
  const profB = profiles.find(p => p.id === profileBId);

  const handleSave = async () => {
    if (!profileAId || !profileBId) {
      onError('Por favor selecciona ambos miembros familiares');
      return;
    }
    if (profileAId === profileBId) {
      onError('No puedes vincular un perfil consigo mismo');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/profiles/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileIdA: profileAId,
          relationship,
          profileIdB: profileBId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al establecer vínculo');
      }

      onSuccess(data.message || 'Vínculo establecido con éxito');
      onClose();
    } catch (err: any) {
      onError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const relationshipOptions = [
    {
      id: 'partner',
      label: '💍 Es Pareja de',
      description: 'Cónyuge o pareja sentimental',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      activeBg: 'border-pink-500 bg-pink-500/20 shadow-pink-500/20',
    },
    {
      id: 'sibling',
      label: '👥 Es Hermano/a de',
      description: 'Hermanos de sangre o familia',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      activeBg: 'border-sky-500 bg-sky-500/20 shadow-sky-500/20',
    },
    {
      id: 'parent',
      label: '👨‍👩‍👧 Es Padre/Madre de',
      description: 'Ascendencia / Progenitor(a)',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      activeBg: 'border-purple-500 bg-purple-500/20 shadow-purple-500/20',
    },
    {
      id: 'child',
      label: '👶 Es Hijo/a de',
      description: 'Descendencia directa',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      activeBg: 'border-amber-500 bg-amber-500/20 shadow-amber-500/20',
    },
  ] as const;

  const getSummaryText = () => {
    if (!profA || !profB) return '';
    switch (relationship) {
      case 'partner':
        return `💍 ${profA.name} y ${profB.name} serán vinculados como Pareja mutuamente.`;
      case 'sibling':
        return `👥 ${profA.name} y ${profB.name} serán vinculados como Hermanos/as.`;
      case 'parent':
        return `👨‍👩‍👧 ${profA.name} será registrado como Padre/Madre de ${profB.name}.`;
      case 'child':
        return `👶 ${profA.name} será registrado como Hijo/a de ${profB.name}.`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl text-white relative space-y-5"
        style={{ background: cardBg, borderRadius }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔗</span>
            <div>
              <h2 className="text-base font-semibold text-white">Vincular Parentesco Familiar</h2>
              <p className="text-[11px] text-white/40">Conecta a dos miembros de la familia fácilmente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Member A */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center justify-between">
            <span>1. Integrante Principal:</span>
            {!isUserAdmin && <span className="text-[10px] text-purple-300">Tu perfil</span>}
          </label>
          <select
            value={profileAId}
            onChange={e => setProfileAId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition-colors [color-scheme:dark] cursor-pointer"
          >
            {selectableAsA.map(p => (
              <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                👤 {p.name} {p.birthDate ? `(nac. ${p.birthDate.split('-')[0]})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Relationship Selector */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-2">
            2. ¿Qué parentesco tiene con el otro miembro?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {relationshipOptions.map(opt => {
              const isSelected = relationship === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRelationship(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${opt.activeBg} border-2 shadow-md`
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                  }`}
                >
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[10px] text-white/40 mt-0.5">{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Member B */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5">
            3. Vincular con:
          </label>
          <select
            value={profileBId}
            onChange={e => setProfileBId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition-colors [color-scheme:dark] cursor-pointer"
          >
            {profiles
              .filter(p => p.id !== profileAId)
              .map(p => (
                <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                  👤 {p.name} {p.birthDate ? `(nac. ${p.birthDate.split('-')[0]})` : ''}
                </option>
              ))}
          </select>
        </div>

        {/* Summary Card */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-white/90 font-medium">{getSummaryText()}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {onRegisterNew && (
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
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !profileAId || !profileBId}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
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
    </div>
  );
}
