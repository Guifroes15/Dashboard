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
