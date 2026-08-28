// ─── GRUPO FERRACINI ─────────────────────────────────────────────────────────
// Fee: R$ 1.700/loja
// Americana, Valinhos e Villa Romana não são mais atendidas (removidas do grupo).

import { GroupData } from '../types';

export const FERRACINI: GroupData = {
  id: 'ferracini',
  name: 'Grupo Ferracini',
  color: '#8b5cf6',
  fee: 1700,
  stores: [

    // ── FERRACINI PIRACICABA ──────────────────────────────────────────────
    {
      id: 'ferracini-piracicaba',
      name: 'Ferracini Piracicaba',
      color: '#6d28d9',
      fee: 1700,
      historico: [
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:0,        conversao:0,    mensagens:0,   qtdVendas:0, ticketMedio:0,      pctAureFat:0,    verba:477.91 },
        { mes:'Abr/26', chave:'2026-04', vendas:3019.10, faturamentoLoja:72296.49, conversao:4.00, mensagens:150, qtdVendas:6, ticketMedio:503.18, pctAureFat:4.18, verba:743.34 },
      ],
      planos: [
        { tarefa:'Março sem disparos — garantir continuidade a partir de Maio', status:'Alta' },
        { tarefa:'Primeiro mês com resultado (Abril) já com 4% conversão e R$503 ticket', status:'Sucesso' },
        { tarefa:'Aumentar frequência de disparos — potencial alto pelo faturamento da loja', status:'Alta' },
      ],
    },

  ],
};
