'use client';
import React, { useState, useEffect } from 'react';
import type { BirthProfile } from '@/types/prisma-types';
import type { SynastryResult } from '@/types/astrology';
import { calculateSynastry } from '@/services/astrology/synastry';
import { getPlanetSymbol, getAspectSymbol } from '@/services/astrology/utils';

interface SynastryPanelProps {
  profiles: BirthProfile[];
  primaryColor: string;
  cardBg: string;
  borderRadius: string;
}

function signToAbs(sign: string, deg: number): number {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const i = signs.indexOf(sign); return i >= 0 ? i * 30 + deg : deg;
}

export default function SynastryPanel({
  profiles,
  primaryColor,
  cardBg,
  borderRadius,
}: SynastryPanelProps) {
  const [synAId, setSynAId] = useState<string>(profiles[0]?.id || '');
  const [synBId, setSynBId] = useState<string>(profiles[1]?.id || '');

  const synResult = React.useMemo<SynastryResult | null>(() => {
    if (!synAId || !synBId || synAId === synBId) return null;
    const profA = profiles.find(p => p.id === synAId);
    const profB = profiles.find(p => p.id === synBId);
    if (!profA?.planetaryPositions || !profB?.planetaryPositions) return null;

    const posA = profA.planetaryPositions.map((pp: any) => ({
      body: pp.body, sign: pp.sign, degree: pp.degree, minute: pp.minute,
      absoluteDegree: signToAbs(pp.sign, pp.degree), retrograde: pp.retrograde,
    }));
    const posB = profB.planetaryPositions.map((pp: any) => ({
      body: pp.body, sign: pp.sign, degree: pp.degree, minute: pp.minute,
      absoluteDegree: signToAbs(pp.sign, pp.degree), retrograde: pp.retrograde,
    }));
    return calculateSynastry(profA.name, posA, profB.name, posB);
  }, [profiles, synAId, synBId]);

  const inp = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-light text-white tracking-wider mb-1">💞 Sinastría Interpersonal</h1>
        <p className="text-white/40 text-xs">Compara los aspectos astrológicos y grado de armonía entre dos miembros familiares</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 backdrop-blur-xl border border-white/10 p-6" style={{ background: cardBg, borderRadius }}>
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

      {synResult && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl border border-white/10 p-6 text-center" style={{ background: cardBg, borderRadius }}>
            <h2 className="text-white/60 text-xs uppercase tracking-wider mb-2">Índice de Compatibilidad y Dinámica</h2>
            <div className="text-5xl font-light text-white mb-2" style={{ color: primaryColor }}>
              {synResult.compatibilityScore}%
            </div>
            <p className="text-white/80 text-sm font-medium mb-4">{synResult.dominantDynamic}</p>
            <div className="flex items-center justify-center gap-6 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Armónicos: {synResult.harmonicCount}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Retos/Tensión: {synResult.tenseCount}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Neutros: {synResult.neutralCount}</span>
            </div>
          </div>

          <div className="backdrop-blur-xl border border-white/10 p-6" style={{ background: cardBg, borderRadius }}>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Aspectos Cruzados de Sinastría ({synResult.aspects.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {synResult.aspects.map((asp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/5 text-xs">
                  <span className="text-white/90 font-medium w-28">{getPlanetSymbol(asp.body1 as any)} {asp.body1} (A)</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${asp.harmony === 'harmonic' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : asp.harmony === 'tense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                    {getAspectSymbol(asp.type)} {asp.type}
                  </span>
                  <span className="text-white/90 font-medium w-28 text-right">{getPlanetSymbol(asp.body2 as any)} {asp.body2} (B)</span>
                  <span className="text-white/40 text-[10px] w-14 text-right">{asp.orb}° orb</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
