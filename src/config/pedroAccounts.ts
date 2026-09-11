// Contas externas liberadas pro acesso restrito do Pedro Reis — não fazem
// parte dos grupos/lojas da Aure, existem só pra esse login ver em Feedbacks
// Meta e Saldo Meta Ads (ver escopoRestrito em AccessGate.tsx e App.tsx).
//
// IDs confirmados direto na Graph API. As com o comentário "aguardando
// permissão" existem de verdade (a Graph API confirma), mas o token que
// o dashboard usa (usuário de sistema do Elisson) ainda não tem acesso
// liberado a elas — precisa o Guilherme compartilhar essas contas com
// esse usuário de sistema no Business Manager (Configurações do Negócio →
// Contas de anúncio → selecionar → atribuir usuário de sistema). Depois
// disso elas passam a funcionar sozinhas, sem precisar mexer aqui de novo.
//
// Ainda faltam (vieram corrompidas ou com ID incerto no print, pedir de
// novo pro Guilherme/Pedro): Hope Shopping Vila Velha, Hope Praia da
// Costa, Carriella, Magazine da Lingerie, Casa Bragança - Cambuí, e
// Victor Hugo Bosque/Belém/Ribeirão (os 3 vieram com o mesmo ID de 14
// dígitos, o que sugere corte no meio do número — só a Victor Hugo
// Manauara veio com ID completo e íntegro).
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

  // Confirmadas na API (nome bateu certinho e o token já tem acesso):
  { id: 'victor-hugo-manauara',         name: 'Victor Hugo Manauara',                color: '#f59e0b', metaAccountId: 'act_987229157329989' },
  { id: 'puca-estrela',                 name: 'Puca Estrela',                        color: '#d946ef', metaAccountId: 'act_1793623881223925' },
  { id: 're-sales',                     name: 'Re Sales',                            color: '#0d9488', metaAccountId: 'act_1288599192533463' },

  // ID existe de verdade na Graph API, mas aguardando o Guilherme liberar
  // acesso pro usuário de sistema no Business Manager (ver comentário no
  // topo do arquivo) — aparecem com erro de permissão até isso acontecer.
  { id: 'milon',                        name: 'Milon',                               color: '#fb923c', metaAccountId: 'act_155969356388532' },
  { id: 'razor-bros',                   name: 'Razor Bros',                          color: '#64748b', metaAccountId: 'act_1376396568276650' },
  { id: 'lojas-vitan',                  name: 'Lojas Vitan',                         color: '#94a3b8', metaAccountId: 'act_1550118365426800' },
  { id: 'atitude-news',                 name: 'Atitude News',                        color: '#facc15', metaAccountId: 'act_2230118027763937' },
  { id: 'luz-da-lua-lv-velasco',        name: 'Luz da Lua L V Velasco',              color: '#38bdf8', metaAccountId: 'act_5224788939451003' },
  { id: 'luz-da-lua-galdino-ribeiro',   name: 'Luz da Lua Galdino Ribeiro',          color: '#0284c7', metaAccountId: 'act_1129052142902603' },
];
