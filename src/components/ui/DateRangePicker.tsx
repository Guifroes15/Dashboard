import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { DatePreset, MetaDateRange } from '../../services/metaService';

interface Props {
  value: MetaDateRange;
  onChange: (range: MetaDateRange) => void;
}

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Hoje',            value: 'today'      },
  { label: 'Ontem',           value: 'yesterday'  },
  { label: 'Últimos 7 dias',  value: 'last_7d'    },
  { label: 'Últimos 14 dias', value: 'last_14d'   },
  { label: 'Últimos 30 dias', value: 'last_30d'   },
  { label: 'Este mês',        value: 'this_month' },
  { label: 'Mês passado',     value: 'last_month' },
];

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function buildMonthGrid(monthDate: Date): (Date | null)[] {
  const year  = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay   = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay.getDay()).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [pendingSince, setPendingSince] = useState<Date | null>(null);
  const [pendingUntil, setPendingUntil] = useState<Date | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const isCustom = 'since' in value;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const currentLabel = isCustom
    ? `${new Date(value.since + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} — ${new Date(value.until + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    : PRESETS.find(p => p.value === value.preset)?.label ?? value.preset;

  const pickPreset = (preset: DatePreset) => {
    onChange({ preset });
    setOpen(false);
  };

  const pickDay = (day: Date) => {
    if (!pendingSince || (pendingSince && pendingUntil)) {
      setPendingSince(day);
      setPendingUntil(null);
    } else if (day < pendingSince) {
      setPendingSince(day);
      setPendingUntil(null);
    } else {
      setPendingUntil(day);
    }
  };

  const applyCustom = () => {
    if (!pendingSince) return;
    const until = pendingUntil ?? pendingSince;
    onChange({ since: toISO(pendingSince), until: toISO(until) });
    setOpen(false);
  };

  const inRange = (day: Date) => {
    if (!pendingSince) return false;
    const end = pendingUntil ?? pendingSince;
    return day >= pendingSince && day <= end;
  };

  const grid = buildMonthGrid(viewMonth);

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-brand-medium border border-brand-light rounded-xl px-3 py-2.5 text-sm text-white hover:border-brand-purple/50 transition-colors cursor-pointer"
      >
        <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        {currentLabel}
      </button>

      {open && (
        <div className="absolute z-30 mt-2 left-0 flex bg-[#0e0e16] border border-brand-light rounded-2xl shadow-2xl overflow-hidden">
          {/* Presets */}
          <div className="w-40 border-r border-brand-light p-2 space-y-0.5 shrink-0">
            {PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => pickPreset(p.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isCustom && value.preset === p.value
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-400 hover:bg-brand-light hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => { setPendingSince(null); setPendingUntil(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isCustom ? 'bg-brand-purple text-white' : 'text-gray-400 hover:bg-brand-light hover:text-white'
              }`}
            >
              Personalizado
            </button>
          </div>

          {/* Calendário */}
          <div className="p-3 w-64">
            <div className="flex items-center justify-between mb-2 px-1">
              <button onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="p-1 rounded hover:bg-brand-light text-gray-400 hover:text-white transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white capitalize">
                {viewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="p-1 rounded hover:bg-brand-light text-gray-400 hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {WEEKDAYS.map((w, i) => (
                <div key={i} className="text-center text-[9px] font-bold text-gray-600 py-1">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {grid.map((day, i) => {
                if (!day) return <div key={i} />;
                const selected = pendingSince && (toISO(day) === toISO(pendingSince) || (pendingUntil && toISO(day) === toISO(pendingUntil)));
                return (
                  <button
                    key={i}
                    onClick={() => pickDay(day)}
                    className={`aspect-square rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-brand-purple text-white'
                        : inRange(day)
                          ? 'bg-brand-purple/20 text-white'
                          : 'text-gray-400 hover:bg-brand-light'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-light">
              <span className="text-[9px] text-gray-600">
                {pendingSince ? `${toISO(pendingSince)}${pendingUntil ? ` — ${toISO(pendingUntil)}` : ''}` : 'Selecione o início'}
              </span>
              <button
                onClick={applyCustom}
                disabled={!pendingSince}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-purple text-white text-[10px] font-bold hover:bg-brand-purple/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Check className="w-3 h-3" /> Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
