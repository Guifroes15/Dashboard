export interface MonthlyData {
  jan: number;
  fev: number;
  mar: number;
  abr: number;
}

export interface StoreData {
  id: string;
  name: string;
  vendas: MonthlyData;
  conversao: MonthlyData;
  mensagens: MonthlyData;
  faturamentoLoja: MonthlyData;
  color: string;
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
