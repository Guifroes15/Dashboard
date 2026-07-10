import React from 'react';
import { RefreshCw, AlertTriangle, Wallet, AlertCircle } from 'lucide-react';
import { GroupData } from '../../types';
import { useMetaAccountsOverview, SALDO_BAIXO_LIMITE, AccountOverview } from '../../hooks/useMetaAccountsOverview';

interface Props { groups: GroupData[] }

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

function storeLabel(account: AccountOverview) {
  return account.stores.map(s => s.name).join(' / ');
}

function AccountRow({ account }: { account: AccountOverview }) {
  const { balance, error } = account;
  const baixo = !!balance?.temLimite && balance.saldoRestante < SALDO_BAIXO_LIMITE;
  const pct = balance?.temLimite && balance.spendCap > 0
    ? Math.min(100, Math.max(0, (balance.amountSpent / balance.spendCap) * 100))
    : 0;

  return (
    <div className={`bg-brand-medium border rounded-2xl p-4 ${baixo ? 'border-red-500/40' : 'border-brand-light'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            {account.stores.map(s => (
              <span key={s.id} className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.groupColor }} />
            ))}
            <p className="text-sm font-bold text-white truncate">{storeLabel(account)}</p>
          </div>
          <p className="text-[10px] text-gray-600">{account.stores[0]?.groupName}</p>
        </div>
        {baixo && (
          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <AlertTriangle className="w-3 h-3" /> Saldo baixo
          </span>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-400 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> {error}</p>
      )}

      {!error && balance && (
        balance.temLimite ? (
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className={`text-xl font-black ${baixo ? 'text-red-400' : 'text-white'}`}>{fmt(balance.saldoRestante)}</p>
              <p className="text-[9px] text-gray-600">restante de {fmt(balance.spendCap)}</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: baixo ? '#ef4444' : '#7c3aed' }} />
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">Conta sem limite definido (pós-paga) — gasto no período: {fmt(balance.amountSpent)}</p>
        )
      )}
    </div>
  );
}

export function MetaBalanceView({ groups }: Props) {
  const { accounts, loading, refresh } = useMetaAccountsOverview(groups);

  const comLimite  = accounts.filter(a => a.balance?.temLimite).sort((a, b) => (a.balance!.saldoRestante) - (b.balance!.saldoRestante));
  const semLimite  = accounts.filter(a => a.balance && !a.balance.temLimite);
  const comErro    = accounts.filter(a => !a.balance);
  const precisamAtencao = comLimite.filter(a => a.balance!.saldoRestante < SALDO_BAIXO_LIMITE);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-purple" /> Saldo Meta Ads
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Saldo restante de todas as contas de anúncio que você gerencia</p>
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

      {precisamAtencao.length > 0 && (
        <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
              {precisamAtencao.length} {precisamAtencao.length === 1 ? 'conta precisa' : 'contas precisam'} de recarga (abaixo de {fmt(SALDO_BAIXO_LIMITE)})
            </p>
          </div>
        </div>
      )}

      {loading && accounts.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-brand-medium border border-brand-light rounded-2xl p-4 animate-pulse h-24" />)}
        </div>
      )}

      {comLimite.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {comLimite.map(a => <AccountRow key={a.adAccountId} account={a} />)}
        </div>
      )}

      {semLimite.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Contas sem limite definido</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {semLimite.map(a => <AccountRow key={a.adAccountId} account={a} />)}
          </div>
        </div>
      )}

      {comErro.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Não foi possível carregar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {comErro.map(a => <AccountRow key={a.adAccountId} account={a} />)}
          </div>
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-sm">Nenhuma conta de anúncio mapeada ainda.</p>
        </div>
      )}
    </div>
  );
}
