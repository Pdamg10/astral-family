'use client';
import React, { useState } from 'react';
import { getSignEmoji, getPlanetSymbol, getAspectSymbol, formatDegreeMinute, getPlanetNameEs } from '@/services/astrology/utils';
import { ZODIAC_SIGNS } from '@/types/astrology';
import type { PlanetaryPosition, HouseData, AspectData, ChartPointData, ZodiacSign } from '@/types/astrology';

interface WheelProps {
  id?: string;
  planetaryPositions: PlanetaryPosition[];
  houses: HouseData[];
  aspects: AspectData[];
  chartPoints: ChartPointData[];
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  transitPositions?: PlanetaryPosition[];
  synastryPositions?: { body: string; sign: string; degree: number; absoluteDegree: number }[];
}

const SIGN_COLORS: Record<ZodiacSign, { bg: string; text: string; element: string }> = {
  Aries:       { bg: '#ef4444', text: '#ffffff', element: 'Fuego' },
  Taurus:      { bg: '#15803d', text: '#ffffff', element: 'Tierra' },
  Gemini:      { bg: '#eab308', text: '#1e293b', element: 'Aire' },
  Cancer:      { bg: '#0284c7', text: '#ffffff', element: 'Agua' },
  Leo:         { bg: '#f97316', text: '#ffffff', element: 'Fuego' },
  Virgo:       { bg: '#4d7c0f', text: '#ffffff', element: 'Tierra' },
  Libra:       { bg: '#ec4899', text: '#ffffff', element: 'Aire' },
  Scorpio:     { bg: '#701a75', text: '#ffffff', element: 'Agua' },
  Sagittarius: { bg: '#8b5cf6', text: '#ffffff', element: 'Fuego' },
  Capricorn:   { bg: '#334155', text: '#ffffff', element: 'Tierra' },
  Aquarius:    { bg: '#06b6d4', text: '#1e293b', element: 'Aire' },
  Pisces:      { bg: '#0d9488', text: '#ffffff', element: 'Agua' },
};

export default function AstrologyWheel({
  id = 'astral-chart-svg',
  planetaryPositions,
  houses,
  aspects,
  chartPoints,
  primaryColor = '#a855f7',
  accentColor = '#f59e0b',
  secondaryColor = '#ec4899',
  transitPositions,
  synastryPositions,
}: WheelProps) {
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [hoveredBody, setHoveredBody] = useState<string | null>(null);

  const size = 600;
  const cx = size / 2;
  const cy = size / 2;

  // Concentric ring radii
  const outerR = 270;
  const zodiacR = 230;
  const housesR = 195;
  const planetR = 145;
  const aspectR = 100;

  // Ascendant degree to orient the wheel (Ascendant at 180° / 9 o'clock)
  const ascendant = chartPoints?.find(p => p.point === 'Ascendant') || houses?.find(h => h.houseNumber === 1);
  const ascDeg = ascendant ? ascendant.absoluteDegree : 0;

  // Convert ecliptic degree to SVG coordinates
  // Ascendant is at 180° (left), degrees increase counter-clockwise
  const getCoordinates = (deg: number, radius: number) => {
    const diff = deg - ascDeg;
    const angleRad = ((180 - diff) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy - radius * Math.sin(angleRad),
      angleRad,
    };
  };

  // Helper to generate SVG Arc Path between two degrees
  const getArcPath = (startDeg: number, endDeg: number, rOuter: number, rInner: number) => {
    const p1 = getCoordinates(startDeg, rOuter);
    const p2 = getCoordinates(endDeg, rOuter);
    const p3 = getCoordinates(endDeg, rInner);
    const p4 = getCoordinates(startDeg, rInner);

    const span = (endDeg - startDeg + 360) % 360;
    const largeArc = span > 180 ? 1 : 0;
    // In our coordinate mapping (degrees increase counter-clockwise), outer arc is sweep 0, inner arc is sweep 1
    return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x} ${p4.y} Z`;
  };

  // Combine planets and key points
  const mainBodies = [
    ...(planetaryPositions || []),
    ...(chartPoints || []).filter(cp => ['NorthNode', 'Chiron', 'Lilith'].includes(cp.point)).map(cp => ({
      body: cp.point as any,
      sign: cp.sign,
      degree: cp.degree,
      minute: cp.minute,
      absoluteDegree: cp.absoluteDegree,
      retrograde: false,
      house: cp.house,
    })),
  ];

  // Placidus House Cusps
  const houseLines = (houses || []).map((h, i) => {
    const p1 = getCoordinates(h.absoluteDegree, aspectR);
    const p2 = getCoordinates(h.absoluteDegree, housesR);
    const nextH = houses[(i + 1) % 12];
    const nextDeg = nextH ? nextH.absoluteDegree : (h.absoluteDegree + 30) % 360;
    const span = (nextDeg - h.absoluteDegree + 360) % 360;
    const midDeg = (h.absoluteDegree + span / 2) % 360;
    const labelPos = getCoordinates(midDeg, (aspectR + housesR) / 2);

    const isAxis = h.houseNumber === 1 || h.houseNumber === 4 || h.houseNumber === 7 || h.houseNumber === 10;

    return {
      houseNumber: h.houseNumber,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      labelX: labelPos.x,
      labelY: labelPos.y,
      isAxis,
      sign: h.sign,
      degree: h.degree,
      minute: h.minute,
    };
  });

  // 12 Zodiac Arc Segments
  const signSegments = ZODIAC_SIGNS.map((sign, i) => {
    const startDeg = i * 30;
    const endDeg = (i + 1) * 30;
    const midDeg = i * 30 + 15;
    const path = getArcPath(startDeg, endDeg, outerR, zodiacR);
    const labelPos = getCoordinates(midDeg, (zodiacR + outerR) / 2);
    const lineStart = getCoordinates(startDeg, zodiacR);
    const lineOuter = getCoordinates(startDeg, outerR);

    // Minor degree ticks (every 5 degrees)
    const ticks = [5, 10, 15, 20, 25].map(tDeg => {
      const pInner = getCoordinates(startDeg + tDeg, outerR - 4);
      const pOut = getCoordinates(startDeg + tDeg, outerR);
      return { x1: pInner.x, y1: pInner.y, x2: pOut.x, y2: pOut.y };
    });

    const glyph = getSignEmoji(sign);
    return {
      sign,
      glyph,
      emoji: glyph,
      colorInfo: SIGN_COLORS[sign],
      path,
      labelX: labelPos.x,
      labelY: labelPos.y,
      x1: lineStart.x,
      y1: lineStart.y,
      x2: lineOuter.x,
      y2: lineOuter.y,
      ticks,
    };
  });

  // Sort and cluster planets to prevent overlap
  const sortedBodies = [...mainBodies].sort((a, b) => a.absoluteDegree - b.absoluteDegree);
  const planetPlacements = sortedBodies.map((p, idx, arr) => {
    // Check collision with previous or next planet
    const prev = arr[(idx - 1 + arr.length) % arr.length];
    const next = arr[(idx + 1) % arr.length];
    const distPrev = (p.absoluteDegree - prev.absoluteDegree + 360) % 360;
    const distNext = (next.absoluteDegree - p.absoluteDegree + 360) % 360;

    let dynamicRadius = planetR;
    if (distPrev < 10 && idx % 2 === 1) {
      dynamicRadius = planetR - 20; // Inner tier
    } else if (distNext < 10 && idx % 2 === 0) {
      dynamicRadius = planetR + 18; // Outer tier
    }

    const coords = getCoordinates(p.absoluteDegree, dynamicRadius);
    const rimCoords = getCoordinates(p.absoluteDegree, housesR);

    return {
      ...p,
      x: coords.x,
      y: coords.y,
      rimX: rimCoords.x,
      rimY: rimCoords.y,
      symbol: getPlanetSymbol(p.body as any),
      nameEs: getPlanetNameEs(p.body),
    };
  });

  // Calculate Transit Placements if transits are enabled
  const hasTransits = Boolean(transitPositions && transitPositions.length > 0);
  const transitRadius = outerR + 25;

  const transitPlacements = (transitPositions || []).map((tp) => {
    const coords = getCoordinates(tp.absoluteDegree, transitRadius);
    return {
      ...tp,
      x: coords.x,
      y: coords.y,
      symbol: getPlanetSymbol(tp.body as any),
      nameEs: getPlanetNameEs(tp.body),
    };
  });

  // Active highlighted body
  const activeFocusBody = hoveredBody || selectedBody;
  const isTransitFocus = Boolean(activeFocusBody?.startsWith('transit-'));
  const activeTransitBody = isTransitFocus && activeFocusBody ? activeFocusBody.replace('transit-', '') : null;
  const activeTransitData = activeTransitBody ? transitPlacements.find(t => t.body === activeTransitBody) : null;
  const activeBodyData = !isTransitFocus && activeFocusBody ? planetPlacements.find(p => p.body === activeFocusBody) : null;

  // Aspect lines with interactive filtering
  const aspectLines = (aspects || []).map((a, idx) => {
    const b1 = mainBodies.find(b => b.body === a.body1);
    const b2 = mainBodies.find(b => b.body === a.body2);
    if (!b1 || !b2) return null;

    const p1 = getCoordinates(b1.absoluteDegree, aspectR);
    const p2 = getCoordinates(b2.absoluteDegree, aspectR);

    let strokeColor = '#94a3b8';
    let strokeDash: string | undefined = undefined;

    if (a.type === 'trine') {
      strokeColor = '#10b981'; // Emerald
    } else if (a.type === 'sextile') {
      strokeColor = '#06b6d4'; // Cyan
    } else if (a.type === 'square') {
      strokeColor = '#ef4444'; // Red
    } else if (a.type === 'opposition') {
      strokeColor = '#f43f5e'; // Rose red
    } else if (a.type === 'conjunction') {
      strokeColor = primaryColor; // Primary
    } else if (a.type === 'quincunx') {
      strokeColor = '#f59e0b';
      strokeDash = '3,3';
    }

    const isConnectedToFocus = activeFocusBody ? (a.body1 === activeFocusBody || a.body2 === activeFocusBody) : true;
    const isHighlighted = activeFocusBody ? isConnectedToFocus : false;

    return {
      id: `${a.body1}-${a.body2}-${idx}`,
      body1: a.body1,
      body2: a.body2,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      color: strokeColor,
      strokeDash,
      type: a.type,
      orb: a.orb,
      isConnectedToFocus,
      isHighlighted,
    };
  }).filter(Boolean);

  // MC position for Axis
  const mcPoint = chartPoints?.find(p => p.point === 'MC') || houses?.find(h => h.houseNumber === 10);
  const mcCoords = mcPoint ? getCoordinates(mcPoint.absoluteDegree, outerR) : null;
  const icCoords = mcPoint ? getCoordinates((mcPoint.absoluteDegree + 180) % 360, outerR) : null;

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full">
      {/* SVG Astro Wheel Container */}
      <div className="relative w-full max-w-[620px] aspect-square flex items-center justify-center">
        <svg
          id={id}
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full drop-shadow-2xl overflow-visible"
          onClick={() => setSelectedBody(null)}
        >
          <defs>
            <radialGradient id="wheelBackgroundGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#080412" stopOpacity="0.98" />
              <stop offset="65%" stopColor="#120822" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#1a0c30" stopOpacity="0.90" />
            </radialGradient>
            <radialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Wheel Backdrops */}
          <circle cx={cx} cy={cy} r={outerR} fill="url(#wheelBackgroundGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={zodiacR} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={housesR} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={aspectR} fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={aspectR} fill="url(#centerHubGrad)" />

          {/* 12 Zodiac Colored Arc Bands */}
          {signSegments.map((s) => (
            <g key={s.sign} className="group transition-opacity">
              <path
                d={s.path}
                fill={s.colorInfo.bg}
                fillOpacity="0.22"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
                className="hover:fill-opacity-50 transition-all cursor-pointer"
              />
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />

              {/* 5-degree Ticks */}
              {s.ticks.map((t, tidx) => (
                <line key={tidx} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              ))}

              {/* Sign Glyph & Symbol */}
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-bold text-sm select-none pointer-events-none"
                fill={s.colorInfo.bg}
                style={{
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))',
                }}
              >
                {s.glyph}
              </text>
            </g>
          ))}

          {/* Placidus House Cusp Lines */}
          {houseLines.map((h) => (
            <g key={h.houseNumber}>
              <line
                x1={h.x1}
                y1={h.y1}
                x2={h.x2}
                y2={h.y2}
                stroke={h.isAxis ? primaryColor : 'rgba(255,255,255,0.22)'}
                strokeWidth={h.isAxis ? 2.2 : 0.9}
                strokeDasharray={h.isAxis ? undefined : '3,3'}
              />
              <text
                x={h.labelX}
                y={h.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[10px] font-mono select-none ${
                  h.isAxis ? 'fill-amber-300 font-bold text-xs' : 'fill-white/50 font-medium'
                }`}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
              >
                {h.houseNumber}
              </text>
            </g>
          ))}

          {/* Ascendant (AC - 9 o'clock) & Descendant (DC - 3 o'clock) Axis */}
          <g>
            {/* AC Horizon Line */}
            <line x1={cx - aspectR} y1={cy} x2={cx - outerR - 8} y2={cy} stroke="#f43f5e" strokeWidth="3" />
            <polygon
              points={`${cx - outerR - 10},${cy} ${cx - outerR + 2},${cy - 5} ${cx - outerR + 2},${cy + 5}`}
              fill="#f43f5e"
            />
            <rect
              x={cx - outerR - 38}
              y={cy - 10}
              width={26}
              height={20}
              rx={4}
              fill="#f43f5e"
            />
            <text x={cx - outerR - 25} y={cy} textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[10px] font-black">
              AC
            </text>

            {/* DC Marker */}
            <line x1={cx + aspectR} y1={cy} x2={cx + outerR} y2={cy} stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" />
            <text x={cx + outerR - 16} y={cy - 6} fill="rgba(244,63,94,0.7)" className="text-[9px] font-bold">
              DC
            </text>
          </g>

          {/* MC (Midheaven) & IC Axis */}
          {mcCoords && icCoords && (
            <g>
              <line x1={cx} y1={cy - aspectR} x2={mcCoords.x} y2={mcCoords.y} stroke="#38bdf8" strokeWidth="2.5" />
              <polygon
                points={`${mcCoords.x},${mcCoords.y} ${mcCoords.x - 4},${mcCoords.y + 8} ${mcCoords.x + 4},${mcCoords.y + 8}`}
                fill="#38bdf8"
              />
              <rect
                x={mcCoords.x - 13}
                y={mcCoords.y - 24}
                width={26}
                height={18}
                rx={4}
                fill="#0284c7"
              />
              <text x={mcCoords.x} y={mcCoords.y - 15} textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-black">
                MC
              </text>
            </g>
          )}

          {/* Aspect Lines inside Inner Circle */}
          {aspectLines.map((asp: any) => {
            const isDimmed = activeFocusBody && !asp.isConnectedToFocus;
            const isSelected = asp.isHighlighted;

            return (
              <line
                key={asp.id}
                x1={asp.x1}
                y1={asp.y1}
                x2={asp.x2}
                y2={asp.y2}
                stroke={asp.color}
                strokeWidth={isSelected ? 2.8 : Math.max(0.9, 2.2 - asp.orb * 0.25)}
                strokeDasharray={asp.strokeDash}
                strokeOpacity={isDimmed ? 0.1 : isSelected ? 1 : 0.65}
                className="transition-all"
              />
            );
          })}

          {/* Planet Radial Indicator Lines */}
          {planetPlacements.map((p) => {
            const isFocus = activeFocusBody === p.body;
            return (
              <line
                key={`line-${p.body}`}
                x1={p.x}
                y1={p.y}
                x2={p.rimX}
                y2={p.rimY}
                stroke={isFocus ? primaryColor : 'rgba(255,255,255,0.2)'}
                strokeWidth={isFocus ? 1.8 : 0.8}
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Planet Badges & Glyphs */}
          {planetPlacements.map((p) => {
            const isFocus = activeFocusBody === p.body;
            const isSelected = selectedBody === p.body;

            return (
              <g
                key={p.body}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBody(selectedBody === p.body ? null : p.body);
                }}
                onMouseEnter={() => setHoveredBody(p.body)}
                onMouseLeave={() => setHoveredBody(null)}
                className="cursor-pointer transition-transform duration-200"
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              >
                {/* Selected Halo Outline (Only when selected or hovered, without continuous ping animation) */}
                {isFocus && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={18}
                    fill={primaryColor}
                    fillOpacity="0.2"
                    stroke={primaryColor}
                    strokeWidth="1.5"
                  />
                )}

                {/* Planet Disk */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isFocus ? 14 : 12.5}
                  fill={isFocus ? '#1e0d3b' : '#0f061e'}
                  stroke={isSelected ? '#ffffff' : isFocus ? primaryColor : p.retrograde ? '#f59e0b' : 'rgba(255,255,255,0.45)'}
                  strokeWidth={isFocus || isSelected ? 2 : 1.2}
                />

                {/* Planet Glyph */}
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-bold select-none text-[12px]"
                  fill={isFocus ? '#ffffff' : primaryColor}
                >
                  {p.symbol}
                </text>

                {/* Retrograde Marker ℞ */}
                {p.retrograde && (
                  <text
                    x={p.x + 9}
                    y={p.y - 8}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-amber-400 font-mono"
                  >
                    ℞
                  </text>
                )}
              </g>
            );
          })}

          {/* Center Decorative Mandala Hub */}
          <circle cx={cx} cy={cy} r={8} fill={primaryColor} opacity={0.9} />
          <circle cx={cx} cy={cy} r={3} fill="#ffffff" />

          {/* ⚡ Outer Transit Ring & Planets */}
          {hasTransits && (
            <g>
              {/* Outer Transit Guideline */}
              <circle
                cx={cx}
                cy={cy}
                r={transitRadius}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.6"
              />
              <circle
                cx={cx}
                cy={cy}
                r={transitRadius + 12}
                fill="none"
                stroke="#10b981"
                strokeWidth="0.8"
                opacity="0.25"
              />

              {/* Transit Planets */}
              {transitPlacements.map((tp) => {
                const isFocus = activeFocusBody === `transit-${tp.body}`;
                const isSelected = selectedBody === `transit-${tp.body}`;
                const targetRim = getCoordinates(tp.absoluteDegree, outerR);

                return (
                  <g
                    key={`transit-${tp.body}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBody(selectedBody === `transit-${tp.body}` ? null : `transit-${tp.body}`);
                    }}
                    onMouseEnter={() => setHoveredBody(`transit-${tp.body}`)}
                    onMouseLeave={() => setHoveredBody(null)}
                    className="cursor-pointer transition-transform duration-200"
                    style={{ transformOrigin: `${tp.x}px ${tp.y}px` }}
                  >
                    {/* Radial connecting line from transit planet to natal rim */}
                    <line
                      x1={tp.x}
                      y1={tp.y}
                      x2={targetRim.x}
                      y2={targetRim.y}
                      stroke="#10b981"
                      strokeWidth={isFocus ? 1.8 : 0.8}
                      strokeDasharray="2,2"
                      opacity={isFocus ? 0.9 : 0.4}
                    />

                    {/* Transit Focus Glow */}
                    {isFocus && (
                      <circle
                        cx={tp.x}
                        cy={tp.y}
                        r={16}
                        fill="#10b981"
                        fillOpacity="0.25"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Transit Planet Disk */}
                    <circle
                      cx={tp.x}
                      cy={tp.y}
                      r={isFocus ? 12 : 10.5}
                      fill="#064e3b"
                      stroke={isSelected ? '#ffffff' : isFocus ? '#34d399' : '#10b981'}
                      strokeWidth={isFocus || isSelected ? 2 : 1.2}
                    />

                    {/* Transit Planet Symbol */}
                    <text
                      x={tp.x}
                      y={tp.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-bold select-none text-[11px] fill-emerald-300"
                    >
                      {tp.symbol}
                    </text>

                    {/* Retrograde Marker */}
                    {tp.retrograde && (
                      <text
                        x={tp.x + 7}
                        y={tp.y - 7}
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-amber-300 font-mono"
                      >
                        ℞
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Planet Info HUD Bar */}
      {activeTransitData ? (
        <div
          className="mt-4 w-full max-w-[620px] p-3.5 rounded-xl border backdrop-blur-xl transition-all shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 bg-emerald-950/80 border-emerald-500/40"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border shadow-inner bg-emerald-900/50 border-emerald-400/60 text-emerald-300"
            >
              {activeTransitData.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold text-sm">
                  ⚡ {activeTransitData.nameEs} <span className="text-emerald-300 text-xs font-normal">(en tránsito actual)</span>
                </h4>
                {activeTransitData.retrograde && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Retrógrado ℞
                  </span>
                )}
              </div>
              <p className="text-white/70 text-xs mt-0.5">
                Ubicado hoy a <strong>{formatDegreeMinute(activeTransitData.degree, activeTransitData.minute)}</strong> en {getSignEmoji(activeTransitData.sign)} <strong>{activeTransitData.sign}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => { setSelectedBody(null); setHoveredBody(null); }}
            className="text-white/40 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕ Cerrar
          </button>
        </div>
      ) : activeBodyData ? (
        <div
          className="mt-4 w-full max-w-[620px] p-3.5 rounded-xl border backdrop-blur-xl transition-all shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}25, rgba(15,10,26,0.9))`,
            borderColor: `${primaryColor}60`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border shadow-inner"
              style={{ background: `${primaryColor}40`, borderColor: `${primaryColor}80` }}
            >
              {activeBodyData.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold text-sm">{activeBodyData.nameEs}</h4>
                {activeBodyData.retrograde && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Retrógrado ℞
                  </span>
                )}
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                {formatDegreeMinute(activeBodyData.degree, activeBodyData.minute)} en {getSignEmoji(activeBodyData.sign)} {activeBodyData.sign} · <strong>Casa {activeBodyData.house || '-'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => { setSelectedBody(null); setHoveredBody(null); }}
            className="text-white/40 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕ Cerrar
          </button>
        </div>
      ) : (
        <p className="mt-3 text-white/40 text-xs text-center">
          💡 Haz clic o pasa el cursor sobre cualquier planeta en la rueda para destacar sus aspectos y posición exacta.
        </p>
      )}

      {/* ⚡ Live Transit Legend Card on Wheel */}
      {hasTransits && (
        <div className="mt-3.5 w-full max-w-[620px] p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 backdrop-blur-xl shadow-lg space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-emerald-300 font-semibold flex items-center gap-1.5 text-xs">
              <span>⚡</span>
              <span>Leyenda de Tránsitos en Vivo</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              ● Anillo Exterior Activo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-white/80">
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 flex-shrink-0" />
              <span><strong>Anillo Interior:</strong> Planetas Natales (Fijos)</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span><strong>Anillo Exterior:</strong> Tránsitos en Vivo (Hoy)</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
              <span><strong>Líneas Rojas:</strong> Tensión (Cuadraturas / Oposiciones)</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span><strong>Líneas Verdes:</strong> Armonía (Trígonos / Sextiles)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}