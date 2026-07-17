import { db, ensureAuth } from '../lib/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { GroupData, MonthData, OtimizacaoItem, ReuniaoItem, StoreData } from '../types';

const GROUP_ORDER = ['barbosa', 'paralelas', 'lupo', 'ferracini'];

export function subscribeToGroups(
  callback: (groups: GroupData[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'groups'),
    (snapshot) => {
      const groups: GroupData[] = [];
      snapshot.forEach((d) => groups.push(d.data() as GroupData));
      groups.sort((a, b) => {
        const ai = GROUP_ORDER.indexOf(a.id);
        const bi = GROUP_ORDER.indexOf(b.id);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      callback(groups);
    },
    (err) => onError?.(err)
  );
}

export async function seedGroupsToFirestore(groups: GroupData[]): Promise<void> {
  await ensureAuth();
  for (const group of groups) {
    await setDoc(doc(db, 'groups', group.id), group);
  }
}

export async function addStore(groupId: string, store: StoreData): Promise<void> {
  await ensureAuth();
  const groupRef = doc(db, 'groups', groupId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(groupRef);
    if (!snap.exists()) throw new Error('Grupo não encontrado');

    const groupData = snap.data() as GroupData;
    if (groupData.stores.some((s) => s.id === store.id)) return; // já existe

    tx.update(groupRef, { stores: [...groupData.stores, store] });
  });
}

export async function createGroupIfMissing(group: GroupData): Promise<void> {
  await ensureAuth();
  const groupRef = doc(db, 'groups', group.id);
  const snap = await getDoc(groupRef);
  if (snap.exists()) return;
  await setDoc(groupRef, group);
}

export async function deleteGroup(groupId: string): Promise<void> {
  await ensureAuth();
  await deleteDoc(doc(db, 'groups', groupId));
}

export async function deleteStore(groupId: string, storeId: string): Promise<void> {
  await ensureAuth();
  const groupRef = doc(db, 'groups', groupId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(groupRef);
    if (!snap.exists()) throw new Error('Grupo não encontrado');

    const groupData = snap.data() as GroupData;
    const newStores = groupData.stores.filter((s) => s.id !== storeId);
    tx.update(groupRef, { stores: newStores });
  });
}

export async function addOrUpdateMonthData(
  groupId: string,
  storeId: string,
  monthData: MonthData
): Promise<void> {
  await ensureAuth();
  const groupRef = doc(db, 'groups', groupId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(groupRef);
    if (!snap.exists()) throw new Error('Grupo não encontrado');

    const groupData = snap.data() as GroupData;
    const storeIdx = groupData.stores.findIndex((s) => s.id === storeId);
    if (storeIdx === -1) throw new Error('Loja não encontrada');

    const store = { ...groupData.stores[storeIdx] };
    const hist = [...store.historico];
    const existingIdx = hist.findIndex((h) => h.chave === monthData.chave);

    if (existingIdx >= 0) {
      hist[existingIdx] = monthData;
    } else {
      hist.push(monthData);
      hist.sort((a, b) => a.chave.localeCompare(b.chave));
    }

    const newStores = [...groupData.stores];
    newStores[storeIdx] = { ...store, historico: hist };
    tx.update(groupRef, { stores: newStores });
  });
}

// Lê o grupo, aplica `mutate` na loja alvo e grava de volta — base comum pras
// escritas que só mexem num campo (array) embutido numa loja específica.
async function updateStoreField(
  groupId: string,
  storeId: string,
  mutate: (store: StoreData) => Partial<StoreData>
): Promise<void> {
  await ensureAuth();
  const groupRef = doc(db, 'groups', groupId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(groupRef);
    if (!snap.exists()) throw new Error('Grupo não encontrado');

    const groupData = snap.data() as GroupData;
    const storeIdx = groupData.stores.findIndex((s) => s.id === storeId);
    if (storeIdx === -1) throw new Error('Loja não encontrada');

    const store = groupData.stores[storeIdx];
    const newStores = [...groupData.stores];
    newStores[storeIdx] = { ...store, ...mutate(store) };
    tx.update(groupRef, { stores: newStores });
  });
}

export async function addOtimizacao(groupId: string, storeId: string, item: OtimizacaoItem): Promise<void> {
  return updateStoreField(groupId, storeId, (store) => ({ otimizacoes: [item, ...(store.otimizacoes ?? [])] }));
}

export async function deleteOtimizacao(groupId: string, storeId: string, itemId: string): Promise<void> {
  return updateStoreField(groupId, storeId, (store) => ({ otimizacoes: (store.otimizacoes ?? []).filter((o) => o.id !== itemId) }));
}

export async function addReuniao(groupId: string, storeId: string, item: ReuniaoItem): Promise<void> {
  return updateStoreField(groupId, storeId, (store) => ({ reunioes: [item, ...(store.reunioes ?? [])] }));
}

export async function deleteReuniao(groupId: string, storeId: string, itemId: string): Promise<void> {
  return updateStoreField(groupId, storeId, (store) => ({ reunioes: (store.reunioes ?? []).filter((r) => r.id !== itemId) }));
}
