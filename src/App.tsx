/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { STORES } from './data';
import { ConsolidadoView } from './components/views/Consolidado';
import { StoreDetailView } from './components/views/StoreDetail';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('consolidado');

  const activeStore = STORES.find(s => s.id === activeTab);

  return (
    <div className="flex min-h-screen bg-brand-dark text-white selection:bg-brand-purple/30">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stores={STORES} 
      />

      {/* Main Content Area */}
      <main className="ml-72 flex-1 p-10 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeTab === 'consolidado' && <ConsolidadoView />}
            {activeStore && <StoreDetailView store={activeStore} />}
          </motion.div>
        </AnimatePresence>

        {/* Footer info */}
        <footer className="mt-20 pt-8 border-t border-brand-light flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
          <div>Aure Digital © 2026</div>
          <div className="flex gap-6">
            <span className="hover:text-brand-purple transition-colors cursor-pointer">Documentação</span>
            <span className="hover:text-brand-purple transition-colors cursor-pointer">Suporte Técnico</span>
            <span className="hover:text-brand-purple transition-colors cursor-pointer">Privacidade</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

