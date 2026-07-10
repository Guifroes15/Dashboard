import React, { useState } from 'react';
import { Wrench, Plus, Trash2, User, Calendar } from 'lucide-react';
import { StoreData, OtimizacaoItem } from '../../types';
import { addOtimizacao, deleteOtimizacao } from '../../services/groupService';

interface Props {
  store: StoreData;
  groupId: string;
  podeEditar: boolean; // master ou staff
  nome: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const hoje = () => new Date().toISOString().slice(0, 10);

function fmtData(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function OtimizacoesView({ store, groupId, podeEditar, nome }: Props) {
  const [data, setData] = useState(hoje());
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const otimizacoes = [...(store.otimizacoes ?? [])].sort((a, b) => b.data.localeCompare(a.data) || b.criadoEm.localeCompare(a.criadoEm));

  const handleAdd = async () => {
    if (!descricao.trim()) return;
    setSaving(true);
    setError('');
    const item: OtimizacaoItem = {
      id: uid(),
      data,
      descricao: descricao.trim(),
      autor: nome || 'Equipe Aure Digital',
      criadoEm: new Date().toISOString(),
    };
    try {
      await addOtimizacao(groupId, store.id, item);
      setDescricao('');
      setData(hoje());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteOtimizacao(groupId, store.id, itemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setConfirmingDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 text-brand-purple" />
        <h3 className="text-sm font-bold text-white">Histórico de Otimizações</h3>
        <span className="text-[10px] text-gray-600">{otimizacoes.length} registro{otimizacoes.length !== 1 ? 's' : ''}</span>
      </div>

      {podeEditar && (
        <div className="bg-brand-medium border border-brand-light rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-purple transition-colors shrink-0"
            />
            <input
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="O que foi otimizado? Ex: aumentei orçamento de R$50 pra R$80 na campanha de mensagem"
              className="flex-1 bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-purple transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={saving || !descricao.trim()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> {saving ? 'Salvando…' : 'Registrar'}
            </button>
          </div>
          {error && <p className="text-[10px] text-red-400">{error}</p>}
        </div>
      )}

      {otimizacoes.length === 0 ? (
        <p className="text-xs text-gray-700 text-center py-8 italic">
          Nenhuma otimização registrada ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {otimizacoes.map(item => (
            <div key={item.id} className="flex items-start gap-3 bg-brand-medium border border-brand-light rounded-xl p-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">{item.descricao}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtData(item.data)}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.autor}</span>
                </div>
              </div>
              {podeEditar && (
                confirmingDelete === item.id ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold transition-all cursor-pointer">Sim</button>
                    <button onClick={() => setConfirmingDelete(null)}
                      className="px-2 py-1 text-gray-400 hover:text-white rounded text-[9px] font-bold transition-all cursor-pointer">Não</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmingDelete(item.id)} title="Excluir"
                    className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
