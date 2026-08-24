export interface KommoStoreStatus {
  total: number;
  ganhos: number;
  perdidos: number;
  abertos: number;
  ultimaAtividade: string | null; // ISO
  whatsappConectado: boolean;
  whatsappNumero: string | null;
  whatsappUltimaMensagem: string | null; // ISO
}

export async function getKommoStoreStatus(storeId: string): Promise<KommoStoreStatus> {
  const res = await fetch(`/api/kommo?storeId=${encodeURIComponent(storeId)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Erro ao consultar Kommo (${res.status})`);
  }
  return data as KommoStoreStatus;
}
