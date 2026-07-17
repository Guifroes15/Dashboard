export type UserRole = 'admin' | 'staff' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  groupIds?: string[] | 'all';
}

export const GROUPS_CONFIG = [
  { id: 'barbosa',   name: 'Grupo Barbosa',   color: '#3B82F6' },
  { id: 'paralelas', name: 'Grupo Paralelas', color: '#10B981' },
  { id: 'lupo',      name: 'Grupo Lupo',      color: '#EF4444' },
  { id: 'ferracini', name: 'Grupo Ferracini', color: '#F59E0B' },
];

export interface MonthData {
  mes: string;
  chave: string;
  vendas: number;
  faturamentoLoja: number;
  conversao: number;
  mensagens: number;
  qtdVendas: number;
  ticketMedio: number;
  pctAureFat: number;
  verba: number;
}

export interface PlanItem {
  tarefa: string;
  status: 'Alta' | 'Média' | 'Baixa' | 'Sucesso' | 'Teste';
}

export interface OtimizacaoItem {
  id: string;
  data: string;      // YYYY-MM-DD — data em que a otimização foi feita (pode ser retroativa)
  descricao: string; // o que foi mudado (ex: "Aumentei orçamento de R$50 pra R$80 na campanha X")
  autor: string;      // nome de quem registrou
  criadoEm: string;   // timestamp ISO de quando foi lançado no sistema
}

export interface ReuniaoItem {
  id: string;
  data: string;       // YYYY-MM-DD — data em que a reunião foi feita
  observacao?: string;
  autor: string;
  criadoEm: string;
}

export interface StoreData {
  id: string;
  name: string;
  color: string;
  fee?: number;
  historico: MonthData[];
  planos: PlanItem[];
  otimizacoes?: OtimizacaoItem[];
  reunioes?: ReuniaoItem[];
  metaAccountId?: string; // act_XXXX — sobrescreve o mapeamento estático em metaAccounts.ts quando presente
}

export interface GroupData {
  id: string;
  name: string;
  color: string;
  fee: number;
  stores: StoreData[];
}

export interface SimuladorInput {
  verbaPlanning: number;
  mensagensPlanning: number;
}

export interface SimuladorResult {
  pessimista: number;
  base: number;
  otimista: number;
  custoTotal: number;
  roiPessimista: number;
  roiBase: number;
  roiOtimista: number;
  convMediaHist: number;
  ticketMedioHist: number;
  rPerMsgHist: number;
  mesesUsados: number;
  metodo: 'conv+ticket' | 'r-por-msg' | 'media-historica';
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  fluxo?: string;
  temas?: string[];
  elementos?: string[];
  url?: string;
}
