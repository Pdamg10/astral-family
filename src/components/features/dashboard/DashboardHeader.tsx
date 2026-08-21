'use client';
import React from 'react';

export type ViewType =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'chart'
  | 'addProfile'
  | 'customize'
  | 'invitations'
  | 'synastry'
  | 'profileSettings'
  | 'usersAdmin';

export interface HeaderProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string | null;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  cardBg?: string;
  onLogout: () => void;
}

export default function DashboardHeader({
  currentView,
  setView,
  userName,
  userRole,
  userAvatar,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  accentColor = '#f59e0b',
  cardBg,
  onLogout,
}: HeaderProps) {
  const isAdmin = userRole === 'admin';

  const navItems: { label: string; icon: string; view: ViewType }[] = [
    { label: 'Inicio', icon: '✦', view: 'dashboard' },
    { label: 'Árbol Familiar', icon: '🌳', view: 'synastry' },
    { label: 'Registrar', icon: '+', view: 'addProfile' as ViewType },
    ...(isAdmin ? [{ label: 'Usuarios', icon: '👥', view: 'usersAdmin' as ViewType }] : []),
    { label: 'Personalizar', icon: '🎨', view: 'customize' },
    ...(isAdmin ? [{ label: 'Invitaciones', icon: '🎫', view: 'invitations' as ViewType }] : []),
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 print:hidden transition-colors"
      style={{ background: cardBg || 'rgba(15,10,26,0.85)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2.5 text-left cursor-pointer bg-transparent border-0 group"
        >
          <img
            src="/logo.png"
            alt="Astral Family Logo"
            className="w-8 h-8 rounded-full shadow-md object-contain border border-white/20 group-hover:scale-105 transition-transform"
          />
          <span className="text-white/95 text-sm font-medium tracking-wider group-hover:text-white hidden sm:inline-block">
            Astral Family
          </span>
        </button>

        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}15)`,
                        borderColor: `${primaryColor}70`,
                      }
                    : undefined
                }
              >
                <span className="mr-1">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setView('profileSettings')}
            title="Editar mis datos de cuenta"
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1 rounded-lg border transition-all cursor-pointer text-left ${
              currentView === 'profileSettings'
                ? 'border-purple-400/80 bg-purple-500/20 text-white shadow-sm'
                : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border overflow-hidden"
              style={{
                background: isAdmin ? `${accentColor}30` : `${primaryColor}30`,
                borderColor: isAdmin ? `${accentColor}60` : `${primaryColor}60`,
              }}
            >
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{isAdmin ? '👑' : '👤'}</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-white/90 text-xs font-medium block leading-tight">{userName || 'Mi Perfil'}</span>
              <span className="text-[10px] block leading-none" style={{ color: accentColor }}>
                {isAdmin ? 'Admin' : 'Miembro'}
              </span>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="text-white/40 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
