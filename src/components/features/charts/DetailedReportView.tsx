'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { BirthProfile } from '@/types/prisma-types';
import { getPlanetSymbol, getSignEmoji, formatDegreeMinute, getAspectSymbol, calculateAge } from '@/services/astrology/utils';
import { generateAstrologicalReport } from '@/services/astrology/interpretations';
import AspectarioGrid from './AspectarioGrid';
import DecanateCard from './DecanateCard';
import ReactMarkdown from 'react-markdown';

interface DetailedReportViewProps {
  profile: BirthProfile;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg: string;
  borderRadius: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export default function DetailedReportView({
  profile,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg,
  borderRadius,
}: DetailedReportViewProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'interpretations' | 'tables' | 'ai'>('summary');
  
  // Astro.IA Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const sun = profile.planetaryPositions?.find((pp: any) => pp.body === 'Sun');
  const moon = profile.planetaryPositions?.find((pp: any) => pp.body === 'Moon');
  const asc = profile.chartPoints?.find((cp: any) => cp.point === 'Ascendant') || profile.houses?.find((h: any) => h.houseNumber === 1);
  const mc = profile.chartPoints?.find((cp: any) => cp.point === 'MC') || profile.houses?.find((h: any) => h.houseNumber === 10);

  // Generate comprehensive report dynamically
  const report = generateAstrologicalReport({
    profileName: profile.name,
    sun,
    moon,
    asc,
    mc,
    planetaryPositions: profile.planetaryPositions || [],
    houses: profile.houses || [],
    aspects: profile.aspects || [],
    chartPoints: profile.chartPoints || [],
  });

  const profileAge = calculateAge(profile.birthDate);
  const chatMessagesRef = useRef<ChatMessage[]>(chatMessages);
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  useEffect(() => {
    if (activeTab === 'ai') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiLoading, activeTab]);

  const sendMessage = async (customQuery?: string, isInitial: boolean = false, resetHistory: boolean = false) => {
    const queryToSend = customQuery || inputText.trim();
    if (!isInitial && !queryToSend) return;

    const history = resetHistory
      ? []
      : chatMessagesRef.current.map(m => ({ role: m.role, content: m.content }));

    if (!isInitial) {
      const userMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'user',
        content: queryToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, userMsg]);
      setInputText('');
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('astral_token') : null;

      const res = await fetch('/api/astrology/ai-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          profileName: profile.name,
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          city: profile.city,
          country: profile.country,
          sun,
          moon,
          asc,
          mc,
          planets: profile.planetaryPositions,
          aspects: profile.aspects,
          messages: history,
          userQuery: isInitial ? undefined : queryToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAiError(data.error || 'Error al conectar con Astro.IA');
      } else if (data.reply) {
        const aiMsg: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }
    } catch {
      setAiError('Error de red al comunicarse con Astro.IA');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Initial Welcome synthesis message from Astro.IA on first tab open
  useEffect(() => {
    if (activeTab === 'ai' && chatMessagesRef.current.length === 0 && !isAiLoading) {
      sendMessage(undefined, true);
    }
  }, [activeTab]);

  const handleResetChat = () => {
    setChatMessages([]);
    chatMessagesRef.current = [];
    sendMessage(undefined, true, true);
  };

  const promptSuggestions = [
    '🌌 Síntesis del Alma (Sol, Luna y Ascendente)',
    '❤️ Amor, Química y Vínculos (Venus y Marte)',
    '💼 Vocación, Dinero y Éxito (MC y Casa X)',
    '🗝️ Misión Kármica y Aprendizaje (Nodo Norte y Quirón)',
    '⚡ ¿Cuáles son mis Mayores Dones Ocultos?',
  ];

  // Calculate Element & Modality distributions
  const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  const cardinalSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
  const fixedSigns = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
  const mutableSigns = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];

  const allBodiesForDist = [
    ...(profile.planetaryPositions || []),
    ...(asc ? [{ body: 'Ascendant', sign: asc.sign }] : []),
    ...(mc ? [{ body: 'MC', sign: mc.sign }] : []),
  ];

  let fireCount = 0, earthCount = 0, airCount = 0, waterCount = 0;
  let cardinalCount = 0, fixedCount = 0, mutableCount = 0;

  for (const p of allBodiesForDist) {
    if (fireSigns.includes(p.sign)) fireCount++;
    else if (airSigns.includes(p.sign)) airCount++;
    else if (earthSigns.includes(p.sign)) earthCount++;
    else if (waterSigns.includes(p.sign)) waterCount++;

    if (cardinalSigns.includes(p.sign)) cardinalCount++;
    else if (fixedSigns.includes(p.sign)) fixedCount++;
    else if (mutableSigns.includes(p.sign)) mutableCount++;
  }

  const totalElem = Math.max(1, fireCount + earthCount + airCount + waterCount);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            activeTab === 'summary'
              ? 'text-white shadow-md'
              : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeTab === 'summary'
              ? {
                  background: `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}15)`,
                  borderColor: `${primaryColor}80`,
                }
              : undefined
          }
        >
          📊 Resumen Astronómico
        </button>
        <button
          onClick={() => setActiveTab('interpretations')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            activeTab === 'interpretations'
              ? 'text-white shadow-md'
              : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeTab === 'interpretations'
              ? {
                  background: `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}15)`,
                  borderColor: `${primaryColor}80`,
                }
              : undefined
          }
        >
          📜 Lectura e Interpretación Completa
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            activeTab === 'tables'
              ? 'text-white shadow-md'
              : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeTab === 'tables'
              ? {
                  background: `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}15)`,
                  borderColor: `${primaryColor}80`,
                }
              : undefined
          }
        >
          📐 Tablas de Casas (Placidus) & Aspectario
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'text-white shadow-md'
              : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeTab === 'ai'
              ? {
                  background: `linear-gradient(135deg, ${primaryColor}60, ${secondaryColor}40)`,
                  borderColor: `${accentColor}90`,
                }
              : undefined
          }
        >
          <span className="text-amber-300">🔮</span>
          <span>Astro.IA · Chat Astral</span>
        </button>
      </div>

      {/* SUMMARY TAB */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div
            className="p-6 rounded-2xl border backdrop-blur-xl space-y-2 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${cardBg}, rgba(15, 8, 30, 0.8))`,
              borderRadius,
              borderColor: `${primaryColor}40`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
                  <span>Resumen Astronómico & Arquitectura Psicológica de {profile.name}</span>
                  {profileAge > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      {profileAge} años
                    </span>
                  )}
                </h3>
                <p className="text-xs text-white/60">
                  Fotografía celeste tridimensional calculada para el instante exacto de tu nacimiento ({profile.birthDate} a las {profile.birthTime} en {profile.city}, {profile.country}).
                </p>
                {(() => {
                  const partnerList = profile.partners?.length ? profile.partners : (profile.partner ? [profile.partner] : []);
                  if (partnerList.length === 0) return null;
                  return (
                    <div className="pt-1 text-xs text-pink-300 flex items-center gap-1.5 flex-wrap">
                      <span>💍 {partnerList.length > 1 ? `Parejas (${partnerList.length}):` : 'Pareja:'}</span>
                      <span className="font-semibold text-white/90">{partnerList.map(pt => pt.name).join(', ')}</span>
                    </div>
                  );
                })()}
                {(profile.parent || profile.parent2) && (
                  <div className="pt-1 text-xs text-purple-300 flex items-center gap-1.5">
                    <span>👨‍👩‍👧 Hijo/a de:</span>
                    <span className="font-semibold text-white/90">
                      {[profile.parent?.name, profile.parent2?.name].filter(Boolean).join(' & ')}
                    </span>
                  </div>
                )}
                {profile.children && profile.children.length > 0 && (
                  <div className="pt-1 text-xs text-amber-300 flex items-center gap-1.5 flex-wrap">
                    <span>👶 Hijos ({profile.children.length}):</span>
                    <span className="font-semibold text-white/90">{profile.children.map(c => c.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Big Four Highlight Cards (Sun, Moon, Ascendant, Midheaven) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-white/70 flex items-center gap-1.5">
                <span>👑</span>
                <span>Los 4 Grandes Pilares de la Personalidad</span>
              </h4>
              <span className="text-[10px] text-white/40">Ejes Primordiales de la Carta</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className="p-5 rounded-xl border backdrop-blur-xl transition-all hover:scale-[1.01] hover:border-amber-500/50 space-y-2"
                style={{ background: cardBg, borderRadius, borderColor: `${primaryColor}40` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">☉ Signo Solar</span>
                  <span className="text-xl">☀️</span>
                </div>
                <h3 className="text-xl font-light text-white">
                  {sun ? `${getSignEmoji(sun.sign)} ${sun.sign} ${formatDegreeMinute(sun.degree, sun.minute)}` : 'Calculando...'}
                </h3>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                  Casa {sun?.house || 9} · Identidad & Voluntad
                </span>
                <p className="text-xs text-white/65 leading-relaxed pt-1">
                  Tu núcleo consciente, el motor de vitalidad, el propósito existencial y la fuerza creadora que da coherencia a tu vida.
                </p>
              </div>

              <div
                className="p-5 rounded-xl border backdrop-blur-xl transition-all hover:scale-[1.01] hover:border-sky-500/50 space-y-2"
                style={{ background: cardBg, borderRadius, borderColor: `${secondaryColor}40` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-sky-300">☽ Signo Lunar</span>
                  <span className="text-xl">🌙</span>
                </div>
                <h3 className="text-xl font-light text-white">
                  {moon ? `${getSignEmoji(moon.sign)} ${moon.sign} ${formatDegreeMinute(moon.degree, moon.minute)}` : 'Calculando...'}
                </h3>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                  Casa {moon?.house || 2} · Mundo Emocional
                </span>
                <p className="text-xs text-white/65 leading-relaxed pt-1">
                  Tu refugio afectivo inconsciente, patrones de apego, memoria de la infancia y cómo procesas la vulnerabilidad y el cuidado.
                </p>
              </div>

              <div
                className="p-5 rounded-xl border backdrop-blur-xl transition-all hover:scale-[1.01] hover:border-purple-500/50 space-y-2"
                style={{ background: cardBg, borderRadius, borderColor: `${accentColor}40` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">AC Ascendente</span>
                  <span className="text-xl">🌅</span>
                </div>
                <h3 className="text-xl font-light text-white">
                  {asc ? `${getSignEmoji(asc.sign)} ${asc.sign} ${formatDegreeMinute(asc.degree, asc.minute)}` : 'Calculando...'}
                </h3>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                  Cúspide Casa 1 · Máscara del Alma
                </span>
                <p className="text-xs text-white/65 leading-relaxed pt-1">
                  El filtro mediante el cual experimentas el mundo, tu presencia física y el estilo espontáneo de iniciativa que irradias al entorno.
                </p>
              </div>

              <div
                className="p-5 rounded-xl border backdrop-blur-xl transition-all hover:scale-[1.01] hover:border-emerald-500/50 space-y-2"
                style={{ background: cardBg, borderRadius, borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">🏛️ Medio Cielo</span>
                  <span className="text-xl">🧭</span>
                </div>
                <h3 className="text-xl font-light text-white">
                  {mc ? `${getSignEmoji(mc.sign)} ${mc.sign} ${formatDegreeMinute(mc.degree, mc.minute)}` : 'Calculando...'}
                </h3>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                  Cúspide Casa 10 · Vocación & Legado
                </span>
                <p className="text-xs text-white/65 leading-relaxed pt-1">
                  La cumbre de tu realización pública, el estatus profesional, tu liderazgo ante la sociedad y la huella duradera que dejas en el mundo.
                </p>
              </div>
            </div>
          </div>

          {/* 🌟 Decanato Solar & Sub-Regencia Planetaria */}
          <DecanateCard
            profile={profile}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            cardBg={cardBg}
            borderRadius={borderRadius}
          />

          {/* Elemental & Modality Distribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Elements */}
            <div className="p-6 rounded-xl border backdrop-blur-xl space-y-4" style={{ background: cardBg, borderRadius, borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-white text-sm font-semibold flex items-center gap-1.5">
                    <span>🔥</span>
                    <span>Balance de los 4 Elementos</span>
                  </h4>
                  <p className="text-[11px] text-white/50">La naturaleza energética y temperamento primordial de tu psique.</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {report.elementalSynthesis.dominantElement}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Fuego (Pasión & Acción)', count: fireCount, emoji: '🔥', color: '#ef4444', desc: 'Inspiración, coraje, optimismo y liderazgo audaz.' },
                  { name: 'Tierra (Pragmatismo & Materia)', count: earthCount, emoji: '🌍', color: '#16a34a', desc: 'Realismo, disciplina, perseverancia y orden tangible.' },
                  { name: 'Aire (Mente & Comunicación)', count: airCount, emoji: '💨', color: '#38bdf8', desc: 'Intelecto, objetividad, diálogo y visión social.' },
                  { name: 'Agua (Emoción & Sensibilidad)', count: waterCount, emoji: '💧', color: '#818cf8', desc: 'Intuición, empatía, profundidad psíquica y compasión.' },
                ].map(el => (
                  <div key={el.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/80">
                      <span className="font-medium">{el.emoji} {el.name}</span>
                      <span className="font-mono text-white/90">{el.count} cuerpos ({Math.round((el.count / totalElem) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(el.count / totalElem) * 100}%`, background: el.color }}
                      />
                    </div>
                    <p className="text-[10px] text-white/50">{el.desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/70 pt-3 border-t border-white/5 leading-relaxed bg-white/[0.02] p-3 rounded-lg">
                💡 <strong>Síntesis Elemental:</strong> {report.elementalSynthesis.elementalSummary}
              </p>
            </div>

            {/* Modalities */}
            <div className="p-6 rounded-xl border backdrop-blur-xl space-y-4" style={{ background: cardBg, borderRadius, borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-white text-sm font-semibold flex items-center gap-1.5">
                    <span>◆</span>
                    <span>Modalidades & Cuadruplicidades</span>
                  </h4>
                  <p className="text-[11px] text-white/50">El estilo operativo y ritmo de manifestación ante los desafíos.</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {report.elementalSynthesis.dominantModality}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Cardinal (Iniciador & Líder)', count: cardinalCount, sym: '◆', color: '#f59e0b', desc: 'Apertura de nuevos caminos, toma de iniciativa y espíritu emprendedor.' },
                  { name: 'Fijo (Concentrador & Tenaz)', count: fixedCount, sym: '■', color: '#8b5cf6', desc: 'Resistencia, consolidación, lealtad y concentración profunda.' },
                  { name: 'Mutable (Adaptable & Versátil)', count: mutableCount, sym: '▲', color: '#06b6d4', desc: 'Flexibilidad ante el cambio, agilidad mental, mediación y versatilidad.' },
                ].map(mo => (
                  <div key={mo.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/80">
                      <span className="font-medium">{mo.sym} {mo.name}</span>
                      <span className="font-mono text-white/90">{mo.count} cuerpos ({Math.round((mo.count / totalElem) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(mo.count / totalElem) * 100}%`, background: mo.color }}
                      />
                    </div>
                    <p className="text-[10px] text-white/50">{mo.desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/70 pt-3 border-t border-white/5 leading-relaxed bg-white/[0.02] p-3 rounded-lg">
                💡 <strong>Síntesis de Ritmo:</strong> {report.elementalSynthesis.modalitySummary}
              </p>
            </div>
          </div>

          {/* Full Planetary Positions Table with Educational Card */}
          <div className="p-6 rounded-xl border backdrop-blur-xl space-y-4" style={{ background: cardBg, borderRadius, borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                <span>🪐</span>
                <span>Posiciones Planetarias y Coordenadas Exactas</span>
              </h4>
              <span className="text-[11px] text-white/40">Zodíaco Tropical & Casas Placidus</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Cuerpo Celeste</th>
                    <th className="pb-3">Signo Zodiacal</th>
                    <th className="pb-3">Grado & Minuto</th>
                    <th className="pb-3">Casa Natal</th>
                    <th className="pb-3">Movimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {(profile.planetaryPositions || []).map((pp: any) => (
                    <tr key={pp.body} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-medium flex items-center gap-2">
                        <span className="text-base font-bold" style={{ color: primaryColor }}>{getPlanetSymbol(pp.body)}</span>
                        <span>{pp.body}</span>
                      </td>
                      <td className="py-2.5">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span>{getSignEmoji(pp.sign)}</span>
                          <span className="text-white/95">{pp.sign}</span>
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-white/90">
                        {formatDegreeMinute(pp.degree, pp.minute)}
                      </td>
                      <td className="py-2.5 font-medium text-purple-300">Casa {pp.house || '-'}</td>
                      <td className="py-2.5">
                        {pp.retrograde ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                            Retrógrado ℞
                          </span>
                        ) : (
                          <span className="text-white/40 text-[11px]">Directo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <span>ℹ️</span>
                <span>¿Qué significa que un planeta esté Retrógrado (℞)?</span>
              </span>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Astronómicamente, es un efecto óptico de desaceleración aparente desde la perspectiva terrestre. Psicológicamente, indica que la energía de ese planeta no se vuelca de forma automática hacia afuera, sino que opera con una <strong>profunda maduración interior, introspección filosófica y revisión reflexiva</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INTERPRETATIONS TAB */}
      {activeTab === 'interpretations' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div
            className="p-6 rounded-2xl border backdrop-blur-xl space-y-2 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${cardBg}, rgba(25, 10, 35, 0.8))`,
              borderRadius,
              borderColor: `${primaryColor}40`,
            }}
          >
            <h3 className="text-lg font-light text-white">{report.title}</h3>
            <p className="text-white/70 text-xs leading-relaxed">{report.prologue}</p>
          </div>

          {/* Educational Framework: The 3 Psychological Levels */}
          <div className="p-5 rounded-xl border backdrop-blur-xl bg-purple-950/25 border-purple-500/30 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-purple-300 flex items-center gap-1.5">
              <span>🧠</span>
              <span>Estructura de Interpretación Psicológica en 3 Niveles</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="font-bold text-amber-300 block">1️⃣ Planetas Personales</span>
                <span className="text-[10px] text-white/40 block">Sol, Luna, Mercurio, Venus, Marte</span>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Las herramientas directas de la conciencia cotidiana: tu identidad, emociones, intelecto, afecto y capacidad de conquista.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="font-bold text-sky-300 block">2️⃣ Planetas Sociales</span>
                <span className="text-[10px] text-white/40 block">Júpiter y Saturno</span>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Tu relación con la sociedad, la ética, la expansión de horizontes, la disciplina, el trabajo maduro y la ley moral.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="font-bold text-rose-300 block">3️⃣ Transpersonales & Nodos</span>
                <span className="text-[10px] text-white/40 block">Urano, Neptuno, Plutón, Quirón, Lilith, Nodos</span>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Las fuerzas del inconsciente colectivo, la transmutación espiritual, la herida de sanación y el propósito kármico del alma.
                </p>
              </div>
            </div>
          </div>

          {/* Master Axis: Ascendant & Midheaven */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border backdrop-blur-xl space-y-2" style={{ background: cardBg, borderRadius, borderColor: `${primaryColor}40` }}>
              <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                <span className="text-lg text-rose-400 font-bold">🌅 {report.ascendant.symbol}</span>
                <div>
                  <h4 className="text-white text-sm font-semibold">Ascendente en {report.ascendant.sign} ({report.ascendant.degreeFormatted})</h4>
                  <span className="text-[10px] text-white/40">Cúspide de la Casa I · Puerta de la Identidad</span>
                </div>
              </div>
              <p className="text-white/75 text-xs leading-relaxed">{report.ascendant.text}</p>
            </div>

            <div className="p-6 rounded-xl border backdrop-blur-xl space-y-2" style={{ background: cardBg, borderRadius, borderColor: `${secondaryColor}40` }}>
              <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                <span className="text-lg text-sky-400 font-bold">🏛️ MC</span>
                <div>
                  <h4 className="text-white text-sm font-semibold">Medio Cielo en {report.midheaven.sign} ({report.midheaven.degreeFormatted})</h4>
                  <span className="text-[10px] text-white/40">Cúspide de la Casa X · Cumbre Vocacional</span>
                </div>
              </div>
              <p className="text-white/75 text-xs leading-relaxed">{report.midheaven.text}</p>
            </div>
          </div>

          {/* Full Planet Breakdown Cards */}
          <div className="space-y-4">
            {report.planets.map((planet) => (
              <div
                key={planet.body}
                className="p-6 rounded-xl border backdrop-blur-xl space-y-3 transition-all hover:border-purple-500/40"
                style={{ background: cardBg, borderRadius, borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>{getPlanetSymbol(planet.body as any)}</span>
                    <div>
                      <h4 className="text-white text-sm font-semibold">{planet.title}</h4>
                      <span className="text-[11px] text-white/50">
                        Ubicado en {getSignEmoji(planet.sign)} <strong>{planet.sign}</strong> · <strong>Casa {planet.house}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 p-3.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="font-semibold text-white/80 block" style={{ color: primaryColor }}>
                      ✦ Arquetipo Psicológico en {planet.sign}:
                    </span>
                    <p className="text-white/70 leading-relaxed text-[11px]">{planet.signInterpretation}</p>
                  </div>
                  <div className="space-y-1.5 p-3.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="font-semibold text-white/80 block" style={{ color: accentColor }}>
                      ✦ Esfera de Experiencia Concreta (Casa {planet.house}):
                    </span>
                    <p className="text-white/70 leading-relaxed text-[11px]">{planet.houseInterpretation}</p>
                  </div>
                </div>

                {planet.aspectInterpretations.length > 0 && (
                  <div className="pt-2.5 border-t border-white/5 space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                      Aspectos relevantes y diálogos energéticos de {planet.body}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {planet.aspectInterpretations.map((asp, aidx) => (
                        <div key={aidx} className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs space-y-1">
                          <span className="font-medium text-white/90 block">
                            {getAspectSymbol(asp.type as any)} {asp.aspectTitle}
                          </span>
                          <p className="text-white/60 text-[11px] leading-relaxed">{asp.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Epilogue */}
          <div
            className="p-6 rounded-xl border backdrop-blur-xl text-center space-y-2 shadow-xl"
            style={{ background: cardBg, borderRadius, borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <span className="text-xl">✨</span>
            <h4 className="text-white text-sm font-semibold">Síntesis de Integración & Autorrealización</h4>
            <p className="text-white/70 text-xs italic leading-relaxed max-w-3xl mx-auto">{report.epilogue}</p>
          </div>
        </div>
      )}

      {/* TABLES & ASPECTARIUM TAB */}
      {activeTab === 'tables' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Introduction */}
          <div
            className="p-6 rounded-2xl border backdrop-blur-xl space-y-2 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${cardBg}, rgba(20, 10, 40, 0.8))`,
              borderRadius,
              borderColor: `${primaryColor}40`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📐</span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Guía Fundamental de Casas Astrológicas (Placidus) & Matriz de Aspectos
                </h3>
                <p className="text-xs text-white/60">
                  Comprende el mapa de escenarios de vida (Casas) y el diálogo geométrico entre tus arquetipos planetarios (Aspectos).
                </p>
              </div>
            </div>
          </div>

          {/* 📐 SECCIÓN 1: CÚSPIDES DE CASAS (SISTEMA PLACIDUS) */}
          <div className="space-y-4">
            <div
              className="p-6 rounded-xl border backdrop-blur-xl space-y-4 shadow-xl"
              style={{ background: cardBg, borderRadius, borderColor: `${accentColor}30` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                    <span>📐</span>
                    <span>1. Cúspides de Casas (Sistema Placidus de {profile.name})</span>
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Grados exactos donde inicia cada uno de los 12 escenarios de vida calculados para {profile.city}, {profile.country}.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 w-fit">
                  Topocéntrico Placidus
                </span>
              </div>

              {/* 12 House Quick Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {(profile.houses || []).map((h: any) => (
                  <div key={h.houseNumber} className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-center hover:bg-white/5 transition-all">
                    <span className="text-[10px] text-white/40 font-mono block">Casa {h.houseNumber}</span>
                    <span className="text-xs font-semibold text-white mt-0.5 flex items-center justify-center gap-1">
                      <span>{getSignEmoji(h.sign)}</span>
                      <span>{h.sign}</span>
                    </span>
                    <span className="text-[11px] text-white/70 font-mono block mt-0.5">
                      {formatDegreeMinute(h.degree, h.minute)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Educational Cards: ¿Qué son y qué hace Placidus? */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                  <h5 className="font-semibold text-white flex items-center gap-1.5 text-amber-300">
                    <span>🏛️</span>
                    <span>¿Qué es una Casa Astrológica?</span>
                  </h5>
                  <p className="text-white/70 leading-relaxed text-[11px]">
                    Si los <strong>Planetas</strong> representan <em>"QUÉ"</em> energía actúa (la mente, la voluntad, las emociones) y los <strong>Signos</strong> representan <em>"CÓMO"</em> se viste esa energía, las <strong>Casas</strong> representan <em>"DÓNDE"</em> (en qué área concreta de la vida real) se manifiesta: tu dinero, tus relaciones, tu trabajo, tu hogar o tu vocación.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                  <h5 className="font-semibold text-white flex items-center gap-1.5 text-sky-300">
                    <span>⏱️</span>
                    <span>¿Por qué el Sistema Placidus?</span>
                  </h5>
                  <p className="text-white/70 leading-relaxed text-[11px]">
                    Desarrollado por el astrónomo y matemático Placidus de Titis en el siglo XVII, es el sistema topocéntrico de trisección temporal más respetado del mundo. Mide el tiempo exacto que tarda cada grado de la eclíptica en ascender desde el horizonte oriental (Ascendente) hasta el meridiano superior (MC), reflejando con exactitud matemática la latitud geográfica de tu nacimiento.
                  </p>
                </div>
              </div>

              {/* Clasificación de Casas: Angulares, Sucedentes y Cadentes */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-2.5 text-xs">
                <h5 className="font-semibold text-white flex items-center gap-1.5 text-purple-300">
                  <span>🧭</span>
                  <span>Estructura y Jerarquía de las Casas</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="font-bold text-rose-400 block">🏛️ Angulares (I, IV, VII, X)</span>
                    <p className="text-white/60">Los 4 pilares cardinales de la vida: Identidad (AC), Hogar (IC), Pareja (DC) y Vocación (MC). Gran dinamismo e iniciativa externa.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="font-bold text-amber-400 block">🏦 Sucedentes (II, V, VIII, XI)</span>
                    <p className="text-white/60">Consolidación y recursos: Finanzas, Creatividad, Bienes compartidos y Amistades. Brindan estabilidad, foco y seguridad.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="font-bold text-cyan-400 block">🎓 Cadentes (III, VI, IX, XII)</span>
                    <p className="text-white/60">Aprendizaje y transición: Comunicación, Hábitos/Salud, Filosofía y Trascendencia. Flexibilidad mental, servicio e introspección.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desglose Detallado de las 12 Casas */}
            <div
              className="p-6 rounded-xl border backdrop-blur-xl space-y-4 shadow-xl"
              style={{ background: cardBg, borderRadius, borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                <span>📜</span>
                <span>Significado Detallado de las 12 Casas en tu Carta</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    num: 1,
                    title: 'Casa I (Ascendente - AC)',
                    area: 'Identidad, Proyección Personal & Vitalidad',
                    type: 'Angular',
                    desc: 'Rige la personalidad física y manifiesta, la imagen que proyectas al mundo, tu estilo de iniciativa espontáneo y cómo comienzas nuevos ciclos.',
                  },
                  {
                    num: 2,
                    title: 'Casa II',
                    area: 'Recursos Propios, Finanzas & Autoestima',
                    type: 'Sucedente',
                    desc: 'Rige la economía personal, la capacidad para generar ingresos con talentos propios, la escala de valores éticos y lo que te da seguridad material.',
                  },
                  {
                    num: 3,
                    title: 'Casa III',
                    area: 'Comunicación, Mente Concreta & Entorno Cercano',
                    type: 'Cadente',
                    desc: 'Rige el pensamiento lógico, la expresión oral y escrita, el intercambio con hermanos, vecinos, viajes cortos y la curiosidad cotidiana.',
                  },
                  {
                    num: 4,
                    title: 'Casa IV (Fondo del Cielo - IC)',
                    area: 'Hogar, Raíces, Familia & Subconsciente',
                    type: 'Angular',
                    desc: 'Rige la base emocional íntima, los orígenes familiares, el linaje ancestral, la vivienda privada y el refugio interior del alma.',
                  },
                  {
                    num: 5,
                    title: 'Casa V',
                    area: 'Creatividad, Romance, Hijos & Gozo Vital',
                    type: 'Sucedente',
                    desc: 'Rige la autoexpresión artística, los proyectos nacidos del corazón, los romances apasionados, los juegos, la diversión y la alegría de vivir.',
                  },
                  {
                    num: 6,
                    title: 'Casa VI',
                    area: 'Salud, Trabajo Cotidiano, Hábitos & Servicio',
                    type: 'Cadente',
                    desc: 'Rige la disciplina diaria, el ambiente laboral, el cuidado del cuerpo físico, la nutrición, el orden y el perfeccionamiento técnico útil.',
                  },
                  {
                    num: 7,
                    title: 'Casa VII (Descendente - DC)',
                    area: 'Pareja, Asociaciones & Vínculos Formales',
                    type: 'Angular',
                    desc: 'Rige el matrimonio, los socios comerciales, los contratos legales y la forma en que te encuentras frente al espejo del "Tú" en relaciones de igual a igual.',
                  },
                  {
                    num: 8,
                    title: 'Casa VIII',
                    area: 'Transformación, Sexualidad & Finanzas Compartidas',
                    type: 'Sucedente',
                    desc: 'Rige las herencias, recursos conjuntos en pareja, la intimidad sexual profunda, la transmutación psicológica y el renacimiento tras las crisis.',
                  },
                  {
                    num: 9,
                    title: 'Casa IX',
                    area: 'Filosofía, Altos Estudios, Viajes & Cosmovisión',
                    type: 'Cadente',
                    desc: 'Rige los horizontes lejanos, viajes al extranjero, la educación superior, la ética, las leyes, la búsqueda espiritual y el sentido de la existencia.',
                  },
                  {
                    num: 10,
                    title: 'Casa X (Medio Cielo - MC)',
                    area: 'Vocación, Carrera, Éxito & Reputación Pública',
                    type: 'Angular',
                    desc: 'Rige el estatus profesional, los logros que la sociedad reconoce, el liderazgo público y la huella o legado trascendente que construyes.',
                  },
                  {
                    num: 11,
                    title: 'Casa XI',
                    area: 'Amistades, Metas Colectivas & Proyectos de Futuro',
                    type: 'Sucedente',
                    desc: 'Rige los círculos de amigos afines, las causas humanitarias, las redes sociales, los ideales comunitarios y las esperanzas para el porvenir.',
                  },
                  {
                    num: 12,
                    title: 'Casa XII',
                    area: 'Inconsciente Colectivo, Espiritualidad & Karma',
                    type: 'Cadente',
                    desc: 'Rige el retiro interior, la conexión con lo divino, la intuición sutil, la compasión universal, el perdón sanador y la trascendencia del ego.',
                  },
                ].map(hInfo => {
                  const houseData = profile.houses?.find((h: any) => h.houseNumber === hInfo.num);
                  const planetsInHouse = profile.planetaryPositions?.filter((pp: any) => pp.house === hInfo.num) || [];

                  return (
                    <div
                      key={hInfo.num}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white text-xs">{hInfo.title}</span>
                          <span className="text-[10px] text-white/40">({hInfo.type})</span>
                        </div>
                        {houseData && (
                          <span className="text-[11px] font-mono text-amber-300 font-medium">
                            {getSignEmoji(houseData.sign)} {houseData.sign} {formatDegreeMinute(houseData.degree, houseData.minute)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-white/80" style={{ color: primaryColor }}>
                        ✦ {hInfo.area}
                      </p>

                      <p className="text-[11px] text-white/60 leading-relaxed">
                        {hInfo.desc}
                      </p>

                      {planetsInHouse.length > 0 && (
                        <div className="pt-1.5 border-t border-white/5 flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="text-white/40">Planetas en Casa {hInfo.num}:</span>
                          {planetsInHouse.map((pp: any) => (
                            <span
                              key={pp.body}
                              className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-200 border border-purple-500/30 font-medium flex items-center gap-1"
                            >
                              <span>{getPlanetSymbol(pp.body)}</span>
                              <span>{pp.body}</span>
                              <span className="text-white/60">({pp.sign})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 📊 SECCIÓN 2: MATRIZ DE ASPECTOS (ASPECTARIO) */}
          <div className="space-y-4">
            <div
              className="p-6 rounded-xl border backdrop-blur-xl space-y-4 shadow-xl"
              style={{ background: cardBg, borderRadius, borderColor: `${primaryColor}30` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                    <span>📊</span>
                    <span>2. Matriz de Aspectos Astrológicos (Aspectario)</span>
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Cálculo geométrico exacto de ángulos y orbes entre los cuerpos celestes de tu carta natal.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 w-fit">
                  Aspectario Interactivo
                </span>
              </div>

              {/* Aspectary Table */}
              <div className="overflow-x-auto">
                <AspectarioGrid
                  aspects={profile.aspects || []}
                  bodies={['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ascendant','MC']}
                  primaryColor={primaryColor}
                />
              </div>

              {/* Guía Explicativa de Aspectos y Orbes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                  <h5 className="font-semibold text-white flex items-center gap-1.5 text-emerald-400">
                    <span>✨</span>
                    <span>¿Qué es un Aspecto Astrológico?</span>
                  </h5>
                  <p className="text-white/70 leading-relaxed text-[11px]">
                    Un aspecto es la distancia angular matemática (en grados de arco) entre dos planetas o puntos. Representa el <strong>diálogo psicológico interno</strong>: cómo conversan, cooperan, se complementan o se tensionan diferentes partes de tu personalidad.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                  <h5 className="font-semibold text-white flex items-center gap-1.5 text-amber-400">
                    <span>🎯</span>
                    <span>¿Qué significa el Orbe (Orb)?</span>
                  </h5>
                  <p className="text-white/70 leading-relaxed text-[11px]">
                    El orbe es el margen de aproximación en grados respecto al ángulo exacto. Por ejemplo, un trígono exacto es a 120°; si se ubica a 121°, tiene un orbe de 1°. <strong>A menor orbe (0° a 2°), mayor es la intensidad y presencia consciente</strong> del aspecto en tu vida cotidiana.
                  </p>
                </div>
              </div>

              {/* Tabla de los 6 Aspectos Principales */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 text-xs">
                <h5 className="font-semibold text-white flex items-center gap-1.5 text-purple-300">
                  <span>📐</span>
                  <span>Guía Completa de los 6 Aspectos Astrológicos</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
                  {[
                    {
                      sym: '☌',
                      name: 'Conjunción (0°)',
                      type: 'Fusión Energética',
                      color: primaryColor,
                      desc: 'Unión total de dos energías en un mismo punto. Gran potencia, foco y el inicio de un nuevo ciclo vital.',
                    },
                    {
                      sym: '☍',
                      name: 'Oposición (180°)',
                      type: 'Tensión Polar & Espejo',
                      color: '#ef4444',
                      desc: 'Dos planetas frente a frente. Pide consciencia, integración de opuestos y búsqueda de equilibrio en los vínculos.',
                    },
                    {
                      sym: '△',
                      name: 'Trígono (120°)',
                      type: 'Armonía & Fluidez',
                      color: '#10b981',
                      desc: 'Conexión entre el mismo elemento. Talentos innatos, dones naturales y facilidad para manifestar metas.',
                    },
                    {
                      sym: '□',
                      name: 'Cuadratura (90°)',
                      type: 'Desafío & Maestría',
                      color: '#f43f5e',
                      desc: 'Tensión constructiva entre energías en conflicto. Es el motor que impulsa a superar retos y madurar.',
                    },
                    {
                      sym: '⚹',
                      name: 'Sextil (60°)',
                      type: 'Oportunidad Creativa',
                      color: '#06b6d4',
                      desc: 'Estímulo fértil y cooperación mental. Ofrece oportunidades que se aprovechan mediante la acción consciente.',
                    },
                    {
                      sym: '⚻',
                      name: 'Quincuncio (150°)',
                      type: 'Ajuste & Adaptación',
                      color: '#f59e0b',
                      desc: 'Conecta naturalezas dispares. Requiere flexibilidad, reajuste de hábitos y maduración psicológica.',
                    },
                  ].map(asp => (
                    <div key={asp.name} className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm" style={{ color: asp.color }}>
                          {asp.sym} {asp.name}
                        </span>
                        <span className="text-[10px] text-white/50 font-medium">{asp.type}</span>
                      </div>
                      <p className="text-white/70 leading-relaxed text-[10px]">
                        {asp.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASTRO.IA CHAT TAB */}
      {activeTab === 'ai' && (
        <div className="space-y-4 animate-in fade-in">
          <div
            className="rounded-2xl border backdrop-blur-2xl shadow-2xl flex flex-col h-[580px] sm:h-[640px] max-h-[75vh] overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${cardBg}, rgba(8, 4, 18, 0.95))`,
              borderColor: `${primaryColor}40`,
            }}
          >
            {/* Astro.IA Header */}
            <div
              className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md flex-shrink-0"
              style={{ background: `linear-gradient(90deg, ${primaryColor}25, transparent)` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-lg border relative flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    borderColor: `${accentColor}80`,
                  }}
                >
                  ✨
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm tracking-wide">Astro.IA</h3>
                    <span
                      className="text-[10px] px-2 py-0.2 rounded-full font-semibold border"
                      style={{ background: `${accentColor}20`, borderColor: `${accentColor}50`, color: accentColor }}
                    >
                      Guía Astral
                    </span>
                  </div>
                  <p className="text-white/40 text-[11px] truncate max-w-[200px] sm:max-w-none">
                    Analizando la carta de <strong>{profile.name}</strong> ({profile.city}, {profile.country})
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetChat}
                disabled={isAiLoading}
                className="px-3 py-1.5 rounded-xl text-xs border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex-shrink-0"
              >
                🔄 Reiniciar
              </button>
            </div>

            {/* Chat Messages Container (No horizontal overflow) */}
            <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto overflow-x-hidden space-y-3.5 [scrollbar-width:thin]">
              {chatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs sm:text-sm border shadow-md mt-1"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}60, ${secondaryColor}60)`,
                          borderColor: `${primaryColor}80`,
                        }}
                      >
                        ✨
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed shadow-xl border break-words overflow-hidden ${
                        isUser
                          ? 'text-white border-purple-500/30'
                          : 'text-white/90 border-white/10 bg-black/40'
                      }`}
                      style={
                        isUser
                          ? { background: `linear-gradient(135deg, ${primaryColor}80, ${secondaryColor}70)` }
                          : undefined
                      }
                    >
                      {!isUser ? (
                        <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed break-words overflow-hidden">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="break-words">{msg.content}</p>
                      )}
                      <div className="mt-2 text-right">
                        <span className="text-[10px] text-white/30 font-mono">{msg.timestamp}</span>
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 bg-white/10 border border-white/20 flex items-center justify-center text-xs sm:text-sm mt-1">
                        👤
                      </div>
                    )}
                  </div>
                );
              })}

              {isAiLoading && (
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs sm:text-sm border shadow-md mt-1 animate-pulse"
                    style={{ background: `${primaryColor}40`, borderColor: `${primaryColor}80` }}
                  >
                    ✨
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/60 flex items-center gap-2">
                    <span className="animate-spin inline-block text-purple-300">✦</span>
                    <span>Astro.IA está sintonizando las posiciones planetarias...</span>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
                  ⚠️ {aiError}
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Suggestions (Wrap nicely without horizontal scrollbar) */}
            <div className="px-3.5 py-2 bg-black/30 border-t border-white/5 flex flex-wrap items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mr-1 hidden sm:inline">Temas:</span>
              {promptSuggestions.map((promptText, pidx) => (
                <button
                  key={pidx}
                  onClick={() => sendMessage(promptText)}
                  disabled={isAiLoading}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-purple-400/50 transition-all cursor-pointer disabled:opacity-40 whitespace-normal text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 sm:p-3.5 bg-black/50 border-t border-white/10 flex items-center gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Pregúntale a Astro.IA sobre la carta de ${profile.name}...`}
                disabled={isAiLoading}
                className="flex-1 px-3.5 sm:px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-xs focus:outline-none focus:border-purple-400 transition-all"
              />
              <button
                type="submit"
                disabled={isAiLoading || !inputText.trim()}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <span>Enviar</span>
                <span>↑</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
