'use client';
import React, { useState, useMemo } from 'react';
import { searchCities } from '@/lib/cities';
import type { CityData } from '@/lib/cities';
import type { BirthProfile } from '@/types/prisma-types';
import { RelationshipType, RELATIONSHIP_OPTIONS, validateRelationshipAges } from '@/lib/genealogy';
import { calculateAge } from '@/services/astrology/utils';

interface AddProfileFormProps {
  primaryColor: string;
  cardBg: string;
  borderRadius: string;
  existingProfiles?: BirthProfile[];
  defaultParentId?: string | null;
  defaultPartnerId?: string | null;
  defaultSiblingId?: string | null;
  userRole?: string;
  currentUserId?: string;
  currentUserName?: string;
  onSave: (data: {
    name: string;
    birthDate: string;
    birthTime: string | null;
    timeUnknown: boolean;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    parentId?: string | null;
    parent2Id?: string | null;
    partnerId?: string | null;
    siblingId?: string | null;
    linkTargetId?: string | null;
    linkRelationship?: RelationshipType | null;
  }) => Promise<boolean>;
}

export default function AddProfileForm({
  primaryColor,
  cardBg,
  borderRadius,
  existingProfiles = [],
  defaultParentId = null,
  defaultPartnerId = null,
  defaultSiblingId = null,
  userRole = 'member',
  currentUserId,
  currentUserName,
  onSave,
}: AddProfileFormProps) {
  const isUserAdmin = userRole === 'admin';
  const myProfiles = existingProfiles.filter(
    p => p.createdBy === currentUserId || (currentUserName && p.name.trim().toLowerCase() === currentUserName.trim().toLowerCase())
  );
  const initialMemberId = defaultPartnerId || defaultSiblingId || defaultParentId || null;
  const initialRelType: RelationshipType | 'none' = defaultPartnerId
    ? 'partner'
    : defaultSiblingId
    ? 'sibling'
    : defaultParentId
    ? 'child'
    : 'none';

  const [bpN, setBpN] = useState('');
  const [bpD, setBpD] = useState('');
  const [bpT, setBpT] = useState('');
  const [bpTU, setBpTU] = useState(false);
  const [bpCS, setBpCS] = useState('');
  const [bpC, setBpC] = useState<CityData | null>(null);
  const [targetMemberId, setTargetMemberId] = useState<string | null>(initialMemberId);
  const [relType, setRelType] = useState<RelationshipType | 'none'>(initialRelType);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cityRes = searchCities(bpCS);
  const selectedTarget = existingProfiles.find(p => p.id === targetMemberId);

  // Real-time generational validation when registering a new member with a relationship
  const ageValidation = useMemo(() => {
    if (!selectedTarget || !bpD || relType === 'none') return { valid: true };
    return validateRelationshipAges(
      { name: bpN.trim() || 'Esta persona', birthDate: bpD },
      relType,
      selectedTarget
    );
  }, [bpN, bpD, relType, selectedTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!bpC) {
      setErrorMsg('Por favor selecciona una ciudad de la lista');
      return;
    }

    if (!ageValidation.valid) {
      setErrorMsg(ageValidation.error || 'Inconsistencia generacional en las edades');
      return;
    }

    let pId: string | null = null;
    let p2Id: string | null = null;
    let partId: string | null = null;
    let sibId: string | null = null;
    let linkTargetId: string | null = null;
    let linkRelationship: RelationshipType | null = null;

    if (targetMemberId && relType !== 'none') {
      const targetProf = existingProfiles.find(p => p.id === targetMemberId);
      if (relType === 'partner') {
        partId = targetMemberId;
        linkTargetId = targetMemberId;
        linkRelationship = 'partner';
      } else if (relType === 'sibling') {
        sibId = targetMemberId;
        if (targetProf) {
          pId = targetProf.parentId || null;
          p2Id = targetProf.parent2Id || null;
        }
      } else if (relType === 'child') {
        pId = targetMemberId;
        if (targetProf?.partner) {
          p2Id = targetProf.partner.id || null;
        }
      } else {
        // parent, grandparent, grandchild, uncle_aunt, niece_nephew, cousin, parent_in_law, child_in_law, in_law
        linkTargetId = targetMemberId;
        linkRelationship = relType;
      }
    }

    setIsSaving(true);
    const success = await onSave({
      name: bpN,
      birthDate: bpD,
      birthTime: bpTU ? null : bpT || null,
      timeUnknown: bpTU,
      city: bpC.city,
      country: bpC.country,
      latitude: bpC.lat,
      longitude: bpC.lng,
      timezone: bpC.tz,
      parentId: pId,
      parent2Id: p2Id,
      partnerId: partId,
      siblingId: sibId,
      linkTargetId,
      linkRelationship,
    });

    setIsSaving(false);
    if (success) {
      setBpN('');
      setBpD('');
      setBpT('');
      setBpCS('');
      setBpC(null);
      setBpTU(false);
      setTargetMemberId(null);
      setRelType('none');
    }
  };

  const inp = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50';
  const btn = 'w-full py-3 rounded-lg text-sm font-medium transition-all hover:opacity-90 cursor-pointer';

  return (
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-xl border border-white/10 p-6 space-y-5"
      style={{ background: cardBg, borderRadius }}
    >
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-white/50 text-xs mb-1.5">Nombre completo</label>
        <input
          value={bpN}
          onChange={e => setBpN(e.target.value)}
          placeholder="Nombre de la persona"
          required
          className={inp}
        />
      </div>

      {/* Vínculo Familiar Unificado */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
            <span>🌳</span>
            <span>Vínculo en el Árbol Genealógico (Opcional)</span>
          </label>
          <span className="text-[10px] text-purple-300">Abuelos → Nietos</span>
        </div>

        <div>
          <label className="block text-white/50 text-[11px] mb-1">¿Con qué integrante se vincula?</label>
          <select
            value={targetMemberId || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              setTargetMemberId(val);
              if (!val) setRelType('none');
              else if (relType === 'none') setRelType('child');
            }}
            className={`${inp} [color-scheme:dark] cursor-pointer text-xs`}
          >
            <option value="" className="bg-gray-900 text-white">🌱 Sin vínculo directo (Miembro independiente / Raíz)</option>
            {existingProfiles.map(p => (
              <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                👤 {p.name} {p.birthDate ? `(${calculateAge(p.birthDate)} años · nac. ${p.birthDate.split('-')[0]})` : ''}
              </option>
            ))}
          </select>
        </div>

        {targetMemberId && (
          <div className="space-y-2.5">
            <label className="block text-white/50 text-[11px]">
              ¿Qué parentesco tiene <strong className="text-white">{bpN.trim() || 'esta persona'}</strong> con{' '}
              <strong className="text-purple-300">{selectedTarget?.name}</strong>?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {RELATIONSHIP_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRelType(opt.id)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[11px] font-medium ${
                    relType === opt.id
                      ? `${opt.activeBg} text-white border-2 shadow-sm`
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>

            {!ageValidation.valid && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/50 space-y-2">
                <p className="text-[11px] text-amber-200 leading-relaxed">
                  ⚠️ {ageValidation.error}
                </p>
                {ageValidation.suggestedRelationship && (
                  <button
                    type="button"
                    onClick={() => setRelType(ageValidation.suggestedRelationship!)}
                    className="px-3 py-1 rounded-lg bg-amber-400/25 hover:bg-amber-400/35 border border-amber-300/60 text-amber-100 text-[11px] font-semibold cursor-pointer"
                  >
                    ✨ Cambiar automáticamente a {ageValidation.suggestedLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-white/50 text-xs mb-1.5">Fecha de nacimiento</label>
        <input
          type="date"
          value={bpD}
          onChange={e => setBpD(e.target.value)}
          required
          className={`${inp} [color-scheme:dark]`}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-white/50 text-xs mb-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={bpTU}
            onChange={e => setBpTU(e.target.checked)}
            className="rounded"
          />
          Hora desconocida
        </label>
        {!bpTU ? (
          <>
            <input
              type="time"
              value={bpT}
              onChange={e => setBpT(e.target.value)}
              className={`${inp} [color-scheme:dark]`}
            />
            <p className="text-amber-400/60 text-[10px] mt-1">
              Sin hora precisa, Ascendente y casas pueden no ser exactos.
            </p>
          </>
        ) : (
          <p className="text-amber-400/80 text-xs p-3 bg-amber-400/5 border border-amber-400/20 rounded-lg">
            Ascendente y casas se estimarán al mediodía solar sin hora de nacimiento.
          </p>
        )}
      </div>

      <div className="relative">
        <label className="block text-white/50 text-xs mb-1.5">Ciudad de nacimiento</label>
        <input
          value={bpCS}
          onChange={e => {
            setBpCS(e.target.value);
            setBpC(null);
          }}
          placeholder="Buscar ciudad (ej. Caracas, Madrid, Bogotá, Buenos Aires)..."
          required
          className={inp}
        />
        {bpC && (
          <p className="text-white/40 text-[10px] mt-1">
            📍 {bpC.city}{bpC.state ? `, ${bpC.state}` : ''}, {bpC.country} (Zona Horaria: {bpC.tz})
          </p>
        )}
        {cityRes.length > 0 && !bpC && (
          <div className="absolute z-10 w-full mt-1 bg-gray-900/95 border border-white/10 rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
            {cityRes.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setBpC(c);
                  setBpCS(`${c.city}${c.state ? `, ${c.state}` : ''}, ${c.country}`);
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-white/80 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between"
              >
                <span className="font-medium text-white">{c.city}</span>
                <span className="text-white/50 text-[10px]">{c.state ? `${c.state}, ` : ''}{c.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className={`${btn} text-white`}
        style={{ background: primaryColor }}
      >
        {isSaving ? 'Calculando carta natal...' : 'Guardar y Calcular Carta'}
      </button>
    </form>
  );
}
