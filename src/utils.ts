import { StoreDataV2, MonthData } from './types';

export const FEE_MENSAL = 1500;

// ─── 1. SCORE DE SAÚDE ──────────────────────────────────────────────────────
export type HealthStatus = 'saudavel' | 'atencao' | 'critico';

export interface HealthScore {
  status: HealthStatus;
  label: string;
  color: string;
  bg: string;
  score: number;
  detalhes: { criterio: string; valor: string; pontos: number; maxPontos: number }[];
}

export function calcHealthScore(store: StoreDataV2): HealthScore {
  const ultimos = [...store.historico].slice(-3);
  if (ultimos.length === 0)
    return { status:'critico', label:'Sem dados', color:'#ef4444', bg:'rgba(239,68,68,.1)', score:0, detalhes:[] };

  const convMedia = ultimos.reduce((a, m) => a + m.conversao, 0) / ultimos.length;
  const pontosConv = convMedia >= 10 ? 40 : convMedia >= 5 ? 28 : convMedia >= 2 ? 16 : 0;

  const comVendas = ultimos.filter(m => m.vendas > 0);
  let pontosCrescimento = 20;
  if (comVendas.length >= 2) {
    const delta = ((comVendas[comVendas.length-1].vendas - comVendas[0].vendas) / comVendas[0].vendas) * 100;
    pontosCrescimento = delta >= 10 ? 35 : delta >= 0 ? 20 : 0;
  }

  const comFat = ultimos.filter(m => m.faturamentoLoja > 0);
  const pctMedia = comFat.length > 0 ? comFat.reduce((a, m) => a + m.pctAureFat, 0) / comFat.length : 0;
  const pontosPct = pctMedia >= 5 ? 25 : pctMedia >= 2 ? 15 : pctMedia >= 1 ? 8 : 0;

  const total = pontosConv + pontosCrescimento + pontosPct;
  const status: HealthStatus = total >= 60 ? 'saudavel' : total >= 30 ? 'atencao' : 'critico';
  const label = status === 'saudavel' ? 'Saudável' : status === 'atencao' ? 'Atenção' : 'Crítico';
  const color = status === 'saudavel' ? '#22c55e' : status === 'atencao' ? '#f59e0b' : '#ef4444';
  const bg    = status === 'saudavel' ? 'rgba(34,197,94,.1)' : status === 'atencao' ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)';

  return {
    status, label, color, bg, score: total,
    detalhes: [
      { criterio:'Conversão média', valor:`${convMedia.toFixed(1)}%`, pontos:pontosConv, maxPontos:40 },
      {
        criterio:'Crescimento vendas',
        valor: comVendas.length >= 2
          ? `${(((comVendas[comVendas.length-1].vendas - comVendas[0].vendas) / comVendas[0].vendas)*100).toFixed(0)}%`
          : 'N/A',
        pontos:pontosCrescimento, maxPontos:35,
      },
      { criterio:'% Aure/Faturamento', valor:`${pctMedia.toFixed(1)}%`, pontos:pontosPct, maxPontos:25 },
    ],
  };
}

// ─── 2. PROJEÇÃO DO PRÓXIMO MÊS ─────────────────────────────────────────────
export interface Projecao {
  valor: number;
  tendencia: 'alta' | 'baixa' | 'estavel';
  variacao: number;
  baseadoEm: number;
  label: string;
}

export function calcProjecao(store: StoreDataV2): Projecao {
  const comVendas = store.historico.filter(m => m.vendas > 0).slice(-3);
  if (comVendas.length === 0)
    return { valor:0, tendencia:'estavel', variacao:0, baseadoEm:0, label:'Próx. mês' };

  const pesos = [1, 2, 3].slice(-comVendas.length);
  const somaPesos = pesos.reduce((a, p) => a + p, 0);
  const mediaSimples = comVendas.reduce((a, m) => a + m.vendas, 0) / comVendas.length;
  const mediaPonderada = comVendas.reduce((acc, m, i) => acc + m.vendas * pesos[i], 0) / somaPesos;

  const variacao = ((mediaPonderada - mediaSimples) / mediaSimples) * 100;
  const tendencia: 'alta' | 'baixa' | 'estavel' = variacao > 5 ? 'alta' : variacao < -5 ? 'baixa' : 'estavel';

  const ultimoChave = store.historico[store.historico.length - 1].chave;
  const [ano, mes] = ultimoChave.split('-').map(Number);
  const proxMes = mes === 12 ? 1 : mes + 1;
  const proxAno = mes === 12 ? ano + 1 : ano;
  const nomes = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  return {
    valor: Math.round(mediaPonderada),
    tendencia, variacao,
    baseadoEm: comVendas.length,
    label: `${nomes[proxMes]}/${String(proxAno).slice(2)}`,
  };
}

// ─── 3. ROI — fee + verba de mídia ──────────────────────────────────────────
export interface RoiMesData {
  mesLabel: string;
  vendas: number;
  fee: number;
  verba: number;
  custoTotal: number;   // fee + verba
  roi: number;          // vendas - custoTotal
  roiPct: number;       // (vendas / custoTotal - 1) * 100
  positivo: boolean;
}

export interface RoiSummary {
  meses: RoiMesData[];
  totalVendas: number;
  totalFee: number;
  totalVerba: number;
  totalCusto: number;
  roiTotal: number;
  roiTotalPct: number;
  mesesPositivos: number;
  mesesNegativos: number;
  status: 'positivo' | 'negativo' | 'neutro';
}

export function calcRoi(store: StoreDataV2): RoiSummary {
  const meses: RoiMesData[] = store.historico.map(m => {
    const custoTotal = FEE_MENSAL + m.verba;
    const roi = m.vendas - custoTotal;
    const roiPct = custoTotal > 0 ? ((m.vendas / custoTotal) - 1) * 100 : 0;
    return {
      mesLabel: m.mes,
      vendas: m.vendas,
      fee: FEE_MENSAL,
      verba: m.verba,
      custoTotal,
      roi,
      roiPct,
      positivo: roi >= 0,
    };
  });

  const totalVendas  = meses.reduce((a, m) => a + m.vendas, 0);
  const totalFee     = FEE_MENSAL * meses.length;
  const totalVerba   = meses.reduce((a, m) => a + m.verba, 0);
  const totalCusto   = totalFee + totalVerba;
  const roiTotal     = totalVendas - totalCusto;
  const roiTotalPct  = totalCusto > 0 ? ((totalVendas / totalCusto) - 1) * 100 : 0;
  const mesesPositivos = meses.filter(m => m.positivo).length;
  const status = roiTotal > 0 ? 'positivo' : roiTotal < 0 ? 'negativo' : 'neutro';

  return {
    meses, totalVendas, totalFee, totalVerba,
    totalCusto, roiTotal, roiTotalPct,
    mesesPositivos, mesesNegativos: meses.length - mesesPositivos, status,
  };
}

// ─── 4. RANKING MENSAGENS vs. CONVERSÃO ─────────────────────────────────────
export interface RankingItem {
  storeId: string;
  storeName: string;
  color: string;
  mensagens: number;
  conversao: number;
  vendas: number;
  eficiencia: number;
  quadrante: 'eficiente' | 'volume' | 'potencial' | 'revisar';
}

function mediana(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m-1] + s[m]) / 2;
}

export function calcRanking(stores: StoreDataV2[]): RankingItem[] {
  const items = stores.map(store => {
    const comDados = store.historico.filter(m => m.mensagens > 0);
    const ultimo = comDados[comDados.length - 1];
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

  const medMsg  = mediana(items.map(i => i.mensagens));
  const medConv = mediana(items.map(i => i.conversao));

  return items.map(item => ({
    ...item,
    quadrante: (
      item.mensagens <= medMsg && item.conversao >= medConv ? 'eficiente' :
      item.mensagens >  medMsg && item.conversao >= medConv ? 'volume'    :
      item.mensagens <= medMsg && item.conversao <  medConv ? 'potencial' :
      'revisar'
    ) as RankingItem['quadrante'],
  })).sort((a, b) => b.eficiencia - a.eficiencia);
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}
