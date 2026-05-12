import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { STORES } from '../../data';
import { StatCard } from '../StatCard';
import { ChartContainer, CustomTooltip } from '../ChartWrapper';
import { DollarSign, Percent, MessageSquare, TrendingUp } from 'lucide-react';

export function ConsolidadoView() {
  const chartDataVendas = STORES.map(store => ({
    name: store.name,
    vendas: store.vendas.abr,
    color: store.color
  }));

  const chartDataConversion = STORES.map(store => ({
    subject: store.name,
    value: store.conversao.abr,
    fullMark: 100,
  }));

  const months = ['jan', 'fev', 'mar', 'abr'] as const;
  const chartDataEvolution = months.map(m => ({
    name: m.toUpperCase(),
    ...STORES.reduce((acc, store) => ({ ...acc, [store.name]: store.vendas[m] }), {})
  }));

  const chartDataMessages = STORES.map(store => ({
    name: store.name,
    value: store.mensagens.abr,
    color: store.color
  }));

  const totalVendasAbr = STORES.reduce((acc, s) => acc + s.vendas.abr, 0);
  const totalFaturamentoAbr = STORES.reduce((acc, s) => acc + s.faturamentoLoja.abr, 0);
  const avgConversaoAbr = STORES.reduce((acc, s) => acc + s.conversao.abr, 0) / STORES.length;
  const totalMensagensAbr = STORES.reduce((acc, s) => acc + s.mensagens.abr, 0);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Consolidado</h1>
        <p className="text-gray-400 font-medium tracking-wide">Janeiro — Abril 2026 | Grupo Yamcol</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-brand-purple">
        <StatCard label="Total de Vendas (Abr)" value={`R$ ${totalVendasAbr.toLocaleString('pt-BR')}`} subtext="Todas as lojas" icon={DollarSign} />
        <StatCard label="Faturamento Loja (Abr)" value={`R$ ${totalFaturamentoAbr.toLocaleString('pt-BR')}`} subtext="Total faturado no período" icon={TrendingUp} />
        <StatCard label="Conversão Média (Abr)" value={`${avgConversaoAbr.toFixed(2)}%`} subtext="Média global" icon={Percent} />
        <StatCard label="Volume Mensagens (Abr)" value={totalMensagensAbr.toLocaleString('pt-BR')} subtext="Total período" icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartContainer title="Vendas por Loja (R$ - Abril)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataVendas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="vendas" radius={[0, 4, 4, 0]}>
                 {chartDataVendas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Conversão por Loja (% - Abril)">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartDataConversion}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} axisLine={false} />
              <Radar name="Conversão" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Evolução de Vendas (Jan—Abr)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDataEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" tick={{ fill: '#9ca3af' }} />
              {STORES.map((store) => (
                <Line key={store.id} type="monotone" dataKey={store.name} stroke={store.color} strokeWidth={3} dot={{ r: 4, fill: store.color, strokeWidth: 2, stroke: '#070709' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Volume de Mensagens (Abril)">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartDataMessages}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartDataMessages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
