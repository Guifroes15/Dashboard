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
  verba: number; // investimento em mídia naquele mês
}

export interface StoreDataV2 {
  id: string;
  name: string;
  color: string;
  historico: MonthData[];
  planos: { tarefa: string; status: 'Alta' | 'Média' | 'Baixa' | 'Sucesso' | 'Teste' }[];
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
