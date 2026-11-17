'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { searchCities, CityData } from '@/lib/cities';

import type { BirthProfile } from '@/types/prisma-types';

interface ProfileSettingsProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg: string;
  borderRadius: string;
  profiles?: BirthProfile[];
  onLinkFamily?: (profileId?: string) => void;
  onAddChild?: (parentProfileId?: string) => void;
  onAddPartner?: (profileId?: string) => void;
  onAddSibling?: (profileId?: string) => void;
  onSuccessNotification?: (msg: string) => void;
  onErrorNotification?: (msg: string) => void;
}

export default function ProfileSettingsPanel({
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg,
  borderRadius,
  profiles = [],
  onLinkFamily,
  onAddChild,
  onAddPartner,
  onAddSibling,
  onSuccessNotification,
  onErrorNotification,
}: ProfileSettingsProps) {
  const { user, token, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [birthTime, setBirthTime] = useState(user?.birthTime || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || '');
  const [timezone, setTimezone] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Caracas');
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CityData[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    // Immediate preview with FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);

    try {
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
        setAvatar(data.url);
      }
    } catch {
      // Fallback to dataURL already set
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      const err = 'Las contraseñas no coinciden';
      setStatusMsg({ text: err, isError: true });
      onErrorNotification?.(err);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      const err = 'La nueva contraseña debe tener al menos 6 caracteres';
      setStatusMsg({ text: err, isError: true });
      onErrorNotification?.(err);
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        avatar: avatar ? avatar.trim() : null,
        birthDate: birthDate ? birthDate.trim() : null,
        birthTime: birthTime ? birthTime.trim() : null,
        city: city ? city.trim() : null,
        country: country ? country.trim() : null,
        timezone: timezone ? timezone.trim() : null,
        latitude: selectedCityData?.lat,
        longitude: selectedCityData?.lng,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const err = data.error || 'Error al actualizar los datos';
        setStatusMsg({ text: err, isError: true });
        onErrorNotification?.(err);
      } else {
        const successText = 'Tus datos han sido actualizados exitosamente';
        setStatusMsg({ text: successText, isError: false });
        onSuccessNotification?.(successText);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        if (data.user) {
          updateUser(data.user);
        }
      }
    } catch {
      const err = 'Error de red al actualizar los datos';
      setStatusMsg({ text: err, isError: true });
      onErrorNotification?.(err);
    } finally {
      setIsSaving(false);
    }
  };

  const inp = 'w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-400 transition-all shadow-inner';

  return (
    <div
      className="p-6 sm:p-8 backdrop-blur-xl border shadow-2xl space-y-6"
      style={{ background: cardBg, borderRadius, borderColor: `${primaryColor}30` }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border shadow-inner overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}30)`,
              borderColor: `${primaryColor}60`,
            }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <h2 className="text-white text-base font-medium">Mi Cuenta & Perfil</h2>
            <span className="text-xs font-medium" style={{ color: accentColor }}>
              {user?.role === 'admin' ? '👑 Administrador de la Familia' : '✦ Miembro Familiar'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Picture Section */}
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
          <label className="block text-white/80 text-xs font-semibold">
            🖼️ Foto de Perfil (Avatar)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-md flex-shrink-0 bg-black/40 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-white/40 font-bold">
                  {name ? name.charAt(0).toUpperCase() : '✦'}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3.5 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-medium cursor-pointer transition-all">
                  <span>{isUploadingAvatar ? 'Subiendo...' : '📁 Subir desde computadora'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs transition-colors cursor-pointer"
                  >
                    ✕ Quitar Foto
                  </button>
                )}
              </div>
              <input
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                placeholder="O pega una URL de imagen..."
                className={inp}
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-white/70 text-xs font-medium">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className={inp}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-white/70 text-xs font-medium">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inp}
            />
          </div>
        </div>

        {/* Complete Birth Date & Location */}
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
          <h3 className="text-white/80 text-xs font-semibold flex items-center gap-2">
            <span>✨</span>
            <span>Datos de Nacimiento Completos</span>
          </h3>
          <p className="text-white/40 text-[11px]">
            Tu fecha y hora natal permiten calcular tus tránsitos y sinastrías con precisión.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-white/60 text-[11px]">Fecha de Nacimiento</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className={inp}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-white/60 text-[11px]">Hora de Nacimiento</label>
              <input
                type="time"
                value={birthTime}
                onChange={e => setBirthTime(e.target.value)}
                className={inp}
              />
            </div>
            <div className="space-y-1 relative">
              <label className="block text-white/60 text-[11px]">Ciudad de Nacimiento</label>
              <input
                type="text"
                value={city}
                onChange={e => {
                  const val = e.target.value;
                  setCity(val);
                  if (val.trim().length >= 2) {
                    const results = searchCities(val);
                    setCitySuggestions(results);
                    setShowCitySuggestions(true);
                  } else {
                    setShowCitySuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (city.trim().length >= 2) {
                    setCitySuggestions(searchCities(city));
                    setShowCitySuggestions(true);
                  }
                }}
                placeholder="Busca tu ciudad natal..."
                className={inp}
              />
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl z-50 backdrop-blur-xl divide-y divide-white/5">
                  {citySuggestions.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setCity(c.city);
                        setCountry(c.country);
                        setTimezone(c.tz);
                        setSelectedCityData(c);
                        setShowCitySuggestions(false);
                      }}
                      className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <span className="text-white font-medium">{c.city}</span>
                      <span className="text-white/40 text-[10px]">{c.state ? `${c.state}, ` : ''}{c.country} ({c.tz})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-white/60 text-[11px]">País</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Ej. Venezuela, España..."
                className={inp}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-white/60 text-[11px]">Zona Horaria</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                placeholder="America/Caracas, Europe/Madrid..."
                className={inp}
              />
            </div>
          </div>
        </div>

        {/* Family & Lineage Section */}
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-white/80 text-xs font-semibold flex items-center gap-2">
              <span>👨‍👩‍👧</span>
              <span>Linaje Familiar, Pareja & Hijos</span>
            </h3>
            <div className="flex items-center gap-2">
              {onLinkFamily ? (
                <button
                  type="button"
                  onClick={() => {
                    const myProfile = profiles.find(p => p.createdBy === user?.id || p.name.toLowerCase() === user?.name?.toLowerCase());
                    onLinkFamily(myProfile?.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30 text-xs transition-all cursor-pointer flex items-center gap-1.5 font-medium shadow-sm"
                >
                  <span>🔗</span>
                  <span>Gestionar mis Vínculos</span>
                </button>
              ) : (
                <>
                  {onAddPartner && (
                    <button
                      type="button"
                      onClick={() => {
                        const myProfile = profiles.find(p => p.createdBy === user?.id || p.name.toLowerCase() === user?.name?.toLowerCase());
                        onAddPartner(myProfile?.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 text-xs transition-all cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <span>💍 + Pareja</span>
                    </button>
                  )}
                  {onAddSibling && (
                    <button
                      type="button"
                      onClick={() => {
                        const myProfile = profiles.find(p => p.createdBy === user?.id || p.name.toLowerCase() === user?.name?.toLowerCase());
                        onAddSibling(myProfile?.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 text-xs transition-all cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <span>👥 + Hermano/a</span>
                    </button>
                  )}
                  {onAddChild && (
                    <button
                      type="button"
                      onClick={() => {
                        const myProfile = profiles.find(p => p.createdBy === user?.id || p.name.toLowerCase() === user?.name?.toLowerCase());
                        onAddChild(myProfile?.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs transition-all cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <span>👶 + Hijo/a</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <p className="text-white/40 text-[11px]">
            Tus conexiones familiares directas dentro de la biblioteca astral.
          </p>

          {(() => {
            const myProfile = profiles.find(p => p.createdBy === user?.id || p.name.toLowerCase() === user?.name?.toLowerCase());
            const myChildren = myProfile?.children || [];
            const myParent = myProfile?.parent;
            const myParent2 = myProfile?.parent2;
            const myPartner = myProfile?.partner;
            const mySiblings = myProfile?.siblings || [];

            return (
              <div className="space-y-2 pt-1">
                {/* Pareja */}
                {myPartner && (
                  <div className="text-xs text-white/80 bg-pink-500/10 p-2.5 rounded-lg border border-pink-500/20 flex items-center justify-between">
                    <span className="text-pink-300">💍 Tu Pareja vinculada:</span>
                    <span className="font-semibold text-white">{myPartner.name}</span>
                  </div>
                )}

                {/* Padres */}
                {(myParent || myParent2) && (
                  <div className="text-xs text-white/70 bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-white/40">Tus Padres/Madres vinculados:</span>
                    <span className="font-medium text-purple-300">
                      👨‍👩‍👧 {[myParent?.name, myParent2?.name].filter(Boolean).join(' & ')}
                    </span>
                  </div>
                )}

                {/* Hermanos */}
                {mySiblings.length > 0 && (
                  <div className="text-xs text-white/70 bg-sky-500/10 p-2.5 rounded-lg border border-sky-500/20 space-y-1">
                    <span className="text-sky-300 font-medium block">👥 Tus Hermanos/as registrados ({mySiblings.length}):</span>
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {mySiblings.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/30 text-sky-200 text-[11px]">
                          👥 {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cuñados */}
                {myProfile?.inLaws && myProfile.inLaws.length > 0 && (
                  <div className="text-xs text-white/70 bg-teal-500/10 p-2.5 rounded-lg border border-teal-500/20 space-y-1">
                    <span className="text-teal-300 font-medium block">🤝 Tus Cuñados/as vinculados ({myProfile.inLaws.length}):</span>
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {myProfile.inLaws.map(i => (
                        <span key={i.id} className="px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30 text-teal-200 text-[11px]">
                          🤝 {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tíos */}
                {myProfile?.unclesAunts && myProfile.unclesAunts.length > 0 && (
                  <div className="text-xs text-white/70 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 space-y-1">
                    <span className="text-emerald-300 font-medium block">🧓 Tus Tíos/as vinculados ({myProfile.unclesAunts.length}):</span>
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {myProfile.unclesAunts.map(u => (
                        <span key={u.id} className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[11px]">
                          🧓 {u.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sobrinos */}
                {myProfile?.niecesNephews && myProfile.niecesNephews.length > 0 && (
                  <div className="text-xs text-white/70 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 space-y-1">
                    <span className="text-indigo-300 font-medium block">🧸 Tus Sobrinos/as vinculados ({myProfile.niecesNephews.length}):</span>
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {myProfile.niecesNephews.map(n => (
                        <span key={n.id} className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-[11px]">
                          🧸 {n.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primos */}
                {myProfile?.cousins && myProfile.cousins.length > 0 && (
                  <div className="text-xs text-white/70 bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/20 space-y-1">
                    <span className="text-cyan-300 font-medium block">🫂 Tus Primos/as vinculados ({myProfile.cousins.length}):</span>
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {myProfile.cousins.map(c => (
                        <span key={c.id} className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-[11px]">
                          🫂 {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hijos */}
                {myChildren.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-white/50 block">Tus hijos registrados:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {myChildren.map(child => (
                        <div key={child.id} className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs flex items-center justify-between">
                          <span className="text-white/90 font-medium">👶 {child.name}</span>
                          <span className="text-amber-300 text-[10px]">{child.birthDate || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-white/40 italic py-1">
                    No tienes hijos registrados aún. Usa el botón «👶 + Hijo/a» para vincular a tu primer hijo/a.
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Change Password Section */}
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
          <h3 className="text-white/80 text-xs font-semibold flex items-center gap-2">
            <span>🔒</span>
            <span>Cambiar Contraseña (opcional)</span>
          </h3>
          <p className="text-white/40 text-[11px]">
            Deja estos campos vacíos si no deseas modificar tu contraseña actual.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-white/60 text-[11px]">Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••"
                className={inp}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-white/60 text-[11px]">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={inp}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-white/60 text-[11px]">Confirmar nueva</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className={inp}
              />
            </div>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs border ${
              statusMsg.isError
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {statusMsg.isError ? '⚠️ ' : '✅ '}
            {statusMsg.text}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          >
            {isSaving ? 'Guardando cambios...' : 'Guardar Cambios de Perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}
