'use client';
import React from 'react';
import { getSignEmoji, getPlanetSymbol, getAspectSymbol } from '@/services/astrology/utils';
import type { PlanetaryPosition, HouseData, AspectData, ChartPointData, ZodiacSign } from '@/types/astrology';

interface WheelProps {
  planetaryPositions: PlanetaryPosition[];
  houses: HouseData[];
  aspects: AspectData[];
  chartPoints: ChartPointData[];
  primaryColor?: string;
  accentColor?: string;
}

const SIGN_COLORS: Record<ZodiacSign, string> = {
  Aries: '#ef4444', Taurus: '#22c55e', Gemini: '#eab308',
  Cancer: '#94a3b8', Leo: '#f97316', Virgo: '#84cc16',
  Libra: '#ec4899', Scorpio: '#7c3aed', Sagittarius: '#6366f1',
  Capricorn: '#64748b', Aquarius: '#06b6d4', Pisces: '#14b8a6',
};

const SIGNS: ZodiacSign[] = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

export default function AstrologyWheel({ planetaryPositions, houses, aspects, chartPoints, primaryColor = '#a855f7', accentColor = '#f59e0b' }: WheelProps) {
  const size = 500;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 230;
  const zodiacR = 200;
  const planetR = 155;
  const aspectR = 100;

  // Get Ascendant degree to rotate the chart
  const ascendant = chartPoints.find(p => p.point === 'Ascendant');
  const ascDeg = ascendant ? ascendant.absoluteDegree : 0;
  const rotation = -ascDeg - (Math.floor(ascDeg / 30) * 30);

  // Build aspect lines
  const aspectLines = aspects.slice(0, 15).map(a => {
    const body1Pos = [...planetaryPositions, ...chartPoints].find(p => p.body === a.body1);
    const body2Pos = [...planetaryPositions, ...chartPoints].find(p => p.body === a.body2);
    if (!body1Pos || !body2Pos) return null;
    const angle1 = ((body1Pos.absoluteDegree + rotation) * Math.PI) / 180;
    const angle2 = ((body2Pos.absoluteDegree + rotation) * Math.PI) / 180;
    return {
      x1: cx + aspectR * Math.sin(angle1), y1: cy - aspectR * Math.cos(angle1),
      x2: cx + aspectR * Math.sin(angle2), y2: cy - aspectR * Math.cos(angle2),
      type: a.type, color: a.type === 'square' || a.type === 'opposition' ? '#ef4444' : a.type === 'trine' || a.type === 'sextile' ? '#22c55e' : primaryColor,
    };
  }).filter(Boolean);

  // Planet positions on the wheel
  const planetPlacements = planetaryPositions.map(p => {
    const angle = ((p.absoluteDegree + rotation) * Math.PI) / 180;
    return {
      x: cx + planetR * Math.sin(angle), y: cy - planetR * Math.cos(angle),
      symbol: getPlanetSymbol(p.body), body: p.body, sign: p.sign, degree: p.degree, minute: p.minute, retrograde: p.retrograde,
    };
  });

  // House cusps (using ascendant rotation)
  const houseCusps = houses.map((h, i) => {
    const baseDeg = i * 30;
    const angle = ((baseDeg + rotation) * Math.PI) / 180;
    return {
      x1: cx + (outerR - 30) * Math.sin(angle), y1: cy - (outerR - 30) * Math.cos(angle),
      x2: cx + outerR * Math.sin(angle), y2: cy - outerR * Math.cos(angle),
    };
  });

  // Sign labels
  const signLabels = SIGNS.map((sign, i) => {
    const midDeg = i * 30 + 15;
    const angle = ((midDeg + rotation) * Math.PI) / 180;
    const labelR = zodiacR + 8;
    return {
      x: cx + labelR * Math.sin(angle), y: cy - labelR * Math.cos(angle),
      emoji: getSignEmoji(sign), color: SIGN_COLORS[sign],
    };
  });

  // House numbers
  const houseNumbers = houses.map((h, i) => {
    const midDeg = i * 30 + 15;
    const angle = ((midDeg + rotation) * Math.PI) / 180;
    const numR = zodiacR - 15;
    return {
      x: cx + numR * Math.sin(angle), y: cy - numR * Math.cos(angle),
      num: h.houseNumber,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[500px] mx-auto">
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={outerR + 5} fill="none" stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
      <circle cx={cx} cy={cy} r={outerR} fill="rgba(0,0,0,0.2)" stroke={primaryColor} strokeWidth="1" opacity="0.4" />
      <circle cx={cx} cy={cy} r={zodiacR} fill="none" stroke={primaryColor} strokeWidth="0.5" opacity="0.5" />
      <circle cx={cx} cy={cy} r={planetR + 25} fill="none" stroke={primaryColor} strokeWidth="0.5" opacity="0.2" />

      {/* Zodiac sign sections */}
      {SIGNS.map((sign, i) => {
        const startAngle = ((i * 30 + rotation) * Math.PI) / 180;
        const endAngle = (((i + 1) * 30 + rotation) * Math.PI) / 180;
        const largeArc = 30 > 180 ? 1 : 0;
        const x1s = cx + outerR * Math.sin(startAngle), y1s = cy - outerR * Math.cos(startAngle);
        const x2s = cx + outerR * Math.sin(endAngle), y2s = cy - outerR * Math.cos(endAngle);
        return (
          <path key={sign} d={`M ${cx} ${cy} L ${x1s} ${y1s} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2s} ${y2s} Z`} fill={SIGN_COLORS[sign]} opacity="0.05" />
        );
      })}

      {/* House cusp lines */}
      {houseCusps.map((c, i) => (
        <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke={primaryColor} strokeWidth="1" opacity="0.4" />
      ))}

      {/* Aspect lines */}
      {aspectLines.map((l, i) => l && (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="0.8" opacity="0.35" strokeDasharray={l.type === 'quincunx' ? '4 3' : undefined} />
      ))}

      {/* Sign emojis */}
      {signLabels.map((s, i) => (
        <text key={i} x={s.x} y={s.y} textAnchor="middle" dominantBaseline="central" fontSize="14" fill={s.color} opacity="0.7">
          {s.emoji}
        </text>
      ))}

      {/* House numbers */}
      {houseNumbers.map((h) => (
        <text key={h.num} x={h.x} y={h.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fill={primaryColor} opacity="0.4">
          {h.num}
        </text>
      ))}

      {/* Planet symbols */}
      {planetPlacements.map((p) => (
        <g key={p.body}>
          <circle cx={p.x} cy={p.y} r="10" fill="rgba(0,0,0,0.5)" stroke={accentColor} strokeWidth="0.5" />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#fff">
            {p.symbol}
          </text>
          {p.retrograde && (
            <text x={p.x + 8} y={p.y - 6} textAnchor="middle" fontSize="7" fill="#f59e0b">R</text>
          )}
        </g>
      ))}

      {/* Ascendant marker */}
      {ascendant && (() => {
        const angle = ((ascendant.absoluteDegree + rotation) * Math.PI) / 180;
        const ax = cx + (outerR + 2) * Math.sin(angle);
        const ay = cy - (outerR + 2) * Math.cos(angle);
        return (
          <g>
            <polygon points={`${ax},${ay - 8} ${ax - 5},${ay + 4} ${ax + 5},${ay + 4}`} fill={accentColor} />
          </g>
        );
      })()}

      {/* Center decoration */}
      <circle cx={cx} cy={cy} r="3" fill={primaryColor} opacity="0.6" />
    </svg>
  );
}