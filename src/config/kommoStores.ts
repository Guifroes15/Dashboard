// Lista de storeIds que têm Kommo configurado — só os IDs, sem token nenhum
// (isso aqui vai pro navegador normalmente). O token de cada um fica só no
// servidor, na variável de ambiente KOMMO_ACCOUNTS (ver api/kommo.ts).
//
// Precisa bater exatamente com as chaves usadas em KOMMO_ACCOUNTS na Vercel —
// adicione um storeId aqui só depois de configurar o token dele lá.
export const KOMMO_STORES: string[] = [
  'amo-outlet',
  'arezzo',
  'b201',
  'barbosa-calcados',
  'carrano',
  'democrata-rio-verde',
  'ferracini-villa-romana',
  'ferracini-piracicaba',
  'flags',
  'guapa',
  'paralelas-dom-luis',
  'paralelas-monumental',
  'paralelas-reserva',
  'sirigaita',
  'zoom',
];
