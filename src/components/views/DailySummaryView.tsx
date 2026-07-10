import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Sun } from 'lucide-react';
import { GroupData } from '../../types';
import { useMetaAccountsOverview, SALDO_BAIXO_LIMITE, AccountOverview } from '../../hooks/useMetaAccountsOverview';

interface Props { groups: GroupData[] }

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function storeLabel(account: AccountOverview) {
  return account.stores.map(s => s.name).join(' / ');
}

function ontemFormatado(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function buildSummaryMessage(accounts: AccountOverview[]): string {
  const comDados = accounts.filter(a => a.insights);
  const totalGasto = comDados.reduce((acc, a) => acc + a.insights!.spend, 0);
  const totalMensagens = comDados.reduce((acc, a) => acc + a.insights!.mensagens, 0);

  const precisaAtencao = accounts.filter(a =>
    (a.balance?.temLimite && a.balance.saldoRestante < SALDO_BAIXO_LIMITE) ||
    (a.insights && a.insights.spend === 0)
  );

  const melhorVolume = [...comDados]
    .filter(a => a.insights!.mensagens > 0)
    .sort((a, b) => b.insights!.mensagens - a.insights!.mensagens)
    .slice(0, 3);

  const melhorCusto = [...comDados]
    .filter(a => a.insights!.mensagens > 0 && a.insights!.custoMensagem > 0)
    .sort((a, b) => a.insights!.custoMensagem - b.insights!.custoMensagem)
    .slice(0, 3);

  const lines: string[] = [
    `☀️ Bom dia! Resumo de ontem (${ontemFormatado()})`,
    '',
    `📊 Visão geral: R$ ${fmtBRL(totalGasto)} investidos, ${totalMensagens} mensagens geradas em ${comDados.length} contas.`,
  ];

  if (precisaAtencao.length > 0) {
    lines.push('', `⚠️ Precisam de atenção (${precisaAtencao.length})`);
    for (const a of precisaAtencao) {
      const motivo = a.balance?.temLimite && a.balance.saldoRestante < SALDO_BAIXO_LIMITE
        ? `saldo R$ ${fmtBRL(a.balance.saldoRestante)} restante`
        : 'sem gasto ontem';
      lines.push(`- ${storeLabel(a)} — ${motivo}`);
    }
  }

  if (melhorVolume.length > 0) {
    lines.push('', '🏆 Melhor volume de mensagens');
    melhorVolume.forEach((a, i) => lines.push(`${i + 1}. ${storeLabel(a)} — ${a.insights!.mensagens} mensagens`));
  }

  if (melhorCusto.length > 0) {
    lines.push('', '💰 Melhor custo por mensagem');
    melhorCusto.forEach((a, i) => lines.push(`${i + 1}. ${storeLabel(a)} — R$ ${fmtBRL(a.insights!.custoMensagem)}/msg`));
  }

  return lines.join('\n');
}

export function DailySummaryView({ groups }: Props) {
  const { accounts, loading, refresh } = useMetaAccountsOverview(groups, 'yesterday');
  const [copied, setCopied] = useState(false);

  const message = accounts.length > 0 ? buildSummaryMessage(accounts) : '';

  const copyText = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-400" /> Resumo Diário
          </h1>
          <p className="text-sm text-gray-500 mt-1">Overview de ontem em todas as contas — pronto pra copiar.</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Buscando…' : 'Atualizar'}
        </button>
      </div>

      {loading && accounts.length === 0 && (
        <div className="space-y-2 animate-pulse bg-brand-medium border border-brand-light rounded-xl p-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 bg-brand-light rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
          ))}
        </div>
      )}

      {!loading && message && (
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
            {message}
          </pre>
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-sm">Nenhuma conta de anúncio mapeada ainda.</p>
        </div>
      )}
    </div>
  );
}
