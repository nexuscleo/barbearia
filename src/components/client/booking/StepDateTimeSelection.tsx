'use client';

import React from 'react';
import { Barber } from '@/types';
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';

interface StepDateTimeSelectionProps {
  selectedBarber: Barber;
  selectedDate: string;
  selectedTime: string;
  availableSlots: string[];
  occupiedSlots: string[];
  isLoadingSlots: boolean;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepDateTimeSelection: React.FC<StepDateTimeSelectionProps> = ({
  selectedBarber,
  selectedDate,
  selectedTime,
  availableSlots,
  occupiedSlots,
  isLoadingSlots,
  onSelectDate,
  onSelectTime,
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
            Etapa 03 de 04
          </span>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">
            Data e Horário
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Horários sincronizados em tempo real com controle de trava atômica.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-zinc-400 block font-mono">Profissional</span>
          <span className="text-xs font-semibold text-zinc-200">{selectedBarber.nome}</span>
        </div>
      </div>

      {/* Seletor de Data */}
      <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
        <label htmlFor="booking-date" className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2">
          Data do Atendimento
        </label>
        <input
          id="booking-date"
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => onSelectDate(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 w-full sm:w-64 focus:outline-none focus:border-amber-500 font-mono"
        />
      </div>

      {/* Grade de Horários */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Horários Disponíveis ({selectedDate})
          </span>
          {isLoadingSlots && (
            <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
              <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando...
            </span>
          )}
        </div>

        {availableSlots.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs border border-zinc-800 rounded-lg">
            Nenhum horário cadastrado para esta data.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
            {availableSlots.map((slot) => {
              const isOccupied = occupiedSlots.includes(slot);
              const isSelected = selectedTime === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => onSelectTime(slot)}
                  className={`py-2.5 px-3 rounded-md text-xs font-mono font-medium border transition-colors ${
                    isOccupied
                      ? 'border-zinc-900 bg-zinc-950/40 text-zinc-600 line-through cursor-not-allowed'
                      : isSelected
                      ? 'border-amber-500 bg-amber-500 text-zinc-950 font-bold shadow-sm'
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800 border border-zinc-700" />
            Livre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            Selecionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 border border-zinc-800 line-through" />
            Ocupado
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Barbeiro
        </button>

        <button
          type="button"
          disabled={!selectedTime}
          onClick={onNext}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold rounded-md text-xs tracking-wide transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Revisar e Confirmar →
        </button>
      </div>
    </div>
  );
};
