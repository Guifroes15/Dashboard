import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { StoreDataV2 } from '../../types';
import { ChartContainer, CustomTooltip } from '../ChartWrapper';
import { StatCard } from '../StatCard';
import { HealthBadge } from '../HealthBadge';
import { ProjecaoCard } from '../ProjecaoCard';
import { RoiPanel } from '../RoiPanel';
import { DollarSign, Percent, MessageSquare, TrendingUp } from 'lucide-react';
import { formatBRL, calcRoi } from '../../utils';

interface Props {
  store: StoreDataV2;
}

export function StoreDetailView({ store }: Props) {
  const roi = calcRoi(store);

  // Dados para gráficos
  const chartData = store.historico.map(m => ({
    name: m.mes,
    vendas: m.vendas,
    conversao: m.conversao,
    mensagens: m.mensagens,
    faturamento: m.faturamentoLoja,
  }));

  // Último mês com dados
  const ultimo = [...store.historico].reverse().find(m => m.vendas > 0)
    ?? store.historico[store.historico.length - 1];

  // Penúltimo para calcular variação
  const penultimos = store.historico.filter(m => m.vendas > 0);
  const penultimo = penultimos.length >= 2 ? penultimos[penultimos.length - 2] : null;
  const calcChange = (cur: number, prev: number | null) => {
    if (!prev || prev === 0) return undefined;
    const pct = ((cur - prev) / prev) * 100;
    return { value: `${Math.abs(pct).toFixed(1)}%`, isPositive: pct >= 0 };
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: store.color }}>
            {store.name}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium tracking-wide mb-3">
            Análise completa · {store.historico[0].mes} — {store.historico[store.historico.length - 1].mes}
          </p>
          <HealthBadge store={store} />
        </div>
        {/* ROI status resumido */}
        <div className="text-left md:text-right shrink-0 bg-brand-light/20 p-4 rounded-xl border border-brand-light/50 md:bg-transparent md:p-0 md:border-0 w-full md:w-auto">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">ROI acumulado</p>
          <p
            className="text-2xl font-bold"
            style={{ color: roi.status === 'positivo' ? '#22c55e' : '#ef4444' }}
          >
            {formatBRL(roi.roiTotal)}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            {roi.mesesPositivos} de {roi.meses.length} meses pagos
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={`Vendas (${ultimo.mes})`}
          value={formatBRL(ultimo.vendas)}
          change={calcChange(ultimo.vendas, penultimo?.vendas ?? null)}
          icon={DollarSign}
        />
        <StatCard
          label={`Fat. loja (${ultimo.mes})`}
          value={formatBRL(ultimo.faturamentoLoja)}
          subtext={`${ultimo.pctAureFat.toFixed(2)}% do faturamento`}
          icon={TrendingUp}
        />
        <StatCard
          label={`Conversão (${ultimo.mes})`}
          value={`${ultimo.conversao.toFixed(2)}%`}
          change={calcChange(ultimo.conversao, penultimo?.conversao ?? null)}
          icon={Percent}
        />
        <StatCard
          label={`Mensagens (${ultimo.mes})`}
          value={ultimo.mensagens}
          subtext={`Ticket médio: ${formatBRL(ultimo.ticketMedio)}`}
          icon={MessageSquare}
        />
      </div>

      {/* Gráficos de evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Evolução de Vendas (R$)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${store.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={store.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={store.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="vendas" name="Vendas (R$)" stroke={store.color} strokeWidth={2.5} fill={`url(#grad-${store.id})`} dot={{ r: 4, fill: store.color }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Conversão Mensal (%)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversao" name="Conversão (%)" fill={store.color} radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Projeção + ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ProjecaoCard store={store} />
        <div className="lg:col-span-2">
          <RoiPanel store={store} />
        </div>
      </div>

      {/* Plano de ação */}
      <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden mb-6">
        <div className="p-6 border-b border-brand-light">
          <h3 className="text-md font-bold text-white">Plano de Ação</h3>
          <p className="text-xs text-gray-500 mt-1">Estratégia recomendada para esta operação</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-light/40">
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ação</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Prioridade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light">
            {store.planos.map((p, i) => (
              <tr key={i} className="hover:bg-brand-light/20 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-300 font-medium">{p.tarefa}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    p.status === 'Alta'    ? 'bg-red-500/10 text-red-400' :
                    p.status === 'Média'   ? 'bg-amber-500/10 text-amber-400' :
                    p.status === 'Teste'   ? 'bg-blue-500/10 text-blue-400' :
                    p.status === 'Sucesso' ? 'bg-green-500/10 text-green-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabela histórica */}
      <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-brand-light">
          <h3 className="text-sm md:text-md font-bold text-white">Histórico completo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-brand-light/40">
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mês</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Vendas</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Fat. Loja</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">% Aure</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Qtd</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Ticket</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Msgs</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Conv.</th>
                <th className="px-3 md:px-4 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light">
              {store.historico.map((m, i) => {
                const roiMes = m.vendas - 1500;
                return (
                  <tr key={i} className="hover:bg-brand-light/20 transition-colors text-xs md:text-sm">
                    <td className="px-3 md:px-4 py-3 font-semibold text-gray-200">{m.mes}</td>
                    <td className="px-3 md:px-4 py-3 text-right font-bold" style={{ color: m.vendas > 0 ? '#fff' : '#374151' }}>
                      {formatBRL(m.vendas)}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right text-gray-400">
                      {m.faturamentoLoja > 0 ? formatBRL(m.faturamentoLoja) : '—'}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right" style={{ color: m.pctAureFat >= 5 ? '#22c55e' : m.pctAureFat >= 2 ? '#f59e0b' : '#9ca3af' }}>
                      {m.pctAureFat > 0 ? `${m.pctAureFat.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right text-gray-400">{m.qtdVendas || '—'}</td>
                    <td className="px-3 md:px-4 py-3 text-right text-gray-400">
                      {m.ticketMedio > 0 ? formatBRL(m.ticketMedio) : '—'}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right text-gray-400">{m.mensagens || '—'}</td>
                    <td className="px-3 md:px-4 py-3 text-right" style={{ color: m.conversao >= 5 ? '#22c55e' : m.conversao >= 2 ? '#f59e0b' : '#9ca3af' }}>
                      {m.conversao > 0 ? `${m.conversao.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right font-bold" style={{ color: roiMes >= 0 ? '#22c55e' : '#ef4444' }}>
                      {formatBRL(roiMes)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
