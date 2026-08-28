import { useCallback, useEffect, useState } from 'react';
import { GroupData } from '../types';
import { KOMMO_STORES } from '../config/kommoStores';
import { getKommoStoreStatus, KommoStoreStatus } from '../services/kommoService';

export interface KommoStoreOverview {
  storeId: string;
  storeName: string;
  storeColor: string;
  groupName: string;
  status: KommoStoreStatus | null;
  error?: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000;

export function useKommoOverview(groups: GroupData[], since?: string, until?: string) {
  const [accounts, setAccounts] = useState<KommoStoreOverview[]>([]);
  const [loading, setLoading] = useState(false);

  const storesComKommo = groups
    .flatMap(g => g.stores.map(s => ({ ...s, groupName: g.name })))
    .filter(s => KOMMO_STORES.includes(s.id));

  // Escopado pelas lojas visíveis nesse login E pelo período escolhido —
  // mesmo cuidado do bug já corrigido no saldo do Meta Ads (cache vazando
  // entre logins/filtros diferentes).
  const cacheKey = `aure_kommo_overview_v2_${since ?? ''}_${until ?? ''}_${storesComKommo.map(s => s.id).sort().join(',')}`;

  const load = useCallback(async (force = false) => {
    if (storesComKommo.length === 0) return;

    if (!force) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { at, data } = JSON.parse(cached);
          if (Date.now() - at < CACHE_TTL_MS) {
            setAccounts(data);
            return;
          }
        } catch { /* cache inválido, ignora */ }
      }
    }

    setLoading(true);
    const results = await Promise.allSettled(
      storesComKommo.map(async (s): Promise<KommoStoreOverview> => {
        try {
          const status = await getKommoStoreStatus(s.id, since, until);
          return { storeId: s.id, storeName: s.name, storeColor: s.color, groupName: s.groupName, status };
        } catch (err) {
          return {
            storeId: s.id, storeName: s.name, storeColor: s.color, groupName: s.groupName,
            status: null, error: err instanceof Error ? err.message : 'Erro desconhecido',
          };
        }
      })
    );

    const data = results
      .filter((r): r is PromiseFulfilledResult<KommoStoreOverview> => r.status === 'fulfilled')
      .map(r => r.value);

    setAccounts(data);
    setLoading(false);
    sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, since, until]);

  useEffect(() => { load(); }, [load]);

  return { accounts, loading, refresh: () => load(true) };
}
