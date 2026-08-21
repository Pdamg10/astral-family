'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import AstrologyWheel from '@/components/features/charts/AstrologyWheel';
import AspectarioGrid from '@/components/features/charts/AspectarioGrid';
import DetailedReportView from '@/components/features/charts/DetailedReportView';
import DashboardHeader, { ViewType } from '@/components/features/dashboard/DashboardHeader';
import ProfileCard from '@/components/features/dashboard/ProfileCard';
import FamilyTreePanel from '@/components/features/family-tree/FamilyTreePanel';
import ThemeSelector from '@/components/features/theme/ThemeSelector';
import AddProfileForm from '@/components/features/profiles/AddProfileForm';
import InvitationsPanel from '@/components/features/invitations/InvitationsPanel';
import ProfileSettingsPanel from '@/components/features/users/ProfileSettingsPanel';
import UsersAdminPanel from '@/components/features/users/UsersAdminPanel';
import DynamicCosmicBackground from '@/components/features/theme/DynamicCosmicBackground';
import TransitsInfoModal from '@/components/features/charts/TransitsInfoModal';
import LinkFamilyModal from '@/components/features/modals/LinkFamilyModal';
import ZodiacSignCounterBar from '@/components/features/dashboard/ZodiacSignCounterBar';
import DecanateCard from '@/components/features/charts/DecanateCard';
import { getPlanetSymbol, getAspectSymbol, getSignEmoji, formatDegreeMinute } from '@/services/astrology/utils';
import { calculateCurrentTransits } from '@/services/astrology/synastry';
import { exportSvgToFile, exportPngFromFile, printChartReport } from '@/lib/chartExport';
import type { BirthProfile } from '@/types/prisma-types';
import type { TransitResult } from '@/types/astrology';
import { io, Socket } from 'socket.io-client';

function formatDate(ds?: string): string {
  if (!ds) return '';
  try {
    const parts = ds.includes('-') ? ds.split('-') : ds.split('/');
    if (parts.length < 3) return ds;
    const [y, m, d] = parts;
    const ms = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const monthIdx = parseInt(m, 10) - 1;
    const dayNum = parseInt(d, 10);
    if (isNaN(dayNum) || isNaN(monthIdx) || !ms[monthIdx]) return ds;
    return `${dayNum} de ${ms[monthIdx]} de ${y}`;
  } catch {
    return ds || '';
  }
}

function signToAbs(sign: string, deg: number, min: number = 0): number {
  const map: Record<string, number> = {
    Aries: 0,
    Taurus: 30, Tauro: 30,
    Gemini: 60, Géminis: 60,
    Cancer: 90, Cáncer: 90,
    Leo: 120,
    Virgo: 150,
    Libra: 180,
    Scorpio: 210, Escorpio: 210,
    Sagittarius: 240, Sagitario: 240,
    Capricorn: 270, Capricornio: 270,
    Aquarius: 300, Acuario: 300,
    Pisces: 330, Piscis: 330,
  };
  return (map[sign] || 0) + deg + (min / 60);
}

const SIGN_NAMES_ES: Record<string, string> = {
  Aries: 'Aries',
  Taurus: 'Tauro', Tauro: 'Tauro',
  Gemini: 'Géminis', Géminis: 'Géminis',
  Cancer: 'Cáncer', Cáncer: 'Cáncer',
  Leo: 'Leo',
  Virgo: 'Virgo',
  Libra: 'Libra',
  Scorpio: 'Escorpio', Escorpio: 'Escorpio',
  Sagittarius: 'Sagitario', Sagitario: 'Sagitario',
  Capricorn: 'Capricornio', Capricornio: 'Capricornio',
  Aquarius: 'Acuario', Acuario: 'Acuario',
  Pisces: 'Piscis', Piscis: 'Piscis',
};

const PLANET_NAMES_ES: Record<string, string> = {
  Sun: 'Sol',
  Moon: 'Luna',
  Mercury: 'Mercurio',
  Venus: 'Venus',
  Mars: 'Marte',
  Jupiter: 'Júpiter',
  Saturn: 'Saturno',
  Uranus: 'Urano',
  Neptune: 'Neptuno',
  Pluto: 'Plutón',
  Ascendant: 'Ascendente (AC)',
  MC: 'Medio Cielo (MC)',
  DESC: 'Descendente (DC)',
  IC: 'Fondo Cielo (IC)',
  NorthNode: 'Nodo Norte',
  SouthNode: 'Nodo Sur',
  Chiron: 'Quirón',
  Lilith: 'Lilith (Luna Negra)',
  PartOfFortune: 'Parte de Fortuna',
};

function getSignNameEs(sign: string): string {
  return SIGN_NAMES_ES[sign] || sign;
}

function getPlanetNameEs(body: string): string {
  return PLANET_NAMES_ES[body] || body;
}

function ptLabel(p: string): string {
  return PLANET_NAMES_ES[p] || p;
}

function calculateAge(birthDateStr?: string): number {
  if (!birthDateStr) return 0;
  try {
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  } catch {
    return 0;
  }
}

export default function AstralFamilyHome() {
  const { user, token, theme, isAuthenticated, isLoading, login, register, logout, setTheme, initialize } = useAuthStore();
  const [view, setView] = useState<ViewType>('login');
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [selProfile, setSelProfile] = useState<BirthProfile | null>(null);
  const [chartMode, setChartMode] = useState<'wheel' | 'detailed'>('wheel');
  const socketRef = useRef<Socket | null>(null);
  const [notifs, setNotifs] = useState<{ id: string; msg: string; type?: 'info' | 'success' | 'error' }[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [loginE, setLoginE] = useState('');
  const [loginP, setLoginP] = useState('');
  const [regN, setRegN] = useState('');
  const [regE, setRegE] = useState('');
  const [regP, setRegP] = useState('');
  const [regC, setRegC] = useState('');
  const [invs, setInvs] = useState<any[]>([]);

  // Transits, Family Link & Zodiac state
  const [showTransits, setShowTransits] = useState(false);
  const [showTransitsInfoModal, setShowTransitsInfoModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkModalProfileAId, setLinkModalProfileAId] = useState<string | null>(null);
  const [selectedZodiacSign, setSelectedZodiacSign] = useState<string | null>(null);
  const [addProfileParentId, setAddProfileParentId] = useState<string | null>(null);
  const [addProfilePartnerId, setAddProfilePartnerId] = useState<string | null>(null);
  const [addProfileSiblingId, setAddProfileSiblingId] = useState<string | null>(null);
  useEffect(() => { initialize(); }, []);

  const notify = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifs(p => [...p, { id, msg, type }]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 4000);
  };

  const isOwnProfile = useCallback((p?: BirthProfile | null) => {
    if (!p || !user) return false;
    if (p.createdBy && p.createdBy === user.id) return true;
    if (user.name && p.name && p.name.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
    return false;
  }, [user]);

  const fetchProfiles = useCallback(async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('astral_token') : null);
    if (!activeToken) return;
    try {
      const r = await fetch('/api/profiles', { headers: { Authorization: `Bearer ${activeToken}` } });
      const d = await r.json();
      if (r.ok && d.profiles) {
        setProfiles(d.profiles);
        setSelProfile(prev => {
          if (!prev) return d.profiles[0] || null;
          const matched = d.profiles.find((p: any) => p.id === prev.id);
          return matched || d.profiles[0] || null;
        });
      }
    } catch {
      notify('Error al cargar perfiles', 'error');
    }
  }, [token]);

  useEffect(() => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('astral_token') : null);
    if (!activeToken) return;
    let isMounted = true;
    fetch('/api/profiles', { headers: { Authorization: `Bearer ${activeToken}` } })
      .then(r => r.json())
      .then(d => {
        if (isMounted && d.profiles) {
          setProfiles(d.profiles);
          setSelProfile(prev => {
            if (!prev) return d.profiles[0] || null;
            const matched = d.profiles.find((p: any) => p.id === prev.id);
            return matched || d.profiles[0] || null;
          });
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [isAuthenticated, token]);

  const fetchInvitations = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    try {
      const r = await fetch('/api/invitations', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok && d.invitations) setInvs(d.invitations);
    } catch {}
  }, [token, user]);

  useEffect(() => {
    if (!isAuthenticated || !token || user?.role !== 'admin') return;
    let isMounted = true;
    fetch('/api/invitations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (isMounted && d.invitations) setInvs(d.invitations);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [isAuthenticated, token, user]);

  const saveThemeSettings = async (t: any) => {
    // Optimistically update theme in store and localStorage immediately
    setTheme(t);
    if (!token) return;
    try {
      const r = await fetch('/api/themes', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
      const d = await r.json();
      if (r.ok && d.theme) {
        setTheme(d.theme as any);
        notify('Tema visual guardado exitosamente', 'success');
      }
    } catch {
      notify('Error al sincronizar tema con la base de datos', 'error');
    }
  };

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;
    const s = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      auth: { token },
    });
    s.on('profile-updated', () => { fetchProfiles(); });
    s.on('profile-created', () => { fetchProfiles(); });
    socketRef.current = s;
    return () => { s.disconnect(); };
  }, [isAuthenticated, token, fetchProfiles]);

  // Transits calculation derived with useMemo
  const transitData = useMemo<TransitResult | null>(() => {
    if (selProfile?.isCalculated && selProfile.planetaryPositions) {
      return calculateCurrentTransits(
        selProfile.planetaryPositions.map((pp: any) => ({
          body: pp.body,
          sign: pp.sign,
          degree: pp.degree,
          minute: pp.minute,
          absoluteDegree: signToAbs(pp.sign, pp.degree, pp.minute),
          retrograde: pp.retrograde,
        }))
      );
    }
    return null;
  }, [selProfile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(loginE, loginP);
    if (ok) {
      setView('dashboard');
    } else {
      notify('Credenciales inválidas', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(regN, regE, regP, regC);
    if (ok) {
      setRegN(''); setRegE(''); setRegP(''); setRegC('');
      notify('Cuenta creada exitosamente', 'success');
    } else {
      notify('Error al registrar usuario. Verifica el código de invitación.', 'error');
    }
  };

  const handleSaveProfile = async (profileData: any) => {
    if (!token) return false;

    try {
      const r = await fetch('/api/profiles', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const d = await r.json();
      if (r.ok) {
        socketRef.current?.emit('profile-created', { name: profileData.name });
        notify(`Carta natal de ${profileData.name} calculada y guardada`, 'success');
        fetchProfiles();
        setView('dashboard');
        return true;
      } else {
        notify(d.error || 'Error al guardar perfil', 'error');
        return false;
      }
    } catch {
      notify('Error de conexión', 'error');
      return false;
    }
  };

  const handleCreateInvitation = async (params: { maxUses: number; expirationPreset: string; customExpiresAt?: string }) => {
    if (!token || user?.role !== 'admin') {
      notify('Solo el administrador puede emitir invitaciones', 'error');
      return;
    }
    try {
      const r = await fetch('/api/invitations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const d = await r.json();
      if (r.ok && d.invitation) {
        setInvs(prev => [d.invitation, ...prev]);
        notify(`Invitación ${d.invitation.code} generada exitosamente`, 'success');
      } else {
        notify(d.error || 'Error al generar invitación', 'error');
      }
    } catch {
      notify('Error al generar invitación', 'error');
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    if (!token || user?.role !== 'admin') return;
    try {
      const r = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false }),
      });
      if (r.ok) {
        notify('Código de invitación revocado', 'info');
        fetchInvitations();
      }
    } catch {
      notify('Error al revocar invitación', 'error');
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    if (!token || user?.role !== 'admin') return;
    if (!confirm('¿Deseas eliminar este registro de invitación?')) return;
    try {
      const r = await fetch(`/api/invitations?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        setInvs(prev => prev.filter(inv => inv.id !== id));
        notify('Registro de invitación eliminado', 'info');
      }
    } catch {
      notify('Error al eliminar registro', 'error');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!token || user?.role !== 'admin') {
      notify('Solo el administrador puede eliminar perfiles', 'error');
      return;
    }
    if (!confirm('¿Estás seguro de que deseas eliminar este perfil astral?')) return;
    try {
      const r = await fetch(`/api/profiles?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        socketRef.current?.emit('profile-deleted', { id });
        fetchProfiles();
        notify('Perfil eliminado', 'info');
        if (selProfile?.id === id) {
          setSelProfile(null);
          setView('dashboard');
        }
      }
    } catch {
      notify('Error al eliminar perfil', 'error');
    }
  };

  const hexToRgba = (hex: string, opacity: number): string => {
    let clean = (hex || '').replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return `rgba(15, 10, 26, ${opacity})`;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const p = theme?.primaryColor || '#a855f7';
  const a = theme?.accentColor || '#f59e0b';
  const sColor = theme?.secondaryColor || '#ec4899';
  const bgType = theme?.backgroundType || 'dynamic';
  const bgImage = theme?.backgroundImage || null;
  const themeGradientColors = (() => {
    if (!theme?.gradientColors) return ['#0f0a1a', '#1a0a2e', '#0f0a1a'];
    try {
      const c = typeof theme.gradientColors === 'string' ? JSON.parse(theme.gradientColors) : theme.gradientColors;
      return Array.isArray(c) && c.length >= 2 ? c : ['#0f0a1a', '#1a0a2e', '#0f0a1a'];
    } catch {
      return ['#0f0a1a', '#1a0a2e', '#0f0a1a'];
    }
  })();
  const grad = `linear-gradient(135deg, ${themeGradientColors.join(',')})`;

  const baseCardTone = theme?.backgroundColor || themeGradientColors[0] || '#0f0a1a';
  const cBg = hexToRgba(baseCardTone, theme?.cardOpacity || 0.85);
  const cardBorder = `${p}40`;
  const rad = `${theme?.borderRadius || 12}px`;
  const inp = 'w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 text-xs focus:outline-none transition-all';
  const btn = 'w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 cursor-pointer shadow-md';

  const effectiveView = !isAuthenticated
    ? (view === 'register' ? 'register' : 'login')
    : (view === 'login' || view === 'register' ? 'dashboard' : view);

  if (isLoading) {
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="Astral Family"
              className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse shadow-2xl border border-white/20"
            />
            <p className="text-white/70 text-sm font-medium">Cargando biblioteca astral...</p>
          </div>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // LOGIN VIEW
  if (effectiveView === 'login') {
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-sm backdrop-blur-xl border border-white/10 p-8 shadow-2xl" style={{ background: cBg, borderRadius: rad }}>
            <div className="text-center mb-6">
              <div className="relative inline-block mb-3 group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-60 blur-sm group-hover:opacity-100 transition-opacity" />
                <img
                  src="/logo.png"
                  alt="Astral Family"
                  className="relative w-20 h-20 rounded-full mx-auto shadow-2xl border-2 border-white/30 group-hover:scale-105 transition-transform duration-300 object-contain bg-black/40"
                />
              </div>
              <h1 className="text-2xl font-light text-white tracking-wider">Astral Family</h1>
              <p className="text-xs text-white/50 mt-1">Biblioteca astral familiar privada</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={loginE}
                onChange={e => setLoginE(e.target.value)}
                required
                className={inp}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={loginP}
                onChange={e => setLoginP(e.target.value)}
                required
                className={inp}
              />
              <button
                type="submit"
                className={`${btn} text-white font-semibold shadow-lg hover:opacity-90 transition-opacity cursor-pointer`}
                style={{ background: `linear-gradient(135deg, ${p}, ${sColor})` }}
              >
                Iniciar sesión
              </button>
            </form>
            <button
              onClick={() => setView('register')}
              className="mt-4 text-white/40 hover:text-white/80 text-xs block mx-auto cursor-pointer transition-colors"
            >
              Registrarse con código de invitación →
            </button>
          </div>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // REGISTER VIEW
  if (effectiveView === 'register') {
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-sm backdrop-blur-xl border border-white/10 p-8 shadow-2xl" style={{ background: cBg, borderRadius: rad }}>
            <div className="text-center mb-6">
              <div className="relative inline-block mb-3 group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-60 blur-sm group-hover:opacity-100 transition-opacity" />
                <img
                  src="/logo.png"
                  alt="Astral Family"
                  className="relative w-20 h-20 rounded-full mx-auto shadow-2xl border-2 border-white/30 group-hover:scale-105 transition-transform duration-300 object-contain bg-black/40"
                />
              </div>
              <h1 className="text-2xl font-light text-white tracking-wider">Crear cuenta</h1>
              <p className="text-xs text-white/50 mt-1">Requiere invitación emitida por el Administrador</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-3">
              <input
                placeholder="Nombre completo"
                value={regN}
                onChange={e => setRegN(e.target.value)}
                required
                className={inp}
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={regE}
                onChange={e => setRegE(e.target.value)}
                required
                className={inp}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={regP}
                onChange={e => setRegP(e.target.value)}
                required
                className={inp}
              />
              <input
                placeholder="Código de invitación (ej. ASTRAL-FAMILY-DEMO)"
                value={regC}
                onChange={e => setRegC(e.target.value.toUpperCase())}
                required
                className={inp}
              />
              <button
                type="submit"
                className={`${btn} text-white font-semibold shadow-lg hover:opacity-90 transition-opacity cursor-pointer`}
                style={{ background: `linear-gradient(135deg, ${p}, ${sColor})` }}
              >
                Crear cuenta
              </button>
            </form>
            <button
              onClick={() => setView('login')}
              className="mt-4 text-white/40 hover:text-white/80 text-xs block mx-auto cursor-pointer transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // CHART VIEW (Full Width Responsive Modern Layout)
  if (view === 'chart' && selProfile) {
    const sun = selProfile.planetaryPositions?.find((pp: any) => pp.body === 'Sun');
    const moon = selProfile.planetaryPositions?.find((pp: any) => pp.body === 'Moon');
    const asc = selProfile.chartPoints?.find((cp: any) => cp.point === 'Ascendant') || selProfile.houses?.find((h: any) => h.houseNumber === 1);

    const calcEl = () => {
      const c = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
      selProfile.planetaryPositions?.forEach((pp: any) => {
        const fs = ['Aries', 'Leo', 'Sagittarius'];
        const es = ['Taurus', 'Virgo', 'Capricorn'];
        const as = ['Gemini', 'Libra', 'Aquarius'];
        if (fs.includes(pp.sign)) c.Fire++;
        else if (es.includes(pp.sign)) c.Earth++;
        else if (as.includes(pp.sign)) c.Air++;
        else c.Water++;
      });
      const e = Object.entries(c) as [string, number][];
      e.sort((a, b) => b[1] - a[1]);
      return { ...c, dominant: e[0][0], least: e[3][0] };
    };

    const calcMod = () => {
      const c = { Cardinal: 0, Fixed: 0, Mutable: 0 };
      selProfile.planetaryPositions?.forEach((pp: any) => {
        const cs = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
        if (cs.includes(pp.sign)) c.Cardinal++;
        else if (['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(pp.sign)) c.Fixed++;
        else c.Mutable++;
      });
      const e = Object.entries(c) as [string, number][];
      e.sort((a, b) => b[1] - a[1]);
      return { ...c, dominant: e[0][0], least: e[2][0] };
    };

    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex flex-col">
          <header
            className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 print:hidden transition-colors"
            style={{ background: cBg }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <button
                onClick={() => { setSelProfile(null); setView('dashboard'); }}
                className="flex items-center gap-2.5 text-white/80 hover:text-white text-sm cursor-pointer transition-colors group"
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-7 h-7 rounded-full border border-white/20 group-hover:scale-110 transition-transform shadow-md"
                />
                <span className="font-medium">← Volver al Inicio</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setChartMode('wheel')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      chartMode === 'wheel' ? 'text-white shadow-sm' : 'text-white/50 hover:text-white'
                    }`}
                    style={chartMode === 'wheel' ? { background: p } : undefined}
                  >
                    🎡 Rueda Astral HD
                  </button>
                  <button
                    onClick={() => setChartMode('detailed')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      chartMode === 'detailed' ? 'text-white shadow-sm' : 'text-white/50 hover:text-white'
                    }`}
                    style={chartMode === 'detailed' ? { background: p } : undefined}
                  >
                    📜 Informe & Lectura Psicológica
                  </button>
                </div>

                <button
                  onClick={() => exportSvgToFile('astral-chart-svg', `${selProfile.name}-carta-astral`)}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 text-xs border border-white/10 cursor-pointer"
                >
                  📥 SVG
                </button>
                <button
                  onClick={() => exportPngFromFile('astral-chart-svg', `${selProfile.name}-carta-astral`)}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 text-xs border border-white/10 cursor-pointer"
                >
                  🖼️ PNG
                </button>
                <button
                  onClick={printChartReport}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 text-xs border border-white/10 cursor-pointer"
                >
                  🖨️ Imprimir
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-white/80 text-xs font-medium block">{user?.name}</span>
                  <span className="text-[10px] block" style={{ color: a }}>
                    {user?.role === 'admin' ? '👑 Admin' : '✦ Miembro'}
                  </span>
                </div>
                <button onClick={logout} className="text-white/40 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 transition-all cursor-pointer">
                  Salir
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {chartMode === 'detailed' ? (
              <DetailedReportView
                profile={selProfile}
                primaryColor={p}
                secondaryColor={sColor}
                accentColor={a}
                cardBg={cBg}
                borderRadius={rad}
              />
            ) : (
              <div className="space-y-6 animate-in fade-in">
                <div
                  className="p-6 rounded-2xl border backdrop-blur-xl text-center relative overflow-hidden shadow-2xl"
                  style={{ background: cBg, borderRadius: rad, borderColor: `${p}30` }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${p}, ${a}, transparent)` }}
                  />
                  <h1 className="text-3xl sm:text-4xl font-light text-white tracking-wider mb-2 flex items-center justify-center gap-3 flex-wrap">
                    <span>✦ {selProfile.name}</span>
                    {calculateAge(selProfile.birthDate) > 0 && (
                      <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {calculateAge(selProfile.birthDate)} años
                      </span>
                    )}
                  </h1>
                  <p className="text-white/70 text-xs sm:text-sm">
                    🎂 {formatDate(selProfile.birthDate)}
                    {calculateAge(selProfile.birthDate) > 0 ? ` (${calculateAge(selProfile.birthDate)} años)` : ''}
                    {selProfile.birthTime ? ` · ⏰ ${selProfile.birthTime}` : ''}
                    {selProfile.timeUnknown ? ' (hora desconocida)' : ''} · 📍 {selProfile.city}, {selProfile.country}
                  </p>
                  {sun && moon && asc && (
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-4 text-xs sm:text-sm">
                      <div className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-white/90">
                        <span className="text-amber-400 font-bold mr-1.5">☉ Sol</span> {sun.sign} {sun.degree ? `${Math.floor(sun.degree)}°` : ''}
                      </div>
                      <div className="px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-white/90">
                        <span className="text-sky-300 font-bold mr-1.5">☽ Luna</span> {moon.sign} {moon.degree ? `${Math.floor(moon.degree)}°` : ''}
                      </div>
                      <div className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-white/90">
                        <span className="text-purple-300 font-bold mr-1.5">AC Ascendente</span> {asc.sign} {asc.degree ? `${Math.floor(asc.degree)}°` : ''}
                      </div>
                    </div>
                  )}

                  {/* Lineage & Family Connections */}
                  {(selProfile.partner || selProfile.parent || selProfile.parent2 || (selProfile.siblings && selProfile.siblings.length > 0) || (selProfile.children && selProfile.children.length > 0)) && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs">
                      {selProfile.partner && (
                        <div className="flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/30 px-3 py-1 rounded-full text-pink-200">
                          <span className="text-pink-400">💍 Pareja:</span>
                          <button
                            onClick={() => {
                              const partnerProf = profiles.find(p => p.id === selProfile.partnerId || (selProfile.partner && p.id === selProfile.partner.id));
                              if (partnerProf) setSelProfile(partnerProf);
                            }}
                            className="font-semibold underline hover:text-white transition-colors cursor-pointer"
                          >
                            {selProfile.partner.name} →
                          </button>
                        </div>
                      )}

                      {(selProfile.parent || selProfile.parent2) && (
                        <div className="flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/30 px-3 py-1 rounded-full text-purple-200">
                          <span className="text-purple-400">👨‍👩‍👧 Padres:</span>
                          {selProfile.parent && (
                            <button
                              onClick={() => {
                                const parentProf = profiles.find(p => p.id === selProfile.parentId);
                                if (parentProf) setSelProfile(parentProf);
                              }}
                              className="font-semibold underline hover:text-white transition-colors cursor-pointer mr-1"
                            >
                              {selProfile.parent.name} →
                            </button>
                          )}
                          {selProfile.parent2 && (
                            <button
                              onClick={() => {
                                const parent2Prof = profiles.find(p => p.id === selProfile.parent2Id);
                                if (parent2Prof) setSelProfile(parent2Prof);
                              }}
                              className="font-semibold underline hover:text-white transition-colors cursor-pointer"
                            >
                              {selProfile.parent2.name} →
                            </button>
                          )}
                        </div>
                      )}

                      {selProfile.siblings && selProfile.siblings.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sky-300/80">👥 Hermanos ({selProfile.siblings.length}):</span>
                          {selProfile.siblings.map(sib => (
                            <button
                              key={sib.id}
                              onClick={() => {
                                const sibProf = profiles.find(p => p.id === sib.id);
                                if (sibProf) setSelProfile(sibProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-200 border border-sky-500/30 hover:bg-sky-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {sib.name} →
                            </button>
                          ))}
                        </div>
                      )}

                      {selProfile.inLaws && selProfile.inLaws.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-teal-300/80">🤝 Cuñados ({selProfile.inLaws.length}):</span>
                          {selProfile.inLaws.map(inLaw => (
                            <button
                              key={inLaw.id}
                              onClick={() => {
                                const inLawProf = profiles.find(p => p.id === inLaw.id);
                                if (inLawProf) setSelProfile(inLawProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-200 border border-teal-500/30 hover:bg-teal-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {inLaw.name} →
                            </button>
                          ))}
                        </div>
                      )}

                      {selProfile.unclesAunts && selProfile.unclesAunts.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-emerald-300/80">🧓 Tíos ({selProfile.unclesAunts.length}):</span>
                          {selProfile.unclesAunts.map(uncle => (
                            <button
                              key={uncle.id}
                              onClick={() => {
                                const uncleProf = profiles.find(p => p.id === uncle.id);
                                if (uncleProf) setSelProfile(uncleProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {uncle.name} →
                            </button>
                          ))}
                        </div>
                      )}

                      {selProfile.niecesNephews && selProfile.niecesNephews.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-indigo-300/80">🧸 Sobrinos ({selProfile.niecesNephews.length}):</span>
                          {selProfile.niecesNephews.map(niece => (
                            <button
                              key={niece.id}
                              onClick={() => {
                                const nieceProf = profiles.find(p => p.id === niece.id);
                                if (nieceProf) setSelProfile(nieceProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {niece.name} →
                            </button>
                          ))}
                        </div>
                      )}

                      {selProfile.cousins && selProfile.cousins.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-cyan-300/80">🫂 Primos ({selProfile.cousins.length}):</span>
                          {selProfile.cousins.map(cousin => (
                            <button
                              key={cousin.id}
                              onClick={() => {
                                const cousinProf = profiles.find(p => p.id === cousin.id);
                                if (cousinProf) setSelProfile(cousinProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {cousin.name} →
                            </button>
                          ))}
                        </div>
                      )}

                      {selProfile.grandparents && selProfile.grandparents.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-yellow-300/80">👴 Abuelos ({selProfile.grandparents.length}):</span>
                          {selProfile.grandparents.map(gp => (
                            <button
                              key={gp.id}
                              onClick={() => {
                                const gpProf = profiles.find(p => p.id === gp.id);
                                if (gpProf) setSelProfile(gpProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-200 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {gp.name} →
                            </button>
                          ))}
                        </div>
                      )}

                      {selProfile.grandchildren && selProfile.grandchildren.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-rose-300/80">🧒 Nietos ({selProfile.grandchildren.length}):</span>
                          {selProfile.grandchildren.map(gch => (
                            <button
                              key={gch.id}
                              onClick={() => {
                                const gchProf = profiles.find(p => p.id === gch.id);
                                if (gchProf) setSelProfile(gchProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {gch.name} →
                            </button>
                          ))}
                        </div>
                      )}

                      {selProfile.children && selProfile.children.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-amber-300/80">👶 Hijos ({selProfile.children.length}):</span>
                          {selProfile.children.map(child => (
                            <button
                              key={child.id}
                              onClick={() => {
                                const childProf = profiles.find(p => p.id === child.id);
                                if (childProf) setSelProfile(childProf);
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 transition-all text-[11px] font-medium cursor-pointer"
                            >
                              ✦ {child.name} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={() => setShowTransits(!showTransits)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer shadow-sm flex items-center gap-2 ${
                        showTransits
                          ? 'text-white border-white/40 shadow-lg'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                      style={
                        showTransits
                          ? { background: `linear-gradient(135deg, ${p}, ${sColor})` }
                          : undefined
                      }
                    >
                      <span>⚡ {showTransits ? 'Ocultar Tránsitos en Vivo' : 'Superponer Tránsitos Planetarios Actuales'}</span>
                      {showTransits && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTransitsInfoModal(true)}
                      title="Información detallada sobre qué son y qué significan los tránsitos"
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>ℹ️</span>
                      <span>¿Qué es esto?</span>
                    </button>

                    {(user?.role === 'admin' || isOwnProfile(selProfile)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLinkModalProfileAId(selProfile.id);
                          setShowLinkModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
                        title={`Vincular parentesco (pareja, hermano, padre, hijo) para ${selProfile.name}`}
                      >
                        <span>🔗</span>
                        <span>+ Vincular Familiar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div
                    className="lg:col-span-7 xl:col-span-7 backdrop-blur-xl border p-5 flex flex-col items-center justify-center shadow-2xl"
                    style={{ background: cBg, borderRadius: rad, borderColor: `${p}30` }}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                        <span>🎡</span>
                        <span>Rueda Natal (Sistema Placidus)</span>
                      </h3>
                      <span className="text-[11px] text-white/40">Orientada al Ascendente (180°)</span>
                    </div>

                    {selProfile.isCalculated ? (
                      <AstrologyWheel
                        id="astral-chart-svg"
                        planetaryPositions={(selProfile.planetaryPositions || []).map((pp: any) => ({
                          body: pp.body,
                          sign: pp.sign,
                          degree: pp.degree,
                          minute: pp.minute,
                          absoluteDegree: signToAbs(pp.sign, pp.degree, pp.minute),
                          retrograde: pp.retrograde,
                          house: pp.house,
                        }))}
                        houses={(selProfile.houses || []).map((h: any) => ({
                          houseNumber: h.houseNumber,
                          sign: h.sign,
                          degree: h.degree,
                          minute: h.minute,
                          absoluteDegree: signToAbs(h.sign, h.degree, h.minute),
                          planets: [],
                        }))}
                        aspects={(selProfile.aspects || []).map((as2: any) => ({
                          body1: as2.body1,
                          body2: as2.body2,
                          type: as2.type,
                          angle: as2.angle,
                          orb: as2.orb,
                          degree1: as2.degree1,
                          degree2: as2.degree2,
                        }))}
                        chartPoints={(selProfile.chartPoints || []).map((cp: any) => ({
                          point: cp.point,
                          sign: cp.sign,
                          degree: cp.degree,
                          minute: cp.minute,
                          absoluteDegree: signToAbs(cp.sign, cp.degree, cp.minute),
                          house: cp.house,
                        }))}
                        primaryColor={p}
                        accentColor={a}
                        secondaryColor={sColor}
                        transitPositions={showTransits ? transitData?.transitPositions : undefined}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-96 text-white/30 text-sm">
                        Carta no calculada
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                    {/* 🪐 Posiciones Planetarias */}
                    <div
                      className="backdrop-blur-xl border p-4 sm:p-5 shadow-xl"
                      style={{ background: cBg, borderRadius: rad, borderColor: `${p}25` }}
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                        <h3 className="text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <span>🪐</span>
                          <span>Posiciones Planetarias</span>
                        </h3>
                        <span className="text-[10px] text-white/50">Grados & Signos Exactos</span>
                      </div>

                      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                        {(selProfile.planetaryPositions || []).map((pp: any) => (
                          <div
                            key={pp.body}
                            className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5"
                          >
                            <span className="text-white font-medium flex items-center gap-2 min-w-[105px]">
                              <span className="text-sm font-bold" style={{ color: p }}>{getPlanetSymbol(pp.body)}</span>
                              <span className="text-xs font-medium">{getPlanetNameEs(pp.body)}</span>
                            </span>

                            <span className="text-white/80 flex items-center gap-1.5 font-medium text-xs">
                              <span>{getSignEmoji(pp.sign)}</span>
                              <span className="font-semibold text-white/95">{getSignNameEs(pp.sign)}</span>
                              <span className="font-mono text-white/70 text-[11px] ml-0.5">{formatDegreeMinute(pp.degree, pp.minute)}</span>
                            </span>

                            <div className="flex items-center gap-1.5 justify-end min-w-[65px]">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/70 font-semibold border border-white/10">
                                Casa {pp.house || '-'}
                              </span>
                              {pp.retrograde && (
                                <span className="text-amber-300 font-bold font-mono text-[10px] px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                                  ℞
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showTransits && transitData?.aspects && (
                      <div
                        className="backdrop-blur-xl border p-4 sm:p-5 shadow-xl animate-in fade-in"
                        style={{
                          background: `linear-gradient(135deg, ${p}20, ${cBg})`,
                          borderRadius: rad,
                          borderColor: `${p}60`,
                        }}
                      >
                        <h3 className="text-xs uppercase tracking-wider font-semibold mb-3 flex items-center justify-between" style={{ color: a }}>
                          <span>⚡ Tránsitos Activos Hoy</span>
                          <span className="text-[10px]">{transitData.aspects.length} aspectos</span>
                        </h3>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {transitData.aspects.map((ta, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-black/40 border border-white/5">
                              <span className="text-white font-medium">{getPlanetSymbol(ta.transitBody as any)} {getPlanetNameEs(ta.transitBody)} (T)</span>
                              <span className="font-mono text-[11px] font-semibold" style={{ color: p }}>{getAspectSymbol(ta.type)} {ta.type}</span>
                              <span className="text-white/90">{getPlanetSymbol(ta.natalBody as any)} {getPlanetNameEs(ta.natalBody)} (N)</span>
                              <span className="text-white/50 text-[10px]">{ta.orb}°</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ✦ Puntos Especiales y Ángulos */}
                    <div
                      className="backdrop-blur-xl border p-4 sm:p-5 shadow-xl"
                      style={{ background: cBg, borderRadius: rad, borderColor: `${sColor}25` }}
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                        <h3 className="text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <span>✦</span>
                          <span>Puntos Especiales y Ángulos</span>
                        </h3>
                        <span className="text-[10px] text-white/50">Ejes & Nodos</span>
                      </div>

                      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                        {(selProfile.chartPoints || []).map((cp: any) => (
                          <div
                            key={cp.point}
                            className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5"
                          >
                            <span className="text-white font-medium flex items-center gap-2 min-w-[115px]">
                              <span className="text-sm font-bold" style={{ color: sColor }}>{getPlanetSymbol(cp.point)}</span>
                              <span className="text-xs font-medium">{getPlanetNameEs(cp.point)}</span>
                            </span>

                            <span className="text-white/80 flex items-center gap-1.5 font-medium text-xs">
                              <span>{getSignEmoji(cp.sign)}</span>
                              <span className="font-semibold text-white/95">{getSignNameEs(cp.sign)}</span>
                              <span className="font-mono text-white/70 text-[11px] ml-0.5">{formatDegreeMinute(cp.degree, cp.minute)}</span>
                            </span>

                            <div className="flex items-center justify-end min-w-[60px]">
                              {cp.house && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/70 font-semibold border border-white/10">
                                  Casa {cp.house}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🌟 Decanato Solar & Sub-Regencia Planetaria */}
                <div className="mt-6">
                  <DecanateCard
                    profile={selProfile}
                    primaryColor={p}
                    secondaryColor={sColor}
                    accentColor={a}
                    cardBg={cBg}
                    borderRadius={rad}
                  />
                </div>

                {/* 📊 Compact Bottom Section: Aspectario & Placidus Cusps Side-by-Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 items-start">
                  {/* Compact Aspectario */}
                  <div
                    className="backdrop-blur-xl border p-4 sm:p-5 shadow-2xl rounded-2xl flex flex-col justify-start"
                    style={{ background: cBg, borderRadius: rad, borderColor: `${p}30` }}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <h3 className="text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span>📊</span>
                        <span>Matriz de Aspectos (Aspectario)</span>
                      </h3>
                      <span className="text-[10px] text-white/40">Orbes exactos</span>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <AspectarioGrid
                        aspects={selProfile.aspects || []}
                        bodies={['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ascendant','MC']}
                        primaryColor={p}
                      />
                    </div>
                  </div>

                  {/* Compact Placidus Cusps */}
                  <div
                    className="backdrop-blur-xl border p-4 sm:p-5 shadow-2xl rounded-2xl flex flex-col justify-start"
                    style={{ background: cBg, borderRadius: rad, borderColor: `${a}30` }}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <h3 className="text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span>📐</span>
                        <span>Cúspides de Casas (Placidus)</span>
                      </h3>
                      <span className="text-[10px] text-white/40">12 Casas Natales</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {(selProfile.houses || []).map((h: any) => (
                        <div
                          key={h.houseNumber}
                          className="p-2 bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors"
                        >
                          <span className="text-[9px] text-white/40 font-mono">Casa {h.houseNumber}</span>
                          <span className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                            <span>{getSignEmoji(h.sign)}</span>
                            <span>{getSignNameEs(h.sign)}</span>
                          </span>
                          <span className="text-[10px] text-white/70 font-mono mt-0.5">
                            {formatDegreeMinute(h.degree, h.minute)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="mt-8 text-center print:hidden">
                    <button
                      onClick={() => handleDeleteProfile(selProfile.id)}
                      className="text-white/30 hover:text-red-400 text-xs transition-colors cursor-pointer"
                    >
                      🗑️ Eliminar carta natal de la base de datos
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Transits Information Modal */}
          <TransitsInfoModal
            isOpen={showTransitsInfoModal}
            onClose={() => setShowTransitsInfoModal(false)}
            showTransits={showTransits}
            onToggleTransits={() => setShowTransits(prev => !prev)}
            primaryColor={p}
            secondaryColor={sColor}
            accentColor={a}
            cardBg={cBg}
            borderRadius={rad}
          />
        </div>
      </DynamicCosmicBackground>
    );
  }

  // SYNASTRY VIEW
  if (view === 'synastry') {
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex flex-col">
          <DashboardHeader
            currentView={view}
            setView={setView}
            userName={user?.name}
            userRole={user?.role}
            userAvatar={user?.avatar}
            primaryColor={p}
            secondaryColor={sColor}
            accentColor={a}
            cardBg={cBg}
            onLogout={logout}
          />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <FamilyTreePanel
              profiles={profiles}
              primaryColor={p}
              secondaryColor={sColor}
              accentColor={a}
              cardBg={cBg}
              borderRadius={rad}
              currentUserId={user?.id}
              currentUserName={user?.name}
              userRole={user?.role}
              onSelectProfile={(prof) => {
                setSelProfile(prof);
                setView('chart');
              }}
              onLinkFamily={(profId) => {
                setLinkModalProfileAId(profId);
                setShowLinkModal(true);
              }}
              onAddChild={(parentProfileId) => {
                setAddProfileParentId(parentProfileId || null);
                setAddProfilePartnerId(null);
                setAddProfileSiblingId(null);
                setView('addProfile');
              }}
              onAddPartner={(profileId) => {
                setAddProfilePartnerId(profileId || null);
                setAddProfileParentId(null);
                setAddProfileSiblingId(null);
                setView('addProfile');
              }}
              onAddSibling={(profileId) => {
                setAddProfileSiblingId(profileId || null);
                setAddProfileParentId(null);
                setAddProfilePartnerId(null);
                setView('addProfile');
              }}
            />
          </main>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // ADD PROFILE VIEW (Admin or Member for self/children/partner/sibling)
  if (view === 'addProfile') {
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex flex-col">
          <DashboardHeader
            currentView={view}
            setView={setView}
            userName={user?.name}
            userRole={user?.role}
            userAvatar={user?.avatar}
            primaryColor={p}
            secondaryColor={sColor}
            accentColor={a}
            cardBg={cBg}
            onLogout={logout}
          />
          <main className="max-w-xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-light text-white tracking-wider mb-1">✦ Registrar Integrante, Pareja, Hermano/a o Hijo/a</h1>
              <p className="text-white/40 text-xs">Calcula y guarda la carta natal de un nuevo miembro familiar</p>
            </div>
            <AddProfileForm
              primaryColor={p}
              cardBg={cBg}
              borderRadius={rad}
              existingProfiles={profiles}
              defaultParentId={addProfileParentId}
              defaultPartnerId={addProfilePartnerId}
              defaultSiblingId={addProfileSiblingId}
              userRole={user?.role}
              currentUserId={user?.id}
              currentUserName={user?.name}
              onSave={handleSaveProfile}
            />
          </main>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // CUSTOMIZE VIEW
  if (view === 'customize') {
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex flex-col">
          <DashboardHeader
            currentView={view}
            setView={setView}
            userName={user?.name}
            userRole={user?.role}
            userAvatar={user?.avatar}
            primaryColor={p}
            secondaryColor={sColor}
            accentColor={a}
            cardBg={cBg}
            onLogout={logout}
          />
          <main className="max-w-3xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-light text-white tracking-wider mb-1">🎨 Personalización Visual</h1>
              <p className="text-white/40 text-xs">Configura la estética de tu biblioteca astral con presets o paletas personalizadas</p>
            </div>
            <ThemeSelector
              currentTheme={theme}
              cardBg={cBg}
              borderRadius={rad}
              onSaveTheme={saveThemeSettings}
            />
          </main>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // INVITATIONS VIEW (Admin Only)
  if (view === 'invitations') {
    if (user?.role !== 'admin') {
      setView('dashboard');
      return null;
    }
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex flex-col">
          <DashboardHeader
            currentView={view}
            setView={setView}
            userName={user?.name}
            userRole={user?.role}
            userAvatar={user?.avatar}
            primaryColor={p}
            secondaryColor={sColor}
            accentColor={a}
            cardBg={cBg}
            onLogout={logout}
          />
          <main className="max-w-3xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-light text-white tracking-wider mb-1">🎫 Gestión de Invitaciones</h1>
              <p className="text-white/40 text-xs">Crea y distribuye códigos de acceso para nuevos miembros familiares</p>
            </div>
            <InvitationsPanel
              invitations={invs}
              primaryColor={p}
              secondaryColor={sColor}
              accentColor={a}
              cardBg={cBg}
              borderRadius={rad}
              onCreateInvitation={handleCreateInvitation}
              onCopyCode={async (code) => {
                await navigator.clipboard.writeText(code);
                notify(`Código ${code} copiado al portapapeles`, 'success');
              }}
              onRevokeInvitation={handleRevokeInvitation}
              onDeleteInvitation={handleDeleteInvitation}
            />
          </main>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // PROFILE SETTINGS VIEW (For all users, including Admin)
  if (view === 'profileSettings') {
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex flex-col">
          <DashboardHeader
            currentView={view}
            setView={setView}
            userName={user?.name}
            userRole={user?.role}
            userAvatar={user?.avatar}
            primaryColor={p}
            secondaryColor={sColor}
            accentColor={a}
            cardBg={cBg}
            onLogout={logout}
          />
          <main className="max-w-2xl mx-auto w-full px-4 py-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-light text-white tracking-wider mb-1">⚙️ Configuración de Cuenta</h1>
              <p className="text-white/40 text-xs">Actualiza tu nombre, correo o cambia tu contraseña</p>
            </div>
            <ProfileSettingsPanel
              primaryColor={p}
              secondaryColor={sColor}
              accentColor={a}
              cardBg={cBg}
              borderRadius={rad}
              profiles={profiles}
              onLinkFamily={(profId) => {
                setLinkModalProfileAId(profId || null);
                setShowLinkModal(true);
              }}
              onAddChild={(parentId) => {
                setAddProfileParentId(parentId || null);
                setAddProfilePartnerId(null);
                setAddProfileSiblingId(null);
                setView('addProfile');
              }}
              onAddPartner={(profId) => {
                setAddProfilePartnerId(profId || null);
                setAddProfileParentId(null);
                setAddProfileSiblingId(null);
                setView('addProfile');
              }}
              onAddSibling={(profId) => {
                setAddProfileSiblingId(profId || null);
                setAddProfileParentId(null);
                setAddProfilePartnerId(null);
                setView('addProfile');
              }}
              onSuccessNotification={(msg) => {
                notify(msg, 'success');
                fetchProfiles();
              }}
              onErrorNotification={(msg) => notify(msg, 'error')}
            />
          </main>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // USERS ADMIN VIEW (Admin Only)
  if (view === 'usersAdmin') {
    if (user?.role !== 'admin') {
      setView('dashboard');
      return null;
    }
    return (
      <DynamicCosmicBackground
        primaryColor={p}
        accentColor={a}
        cardOpacity={theme?.cardOpacity}
        backgroundType={bgType}
        backgroundImage={bgImage}
        gradientColors={themeGradientColors}
        backgroundColor={theme?.backgroundColor}
      >
        <div className="min-h-screen flex flex-col">
          <DashboardHeader
            currentView={view}
            setView={setView}
            userName={user?.name}
            userRole={user?.role}
            userAvatar={user?.avatar}
            primaryColor={p}
            secondaryColor={sColor}
            accentColor={a}
            cardBg={cBg}
            onLogout={logout}
          />
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <UsersAdminPanel
              primaryColor={p}
              secondaryColor={sColor}
              accentColor={a}
              cardBg={cBg}
              borderRadius={rad}
              onSuccessNotification={(msg) => {
                notify(msg, 'success');
                fetchProfiles();
              }}
              onErrorNotification={(msg) => notify(msg, 'error')}
            />
          </main>
        </div>
      </DynamicCosmicBackground>
    );
  }

  // DASHBOARD VIEW (Sorted chronologically by birth year / birth date from oldest to youngest)
  const sortedProfiles = [...profiles].sort((a, b) => {
    const dateA = a.birthDate ? new Date(a.birthDate).getTime() : 0;
    const dateB = b.birthDate ? new Date(b.birthDate).getTime() : 0;
    return dateA - dateB;
  });
  const filtered = sortedProfiles.filter(pr => {
    const matchesSearch = pr.name.toLowerCase().includes(searchQ.toLowerCase());
    if (!matchesSearch) return false;
    if (!selectedZodiacSign) return true;
    const sun = pr.planetaryPositions?.find(pp => pp.body === 'Sun');
    if (!sun?.sign) return false;
    const signLower = sun.sign.toLowerCase();
    const filterLower = selectedZodiacSign.toLowerCase();
    return signLower.startsWith(filterLower.slice(0, 3)) || filterLower.startsWith(signLower.slice(0, 3));
  });

  return (
    <DynamicCosmicBackground
      primaryColor={p}
      accentColor={a}
      cardOpacity={theme?.cardOpacity}
      backgroundType={bgType}
      backgroundImage={bgImage}
      gradientColors={themeGradientColors}
      backgroundColor={theme?.backgroundColor}
    >
      <div className="min-h-screen flex flex-col">
        <DashboardHeader
          currentView={view}
          setView={setView}
          userName={user?.name}
          userRole={user?.role}
          userAvatar={user?.avatar}
          primaryColor={p}
          secondaryColor={sColor}
          accentColor={a}
          cardBg={cBg}
          onLogout={logout}
        />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-white text-lg font-light tracking-wide flex items-center gap-2">
                <span>✦ Cartas Astrales Familiares</span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-white/10" style={{ background: `${p}20`, color: p }}>
                  {profiles.length} registradas
                </span>
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                Selecciona cualquier miembro de la familia para explorar su carta natal completa
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="🔍 Buscar por nombre..."
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 text-xs focus:outline-none focus:border-purple-400 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Mediana Barra Transparente de Contador de Signos Zodíacales */}
          {profiles.length > 0 && (
            <ZodiacSignCounterBar
              profiles={profiles}
              selectedSign={selectedZodiacSign}
              onSelectSign={setSelectedZodiacSign}
              primaryColor={p}
              secondaryColor={sColor}
              accentColor={a}
            />
          )}

          {!profiles.length ? (
            <div className="text-center py-20 backdrop-blur-xl border border-white/5 rounded-2xl p-8" style={{ background: cBg }}>
              <div className="text-5xl mb-4 opacity-30">🌌</div>
              <p className="text-white/60 text-sm mb-2">No hay cartas astrales registradas aún</p>
              <button
                onClick={() => {
                  setAddProfileParentId(null);
                  setAddProfilePartnerId(null);
                  setAddProfileSiblingId(null);
                  setView('addProfile');
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg hover:opacity-90 transition-opacity cursor-pointer text-white mt-2"
                style={{ background: `linear-gradient(135deg, ${p}, ${sColor})` }}
              >
                + Registrar persona
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(profile => {
                const canAdd = user?.role === 'admin' || isOwnProfile(profile);

                return (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    primaryColor={p}
                    secondaryColor={sColor}
                    accentColor={a}
                    cardBg={cBg}
                    borderRadius={rad}
                    onSelect={(pr) => {
                      setSelProfile(pr);
                      setView('chart');
                    }}
                    onLinkFamily={canAdd ? (prof) => {
                      setLinkModalProfileAId(prof.id);
                      setShowLinkModal(true);
                    } : undefined}
                  />
                );
              })}
            </div>
          )}
        </main>

        {/* Floating Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
          {notifs.map(n => (
            <div
              key={n.id}
              className={`px-4 py-2.5 rounded-lg text-xs backdrop-blur-xl border shadow-lg transition-all ${
                n.type === 'error'
                  ? 'bg-rose-950/80 text-rose-200 border-rose-500/30'
                  : n.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/30'
                  : 'bg-gray-900/90 text-white/90 border-white/10'
              }`}
            >
              ✦ {n.msg}
            </div>
          ))}
        </div>

        {/* Family Link Modal */}
        <LinkFamilyModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          profiles={profiles}
          initialProfileAId={linkModalProfileAId}
          userRole={user?.role}
          currentUserId={user?.id}
          currentUserName={user?.name}
          token={token}
          primaryColor={p}
          secondaryColor={sColor}
          accentColor={a}
          cardBg={cBg}
          borderRadius={rad}
          onSuccess={(msg) => {
            notify(msg, 'success');
            fetchProfiles();
          }}
          onError={(msg) => notify(msg, 'error')}
          onRegisterNew={(memberId, relType) => {
            if (relType === 'partner') setAddProfilePartnerId(memberId || null);
            else if (relType === 'sibling') setAddProfileSiblingId(memberId || null);
            else if (relType === 'parent' || relType === 'child') setAddProfileParentId(memberId || null);
            setView('addProfile');
          }}
        />

        {/* Transits Information Modal */}
        <TransitsInfoModal
          isOpen={showTransitsInfoModal}
          onClose={() => setShowTransitsInfoModal(false)}
          showTransits={showTransits}
          onToggleTransits={() => setShowTransits(prev => !prev)}
          primaryColor={p}
          secondaryColor={sColor}
          accentColor={a}
          cardBg={cBg}
          borderRadius={rad}
        />
      </div>
    </DynamicCosmicBackground>
  );
}
