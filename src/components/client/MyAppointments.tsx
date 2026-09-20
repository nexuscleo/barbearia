'use client';

import React, { useEffect, useState } from 'react';
import { Appointment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Scissors, User, XCircle, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface MyAppointmentsProps {
  onNewBookingClick: () => void;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({ onNewBookingClick }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agendamentos');
      const data = await res.json();
      if (data.success) {
        // Se for cliente demo, mostra agendamentos gerais ou os dele
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error('Erro ao buscar agendamentos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento? O horário será liberado para outros clientes.')) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await fetch('/api/agendamentos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      }
    } catch (e) {
      console.error('Erro ao cancelar agendamento:', e);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Meus Agendamentos
          </h2>
          <p className="text-xs text-zinc-400">
            Acompanhe o status das suas visitas e reservas
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          title="Atualizar lista"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-zinc-500">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Carregando seus agendamentos...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 text-sm mb-4">Você ainda não possui nenhum horário marcado.</p>
          <button
            onClick={onNewBookingClick}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
          >
            Agendar Primeiro Horário
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const isCancelled = apt.status === 'cancelado';
            const isCompleted = apt.status === 'concluido';
            const isConfirmed = apt.status === 'confirmado';

            return (
              <div
                key={apt.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCancelled
                    ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                    : isCompleted
                    ? 'bg-zinc-900/60 border-zinc-800'
                    : 'bg-zinc-900/80 border-amber-500/30 shadow-md shadow-amber-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-zinc-100">{apt.servicoNome}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          isConfirmed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isCompleted
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Barbeiro: <strong>{apt.barbeiroNome}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-amber-400 font-bold text-sm">
                      R$ {Number(apt.preco).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-zinc-500">{apt.duracaoMinutos} min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {apt.data}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {apt.horario}
                    </span>
                  </div>

                  {isConfirmed && (
                    <button
                      disabled={cancellingId === apt.id}
                      onClick={() => handleCancel(apt.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === apt.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
