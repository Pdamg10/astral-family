'use client';
import React, { useState } from 'react';

export interface ZodiacThemePreset {
  id: string;
  sign: string;
  symbol: string;
  element: 'fire' | 'water' | 'air' | 'earth';
  elementName: string;
  paletteColors: [string, string, string, string]; // 4 distinctive colors from exact element images
  gradientColors: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const ZODIAC_THEMES: Record<string, ZodiacThemePreset> = {
  // 🔥 FUEGO (Fire Sign Colour Palette)
  aries: {
    id: 'aries',
    sign: 'Aries',
    symbol: '♈',
    element: 'fire',
    elementName: 'Fuego',
    paletteColors: ['#F9C0D2', '#C90000', '#F45B7E', '#721832'],
    gradientColors: ['#300611', '#721832', '#C90000', '#F45B7E', '#F9C0D2'],
    primaryColor: '#F45B7E',
    secondaryColor: '#C90000',
    accentColor: '#FCFF00',
  },
  leo: {
    id: 'leo',
    sign: 'Leo',
    symbol: '♌',
    element: 'fire',
    elementName: 'Fuego',
    paletteColors: ['#D49B2A', '#FF6F00', '#FF1100', '#F7B3D2'],
    gradientColors: ['#3A0E00', '#8A2700', '#D49B2A', '#FF6F00', '#F7B3D2'],
    primaryColor: '#D49B2A',
    secondaryColor: '#FF6F00',
    accentColor: '#F7B3D2',
  },
  sagittarius: {
    id: 'sagittarius',
    sign: 'Sagitario',
    symbol: '♐',
    element: 'fire',
    elementName: 'Fuego',
    paletteColors: ['#A2B0D6', '#751842', '#282A3A', '#14387F'],
    gradientColors: ['#12131F', '#282A3A', '#751842', '#14387F', '#A2B0D6'],
    primaryColor: '#9333EA',
    secondaryColor: '#14387F',
    accentColor: '#FDE68A',
  },

  // 💧 AGUA (Water Sign Colour Palette)
  pisces: {
    id: 'pisces',
    sign: 'Piscis',
    symbol: '♓',
    element: 'water',
    elementName: 'Agua',
    paletteColors: ['#4ACDE3', '#B7D9CA', '#7FAEFF', '#E1E5E7'],
    gradientColors: ['#0A2533', '#1A4D66', '#4ACDE3', '#7FAEFF', '#B7D9CA'],
    primaryColor: '#4ACDE3',
    secondaryColor: '#7FAEFF',
    accentColor: '#B7D9CA',
  },
  scorpio: {
    id: 'scorpio',
    sign: 'Escorpio',
    symbol: '♏',
    element: 'water',
    elementName: 'Agua',
    paletteColors: ['#78133E', '#0B194D', '#F30089', '#810B10'],
    gradientColors: ['#05081A', '#0B194D', '#78133E', '#810B10', '#F30089'],
    primaryColor: '#F30089',
    secondaryColor: '#78133E',
    accentColor: '#810B10',
  },
  cancer: {
    id: 'cancer',
    sign: 'Cáncer',
    symbol: '♋',
    element: 'water',
    elementName: 'Agua',
    paletteColors: ['#039180', '#8FE7DC', '#FDB87E', '#00ACED'],
    gradientColors: ['#022B27', '#039180', '#00ACED', '#FDB87E', '#8FE7DC'],
    primaryColor: '#039180',
    secondaryColor: '#00ACED',
    accentColor: '#FDB87E',
  },

  // 💨 AIRE (Air Sign Colour Palette)
  libra: {
    id: 'libra',
    sign: 'Libra',
    symbol: '♎',
    element: 'air',
    elementName: 'Aire',
    paletteColors: ['#2B92E4', '#FFA882', '#7CE3BE', '#F8A4CA'],
    gradientColors: ['#0D2F4D', '#2B92E4', '#7CE3BE', '#FFA882', '#F8A4CA'],
    primaryColor: '#F8A4CA',
    secondaryColor: '#2B92E4',
    accentColor: '#7CE3BE',
  },
  aquarius: {
    id: 'aquarius',
    sign: 'Acuario',
    symbol: '♒',
    element: 'air',
    elementName: 'Aire',
    paletteColors: ['#A77DFF', '#F15BB5', '#00BBF9', '#00F5D4'],
    gradientColors: ['#150B2E', '#4B1D8C', '#A77DFF', '#00BBF9', '#00F5D4'],
    primaryColor: '#A77DFF',
    secondaryColor: '#00BBF9',
    accentColor: '#00F5D4',
  },
  gemini: {
    id: 'gemini',
    sign: 'Géminis',
    symbol: '♊',
    element: 'air',
    elementName: 'Aire',
    paletteColors: ['#582C6D', '#D4DDFE', '#8E7CC3', '#CFA4BD'],
    gradientColors: ['#1E0F2B', '#3E1C59', '#582C6D', '#8E7CC3', '#D4DDFE'],
    primaryColor: '#8E7CC3',
    secondaryColor: '#582C6D',
    accentColor: '#D4DDFE',
  },

  // 🌍 TIERRA (Earth Sign Colour Palette)
  taurus: {
    id: 'taurus',
    sign: 'Tauro',
    symbol: '♉',
    element: 'earth',
    elementName: 'Tierra',
    paletteColors: ['#736B15', '#3B4412', '#1A3326', '#420911'],
    gradientColors: ['#120406', '#420911', '#1A3326', '#3B4412', '#736B15'],
    primaryColor: '#736B15',
    secondaryColor: '#1A3326',
    accentColor: '#D97706',
  },
  virgo: {
    id: 'virgo',
    sign: 'Virgo',
    symbol: '♍',
    element: 'earth',
    elementName: 'Virgo',
    paletteColors: ['#58597E', '#2A5863', '#194179', '#619FC9'],
    gradientColors: ['#0E1A29', '#194179', '#2A5863', '#58597E', '#619FC9'],
    primaryColor: '#619FC9',
    secondaryColor: '#2A5863',
    accentColor: '#A3E635',
  },
  capricorn: {
    id: 'capricorn',
    sign: 'Capricornio',
    symbol: '♑',
    element: 'earth',
    elementName: 'Tierra',
    paletteColors: ['#093322', '#789E28', '#F5B819', '#878787'],
    gradientColors: ['#051C13', '#093322', '#789E28', '#F5B819', '#878787'],
    primaryColor: '#789E28',
    secondaryColor: '#F5B819',
    accentColor: '#94A3B8',
  },
};

interface ThemeSelectorProps {
  currentTheme: any;
  cardBg: string;
  borderRadius: string;
  onSaveTheme: (theme: any) => void;
}

export default function ThemeSelector({
  currentTheme,
  cardBg,
  borderRadius,
  onSaveTheme,
}: ThemeSelectorProps) {
  const [activeTab, setActiveTab] = useState<'zodiac' | 'customGradient' | 'background'>('zodiac');
  const [elementFilter, setElementFilter] = useState<'all' | 'fire' | 'water' | 'air' | 'earth'>('all');

  const [activeP, setActiveP] = useState(currentTheme?.themeType || 'dynamic');
  const [backgroundType, setBackgroundType] = useState<string>(currentTheme?.backgroundType || 'dynamic');
  const [backgroundImage, setBackgroundImage] = useState<string>(currentTheme?.backgroundImage || '');
  const [cardOpacity, setCardOpacity] = useState<number>(currentTheme?.cardOpacity || 0.85);
  const [radius, setRadius] = useState<number>(currentTheme?.borderRadius || 12);

  // Custom colors
  const [primaryColor, setPrimaryColor] = useState(currentTheme?.primaryColor || '#a855f7');
  const [secondaryColor, setSecondaryColor] = useState(currentTheme?.secondaryColor || '#ec4899');
  const [accentColor, setAccentColor] = useState(currentTheme?.accentColor || '#f59e0b');

  // Custom gradient color stops (minimum 2 colors)
  const initialGrad = (() => {
    try {
      const g = typeof currentTheme?.gradientColors === 'string'
        ? JSON.parse(currentTheme.gradientColors)
        : currentTheme?.gradientColors;
      return Array.isArray(g) && g.length >= 2 ? g : ['#0f0a1a', '#3b0764', '#1a0a2e'];
    } catch {
      return ['#0f0a1a', '#3b0764', '#1a0a2e'];
    }
  })();

  const [gradientStops, setGradientStops] = useState<string[]>(initialGrad);
  const [gradientAngle, setGradientAngle] = useState<string>('135deg');

  const handleAddStop = () => {
    if (gradientStops.length >= 6) return;
    const lastColor = gradientStops[gradientStops.length - 1];
    setGradientStops([...gradientStops, lastColor || '#7c3aed']);
  };

  const handleRemoveStop = (index: number) => {
    if (gradientStops.length <= 2) return; // Enforce minimum 2 colors
    setGradientStops(gradientStops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, val: string) => {
    const next = [...gradientStops];
    next[index] = val;
    setGradientStops(next);
  };

  const applyZodiacTheme = (z: ZodiacThemePreset) => {
    setActiveP(`zodiac-${z.id}`);
    setBackgroundType('gradient');
    setPrimaryColor(z.primaryColor);
    setSecondaryColor(z.secondaryColor);
    setAccentColor(z.accentColor);
    setGradientStops(z.gradientColors);

    onSaveTheme({
      themeType: `zodiac-${z.id}`,
      backgroundType: 'gradient',
      primaryColor: z.primaryColor,
      secondaryColor: z.secondaryColor,
      accentColor: z.accentColor,
      gradientColors: z.gradientColors,
      cardOpacity,
      borderRadius: radius,
    });
  };

  const applyCustomGradient = () => {
    setBackgroundType('custom-gradient');
    setActiveP('custom-gradient');
    onSaveTheme({
      themeType: 'custom-gradient',
      backgroundType: 'custom-gradient',
      primaryColor,
      secondaryColor,
      accentColor,
      gradientColors: gradientStops,
      cardOpacity,
      borderRadius: radius,
    });
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const applyBackgroundImage = (imgUrl: string) => {
    let clean = (imgUrl || '').trim();
    if (clean.startsWith('file://')) {
      clean = clean.replace('file://', '');
    }
    setBackgroundType('image');
    setBackgroundImage(clean);
    setActiveP('custom-image');
    onSaveTheme({
      themeType: 'custom-image',
      backgroundType: 'image',
      backgroundImage: clean,
      primaryColor,
      secondaryColor,
      accentColor,
      gradientColors: gradientStops,
      cardOpacity,
      borderRadius: radius,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    // Immediate preview with FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setBackgroundImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('astral_token') : null;
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        applyBackgroundImage(data.url);
      } else {
        // If upload endpoint failed, use the dataUrl directly
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) applyBackgroundImage(dataUrl);
        };
      }
    } catch {
      // Fallback to dataURL
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) applyBackgroundImage(dataUrl);
      };
    } finally {
      setIsUploading(false);
    }
  };

  const applyDefaultDynamicCosmic = () => {
    setBackgroundType('dynamic');
    setBackgroundImage('');
    setActiveP('dynamic');
    setPrimaryColor('#a855f7');
    setSecondaryColor('#ec4899');
    setAccentColor('#f59e0b');
    setGradientStops(['#0f0a1a', '#1a0a2e', '#0f0a1a']);
    onSaveTheme({
      themeType: 'dynamic',
      backgroundType: 'dynamic',
      backgroundImage: null,
      primaryColor: '#a855f7',
      secondaryColor: '#ec4899',
      accentColor: '#f59e0b',
      gradientColors: ['#0f0a1a', '#1a0a2e', '#0f0a1a'],
      cardOpacity: 0.85,
      borderRadius: 12,
    });
  };

  const filteredZodiacs = Object.values(ZODIAC_THEMES).filter(
    z => elementFilter === 'all' || z.element === elementFilter
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs (3 Clean Tabs) */}
      <div className="flex flex-wrap gap-1 p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('zodiac')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
            activeTab === 'zodiac'
              ? 'text-white shadow-lg'
              : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeTab === 'zodiac'
              ? {
                  background: `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}20)`,
                  borderColor: `${primaryColor}80`,
                }
              : undefined
          }
        >
          ♈ Paletas Zodiacales (12 Signos Únicos)
        </button>
        <button
          onClick={() => setActiveTab('customGradient')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
            activeTab === 'customGradient'
              ? 'text-white shadow-lg'
              : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeTab === 'customGradient'
              ? {
                  background: `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}20)`,
                  borderColor: `${primaryColor}80`,
                }
              : undefined
          }
        >
          🎨 Crear Degradado (Mín. 2)
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
            activeTab === 'background'
              ? 'text-white shadow-lg'
              : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeTab === 'background'
              ? {
                  background: `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}20)`,
                  borderColor: `${primaryColor}80`,
                }
              : undefined
          }
        >
          🖼️ Fondo e Imagen
        </button>
      </div>

      {/* ─── TAB 1: ZODIAC PALETTES (FROM HIGH-RES ELEMENT IMAGES) ─── */}
      {activeTab === 'zodiac' && (
        <div className="space-y-4">
          {/* Element Filter Pills */}
          <div className="flex gap-2 pb-1 overflow-x-auto">
            <button
              onClick={() => setElementFilter('all')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer border ${
                elementFilter === 'all'
                  ? 'bg-white/20 text-white border-white/40 font-medium shadow-sm'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
              }`}
            >
              ✦ Todos (12)
            </button>
            <button
              onClick={() => setElementFilter('fire')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer border ${
                elementFilter === 'fire'
                  ? 'bg-rose-500/30 text-rose-200 border-rose-400 font-medium shadow-sm'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-rose-300'
              }`}
            >
              🔥 Fuego (Aries, Leo, Sagitario)
            </button>
            <button
              onClick={() => setElementFilter('water')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer border ${
                elementFilter === 'water'
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-medium shadow-sm'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-cyan-300'
              }`}
            >
              💧 Agua (Piscis, Escorpio, Cáncer)
            </button>
            <button
              onClick={() => setElementFilter('air')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer border ${
                elementFilter === 'air'
                  ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400 font-medium shadow-sm'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-indigo-300'
              }`}
            >
              💨 Aire (Libra, Acuario, Géminis)
            </button>
            <button
              onClick={() => setElementFilter('earth')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer border ${
                elementFilter === 'earth'
                  ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 font-medium shadow-sm'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-emerald-300'
              }`}
            >
              🌍 Tierra (Tauro, Virgo, Capricornio)
            </button>
          </div>

          {/* Zodiac Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredZodiacs.map(z => {
              const isSelected = activeP === `zodiac-${z.id}`;
              const gradientCss = `linear-gradient(135deg, ${z.gradientColors.join(', ')})`;

              return (
                <div
                  key={z.id}
                  onClick={() => applyZodiacTheme(z)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-white ring-2 ring-purple-400/70 shadow-2xl scale-[1.02]'
                      : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                  }`}
                  style={{
                    background: gradientCss,
                  }}
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{z.symbol}</span>
                      <div>
                        <h4 className="text-white font-semibold text-sm tracking-wide">{z.sign}</h4>
                        <span className="text-[10px] text-white/70 uppercase tracking-wider">{z.elementName}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/30">
                        ✓ Activo
                      </span>
                    )}
                  </div>

                  {/* 4 Quadrant Palette Preview */}
                  <div className="mb-3 relative z-10">
                    <span className="text-[10px] text-white/60 mb-1.5 block">Paleta de 4 Colores:</span>
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-lg border border-white/10">
                      {z.paletteColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="h-6 rounded-md shadow-inner flex items-center justify-center border border-white/10"
                          style={{ background: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gradient Preview Bar */}
                  <div
                    className="h-2.5 w-full rounded-full border border-white/20 shadow-sm relative z-10"
                    style={{ background: gradientCss }}
                  />

                  {/* Subtle hover sheen */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CUSTOM GRADIENT BUILDER (MINIMUM 2 COLORS) ─── */}
      {activeTab === 'customGradient' && (
        <div className="backdrop-blur-xl border border-white/10 p-5 rounded-xl space-y-5" style={{ background: cardBg, borderRadius }}>
          <div>
            <h3 className="text-white font-medium text-sm mb-1">🎨 Constructor de Degradados</h3>
            <p className="text-white/50 text-xs">
              Personaliza tu propio degradado cósmico con un <strong>mínimo de 2 colores</strong> y hasta 6 paradas de color.
            </p>
          </div>

          {/* Live Gradient Preview Box */}
          <div className="space-y-2">
            <span className="text-white/60 text-xs uppercase tracking-wider">Vista previa en tiempo real:</span>
            <div
              className="h-20 w-full rounded-xl border border-white/20 shadow-2xl transition-all flex items-center justify-center p-3 relative overflow-hidden"
              style={{
                background: gradientAngle === 'radial'
                  ? `radial-gradient(circle, ${gradientStops.join(', ')})`
                  : `linear-gradient(${gradientAngle}, ${gradientStops.join(', ')})`,
              }}
            >
              <span className="text-white text-xs font-medium px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                {gradientStops.length} Colores ({gradientAngle})
              </span>
            </div>
          </div>

          {/* Direction / Angle Selector */}
          <div>
            <span className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Dirección del Degradado:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: '↗ 45°', val: '45deg' },
                { label: '→ 90°', val: '90deg' },
                { label: '↘ 135°', val: '135deg' },
                { label: '↓ 180°', val: '180deg' },
                { label: '↙ 225°', val: '225deg' },
                { label: '◎ Radial', val: 'radial' },
              ].map(dir => (
                <button
                  key={dir.val}
                  onClick={() => setGradientAngle(dir.val)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    gradientAngle === dir.val
                      ? 'text-white shadow-sm'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                  }`}
                  style={
                    gradientAngle === dir.val
                      ? { background: primaryColor, borderColor: accentColor }
                      : undefined
                  }
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Stops Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs uppercase tracking-wider">
                Colores ({gradientStops.length}/6) <span className="text-amber-400/90 text-[11px] font-semibold">(Mínimo 2)</span>:
              </span>
              <button
                onClick={handleAddStop}
                disabled={gradientStops.length >= 6}
                className="px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs rounded-lg font-medium transition-all cursor-pointer shadow-sm"
                style={{ background: primaryColor }}
              >
                + Añadir Color
              </button>
            </div>

            <div className="space-y-2.5">
              {gradientStops.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-lg"
                >
                  <span className="text-white/40 text-xs font-mono w-6">#{idx + 1}</span>
                  <input
                    type="color"
                    value={color}
                    onChange={e => handleStopChange(idx, e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => handleStopChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                    placeholder="#hexcode"
                  />
                  <button
                    onClick={() => handleRemoveStop(idx)}
                    disabled={gradientStops.length <= 2}
                    className="p-1.5 text-white/40 hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title={gradientStops.length <= 2 ? 'Mínimo 2 colores requeridos' : 'Eliminar color'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Primary & Accent Color Fine Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-white/60 text-xs">Color Primario</span>
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-white/60 text-xs">Color Secundario</span>
              <input
                type="color"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-white/60 text-xs">Color de Acento</span>
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>

          <button
            onClick={applyCustomGradient}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            Aplicar y Guardar Degradado Personalizado
          </button>
        </div>
      )}

      {/* ─── TAB 3: BACKGROUND IMAGE & DYNAMIC MODE ─── */}
      {activeTab === 'background' && (
        <div className="backdrop-blur-xl border border-white/10 p-5 rounded-xl space-y-6" style={{ background: cardBg, borderRadius }}>
          <div>
            <h3 className="text-white font-medium text-sm mb-1">🖼️ Selección de Fondo de Pantalla</h3>
            <p className="text-white/50 text-xs">
              Elige entre el fondo cósmico dinámico por defecto, fondos astronómicos predefinidos o sube tu propia imagen.
            </p>
          </div>

          {/* Preset Background Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dynamic Cosmic */}
            <div
              onClick={applyDefaultDynamicCosmic}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                backgroundType === 'dynamic'
                  ? 'bg-purple-950/40 border-purple-400 ring-2 ring-purple-500/50 shadow-xl'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-lg bg-cover bg-center border border-white/20 shadow-md"
                  style={{ backgroundImage: 'url(/images/cosmic-bg.jpg)' }}
                />
                <div>
                  <h4 className="text-white font-medium text-xs">🌌 Cósmico Dinámico (Default)</h4>
                  <p className="text-white/50 text-[10px]">Animación pulsante y nebulosa</p>
                </div>
              </div>
              {backgroundType === 'dynamic' && (
                <span
                  className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                  style={{ background: primaryColor }}
                >
                  ✓ Activo
                </span>
              )}
            </div>

            {/* Deep Galaxy Wallpaper */}
            <div
              onClick={() => applyBackgroundImage('/images/cosmic-bg.jpg')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                backgroundType === 'image' && (backgroundImage === '/images/cosmic-bg.jpg' || backgroundImage === '/background.jpg')
                  ? 'bg-purple-950/40 border-purple-400 ring-2 ring-purple-500/50 shadow-xl'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-lg bg-cover bg-center border border-white/20 shadow-md"
                  style={{ backgroundImage: 'url(/images/cosmic-bg.jpg)' }}
                />
                <div>
                  <h4 className="text-white font-medium text-xs">🪐 Nebulosa Mística</h4>
                  <p className="text-white/50 text-[10px]">Fondo galáctico estrellado</p>
                </div>
              </div>
              {backgroundType === 'image' && (backgroundImage === '/images/cosmic-bg.jpg' || backgroundImage === '/background.jpg') && (
                <span
                  className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                  style={{ background: primaryColor }}
                >
                  ✓ Activo
                </span>
              )}
            </div>
          </div>

          {/* Option 2: Upload Image Directly from Device */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
            <span className="text-white/80 text-xs font-semibold flex items-center gap-2">
              <span>📁</span>
              <span>Subir Imagen desde tu Computadora:</span>
            </span>
            <p className="text-white/40 text-[11px]">
              Selecciona cualquier archivo (.jpg, .jpeg, .png, .webp) de tu equipo o carpeta de Descargas para aplicarlo como fondo instantáneamente.
            </p>

            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-white/20 hover:border-purple-400/80 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all group">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🖼️</span>
              <span className="text-white text-xs font-medium">
                {isUploading ? 'Subiendo imagen...' : 'Haz clic para seleccionar imagen de tu equipo'}
              </span>
              <span className="text-white/40 text-[10px] mt-0.5">PNG, JPG, WEBP hasta 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Option 3: Custom Image URL / Path Input */}
          <div className="space-y-3 pt-2">
            <span className="text-white/60 text-xs uppercase tracking-wider block">🔗 O ingresa URL / Dirección de Imagen:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={backgroundImage || ''}
                onChange={e => setBackgroundImage(e.target.value)}
                placeholder="https://ejemplo.com/fondo.jpg o /uploads/mi_imagen.jpg"
                className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={() => {
                  if (backgroundImage?.trim()) applyBackgroundImage(backgroundImage.trim());
                }}
                disabled={!backgroundImage?.trim()}
                className="px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-all cursor-pointer shadow-md"
                style={{ background: primaryColor }}
              >
                Aplicar Imagen
              </button>
            </div>

            {/* Custom Image Live Preview */}
            {backgroundImage && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-white/20 h-28 bg-black/40">
                <img
                  src={backgroundImage}
                  alt="Vista previa fondo"
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-between p-3">
                  <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                    ✓ Imagen de fondo activa
                  </span>
                  <button
                    onClick={applyDefaultDynamicCosmic}
                    className="text-xs bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    ✕ Quitar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sliders for Glassmorphism & Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Opacidad de Tarjetas</span>
                <span className="font-mono">{Math.round(cardOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={cardOpacity}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setCardOpacity(val);
                  onSaveTheme({
                    themeType: activeP,
                    backgroundType,
                    backgroundImage,
                    primaryColor,
                    secondaryColor,
                    accentColor,
                    gradientColors: gradientStops,
                    cardOpacity: val,
                    borderRadius: radius,
                  });
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Redondez de Bordes</span>
                <span className="font-mono">{radius}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="2"
                value={radius}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setRadius(val);
                  onSaveTheme({
                    themeType: activeP,
                    backgroundType,
                    backgroundImage,
                    primaryColor,
                    secondaryColor,
                    accentColor,
                    gradientColors: gradientStops,
                    cardOpacity,
                    borderRadius: val,
                  });
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
