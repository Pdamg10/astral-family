'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { searchCities, CityData } from '@/lib/cities';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  _count?: {
    birthProfiles: number;
  };
}

interface UsersAdminPanelProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg: string;
  borderRadius: string;
  onSuccessNotification?: (msg: string) => void;
  onErrorNotification?: (msg: string) => void;
}

export default function UsersAdminPanel({
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg,
  borderRadius,
  onSuccessNotification,
  onErrorNotification,
}: UsersAdminPanelProps) {
  const { user: currentUser, token } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit form state
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editBirthTime, setEditBirthTime] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editTimezone, setEditTimezone] = useState('');
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CityData[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [editRole, setEditRole] = useState<'admin' | 'member'>('member');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Delete state
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch {
      onErrorNotification?.('Error al cargar la lista de usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleStartEdit = (targetUser: UserData) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name || '');
    setEditEmail(targetUser.email || '');
    setEditAvatar(targetUser.avatar || '');
    setEditBirthDate(targetUser.birthDate || '');
    setEditBirthTime(targetUser.birthTime || '');
    setEditCity(targetUser.city || '');
    setEditCountry(targetUser.country || '');
    setEditTimezone(targetUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Caracas');
    setSelectedCityData(null);
    setEditRole((targetUser.role as 'admin' | 'member') || 'member');
    setNewPassword('');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) setEditAvatar(dataUrl);
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
        setEditAvatar(data.url);
      }
    } catch {
      // Fallback to dataURL
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const payload: any = {
        targetUserId: editingUser.id,
        name: editName.trim(),
        email: editEmail.trim(),
        avatar: editAvatar ? editAvatar.trim() : null,
        birthDate: editBirthDate ? editBirthDate.trim() : null,
        birthTime: editBirthTime ? editBirthTime.trim() : null,
        city: editCity ? editCity.trim() : null,
        country: editCountry ? editCountry.trim() : null,
        timezone: editTimezone ? editTimezone.trim() : null,
        latitude: selectedCityData?.lat,
        longitude: selectedCityData?.lng,
        role: editRole,
      };

      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
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
        onErrorNotification?.(data.error || 'Error al actualizar usuario');
      } else {
        onSuccessNotification?.(`Usuario ${editName} actualizado exitosamente`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch {
      onErrorNotification?.('Error de red al actualizar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users?id=${deleteTargetUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        onErrorNotification?.(data.error || 'Error al eliminar usuario');
      } else {
        onSuccessNotification?.(data.message || 'Usuario eliminado');
        setDeleteTargetUser(null);
        fetchUsers();
      }
    } catch {
      onErrorNotification?.('Error de red al eliminar usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  const inp = 'w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-400 transition-all shadow-inner';

  return (
    <div className="space-y-6">
      <div
        className="p-6 sm:p-8 backdrop-blur-xl border shadow-2xl space-y-6"
        style={{ background: cardBg, borderRadius, borderColor: `${primaryColor}30` }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-white text-lg font-light tracking-wide flex items-center gap-2">
              <span>👥</span>
              <span>Administración de Usuarios ({users.length})</span>
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              Gestiona los miembros de la familia, edita datos natales completos, fotos de perfil y credenciales
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs transition-all cursor-pointer"
          >
            🔄 Actualizar lista
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-white/40 text-xs">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Usuario</th>
                  <th className="pb-3">Correo</th>
                  <th className="pb-3">Nacimiento</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3">Cartas Creadas</th>
                  <th className="pb-3 pr-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2 font-medium flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/20 bg-black/40 flex items-center justify-center">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-white/60">
                              {u.name ? u.name.charAt(0).toUpperCase() : '✦'}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-white font-medium block">{u.name}</span>
                          {isSelf && <span className="text-[10px] text-purple-300 font-semibold">(Tú)</span>}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-white/70 text-xs">{u.email}</td>
                      <td className="py-3 text-white/60 text-xs">
                        {u.birthDate ? (
                          <span>
                            {u.birthDate} {u.birthTime ? `(${u.birthTime})` : ''}
                            {u.city ? ` · ${u.city}` : ''}
                          </span>
                        ) : (
                          <span className="text-white/30 italic">No registrada</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                          style={
                            u.role === 'admin'
                              ? { background: `${accentColor}20`, borderColor: `${accentColor}50`, color: accentColor }
                              : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
                          }
                        >
                          {u.role === 'admin' ? '👑 Admin' : '✦ Miembro'}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-white/60 pl-4">{u._count?.birthProfiles || 0}</td>
                      <td className="py-3 pr-2 text-right space-x-2">
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-[11px] transition-all cursor-pointer"
                        >
                          ✏️ Editar
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => setDeleteTargetUser(u)}
                            className="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] transition-all cursor-pointer"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal with Integrated Themed Scrollbar */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border backdrop-blur-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            style={{ background: cardBg, borderRadius, borderColor: `${primaryColor}50` }}
          >
            {/* Modal Fixed Header */}
            <div
              className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0"
              style={{ background: `linear-gradient(90deg, ${primaryColor}20, transparent)` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border shadow-inner"
                  style={{ background: `${primaryColor}30`, borderColor: `${primaryColor}60` }}
                >
                  ✏️
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold">Editar Datos de Usuario</h3>
                  <span className="text-[11px] text-white/50">{editingUser.email}</span>
                </div>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="text-white/40 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form with Customized Themed Scrollbar */}
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.5)_rgba(0,0,0,0.2)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-purple-400"
              >
                {/* Avatar Section in Edit Modal */}
                <div className="p-3.5 bg-black/30 rounded-xl border border-white/5 flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 bg-black/50 flex items-center justify-center shadow-md">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-white/50">{editName.charAt(0).toUpperCase() || '✦'}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium cursor-pointer transition-colors">
                        <span>{isUploadingAvatar ? 'Subiendo...' : '📁 Cambiar Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                          className="hidden"
                        />
                      </label>
                      {editAvatar && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar('')}
                          className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-[11px] hover:bg-rose-500/20 transition-colors"
                        >
                          ✕ Quitar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={e => setEditAvatar(e.target.value)}
                      placeholder="O ingresa URL de imagen..."
                      className={inp}
                    />
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-white/70 font-medium">Nombre completo</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                      className={inp}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-white/70 font-medium">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      required
                      className={inp}
                    />
                  </div>
                </div>

                {/* Full Birth Details */}
                <div className="p-3.5 bg-black/30 rounded-xl border border-white/5 space-y-2.5">
                  <label className="block text-white/80 font-semibold flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Datos Natales Completos</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-white/50 text-[10px]">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        value={editBirthDate}
                        onChange={e => setEditBirthDate(e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 text-[10px]">Hora de Nacimiento</label>
                      <input
                        type="time"
                        value={editBirthTime}
                        onChange={e => setEditBirthTime(e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-white/50 text-[10px]">Ciudad</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={e => {
                          const val = e.target.value;
                          setEditCity(val);
                          if (val.trim().length >= 2) {
                            setCitySuggestions(searchCities(val));
                            setShowCitySuggestions(true);
                          } else {
                            setShowCitySuggestions(false);
                          }
                        }}
                        onFocus={() => {
                          if (editCity.trim().length >= 2) {
                            setCitySuggestions(searchCities(editCity));
                            setShowCitySuggestions(true);
                          }
                        }}
                        placeholder="Ej. Caracas"
                        className={inp}
                      />
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl z-50 backdrop-blur-xl divide-y divide-white/5">
                          {citySuggestions.map((c, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setEditCity(c.city);
                                setEditCountry(c.country);
                                setEditTimezone(c.tz);
                                setSelectedCityData(c);
                                setShowCitySuggestions(false);
                              }}
                              className="p-2 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors text-[11px]"
                            >
                              <span className="text-white font-medium">{c.city}</span>
                              <span className="text-white/40 text-[10px]">{c.state ? `${c.state}, ` : ''}{c.country} ({c.tz})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/50 text-[10px]">País</label>
                      <input
                        type="text"
                        value={editCountry}
                        onChange={e => setEditCountry(e.target.value)}
                        placeholder="Ej. Venezuela"
                        className={inp}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-white/50 text-[10px]">Zona Horaria</label>
                      <input
                        type="text"
                        value={editTimezone}
                        onChange={e => setEditTimezone(e.target.value)}
                        placeholder="America/Caracas"
                        className={inp}
                      />
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="block text-white/70 font-medium">Rol del Usuario</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as any)}
                    className={`${inp} cursor-pointer`}
                  >
                    <option value="member" className="bg-slate-900 text-white">✦ Miembro</option>
                    <option value="admin" className="bg-slate-900 text-white">👑 Administrador</option>
                  </select>
                </div>

                {/* Password Reset */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                  <label className="block text-white/70 font-medium">
                    🔒 Restablecer Contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Dejar en blanco para conservar la actual"
                    className={inp}
                  />
                </div>
              </div>

              {/* Modal Fixed Footer */}
              <div className="p-3.5 sm:p-4 border-t border-white/10 bg-black/50 flex justify-end gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-xs border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-sm p-6 rounded-2xl border border-rose-500/40 bg-slate-950/90 backdrop-blur-xl shadow-2xl space-y-4 text-center"
            style={{ borderRadius }}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl mx-auto border border-rose-500/30">
              ⚠️
            </div>
            <h3 className="text-white text-base font-medium">¿Eliminar a {deleteTargetUser.name}?</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Esta acción eliminará permanentemente la cuenta de <strong>{deleteTargetUser.email}</strong> y todas sus configuraciones asociadas de la base de datos.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl text-white/70 hover:text-white text-xs border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
