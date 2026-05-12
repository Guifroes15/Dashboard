import React from 'react';
import { LayoutDashboard, Store, Lightbulb, TrendingUp } from 'lucide-react';
import { StoreData } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stores: StoreData[];
}

export function Sidebar({ activeTab, setActiveTab, stores }: SidebarProps) {
  return (
    <aside className="w-72 bg-brand-medium border-r border-brand-light p-8 flex flex-col fixed h-screen left-0 overflow-y-auto">
      <div className="mb-10">
        <div className="text-2xl font-bold text-brand-purple flex items-center gap-2">
          <TrendingUp className="w-8 h-8" />
          <span>Aure Digital</span>
        </div>
        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Grupo Yamcol</div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab('consolidado')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'consolidado'
                  ? 'bg-brand-light text-brand-purple border-l-4 border-brand-purple shadow-sm'
                  : 'text-gray-400 hover:bg-brand-light hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Consolidado</span>
            </button>
          </li>

          <div className="pt-6 pb-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] px-4">Lojas</div>
          {stores.map((store) => (
            <li key={store.id}>
              <button
                onClick={() => setActiveTab(store.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === store.id
                    ? 'bg-brand-light text-brand-purple border-l-4 border-brand-purple shadow-sm'
                    : 'text-gray-400 hover:bg-brand-light hover:text-white'
                }`}
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">{store.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-8 border-t border-brand-light">
        <div className="flex items-center gap-3 px-4 py-2 opacity-50">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sistema Ativo</span>
        </div>
      </div>
    </aside>
  );
}
