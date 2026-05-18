import { GroupData } from '../types';

export const LUPO: GroupData = {
  id: 'lupo',
  name: 'Grupo Lupo',
  color: '#ec4899',
  fee: 1500,
  stores: [

    // ── LUPO CARREFOUR ────────────────────────────────────────────────────
    {
      id: 'lupo-carrefour',
      name: 'Lupo Carrefour',
      color: '#ec4899',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:10496.40, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Fev/26', chave:'2026-02', vendas:8976.90,  faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Mar/26', chave:'2026-03', vendas:13377.60, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Abr/26', chave:'2026-04', vendas:7398.60,  faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
      ],
      planos: [
        { tarefa:'Melhor loja do grupo — R$40k em 4 meses', status:'Sucesso' },
        { tarefa:'Identificar os produtos mais vendidos e ampliar disparos temáticos', status:'Alta' },
        { tarefa:'Obter dados de mensagens e conversão para análise mais precisa', status:'Alta' },
        { tarefa:'Manter estratégia atual — referência para as outras unidades', status:'Média' },
      ],
    },

    // ── LUPO BOA VISTA ────────────────────────────────────────────────────
    {
      id: 'lupo-boa-vista',
      name: 'Lupo Boa Vista',
      color: '#db2777',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:1468,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Fev/26', chave:'2026-02', vendas:1706,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Mar/26', chave:'2026-03', vendas:2700.40, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Abr/26', chave:'2026-04', vendas:2662.40, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
      ],
      planos: [
        { tarefa:'Crescimento consistente — replicar estratégia do Carrefour', status:'Alta' },
        { tarefa:'Aumentar volume de disparos para acelerar resultado', status:'Alta' },
        { tarefa:'Obter dados de mensagens e conversão', status:'Média' },
      ],
    },

    // ── LUPO PONTA NEGRA ──────────────────────────────────────────────────
    {
      id: 'lupo-ponta-negra',
      name: 'Lupo Ponta Negra',
      color: '#be185d',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:1942,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Fev/26', chave:'2026-02', vendas:2751.10, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Mar/26', chave:'2026-03', vendas:2050,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Abr/26', chave:'2026-04', vendas:6680.80, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
      ],
      planos: [
        { tarefa:'Abril explosivo (+226%) — entender o que causou e replicar', status:'Alta' },
        { tarefa:'Identificar ação ou produto que gerou pico em Abril', status:'Alta' },
        { tarefa:'Obter dados de mensagens e conversão', status:'Alta' },
      ],
    },

    // ── LUPO SUMAÚMA ──────────────────────────────────────────────────────
    {
      id: 'lupo-sumauma',
      name: 'Lupo Sumaúma',
      color: '#9d174d',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:0,       faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Fev/26', chave:'2026-02', vendas:1311,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Mar/26', chave:'2026-03', vendas:3051,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Abr/26', chave:'2026-04', vendas:843,     faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
      ],
      planos: [
        { tarefa:'Resultado inconsistente — revisar estratégia de disparos', status:'Alta' },
        { tarefa:'Replicar o que funcionou em Março (melhor mês)', status:'Alta' },
        { tarefa:'Obter dados de mensagens e conversão para diagnóstico', status:'Alta' },
      ],
    },

    // ── LUPO MANAUARA ─────────────────────────────────────────────────────
    {
      id: 'lupo-manauara',
      name: 'Lupo Manauara',
      color: '#f472b6',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:2085.10, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Fev/26', chave:'2026-02', vendas:6699,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Mar/26', chave:'2026-03', vendas:2168.50, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Abr/26', chave:'2026-04', vendas:0,       faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
      ],
      planos: [
        { tarefa:'Fevereiro foi o pico — entender o que diferenciou aquele mês', status:'Alta' },
        { tarefa:'Abril zerou — investigar motivo e retomar disparos', status:'Alta' },
        { tarefa:'Obter dados de mensagens e conversão para diagnóstico', status:'Alta' },
      ],
    },

    // ── LUPO SÃO CAETANO ──────────────────────────────────────────────────
    {
      id: 'lupo-sao-caetano',
      name: 'Lupo São Caetano',
      color: '#f9a8d4',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:0, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Fev/26', chave:'2026-02', vendas:0, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Mar/26', chave:'2026-03', vendas:0, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Abr/26', chave:'2026-04', vendas:0, faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
      ],
      planos: [
        { tarefa:'URGENTE: zero vendas em 4 meses — revisar completamente a estratégia', status:'Alta' },
        { tarefa:'Verificar se os disparos estão chegando na base correta', status:'Alta' },
        { tarefa:'Analisar perfil da base de contatos — pode estar desatualizada', status:'Alta' },
        { tarefa:'Considerar pausa para diagnóstico e replanejamento', status:'Alta' },
      ],
    },

    // ── LUPO SPORTS ───────────────────────────────────────────────────────
    {
      id: 'lupo-sports',
      name: 'Lupo Sports',
      color: '#fce7f3',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:0,       faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Fev/26', chave:'2026-02', vendas:286,     faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Mar/26', chave:'2026-03', vendas:1056,    faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
        { mes:'Abr/26', chave:'2026-04', vendas:266,     faturamentoLoja:0, conversao:0, mensagens:0, qtdVendas:0, ticketMedio:0, pctAureFat:0, verba:0 },
      ],
      planos: [
        { tarefa:'Resultado muito baixo vs. fee R$1.500 — exige revisão urgente', status:'Alta' },
        { tarefa:'Verificar público-alvo e posicionamento da loja', status:'Alta' },
        { tarefa:'Testar abordagem diferente de produto nos disparos', status:'Alta' },
        { tarefa:'Avaliar continuidade se Maio não apresentar melhora', status:'Alta' },
      ],
    },
  ],
};
