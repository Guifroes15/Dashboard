import { StoreData, IdeaItem } from './types';

export const STORES: StoreData[] = [
  {
    id: 'stanley',
    name: 'Stanley',
    color: '#7c3aed',
    vendas: { jan: 383, fev: 0, mar: 2274, abr: 1804 },
    conversao: { jan: 1.04, fev: 0, mar: 4.43, abr: 3.70 },
    mensagens: { jan: 96, fev: 214, mar: 203, abr: 135 },
    faturamentoLoja: { jan: 383, fev: 0, mar: 2274, abr: 41537 },
    planos: [
      { tarefa: 'Reconhecimento no shopping', status: 'Alta' },
      { tarefa: 'Fortalecer Grupo VIP', status: 'Alta' },
      { tarefa: 'Gerenciar volume alto de mensagens', status: 'Média' },
      { tarefa: 'Ações sazonais (Dia dos namorados, dia dos Pais, Black Friday)', status: 'Média' },
    ]
  },
  {
    id: 'tommy',
    name: 'Tommy',
    color: '#22c55e',
    vendas: { jan: 2274, fev: 0, mar: 3508, abr: 5087 },
    conversao: { jan: 7.55, fev: 0, mar: 5.39, abr: 25 },
    mensagens: { jan: 53, fev: 0, mar: 167, abr: 32 },
    faturamentoLoja: { jan: 2274, fev: 0, mar: 3508, abr: 118674 },
    planos: [
      { tarefa: 'Fortalecer Grupo VIP', status: 'Alta' },
      { tarefa: 'Testar página de Grupo VIP', status: 'Teste' },
      { tarefa: 'Testar Guia Namorados', status: 'Média' },
      { tarefa: 'Disparos segmentados', status: 'Média' },
    ]
  },
  {
    id: 'vh-fortaleza',
    name: 'VH Fortaleza',
    color: '#f59e0b',
    vendas: { jan: 0, fev: 1630, mar: 695, abr: 644 },
    conversao: { jan: 0, fev: 0.93, mar: 2.55, abr: 0.84 },
    mensagens: { jan: 0, fev: 79, mar: 157, abr: 119 },
    faturamentoLoja: { jan: 0, fev: 200000, mar: 122000, abr: 97000 },
    planos: [
      { tarefa: 'Testar página Grupo VIP', status: 'Alta' },
      { tarefa: 'Testar guia interativo de vendas', status: 'Alta' },
      { tarefa: 'Disparo para base inativa', status: 'Média' },
      { tarefa: 'Revisão de segmentação', status: 'Média' },
    ]
  },
  {
    id: 'osklen-manaus',
    name: 'Osklen Manaus',
    color: '#a78bfa',
    vendas: { jan: 0, fev: 2894, mar: 2174, abr: 3687 },
    conversao: { jan: 0, fev: 6.60, mar: 2.11, abr: 9.09 },
    mensagens: { jan: 0, fev: 106, mar: 142, abr: 77 },
    faturamentoLoja: { jan: 0, fev: 91000, mar: 196000, abr: 114000 },
    planos: [
      { tarefa: 'Fazer mais disparos', status: 'Alta' },
      { tarefa: 'Diversificar criativo (testar vídeo ao invés de só imagens)', status: 'Média' },
    ]
  },
  {
    id: 'osklen-pvh',
    name: 'Osklen PVH',
    color: '#ef4444',
    vendas: { jan: 0, fev: 515, mar: 2134, abr: 7257 },
    conversao: { jan: 0, fev: 3.75, mar: 4.62, abr: 20 },
    mensagens: { jan: 0, fev: 80, mar: 65, abr: 40 },
    faturamentoLoja: { jan: 0, fev: 31000, mar: 58000, abr: 44000 },
    planos: [
      { tarefa: 'Fazer mais disparos', status: 'Alta' },
      { tarefa: 'Diversificar criativo (testar vídeo ao invés de só imagens)', status: 'Média' },
    ]
  }
];

export const IDEAS: IdeaItem[] = [
  {
    id: 'namorados',
    title: '🎁 Guia de Presentes: Dia dos Namorados',
    description: 'Um fluxo interativo onde o cliente responde 3 perguntas rápidas e recebe uma curadoria personalizada de produtos. Focado em facilitar a decisão de compra e gerar lead qualificado para o WhatsApp.',
    fluxo: 'Perfil do Parceiro → Faixa de Preço → Sugestão Direta (+Botão WhatsApp)',
    temas: ['Romance Moderno', 'Premium Dark', 'Elegante'],
    elementos: ['Quiz de Personalidade', 'Galeria de Destaques', 'CTA Direto'],
    url: 'https://dia-dos-namorados-xi-two.vercel.app/'
  },
  {
    id: 'vip',
    title: '💎 Experiência Grupo VIP',
    description: 'Landing page de alta conversão para recrutamento de novos membros para o grupo exclusivo. Design luxuoso com foco em escassez e benefícios únicos (lançamentos antecipados e mimos exclusivos).',
    fluxo: 'Promessa de Exclusividade → Benefícios → Entrada no Grupo',
    temas: ['Luxo Minimalista', 'Gold & Black', 'Modern Business'],
    elementos: ['Lista de Benefícios', 'Contador de Vagas (Gatilho)', 'Depoimentos'],
    url: 'https://grupo-vip-zeta.vercel.app/'
  }
];

