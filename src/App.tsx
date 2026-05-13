import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { STORES } from './data';
import { ConsolidadoView } from './components/views/Consolidado';
import { StoreDetailView } from './components/views/StoreDetail';
import { IdeasView } from './components/views/Ideas';
import { RankingView } from './components/views/RankingView';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('consolidado');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeStore = STORES.find(s => s.id === activeTab);

  return (
    <div className="flex min-h-screen bg-brand-dark text-white selection:bg-brand-purple/30">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stores={STORES}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col transition-all duration-300">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-brand-medium border-b border-brand-light sticky top-0 z-30">
          <div className="flex items-center gap-2 text-brand-purple">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold text-sm">Aure Digital</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Container */}
        <div className="p-4 md:p-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'consolidado' && <ConsolidadoView />}
              {activeTab === 'ranking'     && <RankingView />}
              {activeTab === 'ideas'       && <IdeasView />}
              {activeStore                 && <StoreDetailView store={activeStore} />}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-20 pt-8 border-t border-brand-light flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] text-center md:text-left">
            <div>Aure Digital © 2026</div>
            <div className="flex gap-6">
              <span className="hover:text-brand-purple transition-colors cursor-pointer">Documentação</span>
              <span className="hover:text-brand-purple transition-colors cursor-pointer">Suporte</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
