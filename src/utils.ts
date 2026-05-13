import { StoreDataV2, MonthData } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
export const FEE_MENSAL = 1500; // R$ fixo por loja

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCORE DE SAÚDE
// ─────────────────────────────────────────────────────────────────────────────
export type HealthStatus = 'saudavel' | 'atencao' | 'critico';

export interface HealthScore {
  status: HealthStatus;
  label: string;
  color: string;
  bg: string;
  score: number; // 0-100
  detalhes: { criterio: string; valor: string; pontos: number; maxPontos: number }[];
}

/**
 * Calcula score de saúde baseado nos últimos 3 meses disponíveis.
 * Critérios:
 *   - Conversão média (40pts): ≥10% = 40 | ≥5% = 28 | ≥2% = 16 | <2% = 0
 *   - Crescimento de vendas (35pts): crescendo = 35 | estável = 20 | caindo = 0
 *   - % Aure/Fat médio (25pts): ≥5% = 25 | ≥2% = 15 | ≥1% = 8 | <1% = 0
 */
export function calcHealthScore(store: StoreDataV2): HealthScore {
  const ultimos = [...store.historico].slice(-3);
  if (ultimos.length === 0) {
    return { status: 'critico', label: 'Sem dados', color: '#ef4444', bg: 'rgba(239,68,68,.1)', score: 0, detalhes: [] };
  }

  // Conversão média
  const convMedia = ultimos.reduce((a, m) => a + m.conversao, 0) / ultimos.length;
  const pontosConv = convMedia >= 10 ? 40 : convMedia >= 5 ? 28 : convMedia >= 2 ? 16 : 0;

  // Crescimento (compara primeiro e último dos 3 meses com vendas > 0)
  const comVendas = ultimos.filter(m => m.vendas > 0);
  let pontosCrescimento = 20;
  if (comVendas.length >= 2) {
    const primeiro = comVendas[0].vendas;
    const ultimo = comVendas[comVendas.length - 1].vendas;
    const delta = ((ultimo - primeiro) / primeiro) * 100;
    pontosCrescimento = delta >= 10 ? 35 : delta >= 0 ? 20 : 0;
  }

  // % Aure/Fat médio (só meses com faturamento > 0)
  const comFat = ultimos.filter(m => m.faturamentoLoja > 0);
  const pctMedia = comFat.length > 0
    ? comFat.reduce((a, m) => a + m.pctAureFat, 0) / comFat.length
    : 0;
  const pontosPct = pctMedia >= 5 ? 25 : pctMedia >= 2 ? 15 : pctMedia >= 1 ? 8 : 0;

  const total = pontosConv + pontosCrescimento + pontosPct;

  const status: HealthStatus = total >= 60 ? 'saudavel' : total >= 30 ? 'atencao' : 'critico';
  const label = status === 'saudavel' ? 'Saudável' : status === 'atencao' ? 'Atenção' : 'Crítico';
  const color = status === 'saudavel' ? '#22c55e' : status === 'atencao' ? '#f59e0b' : '#ef4444';
  const bg = status === 'saudavel' ? 'rgba(34,197,94,.1)' : status === 'atencao' ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)';

  return {
    status, label, color, bg, score: total,
    detalhes: [
      { criterio: 'Conversão média', valor: `${convMedia.toFixed(1)}%`, pontos: pontosConv, maxPontos: 40 },
      { criterio: 'Crescimento vendas', valor: comVendas.length >= 2 ? `${(((comVendas[comVendas.length-1].vendas - comVendas[0].vendas) / comVendas[0].vendas) * 100).toFixed(0)}%` : 'N/A', pontos: pontosCrescimento, maxPontos: 35 },
      { criterio: '% Aure/Faturamento', valor: `${pctMedia.toFixed(1)}%`, pontos: pontosPct, maxPontos: 25 },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROJEÇÃO DO PRÓXIMO MÊS
// ─────────────────────────────────────────────────────────────────────────────
export interface Projecao {
  valor: number;
  tendencia: 'alta' | 'baixa' | 'estavel';
  variacao: number; // % em relação à média
  baseadoEm: number; // qtd de meses usados
  label: string;    // ex: "Mai/26"
}

/**
 * Média ponderada dos últimos 3 meses com vendas > 0.
 * Peso: mês mais recente = 3, anterior = 2, mais antigo = 1.
 */
export function calcProjecao(store: StoreDataV2): Projecao {
  const comVendas = store.historico.filter(m => m.vendas > 0).slice(-3);

  if (comVendas.length === 0) {
    return { valor: 0, tendencia: 'estavel', variacao: 0, baseadoEm: 0, label: 'Próx. mês' };
  }

  const pesos = [1, 2, 3].slice(-comVendas.length);
  const somaPesos = pesos.reduce((a, p) => a + p, 0);
  const mediaSimples = comVendas.reduce((a, m) => a + m.vendas, 0) / comVendas.length;
  const mediaPonderada = comVendas.reduce((acc, m, i) => acc + m.vendas * pesos[i], 0) / somaPesos;

  const variacao = ((mediaPonderada - mediaSimples) / mediaSimples) * 100;
  const tendencia: 'alta' | 'baixa' | 'estavel' =
    variacao > 5 ? 'alta' : variacao < -5 ? 'baixa' : 'estavel';

  // Próximo mês após o último registro
  const ultimoMesChave = store.historico[store.historico.length - 1].chave;
  const [ano, mes] = ultimoMesChave.split('-').map(Number);
  const proxMes = mes === 12 ? 1 : mes + 1;
  const proxAno = mes === 12 ? ano + 1 : ano;
  const mesNomes = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const label = `${mesNomes[proxMes]}/${String(proxAno).slice(2)}`;

  return { valor: Math.round(mediaPonderada), tendencia, variacao, baseadoEm: comVendas.length, label };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROI POR LOJA
// ─────────────────────────────────────────────────────────────────────────────
export interface RoiData {
  mesLabel: string;
  vendas: number;
  fee: number;
  roi: number;        // vendas - fee (simplificado — margem seria ideal mas depende do CMV)
  roiPct: number;     // (vendas / fee - 1) * 100
  positivo: boolean;
}

export interface RoiSummary {
  meses: RoiData[];
  totalVendas: number;
  totalFee: number;
  roiTotal: number;
  roiTotalPct: number;
  mesesPositivos: number;
  mesesNegativos: number;
  status: 'positivo' | 'negativo' | 'neutro';
}

export function calcRoi(store: StoreDataV2): RoiSummary {
  // Só meses onde há fee cobrado (consideramos todos os meses do histórico)
  const meses: RoiData[] = store.historico.map(m => {
    const roi = m.vendas - FEE_MENSAL;
    const roiPct = FEE_MENSAL > 0 ? ((m.vendas / FEE_MENSAL) - 1) * 100 : 0;
    return {
      mesLabel: m.mes,
      vendas: m.vendas,
      fee: FEE_MENSAL,
      roi,
      roiPct,
      positivo: roi >= 0,
    };
  });

  const totalVendas = meses.reduce((a, m) => a + m.vendas, 0);
  const totalFee = FEE_MENSAL * meses.length;
  const roiTotal = totalVendas - totalFee;
  const roiTotalPct = totalFee > 0 ? ((totalVendas / totalFee) - 1) * 100 : 0;
  const mesesPositivos = meses.filter(m => m.positivo).length;
  const mesesNegativos = meses.length - mesesPositivos;
  const status = roiTotal > 0 ? 'positivo' : roiTotal < 0 ? 'negativo' : 'neutro';

  return { meses, totalVendas, totalFee, roiTotal, roiTotalPct, mesesPositivos, mesesNegativos, status };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RANKING MENSAGENS vs. CONVERSÃO
// ─────────────────────────────────────────────────────────────────────────────
export interface RankingItem {
  storeId: string;
  storeName: string;
  color: string;
  mensagens: number;
  conversao: number;
  vendas: number;
  eficiencia: number; // vendas por mensagem enviada
  quadrante: 'eficiente' | 'volume' | 'potencial' | 'revisar';
  // eficiente   = poucas msgs + alta conversão (modelo Osklen PVH)
  // volume      = muitas msgs + alta conversão (escalável)
  // potencial   = poucas msgs + baixa conversão (aumentar volume)
  // revisar     = muitas msgs + baixa conversão (revisar estratégia)
}

/**
 * Gera ranking usando o último mês com dados completos de cada loja.
 * Limiar: mediana de mensagens e conversão do grupo.
 */
export function calcRanking(stores: StoreDataV2[]): RankingItem[] {
  // Pega último mês com dados de cada loja
  const items = stores.map(store => {
    const ultimos = store.historico.filter(m => m.mensagens > 0);
    const ultimo = ultimos[ultimos.length - 1];
    if (!ultimo) return null;
    return {
      storeId: store.id,
      storeName: store.name,
      color: store.color,
      mensagens: ultimo.mensagens,
      conversao: ultimo.conversao,
      vendas: ultimo.vendas,
      eficiencia: ultimo.mensagens > 0 ? ultimo.vendas / ultimo.mensagens : 0,
    };
  }).filter(Boolean) as Omit<RankingItem, 'quadrante'>[];

  // Medianas
  const medianaMsg = mediana(items.map(i => i.mensagens));
  const medianaConv = mediana(items.map(i => i.conversao));

  return items.map(item => ({
    ...item,
    quadrante: (
      item.mensagens <= medianaMsg && item.conversao >= medianaConv ? 'eficiente' :
      item.mensagens > medianaMsg  && item.conversao >= medianaConv ? 'volume'    :
      item.mensagens <= medianaMsg && item.conversao < medianaConv  ? 'potencial' :
      'revisar'
    ) as RankingItem['quadrante'],
  })).sort((a, b) => b.eficiencia - a.eficiencia);
}

function mediana(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS GERAIS
// ─────────────────────────────────────────────────────────────────────────────
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}
