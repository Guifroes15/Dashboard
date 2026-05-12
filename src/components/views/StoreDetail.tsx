import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StoreData } from '../../types';
import { StatCard } from '../StatCard';
import { ChartContainer, CustomTooltip } from '../ChartWrapper';
import { DollarSign, Percent, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

interface StoreDetailViewProps {
  store: StoreData;
}

export function StoreDetailView({ store }: StoreDetailViewProps) {
  const months = ['jan', 'fev', 'mar', 'abr'] as const;
  const chartData = months.map(m => ({
    name: m.toUpperCase(),
    vendas: store.vendas[m],
    conversao: store.conversao[m],
    mensagens: store.mensagens[m]
  }));

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 'N/A', isPositive: true };
    const pct = ((current - previous) / previous) * 100;
    return {
      value: `${Math.abs(pct).toFixed(1)}%`,
      isPositive: pct >= 0
    };
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: store.color }}>{store.name}</h1>
        <p className="text-gray-400 font-medium tracking-wide">Análise de Performance | Jan—Abr 2026</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          label="Vendas (Abr)" 
          value={`R$ ${store.vendas.abr.toLocaleString('pt-BR')}`} 
          change={calcChange(store.vendas.abr, store.vendas.mar)}
          icon={DollarSign} 
        />
        <StatCard 
          label="Faturamento Loja (Abr)" 
          value={`R$ ${store.faturamentoLoja.abr.toLocaleString('pt-BR')}`} 
          subtext={`Histórico: R$ ${store.faturamentoLoja.mar.toLocaleString('pt-BR')} (Mar)`}
          icon={TrendingUp} 
        />
        <StatCard 
          label="Conversão (Abr)" 
          value={`${store.conversao.abr.toFixed(2)}%`} 
          change={calcChange(store.conversao.abr, store.conversao.mar)}
          icon={Percent} 
        />
        <StatCard 
          label="Mensagens (Abr)" 
          value={store.mensagens.abr.toLocaleString('pt-BR')} 
          subtext={`${store.mensagens.mar} em Março`}
          icon={MessageSquare} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartContainer title="Evolução de Vendas (R$)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={store.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={store.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="vendas" name="Vendas (R$)" stroke={store.color} strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" dot={{ r: 4, fill: store.color }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Conversão Mensal (%)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversao" name="Conversão (%)" fill={store.color} radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-light flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-purple" />
            Plano de Ação Estratégico
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-light/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tarefa / Objetivo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Prioridade / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light">
              {store.planos.map((plano, i) => (
                <tr key={i} className="hover:bg-brand-light/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-300">{plano.tarefa}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      plano.status === 'Alta' ? 'bg-red-500/10 text-red-500' :
                      plano.status === 'Média' ? 'bg-amber-500/10 text-amber-500' :
                      plano.status === 'Teste' ? 'bg-blue-500/10 text-blue-500' :
                      plano.status === 'Sucesso' ? 'bg-green-500/10 text-green-500' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {plano.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
