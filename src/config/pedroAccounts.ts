// Contas externas liberadas pro acesso restrito do Pedro Reis — não fazem
// parte dos grupos/lojas da Aure, existem só pra esse login ver em Feedbacks
// Meta e Saldo Meta Ads (ver escopoRestrito em AccessGate.tsx e App.tsx).
//
// IDs confirmados direto na Graph API. Faltam ~15 contas do print original
// que vieram sem ID legível (Hope Shopping, Puca Estrela, Victor Hugo etc.)
// — adicionar aqui quando o Guilherme mandar os IDs certos.
export interface PedroAccount {
  id: string;
  name: string;
  color: string;
  metaAccountId: string;
}

export const PEDRO_ACCOUNTS: PedroAccount[] = [
  { id: 'melissa-shopping-contagem',    name: 'Melissa Shopping Contagem',           color: '#f97316', metaAccountId: 'act_406708722029050' },
  { id: 'democrata-montes-claros',      name: 'Democrata Montes Claros',             color: '#3b82f6', metaAccountId: 'act_1321196572956047' },
  { id: 'democrata-ipatinga',           name: 'Democrata Ipatinga',                  color: '#0ea5e9', metaAccountId: 'act_1711341659402927' },
  { id: 'usaflex-montes-claros',        name: 'Usaflex Montes Claros',               color: '#22c55e', metaAccountId: 'act_710672486246103' },
  { id: 'usaflex-divinopolis',          name: 'Usaflex Divinópolis',                 color: '#16a34a', metaAccountId: 'act_511769564523502' },
  { id: 'usaflex-governador-valadares', name: 'Usaflex Governador Valadares',        color: '#15803d', metaAccountId: 'act_2379086358962477' },
  { id: 'usaflex-ipatinga',             name: 'Usaflex Ipatinga',                    color: '#166534', metaAccountId: 'act_1907123359748461' },
  { id: 'sapataria-fortaleza',          name: 'Sapataria Fortaleza',                 color: '#ec4899', metaAccountId: 'act_667000970025879' },
  { id: 'casa-braganca-santa-rita',     name: 'Casa Bragança - Santa Rita (Start)',  color: '#a855f7', metaAccountId: 'act_587409060464514' },
  { id: 'rovany-modas',                 name: 'Rovany Modas',                        color: '#eab308', metaAccountId: 'act_1370177569804352' },
  { id: 'jorge-bischoff-bh-shopping',   name: 'CA - Jorge Bischoff BH Shopping',     color: '#f43f5e', metaAccountId: 'act_276212312162193' },
  { id: 'breder-lupo',                  name: 'Breder Lupo',                         color: '#8b5cf6', metaAccountId: 'act_1540547014084045' },
  { id: 'lojas-breder',                 name: 'Lojas Breder',                        color: '#7c3aed', metaAccountId: 'act_700582119037857' },
  { id: 'usaflex-avenida-center-maringa', name: 'Usaflex Avenida Center - Maringá-PR', color: '#06b6d4', metaAccountId: 'act_2216629758685437' },
  { id: 'usaflex-maringa-park',         name: 'Usaflex Maringá Park',                color: '#0891b2', metaAccountId: 'act_520031450590962' },
  { id: 'tricolandia-artesanatos',      name: 'Tricolândia Artesanatos',             color: '#84cc16', metaAccountId: 'act_635000345574936' },
  { id: 'tricolandia-festas',           name: 'Tricolândia Festas',                  color: '#65a30d', metaAccountId: 'act_1051733943385648' },
];
