'use client';

import React from 'react';
import { Appointment } from '@/types';
import { CheckCircle2, Calendar, User, Scissors } from 'lucide-react';

interface BookingSuccessCardProps {
  appointment: Appointment;
  onReset: () => void;
  onViewAppointments: () => void;
}

export const BookingSuccessCard: React.FC<BookingSuccessCardProps> = ({
  appointment,
  onReset,
  onViewAppointments,
}) => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-zinc-900 border border-emerald-500/40 rounded-lg text-center shadow-lg space-y-5">
      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
          Transação ACID Confirmada
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mt-1">
          Agendamento Garantido!
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          O horário foi reservado exclusivamente no sistema com trava atômica.
        </p>
      </div>

      <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 text-left space-y-2.5 text-xs font-mono">
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500">Comprovante ID</span>
          <span className="text-zinc-300 font-bold">{appointment.id}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-amber-500" /> Serviço
          </span>
          <span className="text-zinc-200">{appointment.servicoNome}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-500" /> Barbeiro
          </span>
          <span className="text-zinc-200">{appointment.barbeiroNome}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Data & Horário
          </span>
          <span className="text-amber-400 font-bold">
            {appointment.data} às {appointment.horario}
          </span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-zinc-500">Lock Atômico</span>
          <span className="text-[10px] text-zinc-500">{appointment.slotLock}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
        >
          Novo Agendamento
        </button>
        <button
          type="button"
          onClick={onViewAppointments}
          className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
        >
          Ver Meus Agendamentos
        </button>
      </div>
    </div>
  );
};
