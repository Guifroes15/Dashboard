// Mapeamento storeId → Ad Account ID do Meta
export const META_ACCOUNTS: Record<string, string> = {
  // Grupo Barbosa
  'barbosa-calcados': 'act_1178750667162275',
  'arezzo':           'act_4081176875538396',
  'sirigaita':        'act_1303445614313087',
  'zoom':             'act_1416126299498677',
  'flags':            'act_1411702346977537',

  // Grupo Paralelas
  'paralelas-dom-luis':   'act_1063440691350368',
  'paralelas-monumental': 'act_484251287405568',
  'paralelas-reserva':    'act_558018988137615',

  // Grupo Ferracini (Americana, Valinhos e Villa Romana não são mais atendidas)
  'ferracini-piracicaba':   'act_1013886770432374',

  // Grupo Lupo
  'lupo-boa-vista':    'act_946974293600178',
  'lupo-carrefour':    'act_1898748837226656',
  'lupo-manauara':     'act_1908312336258416', // mesma conta (Manauara/Ponta Negra/Sumaúma)
  'lupo-ponta-negra':  'act_1908312336258416', // mesma conta (Manauara/Ponta Negra/Sumaúma)
  'lupo-sao-caetano':  'act_1673371776754441',
  'lupo-sports':       'act_1845155085964818',
  'lupo-sumauma':      'act_1908312336258416', // mesma conta (Manauara/Ponta Negra/Sumaúma)

  // Clientes avulsos
  'amo-outlet':          'act_454683831725906',
  'anjo-colours':        'act_1147859020455957',
  'b201':                'act_1402987621169330',
  'carrano':             'act_1495252901655411',
  'democrata-rio-verde': 'act_1366988761930824',
  'guapa':               'act_762506169917049',
  'taco-montes-claros':  'act_1537993077200896',
  'valenze':             'act_982882594777983',
  'americos-calcados':   'act_1596462802205733',
  'americos-calcados-2': 'act_1447709487166465',
  'americos-calcados-3': 'act_1670310224049944',
  'sonho-dos-pes-colatina':    'act_2196645040702961',
  'sonho-dos-pes-linhares':    'act_1616937730154333',
  'sonho-dos-pes-sao-mateus':  'act_1570496831486634',
};

// Lojas criadas via Onboarding levam o próprio act_ID direto no Firestore
// (store.metaAccountId), sem precisar editar este arquivo e fazer deploy.
// Esse mapa estático continua valendo como fallback pras contas antigas.
export function getAdAccountId(store: { id: string; metaAccountId?: string }): string | undefined {
  return store.metaAccountId || META_ACCOUNTS[store.id];
}
