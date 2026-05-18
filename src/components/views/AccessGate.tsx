import React, { useState } from 'react';
import { TrendingUp, Lock, Eye, EyeOff } from 'lucide-react';

// ─── SENHAS — altere aqui quando quiser ──────────────────────────────────────
// master: acesso completo a todos os grupos
// cada grupo: acesso só ao grupo correspondente
export const ACCESS_CONFIG: Record<string, string | 'all'> = {
  'aure2026master': 'all',        // ← senha master (você)
  'yamcol2026':     'yamcol',     // ← senha Grupo Yamcol
  'barbosa2026':    'barbosa',    // ← senha Grupo Barbosa
  'paralelas2026':  'paralelas',  // ← senha Grupo Paralelas
  'lupo2026':       'lupo',       // ← senha Grupo Lupo
};
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onAccess: (groupId: string | 'all') => void;
}

export function AccessGate({ onAccess }: Props) {
  const [senha, setSenha]     = useState('');
  const [show, setShow]       = useState(false);
  const [erro, setErro]       = useState(false);
  const [shake, setShake]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acesso = ACCESS_CONFIG[senha.trim()];
    if (acesso) {
      setErro(false);
      onAccess(acesso);
    } else {
      setErro(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setSenha('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4">
      <div className={`w-full max-w-sm transition-all ${shake ? 'animate-shake' : ''}`}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-brand-purple/20 border border-brand-purple/30 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-brand-purple" />
          </div>
          <span className="text-xl font-bold text-white">Aure Digital</span>
        </div>

        {/* Card */}
        <div className="bg-brand-medium border border-brand-light rounded-2xl p-7">
          <div className="flex items-center justify-center w-11 h-11 bg-brand-light border border-brand-light rounded-xl mb-5 mx-auto">
            <Lock className="w-5 h-5 text-brand-purple2" />
          </div>

          <h1 className="text-base font-bold text-white text-center mb-1">
            Acesso ao painel
          </h1>
          <p className="text-xs text-gray-600 text-center mb-6">
            Digite a senha fornecida pela Aure Digital
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro(false); }}
                placeholder="Sua senha de acesso"
                autoFocus
                className={`w-full bg-brand-dark border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:outline-none transition-colors ${
                  erro
                    ? 'border-red-800 focus:border-red-600'
                    : 'border-brand-light focus:border-brand-purple'
                }`}
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-400 transition-colors"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {erro && (
              <p className="text-xs text-red-500 text-center">
                Senha incorreta. Verifique e tente novamente.
              </p>
            )}

            <button
              type="submit"
              disabled={!senha.trim()}
              className="w-full py-3 rounded-xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Acessar painel
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-800 mt-6">
          Não tem acesso? Entre em contato com a Aure Digital.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
}
