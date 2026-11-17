'use client';
import React from 'react';
import type { BirthProfile } from '@/types/prisma-types';
import { getDecanateInfo, getDecanNumberFromDegree } from '@/services/astrology/decanates';
import { formatBirthDate, calculateAge } from '@/services/astrology/utils';

interface ProfileCardProps {
  profile: BirthProfile;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg: string;
  borderRadius: string;
  onSelect: (profile: BirthProfile) => void;
  onLinkFamily?: (profile: BirthProfile) => void;
}

export default function ProfileCard({
  profile,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg,
  borderRadius,
  onSelect,
  onLinkFamily,
}: ProfileCardProps) {
  const sun = profile.planetaryPositions?.find((pp: any) => pp.body === 'Sun');
  const moon = profile.planetaryPositions?.find((pp: any) => pp.body === 'Moon');
  const asc = profile.chartPoints?.find((cp: any) => cp.point === 'Ascendant');
  const age = calculateAge(profile.birthDate);
  const hasChildren = Boolean(profile.children && profile.children.length > 0);

  return (
    <div
      onClick={() => onSelect(profile)}
      className="text-left backdrop-blur-xl border border-white/10 p-5 hover:border-white/30 transition-all hover:scale-[1.01] group cursor-pointer w-full relative overflow-hidden shadow-lg flex flex-col justify-between"
      style={{
        background: cardBg,
        borderRadius,
      }}
    >
      {/* Subtle top accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${primaryColor}, ${accentColor}, transparent)`,
        }}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-white text-base font-medium transition-colors flex items-center gap-1.5"
          >
            <span style={{ color: primaryColor }} className="font-normal">✦</span>
            <span>{profile.name}</span>
          </h3>
          <span
            className="text-[11px] px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/15 text-purple-300 font-bold group-hover:border-purple-400/50 transition-all"
          >
            {age} años
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-white/70">
          <div className="flex justify-between">
            <span className="text-white/40">Nacimiento</span>
            <span className="font-medium text-white/90">{formatBirthDate(profile.birthDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Hora</span>
            <span className="font-medium text-white/80">
              {profile.timeUnknown ? 'Desconocida' : profile.birthTime || '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Lugar</span>
            <span className="font-medium text-white/80">{profile.city}, {profile.country}</span>
          </div>

          {profile.partner && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Pareja</span>
              <span className="font-medium text-pink-300">💍 {profile.partner.name}</span>
            </div>
          )}

          {(profile.parent || profile.parent2) && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Hijo/a de</span>
              <span className="font-medium text-purple-300">
                👨‍👩‍👧 {[profile.parent?.name, profile.parent2?.name].filter(Boolean).join(' & ')}
              </span>
            </div>
          )}

          {profile.siblings && profile.siblings.length > 0 && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Hermanos ({profile.siblings.length})</span>
              <span className="font-medium text-sky-300 truncate max-w-[150px]" title={profile.siblings.map(s => s.name).join(', ')}>
                👥 {profile.siblings.map(s => s.name).join(', ')}
              </span>
            </div>
          )}

          {profile.inLaws && profile.inLaws.length > 0 && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Cuñados ({profile.inLaws.length})</span>
              <span className="font-medium text-teal-300 truncate max-w-[150px]" title={profile.inLaws.map(i => i.name).join(', ')}>
                🤝 {profile.inLaws.map(i => i.name).join(', ')}
              </span>
            </div>
          )}

          {profile.unclesAunts && profile.unclesAunts.length > 0 && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Tíos ({profile.unclesAunts.length})</span>
              <span className="font-medium text-emerald-300 truncate max-w-[150px]" title={profile.unclesAunts.map(u => u.name).join(', ')}>
                🧓 {profile.unclesAunts.map(u => u.name).join(', ')}
              </span>
            </div>
          )}

          {profile.niecesNephews && profile.niecesNephews.length > 0 && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Sobrinos ({profile.niecesNephews.length})</span>
              <span className="font-medium text-indigo-300 truncate max-w-[150px]" title={profile.niecesNephews.map(n => n.name).join(', ')}>
                🧸 {profile.niecesNephews.map(n => n.name).join(', ')}
              </span>
            </div>
          )}

          {profile.cousins && profile.cousins.length > 0 && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Primos ({profile.cousins.length})</span>
              <span className="font-medium text-cyan-300 truncate max-w-[150px]" title={profile.cousins.map(c => c.name).join(', ')}>
                🫂 {profile.cousins.map(c => c.name).join(', ')}
              </span>
            </div>
          )}

          {profile.grandparents && profile.grandparents.length > 0 && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Abuelos ({profile.grandparents.length})</span>
              <span className="font-medium text-yellow-300 truncate max-w-[150px]" title={profile.grandparents.map(g => g.name).join(', ')}>
                👴 {profile.grandparents.map(g => g.name).join(', ')}
              </span>
            </div>
          )}

          {hasChildren && (
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-white/40">Hijos ({profile.children?.length})</span>
              <span className="font-medium text-amber-300 truncate max-w-[150px]" title={profile.children?.map(c => c.name).join(', ')}>
                👶 {profile.children?.map(c => c.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        {sun && moon && asc && (
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-1.5 text-[11px]">
            <div
              className="flex-1 py-1 px-1.5 rounded-md text-center border border-white/5"
              style={{ background: `${primaryColor}15` }}
              title="Signo Solar"
            >
              <span className="text-amber-400 mr-1">☉</span>
              <span className="font-medium text-white/90">{sun.sign}</span>
            </div>
            <div
              className="flex-1 py-1 px-1.5 rounded-md text-center border border-white/5"
              style={{ background: `${secondaryColor}15` }}
              title="Signo Lunar"
            >
              <span className="text-sky-300 mr-1">☽</span>
              <span className="font-medium text-white/90">{moon.sign}</span>
            </div>
            <div
              className="flex-1 py-1 px-1.5 rounded-md text-center border border-white/5"
              style={{ background: `${accentColor}15` }}
              title="Ascendente"
            >
              <span className="text-purple-300 mr-1">AC</span>
              <span className="font-medium text-white/90">{asc.sign}</span>
            </div>
          </div>
        )}

        {sun && (
          <div className="mt-2">
            {(() => {
              const decanNum = getDecanNumberFromDegree(sun.degree);
              const decanInfo = getDecanateInfo(sun.sign, sun.degree);
              return (
                <div
                  className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/30 border border-purple-500/20 text-[10px] text-purple-200 flex items-center justify-between shadow-sm"
                  title={`Decanato Solar: ${decanInfo.title} • Sub-regente: ${decanInfo.subRuler} (${decanInfo.subSign})`}
                >
                  <span className="font-semibold text-purple-300 flex items-center gap-1">
                    <span>🌟</span>
                    <span>{decanNum}° Decanato</span>
                  </span>
                  <span className="text-white/60 truncate max-w-[130px]" title={decanInfo.title}>
                    {decanInfo.subRuler} ({decanInfo.subSign})
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {onLinkFamily && (
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-end gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLinkFamily(profile);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1 font-medium shadow-sm hover:scale-[1.02]"
              title={`Agregar, editar o quitar vínculos familiares de ${profile.name}`}
            >
              <span>🔗</span>
              <span>Gestionar Vínculos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
