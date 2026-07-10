// ─── GRUPO YAMCOL ────────────────────────────────────────────────────────────
// Para adicionar novos meses: copie um objeto MonthData e atualize os campos.
// Para adicionar nova loja: copie o bloco de uma loja existente.

import { GroupData } from '../types';

export const YAMCOL: GroupData = {
  id: 'yamcol',
  name: 'Grupo Yamcol',
  color: '#7c3aed',
  fee: 1500,
  stores: [

    // ── MILON BOULEVARD ────────────────────────────────────────────────────
    {
      id: 'milon',
      name: 'Milon Boulevard',
      color: '#f59e0b',
      historico: [
        { mes:'Set/25', chave:'2025-09', vendas:705,     faturamentoLoja:119482.87, conversao:1.54, mensagens:130, qtdVendas:2,  ticketMedio:352.50, pctAureFat:0.59, verba:700.55  },
        { mes:'Out/25', chave:'2025-10', vendas:3003.60, faturamentoLoja:207843.43, conversao:2.58, mensagens:155, qtdVendas:4,  ticketMedio:750.90, pctAureFat:1.45, verba:1138.17 },
        { mes:'Nov/25', chave:'2025-11', vendas:4283.32, faturamentoLoja:142380.33, conversao:4.78, mensagens:251, qtdVendas:12, ticketMedio:356.94, pctAureFat:3.01, verba:1174.29 },
        { mes:'Dez/25', chave:'2025-12', vendas:0,       faturamentoLoja:422726.34, conversao:0,    mensagens:364, qtdVendas:0,  ticketMedio:0,      pctAureFat:0,    verba:1895.15 },
        { mes:'Jan/26', chave:'2026-01', vendas:1379.18, faturamentoLoja:166909.12, conversao:3.96, mensagens:101, qtdVendas:4,  ticketMedio:344.80, pctAureFat:0.83, verba:724.10  },
        { mes:'Fev/26', chave:'2026-02', vendas:4858.50, faturamentoLoja:75358.35,  conversao:7.32, mensagens:123, qtdVendas:9,  ticketMedio:539.83, pctAureFat:6.45, verba:1064.60 },
        { mes:'Mar/26', chave:'2026-03', vendas:2185.90, faturamentoLoja:145121.85, conversao:1.69, mensagens:296, qtdVendas:5,  ticketMedio:437.18, pctAureFat:1.51, verba:1332.11 },
        { mes:'Abr/26', chave:'2026-04', vendas:2176,    faturamentoLoja:187362.61, conversao:2.20, mensagens:182, qtdVendas:4,  ticketMedio:544,    pctAureFat:1.16, verba:874.49  },
        { mes:'Mai/26', chave:'2026-05', vendas:2556.27, faturamentoLoja:159601.38, conversao:11.69,mensagens:77,  qtdVendas:9,  ticketMedio:284.03, pctAureFat:1.60, verba:663.62  },
      ],
      planos: [
        { tarefa:'Aumentar volume de disparos — CMV alto exige mais vendas', status:'Alta' },
        { tarefa:'Ações sazonais com kits e combos', status:'Média' },
        { tarefa:'Diversificar criativos: testar vídeo curto', status:'Média' },
      ],
    },

    // ── VH BOULEVARD ───────────────────────────────────────────────────────
    {
      id: 'vh-boulevard',
      name: 'VH Boulevard',
      color: '#ec4899',
      historico: [
        { mes:'Jul/25', chave:'2025-07', vendas:3615,     faturamentoLoja:237195.89, conversao:0.67, mensagens:150, qtdVendas:1,  ticketMedio:3615,    pctAureFat:1.52,  verba:1368.80 },
        { mes:'Ago/25', chave:'2025-08', vendas:6186,     faturamentoLoja:259758.45, conversao:0.60, mensagens:332, qtdVendas:2,  ticketMedio:3093,    pctAureFat:2.38,  verba:1397.04 },
        { mes:'Set/25', chave:'2025-09', vendas:49449,    faturamentoLoja:243022.35, conversao:9.66, mensagens:145, qtdVendas:14, ticketMedio:3532.07, pctAureFat:20.35, verba:1430.87 },
        { mes:'Out/25', chave:'2025-10', vendas:23844,    faturamentoLoja:290839.28, conversao:6.54, mensagens:107, qtdVendas:7,  ticketMedio:3406.29, pctAureFat:8.20,  verba:1736.98 },
        { mes:'Nov/25', chave:'2025-11', vendas:61666,    faturamentoLoja:348743.93, conversao:7.66, mensagens:248, qtdVendas:19, ticketMedio:3245.58, pctAureFat:17.68, verba:2287.66 },
        { mes:'Dez/25', chave:'2025-12', vendas:85595,    faturamentoLoja:819904.90, conversao:5.19, mensagens:443, qtdVendas:23, ticketMedio:3721.52, pctAureFat:10.44, verba:5890.73 },
        { mes:'Jan/26', chave:'2026-01', vendas:38381.20, faturamentoLoja:266850.38, conversao:5.56, mensagens:198, qtdVendas:11, ticketMedio:3489.20, pctAureFat:14.38, verba:2491.70 },
        { mes:'Fev/26', chave:'2026-02', vendas:73967,    faturamentoLoja:258283.05, conversao:7.38, mensagens:244, qtdVendas:18, ticketMedio:4109.28, pctAureFat:34.23, verba:3798.86 },
        { mes:'Mar/26', chave:'2026-03', vendas:30877.41, faturamentoLoja:332614.94, conversao:7.06, mensagens:170, qtdVendas:12, ticketMedio:2573.12, pctAureFat:9.28,  verba:3374.26 },
        { mes:'Abr/26', chave:'2026-04', vendas:13276.25, faturamentoLoja:258283.05, conversao:3.13, mensagens:96,  qtdVendas:3,  ticketMedio:4425.42, pctAureFat:5.72,  verba:1625.97 },
        { mes:'Mai/26', chave:'2026-05', vendas:14352.70, faturamentoLoja:459247.43, conversao:3.48, mensagens:115, qtdVendas:4,  ticketMedio:3588.18, pctAureFat:3.13,  verba:2037.74 },
      ],
      planos: [
        { tarefa:'Manter e escalar disparos — ROI positivo consistente', status:'Alta' },
        { tarefa:'Ticket médio alto — focar em curadoria e exclusividade', status:'Alta' },
        { tarefa:'Recuperar performance de Abril', status:'Alta' },
      ],
    },

    // ── VH BOSQUE ──────────────────────────────────────────────────────────
    {
      id: 'vh-bosque',
      name: 'VH Bosque',
      color: '#8b5cf6',
      historico: [
        { mes:'Out/25', chave:'2025-10', vendas:3693,     faturamentoLoja:229373.86, conversao:1.56, mensagens:64,  qtdVendas:1,  ticketMedio:3693,    pctAureFat:1.61,  verba:1097.32 },
        { mes:'Nov/25', chave:'2025-11', vendas:0,        faturamentoLoja:294424.95, conversao:0,    mensagens:47,  qtdVendas:0,  ticketMedio:0,       pctAureFat:0,     verba:1809.72 },
        { mes:'Dez/25', chave:'2025-12', vendas:70743,    faturamentoLoja:650073.96, conversao:16,   mensagens:100, qtdVendas:16, ticketMedio:4421.44, pctAureFat:10.88, verba:2870.88 },
        { mes:'Jan/26', chave:'2026-01', vendas:9648,     faturamentoLoja:213397.05, conversao:3.45, mensagens:58,  qtdVendas:2,  ticketMedio:4824,    pctAureFat:4.90,  verba:1315.79 },
        { mes:'Fev/26', chave:'2026-02', vendas:20335,    faturamentoLoja:213397.05, conversao:8.47, mensagens:118, qtdVendas:10, ticketMedio:2033.50, pctAureFat:10.91, verba:2920.69 },
        { mes:'Mar/26', chave:'2026-03', vendas:16241.50, faturamentoLoja:227133.99, conversao:4.65, mensagens:86,  qtdVendas:4,  ticketMedio:4060.38, pctAureFat:7.15,  verba:2309.66 },
        { mes:'Abr/26', chave:'2026-04', vendas:9368.90,  faturamentoLoja:213397.05, conversao:2.86, mensagens:70,  qtdVendas:2,  ticketMedio:4684.45, pctAureFat:4.82,  verba:1007.97 },
        { mes:'Mai/26', chave:'2026-05', vendas:4775,     faturamentoLoja:394029.14, conversao:1.22, mensagens:82,  qtdVendas:1,  ticketMedio:4775,    pctAureFat:1.21,  verba:1089.57 },
      ],
      planos: [
        { tarefa:'Manter disparos — ROI positivo desde Jan/26', status:'Alta' },
        { tarefa:'Ticket médio R$4k+ — foco em curadoria premium', status:'Alta' },
        { tarefa:'Dezembro é o mês pico — preparar antecipado', status:'Média' },
      ],
    },

    // ── VH RIBEIRÃO PRETO ──────────────────────────────────────────────────
    {
      id: 'vh-ribeirao',
      name: 'VH Ribeirão Preto',
      color: '#14b8a6',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:0,       faturamentoLoja:0,          conversao:0,  mensagens:0,  qtdVendas:0, ticketMedio:0,       pctAureFat:0,    verba:279.96  },
        { mes:'Fev/26', chave:'2026-02', vendas:8831.90, faturamentoLoja:148295.28,  conversao:15, mensagens:20, qtdVendas:3, ticketMedio:2943.97, pctAureFat:5.96, verba:553.18  },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:193791.40,  conversao:0,  mensagens:32, qtdVendas:0, ticketMedio:0,       pctAureFat:0,    verba:1177.30 },
        { mes:'Abr/26', chave:'2026-04', vendas:0,       faturamentoLoja:145954.93,  conversao:0,  mensagens:49, qtdVendas:0, ticketMedio:0,       pctAureFat:0,    verba:1043.24 },
      ],
      planos: [
        { tarefa:'Operação nova — construir base de contatos urgentemente', status:'Alta' },
        { tarefa:'Aumentar volume de mensagens (apenas 20-49/mês)', status:'Alta' },
        { tarefa:'15% de conversão em Fev — escalar base qualificada', status:'Alta' },
      ],
    },

  ],
};
