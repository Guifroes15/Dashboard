import { GoogleGenAI, Type } from "@google/genai";
import { StoreData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DailyAccountPayload {
  nome: string;
  saldoRestante: number | null; // null = conta sem limite/pós-paga
  dias: { data: string; gasto: number; mensagens: number; custoPorMensagem: number | null }[];
}

export async function generateDailySummary(accounts: DailyAccountPayload[], dataOntem: string): Promise<string> {
  const prompt = `
Você é um gestor de tráfego sênior analisando todas as contas da operação de uma agência de marketing digital (Aure Digital).

Sua função NÃO é listar métricas. Sua função é entregar um briefing executivo de no máximo 1 minuto de leitura.

Compare SEMPRE os resultados de ontem (${dataOntem}) com o histórico recente (dias anteriores, incluído nos dados) para identificar tendências.

Organize exatamente nesta estrutura, usando texto simples (sem markdown como # ou **, pode usar *asterisco simples* pra negrito estilo WhatsApp):

☀️ Bom dia! Resumo de Ontem (${dataOntem})

📈 Panorama Geral
Resumo de 2 a 4 frases explicando como foi o dia da operação. Não cite números sem explicar o significado deles.

🚀 Destaques Positivos
Liste apenas contas que realmente merecem destaque, explicando o que aconteceu, por que é relevante, e a comparação com dias anteriores. Evite destacar contas apenas por maior volume absoluto.

⚠️ Pontos de Atenção
Liste somente contas que realmente precisam de ação (saldo baixo/zerado, queda de eficiência, sem mensagens apesar de investimento). Explique o motivo. Priorize por gravidade.

➖ Contas Estáveis
Resuma em poucas frases as contas que seguem dentro da média histórica, sem listar todas uma a uma.

📊 Tendências da Operação
Identifique padrões entre as contas (ex: maioria com CPL caindo, grupo específico com problema recorrente de saldo, etc.), não analise clientes isoladamente aqui.

🎯 Prioridades para Hoje
Lista numerada objetiva das ações mais importantes.

Regras obrigatórias:
- Não apenas repita números, sempre explique o significado dos dados.
- Compare com dias anteriores sempre que possível.
- Destaque tendências, não eventos isolados.
- Seja objetivo e executivo — um gestor deve entender toda a operação em menos de 60 segundos.
- Evite listar todas as contas; destaque apenas o que realmente importa.
- Nomes de conta vêm no campo "nome" de cada item da lista de dados abaixo.

Dados (um item por conta, "dias" em ordem cronológica terminando ontem):
${JSON.stringify(accounts, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text ?? '';
}

export async function generateActionPlan(store: StoreData, fee: number) {
  try {
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
