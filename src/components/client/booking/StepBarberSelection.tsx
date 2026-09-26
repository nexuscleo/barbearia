'use client';

import React from 'react';
import { Barber, ServiceItem } from '@/types';
import Image from 'next/image';
import { Star, Check, ArrowLeft } from 'lucide-react';

interface StepBarberSelectionProps {
  barbers: Barber[];
  selectedBarber: Barber | null;
  selectedService: ServiceItem | null;
  onSelectBarber: (barber: Barber) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepBarberSelection: React.FC<StepBarberSelectionProps> = ({
  barbers,
  selectedBarber,
  selectedService,
  onSelectBarber,
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
            Etapa 02 de 04
          </span>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">
            Selecione o Barbeiro
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Profissionais mestres em visagismo e cuidados masculinos.
          </p>
        </div>

        {selectedService && (
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-zinc-400 block font-mono">Serviço escolhido</span>
            <span className="text-xs font-semibold text-zinc-200">{selectedService.nome}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {barbers.map((barber) => {
          const isSelected = selectedBarber?.id === barber.id;
          return (
            <button
              key={barber.id}
              type="button"
              onClick={() => onSelectBarber(barber)}
              className={`text-left p-4 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                  : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div>
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-950 mb-3 border border-zinc-800">
                  <Image
                    src={barber.avatar}
                    alt={`Foto de perfil do barbeiro ${barber.nome}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 bg-zinc-950/90 border border-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{barber.avaliacao.toFixed(1)}</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-zinc-100">{barber.nome}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {barber.especialidade}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-emerald-400">● Disponível</span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    isSelected ? 'text-amber-400' : 'text-zinc-400'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  {isSelected ? 'Selecionado' : 'Escolher'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Serviços
        </button>

        <button
          type="button"
          disabled={!selectedBarber}
          onClick={onNext}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold rounded-md text-xs tracking-wide transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Avançar para Horário →
        </button>
      </div>
    </div>
  );
};
