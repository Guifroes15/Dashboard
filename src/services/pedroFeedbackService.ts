import { FeedbackData } from './metaService';

// ─── Formatação ────────────────────────────────────────────────────────────

function fmtBRL(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtN(v: number): string {
  return v.toLocaleString('pt-BR');
}

// Retorna null quando não dá pra calcular variação (base anterior zerada)
function pct(anterior: number, atual: number): number | null {
  if (anterior <= 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

function fmtPct(v: number): string {
  const sinal = v >= 0 ? '+' : '';
  return `${sinal}${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function fmtData(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// Uma linha "anterior → atual (delta%)", ou só o valor atual quando não há
// base anterior pra comparar.
function linhaComparativa(label: string, anterior: number | null, atual: number, formatador: (v: number) => string): string {
  if (anterior === null) return `${label}: ${formatador(atual)}`;
  const variacao = pct(anterior, atual);
  const sufixo = variacao === null ? '' : ` (${fmtPct(variacao)})`;
  return `${label}: ${formatador(anterior)} → ${formatador(atual)}${sufixo}`;
}

// ─── Mensagem comparativa (formato do Pedro) ────────────────────────────────

export function buildComparativoMessage(name: string, atual: FeedbackData, anterior: FeedbackData | null): string {
  const totalAnterior = anterior?.totalSpend ?? 0;
  const totalAtual = atual.totalSpend;
  const variacaoTotal = pct(totalAnterior, totalAtual);

  const lines: string[] = [
    `📊 Análise dos Resultados — ${fmtData(atual.dateStart)} a ${fmtData(atual.dateStop)}`,
    `📈 Comparativo com a semana anterior`,
    ``,
    `💰 Investimento total`,
    `R$ ${fmtBRL(totalAnterior)} → R$ ${fmtBRL(totalAtual)}`,
  ];

  if (totalAnterior === 0 && totalAtual > 0) {
    lines.push(`Investimento iniciado no período atual — não havia investimento na semana anterior.`);
  } else if (variacaoTotal !== null) {
    const variacaoAbs = Math.abs(variacaoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    lines.push(`${variacaoTotal >= 0 ? 'Aumento' : 'Redução'} de ${variacaoAbs}% no investimento.`);
  }

  // ── WhatsApp ──────────────────────────────────────────────────────────
  lines.push(``, `📣 Engajamento — WhatsApp`);
  if (atual.mensagem) {
    if (!anterior?.mensagem) {
      lines.push(
        `Semana anterior: campanha não estava ativa`,
        `Investimento: R$ ${fmtBRL(atual.mensagem.spend)}`,
        `Conversas: ${fmtN(atual.mensagem.mensagens)}`,
        `Custo por conversa: R$ ${fmtBRL(atual.mensagem.custoMensagem)}`,
        `➡️ A campanha de WhatsApp foi iniciada nesta semana — ainda não há uma semana anterior completa pra comparar. Vale acompanhar os próximos dias antes de tirar conclusões sobre o custo por conversa.`,
      );
    } else {
      lines.push(
        linhaComparativa('Conversas', anterior.mensagem.mensagens, atual.mensagem.mensagens, fmtN),
        linhaComparativa('Investimento', anterior.mensagem.spend, atual.mensagem.spend, v => `R$ ${fmtBRL(v)}`),
        linhaComparativa('Custo por conversa', anterior.mensagem.custoMensagem, atual.mensagem.custoMensagem, v => `R$ ${fmtBRL(v)}`),
      );
    }
  } else if (anterior?.mensagem) {
    lines.push(`Campanha de WhatsApp pausada nesta semana (semana anterior: R$ ${fmtBRL(anterior.mensagem.spend)}, ${fmtN(anterior.mensagem.mensagens)} conversas).`);
  } else {
    lines.push(`Sem campanha de mensagem ativa em nenhum dos dois períodos.`);
  }

  // ── Tráfego / Reconhecimento ──────────────────────────────────────────
  const sec = atual.secundaria ?? anterior?.secundaria ?? null;
  if (sec) {
    const tipo = atual.secundaria?.tipo ?? anterior?.secundaria?.tipo;
    const secAnterior = anterior?.secundaria?.tipo === tipo ? anterior.secundaria : null;

    if (tipo === 'reconhecimento') {
      lines.push(``, `📣 Reconhecimento — Alcance`);
      if (atual.secundaria) {
        lines.push(
          linhaComparativa('Pessoas alcançadas', secAnterior?.pessoasAlcancadas ?? null, atual.secundaria.pessoasAlcancadas, fmtN),
          linhaComparativa('Investimento', secAnterior?.spend ?? null, atual.secundaria.spend, v => `R$ ${fmtBRL(v)}`),
        );
      } else if (secAnterior) {
        lines.push(`Campanha de reconhecimento pausada nesta semana (semana anterior: R$ ${fmtBRL(secAnterior.spend)}, ${fmtN(secAnterior.pessoasAlcancadas)} pessoas alcançadas).`);
      }
    } else {
      lines.push(``, `📣 Tráfego — Visitas ao Perfil`);
      if (atual.secundaria) {
        lines.push(
          linhaComparativa('Visitas ao perfil', secAnterior?.visitasPerfil ?? null, atual.secundaria.visitasPerfil, fmtN),
          linhaComparativa('Investimento', secAnterior?.spend ?? null, atual.secundaria.spend, v => `R$ ${fmtBRL(v)}`),
          linhaComparativa('Custo por visita', secAnterior?.custoVisita ?? null, atual.secundaria.custoVisita, v => `R$ ${fmtBRL(v)}`),
        );
      } else if (secAnterior) {
        lines.push(`Campanha de tráfego pausada nesta semana (semana anterior: R$ ${fmtBRL(secAnterior.spend)}, ${fmtN(secAnterior.visitasPerfil)} visitas).`);
      }
    }
  }

  return lines.join('\n');
}
