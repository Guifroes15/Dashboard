import React, { useEffect, useState } from 'react';
import { UserPlus, Trash2, CheckCircle2, Rocket, AlertCircle } from 'lucide-react';
import { GroupData } from '../../types';
import {
  OnboardingClient, subscribeToOnboarding, addOnboardingClient,
  deleteOnboardingClient, concludeOnboarding, slugify,
} from '../../services/onboardingService';

interface Props { groups: GroupData[] }

const PALETA = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7', '#ef4444'];
const uid = () => Math.random().toString(36).slice(2, 10);

const empty = { nome: '', metaAccountId: '', grupoExistente: '', observacoes: '' };

export function OnboardingView({ groups }: Props) {
  const [clients, setClients] = useState<OnboardingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [concluindoId, setConcluindoId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToOnboarding(
      (data) => { setClients(data); setLoading(false); },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const pendentes = clients.filter(c => c.status === 'pendente');
  const concluidos = clients.filter(c => c.status === 'concluido');

  const handleAdd = async () => {
    if (!form.nome.trim()) return;
    setSaving(true);
    setError('');
    try {
      await addOnboardingClient({
        id: uid(),
        nome: form.nome.trim(),
        cor: PALETA[pendentes.length % PALETA.length],
        metaAccountId: form.metaAccountId.trim() || undefined,
        grupoExistente: form.grupoExistente || undefined,
        observacoes: form.observacoes.trim() || undefined,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
      });
      setForm(empty);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar');
    } finally {
      setSaving(false);
    }
  };

  const handleConcluir = async (client: OnboardingClient) => {
    setConcluindoId(client.id);
    setError('');
    try {
      await concludeOnboarding(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao concluir onboarding');
    } finally {
      setConcluindoId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteOnboardingClient(id); } catch { /* ignora */ }
    setConfirmingDelete(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Rocket className="w-6 h-6 text-brand-purple" /> Onboarding
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Clientes que ainda vão começar. Ao concluir, o painel é criado automaticamente no dashboard.
        </p>
      </div>

      {/* Formulário de novo cliente */}
      <div className="bg-brand-medium border border-brand-light rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="w-4 h-4 text-brand-purple" />
          <p className="text-xs font-bold text-white uppercase tracking-wider">Adicionar cliente em onboarding</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            placeholder="Nome do cliente/loja"
            className="bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-purple transition-colors"
          />
          <input
            value={form.metaAccountId}
            onChange={e => setForm(f => ({ ...f, metaAccountId: e.target.value }))}
            placeholder="ID da conta Meta (act_XXXXXXXXXX)"
            className="bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-purple transition-colors"
          />
          <select
            value={form.grupoExistente}
            onChange={e => setForm(f => ({ ...f, grupoExistente: e.target.value }))}
            className="bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-purple transition-colors appearance-none cursor-pointer"
          >
            <option value="">Cliente avulso (vira grupo próprio)</option>
            {groups.map(g => <option key={g.id} value={g.id}>Anexar ao grupo: {g.name}</option>)}
          </select>
          <input
            value={form.observacoes}
            onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
            placeholder="Observações (opcional)"
            className="bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-purple transition-colors"
          />
        </div>
        {form.nome.trim() && (
          <p className="text-[10px] text-gray-600">ID da loja/grupo que será criado: <span className="text-gray-400 font-mono">{slugify(form.nome)}</span></p>
        )}
        <button
          onClick={handleAdd}
          disabled={saving || !form.nome.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" /> {saving ? 'Adicionando…' : 'Adicionar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Lista de pendentes */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Em onboarding ({pendentes.length})</p>
        {loading && <p className="text-xs text-gray-700 italic py-4">Carregando…</p>}
        {!loading && pendentes.length === 0 && (
          <p className="text-xs text-gray-700 text-center py-8 italic">Nenhum cliente em onboarding no momento.</p>
        )}
        {pendentes.map(client => (
          <div key={client.id} className="bg-brand-medium border border-brand-light rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ background: client.cor }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{client.nome}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {client.grupoExistente ? `Vai entrar em: ${groups.find(g => g.id === client.grupoExistente)?.name ?? client.grupoExistente}` : 'Vai virar grupo próprio'}
                  {client.metaAccountId && ` · ${client.metaAccountId}`}
                </p>
                {client.observacoes && <p className="text-xs text-gray-500 mt-1.5">{client.observacoes}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleConcluir(client)}
                  disabled={concluindoId === client.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-bold hover:bg-green-700 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {concluindoId === client.id ? 'Criando painel…' : 'Concluir'}
                </button>
                {confirmingDelete === client.id ? (
                  <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                    <button onClick={() => handleDelete(client.id)} className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold cursor-pointer">Sim</button>
                    <button onClick={() => setConfirmingDelete(null)} className="px-1.5 py-0.5 text-gray-400 hover:text-white rounded text-[9px] font-bold cursor-pointer">Não</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmingDelete(client.id)} title="Remover"
                    className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Concluídos recentemente */}
      {concluidos.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Concluídos ({concluidos.length})</p>
          <div className="flex flex-wrap gap-2">
            {concluidos.map(c => (
              <span key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-dark/30 border border-white/5 text-[11px] text-gray-500">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> {c.nome}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
