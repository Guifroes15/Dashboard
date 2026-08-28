// Function na Vercel (roda no servidor, nunca no navegador) — a API do
// Kommo não libera CORS pra chamada direta do front-end, e mesmo se
// liberasse, cada loja tem seu próprio token com acesso total ao CRM
// daquele cliente, então não deve ir pro bundle público do site.
//
// Configuração (Vercel → Settings → Environment Variables, SEM prefixo
// VITE_, pra nunca ser exposta no navegador):
//   KOMMO_ACCOUNTS = {"barbosa-calcados":{"subdomain":"exemplo","token":"..."}, ...}
//
// Chave = mesmo storeId usado no resto do dashboard. Ver src/config/kommoStores.ts
// pra saber quais storeIds o front-end espera encontrar aqui.

export default async function handler(req: any, res: any) {
  const storeId = typeof req.query?.storeId === 'string' ? req.query.storeId : '';
  if (!storeId) {
    res.status(400).json({ error: 'storeId é obrigatório' });
    return;
  }

  let accounts: Record<string, { subdomain: string; token: string }> = {};
  try {
    accounts = JSON.parse(process.env.KOMMO_ACCOUNTS || '{}');
  } catch {
    res.status(500).json({ error: 'KOMMO_ACCOUNTS mal configurado no servidor' });
    return;
  }

  const account = accounts[storeId];
  if (!account?.subdomain || !account?.token) {
    res.status(404).json({ error: 'Loja sem Kommo configurado' });
    return;
  }

  // Período das vendas (data de fechamento do negócio) — vem do front como
  // YYYY-MM-DD. Sem período informado, cai nos últimos 30 dias.
  const sinceParam = typeof req.query?.since === 'string' ? req.query.since : null;
  const untilParam = typeof req.query?.until === 'string' ? req.query.until : null;
  const untilDate = untilParam ? new Date(`${untilParam}T23:59:59-03:00`) : new Date();
  const sinceDate = sinceParam ? new Date(`${sinceParam}T00:00:00-03:00`) : new Date(untilDate.getTime() - 29 * 86_400_000);
  const closedFrom = Math.floor(sinceDate.getTime() / 1000);
  const closedTo = Math.floor(untilDate.getTime() / 1000);

  // Faz o fetch e só tenta ler como JSON se realmente vier corpo — a API do
  // Kommo devolve 204 sem corpo quando a busca não acha nada (ex.: filtro de
  // período sem nenhum negócio fechado), e chamar .json() nesse caso quebra
  // com "Unexpected end of JSON input".
  async function fetchJson(url: string, auth: Record<string, string>): Promise<{ ok: boolean; status: number; data: any }> {
    const r = await fetch(url, { headers: auth });
    const text = await r.text();
    let data: any = null;
    if (text) {
      try { data = JSON.parse(text); } catch { /* corpo não era JSON, data fica null */ }
    }
    return { ok: r.ok, status: r.status, data };
  }

  try {
    const base = `https://${account.subdomain}.kommo.com/api/v4`;
    const auth = { Authorization: `Bearer ${account.token}` };

    const [recent, period, unsorted] = await Promise.all([
      // Estado atual (não depende do período escolhido): negócios em aberto,
      // última atividade e conexão do WhatsApp.
      fetchJson(`${base}/leads?limit=250&order[updated_at]=desc`, auth),
      // Vendas dentro do período escolhido — filtra pela data de fechamento.
      fetchJson(`${base}/leads?filter[closed_at][from]=${closedFrom}&filter[closed_at][to]=${closedTo}&limit=250`, auth),
      // "unsorted" = mensagens/leads recém-chegados ainda não triados — é onde
      // aparece a origem "com.amocrm.amocrmwa" (canal do WhatsApp), com o
      // número conectado e quando a última mensagem chegou. Não existe um
      // endpoint de "status da integração", então isso é a aproximação mais
      // confiável: se chegou mensagem recente pelo WhatsApp, está conectado.
      fetchJson(`${base}/leads/unsorted?limit=25`, auth),
    ]);

    if (!recent.ok) {
      res.status(recent.status).json({ error: `Kommo retornou ${recent.status}` });
      return;
    }

    const recentLeads: any[] = recent.data?._embedded?.leads ?? [];
    const abertos = recentLeads.filter(l => !l.closed_at).length;
    const ultimaAtividadeUnix = recentLeads.reduce((max, l) => Math.max(max, l.updated_at || 0), 0);

    let ganhos = 0;
    let perdidos = 0;
    let valorGanho = 0;
    if (period.ok) {
      const periodLeads: any[] = period.data?._embedded?.leads ?? [];
      for (const l of periodLeads) {
        if (!l.closed_at) continue;
        if (l.loss_reason_id) perdidos++;
        else { ganhos++; valorGanho += l.price || 0; }
      }
    }

    let whatsappConectado = false;
    let whatsappNumero: string | null = null;
    let whatsappUltimaMensagemUnix = 0;

    if (unsorted.ok) {
      const unsortedItems: any[] = unsorted.data?._embedded?.unsorted ?? [];
      for (const u of unsortedItems) {
        if (typeof u.source_name === 'string' && u.source_name.startsWith('com.amocrm.amocrmwa')) {
          whatsappConectado = true;
          whatsappNumero = u.metadata?.to ?? whatsappNumero;
          whatsappUltimaMensagemUnix = Math.max(whatsappUltimaMensagemUnix, u.created_at || 0);
        }
      }
    }

    res.status(200).json({
      periodo: { desde: sinceDate.toISOString(), ate: untilDate.toISOString() },
      ganhos,
      perdidos,
      valorGanho,
      // Estado atual da conta, independente do período escolhido:
      abertos,
      ultimaAtividade: ultimaAtividadeUnix ? new Date(ultimaAtividadeUnix * 1000).toISOString() : null,
      whatsappConectado,
      whatsappNumero,
      // Só preenchido se whatsappConectado — última mensagem vista nos 25
      // itens mais recentes da caixa de entrada não triada.
      whatsappUltimaMensagem: whatsappUltimaMensagemUnix ? new Date(whatsappUltimaMensagemUnix * 1000).toISOString() : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Erro ao consultar o Kommo' });
  }
}
