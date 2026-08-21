'use client';
import React from 'react';
import type { BirthProfile } from '@/types/prisma-types';

interface ZodiacSignCounterBarProps {
  profiles: BirthProfile[];
  selectedSign?: string | null;
  onSelectSign?: (sign: string | null) => void;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface ZodiacSignInfo {
  id: string; // canonical English / normalized key
  nameEs: string;
  symbol: string;
  emoji: string;
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
  elementColor: string;
  gradient: string;
}

const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  { id: 'Aries', nameEs: 'Aries', symbol: '♈', emoji: '🐏', element: 'Fuego', elementColor: '#ef4444', gradient: 'from-red-500/30 to-orange-500/20' },
  { id: 'Taurus', nameEs: 'Tauro', symbol: '♉', emoji: '🐂', element: 'Tierra', elementColor: '#10b981', gradient: 'from-emerald-500/30 to-green-500/20' },
  { id: 'Gemini', nameEs: 'Géminis', symbol: '♊', emoji: '👯', element: 'Aire', elementColor: '#06b6d4', gradient: 'from-cyan-500/30 to-sky-500/20' },
  { id: 'Cancer', nameEs: 'Cáncer', symbol: '♋', emoji: '🦀', element: 'Agua', elementColor: '#6366f1', gradient: 'from-indigo-500/30 to-blue-500/20' },
  { id: 'Leo', nameEs: 'Leo', symbol: '♌', emoji: '🦁', element: 'Fuego', elementColor: '#f59e0b', gradient: 'from-amber-500/30 to-yellow-500/20' },
  { id: 'Virgo', nameEs: 'Virgo', symbol: '♍', emoji: '🌾', element: 'Tierra', elementColor: '#84cc16', gradient: 'from-lime-500/30 to-emerald-500/20' },
  { id: 'Libra', nameEs: 'Libra', symbol: '♎', emoji: '⚖️', element: 'Aire', elementColor: '#ec4899', gradient: 'from-pink-500/30 to-rose-500/20' },
  { id: 'Scorpio', nameEs: 'Escorpio', symbol: '♏', emoji: '🦂', element: 'Agua', elementColor: '#a855f7', gradient: 'from-purple-500/30 to-indigo-500/20' },
  { id: 'Sagittarius', nameEs: 'Sagitario', symbol: '♐', emoji: '🏹', element: 'Fuego', elementColor: '#f97316', gradient: 'from-orange-500/30 to-amber-500/20' },
  { id: 'Capricorn', nameEs: 'Capricornio', symbol: '♑', emoji: '🐐', element: 'Tierra', elementColor: '#14b8a6', gradient: 'from-teal-500/30 to-cyan-500/20' },
  { id: 'Aquarius', nameEs: 'Acuario', symbol: '♒', emoji: '🏺', element: 'Aire', elementColor: '#38bdf8', gradient: 'from-sky-500/30 to-blue-500/20' },
  { id: 'Pisces', nameEs: 'Piscis', symbol: '♓', emoji: '🐟', element: 'Agua', elementColor: '#8b5cf6', gradient: 'from-violet-500/30 to-purple-500/20' },
];

function normalizeSign(s?: string): string {
  if (!s) return '';
  const lower = s.trim().toLowerCase();
  if (lower.startsWith('ari')) return 'Aries';
  if (lower.startsWith('tau')) return 'Taurus';
  if (lower.startsWith('gém') || lower.startsWith('gem')) return 'Gemini';
  if (lower.startsWith('cán') || lower.startsWith('can')) return 'Cancer';
  if (lower.startsWith('leo')) return 'Leo';
  if (lower.startsWith('vir')) return 'Virgo';
  if (lower.startsWith('lib')) return 'Libra';
  if (lower.startsWith('esc') || lower.startsWith('sco')) return 'Scorpio';
  if (lower.startsWith('sag')) return 'Sagittarius';
  if (lower.startsWith('cap')) return 'Capricorn';
  if (lower.startsWith('acu') || lower.startsWith('aqu')) return 'Aquarius';
  if (lower.startsWith('pis')) return 'Pisces';
  return s;
}

export default function ZodiacSignCounterBar({
  profiles,
  selectedSign = null,
  onSelectSign,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
}: ZodiacSignCounterBarProps) {
  // Compute counts map
  const countsMap = React.useMemo(() => {
    const map = new Map<string, { count: number; memberNames: string[] }>();
    ZODIAC_SIGNS.forEach(z => map.set(z.id, { count: 0, memberNames: [] }));

    profiles.forEach(p => {
      const sun = p.planetaryPositions?.find(pp => pp.body === 'Sun');
      if (sun?.sign) {
        const canonical = normalizeSign(sun.sign);
        if (map.has(canonical)) {
          const entry = map.get(canonical)!;
          entry.count += 1;
          entry.memberNames.push(p.name);
        }
      }
    });

    return map;
  }, [profiles]);

  const totalMembersWithSign = React.useMemo(() => {
    let total = 0;
    countsMap.forEach(v => { total += v.count; });
    return total;
  }, [countsMap]);

  // Signs with at least 1 member
  const presentSigns = React.useMemo(() => {
    return ZODIAC_SIGNS.filter(z => (countsMap.get(z.id)?.count || 0) > 0);
  }, [countsMap]);

  if (profiles.length === 0) return null;

  return (
    <div className="w-full mb-6 p-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/10 shadow-xl space-y-3.5 transition-all">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌌</span>
          <div>
            <h3 className="text-xs font-semibold text-white/90 flex items-center gap-2">
              <span>Distribución Zodíacal en la Familia</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-purple-200 border border-white/10 font-normal">
                {presentSigns.length} signos presentes
              </span>
            </h3>
            <p className="text-[11px] text-white/40">
              Conteo de signos solares. Haz clic en cualquier signo para filtrar las cartas.
            </p>
          </div>
        </div>

        {selectedSign && onSelectSign && (
          <button
            type="button"
            onClick={() => onSelectSign(null)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>✕ Limpiar filtro</span>
            <span className="text-[10px] text-purple-300">({selectedSign})</span>
          </button>
        )}
      </div>

      {/* Proportional Segmented Bar */}
      {totalMembersWithSign > 0 && (
        <div className="w-full h-2 rounded-full overflow-hidden bg-white/5 flex gap-0.5 p-0.5 border border-white/10">
          {presentSigns.map(sign => {
            const count = countsMap.get(sign.id)?.count || 0;
            const pct = (count / totalMembersWithSign) * 100;
            return (
              <div
                key={sign.id}
                style={{
                  width: `${pct}%`,
                  backgroundColor: sign.elementColor,
                }}
                className="h-full rounded-sm transition-all hover:opacity-100 opacity-85"
                title={`${sign.nameEs} (${sign.symbol}): ${count} integrante(s) (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>
      )}

      {/* 12 Zodiac Sign Badges Horizontal Slider / Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
        {ZODIAC_SIGNS.map(sign => {
          const entry = countsMap.get(sign.id);
          const count = entry?.count || 0;
          const isPresent = count > 0;
          const isSelected = selectedSign === sign.id || selectedSign === sign.nameEs;

          return (
            <button
              key={sign.id}
              type="button"
              onClick={() => {
                if (!onSelectSign) return;
                if (isSelected) onSelectSign(null);
                else onSelectSign(sign.id);
              }}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-purple-400 bg-purple-500/25 ring-2 ring-purple-400/40 shadow-lg scale-105'
                  : isPresent
                  ? `border-white/15 bg-gradient-to-b ${sign.gradient} hover:scale-102 hover:border-white/30 text-white`
                  : 'border-white/5 bg-white/[0.02] opacity-35 hover:opacity-60 text-white/50'
              }`}
              title={
                isPresent
                  ? `${sign.nameEs} (${sign.symbol}): ${count} persona(s) - ${entry?.memberNames.join(', ')}`
                  : `${sign.nameEs} (${sign.symbol}): 0 personas`
              }
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold" style={{ color: isPresent ? sign.elementColor : undefined }}>
                  {sign.symbol}
                </span>
                <span className="text-[11px] font-medium truncate max-w-[55px]">
                  {sign.nameEs}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-1">
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isPresent
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
