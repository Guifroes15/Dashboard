import React, { useState } from 'react';
import { Copy, Check, Sparkles, Sun, Calendar, AlertCircle } from 'lucide-react';
import { GroupData } from '../../types';
import { buildUniqueAccounts } from '../../hooks/useMetaAccountsOverview';
import { getAccountBalance, getAccountTimeSeries } from '../../services/metaService';
import { generateDailySummary, DailyAccountPayload, SummaryPeriod } from '../../services/aiService';

interface Props { groups: GroupData[] }

const fmtCurta = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

function periodoLabel(periodo: SummaryPeriod): string {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  if (periodo === 'ontem') return fmtCurta(ontem);

  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  return `${fmtCurta(seteDiasAtras)} a ${fmtCurta(ontem)}`;
}

async function buildPayload(groups: GroupData[]): Promise<DailyAccountPayload[]> {
  const byAccount = buildUniqueAccounts(groups);

  const results = await Promise.allSettled(
    Array.from(byAccount.entries()).map(async ([adAccountId, stores]) => {
      const [balanceRes, seriesRes] = await Promise.allSettled([
        getAccountBalance(adAccountId),
        getAccountTimeSeries(adAccountId, { preset: 'last_14d' }),
      ]);

      const balance = balanceRes.status === 'fulfilled' ? balanceRes.value : null;
      const series = seriesRes.status === 'fulfilled' ? seriesRes.value : [];

      const payload: DailyAccountPayload = {
        nome: stores.map(s => s.name).join(' / '),
        saldoRestante: balance?.temLimite ? balance.saldoRestante : null,
        dias: series.map(d => ({
          data: d.date,
          gasto: d.spend,
          mensagens: d.mensagens,
          custoPorMensagem: d.mensagens > 0 ? Math.round((d.spend / d.mensagens) * 100) / 100 : null,
        })),
      };
      return payload;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<DailyAccountPayload> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(p => p.dias.length > 0);
}

export function DailySummaryView({ groups }: Props) {
  const [periodo, setPeriodo] = useState<SummaryPeriod>('ontem');
  const [phase, setPhase] = useState<'idle' | 'fetching' | 'thinking' | 'done' | 'error'>('idle');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setPhase('fetching');
    setError('');
    try {
      const payload = await buildPayload(groups);
      if (payload.length === 0) {
        setError('Nenhum dado encontrado nas contas mapeadas.');
        setPhase('error');
        return;
      }
      setPhase('thinking');
      const text = await generateDailySummary(payload, periodo, periodoLabel(periodo));
      setSummary(text);
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar o resumo');
      setPhase('error');
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loading = phase === 'fetching' || phase === 'thinking';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sun className="w-6 h-6 text-amber-400" /> Resumo Diário
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Briefing executivo de todas as contas, comparando com o período anterior.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-brand-medium border border-brand-light rounded-xl p-1">
          <button
            onClick={() => setPeriodo('ontem')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${periodo === 'ontem' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Calendar className="w-3.5 h-3.5" /> Ontem
          </button>
          <button
            onClick={() => setPeriodo('7d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${periodo === '7d' ? 'bg-brand-purple text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Calendar className="w-3.5 h-3.5" /> Últimos 7 dias
          </button>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
          {phase === 'fetching' ? 'Buscando dados…' : phase === 'thinking' ? 'Analisando…' : 'Gerar Resumo'}
        </button>
      </div>

      {phase === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {loading && (
        <div className="space-y-2 animate-pulse bg-brand-medium border border-brand-light rounded-xl p-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 bg-brand-light rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
          ))}
        </div>
      )}

      {phase === 'done' && summary && (
        <div className="bg-brand-medium border border-brand-light rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-end">
            <button
              onClick={copyText}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-light hover:bg-brand-light/80 text-xs font-bold transition-all"
            >
              {copied
                ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copiado!</span></>
                : <><Copy className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-300">Copiar</span></>
              }
            </button>
          </div>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans bg-brand-dark/50 rounded-lg p-4 border border-brand-light">
            {summary}
          </pre>
        </div>
      )}

      {phase === 'idle' && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-sm">Escolha o período e clique em "Gerar Resumo" pra analisar todas as contas.</p>
        </div>
      )}
    </div>
  );
}
