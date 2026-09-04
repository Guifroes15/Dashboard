import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { GroupData, StoreData, UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ConsolidadoView } from './components/views/Consolidado';
import { StoreDetailView } from './components/views/StoreDetail';
import { RankingView } from './components/views/RankingView';
import { EmptyGroupView } from './components/views/EmptyGroupView';
import { AccessGate, AccessState } from './components/views/AccessGate';
import { AuthView }        from './components/views/AuthView';
import { AtendimentoView } from './components/views/AtendimentoView';
import { CriativosView }   from './components/views/CriativosView';
import { VipView }         from './components/views/VipView';
import { DataEntryView }   from './components/views/DataEntryView';
import { MetaAdsView }     from './components/views/MetaAdsView';
import { MetaFeedbackView } from './components/views/MetaFeedbackView';
import { PedroFeedbackView } from './components/views/PedroFeedbackView';
import { MetaBalanceView } from './components/views/MetaBalanceView';
import { KommoView }       from './components/views/KommoView';
import { PEDRO_ACCOUNTS }  from './config/pedroAccounts';
import { useGroups }       from './hooks/useGroups';
import { useAuth, profileToAccessState } from './hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

export type ActiveView =
  | { type: 'home' }
  | { type: 'consolidado' }
  | { type: 'ranking' }
  | { type: 'atendimento' }
  | { type: 'criativos' }
  | { type: 'vip' }
  | { type: 'data-entry' }
  | { type: 'meta-ads' }
  | { type: 'meta-feedback' }
  | { type: 'meta-balance' }
  | { type: 'kommo' }
  | { type: 'store'; storeId: string; tab?: 'visao' | 'simulador' | 'meta-ads' | 'otimizacoes' };

const SESSION_KEY = 'aure_access';

// Clientes que já pediram visão própria de saldo + resultados do Meta Ads
// (além do que todo cliente já vê: vendas com projeção). Só adiciona um
// groupId aqui a pedido do Guilherme — por padrão cliente não vê Meta Ads.
const CLIENTES_COM_META_ADS = ['ferracini'];

export default function App() {
  // Firebase Auth — para colegas que usam email/Google
  const { loading: authLoading, accessState: firebaseAccess, logout: firebaseLogout } = useAuth();

  // Senha local — para acessos hardcoded (Guilherme + equipe existente)
  const [localAccess, setLocalAccess] = useState<AccessState | null>(null);

  // Controla exibição da tela de cadastro/login Firebase
  const [showAuthView, setShowAuthView] = useState(false);

  // Combina os dois: Firebase tem prioridade se estiver ativo
  const access = firebaseAccess ?? localAccess;

  const [activeGroupId, setActiveGroupId] = useState('');
  const [activeView, setActiveView]       = useState<ActiveView>({ type: 'home' });
  const [theme, setTheme]                 = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aure_theme') as 'dark' | 'light') ?? 'dark';
  });

  const { groups, seeded } = useGroups();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Restaura sessão de senha do sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.groupId !== undefined && parsed.groupIds === undefined) {
          parsed.groupIds = parsed.groupId === 'all' ? 'all' : [parsed.groupId as string];
          delete parsed.groupId;
        }
        setLocalAccess(parsed as AccessState);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aure_theme', next);
      return next;
    });
  };

  // Login por senha (AccessGate)
  const handlePasswordAccess = (state: AccessState) => {
    setLocalAccess(state);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  };

  // Login por Firebase (AuthView)
  const handleFirebaseLogin = (profile: UserProfile) => {
    setLocalAccess(profileToAccessState(profile));
    setShowAuthView(false);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem(SESSION_KEY);
    if (firebaseAccess) await firebaseLogout();
    setLocalAccess(null);
    setShowAuthView(false);
    setActiveGroupId('');
    setActiveView({ type: 'home' });
  };

  const visibleGroups: GroupData[] = access == null ? [] :
    access.groupIds === 'all'
      ? groups
      : groups.filter(g => Array.isArray(access.groupIds) && access.groupIds.includes(g.id));

  const isMaster    = access?.isMaster ?? false;
  const isStaff     = access?.isStaff  ?? false;
  const nomeUsuario = access?.nome ?? '';

  // Cliente (não master/staff) de um grupo liberado pra ver saldo + Meta Ads
  const clienteComMetaAds = !isMaster && !isStaff &&
    Array.isArray(access?.groupIds) &&
    access.groupIds.some(g => CLIENTES_COM_META_ADS.includes(g));

  // Identidade visual própria (preto/branco/vermelho + logo) só pro login
  // cliente da Ferracini — master/staff continuam vendo o tema padrão Aure.
  const temaFerracini = !isMaster && !isStaff &&
    Array.isArray(access?.groupIds) && access.groupIds.includes('ferracini');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('theme-ferracini', temaFerracini);
  }, [temaFerracini]);

  // Acesso restrito (ex.: Pedro Reis) — só Feedbacks Meta + Saldo, com lista
  // própria de contas que não fazem parte dos grupos/lojas da Aure.
  const acessoRestrito = access?.escopoRestrito === 'feedback-saldo';
  const pedroVirtualGroup: GroupData = {
    id: 'contas-externas', name: 'Contas externas', color: '#7c3aed', fee: 0,
    stores: PEDRO_ACCOUNTS.map(a => ({
      id: a.id, name: a.name, color: a.color, metaAccountId: a.metaAccountId,
      historico: [], planos: [],
    })),
  };
  const pedroFeedbackAccounts = PEDRO_ACCOUNTS.map(a => ({ key: a.id, name: a.name, accountId: a.metaAccountId }));

  useEffect(() => {
    if (acessoRestrito && activeView.type !== 'meta-feedback' && activeView.type !== 'meta-balance') {
      setActiveView({ type: 'meta-feedback' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acessoRestrito]);

  useEffect(() => {
    if (visibleGroups.length > 0 && !activeGroupId) {
      setActiveGroupId(visibleGroups[0].id);
    }
  }, [access, groups]);

  const activeGroup = visibleGroups.find(g => g.id === activeGroupId) ?? visibleGroups[0];

  const handleGroupChange = (id: string) => { setActiveGroupId(id); setActiveView({ type: 'consolidado' }); };
  const handleNavigate    = (gid: string, view: ActiveView) => { setActiveGroupId(gid); setActiveView(view); };
  const handleViewChange  = (view: ActiveView) => setActiveView(view);

  const activeStore: StoreData | undefined =
    activeView.type === 'store' ? activeGroup?.stores.find(s => s.id === activeView.storeId) : undefined;

  const viewKey = activeView.type === 'store'
    ? `${activeGroupId}-store-${activeView.storeId}-${activeView.tab ?? ''}`
    : `${activeGroupId}-${activeView.type}`;

  const pageLabel =
    activeView.type === 'home'          ? 'Home'
    : activeView.type === 'atendimento' ? 'Análise de Atendimento'
    : activeView.type === 'criativos'   ? 'Inteligência de Criativos'
    : activeView.type === 'vip'         ? 'Gerador VIP'
    : activeView.type === 'data-entry'  ? 'Lançar Resultado'
    : activeView.type === 'meta-ads'    ? 'Meta Ads'
    : activeView.type === 'meta-feedback' ? 'Feedbacks Meta'
    : activeView.type === 'meta-balance'  ? 'Saldo Meta Ads'
    : activeView.type === 'kommo'         ? 'Kommo'
    : activeView.type === 'consolidado' ? (activeGroup?.name ?? '')
    : activeView.type === 'ranking'     ? 'Ranking'
    : activeStore?.name ?? '—';

  useEffect(() => {
    if (acessoRestrito) return; // tem o próprio guard, logo acima
    if (!isMaster && ['atendimento', 'criativos', 'vip'].includes(activeView.type)) {
      setActiveView({ type: 'home' });
    }
    if (!isMaster && !isStaff && (activeView.type === 'data-entry' || activeView.type === 'meta-ads' || activeView.type === 'meta-feedback' || activeView.type === 'kommo')) {
      setActiveView({ type: 'home' });
    }
    if (!isMaster && !isStaff && !clienteComMetaAds && activeView.type === 'meta-balance') {
      setActiveView({ type: 'home' });
    }
  }, [isMaster, isStaff, clienteComMetaAds, acessoRestrito, activeView.type]);

  // ── Firebase verificando sessão ───────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Não autenticado ───────────────────────────────────────────────────────
  if (!access) {
    if (showAuthView) {
      return (
        <AuthView
          onBack={() => setShowAuthView(false)}
          onLogin={handleFirebaseLogin}
        />
      );
    }
    return (
      <AccessGate
        onAccess={handlePasswordAccess}
        onCreateAccount={() => setShowAuthView(true)}
      />
    );
  }

  // ── Acesso restrito (Pedro Reis e afins) — layout próprio e enxuto,
  // sem os grupos/lojas da Aure ─────────────────────────────────────────────
  if (acessoRestrito) {
    return (
      <div className={`flex min-h-screen bg-brand-dark text-white ${theme}`}>
        <main className="flex-1 min-h-screen">
          <header className="sticky top-0 z-40 bg-brand-medium/95 backdrop-blur border-b border-brand-light px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-purple">Aure Digital</span>
              <span className="text-gray-700 text-xs">/</span>
              <span className="text-xs text-gray-500">{nomeUsuario}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-brand-light rounded-lg p-0.5">
                <button
                  onClick={() => setActiveView({ type: 'meta-feedback' })}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${activeView.type === 'meta-feedback' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Feedbacks Meta
                </button>
                <button
                  onClick={() => setActiveView({ type: 'meta-balance' })}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${activeView.type === 'meta-balance' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Saldo Meta Ads
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] text-gray-600 hover:text-red-400 font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sair
              </button>
            </div>
          </header>

          <div className="px-4 py-6 lg:p-10">
            {activeView.type === 'meta-feedback' && <PedroFeedbackView accounts={pedroFeedbackAccounts} />}
            {activeView.type === 'meta-balance' && <MetaBalanceView groups={[pedroVirtualGroup]} />}
          </div>
        </main>
      </div>
    );
  }

  // ── Autenticado via Firebase, mas sem grupos atribuídos ───────────────────
  if (!activeGroup) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mx-auto border border-brand-light">
            <Users className="w-7 h-7 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Conta criada!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Seu acesso ainda não tem grupos atribuídos. O administrador vai liberar em breve.
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 px-5 py-2.5 rounded-xl bg-brand-light text-white text-xs font-bold hover:bg-brand-light/80 transition-all"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-brand-dark text-white ${theme}`}>
      <div className="hidden lg:block">
        <Sidebar
          groups={visibleGroups}
          activeGroupId={activeGroupId}
          activeView={activeView}
          isMaster={isMaster}
          isStaff={isStaff}
          clienteComMetaAds={clienteComMetaAds}
          temaFerracini={temaFerracini}
          onGroupChange={handleGroupChange}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>

      <main className="flex-1 lg:ml-72 pb-24 lg:pb-0 min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 bg-brand-medium/95 backdrop-blur border-b border-brand-light px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: activeGroup.color }} />
            {temaFerracini ? (
              <img
                src={theme === 'dark' ? '/ferracini/logo-white.png' : '/ferracini/logo-black.png'}
                alt="Ferracini"
                className="h-3.5 w-auto"
              />
            ) : (
              <span className="text-xs font-bold text-brand-purple">Aure Digital</span>
            )}
            {activeView.type !== 'home' && (
              <><span className="text-gray-700 text-xs">/</span><span className="text-xs text-gray-500">{activeGroup.name}</span></>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg bg-brand-light border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <span className="text-[10px] text-gray-650 bg-brand-light px-2 py-1 rounded border border-brand-light truncate max-w-[120px]">
              {pageLabel}
            </span>
          </div>
        </header>

        <div className="px-4 py-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={viewKey}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}>

              {activeView.type === 'home' && (
                <HomeView groups={visibleGroups} onNavigate={handleNavigate} nome={nomeUsuario} isMaster={isMaster} isStaff={isStaff} />
              )}

              {isMaster && activeView.type === 'atendimento' && <AtendimentoView />}
              {isMaster && activeView.type === 'criativos'   && <CriativosView />}
              {isMaster && activeView.type === 'vip'         && <VipView />}

              {(isMaster || isStaff) && activeView.type === 'data-entry' && (
                <DataEntryView groups={visibleGroups} seeded={seeded} isMaster={isMaster} />
              )}

              {(isMaster || isStaff) && activeView.type === 'meta-feedback' && (
                <MetaFeedbackView />
              )}

              {(isMaster || isStaff || clienteComMetaAds) && activeView.type === 'meta-balance' && (
                <MetaBalanceView groups={visibleGroups} />
              )}

              {(isMaster || isStaff) && activeView.type === 'kommo' && (
                <KommoView groups={visibleGroups} />
              )}

              {activeView.type === 'consolidado' && activeGroup.stores.length === 0 && <EmptyGroupView group={activeGroup} />}
              {activeView.type === 'consolidado' && activeGroup.stores.length > 0 && (
                <ConsolidadoView group={activeGroup} onStoreClick={id => handleViewChange({ type: 'store', storeId: id })} />
              )}
              {activeView.type === 'ranking' && activeGroup.stores.length > 0 && <RankingView stores={activeGroup.stores} />}
              {activeView.type === 'store' && activeStore && (
                <StoreDetailView
                  store={activeStore}
                  fee={activeStore.fee ?? activeGroup.fee}
                  isMaster={isMaster}
                  isStaff={isStaff}
                  podeVerMetaAds={isMaster || isStaff || clienteComMetaAds}
                  podeVerOtimizacoes={isMaster || isStaff || !clienteComMetaAds}
                  groupId={activeGroupId}
                  nome={nomeUsuario}
                  initialTab={activeView.tab}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-16 pt-6 border-t border-brand-light flex justify-between items-center text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
            <span>Aure Digital © 2026</span>
          </footer>
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav
          groups={visibleGroups}
          activeGroupId={activeGroupId}
          activeView={activeView}
          isMaster={isMaster}
          isStaff={isStaff}
          clienteComMetaAds={clienteComMetaAds}
          onGroupChange={handleGroupChange}
          onViewChange={handleViewChange}
        />
      </div>
    </div>
  );
}
