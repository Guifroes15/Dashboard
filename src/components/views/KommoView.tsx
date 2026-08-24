import React from 'react';
import { RefreshCw, MessageCircle, Trophy, Clock, AlertCircle } from 'lucide-react';
import { GroupData } from '../../types';
import { useKommoOverview, KommoStoreOverview } from '../../hooks/useKommoOverview';
import { KOMMO_STORES } from '../../config/kommoStores';

interface Props { groups: GroupData[] }

function tempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const horas = Math.floor(diffMs / 3_600_000);
  if (horas < 1) return 'agora há pouco';
  if (horas < 24) return `${horas}h atrás`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 30) return `${dias}d atrás`;
  return `${Math.floor(dias / 30)} meses atrás`;
}

function AccountRow({ account }: { account: KommoStoreOverview }) {
  const { status, error } = account;
  const semAtividade = status && (!status.ultimaAtividade ||
    Date.now() - new Date(status.ultimaAtividade).getTime() > 7 * 24 * 3_600_000);

  return (
    <div className={`bg-brand-medium border rounded-2xl p-4 ${semAtividade ? 'border-amber-500/40' : 'border-brand-light'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: account.storeColor }} />
            <p className="text-sm font-bold text-white truncate">{account.storeName}</p>
          </div>
          <p className="text-[10px] text-gray-600">{account.groupName}</p>
        </div>
        {semAtividade && (
          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Clock className="w-3 h-3" /> Sem atividade recente
          </span>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-400 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> {error}</p>
      )}

      {!error && status && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-brand-dark/50 rounded-lg p-2.5">
            <p className="text-lg font-black text-green-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" />{status.ganhos}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Vendas (planos ganhos)</p>
          </div>
          <div className="bg-brand-dark/50 rounded-lg p-2.5">
            <p className="text-lg font-black text-white flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-brand-purple" />{status.abertos}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Negócios em aberto</p>
          </div>
          <div className="bg-brand-dark/50 rounded-lg p-2.5">
            <p className="text-xs font-bold text-gray-300">{status.ultimaAtividade ? tempoRelativo(status.ultimaAtividade) : '—'}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Última atividade</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function KommoView({ groups }: Props) {
  const { accounts, loading, refresh } = useKommoOverview(groups);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-purple" /> Kommo
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Vendas fechadas e última atividade das lojas que usam o Kommo</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white border border-brand-light rounded-lg px-3 py-2 hover:bg-brand-light/50 transition-all disabled:opacity-40 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {KOMMO_STORES.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-sm">Nenhuma loja com Kommo configurada ainda.</p>
          <p className="text-xs mt-1">Adicione o token em <code>KOMMO_ACCOUNTS</code> (Vercel) e o storeId em <code>src/config/kommoStores.ts</code>.</p>
        </div>
      )}

      {loading && accounts.length === 0 && KOMMO_STORES.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-brand-medium border border-brand-light rounded-2xl p-4 animate-pulse h-28" />)}
        </div>
      )}

      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map(a => <AccountRow key={a.storeId} account={a} />)}
        </div>
      )}
    </div>
  );
}
