'use client';

import React from 'react';
import { ServiceItem } from '@/types';
import { Check } from 'lucide-react';

interface StepServiceSelectionProps {
  services: ServiceItem[];
  selectedService: ServiceItem | null;
  onSelectService: (service: ServiceItem) => void;
  onNext: () => void;
}

export const StepServiceSelection: React.FC<StepServiceSelectionProps> = ({
  services,
  selectedService,
  onSelectService,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
          Etapa 01 de 04
        </span>
        <h2 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">
          Escolha o Serviço Desejado
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Técnicas clássicas com navalha, toalha quente e acabamento refinado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {services.map((item) => {
          const isSelected = selectedService?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectService(item)}
              className={`text-left p-4 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                  : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-zinc-100">{item.nome}</h3>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-amber-400">
                      R$ {Number(item.preco).toFixed(2)}
                    </span>
                    <span className="block text-[11px] text-zinc-400 font-mono">
                      {item.duracaoMinutos} min
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                  {item.descricao}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  {item.categoria}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    isSelected ? 'text-amber-400' : 'text-zinc-400'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  {isSelected ? 'Selecionado' : 'Selecionar'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!selectedService}
          onClick={onNext}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold rounded-md text-xs tracking-wide transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Avançar para Barbeiro →
        </button>
      </div>
    </div>
  );
};
