'use client';

import React from 'react';
import { Appointment, Barber } from '@/types';
import { Clock, User, Scissors, CheckCircle, XCircle } from 'lucide-react';

interface AdminAppointmentsListProps {
  appointments: Appointment[];
  barbers: Barber[];
  selectedBarberFilter: string;
  onFilterChange: (barberId: string) => void;
  onStatusChange: (id: string, action: 'complete' | 'cancel') => void;
}

export const AdminAppointmentsList: React.FC<AdminAppointmentsListProps> = ({
  appointments,
  barbers,
  selectedBarberFilter,
  onFilterChange,
  onStatusChange,
}) => {
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedBarberFilter === 'all') return true;
    return apt.barbeiroId === selectedBarberFilter;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtro de Barbeiro */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Filtrar por Barbeiro:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              selectedBarberFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950'
            }`}
          >
            Todos ({appointments.length})
          </button>
          {barbers.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onFilterChange(b.id)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                selectedBarberFilter === b.id
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950'
              }`}
            >
              {b.nome.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-lg text-zinc-500 text-xs font-mono">
          Nenhum agendamento encontrado para o filtro selecionado nesta data.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'confirmado';
            const isCompleted = apt.status === 'concluido';

            return (
              <div
                key={apt.id}
                className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                    : isConfirmed
                    ? 'bg-zinc-900/80 border-amber-500/30'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-60 text-zinc-500'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.horario}
                    </span>
                    <span className="text-zinc-300 font-semibold text-xs">{apt.clienteNome}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({apt.clienteTelefone})</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCompleted
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-zinc-500" />
                      {apt.servicoNome}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-500" />
                      Barbeiro: <strong>{apt.barbeiroNome}</strong>
                    </span>
                    <span className="font-mono text-zinc-300 font-bold">
                      R$ {Number(apt.preco).toFixed(2)}
                    </span>
                  </div>
                </div>

                {isConfirmed && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onStatusChange(apt.id, 'complete')}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Concluir
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(apt.id, 'cancel')}
                      className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
