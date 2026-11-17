'use client';
import React from 'react';
import type { BirthProfile } from '@/types/prisma-types';
import type { Element } from '@/types/astrology';
import { canonicalSignName, getSignElement } from '@/services/astrology/utils';

interface ZodiacSignCounterBarProps {
  profiles: BirthProfile[];
  selectedSign?: string | null;
  onSelectSign?: (sign: string | null) => void;
  selectedElement?: Element | null;
  onSelectElement?: (element: Element | null) => void;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface ZodiacSignInfo {
  id: string;
  nameEs: string;
  symbol: string;
  emoji: string;
  element: Element;
  elementEs: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
  elementColor: string;
  gradient: string;
}

interface ElementInfo {
  id: Element;
  nameEs: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
  emoji: string;
  signsLabel: string;
  color: string;
  gradient: string;
  activeRing: string;
}

const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  { id: 'Aries', nameEs: 'Aries', symbol: '♈', emoji: '🐏', element: 'Fire', elementEs: 'Fuego', elementColor: '#ef4444', gradient: 'from-red-500/30 to-orange-500/20' },
  { id: 'Taurus', nameEs: 'Tauro', symbol: '♉', emoji: '🐂', element: 'Earth', elementEs: 'Tierra', elementColor: '#10b981', gradient: 'from-emerald-500/30 to-green-500/20' },
  { id: 'Gemini', nameEs: 'Géminis', symbol: '♊', emoji: '👯', element: 'Air', elementEs: 'Aire', elementColor: '#06b6d4', gradient: 'from-cyan-500/30 to-sky-500/20' },
  { id: 'Cancer', nameEs: 'Cáncer', symbol: '♋', emoji: '🦀', element: 'Water', elementEs: 'Agua', elementColor: '#6366f1', gradient: 'from-indigo-500/30 to-blue-500/20' },
  { id: 'Leo', nameEs: 'Leo', symbol: '♌', emoji: '🦁', element: 'Fire', elementEs: 'Fuego', elementColor: '#f59e0b', gradient: 'from-amber-500/30 to-yellow-500/20' },
  { id: 'Virgo', nameEs: 'Virgo', symbol: '♍', emoji: '🌾', element: 'Earth', elementEs: 'Tierra', elementColor: '#84cc16', gradient: 'from-lime-500/30 to-emerald-500/20' },
  { id: 'Libra', nameEs: 'Libra', symbol: '♎', emoji: '⚖️', element: 'Air', elementEs: 'Aire', elementColor: '#ec4899', gradient: 'from-pink-500/30 to-rose-500/20' },
  { id: 'Scorpio', nameEs: 'Escorpio', symbol: '♏', emoji: '🦂', element: 'Water', elementEs: 'Agua', elementColor: '#a855f7', gradient: 'from-purple-500/30 to-indigo-500/20' },
  { id: 'Sagittarius', nameEs: 'Sagitario', symbol: '♐', emoji: '🏹', element: 'Fire', elementEs: 'Fuego', elementColor: '#f97316', gradient: 'from-orange-500/30 to-amber-500/20' },
  { id: 'Capricorn', nameEs: 'Capricornio', symbol: '♑', emoji: '🐐', element: 'Earth', elementEs: 'Tierra', elementColor: '#14b8a6', gradient: 'from-teal-500/30 to-cyan-500/20' },
  { id: 'Aquarius', nameEs: 'Acuario', symbol: '♒', emoji: '🏺', element: 'Air', elementEs: 'Aire', elementColor: '#38bdf8', gradient: 'from-sky-500/30 to-blue-500/20' },
  { id: 'Pisces', nameEs: 'Piscis', symbol: '♓', emoji: '🐟', element: 'Water', elementEs: 'Agua', elementColor: '#8b5cf6', gradient: 'from-violet-500/30 to-purple-500/20' },
];

const ELEMENTS_INFO: ElementInfo[] = [
  {
    id: 'Fire',
    nameEs: 'Fuego',
    emoji: '🔥',
    signsLabel: 'Aries · Leo · Sagitario',
    color: '#f97316',
    gradient: 'from-red-500/25 via-orange-500/20 to-amber-500/15',
    activeRing: 'border-orange-400 bg-orange-500/25 ring-2 ring-orange-400/40',
  },
  {
    id: 'Earth',
    nameEs: 'Tierra',
    emoji: '🌍',
    signsLabel: 'Tauro · Virgo · Capricornio',
    color: '#10b981',
    gradient: 'from-emerald-500/25 via-green-500/20 to-teal-500/15',
    activeRing: 'border-emerald-400 bg-emerald-500/25 ring-2 ring-emerald-400/40',
  },
  {
    id: 'Air',
    nameEs: 'Aire',
    emoji: '💨',
    signsLabel: 'Géminis · Libra · Acuario',
    color: '#38bdf8',
    gradient: 'from-cyan-500/25 via-sky-500/20 to-blue-500/15',
    activeRing: 'border-sky-400 bg-sky-500/25 ring-2 ring-sky-400/40',
  },
  {
    id: 'Water',
    nameEs: 'Agua',
    emoji: '💧',
    signsLabel: 'Cáncer · Escorpio · Piscis',
    color: '#8b5cf6',
    gradient: 'from-indigo-500/25 via-purple-500/20 to-violet-500/15',
    activeRing: 'border-violet-400 bg-violet-500/25 ring-2 ring-violet-400/40',
  },
];

export default function ZodiacSignCounterBar({
  profiles,
  selectedSign = null,
  onSelectSign,
  selectedElement = null,
  onSelectElement,
}: ZodiacSignCounterBarProps) {
  // Compute counts maps for signs and elements
  const { countsMap, elementsMap, totalMembersWithSign } = React.useMemo(() => {
    const sMap = new Map<string, { count: number; memberNames: string[] }>();
    ZODIAC_SIGNS.forEach(z => sMap.set(z.id, { count: 0, memberNames: [] }));

    const eMap = new Map<Element, { count: number; memberNames: string[] }>();
    ELEMENTS_INFO.forEach(el => eMap.set(el.id, { count: 0, memberNames: [] }));

    let total = 0;

    profiles.forEach(p => {
      const sun = p.planetaryPositions?.find(pp => pp.body === 'Sun');
      if (sun?.sign) {
        const canonical = canonicalSignName(sun.sign);
        const sEntry = sMap.get(canonical);
        if (sEntry) {
          sEntry.count += 1;
          sEntry.memberNames.push(p.name);
          total += 1;
        }
        const elem = getSignElement(canonical);
        const eEntry = eMap.get(elem);
        if (eEntry) {
          eEntry.count += 1;
          eEntry.memberNames.push(p.name);
        }
      }
    });

    return { countsMap: sMap, elementsMap: eMap, totalMembersWithSign: total };
  }, [profiles]);

  const presentSigns = React.useMemo(
    () => ZODIAC_SIGNS.filter(z => (countsMap.get(z.id)?.count || 0) > 0),
    [countsMap]
  );

  const presentElementsCount = React.useMemo(
    () => ELEMENTS_INFO.filter(el => (elementsMap.get(el.id)?.count || 0) > 0).length,
    [elementsMap]
  );

  if (profiles.length === 0) return null;

  const activeFilterLabel = selectedSign
    ? ZODIAC_SIGNS.find(s => s.id === selectedSign || s.nameEs === selectedSign)?.nameEs || selectedSign
    : selectedElement
    ? ELEMENTS_INFO.find(e => e.id === selectedElement)?.nameEs || selectedElement
    : null;

  return (
    <div className="w-full mb-6 p-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/10 shadow-xl space-y-3.5 transition-all">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌌</span>
          <div>
            <h3 className="text-xs font-semibold text-white/90 flex items-center gap-2 flex-wrap">
              <span>Distribución Zodíacal en la Familia</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-purple-200 border border-white/10 font-normal">
                {presentSigns.length} signos · {presentElementsCount} elementos
              </span>
            </h3>
            <p className="text-[11px] text-white/40">
              Conteo de signos solares y elementos. Haz clic en cualquier signo o elemento para filtrar las cartas.
            </p>
          </div>
        </div>

        {activeFilterLabel && (
          <button
            type="button"
            onClick={() => {
              onSelectSign?.(null);
              onSelectElement?.(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>✕ Limpiar filtro</span>
            <span className="text-[10px] text-purple-300">({activeFilterLabel})</span>
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

      {/* 12 Zodiac Sign Badges Grid */}
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
                onSelectElement?.(null);
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

      {/* 4 Elements Distribution Row */}
      <div className="pt-2.5 border-t border-white/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ELEMENTS_INFO.map(el => {
            const entry = elementsMap.get(el.id);
            const count = entry?.count || 0;
            const isPresent = count > 0;
            const pct = totalMembersWithSign > 0 ? Math.round((count / totalMembersWithSign) * 100) : 0;
            const isSelected = selectedElement === el.id;

            return (
              <button
                key={el.id}
                type="button"
                onClick={() => {
                  if (!onSelectElement) return;
                  onSelectSign?.(null);
                  if (isSelected) onSelectElement(null);
                  else onSelectElement(el.id);
                }}
                className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? `${el.activeRing} shadow-lg scale-[1.02]`
                    : isPresent
                    ? `border-white/15 bg-gradient-to-r ${el.gradient} hover:border-white/30 text-white`
                    : 'border-white/5 bg-white/[0.02] opacity-40 hover:opacity-65 text-white/50'
                }`}
                title={
                  isPresent
                    ? `${el.nameEs} (${el.signsLabel}): ${count} persona(s) (${pct}%) - ${entry?.memberNames.join(', ')}`
                    : `${el.nameEs} (${el.signsLabel}): 0 personas`
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">{el.emoji}</span>
                    <span className="text-xs font-semibold truncate">{el.nameEs}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-white/60 font-mono">{pct}%</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isPresent ? 'bg-white/20 text-white shadow-inner' : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </div>

                {/* Mini proportional bar */}
                <div className="w-full h-1 rounded-full bg-black/35 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: el.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
