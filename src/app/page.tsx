'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import AstrologyWheel from '@/components/features/charts/AstrologyWheel';
import AspectarioGrid from '@/components/features/charts/AspectarioGrid';
import { getPlanetSymbol, getAspectSymbol, getSignEmoji } from '@/services/astrology/utils';
import { searchCities } from '@/lib/cities';
import type { CityData } from '@/lib/cities';
import type { BirthProfile } from '@/types/prisma-types';
import { io, Socket } from 'socket.io-client';

const THEME_PRESETS: Record<string, {themeType:string;primaryColor:string;secondaryColor:string;accentColor:string;gradientColors:string[]}> = {
  midnight:   { themeType:'midnight', primaryColor:'#c084fc', secondaryColor:'#f472b6', accentColor:'#fbbf24', gradientColors:['#0f0a1a','#1a0a2e','#0f0a1a'] },
  cosmic:    { themeType:'cosmic', primaryColor:'#818cf8', secondaryColor:'#a78bfa', accentColor:'#22d3ee', gradientColors:['#0c0a20','#1e1b4b','#0c1445'] },
  inferno:   { themeType:'inferno', primaryColor:'#f87171', secondaryColor:'#fb923c', accentColor:'#fbbf24', gradientColors:['#1a0a0a','#2d0a0a','#1a0505'] },
  crimson:   { themeType:'crimson', primaryColor:'#fb7185', secondaryColor:'#f43f5e', accentColor:'#fda4af', gradientColors:['#1a0510','#2d0a1a','#1a0510'] },
  mystic:    { themeType:'mystic', primaryColor:'#a78bfa', secondaryColor:'#e879f9', accentColor:'#5eead4', gradientColors:['#0a0a1a','#1a0a2e','#0a1a2e'] },
  aurora:    { themeType:'aurora', primaryColor:'#34d399', secondaryColor:'#6ee7b7', accentColor:'#c4b5fd', gradientColors:['#0a1a0a','#0a2e1a','#0a1a2e'] },
  ocean:     { themeType:'ocean', primaryColor:'#38bdf8', secondaryColor:'#22d3ee', accentColor:'#67e8f9', gradientColors:['#0a0f1a','#0a1a2e','#0a1525'] },
  celestial: { themeType:'celestial', primaryColor:'#fbbf24', secondaryColor:'#fcd34d', accentColor:'#fef08a', gradientColors:['#1a150a','#2e2510','#1a150a'] },
  rose:      { themeType:'rose', primaryColor:'#fda4af', secondaryColor:'#f9a8d4', accentColor:'#fecdd3', gradientColors:['#1a0a10','#2d0a15','#1a0a10'] },
  emerald:   { themeType:'emerald', primaryColor:'#6ee7b7', secondaryColor:'#86efac', accentColor:'#a7f3d0', gradientColors:['#0a1a10','#0a2d15','#0a1a10'] },
  amethyst:  { themeType:'amethyst', primaryColor:'#d8b4fe', secondaryColor:'#c4b5fd', accentColor:'#e9d5ff', gradientColors:['#120a1a','#1a0a2d','#120a1a'] },
  sunset:    { themeType:'sunset', primaryColor:'#fdba74', secondaryColor:'#fb923c', accentColor:'#fed7aa', gradientColors:['#1a100a','#2d1a0a','#1a100a'] },
};

const PRESET_LABELS: Record<string, string> = {
  midnight:'🌙 Midnight', cosmic:'🌌 Cosmic', inferno:'🔥 Inferno', crimson:'🌹 Crimson',
  mystic:'🔮 Mystic', aurora:'🌸 Aurora', ocean:'🌊 Ocean', celestial:'☀ Celestial',
  rose:'🌷 Rose', emerald:'💎 Emerald', amethyst:'💜 Amethyst', sunset:'🌅 Sunset',
};

type View = 'login'|'register'|'dashboard'|'chart'|'addProfile'|'customize'|'invitations';

function formatDate(ds: string): string {
  const [y, m, d] = ds.split('-');
  const ms = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} de ${ms[parseInt(m)-1]} de ${y}`;
}
function signToAbs(sign: string, deg: number): number {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const i = signs.indexOf(sign); return i >= 0 ? i*30+deg : deg;
}
function ptLabel(p: string): string {
  const m: Record<string,string> = { Ascendant:'Ascendente', MC:'Medio Cielo', DESC:'Descendente', IC:'Fondo del Cielo',
    NorthNode:'Nodo Norte', SouthNode:'Nodo Sur', Chiron:'Quiron', Lilith:'Lilith', PartOfFortune:'Parte de la Fortuna' };
  return m[p] || p;
}

export default function HomePage() {
  const { user, token, theme, isAuthenticated, isLoading, login, register, logout, setTheme, initialize } = useAuthStore();
  const [view, setView] = useState<View>('login');
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [selProfile, setSelProfile] = useState<BirthProfile|null>(null);
  const socketRef = useRef<Socket|null>(null);
  const [notifs, setNotifs] = useState<{id:string;msg:string}[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [loginE, setLoginE] = useState(''); const [loginP, setLoginP] = useState('');
  const [regN, setRegN] = useState(''); const [regE, setRegE] = useState(''); const [regP, setRegP] = useState(''); const [regC, setRegC] = useState('');
  const [bpN, setBpN] = useState(''); const [bpD, setBpD] = useState(''); const [bpT, setBpT] = useState('');
  const [bpTU, setBpTU] = useState(false); const [bpCS, setBpCS] = useState(''); const [bpC, setBpC] = useState<CityData|null>(null);
  const [bpSave, setBpSave] = useState(false);
  const [custTheme, setCustTheme] = useState(THEME_PRESETS.midnight);
  const [activeP, setActiveP] = useState('midnight');
  const [invs, setInvs] = useState<any[]>([]);
  const cityRes = searchCities(bpCS);

  useEffect(() => { initialize(); }, []);
  useEffect(() => { if (isAuthenticated && view === 'login') setView('dashboard'); if (!isAuthenticated && view !== 'login') setView('login'); }, [isAuthenticated]);

  const fetchP = useCallback(async () => {
    if (!token) return;
    try { const r = await fetch('/api/profiles', { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); if (r.ok) setProfiles(d.profiles); } catch {}
  }, [token]);
  useEffect(() => { if (isAuthenticated) fetchP(); }, [isAuthenticated, fetchP]);

  const fetchInv = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    const r = await fetch('/api/invitations', { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); if (r.ok) setInvs(d.invitations);
  }, [token, user]);
  useEffect(() => { if (isAuthenticated && user?.role==='admin') { fetchInv(); } }, [isAuthenticated, user, fetchInv]);

  const saveTh = async (t: typeof custTheme) => {
    if (!token) return;
    const r = await fetch('/api/themes', { method:'PUT', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify({themeType:t.themeType,primaryColor:t.primaryColor,secondaryColor:t.secondaryColor,accentColor:t.accentColor,gradientColors:t.gradientColors})});
    const d = await r.json(); if (r.ok) { setTheme(d.theme as any); setCustTheme(t); }
  };
  const notify = (msg: string) => { const id = Math.random().toString(36).substr(2,9); setNotifs(p=>[...p,{id,msg}]); setTimeout(()=>setNotifs(p=>p.filter(n=>n.id!==id)),4000); };

  useEffect(() => {
    if (!isAuthenticated) return;
    const s = io('/?XTransformPort=3003',{transports:['websocket','polling'],forceNew:true});
    s.on('profile-updated', () => { fetchP(); });
    socketRef.current = s;
    return () => { s.disconnect(); };
  }, [isAuthenticated, fetchP]);

  const hLogin = async (e: React.FormEvent) => { e.preventDefault(); await login(loginE, loginP); };
  const hReg = async (e: React.FormEvent) => { e.preventDefault(); const ok = await register(regN, regE, regP, regC); if (ok) { setRegN('');setRegE('');setRegP('');setRegC(''); } };
  const hSaveP = async (e: React.FormEvent) => {
    e.preventDefault(); if (!bpC) { alert('Selecciona una ciudad'); return; } setBpSave(true);
    try {
      const r = await fetch('/api/profiles',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify({name:bpN,birthDate:bpD,birthTime:bpTU?null:bpT,timeUnknown:bpTU,city:bpC.city,country:bpC.country,latitude:bpC.lat,longitude:bpC.lng,timezone:bpC.tz})});
      const d = await r.json(); if (r.ok) { socketRef.current?.emit('profile-created',{name:bpN}); notify(`${bpN} registrado`); setBpN('');setBpD('');setBpT('');setBpCS('');setBpC(null);setBpTU(false); fetchP(); setView('dashboard'); } else alert(d.error);
    } catch { alert('Error de conexion'); } setBpSave(false);
  };
  const hCreateInv = async () => {
    if (!token) return;
    const r = await fetch('/api/invitations',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({maxUses:1})});
    const d = await r.json(); if (r.ok) { setInvs(p=>[d.invitation,...p]); notify('Invitacion generada'); } else alert(d.error);
  };
  const hDelP = async (id: string) => {
    if (!token || !confirm('Eliminar este perfil?')) return;
    const r = await fetch(`/api/profiles?id=${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
    if (r.ok) { fetchP(); notify('Perfil eliminado'); if (selProfile?.id===id) { setSelProfile(null); setView('dashboard'); } }
  };
  const hSeed = async () => { await fetch('/api/seed',{method:'POST'}); fetchP(); notify('Datos demo cargados'); };

  const p = theme?.primaryColor || '#a855f7';
  const a = theme?.accentColor || '#f59e0b';
  const grad = theme ? (() => { try { const c = JSON.parse(theme.gradientColors||'[]'); return c.length>=2 ? `linear-gradient(135deg,${c.join(',')})` : 'linear-gradient(135deg,#0f0a1a,#1a0a2e)'; } catch { return 'linear-gradient(135deg,#0f0a1a,#1a0a2e)'; }})() : 'linear-gradient(135deg,#0f0a1a,#1a0a2e)';
  const cBg = `rgba(15,10,26,${theme?.cardOpacity||0.85})`;
  const rad = `${theme?.borderRadius||12}px`;
  const inp = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50';
  const btn = 'w-full py-3 rounded-lg text-sm font-medium transition-all hover:opacity-90';

  if (isLoading) return (<div className='min-h-screen flex items-center justify-center' style={{background:grad}}><div className='text-center'><div className='text-4xl mb-4 animate-pulse'>✦</div><p className='text-white/60 text-sm'>Cargando...</p></div></div>);

  const gSum = (pr: BirthProfile) => ({
    sun: pr.planetaryPositions?.find((pp:any)=>pp.body==='Sun'),
    moon: pr.planetaryPositions?.find((pp:any)=>pp.body==='Moon'),
    asc: pr.chartPoints?.find((cp:any)=>cp.point==='Ascendant'),
  });

  // LOGIN
  if (view==='login') return (
    <div className='min-h-screen flex items-center justify-center p-4' style={{background:grad}}>
      <div className='w-full max-w-sm backdrop-blur-xl border border-white/10 p-8' style={{background:cBg,borderRadius:rad}}>
        <div className='text-center mb-8'><div className='text-3xl mb-2'>✦</div><h1 className='text-2xl font-light text-white tracking-wider'>Astral Family</h1><p className='text-white/40 text-xs mt-1'>Biblioteca astral privada</p></div>
        <form onSubmit={hLogin} className='space-y-4'>
          <input type='email' placeholder='Correo electronico' value={loginE} onChange={e=>setLoginE(e.target.value)} className={inp} />
          <input type='password' placeholder='Contrasena' value={loginP} onChange={e=>setLoginP(e.target.value)} className={inp} />
          <button type='submit' className={btn} style={{background:p,color:'#fff'}}>Iniciar sesion</button>
        </form>
        <div className='mt-6 text-center'><button onClick={()=>setView('register')} className='text-white/40 hover:text-white/70 text-xs'>No tienes cuenta? Registrate con invitacion</button></div>
        <div className='mt-4 pt-4 border-t border-white/5 text-center'><button onClick={hSeed} className='text-white/20 hover:text-white/40 text-[10px]'>Cargar datos de demostracion</button></div>
      </div>
    </div>);

  // REGISTER
  if (view==='register') return (
    <div className='min-h-screen flex items-center justify-center p-4' style={{background:grad}}>
      <div className='w-full max-w-sm backdrop-blur-xl border border-white/10 p-8' style={{background:cBg,borderRadius:rad}}>
        <div className='text-center mb-6'><div className='text-3xl mb-2'>✦</div><h1 className='text-xl font-light text-white tracking-wider'>Crear cuenta</h1></div>
        <form onSubmit={hReg} className='space-y-3'>
          <input placeholder='Nombre' value={regN} onChange={e=>setRegN(e.target.value)} className={inp} />
          <input type='email' placeholder='Correo electronico' value={regE} onChange={e=>setRegE(e.target.value)} className={inp} />
          <input type='password' placeholder='Contrasena' value={regP} onChange={e=>setRegP(e.target.value)} className={inp} />
          <input placeholder='Codigo de invitacion' value={regC} onChange={e=>setRegC(e.target.value.toUpperCase())} className={inp+' uppercase'} />
          <button type='submit' className={btn} style={{background:p,color:'#fff'}}>Crear cuenta</button>
        </form>
        <button onClick={()=>setView('login')} className='mt-4 text-white/40 hover:text-white/70 text-xs block mx-auto'>Volver</button>
      </div>
    </div>);

  // CHART
  if (view==='chart' && selProfile) {
    const s = gSum(selProfile);
    const calcEl = () => { const c={Fire:0,Earth:0,Air:0,Water:0}; const fs=['Aries','Leo','Sagittarius'];
      selProfile.planetaryPositions?.forEach((pp:any)=>{if(fs.includes(pp.sign))c.Fire++;else if(['Taurus','Virgo','Capricorn'].includes(pp.sign))c.Earth++;else if(['Gemini','Libra','Aquarius'].includes(pp.sign))c.Air++;else c.Water++;});
      const e=Object.entries(c) as [string,number][];e.sort((a,b)=>b[1]-a[1]);return{...c,dominant:e[0][0],least:e[3][0]};};
    const calcMod = () => { const c={Cardinal:0,Fixed:0,Mutable:0}; const cs=['Aries','Cancer','Libra','Capricorn'];
      selProfile.planetaryPositions?.forEach((pp:any)=>{if(cs.includes(pp.sign))c.Cardinal++;else if(['Taurus','Leo','Scorpio','Aquarius'].includes(pp.sign))c.Fixed++;else c.Mutable++;});
      const e=Object.entries(c) as [string,number][];e.sort((a,b)=>b[1]-a[1]);return{...c,dominant:e[0][0],least:e[2][0]};};
    const el=selProfile.isCalculated?calcEl():null, mo=selProfile.isCalculated?calcMod():null;
    return (
      <div className='min-h-screen' style={{background:grad}}>
        <header className='sticky top-0 z-50 backdrop-blur-xl border-b border-white/5' style={{background:'rgba(15,10,26,0.8)'}}><div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
          <button onClick={()=>{setSelProfile(null);setView('dashboard');}} className='text-white/60 hover:text-white text-sm'>← Volver</button>
          <span className='text-white/30 text-xs'>✦ Astral Family</span>
          <div className='flex items-center gap-2'><span className='text-white/50 text-xs'>{user?.name}</span><button onClick={logout} className='text-white/30 hover:text-white/60 text-xs'>Salir</button></div></div></header>
        <main className='max-w-6xl mx-auto px-4 py-6'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-light text-white tracking-wider mb-1'>✦ {selProfile.name}</h1>
            <p className='text-white/40 text-sm'>{formatDate(selProfile.birthDate)}{selProfile.birthTime?` · ${selProfile.birthTime}`:''}{selProfile.timeUnknown?' (hora desconocida)':''}</p>
            {s.sun&&s.moon&&s.asc&&(<div className='flex items-center justify-center gap-6 mt-3 text-sm'>
              <span className='text-white/70'><span style={{color:p}}>☀</span> {s.sun.sign} {s.sun.degree}°</span>
              <span className='text-white/70'><span style={{color:p}}>☽</span> {s.moon.sign} {s.moon.degree}°</span>
              <span className='text-white/70'><span style={{color:p}}>↑</span> {s.asc.sign} {s.asc.degree}°</span></div>)}
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='backdrop-blur-xl border border-white/10 p-4' style={{background:cBg,borderRadius:rad}}>
              {selProfile.isCalculated?(
                <AstrologyWheel planetaryPositions={(selProfile.planetaryPositions||[]).map((pp:any)=>({body:pp.body,sign:pp.sign,degree:pp.degree,minute:pp.minute,absoluteDegree:signToAbs(pp.sign,pp.degree),retrograde:pp.retrograde,house:pp.house}))}
                  houses={(selProfile.houses||[]).map((h:any)=>({houseNumber:h.houseNumber,sign:h.sign,degree:h.degree,minute:h.minute,absoluteDegree:signToAbs(h.sign,h.degree),planets:[]}))}
                  aspects={(selProfile.aspects||[]).map((as2:any)=>({body1:as2.body1,body2:as2.body2,type:as2.type,angle:as2.angle,orb:as2.orb,degree1:as2.degree1,degree2:as2.degree2}))}
                  chartPoints={(selProfile.chartPoints||[]).map((cp:any)=>({point:cp.point,sign:cp.sign,degree:cp.degree,minute:cp.minute,absoluteDegree:signToAbs(cp.sign,cp.degree),house:cp.house}))}
                  primaryColor={p} accentColor={a} />
              ):<div className='flex items-center justify-center h-96 text-white/30 text-sm'>Carta no calculada</div>}
            </div>
            <div className='space-y-4'>
              <div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
                <h3 className='text-white/60 text-xs uppercase tracking-wider mb-3'>Posiciones planetarias</h3>
                <div className='space-y-1.5'>{(selProfile.planetaryPositions||[]).map((pp:any)=>(
                  <div key={pp.body} className='flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0'>
                    <span className='text-white/80 w-20'>{getPlanetSymbol(pp.body)} {pp.body}</span>
                    <span className='text-white/50'>{pp.sign} {pp.degree}°</span>
                    <span className='text-white/30 w-8 text-right'>C{pp.house||'-'}</span>
                    {pp.retrograde&&<span className='text-amber-400 text-[10px]'>R</span>}</div>))}</div></div>
              <div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
                <h3 className='text-white/60 text-xs uppercase tracking-wider mb-3'>Puntos especiales</h3>
                <div className='space-y-1.5'>{(selProfile.chartPoints||[]).map((cp:any)=>(
                  <div key={cp.point} className='flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0'>
                    <span className='text-white/80'>{getPlanetSymbol(cp.point)} {ptLabel(cp.point)}</span>
                    <span className='text-white/50'>{cp.sign} {cp.degree}°</span>
                    {cp.house&&<span className='text-white/30 w-8 text-right'>C{cp.house}</span>}</div>))}</div></div>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
            <div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
              <h3 className='text-white/60 text-xs uppercase tracking-wider mb-3'>Casas astrologicas</h3>
              <div className='grid grid-cols-2 gap-2'>{(selProfile.houses||[]).map((h:any)=>(
                <div key={h.houseNumber} className='border border-white/5 p-2 text-xs'><div className='text-white/40'>Casa {h.houseNumber}</div><div className='text-white/80'>{getSignEmoji(h.sign)} {h.sign}</div></div>))}</div></div>
            <div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
              <h3 className='text-white/60 text-xs uppercase tracking-wider mb-3'>Aspectos</h3>
              <div className='space-y-1.5 max-h-72 overflow-y-auto'>{(selProfile.aspects||[]).map((as2:any,i:number)=>(
                <div key={i} className='flex items-center gap-3 text-xs py-1 border-b border-white/5 last:border-0'>
                  <span className='text-white/70'>{getPlanetSymbol(as2.body1)} {as2.body1}</span>
                  <span style={{color:as2.type==='square'||as2.type==='opposition'?'#ef4444':as2.type==='trine'||as2.type==='sextile'?'#22c55e':p}}>{getAspectSymbol(as2.type as any)}</span>
                  <span className='text-white/70'>{getPlanetSymbol(as2.body2)} {as2.body2}</span>
                  <span className='text-white/30 ml-auto'>{as2.orb}°</span></div>))}
                {!(selProfile.aspects||[]).length&&<p className='text-white/30 text-xs'>Sin aspectos</p>}</div></div>

            <div className='backdrop-blur-xl border border-white/10 p-5 md:col-span-2' style={{background:cBg,borderRadius:rad}}>
              <h3 className='text-white/60 text-xs uppercase tracking-wider mb-3'>Aspectario</h3>
              <div className='overflow-x-auto'>
              <AspectarioGrid aspects={(selProfile.aspects||[])} bodies={['Sol','Luna','Mercurio','Venus','Marte','Jupiter','Saturno','Urano','Neptuno','Pluton','Asc','MC']} primaryColor={p} />
              </div></div>
            {el&&(<div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
              <h3 className='text-white/60 text-xs uppercase tracking-wider mb-3'>Elementos</h3>
              <div className='space-y-2'>{([['🔥','Fuego',el.Fire],['🌍','Tierra',el.Earth],['🌬','Aire',el.Air],['💧','Agua',el.Water]] as const).map(([em,lb,cn])=>(
                <div key={lb} className='flex items-center gap-3 text-xs'><span className='w-6'>{em}</span><span className='text-white/60 w-14'>{lb}</span>
                  <div className='flex-1 h-2 bg-white/5 rounded-full overflow-hidden'><div className='h-full rounded-full' style={{width:`${(cn/10)*100}%`,background:p,opacity:lb===el.dominant?1:0.4}}/></div>
                  <span className='text-white/40 w-4 text-right'>{cn}</span></div>))}
                <p className='text-white/30 text-[10px] mt-1'>Dominante: {el.dominant} · Menos: {el.least}</p></div></div>)}
            {mo&&(<div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
              <h3 className='text-white/60 text-xs uppercase tracking-wider mb-3'>Modalidades</h3>
              <div className='space-y-2'>{([['◆','Cardinal',mo.Cardinal],['■','Fijo',mo.Fixed],['▲','Mutable',mo.Mutable]] as const).map(([ic,lb,cn])=>(
                <div key={lb} className='flex items-center gap-3 text-xs'><span className='w-6'>{ic}</span><span className='text-white/60 w-16'>{lb}</span>
                  <div className='flex-1 h-2 bg-white/5 rounded-full overflow-hidden'><div className='h-full rounded-full' style={{width:`${(cn/10)*100}%`,background:a,opacity:lb===mo.dominant?1:0.4}}/></div>
                  <span className='text-white/40 w-4 text-right'>{cn}</span></div>))}
                <p className='text-white/30 text-[10px] mt-1'>Dominante: {mo.dominant} · Menos: {mo.least}</p></div></div>)}
          </div>
          <div className='mt-6 text-center'><button onClick={()=>hDelP(selProfile.id)} className='text-white/20 hover:text-red-400/60 text-xs'>Eliminar perfil</button></div>
        </main></div>);
  }

  // ADD PROFILE
  if (view==='addProfile') return (
    <div className='min-h-screen' style={{background:grad}}>
      <header className='sticky top-0 z-50 backdrop-blur-xl border-b border-white/5' style={{background:'rgba(15,10,26,0.8)'}}><div className='max-w-2xl mx-auto px-4 h-14 flex items-center justify-between'>
        <button onClick={()=>setView('dashboard')} className='text-white/60 hover:text-white text-sm'>← Volver</button>
        <span className='text-white/30 text-xs'>✦ Registrar nacimiento</span><span/></div></header>
      <main className='max-w-lg mx-auto px-4 py-8'>
        <form onSubmit={hSaveP} className='backdrop-blur-xl border border-white/10 p-5 space-y-5' style={{background:cBg,borderRadius:rad}}>
          <div><label className='block text-white/50 text-xs mb-1.5'>Nombre</label><input value={bpN} onChange={e=>setBpN(e.target.value)} placeholder='Nombre de la persona' required className={inp}/></div>
          <div><label className='block text-white/50 text-xs mb-1.5'>Fecha de nacimiento</label><input type='date' value={bpD} onChange={e=>setBpD(e.target.value)} required className={inp+' [color-scheme:dark]'}/></div>
          <div>
            <label className='flex items-center gap-2 text-white/50 text-xs mb-1.5'><input type='checkbox' checked={bpTU} onChange={e=>setBpTU(e.target.checked)} className='rounded'/> Hora desconocida</label>
            {!bpTU?(<><input type='time' value={bpT} onChange={e=>setBpT(e.target.value)} className={inp+' [color-scheme:dark]'}/><p className='text-amber-400/60 text-[10px] mt-1'>Sin hora precisa, Ascendente y casas pueden no ser exactos.</p></>
            ):(<p className='text-amber-400/80 text-xs p-3 bg-amber-400/5 border border-amber-400/20 rounded-lg'>Ascendente y casas no pueden calcularse sin hora de nacimiento.</p>)}
          </div>
          <div className='relative'><label className='block text-white/50 text-xs mb-1.5'>Ciudad de nacimiento</label>
            <input value={bpCS} onChange={e=>{setBpCS(e.target.value);setBpC(null);}} placeholder='Buscar ciudad...' required className={inp}/>
            {bpC&&<p className='text-white/40 text-[10px] mt-1'>{bpC.city}, {bpC.country}</p>}
            {cityRes.length>0&&!bpC&&(<div className='absolute z-10 w-full mt-1 bg-gray-900/95 border border-white/10 rounded-lg overflow-hidden shadow-xl'>
              {cityRes.map((c,i)=>(<button key={i} type='button' onClick={()=>{setBpC(c);setBpCS(`${c.city}, ${c.country}`);}} className='w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5'>{c.city}, {c.country}</button>))}
            </div>)}
          </div>
          <button type='submit' disabled={bpSave} className={btn} style={{background:p,color:'#fff'}}>{bpSave?'Calculando carta...':'Guardar datos'}</button>
        </form></main></div>);

  // CUSTOMIZE
  if (view==='customize') return (
    <div className='min-h-screen' style={{background:grad}}>
      <header className='sticky top-0 z-50 backdrop-blur-xl border-b border-white/5' style={{background:'rgba(15,10,26,0.8)'}}><div className='max-w-2xl mx-auto px-4 h-14 flex items-center justify-between'>
        <button onClick={()=>setView('dashboard')} className='text-white/60 hover:text-white text-sm'>← Volver</button>
        <span className='text-white/30 text-xs'>✦ Personalizacion</span><span/></div></header>
      <main className='max-w-2xl mx-auto px-4 py-8 space-y-6'>
        <div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
          <h3 className='text-white/60 text-xs uppercase tracking-wider mb-4'>Temas predefinidos</h3>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>{Object.entries(THEME_PRESETS).map(([key,pre])=>(
            <button key={key} onClick={()=>{setCustTheme(pre as any);setActiveP(key);saveTh(pre as any);}}
              className='p-3 border rounded-lg text-center transition-all hover:scale-105'
              style={{background:`linear-gradient(135deg,${pre.gradientColors[0]},${pre.gradientColors[1]})`,borderColor:activeP===key?pre.primaryColor:'rgba(255,255,255,0.1)',borderWidth:activeP===key?2:1}}>
              <div className='w-4 h-4 rounded-full mx-auto mb-1' style={{background:pre.primaryColor}}/><span className='text-white/70 text-[10px]'>{PRESET_LABELS[key]||key}</span></button>))}</div></div>
        <div className='backdrop-blur-xl border border-white/10 p-5' style={{background:cBg,borderRadius:rad}}>
          <h3 className='text-white/60 text-xs uppercase tracking-wider mb-4'>Colores personalizados</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'><span className='text-white/50 text-xs'>Color principal</span><input type='color' value={custTheme.primaryColor} onChange={e=>{setCustTheme({...custTheme,primaryColor:e.target.value,themeType:'custom'});setActiveP('');}} className='w-8 h-8 rounded cursor-pointer bg-transparent border-0'/></div>
            <div className='flex items-center justify-between'><span className='text-white/50 text-xs'>Color secundario</span><input type='color' value={custTheme.secondaryColor} onChange={e=>{setCustTheme({...custTheme,secondaryColor:e.target.value,themeType:'custom'});setActiveP('');}} className='w-8 h-8 rounded cursor-pointer bg-transparent border-0'/></div>
            <div className='flex items-center justify-between'><span className='text-white/50 text-xs'>Color de acento</span><input type='color' value={custTheme.accentColor} onChange={e=>{setCustTheme({...custTheme,accentColor:e.target.value,themeType:'custom'});setActiveP('');}} className='w-8 h-8 rounded cursor-pointer bg-transparent border-0'/></div></div>
          <button onClick={()=>saveTh(custTheme)} className={btn+' mt-4'} style={{background:p,color:'#fff'}}>Guardar cambios</button></div></main></div>);

  // INVITATIONS
  if (view==='invitations') return (
    <div className='min-h-screen' style={{background:grad}}>
      <header className='sticky top-0 z-50 backdrop-blur-xl border-b border-white/5' style={{background:'rgba(15,10,26,0.8)'}}><div className='max-w-2xl mx-auto px-4 h-14 flex items-center justify-between'>
        <button onClick={()=>setView('dashboard')} className='text-white/60 hover:text-white text-sm'>← Volver</button>
        <span className='text-white/30 text-xs'>✦ Invitaciones</span><span/></div></header>
      <main className='max-w-2xl mx-auto px-4 py-8 space-y-4'>
        <button onClick={hCreateInv} className={btn} style={{background:p,color:'#fff'}}>Generar nueva invitacion</button>
        <div className='space-y-2'>{invs.map((inv:any)=>(
          <div key={inv.id} className='backdrop-blur-xl border border-white/10 p-5 flex items-center justify-between' style={{background:cBg,borderRadius:rad}}>
            <div><p className='text-white font-mono text-sm tracking-wider'>{inv.code}</p><p className='text-white/30 text-[10px]'>{inv.currentUses}/{inv.maxUses} usos</p></div>
            {inv.isActive&&(<button onClick={async()=>{await navigator.clipboard.writeText(inv.code);notify('Codigo copiado');}} className='text-white/40 hover:text-white/70 text-xs px-3 py-1 border border-white/10 rounded-lg'>Copiar</button>)}</div>))}</div></main></div>);

  // DASHBOARD
  const filtered = profiles.filter(pr=>pr.name.toLowerCase().includes(searchQ.toLowerCase()));
  const navs = [{l:'Inicio',i:'✦',v:'dashboard' as View},{l:'Registrar',i:'+',v:'addProfile' as View},{l:'Personalizar',i:'🎨',v:'customize' as View},
    ...(user?.role==='admin'?[{l:'Invitaciones',i:'🎫',v:'invitations' as View}]:[])] ;
  return (
    <div className='min-h-screen flex flex-col' style={{background:grad}}>
      <header className='sticky top-0 z-50 backdrop-blur-xl border-b border-white/5' style={{background:'rgba(15,10,26,0.8)'}}><div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
        <div className='flex items-center gap-2'><span style={{color:p}}>✦</span><span className='text-white/80 text-sm font-light tracking-wider'>Astral Family</span></div>
        <div className='flex items-center gap-1'>{navs.map(n=>(<button key={n.v} onClick={()=>setView(n.v)} className='px-3 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 text-xs transition-all'>{n.i} {n.l}</button>))}</div>
        <div className='flex items-center gap-3'><span className='text-white/40 text-xs hidden sm:block'>{user?.name}</span><button onClick={logout} className='text-white/30 hover:text-white/60 text-xs'>Salir</button></div></div></header>
      <main className='flex-1 max-w-6xl mx-auto w-full px-4 py-6'>
        <div className='flex items-center justify-between mb-6'><h2 className='text-white/60 text-sm'>Personas ({profiles.length})</h2>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder='Buscar...' className='px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 text-xs focus:outline-none w-48'/></div>
        {!profiles.length?(
          <div className='text-center py-20'><div className='text-5xl mb-4 opacity-20'>🌌</div><p className='text-white/30 text-sm mb-2'>No hay cartas astrales registradas</p><p className='text-white/20 text-xs mb-6'>Comienza registrando datos de nacimiento</p>
            <button onClick={()=>setView('addProfile')} className='px-6 py-2 rounded-lg text-sm hover:opacity-90' style={{background:p,color:'#fff'}}>Registrar persona</button></div>
        ):<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map(profile=>{const su=gSum(profile);return(
            <button key={profile.id} onClick={()=>{setSelProfile(profile);setView('chart');}} className='text-left backdrop-blur-xl border border-white/10 p-5 hover:border-white/20 transition-all' style={{background:cBg,borderRadius:rad}}>
              <h3 className='text-white text-base font-light mb-3'>✦ {profile.name}</h3>
              <div className='space-y-1 text-xs'>
                <div className='flex justify-between'><span className='text-white/40'>Fecha</span><span className='text-white/60'>{formatDate(profile.birthDate)}</span></div>
                <div className='flex justify-between'><span className='text-white/40'>Hora</span><span className='text-white/60'>{profile.timeUnknown?'Desconocida':profile.birthTime||'-'}</span></div>
                <div className='flex justify-between'><span className='text-white/40'>Lugar</span><span className='text-white/60'>{profile.city}, {profile.country}</span></div></div>
              {su.sun&&su.moon&&su.asc&&(<div className='mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-4 text-xs'>
                <span style={{color:p}}>☀ {su.sun.sign}</span><span style={{color:p}}>☽ {su.moon.sign}</span><span style={{color:p}}>↑ {su.asc.sign}</span></div>)}
            </button>);})}</div>}
      </main>
      <div className='fixed bottom-4 right-4 z-50 space-y-2'>{notifs.map(n=>(
        <div key={n.id} className='px-4 py-2 rounded-lg text-xs text-white/80 backdrop-blur-xl border border-white/10' style={{background:'rgba(15,10,26,0.9)'}}>✦ {n.msg}</div>))}</div>
    </div>);
}
