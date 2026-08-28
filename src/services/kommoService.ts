export interface KommoStoreStatus {
  periodo: { desde: string; ate: string };
  ganhos: number;
  perdidos: number;
  valorGanho: number;
  abertos: number;
  ultimaAtividade: string | null; // ISO
  whatsappConectado: boolean;
  whatsappNumero: string | null;
  whatsappUltimaMensagem: string | null; // ISO
}

export async function getKommoStoreStatus(storeId: string, since?: string, until?: string): Promise<KommoStoreStatus> {
  const params = new URLSearchParams({ storeId });
  if (since) params.set('since', since);
  if (until) params.set('until', until);
  const res = await fetch(`/api/kommo?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Erro ao consultar Kommo (${res.status})`);
  }
  return data as KommoStoreStatus;
}
