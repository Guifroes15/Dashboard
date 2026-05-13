import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { STORES, ultimoMes } from '../../data';
import { StatCard } from '../StatCard';
import { ChartContainer, CustomTooltip } from '../ChartWrapper';
import { DollarSign, Percent, MessageSquare, TrendingUp } from 'lucide-react';

export function ConsolidadoView() {
  // We use April 2026 as the primary comparison month as requested in the dataset
  const TARGET_KEY = '2026-04';
  const TARGET_LABEL = 'Abr/26';

  const chartDataVendas = STORES.map(store => {
    const targetMonth = store.historico.find(m => m.chave === TARGET_KEY);
    return {
      name: store.name,
      vendas: targetMonth?.vendas || 0,
      color: store.color
    };
  }).filter(d => d.vendas > 0).sort((a, b) => b.vendas - a.vendas);

  const chartDataConversion = STORES.map(store => {
    const targetMonth = store.historico.find(m => m.chave === TARGET_KEY);
    return {
      subject: store.name,
      value: targetMonth?.conversao || 0,
      fullMark: 30,
    };
  }).filter(d => d.value > 0);

  // Aggregated monthly evolution
  const allMonths = Array.from(new Set(STORES.flatMap(s => s.historico.map(m => m.chave)))).sort();
  const chartDataEvolution = allMonths.map(key => {
    const monthLabel = STORES.flatMap(s => s.historico).find(m => m.chave === key)?.mes || key;
    const data: any = { name: monthLabel };
    STORES.forEach(store => {
      const entry = store.historico.find(m => m.chave === key);
      if (entry && entry.vendas > 0) data[store.name] = entry.vendas;
    });
    return data;
  });

  const chartDataMessages = STORES.map(store => {
    const targetMonth = store.historico.find(m => m.chave === TARGET_KEY);
    return {
      name: store.name,
      value: targetMonth?.mensagens || 0,
      color: store.color
    };
  }).filter(d => d.value > 0);

  const totalVendasTarget = STORES.reduce((acc, s) => acc + (s.historico.find(m => m.chave === TARGET_KEY)?.vendas || 0), 0);
  const totalFatLojaTarget = STORES.reduce((acc, s) => acc + (s.historico.find(m => m.chave === TARGET_KEY)?.faturamentoLoja || 0), 0);
  const storesInTarget = STORES.filter(s => (s.historico.find(m => m.chave === TARGET_KEY)?.conversao || 0) > 0);
  const avgConversaoTarget = storesInTarget.length > 0 
    ? STORES.reduce((acc, s) => acc + (s.historico.find(m => m.chave === TARGET_KEY)?.conversao || 0), 0) / storesInTarget.length 
    : 0;
  const totalMsgTarget = STORES.reduce((acc, s) => acc + (s.historico.find(m => m.chave === TARGET_KEY)?.mensagens || 0), 0);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Consolidado</h1>
        <p className="text-xs md:text-sm text-gray-400 font-medium tracking-wide">Foco em {TARGET_LABEL} | Grupo Yamcol</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-brand-purple">
        <StatCard label={`Vendas (${TARGET_LABEL})`} value={`R$ ${totalVendasTarget.toLocaleString('pt-BR')}`} subtext="Todas as lojas" icon={DollarSign} />
        <StatCard label={`Fat. Loja (${TARGET_LABEL})`} value={`R$ ${totalFatLojaTarget.toLocaleString('pt-BR')}`} subtext="Total faturado no shopping" icon={TrendingUp} />
        <StatCard label={`Conversão Médiva (${TARGET_LABEL})`} value={`${avgConversaoTarget.toFixed(2)}%`} subtext="Média entre lojas ativas" icon={Percent} />
        <StatCard label={`Volume Mensagens (${TARGET_LABEL})`} value={totalMsgTarget.toLocaleString('pt-BR')} subtext="Total do período" icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-10">
        <ChartContainer title={`Vendas por Loja (R$ - ${TARGET_LABEL})`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataVendas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 9 }} 
                width={80} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="vendas" radius={[0, 4, 4, 0]}>
                 {chartDataVendas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title={`Radar de Conversão (% - ${TARGET_LABEL})`}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartDataConversion}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} axisLine={false} />
              <Radar name="Conversão" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <ChartContainer title="Evolução de Vendas (Histórico Completo)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDataEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingBottom: '10px' }} />
              {STORES.map((store) => (
                <Line 
                  key={store.id} 
                  type="monotone" 
                  dataKey={store.name} 
                  stroke={store.color} 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: store.color, strokeWidth: 1, stroke: '#070709' }} 
                  activeDot={{ r: 5, strokeWidth: 0 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title={`Volume de Mensagens (${TARGET_LABEL})`}>
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
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
