import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { calcRoi, formatBRL, FEE_MENSAL } from '../utils';
import { StoreDataV2 } from '../types';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

interface Props {
  store: StoreDataV2;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const roi = payload[0]?.value ?? 0;
    return (
      <div className="bg-brand-light border border-gray-800 p-3 rounded-lg shadow-xl">
        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-white">
          Vendas: {formatBRL(payload[0]?.payload?.vendas ?? 0)}
        </p>
        <p className="text-sm font-semibold" style={{ color: roi >= 0 ? '#22c55e' : '#ef4444' }}>
          ROI: {formatBRL(roi)} ({roi >= 0 ? '+' : ''}{((roi / FEE_MENSAL) * 100).toFixed(0)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function RoiPanel({ store }: Props) {
  const roi = calcRoi(store);

  const StatusIcon = roi.status === 'positivo' ? CheckCircle
                   : roi.status === 'negativo' ? XCircle
                   : MinusCircle;
  const statusColor = roi.status === 'positivo' ? '#22c55e'
                    : roi.status === 'negativo' ? '#ef4444'
                    : '#9ca3af';

  return (
    <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-brand-light flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-white mb-1 flex items-center gap-2">
            ROI do Projeto
            <StatusIcon className="w-4 h-4" style={{ color: statusColor }} />
          </h3>
          <p className="text-[10px] md:text-xs text-gray-500 max-w-[300px]">Fee mensal: {formatBRL(FEE_MENSAL)} · Vendas precisam superar o fee para ROI positivo</p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto bg-brand-light/20 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
          <p className="text-[10px] text-gray-400 md:text-gray-500 mb-0.5 md:mb-1 uppercase md:normal-case">Acumulado</p>
          <div className="flex items-baseline md:block gap-2">
            <p className="text-xl font-bold" style={{ color: statusColor }}>
              {formatBRL(roi.roiTotal)}
            </p>
            <p className="text-[10px] md:text-xs font-semibold" style={{ color: statusColor }}>
              {roi.roiTotalPct >= 0 ? '+' : ''}{roi.roiTotalPct.toFixed(0)}% s/ fee total
            </p>
          </div>
        </div>
      </div>

      {/* Resumo meses */}
      <div className="grid grid-cols-3 divide-x divide-brand-light border-b border-brand-light">
        <div className="p-3 md:p-4 text-center">
          <p className="text-[9px] md:text-xs text-gray-500 mb-1 uppercase tracking-wider">Altas</p>
          <p className="text-xl md:text-2xl font-bold text-green-500">{roi.mesesPositivos}</p>
        </div>
        <div className="p-3 md:p-4 text-center">
          <p className="text-[9px] md:text-xs text-gray-500 mb-1 uppercase tracking-wider">Baixas</p>
          <p className="text-xl md:text-2xl font-bold text-red-500">{roi.mesesNegativos}</p>
        </div>
        <div className="p-3 md:p-4 text-center">
          <p className="text-[9px] md:text-xs text-gray-500 mb-1 uppercase tracking-wider">Total</p>
          <p className="text-xl md:text-2xl font-bold text-white">{roi.meses.length}</p>
        </div>
      </div>

      {/* Gráfico ROI por mês */}
      <div className="p-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">ROI por mês (R$)</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roi.meses} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
              <XAxis
                dataKey="mesLabel"
                axisLine={false} tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={v => `${v >= 0 ? '' : '-'}R$${Math.abs(v / 1000).toFixed(0)}k`}
              />
              <ReferenceLine y={0} stroke="#3a3a50" strokeWidth={1.5} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                {roi.meses.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.positivo ? '#22c55e' : '#ef4444'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-gray-700 mt-2 text-center">
          Linha zero = fee mensal de {formatBRL(FEE_MENSAL)} · Barras verdes = mês pago ✓
        </p>
      </div>
    </div>
  );
}
