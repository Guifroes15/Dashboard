import React from 'react';
import { GroupData } from '../../types';
import { ActiveView } from '../../App';

interface Props {
  groups: GroupData[];
  onNavigate: (view: ActiveView, groupId: string) => void;
}

import { Lightbulb, Target, TrendingUp } from 'lucide-react';

export function HomeView({ }: Props) {
  const thoughts = [
    { icon: Target, text: "O raio de entrega do tráfego pago está otimizado? Focar em 5-10km costuma dobrar a conversão local." },
    { icon: Lightbulb, text: "Google Meu Negócio: posts semanais e respostas rápidas a avaliações melhoram o ranking sem gastar nada." },
    { icon: TrendingUp, text: "O custo por mensagem no WhatsApp está alto? Tente criativos que mostrem o produto 'na mão' ou a fachada da loja." },
    { icon: Lightbulb, text: "Horários de pico: as campanhas locais performam melhor 1h antes e durante o horário comercial/almoço." },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-1000">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-tight select-none">
          Seja um eterno <br />
          <span className="text-brand-purple">inconformado.</span>
        </h1>
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
