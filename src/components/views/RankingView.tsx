// components/views/RankingView.tsx — visual claro e direto
import React, { useState } from 'react';
import { STORES } from '../../data';
import { calcRanking, RankingItem, formatBRL } from '../../utils';
import { Zap, Volume2, TrendingUp, AlertTriangle, Info } from 'lucide-react';

// ─── Configuração dos quadrantes ───────────────────────────────────────────
const Q = {
  eficiente: {
    label: 'Eficiente',
    desc: 'Envia poucas mensagens e converte bem. Modelo ideal — escalar com cuidado.',
    badge: 'bg-green-500/15 text-green-400 border border-green-500/25',
    bar:   '#22c55e',
    Icon:  Zap,
  },
  volume: {
    label: 'Alto volume',
    desc: 'Envia muitas mensagens e converte bem. Estratégia escalável.',
    badge: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
    bar:   '#7c3aed',
    Icon:  Volume2,
  },
  potencial: {
    label: 'Potencial',
    desc: 'Envia poucas mensagens e converte pouco. Aumentar volume pode mudar o resultado.',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    bar:   '#f59e0b',
    Icon:  TrendingUp,
  },
  revisar: {
    label: 'Revisar',
    desc: 'Envia muitas mensagens mas converte pouco. Revisar segmentação e conteúdo.',
    badge: 'bg-red-500/15 text-red-400 border border-red-500/25',
    bar:   '#ef4444',
    Icon:  AlertTriangle,
  },
};

type QKey = keyof typeof Q;

// ─── Tooltip de explicação ──────────────────────────────────────────────────
function QuadrantTooltip({ qkey }: { qkey: QKey }) {
  const [show, setShow] = useState(false);
  const cfg = Q[qkey];
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="ml-1.5 opacity-40 hover:opacity-80 transition-opacity"
      >
        <Info className="w-3.5 h-3.5 inline" style={{ color: cfg.bar }} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-6 left-0 w-56 p-3 rounded-xl text-xs text-gray-300 leading-relaxed shadow-2xl"
          style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          {cfg.desc}
        </div>
      )}
    </div>
  );
}

// ─── Card de quadrante ───────────────────────────────────────────────────────
function QuadrantCard({ qkey, items }: { qkey: QKey; items: RankingItem[] }) {
  const cfg = Q[qkey];
  return (
    <div className="rounded-xl p-4 border" style={{ background: `${cfg.bar}0d`, borderColor: `${cfg.bar}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <cfg.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.bar }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.bar }}>
          {cfg.label}
        </span>
        <QuadrantTooltip qkey={qkey} />
      </div>
      <p className="text-2xl font-bold text-white mb-3">{items.length}</p>
      {items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map(l => (
            <div key={l.storeId} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="text-[10px] text-gray-400 truncate">{l.storeName}</span>
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: cfg.bar }}>
                {formatBRL(l.eficiencia)}/msg
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-gray-700">Nenhuma loja</p>
      )}
    </div>
  );
}

// ─── Barra de eficiência visual ──────────────────────────────────────────────
function EficienciaBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-brand-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold w-16 text-right shrink-0" style={{ color }}>
        {formatBRL(value)}/msg
      </span>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export function RankingView() {
  const ranking = calcRanking(STORES);
  const maxEfic = Math.max(...ranking.map(r => r.eficiencia));
  const mediaConv = ranking.reduce((a, r) => a + r.conversao, 0) / ranking.length;

  const byQ: Record<QKey, RankingItem[]> = {
    eficiente: ranking.filter(r => r.quadrante === 'eficiente'),
    volume:    ranking.filter(r => r.quadrante === 'volume'),
    potencial: ranking.filter(r => r.quadrante === 'potencial'),
    revisar:   ranking.filter(r => r.quadrante === 'revisar'),
  };

  return (
    <div className="animate-in fade-in duration-500">

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-1">
          Mensagens vs. Conversão
        </h1>
        <p className="text-xs lg:text-sm text-gray-500">
          Qualidade vs. quantidade — onde está a eficiência de cada loja no último mês registrado
        </p>
      </header>

      {/* Legenda dos quadrantes */}
      <div className="bg-brand-medium border border-brand-light rounded-xl p-4 mb-6">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
          Como interpretar
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.keys(Q) as QKey[]).map(key => {
            const cfg = Q[key];
            return (
              <div key={key} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${cfg.bar}20` }}>
                  <cfg.Icon className="w-3 h-3" style={{ color: cfg.bar }} />
                </div>
                <div>
                  <span className="text-xs font-bold" style={{ color: cfg.bar }}>{cfg.label}</span>
                  <p className="text-[10px] text-gray-600 leading-snug">{cfg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quadrant cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {(Object.keys(Q) as QKey[]).map(key => (
          <QuadrantCard key={key} qkey={key} items={byQ[key]} />
        ))}
      </div>

      {/* Ranking principal — cards mobile, tabela desktop */}
      <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-brand-light flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Ranking de Eficiência</h3>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Ordenado por R$ gerado por mensagem enviada · Último mês com dados
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-0.5">Média conversão</p>
            <p className="text-sm font-bold text-white">{mediaConv.toFixed(1)}%</p>
          </div>
        </div>

        {/* MOBILE — cards expandidos */}
        <div className="block lg:hidden divide-y divide-brand-light">
          {ranking.map((item, i) => {
            const cfg = Q[item.quadrante as QKey];
            const acimaDaMedia = item.conversao >= mediaConv;
            return (
              <div key={item.storeId} className="p-4">
                {/* Linha 1: posição + nome + quadrante */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-600 w-5">#{i + 1}</span>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-sm font-semibold text-white flex-1">{item.storeName}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Linha 2: métricas em 3 colunas */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-brand-light rounded-lg p-2 text-center">
                    <p className="text-[8px] text-gray-600 mb-1 uppercase tracking-wider">Mensagens</p>
                    <p className="text-xs font-bold text-white">{item.mensagens}</p>
                  </div>
                  <div className="bg-brand-light rounded-lg p-2 text-center">
                    <p className="text-[8px] text-gray-600 mb-1 uppercase tracking-wider">Conversão</p>
                    <p className="text-xs font-bold" style={{ color: acimaDaMedia ? '#22c55e' : '#ef4444' }}>
                      {item.conversao.toFixed(1)}%
                      <span className="text-[8px] ml-0.5 opacity-60">
                        {acimaDaMedia ? '↑' : '↓'}
                      </span>
                    </p>
                  </div>
                  <div className="bg-brand-light rounded-lg p-2 text-center">
                    <p className="text-[8px] text-gray-600 mb-1 uppercase tracking-wider">Vendas</p>
                    <p className="text-xs font-bold text-white">{formatBRL(item.vendas)}</p>
                  </div>
                </div>

                {/* Linha 3: barra de eficiência */}
                <div className="space-y-1">
                  <p className="text-[8px] text-gray-600 uppercase tracking-wider">Eficiência (R$/msg)</p>
                  <EficienciaBar value={item.eficiencia} max={maxEfic} color={cfg.bar} />
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP — tabela limpa */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest w-10">#</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Loja</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Msgs</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Conversão</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right">Vendas</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest w-52">Eficiência (R$/msg)</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Quadrante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light">
              {ranking.map((item, i) => {
                const cfg = Q[item.quadrante as QKey];
                const acimaDaMedia = item.conversao >= mediaConv;
                return (
                  <tr key={item.storeId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">#{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                        <span className="text-sm font-semibold text-gray-200">{item.storeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-400 font-medium">{item.mensagens}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span
                          className="text-sm font-bold"
                          style={{ color: acimaDaMedia ? '#22c55e' : '#ef4444' }}
                        >
                          {item.conversao.toFixed(1)}%
                        </span>
                        <span className="text-[10px]" style={{ color: acimaDaMedia ? '#22c55e' : '#ef4444' }}>
                          {acimaDaMedia ? '↑' : '↓'}
                        </span>
                        <span className="text-[9px] text-gray-700 ml-0.5">
                          {acimaDaMedia ? 'acima' : 'abaixo'} da média
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">{formatBRL(item.vendas)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <EficienciaBar value={item.eficiencia} max={maxEfic} color={cfg.bar} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Nota de rodapé explicativa */}
          <div className="px-6 py-4 border-t border-brand-light flex flex-wrap gap-4 items-center">
            <p className="text-[10px] text-gray-700">
              ↑ / ↓ = conversão acima ou abaixo da média do grupo ({mediaConv.toFixed(1)}%)
            </p>
            <p className="text-[10px] text-gray-700">
              Barra = eficiência proporcional à maior do grupo ({formatBRL(maxEfic)}/msg — Osklen PVH)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
