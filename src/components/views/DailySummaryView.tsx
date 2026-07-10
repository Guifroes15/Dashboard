import React, { useState } from 'react';
import { Copy, Check, Sparkles, Sun, Calendar, AlertCircle } from 'lucide-react';
import { GroupData } from '../../types';
import { buildUniqueAccounts, StoreRef, SALDO_BAIXO_LIMITE } from '../../hooks/useMetaAccountsOverview';
import { getAccountBalance, getAccountTimeSeries, MetaDailyInsight } from '../../services/metaService';

interface Props { groups: GroupData[] }

type Periodo = 'ontem' | '7d';

interface AccountRaw {
  stores: StoreRef[];
  saldoRestante: number | null;
  dias: MetaDailyInsight[]; // até 14 dias, cronológico, terminando ontem
}

interface Janela { gasto: number; mensagens: number; custoMsg: number }

interface AccountAnalysis {
  label: string;
  groupNames: string[];
  saldoRestante: number | null;
  atual: Janela;
  anterior: Janela;
  variacaoMensagens: number | null; // % — null quando não dá pra comparar
  variacaoCusto: number | null;     // % — negativo = melhora (ficou mais barato)
  semGasto: boolean;
  saldoBaixo: boolean;
}

const CRESCIMENTO_DESTAQUE = 20; // % de aumento em mensagens (ou queda de custo) pra virar destaque
const QUEDA_ATENCAO = -20;       // % de queda em mensagens pra virar ponto de atenção
const ALTA_CUSTO_ATENCAO = 30;   // % de alta no custo por mensagem pra virar ponto de atenção

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtCurta = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

function periodoLabel(periodo: Periodo): string {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  if (periodo === 'ontem') return fmtCurta(ontem);
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  return `${fmtCurta(seteDiasAtras)} a ${fmtCurta(ontem)}`;
}

function janela(dias: MetaDailyInsight[]): Janela {
  const gasto = dias.reduce((a, d) => a + d.spend, 0);
  const mensagens = dias.reduce((a, d) => a + d.mensagens, 0);
  return { gasto, mensagens, custoMsg: mensagens > 0 ? gasto / mensagens : 0 };
}

function variacaoPct(atual: number, anterior: number): number | null {
  if (anterior <= 0) return atual > 0 ? 100 : null;
  return ((atual - anterior) / anterior) * 100;
}

function analisar(raw: AccountRaw, periodo: Periodo): AccountAnalysis {
  const dias = raw.dias;
  const atual = periodo === 'ontem' ? janela(dias.slice(-1)) : janela(dias.slice(-7));
  const anterior = periodo === 'ontem' ? janela(dias.slice(0, -1)) : janela(dias.slice(0, -7));

  return {
    label: raw.stores.map(s => s.name).join(' / '),
    groupNames: [...new Set(raw.stores.map(s => s.groupName))],
    saldoRestante: raw.saldoRestante,
    atual,
    anterior,
    variacaoMensagens: variacaoPct(atual.mensagens, anterior.mensagens),
    variacaoCusto: atual.mensagens > 0 && anterior.custoMsg > 0 ? variacaoPct(atual.custoMsg, anterior.custoMsg) : null,
    semGasto: atual.gasto === 0,
    saldoBaixo: raw.saldoRestante !== null && raw.saldoRestante < SALDO_BAIXO_LIMITE,
  };
}

function buildReport(raws: AccountRaw[], periodo: Periodo): string {
  const contas = raws.map(r => analisar(r, periodo));

  const totalGastoAtual = contas.reduce((a, c) => a + c.atual.gasto, 0);
  const totalGastoAnterior = contas.reduce((a, c) => a + c.anterior.gasto, 0);
  const totalMsgAtual = contas.reduce((a, c) => a + c.atual.mensagens, 0);
  const totalMsgAnterior = contas.reduce((a, c) => a + c.anterior.mensagens, 0);
  const varGastoGeral = variacaoPct(totalGastoAtual, totalGastoAnterior);
  const varMsgGeral = variacaoPct(totalMsgAtual, totalMsgAnterior);

  const problemaSaldo = contas.filter(c => c.saldoBaixo);
  const quedaResultado = contas.filter(c =>
    !c.saldoBaixo &&
    (c.semGasto ||
     (c.variacaoMensagens !== null && c.variacaoMensagens <= QUEDA_ATENCAO) ||
     (c.variacaoCusto !== null && c.variacaoCusto >= ALTA_CUSTO_ATENCAO))
  );

  const melhorResultado = contas
    .filter(c => !problemaSaldo.includes(c) && !quedaResultado.includes(c) && c.atual.mensagens > 0)
    .filter(c => (c.variacaoMensagens !== null && c.variacaoMensagens >= CRESCIMENTO_DESTAQUE) ||
                 (c.variacaoCusto !== null && c.variacaoCusto <= -CRESCIMENTO_DESTAQUE))
    .sort((a, b) => (b.variacaoMensagens ?? 0) - (a.variacaoMensagens ?? 0));

  const estaveis = contas.filter(c => !problemaSaldo.includes(c) && !quedaResultado.includes(c) && !melhorResultado.includes(c));

  const titulo = periodo === 'ontem'
    ? `☀️ Resumo de Ontem (${periodoLabel(periodo)})`
    : `📅 Resumo dos Últimos 7 Dias (${periodoLabel(periodo)})`;

  const lines: string[] = [
    titulo,
    '',
    `R$ ${fmtBRL(totalGastoAtual)} investidos${varGastoGeral !== null ? ` (${varGastoGeral >= 0 ? '+' : ''}${varGastoGeral.toFixed(0)}%)` : ''} · ${totalMsgAtual} mensagens${varMsgGeral !== null ? ` (${varMsgGeral >= 0 ? '+' : ''}${varMsgGeral.toFixed(0)}%)` : ''} · ${contas.length} contas`,
  ];

  if (problemaSaldo.length > 0) {
    lines.push('', `💰 Problema de saldo (${problemaSaldo.length})`);
    problemaSaldo
      .slice().sort((a, b) => (a.saldoRestante ?? 0) - (b.saldoRestante ?? 0))
      .forEach(c => lines.push(`- ${c.label} — R$ ${fmtBRL(c.saldoRestante!)} restante`));
  }

  if (quedaResultado.length > 0) {
    lines.push('', `📉 Queda de resultado (${quedaResultado.length})`);
    for (const c of quedaResultado) {
      const motivos: string[] = [];
      if (c.semGasto) motivos.push('sem gasto no período');
      if (c.variacaoMensagens !== null && c.variacaoMensagens <= QUEDA_ATENCAO) motivos.push(`mensagens caíram ${Math.abs(c.variacaoMensagens).toFixed(0)}%`);
      if (c.variacaoCusto !== null && c.variacaoCusto >= ALTA_CUSTO_ATENCAO) motivos.push(`custo/msg subiu ${c.variacaoCusto.toFixed(0)}%`);
      lines.push(`- ${c.label} — ${motivos.join(', ')}`);
    }
  }

  if (melhorResultado.length > 0) {
    lines.push('', `🚀 Contas com melhor resultado (${melhorResultado.length})`);
    for (const c of melhorResultado) {
      const partes: string[] = [];
      if (c.variacaoMensagens !== null && c.variacaoMensagens >= CRESCIMENTO_DESTAQUE) partes.push(`+${c.variacaoMensagens.toFixed(0)}% em mensagens (${c.atual.mensagens})`);
      if (c.variacaoCusto !== null && c.variacaoCusto <= -CRESCIMENTO_DESTAQUE) partes.push(`custo/msg caiu ${Math.abs(c.variacaoCusto).toFixed(0)}%`);
      lines.push(`- ${c.label} — ${partes.join(', ')}`);
    }
  }

  if (estaveis.length > 0) {
    lines.push('', `➖ Contas estáveis (${estaveis.length})`);
    lines.push(estaveis.map(c => c.label).join(', '));
  }

  return lines.join('\n');
}

async function buildRaw(groups: GroupData[]): Promise<AccountRaw[]> {
  const byAccount = buildUniqueAccounts(groups);

  const results = await Promise.allSettled(
    Array.from(byAccount.entries()).map(async ([adAccountId, stores]) => {
      const [balanceRes, seriesRes] = await Promise.allSettled([
        getAccountBalance(adAccountId),
        getAccountTimeSeries(adAccountId, { preset: 'last_14d' }),
      ]);
      const balance = balanceRes.status === 'fulfilled' ? balanceRes.value : null;
      const dias = seriesRes.status === 'fulfilled' ? seriesRes.value : [];
      const raw: AccountRaw = {
        stores,
        saldoRestante: balance?.temLimite ? balance.saldoRestante : null,
        dias,
      };
      return raw;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<AccountRaw> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => r.dias.length > 0);
}

export function DailySummaryView({ groups }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('ontem');
  const [phase, setPhase] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setPhase('fetching');
    setError('');
    try {
      const raws = await buildRaw(groups);
      if (raws.length === 0) {
        setError('Nenhum dado encontrado nas contas mapeadas.');
        setPhase('error');
        return;
      }
      setSummary(buildReport(raws, periodo));
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

  const loading = phase === 'fetching';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sun className="w-6 h-6 text-amber-400" /> Resumo Diário
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Visão geral de todas as contas, comparando com o período anterior.
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
          {loading ? 'Buscando dados…' : 'Gerar Resumo'}
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
