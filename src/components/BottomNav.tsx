import React, { useState } from 'react';
import {
  LayoutDashboard, BarChart2, Store, Layers, X, ChevronRight, Home, Menu,
  MessageSquare, Zap, Crown, PlusCircle, Send, Wallet, Sun, Users, CalendarClock, Rocket,
} from 'lucide-react';
import { GroupData } from '../types';
import { ActiveView } from '../App';

import { motion, AnimatePresence } from 'motion/react';

interface Props {
  groups: GroupData[];
  activeGroupId: string;
  activeView: ActiveView;
  isMaster: boolean;
  isStaff?: boolean;
  onGroupChange: (id: string) => void;
  onViewChange: (view: ActiveView) => void;
}

interface MenuItem { label: string; view: ActiveView; icon: React.ElementType }
interface MenuSection { label: string; items: MenuItem[] }

export function BottomNav({ groups, activeGroupId, activeView, isMaster, isStaff = false, onGroupChange, onViewChange }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'groups' | 'stores' | 'menu'>('groups');

  const activeGroup = groups.find(g => g.id === activeGroupId) ?? groups[0];
  const isStore = activeView.type === 'store';

  const openDrawer = (mode: 'groups' | 'stores' | 'menu') => {
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const close = () => setDrawerOpen(false);

  const goView = (view: ActiveView) => { onViewChange(view); close(); };
  const goGroup = (id: string) => { onGroupChange(id); close(); };

  const menuSections: MenuSection[] = [
    ...(isMaster ? [{
      label: 'Ferramentas IA',
      items: [
        { label: 'Análise de Atendimento', view: { type: 'atendimento' } as ActiveView, icon: MessageSquare },
        { label: 'Criativos',              view: { type: 'criativos' }   as ActiveView, icon: Zap },
        { label: 'Gerador VIP',            view: { type: 'vip' }         as ActiveView, icon: Crown },
      ],
    }] : []),
    ...(isMaster || isStaff ? [{
      label: 'Operações',
      items: [
        { label: 'Lançar Resultado', view: { type: 'data-entry' }    as ActiveView, icon: PlusCircle },
        { label: 'Feedbacks Meta',   view: { type: 'meta-feedback' } as ActiveView, icon: Send },
        { label: 'Saldo Meta Ads',   view: { type: 'meta-balance' }  as ActiveView, icon: Wallet },
        { label: 'Resumo Diário',    view: { type: 'daily-summary' } as ActiveView, icon: Sun },
        { label: 'Agenda',           view: { type: 'agenda' }        as ActiveView, icon: CalendarClock },
        { label: 'Onboarding',       view: { type: 'onboarding' }    as ActiveView, icon: Rocket },
        { label: 'Msgs vs. Conversão', view: { type: 'ranking' }     as ActiveView, icon: BarChart2 },
      ],
    }] : []),
    ...(isMaster ? [{
      label: 'Administração',
      items: [
        { label: 'Usuários', view: { type: 'users' } as ActiveView, icon: Users },
      ],
    }] : []),
  ];

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
                  <p className="text-sm font-bold text-white">
                    {drawerMode === 'groups' ? 'Selecionar grupo' : drawerMode === 'menu' ? 'Mais opções' : `${activeGroup.name} — Lojas`}
                  </p>
                  <button onClick={close} className="p-1.5 rounded-lg bg-brand-light text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 py-2">
                  {/* MENU (Ferramentas IA / Operações / Administração) */}
                  {drawerMode === 'menu' && menuSections.map(section => (
                    <div key={section.label} className="mb-2">
                      <p className="px-5 pt-3 pb-1 text-[9px] font-bold text-gray-600 uppercase tracking-widest">{section.label}</p>
                      {section.items.map(item => {
                        const active = activeView.type === item.view.type;
                        return (
                          <button
                            key={item.label}
                            onClick={() => goView(item.view)}
                            className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${active ? 'bg-brand-light' : 'hover:bg-brand-light/50'}`}
                          >
                            <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-purple' : 'text-gray-500'}`} />
                            <span className={`flex-1 text-left text-sm font-semibold ${active ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}

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
                      <span className={`flex-1 text-left text-sm font-semibold ${activeGroupId === g.id ? 'text-white' : 'text-gray-400'}`}>
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
                          ? 'bg-brand-light animate-pulse' : 'hover:bg-brand-light/50'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: store.color }} />
                      <span className="flex-1 text-sm font-medium text-gray-400 hover:text-white transition-colors">{store.name}</span>
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
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${activeView.type === 'home' ? 'text-brand-purple' : 'text-gray-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
          </button>
          
          <button
            onClick={() => goView({ type: 'consolidado' })}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${activeView.type === 'consolidado' ? 'text-brand-purple' : 'text-gray-500'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Geral</span>
          </button>

          {(isMaster || isStaff) && (
            <button
              onClick={() => openDrawer('menu')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                menuSections.some(s => s.items.some(i => i.view.type === activeView.type)) ? 'text-brand-purple' : 'text-gray-500'
              }`}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Mais</span>
            </button>
          )}

          <button
            onClick={() => openDrawer('stores')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors cursor-pointer ${isStore ? 'text-brand-purple' : 'text-gray-500'}`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Lojas</span>
            {activeGroup.stores.length > 0 && (
              <span className="absolute top-2 right-5 w-4 h-4 bg-brand-purple rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                {activeGroup.stores.length}
              </span>
            )}
          </button>

          {isMaster && (
            <button
              onClick={() => openDrawer('groups')}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors text-gray-500 hover:text-white cursor-pointer"
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
