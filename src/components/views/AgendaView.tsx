import React, { useState } from 'react';
import {
  CalendarClock, AlertTriangle, Clock, CalendarDays, CheckCircle2, HelpCircle,
  Plus, Pencil, Trash2, Check, X,
} from 'lucide-react';
import { GroupData, ReuniaoItem } from '../../types';
import { addReuniao, deleteReuniao, updateReuniao } from '../../services/groupService';

interface Props {
  groups: GroupData[];
  nome: string;
}

const CADENCIA_DIAS = 14;

type Status = 'nunca' | 'atrasada' | 'essa-semana' | 'proxima-semana' | 'em-dia';

interface AgendaItem {
  storeId: string;
  storeName: string;
  storeColor: string;
  groupId: string;
  groupName: string;
  reunioes: ReuniaoItem[];
  ultimaReuniao: string | null;
  proximaPrevista: string | null;
  diasAtraso: number;
  status: Status;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType; prioridade: number }> = {
  nunca:            { label: 'Nunca reunido',   color: '#a855f7', bg: 'rgba(168,85,247,.1)', icon: HelpCircle,    prioridade: 0 },
  atrasada:         { label: 'Atrasada',        color: '#ef4444', bg: 'rgba(239,68,68,.1)',  icon: AlertTriangle, prioridade: 1 },
  'essa-semana':    { label: 'Essa semana',     color: '#f59e0b', bg: 'rgba(245,158,11,.1)', icon: Clock,         prioridade: 2 },
  'proxima-semana': { label: 'Semana que vem',  color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: Clock,         prioridade: 3 },
  'em-dia':         { label: 'Em dia',          color: '#22c55e', bg: 'rgba(34,197,94,.1)',  icon: CheckCircle2,  prioridade: 4 },
};

const fmtData = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const fmtDiaSemana = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const hojeISO = () => new Date().toISOString().slice(0, 10);
const addDias = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function computeItem(groupId: string, groupName: string, store: { id: string; name: string; color: string; reunioes?: ReuniaoItem[] }): AgendaItem {
  const reunioes = [...(store.reunioes ?? [])].sort((a, b) => b.data.localeCompare(a.data));
  const base = { storeId: store.id, storeName: store.name, storeColor: store.color, groupId, groupName, reunioes };

  if (reunioes.length === 0) {
    return { ...base, ultimaReuniao: null, proximaPrevista: null, diasAtraso: Infinity, status: 'nunca' };
  }

  const ultima = reunioes[0].data;
  const proximaISO = addDias(ultima, CADENCIA_DIAS);

  const diasAtraso = Math.floor((new Date(hojeISO() + 'T12:00:00').getTime() - new Date(proximaISO + 'T12:00:00').getTime()) / 86_400_000);
  const status: Status =
    diasAtraso > 0 ? 'atrasada' :
    diasAtraso >= -7 ? 'essa-semana' :
    diasAtraso >= -14 ? 'proxima-semana' :
    'em-dia';

  return { ...base, ultimaReuniao: ultima, proximaPrevista: proximaISO, diasAtraso, status };
}

export function AgendaView({ groups, nome }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customData, setCustomData] = useState(hojeISO());
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ storeId: string; itemId: string; data: string; observacao: string } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

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
    proximaSemana: itens.filter(i => i.status === 'proxima-semana').length,
    emDia: itens.filter(i => i.status === 'em-dia').length,
  };

  // Calendário das próximas 2 semanas — agrupa por dia previsto
  const hoje = hojeISO();
  const fimJanela = addDias(hoje, 14);
  const porDia = new Map<string, AgendaItem[]>();
  for (const item of itens) {
    if (!item.proximaPrevista) continue;
    if (item.proximaPrevista > fimJanela) continue; // fora da janela de 2 semanas
    const chave = item.proximaPrevista < hoje ? hoje : item.proximaPrevista; // atrasadas aparecem em "hoje"
    porDia.set(chave, [...(porDia.get(chave) ?? []), item]);
  }
  const diasCalendario = [...porDia.keys()].sort();

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
        observacao: observacao.trim(),
        autor: nome || 'Equipe Aure Digital',
        criadoEm: new Date().toISOString(),
      });
      setObservacao('');
      setCustomData(hojeISO());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    } finally {
      setSaving(false);
    }
  };

  const salvarEdicao = async (item: AgendaItem) => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      await updateReuniao(item.groupId, item.storeId, editing.itemId, {
        data: editing.data,
        observacao: editing.observacao.trim(),
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const excluir = async (item: AgendaItem, itemId: string) => {
    try {
      await deleteReuniao(item.groupId, item.storeId, itemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setConfirmingDelete(null);
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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {([
          ['atrasada', contagem.atrasada],
          ['nunca', contagem.nunca],
          ['essa-semana', contagem.essaSemana],
          ['proxima-semana', contagem.proximaSemana],
          ['em-dia', contagem.emDia],
        ] as [Status, number][]).map(([status, n]) => (
          <div key={status} className="bg-brand-medium border border-brand-light rounded-xl p-3.5">
            <p className="text-xl font-bold" style={{ color: STATUS_CONFIG[status].color }}>{n}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">{STATUS_CONFIG[status].label}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Calendário — próximas 2 semanas */}
      {diasCalendario.length > 0 && (
        <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-brand-purple" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">Calendário — próximas 2 semanas</p>
          </div>
          <div className="space-y-3">
            {diasCalendario.map(dia => (
              <div key={dia} className="flex gap-3">
                <div className="w-16 shrink-0">
                  <p className={`text-[10px] font-bold uppercase ${dia === hoje ? 'text-red-400' : 'text-gray-500'}`}>
                    {dia === hoje ? 'Hoje/atrasadas' : fmtDiaSemana(dia)}
                  </p>
                </div>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {porDia.get(dia)!.map(item => (
                    <span key={item.storeId} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-dark/40 border border-white/5 text-[11px] text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.storeColor }} />
                      {item.storeName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <button onClick={() => { setExpandedId(expanded ? null : item.storeId); setEditing(null); }}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-brand-light transition-colors cursor-pointer shrink-0">
                  <Plus className={`w-4 h-4 transition-transform ${expanded ? 'rotate-45' : ''}`} />
                </button>
              </div>

              {expanded && (
                <div className="mt-3 pt-3 border-t border-brand-light space-y-3">
                  {/* Adicionar registro (retroativo ou futuro) */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" value={customData} onChange={e => setCustomData(e.target.value)}
                      className="bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-purple transition-colors shrink-0" />
                    <input value={observacao} onChange={e => setObservacao(e.target.value)}
                      placeholder="Observação (opcional)"
                      className="flex-1 bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-purple transition-colors" />
                    <button onClick={() => salvarCustom(item)} disabled={saving}
                      className="px-4 py-2 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all disabled:opacity-40 cursor-pointer shrink-0">
                      Registrar
                    </button>
                  </div>

                  {/* Histórico — editável */}
                  {item.reunioes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Histórico</p>
                      {item.reunioes.map(r => {
                        const isEditing = editing?.storeId === item.storeId && editing.itemId === r.id;
                        return (
                          <div key={r.id} className="flex items-center gap-2 bg-brand-dark/30 rounded-lg px-3 py-2">
                            {isEditing ? (
                              <>
                                <input type="date" value={editing.data} onChange={e => setEditing({ ...editing, data: e.target.value })}
                                  className="bg-brand-dark border border-brand-purple rounded-lg px-2 py-1 text-[11px] text-white outline-none shrink-0" />
                                <input value={editing.observacao} onChange={e => setEditing({ ...editing, observacao: e.target.value })}
                                  placeholder="Observação"
                                  className="flex-1 bg-brand-dark border border-brand-purple rounded-lg px-2 py-1 text-[11px] text-white placeholder-gray-600 outline-none" />
                                <button onClick={() => salvarEdicao(item)} disabled={saving} className="p-1 text-green-400 hover:text-green-300 cursor-pointer shrink-0"><Check className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setEditing(null)} className="p-1 text-gray-500 hover:text-white cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                              </>
                            ) : (
                              <>
                                <span className="text-[11px] font-semibold text-gray-300 shrink-0">{fmtData(r.data)}</span>
                                <span className="flex-1 text-[11px] text-gray-500 truncate">{r.observacao || '—'}</span>
                                <button onClick={() => setEditing({ storeId: item.storeId, itemId: r.id, data: r.data, observacao: r.observacao ?? '' })}
                                  className="p-1 text-gray-600 hover:text-white cursor-pointer shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                                {confirmingDelete === r.id ? (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => excluir(item, r.id)} className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold cursor-pointer">Sim</button>
                                    <button onClick={() => setConfirmingDelete(null)} className="px-1.5 py-0.5 text-gray-400 hover:text-white rounded text-[9px] font-bold cursor-pointer">Não</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmingDelete(r.id)} className="p-1 text-gray-600 hover:text-red-400 cursor-pointer shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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
