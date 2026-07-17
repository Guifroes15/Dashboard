import { db, ensureAuth } from '../lib/firebase';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { StoreData } from '../types';
import { addStore, createGroupIfMissing } from './groupService';

export interface OnboardingClient {
  id: string;
  nome: string;
  cor: string;
  metaAccountId?: string;   // act_XXXX
  grupoExistente?: string;  // groupId — anexa como loja nova nesse grupo; se vazio, vira grupo próprio
  observacoes?: string;
  status: 'pendente' | 'concluido';
  criadoEm: string;
  concluidoEm?: string;
}

export function subscribeToOnboarding(
  callback: (clients: OnboardingClient[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'onboarding'),
    (snapshot) => {
      const clients: OnboardingClient[] = [];
      snapshot.forEach((d) => clients.push(d.data() as OnboardingClient));
      clients.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
      callback(clients);
    },
    (err) => onError?.(err)
  );
}

export async function addOnboardingClient(client: OnboardingClient): Promise<void> {
  await ensureAuth();
  await setDoc(doc(db, 'onboarding', client.id), client);
}

export async function deleteOnboardingClient(id: string): Promise<void> {
  await ensureAuth();
  await deleteDoc(doc(db, 'onboarding', id));
}

const ACENTOS: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o', ö: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ç: 'c', ñ: 'n',
};

export function slugify(nome: string): string {
  return nome
    .toLowerCase()
    .split('').map(ch => ACENTOS[ch] ?? ch).join('')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Cria a loja de verdade no dashboard (num grupo existente ou como grupo próprio)
// e marca o onboarding como concluído — é isso que dá o "painel automático".
export async function concludeOnboarding(client: OnboardingClient): Promise<void> {
  const storeId = slugify(client.nome);
  const store: StoreData = {
    id: storeId,
    name: client.nome,
    color: client.cor,
    historico: [],
    planos: [],
    ...(client.metaAccountId ? { metaAccountId: client.metaAccountId } : {}),
  };

  if (client.grupoExistente) {
    await addStore(client.grupoExistente, store);
  } else {
    await createGroupIfMissing({ id: storeId, name: client.nome, color: client.cor, fee: 0, stores: [store] });
  }

  await ensureAuth();
  await setDoc(doc(db, 'onboarding', client.id), {
    ...client,
    status: 'concluido',
    concluidoEm: new Date().toISOString(),
  });
}
