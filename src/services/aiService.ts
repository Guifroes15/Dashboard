import { StoreData } from "../types";

// Instancia o cliente do Gemini só quando alguém realmente chama generateActionPlan —
// nunca no carregamento do módulo. Se isso rodasse no import (como era antes), uma
// GEMINI_API_KEY ausente/inválida quebraria o app inteiro assim que qualquer tela que
// importe este arquivo fosse carregada, antes até do React renderizar qualquer coisa.
let _ai: import("@google/genai").GoogleGenAI | null = null;
async function getGeminiClient() {
  if (!_ai) {
    const { GoogleGenAI } = await import("@google/genai");
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

export async function generateActionPlan(store: StoreData, fee: number) {
  try {
    const { Type } = await import("@google/genai");
    const ai = await getGeminiClient();

    const historicalData = store.historico
      .filter(h => h.vendas >= 0)
      .map(h => ({
        mes: h.mes,
        vendas: h.vendas,
        mensagens: h.mensagens || 0,
        verba: h.verba || 0
      }));

    const prompt = `
      Você é um especialista em análise de performance de varejo digital para o grupo Aure Digital.
      Analise os resultados da loja "${store.name}" considerando um fee fixo de R$ ${fee.toLocaleString('pt-BR')} por mês.

      Dados Históricos:
      ${JSON.stringify(historicalData, null, 2)}

      Objetivo:
      Gere um relatório estratégico para o próximo mês em formato JSON, focando em:
      - Resumo da saúde financeira (ROI)
      - Uma sugestão estratégica principal (Ação Principal)
      - Três tarefas práticas (Checklist) para a equipe da operação executar.

      Importante: Responda apenas em JSON válido seguindo este esquema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumo: { type: Type.STRING },
            sugestaoPrincipal: { type: Type.STRING },
            tarefas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["resumo", "sugestaoPrincipal", "tarefas"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Report error:", error);
    return null;
  }
}

// ─── Resumo Diário — usa Claude (mesma chave já validada nas outras Ferramentas IA) ───

export interface DailyAccountPayload {
  nome: string;
  saldoRestante: number | null; // null = conta sem limite/pós-paga
  dias: { data: string; gasto: number; mensagens: number; custoPorMensagem: number | null }[];
}

export type SummaryPeriod = 'ontem' | '7d';

export async function generateDailySummary(
  accounts: DailyAccountPayload[],
  periodo: SummaryPeriod,
  periodoLabel: string,
): Promise<string> {
  const foco = periodo === 'ontem'
    ? `Compare SEMPRE os resultados de ontem (${periodoLabel}) com o histórico recente (dias anteriores, incluído nos dados) para identificar tendências.`
    : `Analise o AGREGADO dos últimos 7 dias (${periodoLabel}) de cada conta — some/tire média do período — e compare com os 7 dias anteriores a esse (também incluídos nos dados) pra identificar se a conta está melhorando, piorando ou estável.`;

  const titulo = periodo === 'ontem'
    ? `☀️ Bom dia! Resumo de Ontem (${periodoLabel})`
    : `📅 Resumo dos Últimos 7 Dias (${periodoLabel})`;

  const panorama = periodo === 'ontem' ? 'do dia' : 'da semana';

  const prompt = `Você é um gestor de tráfego sênior analisando todas as contas da operação de uma agência de marketing digital (Aure Digital).

Sua função NÃO é listar métricas. Sua função é entregar um briefing executivo de no máximo 1 minuto de leitura.

${foco}

Organize exatamente nesta estrutura, usando texto simples (sem markdown como # ou **, pode usar *asterisco simples* pra negrito estilo WhatsApp):

${titulo}

📈 Panorama Geral
Resumo de 2 a 4 frases explicando como foi o desempenho ${panorama} da operação. Não cite números sem explicar o significado deles.

🚀 Destaques Positivos
Liste apenas contas que realmente merecem destaque, explicando o que aconteceu, por que é relevante, e a comparação com o período anterior. Evite destacar contas apenas por maior volume absoluto.

⚠️ Pontos de Atenção
Liste somente contas que realmente precisam de ação (saldo baixo/zerado, queda de eficiência, sem mensagens apesar de investimento). Explique o motivo. Priorize por gravidade.

➖ Contas Estáveis
Resuma em poucas frases as contas que seguem dentro da média histórica, sem listar todas uma a uma.

📊 Tendências da Operação
Identifique padrões entre as contas (ex: maioria com CPL caindo, grupo específico com problema recorrente de saldo, etc.), não analise clientes isoladamente aqui.

🎯 Prioridades para ${periodo === 'ontem' ? 'Hoje' : 'a Semana'}
Lista numerada objetiva das ações mais importantes.

Regras obrigatórias:
- Não apenas repita números, sempre explique o significado dos dados.
- Compare com o período anterior sempre que possível.
- Destaque tendências, não eventos isolados.
- Seja objetivo e executivo — um gestor deve entender toda a operação em menos de 60 segundos.
- Evite listar todas as contas; destaque apenas o que realmente importa.
- Nomes de conta vêm no campo "nome" de cada item da lista de dados abaixo.

Dados (um item por conta, "dias" em ordem cronológica, últimos ${periodo === 'ontem' ? '14 dias, terminando ontem' : '14 dias — use os últimos 7 como período atual e os 7 anteriores como comparação'}):
${JSON.stringify(accounts, null, 2)}`;

  const apiKey = (import.meta as any).env.VITE_ANTHROPIC_KEY;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'dangerously-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao gerar resumo (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  return json.content?.[0]?.text ?? '';
}
