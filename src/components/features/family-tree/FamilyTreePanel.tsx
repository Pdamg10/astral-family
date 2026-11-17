'use client';
import React, { useState, useMemo } from 'react';
import type { BirthProfile } from '@/types/prisma-types';
import type { SynastryResult } from '@/types/astrology';
import { calculateSynastry } from '@/services/astrology/synastry';
import { getPlanetSymbol, getAspectSymbol, getSignEmoji, signToAbsoluteDegree, calculateAge } from '@/services/astrology/utils';

interface FamilyTreePanelProps {
  profiles: BirthProfile[];
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg: string;
  borderRadius: string;
  currentUserId?: string;
  currentUserName?: string;
  userRole?: string;
  onSelectProfile?: (profile: BirthProfile) => void;
  onLinkFamily?: (profileId: string) => void;
  onAddChild?: (parentProfileId?: string) => void;
  onAddPartner?: (profileId?: string) => void;
  onAddSibling?: (profileId?: string) => void;
}

export default function FamilyTreePanel({
  profiles = [],
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg,
  borderRadius,
  currentUserId,
  currentUserName,
  userRole = 'member',
  onSelectProfile,
  onLinkFamily,
  onAddChild,
  onAddPartner,
  onAddSibling,
}: FamilyTreePanelProps) {
  const [activeTab, setActiveTab] = useState<'tree' | 'synastry'>('tree');
  const [synAId, setSynAId] = useState<string>(profiles[0]?.id || '');
  const [synBId, setSynBId] = useState<string>(profiles[1]?.id || '');

  const isUserAdmin = userRole === 'admin';

  // Calculate pairs / couples (supports 1 or multiple partners per profile)
  const couples = useMemo(() => {
    const pairs: { p1: BirthProfile; p2: BirthProfile }[] = [];
    const seen = new Set<string>();

    profiles.forEach(p => {
      const partnerRefs = p.partners?.length
        ? p.partners
        : (p.partner ? [p.partner] : []);

      partnerRefs.forEach(ref => {
        const partner = profiles.find(other => other.id === ref.id);
        if (partner) {
          const key = [p.id, partner.id].sort().join('--');
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push({ p1: p, p2: partner });
          }
        }
      });
    });

    return pairs;
  }, [profiles]);

  // Group members into roots (founders / parents without parents in database) and descendants
  const { rootMembers, childMembers } = useMemo(() => {
    const roots: BirthProfile[] = [];
    const children: BirthProfile[] = [];

    profiles.forEach(p => {
      if (p.parentId || p.parent2Id) {
        children.push(p);
      } else {
        roots.push(p);
      }
    });

    // Sort chronologically by birth date
    const sortByDate = (a: BirthProfile, b: BirthProfile) => {
      const dA = a.birthDate ? new Date(a.birthDate).getTime() : 0;
      const dB = b.birthDate ? new Date(b.birthDate).getTime() : 0;
      return dA - dB;
    };

    return {
      rootMembers: roots.sort(sortByDate),
      childMembers: children.sort(sortByDate),
    };
  }, [profiles]);

  // Synastry calculation for the pairwise tab
  const synResult = useMemo<SynastryResult | null>(() => {
    if (!synAId || !synBId || synAId === synBId) return null;
    const profA = profiles.find(p => p.id === synAId);
    const profB = profiles.find(p => p.id === synBId);
    if (!profA?.planetaryPositions || !profB?.planetaryPositions) return null;

    const posA = profA.planetaryPositions.map((pp: any) => ({
      body: pp.body, sign: pp.sign, degree: pp.degree, minute: pp.minute,
      absoluteDegree: signToAbsoluteDegree(pp.sign, pp.degree, pp.minute), retrograde: pp.retrograde,
    }));
    const posB = profB.planetaryPositions.map((pp: any) => ({
      body: pp.body, sign: pp.sign, degree: pp.degree, minute: pp.minute,
      absoluteDegree: signToAbsoluteDegree(pp.sign, pp.degree, pp.minute), retrograde: pp.retrograde,
    }));
    return calculateSynastry(profA.name, posA, profB.name, posB);
  }, [profiles, synAId, synBId]);

  const inp = 'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-500/50';

  const isOwn = (p: BirthProfile) => {
    if (!currentUserId && !currentUserName) return false;
    return p.createdBy === currentUserId || (currentUserName && p.name.trim().toLowerCase() === currentUserName.trim().toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-1">
          <span>🌳 Genealogía & Compatibilidad Astral</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wider">
          ✦ Árbol Genealógico & Linaje Familiar
        </h1>
        <p className="text-white/50 text-xs max-w-2xl mx-auto">
          Descubre las conexiones de parentesco, parejas, padres e hijos de la familia junto a su armonía astrológica y cartas natales.
        </p>

        {/* View Mode Toggle */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex p-1 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tree' ? 'text-white shadow-lg' : 'text-white/50 hover:text-white'
              }`}
              style={activeTab === 'tree' ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` } : undefined}
            >
              <span>🌳 Árbol Genealógico</span>
            </button>
            <button
              onClick={() => setActiveTab('synastry')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'synastry' ? 'text-white shadow-lg' : 'text-white/50 hover:text-white'
              }`}
              style={activeTab === 'synastry' ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` } : undefined}
            >
              <span>💞 Sinastría & Compatibilidad</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: VISUAL FAMILY TREE */}
      {activeTab === 'tree' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Quick Relationship Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="p-5 backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-4"
              style={{ background: cardBg, borderRadius }}
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-2xl">
                💍
              </div>
              <div>
                <span className="text-[11px] text-white/40 uppercase tracking-wider block">Parejas Vinculadas</span>
                <span className="text-xl font-semibold text-white">{couples.length} Pareja{couples.length === 1 ? '' : 's'}</span>
              </div>
            </div>

            <div
              className="p-5 backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-4"
              style={{ background: cardBg, borderRadius }}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl">
                👨‍👩‍👧
              </div>
              <div>
                <span className="text-[11px] text-white/40 uppercase tracking-wider block">Padres / Tronco</span>
                <span className="text-xl font-semibold text-white">{rootMembers.length} Miembro{rootMembers.length === 1 ? '' : 's'}</span>
              </div>
            </div>

            <div
              className="p-5 backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-4"
              style={{ background: cardBg, borderRadius }}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
                👶
              </div>
              <div>
                <span className="text-[11px] text-white/40 uppercase tracking-wider block">Descendientes / Hijos</span>
                <span className="text-xl font-semibold text-white">{childMembers.length} Hijo{childMembers.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>

          {/* Couples / Parejas Section */}
          {couples.length > 0 && (
            <div
              className="p-6 backdrop-blur-xl border border-white/10 shadow-2xl space-y-4"
              style={{ background: cardBg, borderRadius }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💍</span>
                  <h2 className="text-base font-medium text-white">Vínculos de Pareja</h2>
                </div>
                <span className="text-xs text-white/40">Uniones familiares registradas</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {couples.map(({ p1, p2 }, idx) => {
                  const sun1 = p1.planetaryPositions?.find((p: any) => p.body === 'Sun');
                  const sun2 = p2.planetaryPositions?.find((p: any) => p.body === 'Sun');

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onSelectProfile && onSelectProfile(p1)}
                            className="text-left group cursor-pointer"
                          >
                            <span className="text-sm font-semibold text-white group-hover:text-pink-300 transition-colors block">
                              {p1.name}
                            </span>
                            <span className="text-[10px] text-white/50">
                              ☉ {sun1?.sign || ''} · {calculateAge(p1.birthDate)} años
                            </span>
                          </button>

                          <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs">
                            ❤️ Pareja
                          </span>

                          <button
                            onClick={() => onSelectProfile && onSelectProfile(p2)}
                            className="text-left group cursor-pointer"
                          >
                            <span className="text-sm font-semibold text-white group-hover:text-pink-300 transition-colors block">
                              {p2.name}
                            </span>
                            <span className="text-[10px] text-white/50">
                              ☉ {sun2?.sign || ''} · {calculateAge(p2.birthDate)} años
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-white/60 text-[11px]">
                          🔗 Vínculo conyugal registrado
                        </span>
                        <button
                          onClick={() => {
                            setSynAId(p1.id);
                            setSynBId(p2.id);
                            setActiveTab('synastry');
                          }}
                          className="px-3 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-200 text-xs font-medium transition-all cursor-pointer"
                        >
                          Ver Sinastría de Pareja →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GENERATIONAL TREE CARDS */}
          <div
            className="p-6 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6"
            style={{ background: cardBg, borderRadius }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
              <div>
                <h2 className="text-base font-medium text-white flex items-center gap-2">
                  <span>🌳</span>
                  <span>Estructura Generacional & Linajes</span>
                </h2>
                <p className="text-xs text-white/40">Visualiza quién es padre/madre, quién es hijo/a y sus cartas natales</p>
              </div>

              {(isUserAdmin || onAddChild) && (
                <button
                  onClick={() => onAddChild && onAddChild()}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>👶 + Registrar Integrante / Hijo</span>
                </button>
              )}
            </div>

            {/* Tree Nodes by Family Branches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profiles.map(member => {
                const sun = member.planetaryPositions?.find((pp: any) => pp.body === 'Sun');
                const moon = member.planetaryPositions?.find((pp: any) => pp.body === 'Moon');
                const asc = member.chartPoints?.find((cp: any) => cp.point === 'Ascendant') || member.houses?.find((h: any) => h.houseNumber === 1);
                const age = calculateAge(member.birthDate);
                const isMine = isOwn(member);
                const canAddChildForThis = isUserAdmin || isMine;

                return (
                  <div
                    key={member.id}
                    className={`p-5 rounded-2xl border transition-all hover:border-purple-400/40 relative flex flex-col justify-between shadow-lg ${
                      isMine
                        ? 'bg-purple-950/20 border-purple-500/40 shadow-purple-950/40'
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isMine && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 font-semibold">
                              ✦ Mi Perfil
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                            {member.parentId || member.parent2Id ? '👶 Hijo/a' : '👑 Tronco / Raíz'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                          {age} años
                        </span>
                      </div>

                      {/* Name & Basic Info */}
                      <h3 className="text-lg font-medium text-white mb-1 flex items-center gap-1.5">
                        <span>{member.name}</span>
                      </h3>

                      <p className="text-xs text-white/50 mb-3">
                        🎂 {member.birthDate} · 📍 {member.city}, {member.country}
                      </p>

                      {/* Astrology Trinity */}
                      {sun && (
                        <div className="grid grid-cols-3 gap-1.5 text-center mb-3">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px]">
                            <span className="text-amber-400 block font-bold">☉ Sol</span>
                            <span className="text-white/90 truncate block">{sun.sign}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[10px]">
                            <span className="text-sky-300 block font-bold">☽ Luna</span>
                            <span className="text-white/90 truncate block">{moon?.sign || '-'}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px]">
                            <span className="text-purple-300 block font-bold">AC Asc</span>
                            <span className="text-white/90 truncate block">{asc?.sign || '-'}</span>
                          </div>
                        </div>
                      )}

                      {/* Relationship Connections */}
                      <div className="space-y-1.5 text-xs text-white/70 pt-2 border-t border-white/5">
                        {/* Pareja(s) */}
                        {(() => {
                          const partnerList = member.partners?.length ? member.partners : (member.partner ? [member.partner] : []);
                          if (partnerList.length === 0) return null;
                          return (
                            <div className="space-y-0.5">
                              <span className="text-white/40 text-[11px]">
                                💍 {partnerList.length > 1 ? `Parejas (${partnerList.length}):` : 'Pareja:'}
                              </span>
                              <div className="flex flex-wrap gap-1 pl-1">
                                {partnerList.map(pt => (
                                  <span
                                    key={pt.id}
                                    className="px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-200 text-[10px] font-semibold"
                                  >
                                    💍 {pt.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Abuelos */}
                        {member.grandparents && member.grandparents.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">👴 Abuelos ({member.grandparents.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.grandparents.map(gp => (
                                <span
                                  key={gp.id}
                                  className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-[10px]"
                                >
                                  👴 {gp.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Padres */}
                        {(member.parent || member.parent2) && (
                          <div className="space-y-0.5">
                            <span className="text-white/40 text-[11px]">👨‍👩‍👧 Padres / Madres:</span>
                            <div className="text-pink-200 font-medium pl-2">
                              {member.parent && <div>• {member.parent.name}</div>}
                              {member.parent2 && <div>• {member.parent2.name}</div>}
                            </div>
                          </div>
                        )}

                        {/* Hermanos */}
                        {member.siblings && member.siblings.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">👥 Hermanos ({member.siblings.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.siblings.map(s => (
                                <span
                                  key={s.id}
                                  className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-200 text-[10px]"
                                >
                                  👥 {s.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cuñados */}
                        {member.inLaws && member.inLaws.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">🤝 Cuñados ({member.inLaws.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.inLaws.map(i => (
                                <span
                                  key={i.id}
                                  className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-200 text-[10px]"
                                >
                                  🤝 {i.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tíos */}
                        {member.unclesAunts && member.unclesAunts.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">🧓 Tíos ({member.unclesAunts.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.unclesAunts.map(u => (
                                <span
                                  key={u.id}
                                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-[10px]"
                                >
                                  🧓 {u.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sobrinos */}
                        {member.niecesNephews && member.niecesNephews.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">🧸 Sobrinos ({member.niecesNephews.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.niecesNephews.map(n => (
                                <span
                                  key={n.id}
                                  className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[10px]"
                                >
                                  🧸 {n.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Primos */}
                        {member.cousins && member.cousins.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">🫂 Primos ({member.cousins.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.cousins.map(c => (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-[10px]"
                                >
                                  🫂 {c.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nietos */}
                        {member.grandchildren && member.grandchildren.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">🧒 Nietos ({member.grandchildren.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.grandchildren.map(gc => (
                                <span
                                  key={gc.id}
                                  className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-200 text-[10px]"
                                >
                                  🧒 {gc.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suegros */}
                        {member.parentsInLaw && member.parentsInLaw.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">🏛️ Suegros ({member.parentsInLaw.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.parentsInLaw.map(pil => (
                                <span
                                  key={pil.id}
                                  className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-200 text-[10px]"
                                >
                                  🏛️ {pil.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Yernos / Nueras */}
                        {member.childrenInLaw && member.childrenInLaw.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">💐 Yernos/Nueras ({member.childrenInLaw.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.childrenInLaw.map(cil => (
                                <span
                                  key={cil.id}
                                  className="px-2 py-0.5 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-200 text-[10px]"
                                >
                                  💐 {cil.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hijos */}
                        {member.children && member.children.length > 0 && (
                          <div className="space-y-0.5 pt-1">
                            <span className="text-white/40 text-[11px]">👶 Hijos registrados ({member.children.length}):</span>
                            <div className="flex flex-wrap gap-1 pl-1">
                              {member.children.map(ch => (
                                <span
                                  key={ch.id}
                                  className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[10px]"
                                >
                                  👶 {ch.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-1.5 flex-wrap">
                      <button
                        onClick={() => onSelectProfile && onSelectProfile(member)}
                        className="flex-1 min-w-[110px] py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all cursor-pointer text-center"
                      >
                        Ver Carta 🎡
                      </button>

                      {canAddChildForThis && onLinkFamily ? (
                        <button
                          onClick={() => onLinkFamily(member.id)}
                          className="py-1.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          title={`Agregar, editar o quitar vínculos familiares de ${member.name}`}
                        >
                          <span>🔗</span>
                          <span>Gestionar Vínculos</span>
                        </button>
                      ) : (
                        <>
                          {canAddChildForThis && onAddPartner && (
                            <button
                              onClick={() => onAddPartner(member.id)}
                              className="py-1.5 px-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/30 text-[11px] font-medium transition-all cursor-pointer"
                              title={`Vincular pareja para ${member.name}`}
                            >
                              + 💍 Pareja
                            </button>
                          )}
                          {canAddChildForThis && onAddSibling && (
                            <button
                              onClick={() => onAddSibling(member.id)}
                              className="py-1.5 px-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/30 text-[11px] font-medium transition-all cursor-pointer"
                              title={`Agregar hermano/a para ${member.name}`}
                            >
                              + 👥 Hermano
                            </button>
                          )}
                          {canAddChildForThis && onAddChild && (
                            <button
                              onClick={() => onAddChild(member.id)}
                              className="py-1.5 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[11px] font-medium transition-all cursor-pointer"
                              title={`Agregar un hijo/a para ${member.name}`}
                            >
                              + 👶 Hijo
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERPERSONAL SYNASTRY CALCULATOR */}
      {activeTab === 'synastry' && (
        <div className="space-y-6 animate-in fade-in">
          <div
            className="p-6 backdrop-blur-xl border border-white/10 shadow-2xl space-y-4"
            style={{ background: cardBg, borderRadius }}
          >
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <span>💞</span>
                <span>Comparación Cruzada entre Dos Familiares</span>
              </h2>
              <p className="text-xs text-white/40">Selecciona dos miembros para calcular su índice de armonía y aspectos mutuos</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 text-xs mb-2">Persona 1</label>
                <select value={synAId} onChange={e => setSynAId(e.target.value)} className={inp}>
                  <option value="">Selecciona la primera persona...</option>
                  {profiles.map(pr => (
                    <option key={pr.id} value={pr.id} className="bg-gray-900">{pr.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-2">Persona 2</label>
                <select value={synBId} onChange={e => setSynBId(e.target.value)} className={inp}>
                  <option value="">Selecciona la segunda persona...</option>
                  {profiles.map(pr => (
                    <option key={pr.id} value={pr.id} disabled={pr.id === synAId} className="bg-gray-900">{pr.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick preset buttons for registered couples */}
            {couples.length > 0 && (
              <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-white/40">Atajos rápidos:</span>
                {couples.map(({ p1, p2 }, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSynAId(p1.id);
                      setSynBId(p2.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/30 transition-all cursor-pointer text-xs"
                  >
                    💍 {p1.name} & {p2.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {synResult && (
            <div className="space-y-6">
              <div className="backdrop-blur-xl border border-white/10 p-6 text-center shadow-2xl" style={{ background: cardBg, borderRadius }}>
                <h2 className="text-white/60 text-xs uppercase tracking-wider mb-2">Índice de Compatibilidad y Dinámica</h2>
                <div className="text-5xl font-light text-white mb-2" style={{ color: primaryColor }}>
                  {synResult.compatibilityScore}%
                </div>
                <p className="text-white/80 text-sm font-medium mb-4">{synResult.dominantDynamic}</p>
                <div className="flex items-center justify-center gap-6 text-xs text-white/60 flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Armónicos: {synResult.harmonicCount}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Retos/Tensión: {synResult.tenseCount}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Neutros: {synResult.neutralCount}</span>
                </div>
              </div>

              <div className="backdrop-blur-xl border border-white/10 p-6 shadow-2xl" style={{ background: cardBg, borderRadius }}>
                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Aspectos Cruzados de Sinastría ({synResult.aspects.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {synResult.aspects.map((asp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 text-xs">
                      <span className="text-white/90 font-medium w-32">{getPlanetSymbol(asp.body1 as any)} {asp.body1} (A)</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono ${asp.harmony === 'harmonic' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : asp.harmony === 'tense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                        {getAspectSymbol(asp.type)} {asp.type}
                      </span>
                      <span className="text-white/90 font-medium w-32 text-right">{getPlanetSymbol(asp.body2 as any)} {asp.body2} (B)</span>
                      <span className="text-white/40 text-[10px] w-16 text-right">{asp.orb}° orb</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
