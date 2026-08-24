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
  // Diagnóstico temporário — não expõe tokens, só tamanho/bordas da string
  // pra achar corrupção de copiar-colar na Vercel. Remover depois de resolvido.
  if (req.query?.debug === '1') {
    const raw = process.env.KOMMO_ACCOUNTS || '';
    let parseOk = false;
    let keys: string[] = [];
    try {
      keys = Object.keys(JSON.parse(raw || '{}'));
      parseOk = true;
    } catch { /* mantém parseOk = false */ }
    res.status(200).json({
      length: raw.length,
      inicio: raw.slice(0, 30),
      fim: raw.slice(-30),
      parseOk,
      keys,
    });
    return;
  }

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

  try {
    const base = `https://${account.subdomain}.kommo.com/api/v4`;
    const auth = { Authorization: `Bearer ${account.token}` };

    const [leadsRes, unsortedRes] = await Promise.all([
      fetch(`${base}/leads?limit=250&order[updated_at]=desc`, { headers: auth }),
      // "unsorted" = mensagens/leads recém-chegados ainda não triados — é onde
      // aparece a origem "com.amocrm.amocrmwa" (canal do WhatsApp), com o
      // número conectado e quando a última mensagem chegou. Não existe um
      // endpoint de "status da integração", então isso é a aproximação mais
      // confiável: se chegou mensagem recente pelo WhatsApp, está conectado.
      fetch(`${base}/leads/unsorted?limit=25`, { headers: auth }),
    ]);

    if (!leadsRes.ok) {
      res.status(leadsRes.status).json({ error: `Kommo retornou ${leadsRes.status}` });
      return;
    }

    const data = await leadsRes.json();
    const leads: any[] = data._embedded?.leads ?? [];

    const ganhos = leads.filter(l => l.closed_at && !l.loss_reason_id).length;
    const perdidos = leads.filter(l => l.closed_at && l.loss_reason_id).length;
    const abertos = leads.filter(l => !l.closed_at).length;
    const ultimaAtividadeUnix = leads.reduce((max, l) => Math.max(max, l.updated_at || 0), 0);

    let whatsappConectado = false;
    let whatsappNumero: string | null = null;
    let whatsappUltimaMensagemUnix = 0;

    if (unsortedRes.ok) {
      const unsortedData = await unsortedRes.json();
      const unsorted: any[] = unsortedData._embedded?.unsorted ?? [];
      for (const u of unsorted) {
        if (typeof u.source_name === 'string' && u.source_name.startsWith('com.amocrm.amocrmwa')) {
          whatsappConectado = true;
          whatsappNumero = u.metadata?.to ?? whatsappNumero;
          whatsappUltimaMensagemUnix = Math.max(whatsappUltimaMensagemUnix, u.created_at || 0);
        }
      }
    }

    res.status(200).json({
      total: leads.length,
      ganhos,
      perdidos,
      abertos,
      // Baseado só nos 250 leads mais recentes — suficiente pra "está ativo?"
      // e pra vendas recentes, mas não é o total histórico da conta.
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
