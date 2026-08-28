import React, { useMemo, useState } from 'react';
import { RefreshCw, MessageCircle, Trophy, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { GroupData } from '../../types';
import { useKommoOverview, KommoStoreOverview } from '../../hooks/useKommoOverview';
import { KOMMO_STORES } from '../../config/kommoStores';
import { DateRangePicker } from '../ui/DateRangePicker';
import { MetaDateRange } from '../../services/metaService';

interface Props { groups: GroupData[] }

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

// Mesma semântica dos presets do Meta Ads, mas resolvida aqui porque a
// function do Kommo precisa das datas concretas (since/until), não de um
// nome de preset — a API do Kommo filtra por timestamp, não por atalho.
function resolveRange(range: MetaDateRange): { since: string; until: string } {
  if ('since' in range) return range;
  const hoje = new Date();
  switch (range.preset) {
    case 'today':     return { since: toISO(hoje), until: toISO(hoje) };
    case 'yesterday': { const y = addDays(hoje, -1); return { since: toISO(y), until: toISO(y) }; }
    case 'last_7d':   return { since: toISO(addDays(hoje, -6)),  until: toISO(hoje) };
    case 'last_14d':  return { since: toISO(addDays(hoje, -13)), until: toISO(hoje) };
    case 'last_30d':  return { since: toISO(addDays(hoje, -29)), until: toISO(hoje) };
    case 'this_month': return { since: toISO(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), until: toISO(hoje) };
    case 'last_month': {
      const primeiroDoMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      return { since: toISO(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)), until: toISO(addDays(primeiroDoMesAtual, -1)) };
    }
  }
}

function fmtTelefone(numero: string): string {
  const digitos = numero.replace(/\D/g, '');
  const semDDI = digitos.startsWith('55') ? digitos.slice(2) : digitos;
  if (semDDI.length === 11) return `(${semDDI.slice(0, 2)}) ${semDDI.slice(2, 7)}-${semDDI.slice(7)}`;
  if (semDDI.length === 10) return `(${semDDI.slice(0, 2)}) ${semDDI.slice(2, 6)}-${semDDI.slice(6)}`;
  return numero;
}

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
        <>
          <div className={`flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 mb-2 ${
            status.whatsappConectado ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'
          }`}>
            {status.whatsappConectado
              ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              : <XCircle className="w-3.5 h-3.5 shrink-0" />}
            {status.whatsappConectado
              ? <span>WhatsApp conectado{status.whatsappNumero ? ` · ${fmtTelefone(status.whatsappNumero)}` : ''}</span>
              : <span>Sem WhatsApp conectado</span>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-brand-dark/50 rounded-lg p-2.5">
              <p className="text-lg font-black text-green-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" />{status.ganhos}</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">
                Vendas no período{status.valorGanho > 0 ? ` · ${fmtBRL(status.valorGanho)}` : ''}
              </p>
            </div>
            <div className="bg-brand-dark/50 rounded-lg p-2.5">
              <p className="text-lg font-black text-white flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-brand-purple" />{status.abertos}</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Negócios em aberto (atual)</p>
            </div>
            <div className="bg-brand-dark/50 rounded-lg p-2.5">
              <p className="text-xs font-bold text-gray-300">{status.ultimaAtividade ? tempoRelativo(status.ultimaAtividade) : '—'}</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Última atividade</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function KommoView({ groups }: Props) {
  const [range, setRange] = useState<MetaDateRange>({ preset: 'last_30d' });
  const { since, until } = useMemo(() => resolveRange(range), [range]);
  const { accounts, loading, refresh } = useKommoOverview(groups, since, until);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-purple" /> Kommo
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Vendas fechadas no período, negócios em aberto e última atividade</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DateRangePicker value={range} onChange={setRange} />
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white border border-brand-light rounded-lg px-3 py-2.5 hover:bg-brand-light/50 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
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
