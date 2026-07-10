import { useEffect, useState, useCallback } from 'react';
import { GroupData } from '../types';
import { META_ACCOUNTS } from '../config/metaAccounts';
import { MetaAccountBalance, MetaInsights, getAccountBalance, getAccountInsights } from '../services/metaService';

export interface StoreRef {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  groupColor: string;
}

export interface AccountOverview {
  adAccountId: string;
  stores: StoreRef[];
  balance: MetaAccountBalance | null;
  weekly:  MetaInsights | null;
  error?: string;
}

const CACHE_KEY = 'aure_meta_overview_v1';
const CACHE_TTL_MS = 10 * 60 * 1000;

export const SALDO_BAIXO_LIMITE = 150; // R$ — abaixo disso, conta "precisa de atenção"
export const GASTO_BAIXO_LIMITE = 50;  // R$ investidos nos últimos 7 dias — abaixo disso, conta "parada ou quase parada"

function buildUniqueAccounts(groups: GroupData[]): Map<string, StoreRef[]> {
  const byAccount = new Map<string, StoreRef[]>();
  for (const group of groups) {
    for (const store of group.stores) {
      const adAccountId = META_ACCOUNTS[store.id];
      if (!adAccountId) continue;
      const ref: StoreRef = { id: store.id, name: store.name, groupId: group.id, groupName: group.name, groupColor: group.color };
      const list = byAccount.get(adAccountId);
      if (list) list.push(ref);
      else byAccount.set(adAccountId, [ref]);
    }
  }
  return byAccount;
}

export function useMetaAccountsOverview(groups: GroupData[]) {
  const [accounts, setAccounts] = useState<AccountOverview[]>([]);
  const [loading, setLoading]   = useState(false);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);

  const load = useCallback(async (force = false) => {
    if (groups.length === 0) return;

    if (!force) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { at, data } = JSON.parse(cached);
          if (Date.now() - at < CACHE_TTL_MS) {
            setAccounts(data);
            setLoadedAt(at);
            return;
          }
        } catch { /* cache inválido, ignora */ }
      }
    }

    setLoading(true);
    const byAccount = buildUniqueAccounts(groups);

    const results = await Promise.allSettled(
      Array.from(byAccount.entries()).map(async ([adAccountId, stores]) => {
        const [balanceRes, weeklyRes] = await Promise.allSettled([
          getAccountBalance(adAccountId),
          getAccountInsights(adAccountId, { preset: 'last_7d' }),
        ]);
        const item: AccountOverview = {
          adAccountId,
          stores,
          balance: balanceRes.status === 'fulfilled' ? balanceRes.value : null,
          weekly:  weeklyRes.status  === 'fulfilled' ? weeklyRes.value  : null,
        };
        if (balanceRes.status === 'rejected') item.error = balanceRes.reason?.message ?? 'Erro ao buscar saldo';
        return item;
      })
    );

    const data = results
      .filter((r): r is PromiseFulfilledResult<AccountOverview> => r.status === 'fulfilled')
      .map(r => r.value);

    setAccounts(data);
    const at = Date.now();
    setLoadedAt(at);
    setLoading(false);
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at, data }));
  }, [groups]);

  useEffect(() => { load(); }, [load]);

  return { accounts, loading, loadedAt, refresh: () => load(true) };
}
