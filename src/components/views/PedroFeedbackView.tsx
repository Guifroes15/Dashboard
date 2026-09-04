import React, { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { getAccountFeedbackData, FeedbackData } from '../../services/metaService';
import { buildComparativoMessage } from '../../services/pedroFeedbackService';

interface Conta { key: string; name: string; accountId: string; nameFilter?: string }
interface Props { accounts: Conta[] }

type ContaState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; atual: FeedbackData; anterior: FeedbackData | null }
  | { status: 'empty' }
  | { status: 'error'; message: string };

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const addDias = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

// A semana atual usa o preset last_7d da própria Meta; a anterior é o mesmo
// intervalo de 7 dias, só que uma semana antes.
function semanaAnterior(): { since: string; until: string } {
  const hoje = new Date();
  return { since: toISO(addDias(hoje, -13)), until: toISO(addDias(hoje, -7)) };
}

export function PedroFeedbackView({ accounts }: Props) {
  const [states, setStates] = useState<Record<string, ContaState>>(() =>
    Object.fromEntries(accounts.map(c => [c.key, { status: 'idle' }])),
  );
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);

  const setConta = useCallback((key: string, state: ContaState) => {
    setStates(prev => ({ ...prev, [key]: state }));
  }, []);

  const fetchAll = useCallback(async () => {
    setRunning(true);
    setStates(Object.fromEntries(accounts.map(c => [c.key, { status: 'loading' }])));

    const rangeAnterior = semanaAnterior();

    await Promise.all(
      accounts.map(async ({ key, accountId, nameFilter }) => {
        try {
          const [atual, anterior] = await Promise.all([
            getAccountFeedbackData(accountId, nameFilter),
            getAccountFeedbackData(accountId, nameFilter, rangeAnterior),
          ]);
          setConta(key, atual ? { status: 'done', atual, anterior } : { status: 'empty' });
        } catch (err: any) {
          setConta(key, { status: 'error', message: err?.message ?? 'Erro desconhecido' });
        }
      }),
    );

    setRunning(false);
  }, [accounts, setConta]);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const doneCount  = accounts.filter(c => states[c.key]?.status === 'done').length;
  const emptyCount = accounts.filter(c => states[c.key]?.status === 'empty').length;
  const errorCount = accounts.filter(c => states[c.key]?.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedbacks Meta</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comparativo com a semana anterior — investimento, WhatsApp e tráfego.
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Buscando…' : 'Gerar Feedbacks'}
        </button>
      </div>

      {!running && doneCount > 0 && (
        <div className="flex gap-4 text-xs">
          <span className="text-green-400 font-bold">{doneCount} gerados</span>
          {emptyCount > 0 && <span className="text-gray-500 font-bold">{emptyCount} sem gasto</span>}
          {errorCount > 0 && <span className="text-red-400 font-bold">{errorCount} com erro</span>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {accounts.map(({ key, name }) => {
          const state = states[key];
          const message = state.status === 'done' ? buildComparativoMessage(name, state.atual, state.anterior) : '';

          return (
            <div key={key} className="bg-brand-medium border border-brand-light rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-purple shrink-0" />
                  <span className="text-sm font-bold text-white">{name}</span>
                </div>
                {state.status === 'done' && (
                  <button
                    onClick={() => copyText(key, message)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-light hover:bg-brand-light/80 text-xs font-bold transition-all"
                  >
                    {copied[key]
                      ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copiado!</span></>
                      : <><Copy className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-300">Copiar</span></>
                    }
                  </button>
                )}
              </div>

              {state.status === 'idle' && (
                <p className="text-xs text-gray-600 italic">Clique em "Gerar Feedbacks" para buscar.</p>
              )}
              {state.status === 'loading' && (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 bg-brand-light rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
                  ))}
                </div>
              )}
              {state.status === 'empty' && (
                <p className="text-xs text-gray-500 italic">Sem gasto nos últimos 7 dias.</p>
              )}
              {state.status === 'error' && (
                <p className="text-xs text-red-400">Erro: {state.message}</p>
              )}
              {state.status === 'done' && (
                <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans bg-brand-dark/50 rounded-lg p-3 border border-brand-light">
                  {message}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
