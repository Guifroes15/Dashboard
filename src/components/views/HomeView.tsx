import React, { useState } from 'react';
import { GroupData } from '../../types';
import { ActiveView } from '../../App';
import { totalVendas, ultimoMes, calcRoi, formatBRL } from '../../utils';
import {
  TrendingUp, TrendingDown, Minus, ArrowRight, Store, AlertTriangle,
  CheckCircle, ListChecks, FileText, ChevronRight, MessageSquare, Zap, Crown, Target, Lightbulb
} from 'lucide-react';
import { motion } from 'motion/react';
import { GestaoPanel } from './GestaoPanel';
import { useGestao } from '../../hooks/useGestao';

interface Props {
  groups: GroupData[];
  onNavigate: (view: ActiveView, groupId: string) => void;
  isMaster?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 18,
    },
  },
};

function trend(ult: ReturnType<typeof ultimoMes>, pen: ReturnType<typeof ultimoMes> | null) {
  if (!pen || pen.vendas === 0) return 'neutro';
  return ult.vendas > pen.vendas ? 'alta' : ult.vendas < pen.vendas ? 'baixa' : 'neutro';
}

export function HomeView({ groups, onNavigate, isMaster = false }: Props) {
  const [gestaoGrupo, setGestaoGrupo] = useState<GroupData | null>(null);
  const gestao = useGestao();

  const [hideIaTools, setHideIaTools] = useState<boolean>(() => {
    return localStorage.getItem('aure_hide_ia_tools') === 'true';
  });

  const handleToggleHideIaTools = () => {
    const newValue = !hideIaTools;
    setHideIaTools(newValue);
    localStorage.setItem('aure_hide_ia_tools', String(newValue));
  };

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const thoughts = [
    { icon: Target, text: "O raio de entrega do tráfego pago está otimizado? Focar em 5-10km costuma dobrar a conversão local." },
    { icon: Lightbulb, text: "Google Meu Negócio: posts semanais e respostas rápidas a avaliações melhoram o ranking sem gastar nada." },
    { icon: TrendingUp, text: "O custo por mensagem no WhatsApp está alto? Tente criativos que mostrem o produto 'na mão' ou a fachada da loja." },
    { icon: Lightbulb, text: "Horários de pico: as campanhas locais performam melhor 1h antes e durante o horário comercial/almoço." },
  ];

  const allStores    = groups.flatMap(g => g.stores);
  const totalGlobal  = allStores.reduce((a, s) => a + totalVendas(s), 0);
  const totalLojas   = allStores.length;
  const roiPositivos = allStores.filter(s => {
    const g = groups.find(gp => gp.stores.includes(s))!;
    return calcRoi(s, g.fee).status === 'positivo';
  }).length;

  const alertas = allStores.filter(s => {
    const hist = s.historico.filter(m => m.vendas >= 0).slice(-3);
    return hist.length >= 3 && hist.every((m, i, a) => i === 0 || m.vendas <= a[i-1].vendas);
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 min-h-[85vh] py-6"
    >
      {/* Saudação */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1">
            {saudacao}, Guilherme
          </h1>
          <p className="text-sm text-gray-500">Resumo de todos os grupos · atualizado agora</p>
        </div>
        <div className="flex items-center gap-3">
          {isMaster && hideIaTools && (
            <button 
              onClick={handleToggleHideIaTools}
              className="text-[10px] bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 border border-brand-purple/20 font-bold px-3 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              Exibir Ferramentas de IA
            </button>
          )}
          <motion.div 
            className="text-right py-2 px-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20 hidden md:block"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">Aure Digital Portal</span>
          </motion.div>
        </div>
      </motion.div>

      {/* KPIs globais */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total acumulado',    value: formatBRL(totalGlobal),           color: '#7c3aed' },
          { label: 'Grupos ativos',      value: groups.length,                    color: '#22c55e' },
          { label: 'Lojas no projeto',   value: totalLojas,                       color: '#f59e0b' },
          { label: 'Lojas ROI positivo', value: `${roiPositivos}/${totalLojas}`,  color: '#ec4899' },
        ].map((k, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="bg-brand-medium border border-brand-light rounded-xl p-4 shadow-lg"
          >
            <div className="w-1.5 h-1.5 rounded-full mb-3" style={{ background: k.color }} />
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{k.label}</p>
            <p className="text-xl font-bold text-white tracking-tight">{k.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <motion.div 
          variants={itemVariants} 
          className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              {alertas.length} {alertas.length === 1 ? 'loja precisa de atenção' : 'lojas precisam de atenção'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertas.map(s => {
              const g = groups.find(gr => gr.stores.includes(s))!;
              return (
                <button 
                   key={s.id} 
                  onClick={() => onNavigate({ type: 'store', storeId: s.id }, g.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-900/30 text-xs text-amber-600 hover:bg-amber-900/30 hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  {s.name} <ArrowRight className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Ferramentas Inteligentes / IA & Copy Dashboard */}
      {isMaster && !hideIaTools && (
        <motion.div variants={itemVariants} className="w-full">
          <div className="flex items-center justify-between mb-4 border-b border-brand-light/20 pb-2.5">
            <h2 className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em]">Ferramentas de IA & Copy</h2>
            <button 
              onClick={handleToggleHideIaTools}
              className="text-[9px] font-black hover:text-white text-gray-500 transition-colors uppercase tracking-widest bg-brand-light/30 border border-white/5 py-1 px-2.5 rounded-lg active:scale-95 cursor-pointer"
              title="Ocultar da tela inicial (disponível no menu lateral)"
            >
              Ocultar seção
            </button>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'launcher-ia-atendimento',
                title: 'Análise de Atendimento',
                desc: 'Avalie a qualidade das conversas por texto ou enviando prints.',
                icon: MessageSquare,
                view: { type: 'atendimento' } as ActiveView,
                badge: 'IA'
              },
              {
                id: 'launcher-ia-criativos',
                title: 'Inteligência de Criativos',
                desc: 'Identifique os pontos fortes de anúncios e gere novos variados.',
                icon: Zap,
                view: { type: 'criativos' } as ActiveView,
                badge: 'IA'
              },
              {
                id: 'launcher-ia-vip',
                title: 'Gerador VIP',
                desc: 'Crie copies persuasivos para grupos VIP e de ofertas em segundos.',
                icon: Crown,
                view: { type: 'vip' } as ActiveView,
                badge: 'VIP'
              }
            ].map(tool => (
              <motion.button
                key={tool.title}
                id={tool.id}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                onClick={() => onNavigate(tool.view, groups[0]?.id || '')}
                className="text-left p-5 bg-brand-medium border border-brand-light rounded-2xl hover:border-brand-purple/50 active:scale-[0.98] transition-all cursor-pointer group flex flex-col justify-between h-44 shadow-lg w-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple2 group-hover:scale-110 transition-transform">
                      <tool.icon className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple2 border border-brand-purple/30">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-brand-purple2 transition-colors">{tool.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* ── GESTÃO DE CONTAS ──────────────────────────────────────────────── */}
      {isMaster && (
        <motion.div variants={itemVariants} className="w-full">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de contas</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Checklist, demandas e anotações por grupo — clique para abrir
            </p>
          </div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map(group => {
              const stats = gestao.statsGrupo(group.id, group.stores.map(s => ({ id: s.id, name: s.name })));
              const progresso = stats.total > 0 ? Math.round((stats.feitas / stats.total) * 100) : 0;

              return (
                <motion.button 
                  key={group.id} 
                  onClick={() => setGestaoGrupo(group)}
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className="text-left p-4 rounded-xl border transition-all hover:border-gray-500 group relative overflow-hidden cursor-pointer"
                  style={{ background: 'rgba(255,255,255,.02)', borderColor: 'rgba(255,255,255,.06)' }}
                >
                  {/* Faixa colorida */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: group.color }} />

                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${group.color}15`, border: `1px solid ${group.color}25` }}>
                      <ListChecks className="w-3.5 h-3.5" style={{ color: group.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{group.name}</p>
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
                      <span className="text-[10px] text-gray-700 font-medium">Sem itens ainda</span>
                    )}
                    {stats.notas > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-500">
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
                      <p className="text-[9px] text-gray-600 mt-1">{progresso}% concluído · {stats.feitas}/{stats.total}</p>
                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-600">Clique para adicionar tarefas e notas →</p>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* ── GRUPOS / LOJAS ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="mb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Acompanhamento de Resultados</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Visão consolidada por grupo de contas com acesso rápido aos relatórios</p>
        </div>

        {groups.map(group => {
          const hasStores   = group.stores.length > 0;
          const groupTotal  = group.stores.reduce((a, s) => a + totalVendas(s), 0);
          const groupRoiPos = group.stores.filter(s => calcRoi(s, group.fee).status === 'positivo').length;

          return (
            <motion.div 
              key={group.id} 
              variants={itemVariants}
              whileHover={{ scale: 1.005, borderColor: 'rgba(255,255,255,0.15)' }}
              className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden shadow-lg transition-all"
            >
              {/* Header grupo */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ background: group.color }} />
                  <div>
                    <p className="text-sm font-bold text-white">{group.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {hasStores ? `${group.stores.length} lojas · Fee R$ ${group.fee.toLocaleString('pt-BR')}/loja` : 'Aguardando dados'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-5">
                  {hasStores && (
                    <>
                      <div className="text-right">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-0.5">Total acumulado</p>
                        <p className="text-sm font-extrabold text-white">{formatBRL(groupTotal)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-0.5">ROI positivo</p>
                        <p className="text-sm font-extrabold" style={{ color: groupRoiPos > 0 ? '#22c55e' : '#ef4444' }}>
                          {groupRoiPos}/{group.stores.length}
                        </p>
                      </div>
                    </>
                  )}
                  <button 
                    onClick={() => onNavigate({ type: 'consolidado' }, group.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-light border border-brand-light/30 text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-500 hover:bg-brand-light/75 transition-all cursor-pointer"
                  >
                    Ver grupo completo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dicas de Sucesso */}
      {isMaster && (
        <motion.div variants={itemVariants} className="w-full pt-4">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Dicas de Sucesso</h2>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thoughts.map((t, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
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
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Painel lateral de gestão */}
      {gestaoGrupo && (
        <GestaoPanel group={gestaoGrupo} onClose={() => setGestaoGrupo(null)} />
      )}
    </motion.div>
  );
}
