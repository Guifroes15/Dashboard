import React, { useState } from 'react';
import { LayoutDashboard, BarChart2, Store, Layers, X, ChevronRight, Home, MessageSquare } from 'lucide-react';
import { GroupData } from '../types';
import { ActiveView } from '../App';

import { motion, AnimatePresence } from 'motion/react';

interface Props {
  groups: GroupData[];
  activeGroupId: string;
  activeView: ActiveView;
  isAdmin: boolean;
  onGroupChange: (id: string) => void;
  onViewChange: (view: ActiveView) => void;
}

export function BottomNav({ groups, activeGroupId, activeView, isAdmin, onGroupChange, onViewChange }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'groups' | 'stores'>('groups');

  const activeGroup = groups.find(g => g.id === activeGroupId) ?? groups[0];
  const isStore = activeView.type === 'store';

  const openDrawer = (mode: 'groups' | 'stores') => {
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const close = () => setDrawerOpen(false);

  const goView = (view: ActiveView) => { onViewChange(view); close(); };
  const goGroup = (id: string) => { onGroupChange(id); close(); };

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              className="fixed bottom-16 left-0 right-0 z-50"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="bg-brand-medium border-t border-brand-light rounded-t-2xl max-h-[70vh] flex flex-col">
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-brand-light" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-brand-light">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {drawerMode === 'groups' ? 'Selecionar grupo' : `${activeGroup.name} — Lojas`}
                  </p>
                  <button onClick={close} className="p-1.5 rounded-lg bg-brand-light text-[var(--text-secondary)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 py-2">
                  {/* GRUPOS */}
                  {drawerMode === 'groups' && groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => goGroup(g.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                        activeGroupId === g.id ? 'bg-brand-light' : 'hover:bg-brand-light/50'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: g.color }} />
                      <span className={`flex-1 text-left text-sm font-semibold ${activeGroupId === g.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {g.name}
                      </span>
                      <span className="text-[10px] text-gray-600">{g.stores.length} lojas</span>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  ))}

                  {/* LOJAS */}
                  {drawerMode === 'stores' && activeGroup.stores.length === 0 && (
                    <p className="text-sm text-gray-600 text-center py-8 italic">Aguardando dados…</p>
                  )}
                  {drawerMode === 'stores' && activeGroup.stores.map(store => (
                    <button
                      key={store.id}
                      onClick={() => goView({ type: 'store', storeId: store.id })}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left ${
                        activeView.type === 'store' && activeView.storeId === store.id
                          ? 'bg-brand-light' : 'hover:bg-brand-light/50'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: store.color }} />
                      <span className="flex-1 text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{store.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-brand-medium/95 backdrop-blur border-t border-brand-light">
        <div className="flex items-stretch h-16">
          <button
            onClick={() => goView({ type: 'home' })}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeView.type === 'home' ? 'text-brand-purple' : 'text-[var(--text-secondary)]'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
          </button>
          <button
            onClick={() => goView({ type: 'consolidado' })}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeView.type === 'consolidado' ? 'text-brand-purple' : 'text-[var(--text-secondary)]'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Geral</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => goView({ type: 'feedback' })}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeView.type === 'feedback' ? 'text-brand-purple' : 'text-[var(--text-secondary)]'}`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Dicas</span>
              </button>

              <button
                onClick={() => activeGroup.stores.length > 0 && goView({ type: 'ranking' })}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  activeView.type === 'ranking' ? 'text-brand-purple' : activeGroup.stores.length === 0 ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Ranking</span>
              </button>
            </>
          )}

          <button
            onClick={() => openDrawer('stores')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${isStore ? 'text-brand-purple' : 'text-[var(--text-secondary)]'}`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Lojas</span>
            {activeGroup.stores.length > 0 && (
              <span className="absolute top-2 right-5 w-4 h-4 bg-brand-purple rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                {activeGroup.stores.length}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => openDrawer('groups')}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Layers className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Grupos</span>
              <div className="absolute top-2.5 right-4 w-2 h-2 rounded-full" style={{ background: activeGroup.color }} />
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
