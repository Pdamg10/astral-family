'use client';
import React, { useState } from 'react';
import { ZODIAC_CHARACTERS, ZodiacCharacter } from '@/lib/zodiacCharacters';
import { ZodiacSign, ZODIAC_SIGNS } from '@/types/astrology';
import { getSignEmoji } from '@/services/astrology/utils';

interface ZodiacCharacterGalleryProps {
  initialSign?: ZodiacSign | 'all';
  primaryColor: string;
  cardBg: string;
  borderRadius: string;
  onClose?: () => void;
}

export default function ZodiacCharacterGallery({
  initialSign = 'all',
  primaryColor,
  cardBg,
  borderRadius,
  onClose,
}: ZodiacCharacterGalleryProps) {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | 'all'>(initialSign);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCharacters = ZODIAC_CHARACTERS.filter(char => {
    const matchesSign = selectedSign === 'all' || char.sign === selectedSign;
    const matchesCategory = selectedCategory === 'all' || char.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.universe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.sign.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSign && matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'anime', label: 'Anime & Manga' },
    { id: 'celebrity', label: 'Hollywood & Famosos' },
    { id: 'historical', label: 'Figuras Históricas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-white tracking-wider flex items-center gap-2">
            <span style={{ color: primaryColor }}>✦</span> Personajes Representativos del Zodíaco
          </h2>
          <p className="text-white/40 text-xs mt-1">
            Explora qué personajes de anime, cine, celebridades e íconos históricos encarnan la esencia de cada signo
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            ← Volver
          </button>
        )}
      </div>

      {/* Zodiac Sign Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSign('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedSign === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/5'
          }`}
        >
          🌌 Todos los Signos
        </button>
        {ZODIAC_SIGNS.map(sign => (
          <button
            key={sign}
            onClick={() => setSelectedSign(sign)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              selectedSign === sign
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/5'
            }`}
          >
            <span>{getSignEmoji(sign)}</span> {sign}
          </button>
        ))}
      </div>

      {/* Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-xl border border-white/10 p-3 rounded-2xl bg-white/5">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar personaje o universo (ej. Gojo, Luffy, Pedro Pascal)..."
          className="w-full sm:w-72 px-3 py-1.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCharacters.map(char => (
          <div
            key={char.id}
            className="backdrop-blur-xl border border-white/10 overflow-hidden group hover:border-purple-400/40 transition-all duration-300 hover:scale-[1.01] shadow-lg flex flex-col"
            style={{ background: cardBg, borderRadius }}
          >
            {/* Card Image Header */}
            <div className="relative h-44 overflow-hidden bg-black/40">
              <img
                src={char.avatarUrl}
                alt={char.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium flex items-center gap-1">
                  <span>{getSignEmoji(char.sign)}</span> {char.sign}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-lg font-light tracking-wide">{char.name}</h3>
                <p className="text-white/60 text-[11px] font-mono">{char.universe}</p>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-xs font-semibold" style={{ color: primaryColor }}>
                  {char.role}
                </p>
                <p className="text-white/70 text-xs mt-1.5 leading-relaxed">
                  {char.description}
                </p>
              </div>

              {/* Trait Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {char.traits.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-purple-200 border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!filteredCharacters.length && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 opacity-30">✨</div>
          <p className="text-white/40 text-sm">No se encontraron personajes con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
