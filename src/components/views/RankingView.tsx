import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { STORES } from '../../data';
import { calcRanking, RankingItem, formatBRL } from '../../utils';
import { Zap, Volume2, TrendingUp, AlertTriangle } from 'lucide-react';

const QUADRANT_CONFIG = {
  eficiente: {
    label: 'Eficiente',
    desc: 'Poucas mensagens, alta conversão — modelo ideal',
    color: '#22c55e',
    bg: 'rgba(34,197,94,.1)',
    Icon: Zap,
  },
  volume: {
    label: 'Alto volume',
    desc: 'Muitas mensagens, alta conversão — escalável',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,.1)',
    Icon: Volume2,
  },
  potencial: {
    label: 'Potencial',
    desc: 'Poucas mensagens, baixa conversão — aumentar volume',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,.1)',
    Icon: TrendingUp,
  },
  revisar: {
    label: 'Revisar',
    desc: 'Muitas mensagens, baixa conversão — revisar estratégia',
    color: '#ef4444',
    bg: 'rgba(239,68,68,.1)',
    Icon: AlertTriangle,
  },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d: RankingItem = payload[0].payload;
    const cfg = QUADRANT_CONFIG[d.quadrante];
    return (
      <div className="bg-brand-light border border-gray-800 p-3 rounded-lg shadow-xl min-w-[180px]">
        <p className="text-sm font-bold text-white mb-2">{d.storeName}</p>
        <p className="text-xs text-gray-400">Mensagens: <span className="text-white font-semibold">{d.mensagens}</span></p>
        <p className="text-xs text-gray-400">Conversão: <span className="text-white font-semibold">{d.conversao.toFixed(2)}%</span></p>
        <p className="text-xs text-gray-400">Vendas: <span className="text-white font-semibold">{formatBRL(d.vendas)}</span></p>
        <p className="text-xs text-gray-400">Eficiência: <span className="text-white font-semibold">{formatBRL(d.eficiencia)}/msg</span></p>
        <div className="mt-2 pt-2 border-t border-gray-800">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function RankingView() {
  const ranking = calcRanking(STORES);

  // Médias para linhas de referência
  const mediaMsgs = Math.round(ranking.reduce((a, r) => a + r.mensagens, 0) / ranking.length);
  const mediaConv = ranking.reduce((a, r) => a + r.conversao, 0) / ranking.length;

  const byQuadrante = {
    eficiente: ranking.filter(r => r.quadrante === 'eficiente'),
    volume: ranking.filter(r => r.quadrante === 'volume'),
    potencial: ranking.filter(r => r.quadrante === 'potencial'),
    revisar: ranking.filter(r => r.quadrante === 'revisar'),
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          Mensagens vs. Conversão
        </h1>
        <p className="text-xs md:text-sm text-gray-400 font-medium tracking-wide leading-relaxed">
          Qualidade vs. quantidade — onde está a eficiência real de cada loja
        </p>
      </header>

      {/* Quadrant summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {(Object.keys(QUADRANT_CONFIG) as (keyof typeof QUADRANT_CONFIG)[]).map(key => {
          const cfg = QUADRANT_CONFIG[key];
          const lojas = byQuadrante[key];
          return (
            <div
              key={key}
              className="rounded-xl p-5 border"
              style={{ background: cfg.bg, borderColor: `${cfg.color}30` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{lojas.length}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">{cfg.desc}</p>
              {lojas.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {lojas.map(l => (
                    <span
                      key={l.storeId}
                      className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: `${cfg.color}20`, color: cfg.color }}
                    >
                      {l.storeName.split(' ')[0]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scatter chart */}
      <div className="bg-brand-medium border border-brand-light rounded-xl p-4 md:p-6 mb-8">
        <h3 className="text-sm md:text-md font-bold text-white mb-1">Mapa de Eficiência</h3>
        <p className="text-[10px] md:text-xs text-gray-500 mb-6">
          Eixo X = volume de mensagens · Eixo Y = taxa de conversão (%) · Linhas = médias do grupo
        </p>
        <div className="h-[280px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" />
              <XAxis
                type="number" dataKey="mensagens" name="Mensagens"
                axisLine={false} tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 9 }}
                label={{ value: 'Mensagens', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 9 }}
              />
              <YAxis
                type="number" dataKey="conversao" name="Conversão"
                axisLine={false} tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 9 }}
                tickFormatter={v => `${v}%`}
                label={{ value: 'Conv.', angle: -90, position: 'insideLeft', offset: 10, fill: '#555', fontSize: 9 }}
              />
              <ReferenceLine x={mediaMsgs} stroke="#3a3a50" strokeDasharray="4 4" label={{ value: 'Média', fill: '#555', fontSize: 8 }} />
              <ReferenceLine y={mediaConv} stroke="#3a3a50" strokeDasharray="4 4" label={{ value: 'Média', fill: '#555', fontSize: 8 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={ranking} name="Lojas">
                {ranking.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 md:gap-3 mt-4 justify-center">
          {ranking.map(r => (
            <div key={r.storeId} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
              <span className="text-[9px] text-gray-500">{r.storeName.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking table */}
      <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-brand-light">
          <h3 className="text-sm md:text-md font-bold text-white">Ranking por Eficiência</h3>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1">Vendas geradas por mensagem enviada</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] md:min-w-0">
            <thead>
              <tr className="bg-brand-light/50">
                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">#</th>
                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Loja</th>
                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Mensagens</th>
                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Conv.</th>
                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Vendas</th>
                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">R$/msg</th>
                <th className="px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light">
              {ranking.map((item, i) => {
                const cfg = QUADRANT_CONFIG[item.quadrante];
                return (
                  <tr key={item.storeId} className="hover:bg-brand-light/20 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-600">#{i + 1}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-xs md:text-sm font-semibold text-gray-200">{item.storeName}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm text-gray-300">{item.mensagens}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-semibold" style={{ color: item.conversao >= mediaConv ? '#22c55e' : '#ef4444' }}>
                      {item.conversao.toFixed(1)}%
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm text-white font-semibold">{formatBRL(item.vendas)}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold" style={{ color: item.color }}>
                      {formatBRL(item.eficiencia)}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
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
