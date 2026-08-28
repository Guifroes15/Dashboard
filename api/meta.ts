// Function na Vercel (roda no servidor) — proxy genérico pra Graph API do
// Meta. Antes o token (VITE_META_ACCESS_TOKEN) ia embutido no bundle público
// do site, visível pra qualquer um que abrisse o DevTools. Agora o token
// (META_ACCESS_TOKEN, SEM prefixo VITE_) fica só aqui no servidor.
//
// O front manda o caminho relativo da Graph API (ex.: /act_123/insights?fields=...)
// via ?path=, sem token nenhum — essa function injeta o token e repassa a
// resposta como veio.

export default async function handler(req: any, res: any) {
  const path = typeof req.query?.path === 'string' ? req.query.path : '';
  if (!path || !path.startsWith('/')) {
    res.status(400).json({ error: 'path inválido' });
    return;
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'META_ACCESS_TOKEN não configurado no servidor' });
    return;
  }

  try {
    const sep = path.includes('?') ? '&' : '?';
    const url = `https://graph.facebook.com/v21.0${path}${sep}access_token=${token}`;
    const r = await fetch(url);
    const text = await r.text();
    let data: any = {};
    if (text) {
      try { data = JSON.parse(text); } catch { data = { error: { message: 'Resposta inválida do Meta' } }; }
    }
    res.status(r.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Erro ao consultar o Meta' });
  }
}
