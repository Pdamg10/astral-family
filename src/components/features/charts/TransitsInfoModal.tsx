'use client';
import React from 'react';

interface TransitsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  showTransits: boolean;
  onToggleTransits: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg?: string;
  borderRadius?: string;
}

export default function TransitsInfoModal({
  isOpen,
  onClose,
  showTransits,
  onToggleTransits,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg = 'rgba(15, 10, 30, 0.95)',
  borderRadius = '1rem',
}: TransitsInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl p-6 sm:p-8 space-y-6 text-white"
        style={{
          background: cardBg,
          borderRadius,
          borderColor: `${primaryColor}50`,
          boxShadow: `0 25px 50px -12px ${primaryColor}25`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg border"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}30)`,
                borderColor: `${accentColor}80`,
              }}
            >
              ⚡
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-light text-white flex items-center gap-2">
                <span>Tránsitos Planetarios en Tiempo Real</span>
              </h2>
              <p className="text-white/40 text-xs">
                Guía completa sobre la superposición del cielo actual con tu carta natal fija
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 text-xs leading-relaxed text-white/80">
          {/* Section 1: ¿Qué es? */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-amber-400">🌌</span>
              <span>1. ¿Qué son los Tránsitos Planetarios?</span>
            </h3>
            <p className="text-white/70">
              Mientras que tu <strong>Carta Natal</strong> es una fotografía fija del cielo en el segundo exacto en que naciste (tu estructura psíquica fundamental), los <strong>Tránsitos</strong> corresponden a las <strong>posiciones vivas y reales que ocupan los planetas hoy en el cielo astronómico</strong>, desplazándose a través del zodíaco en este instante.
            </p>
          </div>

          {/* Section 2: ¿Qué hace esta opción? */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-sky-400">🎯</span>
              <span>2. ¿Qué hace la función "Superponer Tránsitos"?</span>
            </h3>
            <p className="text-white/70">
              Al activar esta opción, la <strong>Rueda Astral HD</strong> dibuja un <strong>segundo anillo exterior</strong> con los planetas en tránsito (destacados en color verde esmeralda y cian). El sistema calcula matemáticamente los ángulos y conexiones (aspectos) que los planetas en movimiento forman contra tus planetas natales.
            </p>
          </div>

          {/* Section 3: ¿Qué significa y para qué sirve? */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-purple-400">🔮</span>
              <span>3. ¿Qué significa y cómo interpretarlo en tu vida?</span>
            </h3>
            <p className="text-white/70">
              Los tránsitos revelan el <strong>clima energético y psicológico del momento presente</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/60 pl-1">
              <li><strong className="text-white/80">Activación de Casas:</strong> Saber qué área de tu vida (amor, trabajo, dinero, hogar o espiritualidad) está recibiendo mayor atención cósmica hoy.</li>
              <li><strong className="text-white/80">Toma de Decisiones:</strong> Identificar periodos propicios para iniciar proyectos, firmar acuerdos o momentos donde conviene pausar e introspeccionar.</li>
              <li><strong className="text-white/80">Ciclos Vitales:</strong> Comprender crisis evolutivas (retornos de Saturno, oposiciones de Urano, cuadraturas de Júpiter) como catalizadores de crecimiento personal.</li>
            </ul>
          </div>

          {/* Section 4: Guía Visual / Leyenda */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-emerald-400">🎨</span>
              <span>4. Leyenda Visual en la Rueda Astral</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
                <span><strong>Anillo Interior:</strong> Tus Planetas Natales (fijos)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
                <span><strong>Anillo Exterior:</strong> Planetas en Tránsito (hoy)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                <span><strong>Líneas Rojas:</strong> Desafíos / Tensión (Cuadraturas)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="w-3 h-3 rounded-full bg-sky-400 flex-shrink-0" />
                <span><strong>Líneas Azules:</strong> Oportunidad / Fluidez (Trígonos)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-center"
          >
            Entendido, cerrar
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleTransits();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: showTransits
                ? 'linear-gradient(135deg, #ef4444, #f43f5e)'
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <span>{showTransits ? '🚫 Ocultar Tránsitos' : '⚡ Activar Tránsitos Ahora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
