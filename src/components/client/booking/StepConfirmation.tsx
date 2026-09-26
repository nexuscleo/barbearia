'use client';

import React from 'react';
import { Barber, ServiceItem } from '@/types';
import { ArrowLeft, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

interface StepConfirmationProps {
  selectedService: ServiceItem;
  selectedBarber: Barber;
  selectedDate: string;
  selectedTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({
  selectedService,
  selectedBarber,
  selectedDate,
  selectedTime,
  clientName,
  clientPhone,
  clientEmail,
  isSubmitting,
  errorMessage,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onBack,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
          Etapa 04 de 04
        </span>
        <h2 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">
          Confirmação do Agendamento
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Revise os detalhes da sessão e informe seus dados de contato para confirmação.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-950/40 border border-red-500/50 rounded-md text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Resumo do Atendimento */}
      <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
          Resumo da Reserva
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-zinc-500 block text-[11px]">Serviço</span>
            <span className="font-semibold text-zinc-200">{selectedService.nome}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Profissional</span>
            <span className="font-semibold text-zinc-200">{selectedBarber.nome}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Data & Horário</span>
            <span className="font-mono font-semibold text-zinc-200">
              {selectedDate} às {selectedTime}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Total</span>
            <span className="font-mono text-sm font-bold text-amber-400">
              R$ {Number(selectedService.preco).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulário de Identificação do Cliente */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          Dados do Cliente
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="client-name" className="block text-xs text-zinc-400 mb-1">
              Nome Completo *
            </label>
            <input
              id="client-name"
              type="text"
              required
              value={clientName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ex.: Lucas Mendes"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="client-phone" className="block text-xs text-zinc-400 mb-1">
              WhatsApp / Celular *
            </label>
            <input
              id="client-phone"
              type="tel"
              required
              value={clientPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="(11) 98765-4321"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="client-email" className="block text-xs text-zinc-400 mb-1">
              E-mail para Confirmação *
            </label>
            <input
              id="client-email"
              type="email"
              required
              value={clientEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-md flex items-center gap-2 text-[11px] text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Garantia de horário exclusivo: transação atômica que previne reservas duplicadas.</span>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="px-4 py-2 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Horário
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-md text-xs tracking-wide transition-colors flex items-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Garantindo Slot Atômico...
            </>
          ) : (
            'Confirmar Agendamento Definitivo'
          )}
        </button>
      </div>
    </form>
  );
};
