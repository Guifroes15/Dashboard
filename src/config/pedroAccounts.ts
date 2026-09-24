// Contas externas liberadas pro acesso restrito do Pedro Reis — não fazem
// parte dos grupos/lojas da Aure, existem só pra esse login ver em Feedbacks
// Meta e Saldo Meta Ads (ver escopoRestrito em AccessGate.tsx e App.tsx).
//
// Gerado a partir da planilha "Dash Clientes - Luiz (GT-Pedro)" (aba Clientes),
// com cada ID conferido na Graph API. Pra atualizar: soltar a planilha nova
// em importacoes/pedro/ e pedir pro Claude reimportar.
//
// Marcadas "aguardando permissão": o ID veio da planilha, mas o token do
// dashboard (usuário de sistema do Elisson) ainda não tem acesso a essa conta —
// compartilhar no Business Manager. Aparecem com erro até isso acontecer.
//
// Ficaram de fora: Carriella e Lojas Rivest (sem ID na planilha), Usaflex BH
// (mesma conta do Usaflex Montes Claros) e Victor Hugo Belém (mesma conta do
// Victor Hugo Bosque) — as duas duplas aparecem juntas numa entrada só.
export interface PedroAccount {
  id: string;
  name: string;
  color: string;
  metaAccountId: string;
}

export const PEDRO_ACCOUNTS: PedroAccount[] = [
  { id: 'melissa-boulevard-shopping', name: 'Melissa Boulevard Shopping', color: '#f97316', metaAccountId: 'act_1364581681096858' },
  { id: 'melissa-shopping-contagem', name: 'Melissa Shopping Contagem', color: '#3b82f6', metaAccountId: 'act_406708722029050' },
  { id: 'democrata-montes-claros', name: 'Democrata Montes Claros', color: '#0ea5e9', metaAccountId: 'act_1321196572956047' },
  { id: 'democrata-ipatinga', name: 'Democrata Ipatinga', color: '#22c55e', metaAccountId: 'act_1711341659402927' },
  { id: 'usaflex-montes-claros-bh', name: 'Usaflex Montes Claros / BH', color: '#16a34a', metaAccountId: 'act_710672486246103' },
  { id: 'usaflex-divinopolis', name: 'Usaflex Divinópolis', color: '#ec4899', metaAccountId: 'act_511769564523502' },
  { id: 'usaflex-governador-valadares', name: 'Usaflex Governador Valadares', color: '#a855f7', metaAccountId: 'act_2379086358962477' },
  { id: 'usaflex-ipatinga', name: 'Usaflex Ipatinga', color: '#eab308', metaAccountId: 'act_1907123359748461' },
  { id: 'moda-cia-mucuri', name: 'Moda & Cia Mucuri', color: '#f43f5e', metaAccountId: 'act_26048796598037849' },
  { id: 'moda-cia-itabata', name: 'Moda & Cia Itabatã', color: '#8b5cf6', metaAccountId: 'act_1600162141436862' },
  { id: 'moda-cia-nanuque', name: 'Moda & Cia Nanuque', color: '#06b6d4', metaAccountId: 'act_1151212138354618' },  // aguardando permissão
  { id: 'moda-cia-posto-da-mata-03', name: 'Moda & Cia Posto da Mata 03', color: '#84cc16', metaAccountId: 'act_1477696233714408' },
  { id: 'moda-cia-posto-da-mata-04', name: 'Moda & Cia Posto da Mata 04', color: '#f59e0b', metaAccountId: 'act_26063491653267920' },
  { id: 'sapataria-fortaleza', name: 'Sapataria Fortaleza', color: '#d946ef', metaAccountId: 'act_667000970025879' },
  { id: 'casa-braganca-santa-rita-start', name: 'Casa Bragança - Santa Rita (Start)', color: '#0d9488', metaAccountId: 'act_587409060464514' },
  { id: 'casa-braganca-cambui', name: 'Casa Bragança - Cambuí', color: '#fb923c', metaAccountId: 'act_588573863971907' },
  { id: 'rovany-modas', name: 'Rovany Modas', color: '#64748b', metaAccountId: 'act_1370177569804352' },
  { id: 'ca-jorge-bischoff-bh-shopping', name: 'CA - Jorge Bischoff BH Shopping', color: '#38bdf8', metaAccountId: 'act_276212312162193' },
  { id: 'breder-lupo', name: 'Breder Lupo', color: '#f97316', metaAccountId: 'act_1540547014084045' },
  { id: 'lojas-breder', name: 'Lojas Breder', color: '#3b82f6', metaAccountId: 'act_700582119037857' },
  { id: 'hope-shopping-vila-velha', name: 'Hope Shopping Vila Velha', color: '#0ea5e9', metaAccountId: 'act_26040126172295531' },
  { id: 'hope-praia-da-costa', name: 'Hope Praia da Costa', color: '#22c55e', metaAccountId: 'act_2838823269624412' },
  { id: 'usaflex-avenida-center-maringa-pr', name: 'Usaflex Avenida Center - Maringá-PR', color: '#16a34a', metaAccountId: 'act_2216629758685437' },
  { id: 'usaflex-maringa-park', name: 'Usaflex Maringá Park', color: '#ec4899', metaAccountId: 'act_520031450590962' },
  { id: 'tricolandia-artesanatos', name: 'Tricolândia Artesanatos', color: '#a855f7', metaAccountId: 'act_635000345574936' },
  { id: 'tricolandia-festas', name: 'Tricolândia Festas', color: '#eab308', metaAccountId: 'act_1051733943385648' },
  { id: 'milon', name: 'Milon', color: '#f43f5e', metaAccountId: 'act_1155969356388532' },
  { id: 'victor-hugo-bosque-belem', name: 'Victor Hugo Bosque / Belém', color: '#8b5cf6', metaAccountId: 'act_739663585617111' },
  { id: 'victor-hugo-ribeirao', name: 'Victor Hugo Ribeirão', color: '#06b6d4', metaAccountId: 'act_1513320246332787' },
  { id: 'victor-hugo-manauara', name: 'Victor Hugo Manauara', color: '#84cc16', metaAccountId: 'act_987229157329989' },
  { id: 'puca-estrela', name: 'Puca Estrela', color: '#f59e0b', metaAccountId: 'act_1793623881223925' },
  { id: 'magazine-da-lingerie', name: 'Magazine da Lingerie', color: '#d946ef', metaAccountId: 'act_27114057151610239' },
  { id: 're-sales', name: 'Re Sales', color: '#0d9488', metaAccountId: 'act_1288599192533463' },
  { id: 'razor-bros', name: 'Razor Bros', color: '#fb923c', metaAccountId: 'act_1357639658627665' },  // aguardando permissão
  { id: 'lojas-vitan', name: 'Lojas Vitan', color: '#64748b', metaAccountId: 'act_1550118386542680' },
  { id: 'atitude-news', name: 'Atitude News', color: '#38bdf8', metaAccountId: 'act_2230118027763937' },  // aguardando permissão
  { id: 'luz-da-lua-l-v-velasco', name: 'Luz da Lua L V Velasco', color: '#f97316', metaAccountId: 'act_522497889354100' },
  { id: 'luz-da-lua-galdino-ribeiro', name: 'Luz da Lua Galdino Ribeiro', color: '#3b82f6', metaAccountId: 'act_1129052142769226' },
];
