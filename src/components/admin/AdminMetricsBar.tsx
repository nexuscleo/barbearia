'use client';

import React from 'react';
import { DollarSign, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

interface AdminMetricsBarProps {
  faturamentoHoje: number;
  totalAgendamentosHoje: number;
  concluidosHoje: number;
  taxaOcupacao: number;
}

export const AdminMetricsBar: React.FC<AdminMetricsBarProps> = ({
  faturamentoHoje,
  totalAgendamentosHoje,
  concluidosHoje,
  taxaOcupacao,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">Faturamento</span>
          <DollarSign className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl font-bold font-mono text-zinc-100">
          R$ {faturamentoHoje.toFixed(2)}
        </div>
        <span className="text-[10px] text-zinc-500 mt-1 block">Projetado hoje</span>
      </div>

      <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">Agendamentos</span>
          <Calendar className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl font-bold font-mono text-zinc-100">
          {totalAgendamentosHoje}
        </div>
        <span className="text-[10px] text-zinc-500 mt-1 block">Clientes marcados</span>
      </div>

      <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">Atendidos</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-zinc-100">
          {concluidosHoje}
        </div>
        <span className="text-[10px] text-zinc-500 mt-1 block">Sessões concluídas</span>
      </div>

      <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">Taxa Ocupação</span>
          <TrendingUp className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl font-bold font-mono text-zinc-100">
          {taxaOcupacao}%
        </div>
        <span className="text-[10px] text-zinc-500 mt-1 block">Capacidade diária</span>
      </div>
    </div>
  );
};
