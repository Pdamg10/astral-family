'use client';
import React, { useState } from 'react';
import { getDecanNumberFromDegree, DECANATES_DATABASE, canonicalSignName, DecanateInfo } from '@/services/astrology/decanates';
import type { BirthProfile } from '@/types/prisma-types';

interface DecanateCardProps {
  profile: BirthProfile;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg?: string;
  borderRadius?: string;
}

export default function DecanateCard({
  profile,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg = 'rgba(15, 10, 30, 0.75)',
  borderRadius = '1rem',
}: DecanateCardProps) {
  const sun = profile.planetaryPositions?.find(p => p.body === 'Sun');
  const rawSign = sun?.sign || 'Aries';
  const canonical = canonicalSignName(rawSign);
  const degree = sun?.degree || 0;
  const minute = sun?.minute || 0;

  const actualDecanNum = getDecanNumberFromDegree(degree);
  const [selectedDecanNum, setSelectedDecanNum] = useState<1 | 2 | 3>(actualDecanNum);

  const signData = DECANATES_DATABASE[canonical] || DECANATES_DATABASE['Aries'];
  const currentDecan: DecanateInfo = signData[selectedDecanNum];
  const actualDecan: DecanateInfo = signData[actualDecanNum];

  return (
    <div
      className="p-5 sm:p-6 backdrop-blur-xl border border-white/10 shadow-2xl text-white space-y-4 transition-all"
      style={{ background: cardBg, borderRadius }}
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/20"
            style={{ background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}30)` }}
          >
            <span>🌟</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-purple-200 border border-purple-400/30 bg-purple-500/20">
                Decanatos Solares
              </span>
              <span className="text-white/40 text-xs font-mono">
                {rawSign} {degree}°{minute}'
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide mt-0.5">
              {profile.name} pertenece al{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, #f472b6, #c084fc, #60a5fa)` }}>
                {actualDecanNum}° Decanato de {actualDecan.sign}
              </span>
            </h3>
          </div>
        </div>

        {/* 3 Decanates Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          {([1, 2, 3] as const).map((num) => {
            const isActual = num === actualDecanNum;
            const isSelected = num === selectedDecanNum;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedDecanNum(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-purple-600/60 text-white shadow-md border border-purple-400/40 font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{num}° Decanato</span>
                {isActual && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Decanato natal de esta carta" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Decanate Breakdown */}
      <div className="space-y-4">
        {/* Title & Sub-Rulership Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/40 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-300/80 mb-1">
              <span>✦ Grados: {currentDecan.degreeRange}</span>
              <span>•</span>
              <span>📅 {currentDecan.approxDates}</span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{currentDecan.title}</span>
              <span className="text-sm font-normal text-white/50">({currentDecan.symbol})</span>
            </h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
              <span className="text-white/40 mr-1.5">Regente Principal:</span>
              <span className="font-semibold text-amber-300">{currentDecan.ruler}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
              <span className="text-white/40 mr-1.5">Sub-Regente:</span>
              <span className="font-semibold text-sky-300">
                {currentDecan.subRuler} ({currentDecan.subSign})
              </span>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-white/40 text-xs mr-1">Palabras clave:</span>
          {currentDecan.keywords.map((kw, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-white/80 font-medium"
            >
              #{kw}
            </span>
          ))}
        </div>

        {/* In-depth Description */}
        <p className="text-sm text-white/85 leading-relaxed bg-black/25 p-4 rounded-xl border border-white/5">
          {currentDecan.description}
        </p>

        {/* Two Columns: Traits & Relationship/Spiritual Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Traits */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
            <h5 className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Rasgos y Fortalezas Clave</span>
            </h5>
            <ul className="space-y-1.5 text-xs text-white/80">
              {currentDecan.personalityTraits.map((t, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Relational & Spiritual */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
            <div>
              <h5 className="text-xs font-semibold text-pink-200 flex items-center gap-1.5 mb-1">
                <span>❤️</span>
                <span>En el Amor y las Relaciones</span>
              </h5>
              <p className="text-xs text-white/75 leading-normal">{currentDecan.relationalStyle}</p>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-sky-200 flex items-center gap-1.5 mb-1">
                <span>🌌</span>
                <span>Propósito y Misión Espiritual</span>
              </h5>
              <p className="text-xs text-white/75 leading-normal">{currentDecan.spiritualDrive}</p>
            </div>
          </div>
        </div>

        {/* Life Motto & Shadow Tendency */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-[10px] text-amber-300/80 uppercase font-semibold tracking-wider block">
              Lema de Vida
            </span>
            <p className="text-xs sm:text-sm font-serif italic text-amber-100 mt-0.5">
              {currentDecan.lifeMotto}
            </p>
          </div>
          <div className="text-[11px] text-white/50 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
            <span className="text-rose-300 font-medium mr-1">⚠️ Cuidado con:</span>
            <span>{currentDecan.shadowTendency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
