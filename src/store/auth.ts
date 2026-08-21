import { create } from 'zustand';

interface User {
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
}

interface ThemeSettings {
  id?: string;
  userId?: string;
  themeType?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundType?: string;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  gradientColors?: any;
  cardOpacity?: number;
  borderRadius?: number;
  shadowIntensity?: number;
  textSize?: string;
  infoDensity?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  theme: ThemeSettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, code: string) => Promise<boolean>;
  logout: () => void;
  setTheme: (theme: ThemeSettings) => void;
  updateUser: (userData: Partial<User>) => void;
  initialize: () => Promise<void>;
  fetchTheme: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  theme: null,
  isAuthenticated: false,
  isLoading: true,

  updateUser: (userData: Partial<User>) => {
    const u = get().user;
    if (u) {
      set({ user: { ...u, ...userData } });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return false;
      }

      const userTheme = data.theme || data.user?.themeSettings || null;

      if (typeof window !== 'undefined') {
        localStorage.setItem('astral_token', data.token);
        if (userTheme) {
          localStorage.setItem('astral_theme', JSON.stringify(userTheme));
        }
      }

      set({
        user: data.user,
        token: data.token,
        theme: userTheme,
        isAuthenticated: true,
        isLoading: false,
      });

      // Also explicitly fetch theme from DB to guarantee freshest settings
      get().fetchTheme();

      return true;
    } catch {
      alert('Error de conexión');
      return false;
    }
  },

  register: async (name, email, password, code) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, invitationCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return false;
      }

      const userTheme = data.theme || data.user?.themeSettings || null;

      if (typeof window !== 'undefined') {
        localStorage.setItem('astral_token', data.token);
        if (userTheme) {
          localStorage.setItem('astral_theme', JSON.stringify(userTheme));
        }
      }

      set({
        user: data.user,
        token: data.token,
        theme: userTheme,
        isAuthenticated: true,
        isLoading: false,
      });

      get().fetchTheme();

      return true;
    } catch {
      alert('Error de conexión');
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('astral_token');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined' && theme) {
      localStorage.setItem('astral_theme', JSON.stringify(theme));
    }
    set({ theme });
  },

  fetchTheme: async () => {
    const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('astral_token') : null);
    if (!token) return;
    try {
      const res = await fetch('/api/themes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.theme) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('astral_theme', JSON.stringify(data.theme));
          }
          set({ theme: data.theme });
        }
      }
    } catch {
      // Ignore network errors on background fetch
    }
  },

  initialize: async () => {
    try {
      if (typeof window === 'undefined') {
        set({ isLoading: false });
        return;
      }

      // Pre-load theme from local storage if present to avoid theme flicker
      const cachedTheme = localStorage.getItem('astral_theme');
      let parsedCachedTheme = null;
      if (cachedTheme) {
        try {
          parsedCachedTheme = JSON.parse(cachedTheme);
        } catch {}
      }

      const token = localStorage.getItem('astral_token');
      if (!token) {
        set({ theme: parsedCachedTheme, isLoading: false });
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem('astral_token');
        set({ theme: parsedCachedTheme, isLoading: false });
        return;
      }

      const data = await res.json();
      const userTheme = data.user?.themeSettings || parsedCachedTheme || null;

      if (userTheme) {
        localStorage.setItem('astral_theme', JSON.stringify(userTheme));
      }

      set({
        user: data.user,
        token,
        theme: userTheme,
        isAuthenticated: true,
        isLoading: false,
      });

      // Background fetch to ensure fresh theme from /api/themes
      get().fetchTheme();
    } catch {
      set({ isLoading: false });
    }
  },
}));

export type { User, ThemeSettings };
