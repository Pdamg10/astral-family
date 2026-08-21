'use client';
import React, { useState, useEffect } from 'react';
import { ZODIAC_CHARACTERS, ZodiacCharacter } from '@/lib/zodiacCharacters';
import { ZodiacSign } from '@/types/astrology';

interface ZodiacHeroBannerProps {
  primaryColor: string;
  onOpenGallery: (selectedSign?: ZodiacSign) => void;
}

const FEATURED_CHARACTERS = [
  ZODIAC_CHARACTERS.find(c => c.id === 'leo-1')!, // Layla & Mona
  ZODIAC_CHARACTERS.find(c => c.id === 'cancer-1')!, // Sailor Moon
  ZODIAC_CHARACTERS.find(c => c.id === 'libra-2')!, // Gojo Satoru
  ZODIAC_CHARACTERS.find(c => c.id === 'pisces-1')!, // Shinobu Kocho
  ZODIAC_CHARACTERS.find(c => c.id === 'aries-1')!, // Eren Yeager
  ZODIAC_CHARACTERS.find(c => c.id === 'virgo-1')!, // Levi Ackerman
].filter(Boolean);

export default function ZodiacHeroBanner({ primaryColor, onOpenGallery }: ZodiacHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % FEATURED_CHARACTERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = FEATURED_CHARACTERS[currentIndex] || FEATURED_CHARACTERS[0];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + FEATURED_CHARACTERS.length) % FEATURED_CHARACTERS.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % FEATURED_CHARACTERS.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-purple-950/90 backdrop-blur-2xl p-6 sm:p-8 transition-all duration-700">
      {/* Background Decorative Glow */}
      <div
        className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-1000"
        style={{ background: primaryColor }}
      />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-20 bg-blue-500 pointer-events-none" />

      {/* Main Banner Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-4 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full animate-ping" style={{ background: primaryColor }} />
            <span className="text-[11px] font-medium tracking-wider text-purple-200 uppercase">
              ✦ {current.universe} · {current.sign}
            </span>
          </div>

          {/* Title and Role */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-white drop-shadow-md">
              {current.name}
            </h2>
            <p className="text-sm font-medium mt-1" style={{ color: primaryColor }}>
              {current.role}
            </p>
          </div>

          {/* Description */}
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-xl">
            {current.description}
          </p>

          {/* Traits pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {current.traits.map((trait, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-white/80"
              >
                #{trait}
              </span>
            ))}
          </div>

          {/* Action Button & Navigation */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => onOpenGallery(current.sign)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #6366f1)` }}
            >
              Ver Personajes de {current.sign} →
            </button>
            <button
              onClick={() => onOpenGallery()}
              className="text-xs text-white/60 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
            >
              Ver Galería Completa
            </button>
          </div>
        </div>

        {/* Character Card / Artwork Preview (Anime UI Style) */}
        <div className="relative w-full md:w-72 h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
          <img
            src={current.avatarUrl}
            alt={current.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <div>
              <p className="font-semibold text-sm">{current.name}</p>
              <p className="text-white/60 text-[10px]">{current.universe}</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-[10px]">
              {current.sign}
            </span>
          </div>
        </div>
      </div>

      {/* Carousel Controls & Indicators */}
      <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          {FEATURED_CHARACTERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                currentIndex === idx ? 'w-8 bg-purple-400' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white text-xs transition-all cursor-pointer"
            title="Anterior"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white text-xs transition-all cursor-pointer"
            title="Siguiente"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
