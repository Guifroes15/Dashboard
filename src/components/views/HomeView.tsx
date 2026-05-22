import React from 'react';
import { GroupData } from '../../types';
import { ActiveView } from '../../App';
import { Lightbulb, Target, TrendingUp, MessageSquare, Zap, Crown } from 'lucide-react';

interface Props {
  groups: GroupData[];
  onNavigate: (view: ActiveView, groupId: string) => void;
  isMaster?: boolean;
}

export function HomeView({ groups, onNavigate, isMaster = false }: Props) {
  const thoughts = [
    { icon: Target, text: "O raio de entrega do tráfego pago está otimizado? Focar em 5-10km costuma dobrar a conversão local." },
    { icon: Lightbulb, text: "Google Meu Negócio: posts semanais e respostas rápidas a avaliações melhoram o ranking sem gastar nada." },
    { icon: TrendingUp, text: "O custo por mensagem no WhatsApp está alto? Tente criativos que mostrem o produto 'na mão' ou a fachada da loja." },
    { icon: Lightbulb, text: "Horários de pico: as campanhas locais performam melhor 1h antes e durante o horário comercial/almoço." },
  ];

  return (
    <div id="home-view-container" className="min-h-[85vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-tight select-none">
          Seja um eterno <br />
          <span className="text-brand-purple">inconformado.</span>
        </h1>
      </div>

      {/* Ferramentas Inteligentes */}
      {isMaster && (
        <div className="max-w-4xl w-full px-4 mb-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h2 className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em] mb-4">Ferramentas de IA & Copy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <button
                key={tool.title}
                id={tool.id}
                onClick={() => onNavigate(tool.view, groups[0]?.id || '')}
                className="text-left p-5 bg-brand-medium border border-brand-light rounded-2xl hover:border-brand-purple/50 active:scale-[0.98] transition-all cursor-pointer group flex flex-col justify-between h-44 shadow-lg"
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
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full px-4 mb-4">
        <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">Dicas de Sucesso</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full px-4">
        {thoughts.map((t, i) => (
          <div 
            key={i} 
            className="group p-5 bg-brand-medium border border-brand-light rounded-2xl hover:border-brand-purple/50 transition-all cursor-default"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform">
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
  );
}
