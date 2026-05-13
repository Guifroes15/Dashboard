import React from 'react';
import { LayoutDashboard, Store, Lightbulb, TrendingUp, BarChart2, X } from 'lucide-react';
import { StoreDataV2 } from '../types';
import { HealthDot } from './HealthBadge';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stores: StoreDataV2[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, setActiveTab, stores, isOpen, onClose }: SidebarProps) {
  const navItem = (id: string, label: string, Icon: React.ElementType, dot?: React.ReactNode) => (
    <li key={id}>
      <button
        onClick={() => {
          setActiveTab(id);
          onClose(); // Auto-close on mobile when item selected
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
          activeTab === id
            ? 'bg-brand-light text-brand-purple border-l-4 border-brand-purple'
            : 'text-gray-400 hover:bg-brand-light hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 shrink-0" />
          <span className="font-medium text-sm">{label}</span>
        </div>
        {dot}
      </button>
    </li>
  );

  return (
    <>
      {/* Overlay - Mobile Only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-brand-medium border-r border-brand-light p-6 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 w-72 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Mobile Only */}
        <div className="flex items-center justify-between mb-8 lg:block">
          <div>
            <div className="text-xl font-bold text-brand-purple flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Aure Digital</span>
            </div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">
              Grupo Yamcol
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {/* Visão */}
            <div className="pt-1 pb-2 text-[9px] font-bold text-gray-700 uppercase tracking-[0.2em] px-4">
              Visão geral
            </div>
            {navItem('consolidado', 'Consolidado', LayoutDashboard)}
            {navItem('ranking', 'Msgs vs. Conversão', BarChart2)}

            {/* Lojas */}
            <div className="pt-5 pb-2 text-[9px] font-bold text-gray-700 uppercase tracking-[0.2em] px-4">
              Lojas ({stores.length})
            </div>
            {stores.map(store =>
              navItem(
                store.id,
                store.name,
                Store,
                <HealthDot store={store} />,
              )
            )}

            {/* Inovações */}
            <div className="pt-5 pb-2 text-[9px] font-bold text-gray-700 uppercase tracking-[0.2em] px-4">
              Inovações
            </div>
            {navItem('ideas', 'Novas Páginas', Lightbulb)}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-brand-light">
          <div className="flex items-center gap-2 px-2 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Sistema Ativo
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
