import React, { useState, useEffect } from 'react';
import { GROUPS } from './data';
import { GroupData, StoreData } from './types';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ConsolidadoView } from './components/views/Consolidado';
import { StoreDetailView } from './components/views/StoreDetail';
import { RankingView } from './components/views/RankingView';
import { FeedbackView } from './components/views/FeedbackView';
import { EmptyGroupView } from './components/views/EmptyGroupView';
import { AccessGate } from './components/views/AccessGate';
import { motion, AnimatePresence } from 'motion/react';

export type ActiveView =
  | { type: 'home' }
  | { type: 'consolidado' }
  | { type: 'ranking' }
  | { type: 'feedback' }
  | { type: 'store'; storeId: string };

const SESSION_KEY = 'aure_access';

export default function App() {
  // ── Acesso ──────────────────────────────────────────────────────────────
  const [accessGroupId, setAccessGroupId] = useState<string | 'all' | null>(null);

  // Persiste na sessão para não pedir senha a cada refresh
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setAccessGroupId(saved);
  }, []);

  const handleAccess = (groupId: string | 'all') => {
    setAccessGroupId(groupId);
    sessionStorage.setItem(SESSION_KEY, groupId);
  };

  // Grupos visíveis para este acesso
  const visibleGroups = accessGroupId === 'all'
    ? GROUPS
    : GROUPS.filter(g => g.id === accessGroupId);

  // ── Navegação ────────────────────────────────────────────────────────────
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [activeView, setActiveView]       = useState<ActiveView>({ type: 'home' });

  // Quando o acesso é definido, inicializa o grupo ativo
  useEffect(() => {
    if (visibleGroups.length > 0 && !activeGroupId) {
      setActiveGroupId(visibleGroups[0].id);
    }
  }, [accessGroupId]);

  const activeGroup = visibleGroups.find(g => g.id === activeGroupId) ?? visibleGroups[0];

  const handleGroupChange = (groupId: string) => {
    setActiveGroupId(groupId);
    setActiveView({ type: 'consolidado' });
  };

  const handleNavigate = (view: ActiveView, groupId: string) => {
    setActiveGroupId(groupId);
    setActiveView(view);
  };

  const handleViewChange = (view: ActiveView) => setActiveView(view);

  const activeStore: StoreData | undefined =
    activeView.type === 'store'
      ? activeGroup?.stores.find(s => s.id === activeView.storeId)
      : undefined;

  const viewKey = activeView.type === 'store'
    ? `${activeGroupId}-store-${activeView.storeId}`
    : `${activeGroupId}-${activeView.type}`;

  const pageLabel =
    activeView.type === 'home'          ? 'Home'
    : activeView.type === 'consolidado' ? (activeGroup?.name ?? '')
    : activeView.type === 'ranking'     ? 'Ranking'
    : activeView.type === 'feedback'    ? 'Feedbacks'
    : activeStore?.name ?? '—';

  // ── Tela de acesso ───────────────────────────────────────────────────────
  if (!accessGroupId) return <AccessGate onAccess={handleAccess} />;
  if (!activeGroup)   return <AccessGate onAccess={handleAccess} />;

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">

      {/* Sidebar — desktop */}
      <div className="hidden lg:block">
        <Sidebar
          groups={visibleGroups}
          activeGroupId={activeGroupId}
          activeView={activeView}
          onGroupChange={handleGroupChange}
          onViewChange={handleViewChange}
          isAdmin={accessGroupId === 'all'}
          onLogout={() => {
            sessionStorage.removeItem(SESSION_KEY);
            setAccessGroupId(null);
            setActiveGroupId('');
          }}
        />
      </div>

      {/* Main */}
      <main className="flex-1 lg:ml-72 pb-24 lg:pb-0 min-h-screen">

        {/* Topbar mobile */}
        <header className="lg:hidden sticky top-0 z-40 bg-brand-medium/95 backdrop-blur border-b border-brand-light px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: activeGroup.color }} />
            <span className="text-xs font-bold text-brand-purple">Aure Digital</span>
            {activeView.type !== 'home' && (
              <>
                <span className="text-gray-700 text-xs">/</span>
                <span className="text-xs text-gray-500">{activeGroup.name}</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-gray-600 bg-brand-light px-2 py-1 rounded border border-brand-light truncate max-w-[130px]">
            {pageLabel}
          </span>
        </header>

        <div className="px-4 py-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {activeView.type === 'home' && (
                <HomeView groups={visibleGroups} onNavigate={handleNavigate} />
              )}
              {activeView.type === 'consolidado' && activeGroup.stores.length === 0 && (
                <EmptyGroupView group={activeGroup} />
              )}
              {activeView.type === 'consolidado' && activeGroup.stores.length > 0 && (
                <ConsolidadoView
                  group={activeGroup}
                  onStoreClick={id => handleViewChange({ type: 'store', storeId: id })}
                />
              )}
              {activeView.type === 'ranking' && activeGroup.stores.length > 0 && (
                <RankingView stores={activeGroup.stores} />
              )}
              {activeView.type === 'feedback' && activeGroup.stores.length > 0 && (
                <FeedbackView 
                  stores={activeGroup.stores} 
                  onStoreClick={id => handleViewChange({ type: 'store', storeId: id })}
                />
              )}
              {activeView.type === 'store' && activeStore && (
                <StoreDetailView store={activeStore} fee={activeGroup.fee} />
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-16 pt-6 border-t border-brand-light flex justify-between items-center text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
            <span>Aure Digital © 2026</span>
          </footer>
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <div className="lg:hidden">
        <BottomNav
          groups={visibleGroups}
          activeGroupId={activeGroupId}
          activeView={activeView}
          isAdmin={accessGroupId === 'all'}
          onGroupChange={handleGroupChange}
          onViewChange={handleViewChange}
        />
      </div>
    </div>
  );
}

