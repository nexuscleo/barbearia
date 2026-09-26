'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Appointment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { bookingApi } from '@/services/booking-api';
import { Calendar, Clock, User, XCircle, RefreshCw } from 'lucide-react';

interface MyAppointmentsProps {
  onNewBookingClick: () => void;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({ onNewBookingClick }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await bookingApi.getAppointments();
      setAppointments(data);
    } catch (e: unknown) {
      console.error('Erro ao buscar agendamentos:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    bookingApi
      .getAppointments()
      .then((data) => {
        if (!isMounted) return;
        setAppointments(data);
        setIsLoading(false);
      })
      .catch((e: unknown) => {
        console.error('Erro ao buscar agendamentos:', e);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    await fetchAppointments();
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Deseja realmente cancelar este agendamento? O horário será liberado para outros clientes.')) {
      return;
    }

    setCancellingId(id);
    try {
      await bookingApi.updateAppointmentStatus(id, 'cancel');
      fetchAppointments();
    } catch (e: unknown) {
      console.error('Erro ao cancelar agendamento:', e);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
            Área do Cliente
          </span>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
            <Calendar className="w-5 h-5 text-amber-500" />
            Meus Agendamentos
          </h2>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
          title="Atualizar lista"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-zinc-500">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Carregando agendamentos...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-lg">
          <p className="text-zinc-400 text-xs mb-4">Você ainda não possui nenhum horário marcado.</p>
          <button
            type="button"
            onClick={onNewBookingClick}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-md text-xs transition-colors"
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
                className={`p-4 rounded-lg border transition-all ${
                  isCancelled
                    ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                    : isCompleted
                    ? 'bg-zinc-900/60 border-zinc-800'
                    : 'bg-zinc-900/80 border-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-zinc-100">{apt.servicoNome}</h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
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
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Barbeiro: <strong>{apt.barbeiroNome}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      R$ {Number(apt.preco).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-mono">{apt.duracaoMinutos} min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs font-mono">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {apt.data}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {apt.horario}
                    </span>
                  </div>

                  {isConfirmed && (
                    <button
                      type="button"
                      disabled={cancellingId === apt.id}
                      onClick={() => handleCancel(apt.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
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
