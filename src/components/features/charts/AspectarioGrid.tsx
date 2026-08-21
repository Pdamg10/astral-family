'use client';
import React from 'react';
import { getAspectSymbol, getPlanetSymbol } from '@/services/astrology/utils';

interface AspectData {
  body1: string;
  body2: string;
  type: string;
  orb: number;
}

const BODY_LABELS: Record<string, string> = {
  Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus',
  Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno',
  Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón',
  Ascendant: 'AC', MC: 'MC', NorthNode: 'Nodo N.', Chiron: 'Quirón',
};

const DEFAULT_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Ascendant', 'MC'
];

export default function AspectarioGrid({
  aspects,
  bodies = DEFAULT_BODIES,
  primaryColor = '#a855f7',
}: {
  aspects: AspectData[];
  bodies?: string[];
  primaryColor?: string;
}) {
  // Build lookup matrix for aspect between any pair
  const aspectMap: Record<string, { type: string; orb: number }> = {};
  for (const a of aspects || []) {
    aspectMap[`${a.body1}-${a.body2}`] = { type: a.type, orb: a.orb };
    aspectMap[`${a.body2}-${a.body1}`] = { type: a.type, orb: a.orb };
  }

  const getAspectColor = (type: string) => {
    if (type === 'trine' || type === 'sextile') return '#10b981'; // Green
    if (type === 'square' || type === 'opposition') return '#ef4444'; // Red
    if (type === 'conjunction') return primaryColor; // Primary
    return '#f59e0b'; // Amber
  };

  return (
    <div className="overflow-x-auto w-full max-w-full select-none">
      <table className="w-full text-center border-collapse text-[10px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-1 px-1.5 text-left text-[10px] font-medium text-white/50 w-16">Planeta</th>
            {bodies.map(b => (
              <th key={b} className="p-0.5 text-[10px] font-medium text-white/70 min-w-[20px]">
                <span title={BODY_LABELS[b] || b}>{getPlanetSymbol(b)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodies.map((rowBody, rowIndex) => (
            <tr key={rowBody} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="py-1 px-1.5 text-left font-medium text-white/80 flex items-center gap-1">
                <span style={{ color: primaryColor }}>{getPlanetSymbol(rowBody)}</span>
                <span className="text-[10px] truncate">{BODY_LABELS[rowBody] || rowBody}</span>
              </td>
              {bodies.map((colBody, colIndex) => {
                if (rowIndex === colIndex) {
                  return (
                    <td key={colBody} className="p-0.5 bg-white/5 text-white/20 text-[9px]">
                      —
                    </td>
                  );
                }

                // Lower triangle aspect display
                const asp = aspectMap[`${rowBody}-${colBody}`];
                if (!asp) {
                  return <td key={colBody} className="p-0.5 text-white/10">·</td>;
                }

                return (
                  <td
                    key={colBody}
                    className="p-0.5 font-bold transition-transform hover:scale-125 cursor-pointer"
                    title={`${BODY_LABELS[rowBody] || rowBody} ${asp.type} ${BODY_LABELS[colBody] || colBody} (orbe: ${asp.orb}°)`}
                    style={{ color: getAspectColor(asp.type) }}
                  >
                    <span className="text-xs">{getAspectSymbol(asp.type)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}