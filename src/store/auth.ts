import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface ThemeSettings {
  id: string;
  userId: string;
  themeType: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundType: string;
  backgroundColor: string | null;
  gradientColors: string;
  cardOpacity: number;
  borderRadius: number;
  shadowIntensity: number;
  textSize: string;
  infoDensity: string;
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
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  theme: null,
  isAuthenticated: false,
  isLoading: true,

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('astral_token', data.token);
      }
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('astral_token', data.token);
      }
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
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
    set({ user: null, token: null, theme: null, isAuthenticated: false, isLoading: false });
  },

  setTheme: (theme) => set({ theme }),

  initialize: async () => {
    try {
      if (typeof window === 'undefined') {
        set({ isLoading: false });
        return;
      }
      const token = localStorage.getItem('astral_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem('astral_token');
        set({ isLoading: false });
        return;
      }
      const data = await res.json();
      set({
        user: data.user,
        token,
        theme: data.user.themeSettings || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));

export type { User, ThemeSettings };
