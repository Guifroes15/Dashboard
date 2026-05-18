import React, { useState } from 'react';
import { TrendingUp, LayoutDashboard, BarChart2, ChevronDown, ChevronRight, Home, LogOut, MessageSquare } from 'lucide-react';
import { GroupData } from '../types';
import { ActiveView } from '../App';

interface Props {
  groups: GroupData[];
  activeGroupId: string;
  activeView: ActiveView;
  isAdmin: boolean;
  onGroupChange: (id: string) => void;
  onViewChange: (view: ActiveView) => void;
  onLogout?: () => void;
}

export function Sidebar({ groups, activeGroupId, activeView, isAdmin, onGroupChange, onViewChange, onLogout }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([activeGroupId]));

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isActiveView = (view: ActiveView) => {
    if (activeView.type !== view.type) return false;
    if (view.type === 'store' && activeView.type === 'store')
      return activeView.storeId === view.storeId;
    return true;
  };

  const navBtn = (label: string, view: ActiveView, Icon: React.ElementType) => {
    const active = isActiveView(view);
    return (
      <button
        onClick={() => onViewChange(view)}
        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
          active
            ? 'bg-brand-light text-[var(--text-primary)] border-l-2 -ml-px border-brand-purple'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-brand-light/40'
        }`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-72 bg-brand-medium border-r border-brand-light p-5 flex flex-col fixed h-screen left-0 overflow-y-auto">

      {/* Logo */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 bg-brand-purple/20 border border-brand-purple/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-purple" />
            </div>
            <span className="text-base font-bold text-white">Aure Digital</span>
          </div>
          <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest pl-9">Painel de Controle</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4">

        {/* Home */}
        <div>
          <button
            onClick={() => onViewChange({ type: 'home' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left ${
              activeView.type === 'home'
                ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">Início</span>
          </button>
        </div>

        {/* Grupos */}
        <div>
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-1.5">
            {isAdmin ? 'Grupos' : 'Sua Operação'}
          </p>
          {groups.map(group => {
            const isActiveGroup = activeGroupId === group.id && activeView.type !== 'home';
            const isExpanded = expandedGroups.has(group.id);
            const hasStores = group.stores.length > 0;

            return (
              <div key={group.id} className="mb-0.5">
                <div
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all group ${
                    isActiveGroup ? 'bg-brand-light' : 'hover:bg-brand-light/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onGroupChange(group.id);
                      if (!isExpanded) toggleGroup(group.id);
                    }}
                    className="flex-1 flex items-center gap-2.5 text-left min-w-0"
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.color }} />
                    <span className={`flex-1 text-sm font-bold truncate ${isActiveGroup ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {group.name}
                    </span>
                    {hasStores && isAdmin && <span className="text-[9px] text-gray-600 mr-1">{group.stores.length}</span>}
                  </button>
                  <button 
                    onClick={e => { e.stopPropagation(); toggleGroup(group.id); }} 
                    className="p-0.5 rounded hover:bg-brand-light text-gray-600 hover:text-gray-300 transition-colors"
                    aria-label={isExpanded ? "Contrair" : "Expandir"}
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isExpanded && (isActiveGroup || !isAdmin) && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-brand-light pl-3">
                    {navBtn('Consolidado', { type: 'consolidado' }, LayoutDashboard)}
                    {hasStores && isAdmin && navBtn('Msgs vs. Conversão', { type: 'ranking' }, BarChart2)}
                    {hasStores && isAdmin && navBtn('Feedbacks', { type: 'feedback' }, MessageSquare)}

                    {hasStores && (
                      <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest px-2.5 pt-2 pb-1">Lojas</p>
                    )}

                    {group.stores.map(store => {
                      const active = isActiveView({ type: 'store', storeId: store.id });
                      return (
                        <button
                          key={store.id}
                          onClick={() => onViewChange({ type: 'store', storeId: store.id })}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                            active ? 'bg-brand-light text-[var(--text-primary)] border-l-2 -ml-px' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-brand-light/40'
                          }`}
                          style={active ? { borderLeftColor: store.color } : {}}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: store.color }} />
                          <span className="font-medium truncate">{store.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-brand-light space-y-4">
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Conexão Segura</span>
        </div>
      </div>
    </aside>
  );
}
