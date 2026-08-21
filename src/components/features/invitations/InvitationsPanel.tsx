'use client';
import React, { useState } from 'react';

export interface InvitationUsageRecord {
  id: string;
  invitationId: string;
  userId: string;
  usedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface InvitationItem {
  id: string;
  code: string;
  createdBy: string;
  maxUses: number;
  currentUses: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  usages?: InvitationUsageRecord[];
}

interface InvitationsPanelProps {
  invitations: InvitationItem[];
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg: string;
  borderRadius: string;
  onCreateInvitation: (params: { maxUses: number; expirationPreset: string; customExpiresAt?: string }) => Promise<void>;
  onCopyCode: (code: string) => void;
  onRevokeInvitation?: (id: string) => Promise<void>;
  onDeleteInvitation?: (id: string) => Promise<void>;
}

export default function InvitationsPanel({
  invitations = [],
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg,
  borderRadius,
  onCreateInvitation,
  onCopyCode,
  onRevokeInvitation,
  onDeleteInvitation,
}: InvitationsPanelProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'history'>('active');
  const [maxUses, setMaxUses] = useState(1);
  const [expirationPreset, setExpirationPreset] = useState('24h');
  const [customExpiresAt, setCustomExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const now = new Date();

  // Active invitations: isActive === true and not expired
  const activeInvitations = invitations.filter((inv) => {
    const isExpired = inv.expiresAt ? new Date(inv.expiresAt) < now : false;
    const isExhausted = inv.currentUses >= inv.maxUses;
    return inv.isActive && !isExpired && !isExhausted;
  });

  // History: Invitations that have usages OR are expired / inactive
  const historyInvitations = invitations.filter((inv) => {
    const isExpired = inv.expiresAt ? new Date(inv.expiresAt) < now : false;
    const isExhausted = inv.currentUses >= inv.maxUses;
    return (inv.usages && inv.usages.length > 0) || !inv.isActive || isExpired || isExhausted;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateInvitation({
        maxUses,
        expirationPreset,
        customExpiresAt: expirationPreset === 'custom' ? customExpiresAt : undefined,
      });
      setActiveTab('active');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (code: string) => {
    onCopyCode(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const formatExpiry = (expiresAt?: string | null) => {
    if (!expiresAt) return 'Sin fecha de caducidad';
    const date = new Date(expiresAt);
    const diffMs = date.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expirado';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) {
      return `Expira en ${diffDays} días (${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})`;
    } else if (diffHours >= 1) {
      return `Expira en ${diffHours} hora${diffHours > 1 ? 's' : ''} (${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`;
    } else {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `Expira en ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const inp = 'w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-400 transition-all shadow-inner';
  const btnPrimary = 'px-4 py-2.5 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90 shadow-md cursor-pointer flex items-center justify-center gap-2';

  return (
    <div
      className="p-6 sm:p-8 backdrop-blur-xl border shadow-2xl space-y-6"
      style={{ background: cardBg, borderRadius, borderColor: `${primaryColor}30` }}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-light text-white flex items-center gap-2">
            <span>🎫</span>
            <span>Gestión de Invitaciones</span>
          </h2>
          <p className="text-white/40 text-xs mt-0.5">
            Genera códigos seguros con tiempo de expiración y consulta el registro de quién los utilizó.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-purple-600/40 text-white border border-purple-500/40 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>🟢 Activas</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-purple-500/20 text-purple-300">
              {activeInvitations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-purple-600/40 text-white border border-purple-500/40 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>➕ Nueva</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-purple-600/40 text-white border border-purple-500/40 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>📜 Historial / Uso</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-white/70">
              {historyInvitations.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: CREATE NEW INVITATION */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className="space-y-5 p-5 rounded-2xl bg-black/20 border border-white/5">
          <div className="flex items-center gap-2 text-white font-medium text-xs">
            <span>✨</span>
            <span>Generar Nuevo Código de Invitación Exclusivo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expiration Preset */}
            <div className="space-y-1.5">
              <label className="block text-white/70 text-xs font-medium">
                ⏳ Tiempo de Expiración (Caducidad)
              </label>
              <select
                value={expirationPreset}
                onChange={(e) => setExpirationPreset(e.target.value)}
                className={`${inp} cursor-pointer`}
              >
                <option value="1h" className="bg-slate-900 text-white">⚡ 1 Hora (Urgente / Registro en vivo)</option>
                <option value="6h" className="bg-slate-900 text-white">⏱️ 6 Horas</option>
                <option value="24h" className="bg-slate-900 text-white">📅 24 Horas (1 Día - Recomendado)</option>
                <option value="3d" className="bg-slate-900 text-white">📆 3 Días</option>
                <option value="7d" className="bg-slate-900 text-white">🗓️ 7 Días (1 Semana)</option>
                <option value="30d" className="bg-slate-900 text-white">🌙 30 Días (1 Mes)</option>
                <option value="custom" className="bg-slate-900 text-white">✏️ Fecha y hora personalizada</option>
                <option value="never" className="bg-slate-900 text-white">♾️ Sin Expiración</option>
              </select>
            </div>

            {/* Max Uses */}
            <div className="space-y-1.5">
              <label className="block text-white/70 text-xs font-medium">
                👥 Límite de Usos Permitidos
              </label>
              <select
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className={`${inp} cursor-pointer`}
              >
                <option value={1} className="bg-slate-900 text-white">1 Uso único (Recomendado para 1 familiar)</option>
                <option value={2} className="bg-slate-900 text-white">2 Usos</option>
                <option value={5} className="bg-slate-900 text-white">5 Usos</option>
                <option value={10} className="bg-slate-900 text-white">10 Usos</option>
                <option value={50} className="bg-slate-900 text-white">50 Usos</option>
              </select>
            </div>
          </div>

          {/* Custom Date Picker if selected */}
          {expirationPreset === 'custom' && (
            <div className="space-y-1.5">
              <label className="block text-white/70 text-xs font-medium">
                Fecha y hora exacta de expiración
              </label>
              <input
                type="datetime-local"
                value={customExpiresAt}
                onChange={(e) => setCustomExpiresAt(e.target.value)}
                required
                className={`${inp} [color-scheme:dark]`}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className="px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={btnPrimary}
              style={{ background: primaryColor }}
            >
              {isSubmitting ? 'Generando...' : '➕ Generar Invitación'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ACTIVE INVITATIONS */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeInvitations.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-black/30 border border-purple-500/20 hover:border-purple-500/40 transition-all backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base font-bold text-white tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
                    {inv.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 Activa
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/50 text-[11px] pt-1">
                  <span>👥 Usos: <strong className="text-white/80">{inv.currentUses} / {inv.maxUses}</strong></span>
                  <span>•</span>
                  <span className="text-purple-300 font-medium">⏳ {formatExpiry(inv.expiresAt)}</span>
                  <span>•</span>
                  <span>Creado: {formatDate(inv.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(inv.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
                    copiedCode === inv.code
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/15'
                  }`}
                >
                  <span>{copiedCode === inv.code ? '✓ ¡Copiado!' : '📋 Copiar Código'}</span>
                </button>

                {onRevokeInvitation && (
                  <button
                    type="button"
                    onClick={() => onRevokeInvitation(inv.id)}
                    title="Desactivar este código inmediatamente"
                    className="px-2.5 py-1.5 rounded-xl text-xs text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                  >
                    🚫 Revocar
                  </button>
                )}
              </div>
            </div>
          ))}

          {activeInvitations.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-black/20 border border-white/5 space-y-3">
              <span className="text-3xl">🎫</span>
              <p className="text-white/60 text-xs font-medium">No hay invitaciones activas en este momento</p>
              <p className="text-white/40 text-[11px] max-w-sm mx-auto">
                Crea una nueva invitación con tiempo de caducidad para permitir el registro de un nuevo miembro.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`${btnPrimary} mx-auto mt-2`}
                style={{ background: primaryColor }}
              >
                ➕ Crear Primera Invitación
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT LOG & USAGE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyInvitations.map((inv) => {
            const hasUsages = inv.usages && inv.usages.length > 0;
            const isExpired = inv.expiresAt ? new Date(inv.expiresAt) < now : false;
            const isExhausted = inv.currentUses >= inv.maxUses;

            return (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-white/90">
                      {inv.code}
                    </span>
                    {hasUsages ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        ✓ Utilizada ({inv.currentUses}/{inv.maxUses})
                      </span>
                    ) : isExpired ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⏳ Expirada sin uso
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🚫 Desactivada
                      </span>
                    )}
                  </div>

                  <div className="text-white/40 text-[11px] flex items-center gap-3">
                    <span>Creado: {formatDate(inv.createdAt)}</span>
                    {inv.expiresAt && (
                      <span>• Caducaba: {formatDate(inv.expiresAt)}</span>
                    )}
                    {onDeleteInvitation && (
                      <button
                        type="button"
                        onClick={() => onDeleteInvitation(inv.id)}
                        className="text-rose-400/80 hover:text-rose-300 transition-colors ml-2 cursor-pointer"
                        title="Eliminar del registro"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Usages list: Who used it and when */}
                {hasUsages ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-white/50 text-[11px] font-semibold">
                      👤 Registro de Miembros que Usaron este Código:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {inv.usages!.map((usage) => (
                        <div
                          key={usage.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                            {usage.user.avatar ? (
                              <img src={usage.user.avatar} alt={usage.user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-purple-200 font-bold">
                                {usage.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-xs truncate">{usage.user.name}</p>
                            <p className="text-white/40 text-[10px] truncate">{usage.user.email}</p>
                            <p className="text-purple-300/80 text-[10px] mt-0.5">
                              🕒 Registrado el {formatDate(usage.usedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-white/30 text-[11px] italic">
                    Este código no fue utilizado por ningún usuario antes de expirar o ser revocado.
                  </p>
                )}
              </div>
            );
          })}

          {historyInvitations.length === 0 && (
            <div className="text-center py-10 text-white/30 text-xs">
              Aún no hay invitaciones expiradas o utilizadas en el historial.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
