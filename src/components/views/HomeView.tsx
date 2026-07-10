import React, { useState } from 'react';
import { GroupData } from '../../types';
import { ActiveView } from '../../App';
import { totalVendas, ultimoMes, calcRoi, formatBRL } from '../../utils';
import { TrendingUp, TrendingDown, AlertTriangle, ListChecks, FileText, ChevronRight, Target, Lightbulb, Trophy, PauseCircle } from 'lucide-react';
import { GestaoPanel } from './GestaoPanel';
import { useGestao } from '../../hooks/useGestao';
import { useMetaAccountsOverview, SALDO_BAIXO_LIMITE, GASTO_BAIXO_LIMITE, AccountOverview } from '../../hooks/useMetaAccountsOverview';
import { addStore, createGroupIfMissing } from '../../services/groupService';

// Contas mapeadas em metaAccounts.ts que ainda não têm loja cadastrada no dashboard
const YAMCOL_EXTRA_STORE = { groupId: 'yamcol', id: 'vh-manauara', name: 'VH Manauara', color: '#0ea5e9' };
const AVULSOS_GROUP = { id: 'avulsos', name: 'Clientes Avulsos', color: '#64748b' };
const AVULSOS_STORES = [
  { id: 'amo-outlet',          name: 'Amo Outlet',          color: '#f97316' },
  { id: 'anjo-colours',        name: 'Anjo Colours',        color: '#ec4899' },
  { id: 'carrano',             name: 'Carrano',             color: '#22c55e' },
  { id: 'democrata-rio-verde', name: 'Democrata Rio Verde', color: '#3b82f6' },
  { id: 'guapa',               name: 'Guapa',               color: '#a855f7' },
  { id: 'mega-calcados',       name: 'Mega Calçados',       color: '#eab308' },
];

interface Props {
  groups: GroupData[];
  onNavigate: (groupId: string, view: ActiveView) => void;
  nome?: string;
  isMaster?: boolean;
  isStaff?: boolean;
}

function trend(ult: ReturnType<typeof ultimoMes>, pen: ReturnType<typeof ultimoMes> | null) {
  if (!pen || pen.vendas === 0) return 'neutro';
  return ult.vendas > pen.vendas ? 'alta' : ult.vendas < pen.vendas ? 'baixa' : 'neutro';
}

const fmtBRLCurto = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function AccountCard({ account, metric, onNavigate }: { account: AccountOverview; metric: React.ReactNode; onNavigate: () => void }) {
  const label = account.stores.map(s => s.name).join(' / ');
  return (
    <button onClick={onNavigate}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-brand-medium border border-brand-light hover:border-gray-500 transition-all cursor-pointer text-left w-full">
      <div className="flex -space-x-1 shrink-0">
        {account.stores.slice(0, 3).map(s => (
          <div key={s.id} className="w-2 h-2 rounded-full border border-brand-dark" style={{ background: s.groupColor }} />
        ))}
      </div>
      <span className="flex-1 text-xs font-semibold text-gray-200 truncate">{label}</span>
      {metric}
    </button>
  );
}

export function HomeView({ groups, onNavigate, nome = '', isMaster = false, isStaff = false }: Props) {
  const [gestaoGrupo, setGestaoGrupo] = useState<GroupData | null>(null);
  const [settingUp, setSettingUp] = useState(false);
  const gestao = useGestao();
  const podeVerMeta = isMaster || isStaff;
  const { accounts: metaAccounts } = useMetaAccountsOverview(podeVerMeta ? groups : []);

  const allStoreIds = new Set(groups.flatMap(g => g.stores.map(s => s.id)));
  const missingYamcolExtra = isMaster && !allStoreIds.has(YAMCOL_EXTRA_STORE.id);
  const missingAvulsos = isMaster ? AVULSOS_STORES.filter(s => !allStoreIds.has(s.id)) : [];
  const hasPendingSetup = missingYamcolExtra || missingAvulsos.length > 0;

  const handleSetupAvulsos = async () => {
    setSettingUp(true);
    try {
      if (missingYamcolExtra) {
        await addStore(YAMCOL_EXTRA_STORE.groupId, {
          id: YAMCOL_EXTRA_STORE.id, name: YAMCOL_EXTRA_STORE.name, color: YAMCOL_EXTRA_STORE.color,
          historico: [], planos: [],
        });
      }
      if (missingAvulsos.length > 0) {
        await createGroupIfMissing({ id: AVULSOS_GROUP.id, name: AVULSOS_GROUP.name, color: AVULSOS_GROUP.color, fee: 0, stores: [] });
        for (const s of missingAvulsos) {
          await addStore(AVULSOS_GROUP.id, { id: s.id, name: s.name, color: s.color, historico: [], planos: [] });
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao adicionar contas');
    } finally {
      setSettingUp(false);
    }
  };

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const temNome = nome.trim().length > 0;

  const allStores    = groups.flatMap(g => g.stores);
  const totalGlobal  = allStores.reduce((a, s) => a + totalVendas(s), 0);
  const totalLojas   = allStores.length;
  const roiPositivos = allStores.filter(s => {
    const g = groups.find(g => g.stores.includes(s))!;
    return calcRoi(s, g.fee).status === 'positivo';
  }).length;

  const goToAccount = (account: AccountOverview) => {
    const store = account.stores[0];
    if (store) onNavigate(store.groupId, { type: 'store', storeId: store.id });
  };

  const comMensagens = metaAccounts.filter(a => a.weekly);
  const top3Mensagens = [...comMensagens].sort((a, b) => b.weekly!.mensagens - a.weekly!.mensagens).slice(0, 3);
  const bottom5Mensagens = [...comMensagens].sort((a, b) => a.weekly!.mensagens - b.weekly!.mensagens).slice(0, 5);
  const saldoBaixo = metaAccounts.filter(a => a.balance?.temLimite && a.balance.saldoRestante < SALDO_BAIXO_LIMITE);
  const gastoBaixo = [...comMensagens.filter(a => a.weekly!.spend < GASTO_BAIXO_LIMITE)].sort((a, b) => a.weekly!.spend - b.weekly!.spend);
  const precisaAtencao = saldoBaixo.length + gastoBaixo.length;

  const thoughts = [
    { icon: Target, text: "O raio de entrega do tráfego pago está otimizado? Focar em 5-10km costuma dobrar a conversão local." },
    { icon: Lightbulb, text: "Google Meu Negócio: posts semanais e respostas rápidas a avaliações melhoram o ranking sem gastar nada." },
    { icon: TrendingUp, text: "O custo por mensagem no WhatsApp está alto? Tente criativos que mostrem o produto 'na mão' ou a fachada da loja." },
    { icon: Lightbulb, text: "Horários de pico: as campanhas locais performam melhor 1h antes e durante o horário comercial/almoço." },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8 py-4">

      {/* Saudação — só aparece quando tem nome (master/staff com nome) */}
      <div className="mb-8">
        {temNome ? (
          <>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1">
              {saudacao}, {nome}
            </h1>
            <p className="text-sm text-gray-500">Resumo de todos os grupos · atualizado agora</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-1">
              Painel Aure Digital
            </h1>
            <p className="text-sm text-gray-500">Visão geral de todos os grupos</p>
          </>
        )}
      </div>

      {/* KPIs globais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total acumulado',    value: formatBRL(totalGlobal),           color: '#7c3aed' },
          { label: 'Grupos ativos',      value: groups.length,                    color: '#22c55e' },
          { label: 'Lojas no projeto',   value: totalLojas,                       color: '#f59e0b' },
          { label: 'Lojas ROI positivo', value: `${roiPositivos}/${totalLojas}`,  color: '#ec4899' },
        ].map((k, i) => (
          <div key={i} className="bg-brand-medium border border-brand-light rounded-xl p-4 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full mb-3" style={{ background: k.color }} />
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{k.label}</p>
            <p className="text-xl font-bold text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Configuração pendente — contas do Meta ainda sem loja no dashboard */}
      {hasPendingSetup && (
        <div className="mb-8 bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-bold text-brand-purple2 uppercase tracking-wider mb-1">Configuração pendente</p>
            <p className="text-xs text-gray-400">
              {missingAvulsos.length + (missingYamcolExtra ? 1 : 0)} conta{missingAvulsos.length + (missingYamcolExtra ? 1 : 0) > 1 ? 's' : ''} do Meta Ads ainda não {missingAvulsos.length + (missingYamcolExtra ? 1 : 0) > 1 ? 'aparecem' : 'aparece'} no dashboard (VH Manauara e clientes avulsos).
            </p>
          </div>
          <button onClick={handleSetupAvulsos} disabled={settingUp}
            className="px-4 py-2 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all disabled:opacity-50 cursor-pointer shrink-0">
            {settingUp ? 'Adicionando…' : 'Adicionar ao dashboard'}
          </button>
        </div>
      )}

      {/* Precisa de atenção — saldo baixo e contas paradas/com pouco gasto */}
      {podeVerMeta && precisaAtencao > 0 && (
        <div className="mb-8 bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
              {precisaAtencao} {precisaAtencao === 1 ? 'conta precisa' : 'contas precisam'} de atenção
            </p>
          </div>

          {saldoBaixo.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest">Saldo baixo — recarregar</p>
                <button onClick={() => onNavigate(groups[0]?.id ?? '', { type: 'meta-balance' })}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                  Ver todas →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {saldoBaixo.map(a => (
                  <AccountCard key={a.adAccountId} account={a} onNavigate={() => goToAccount(a)}
                    metric={<span className="text-xs font-bold text-red-400 shrink-0">{fmtBRLCurto(a.balance!.saldoRestante)}</span>} />
                ))}
              </div>
            </div>
          )}

          {gastoBaixo.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <PauseCircle className="w-3 h-3" /> Parada ou com pouco gasto na semana
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {gastoBaixo.map(a => (
                  <AccountCard key={a.adAccountId} account={a} onNavigate={() => goToAccount(a)}
                    metric={<span className="text-xs font-bold text-red-400 shrink-0">{a.weekly!.spend > 0 ? fmtBRLCurto(a.weekly!.spend) : 'Sem gasto'}</span>} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranking semanal de mensagens */}
      {podeVerMeta && comMensagens.length > 0 && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-green-400" />
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Top 3 da semana · mensagens</p>
            </div>
            <div className="space-y-1.5">
              {top3Mensagens.map(a => (
                <AccountCard key={a.adAccountId} account={a} onNavigate={() => goToAccount(a)}
                  metric={<span className="text-xs font-bold text-green-400 shrink-0">{a.weekly!.mensagens}</span>} />
              ))}
            </div>
          </div>

          <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Menor volume da semana · mensagens</p>
            </div>
            <div className="space-y-1.5">
              {bottom5Mensagens.map(a => (
                <AccountCard key={a.adAccountId} account={a} onNavigate={() => goToAccount(a)}
                  metric={<span className="text-xs font-bold text-amber-500 shrink-0">{a.weekly!.mensagens}</span>} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GESTÃO DE CONTAS ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de contas</h2>
          <p className="text-[10px] text-gray-600 mt-0.5">
            Checklist, demandas e anotações por grupo · clique para abrir
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(group => {
            const stats = gestao.statsGrupo(group.id, group.stores.map(s => ({ id: s.id, name: s.name })));
            const progresso = stats.total > 0 ? Math.round((stats.feitas / stats.total) * 100) : 0;

            return (
              <button key={group.id} onClick={() => setGestaoGrupo(group)}
                className="text-left p-4 rounded-xl border transition-all hover:border-gray-500 group relative overflow-hidden cursor-pointer w-full text-white"
                style={{ background: 'rgba(255,255,255,.02)', borderColor: 'rgba(255,255,255,.06)' }}>

                {/* Faixa colorida */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: group.color }} />

                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${group.color}15`, border: `1px solid ${group.color}25` }}>
                    <ListChecks className="w-3.5 h-3.5" style={{ color: group.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{group.name}</p>
                    <p className="text-[9px] text-gray-600">{group.stores.length} lojas</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
                </div>

                {/* Contadores */}
                <div className="flex items-center gap-3 mb-2.5">
                  {stats.pendentes > 0 ? (
                    <span className="text-[10px] font-bold" style={{ color: '#f59e0b' }}>
                      {stats.pendentes} pendente{stats.pendentes > 1 ? 's' : ''}
                    </span>
                  ) : stats.total > 0 ? (
                    <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>✓ Tudo feito</span>
                  ) : (
                    <span className="text-[10px] text-gray-700">Sem itens ainda</span>
                  )}
                  {stats.notas > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-650">
                      <FileText className="w-3 h-3" />
                      {stats.notas} nota{stats.notas > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Barra de progresso */}
                {stats.total > 0 ? (
                  <div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progresso}%`, background: progresso === 100 ? '#22c55e' : group.color }} />
                    </div>
                    <p className="text-[9px] text-gray-700 mt-1">{progresso}% concluído · {stats.feitas}/{stats.total}</p>
                  </div>
                ) : (
                  <p className="text-[9px] text-gray-700">Clique para adicionar tarefas e notas →</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dicas de Sucesso */}
      {isMaster && (
        <div className="w-full pt-4">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Dicas de Sucesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thoughts.map((t, i) => (
              <div 
                key={i} 
                className="group p-5 bg-brand-medium border border-brand-light rounded-2xl hover:border-brand-purple/50 transition-all cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform shrink-0">
                    <t.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-relaxed transition-colors">
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Painel lateral de gestão */}
      {gestaoGrupo && (
        <GestaoPanel group={gestaoGrupo} onClose={() => setGestaoGrupo(null)} isMaster={isMaster} />
      )}
    </div>
  );
}
