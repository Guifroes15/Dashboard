import React, { useState } from 'react';
import { CalendarClock, AlertTriangle, Clock, CheckCircle2, HelpCircle, Plus } from 'lucide-react';
import { GroupData } from '../../types';
import { addReuniao } from '../../services/groupService';

interface Props {
  groups: GroupData[];
  nome: string;
}

const CADENCIA_DIAS = 14;

type Status = 'nunca' | 'atrasada' | 'essa-semana' | 'em-dia';

interface AgendaItem {
  storeId: string;
  storeName: string;
  storeColor: string;
  groupId: string;
  groupName: string;
  ultimaReuniao: string | null;
  proximaPrevista: string | null;
  diasAtraso: number;
  status: Status;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType; prioridade: number }> = {
  nunca:         { label: 'Nunca reunido',   color: '#a855f7', bg: 'rgba(168,85,247,.1)', icon: HelpCircle,    prioridade: 0 },
  atrasada:      { label: 'Atrasada',        color: '#ef4444', bg: 'rgba(239,68,68,.1)',  icon: AlertTriangle, prioridade: 1 },
  'essa-semana': { label: 'Essa semana',     color: '#f59e0b', bg: 'rgba(245,158,11,.1)', icon: Clock,         prioridade: 2 },
  'em-dia':      { label: 'Em dia',          color: '#22c55e', bg: 'rgba(34,197,94,.1)',  icon: CheckCircle2,  prioridade: 3 },
};

const fmtData = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const hojeISO = () => new Date().toISOString().slice(0, 10);

function computeItem(groupId: string, groupName: string, store: { id: string; name: string; color: string; reunioes?: { data: string }[] }): AgendaItem {
  const reunioes = store.reunioes ?? [];
  const base = { storeId: store.id, storeName: store.name, storeColor: store.color, groupId, groupName };

  if (reunioes.length === 0) {
    return { ...base, ultimaReuniao: null, proximaPrevista: null, diasAtraso: Infinity, status: 'nunca' };
  }

  const ultima = [...reunioes].sort((a, b) => b.data.localeCompare(a.data))[0].data;
  const proxima = new Date(ultima + 'T12:00:00');
  proxima.setDate(proxima.getDate() + CADENCIA_DIAS);
  const proximaISO = proxima.toISOString().slice(0, 10);

  const hoje = new Date(); hoje.setHours(12, 0, 0, 0);
  const diasAtraso = Math.floor((hoje.getTime() - proxima.getTime()) / 86_400_000);
  const status: Status = diasAtraso > 0 ? 'atrasada' : diasAtraso >= -7 ? 'essa-semana' : 'em-dia';

  return { ...base, ultimaReuniao: ultima, proximaPrevista: proximaISO, diasAtraso, status };
}

export function AgendaView({ groups, nome }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customData, setCustomData] = useState(hojeISO());
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const itens = groups
    .flatMap(g => g.stores.map(s => computeItem(g.id, g.name, s)))
    .sort((a, b) => {
      const p = STATUS_CONFIG[a.status].prioridade - STATUS_CONFIG[b.status].prioridade;
      if (p !== 0) return p;
      return (b.diasAtraso === Infinity ? 0 : b.diasAtraso) - (a.diasAtraso === Infinity ? 0 : a.diasAtraso);
    });

  const contagem = {
    atrasada: itens.filter(i => i.status === 'atrasada').length,
    nunca: itens.filter(i => i.status === 'nunca').length,
    essaSemana: itens.filter(i => i.status === 'essa-semana').length,
    emDia: itens.filter(i => i.status === 'em-dia').length,
  };

  const marcarHoje = async (item: AgendaItem) => {
    setSaving(true);
    setError('');
    try {
      await addReuniao(item.groupId, item.storeId, {
        id: Math.random().toString(36).slice(2, 10),
        data: hojeISO(),
        autor: nome || 'Equipe Aure Digital',
        criadoEm: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    } finally {
      setSaving(false);
    }
  };

  const salvarCustom = async (item: AgendaItem) => {
    setSaving(true);
    setError('');
    try {
      await addReuniao(item.groupId, item.storeId, {
        id: Math.random().toString(36).slice(2, 10),
        data: customData,
        observacao: observacao.trim() || undefined,
        autor: nome || 'Equipe Aure Digital',
        criadoEm: new Date().toISOString(),
      });
      setExpandedId(null);
      setObservacao('');
      setCustomData(hojeISO());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-brand-purple" /> Agenda
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Acompanhamentos quinzenais — controle de quem já foi visto e quem está na fila.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          ['atrasada', contagem.atrasada],
          ['nunca', contagem.nunca],
          ['essa-semana', contagem.essaSemana],
          ['em-dia', contagem.emDia],
        ] as [Status, number][]).map(([status, n]) => (
          <div key={status} className="bg-brand-medium border border-brand-light rounded-xl p-3.5">
            <p className="text-xl font-bold" style={{ color: STATUS_CONFIG[status].color }}>{n}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">{STATUS_CONFIG[status].label}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-2">
        {itens.map(item => {
          const cfg = STATUS_CONFIG[item.status];
          const expanded = expandedId === item.storeId;
          return (
            <div key={item.storeId} className="bg-brand-medium border border-brand-light rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.storeColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.storeName}</p>
                  <p className="text-[10px] text-gray-600">
                    {item.groupName}
                    {item.ultimaReuniao && ` · última: ${fmtData(item.ultimaReuniao)}`}
                    {item.proximaPrevista && ` · prevista: ${fmtData(item.proximaPrevista)}`}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                  <cfg.icon className="w-3 h-3" />
                  {item.status === 'atrasada' ? `${item.diasAtraso}d atrasada` : cfg.label}
                </span>
                <button onClick={() => marcarHoje(item)} disabled={saving}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-brand-purple text-white hover:bg-brand-purple/90 transition-all disabled:opacity-40 cursor-pointer shrink-0">
                  Feita hoje
                </button>
                <button onClick={() => setExpandedId(expanded ? null : item.storeId)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-brand-light transition-colors cursor-pointer shrink-0">
                  <Plus className={`w-4 h-4 transition-transform ${expanded ? 'rotate-45' : ''}`} />
                </button>
              </div>

              {expanded && (
                <div className="mt-3 pt-3 border-t border-brand-light flex flex-col sm:flex-row gap-2">
                  <input type="date" value={customData} onChange={e => setCustomData(e.target.value)}
                    className="bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-purple transition-colors shrink-0" />
                  <input value={observacao} onChange={e => setObservacao(e.target.value)}
                    placeholder="Observação (opcional)"
                    className="flex-1 bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-purple transition-colors" />
                  <button onClick={() => salvarCustom(item)} disabled={saving}
                    className="px-4 py-2 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all disabled:opacity-40 cursor-pointer shrink-0">
                    Salvar
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {itens.length === 0 && (
          <p className="text-xs text-gray-700 text-center py-12 italic">Nenhuma loja pra acompanhar ainda.</p>
        )}
      </div>
    </div>
  );
}
