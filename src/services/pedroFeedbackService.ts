import { FeedbackData } from './metaService';

// Mesmo template de mensagem que o Guilherme já usa (Feedbacks Meta da Aure),
// só que com a comparação da semana anterior acrescentada em cada linha —
// era pra ser assim desde o início, não um formato novo.

function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}

// Acrescenta a comparação com a semana anterior no final da linha — sem
// mudar nada do formato original, só adiciona o pedaço "(semana passada: ...)".
function comparativo(anterior: number | null | undefined, atual: number, formatador: (v: number) => string): string {
  if (anterior === null || anterior === undefined) return '';
  if (anterior === 0) return atual > 0 ? ' (novo essa semana)' : '';
  const delta = ((atual - anterior) / anterior) * 100;
  const sinal = delta >= 0 ? '+' : '';
  const deltaFmt = delta.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return ` (semana passada: ${formatador(anterior)} | ${sinal}${deltaFmt}%)`;
}

export function buildComparativoMessage(name: string, data: FeedbackData, anterior: FeedbackData | null): string {
  const dateRange = `(${fmtDate(data.dateStart)} a ${fmtDate(data.dateStop)})`;
  const lines: string[] = [
    `Olá pessoal! Excelente sexta-feira para todos!🚀`,
    `📆 Passando para mostrar os investimentos e resultados desses últimos 7 dias.`,
    dateRange,
    `🔵No Meta🔵`,
    `Total Investido: R$ ${fmtBRL(data.totalSpend)}${comparativo(anterior?.totalSpend, data.totalSpend, v => `R$ ${fmtBRL(v)}`)}`,
  ];

  if (data.mensagem) {
    const m = data.mensagem;
    lines.push(`💵Investimento Mensagem: R$ ${fmtBRL(m.spend)}${comparativo(anterior?.mensagem?.spend, m.spend, v => `R$ ${fmtBRL(v)}`)}`);
    lines.push(`🎯 Mensagens: ${fmtNumber(m.mensagens)}${comparativo(anterior?.mensagem?.mensagens, m.mensagens, fmtNumber)}`);
    lines.push(`💲Custo por mensagem: R$ ${fmtBRL(m.custoMensagem)}${comparativo(anterior?.mensagem?.custoMensagem, m.custoMensagem, v => `R$ ${fmtBRL(v)}`)}`);
  }

  if (data.secundaria) {
    const sec = data.secundaria;
    const secAnteriorRaw = anterior?.secundaria;
    const secAnterior = secAnteriorRaw?.tipo === sec.tipo ? secAnteriorRaw : null;
    if (sec.tipo === 'impulsionamento') {
      lines.push(`💵Investimento Impulsionamento: R$ ${fmtBRL(sec.spend)}${comparativo(secAnterior?.spend, sec.spend, v => `R$ ${fmtBRL(v)}`)}`);
      lines.push(`👀Visitas ao Perfil: ${fmtNumber(sec.visitasPerfil)}${comparativo(secAnterior?.visitasPerfil, sec.visitasPerfil, fmtNumber)}`);
      lines.push(`💲Custo por Visita: R$ ${fmtBRL(sec.custoVisita)}${comparativo(secAnterior?.custoVisita, sec.custoVisita, v => `R$ ${fmtBRL(v)}`)}`);
    } else {
      lines.push(`💵Investimento Reconhecimento: R$ ${fmtBRL(sec.spend)}${comparativo(secAnterior?.spend, sec.spend, v => `R$ ${fmtBRL(v)}`)}`);
      lines.push(`👀Pessoas Alcançadas: ${fmtNumber(sec.pessoasAlcancadas)}${comparativo(secAnterior?.pessoasAlcancadas, sec.pessoasAlcancadas, fmtNumber)}`);
    }
  }

  return lines.join('\n');
}
