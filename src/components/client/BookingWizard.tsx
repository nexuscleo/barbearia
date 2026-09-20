'use client';

import React, { useState, useEffect } from 'react';
import { Barber, ServiceItem, BookingRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Scissors, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  Phone, 
  CreditCard,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { getTodayString } from '@/lib/db-service';

interface BookingWizardProps {
  onBookingSuccess: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ onBookingSuccess }) => {
  const { user } = useAuth();

  // Estados dos passos
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  
  // Data e horários
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  
  // Dados do cliente
  const [clientName, setClientName] = useState<string>(user?.nome || '');
  const [clientPhone, setClientPhone] = useState<string>(user?.telefone || '(11) 98765-4321');
  const [clientEmail, setClientEmail] = useState<string>(user?.email || 'cliente@barbearia.com');

  // Estados de carregamento e feedback
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // Carrega serviços e barbeiros
  useEffect(() => {
    fetchServices();
    fetchBarbers();
  }, []);

  // Atualiza campos de cliente se o usuário do contexto mudar
  useEffect(() => {
    if (user) {
      if (!clientName) setClientName(user.nome);
      if (!clientEmail) setClientEmail(user.email);
    }
  }, [user]);

  // Busca slots de horário quando o barbeiro ou a data mudam
  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchSlots(selectedBarber.id, selectedDate);
    }
  }, [selectedBarber, selectedDate]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (e) {
      console.error('Erro ao buscar serviços:', e);
    }
  };

  const fetchBarbers = async () => {
    try {
      const res = await fetch('/api/barbers');
      const data = await res.json();
      if (data.success) {
        setBarbers(data.barbers);
      }
    } catch (e) {
      console.error('Erro ao buscar barbeiros:', e);
    }
  };

  const fetchSlots = async (barberId: string, date: string) => {
    setIsLoadingSlots(true);
    setSelectedTime('');
    try {
      const res = await fetch(`/api/barbers?barberId=${barberId}&date=${date}`);
      const data = await res.json();
      if (data.success) {
        setAvailableSlots(data.allSlots || []);
        setOccupiedSlots(data.occupiedSlots || []);
      }
    } catch (e) {
      console.error('Erro ao carregar horários:', e);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setErrorMessage('Por favor, complete todos os passos antes de confirmar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: BookingRequest = {
      clienteId: user?.uid || `cli-${Date.now()}`,
      clienteNome: clientName,
      clienteTelefone: clientPhone,
      clienteEmail: clientEmail,
      barbeiroId: selectedBarber.id,
      servicoId: selectedService.id,
      data: selectedDate,
      horario: selectedTime,
    };

    try {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Se status for 409, trava de concorrência ativada
        if (res.status === 409) {
          setErrorMessage(
            `⚠️ CONFLITO DE HORÁRIO: O horário das ${selectedTime} com ${selectedBarber.nome} acabou de ser preenchido por outro agendamento. Por favor, escolha outro horário!`
          );
          // Recarrega os horários para atualizar a lista
          fetchSlots(selectedBarber.id, selectedDate);
        } else {
          setErrorMessage(data.error || 'Erro ao realizar agendamento.');
        }
        return;
      }

      setSuccessData(data.appointment);
    } catch (error: any) {
      setErrorMessage(error.message || 'Falha de comunicação com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedTime('');
    setStep(1);
    setSuccessData(null);
    setErrorMessage(null);
    onBookingSuccess();
  };

  // Se agendamento concluído com sucesso:
  if (successData) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-zinc-900/90 border border-amber-500/30 rounded-2xl shadow-2xl text-center backdrop-blur-md">
        <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-zinc-100 mb-2 tracking-tight">
          Agendamento Confirmado!
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          Seu horário foi reservado com sucesso no sistema e sincronizado com a agenda do barbeiro.
        </p>

        <div className="bg-zinc-950/80 rounded-xl p-4 text-left border border-zinc-800 space-y-3 mb-6">
          <div className="flex justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-zinc-400 text-sm">Serviço:</span>
            <span className="text-zinc-100 font-semibold text-sm">{successData.servicoNome}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-zinc-400 text-sm">Barbeiro:</span>
            <span className="text-zinc-100 font-semibold text-sm">{successData.barbeiroNome}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-zinc-400 text-sm">Data & Horário:</span>
            <span className="text-amber-400 font-bold text-sm">
              {successData.data} às {successData.horario}
            </span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-zinc-400 text-sm">Cliente:</span>
            <span className="text-zinc-100 text-sm">{successData.clienteNome}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-zinc-400 text-sm">Valor Total:</span>
            <span className="text-amber-400 font-extrabold text-base">
              R$ {Number(successData.preco).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetBooking}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Barra de Progresso em Passos (Mobile Friendly) */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
          
          {[
            { num: 1, label: 'Serviço', icon: Scissors },
            { num: 2, label: 'Barbeiro', icon: User },
            { num: 3, label: 'Data & Hora', icon: CalendarIcon },
            { num: 4, label: 'Confirmar', icon: Check },
          ].map((item) => {
            const Icon = item.icon;
            const isDone = step > item.num;
            const isCurrent = step === item.num;

            return (
              <div 
                key={item.num}
                onClick={() => {
                  if (item.num < step) setStep(item.num);
                }}
                className={`relative z-10 flex flex-col items-center cursor-pointer transition-all ${
                  item.num < step ? 'cursor-pointer' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${
                    isDone
                      ? 'bg-amber-500 text-zinc-950'
                      : isCurrent
                      ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500 ring-4 ring-amber-500/10'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium transition-colors ${
                    isCurrent ? 'text-amber-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerta de Erro / Conflito */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-red-200 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* PASSO 1: Seleção de Serviço */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              Selecione o Serviço Desejado
            </h2>
            <span className="text-xs text-zinc-400">Passo 1 de 4</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-1">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border relative ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-zinc-100">{service.nome}</h3>
                        {service.destaque && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Mais Pedido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{service.descricao}</p>
                      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {service.duracaoMinutos} min
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-amber-400">
                        R$ {Number(service.preco).toFixed(2)}
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ml-auto mt-2 transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950'
                            : 'border border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              Continuar para Barbeiro
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 2: Seleção de Barbeiro */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <span className="text-xs text-zinc-400">Passo 2 de 4</span>
          </div>

          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            Escolha seu Barbeiro de Preferência
          </h2>

          <div className="grid gap-3 sm:grid-cols-1">
            {barbers.map((barber) => {
              const isSelected = selectedBarber?.id === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border flex items-center gap-4 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90'
                  }`}
                >
                  <img
                    src={barber.avatar}
                    alt={barber.nome}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-zinc-100 truncate">{barber.nome}</h3>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        ★ {barber.avaliacao.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{barber.especialidade}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950'
                        : 'border border-zinc-700 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-sm font-semibold"
            >
              Voltar
            </button>
            <button
              disabled={!selectedBarber}
              onClick={() => setStep(3)}
              className="flex-1 sm:flex-initial px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              Escolher Data e Horário
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 3: Data e Horário Interativo */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setStep(2)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <span className="text-xs text-zinc-400">Passo 3 de 4</span>
          </div>

          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            Selecione o Dia e Horário Disponível
          </h2>

          {/* Campo de Seleção de Data */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Data do Agendamento:
            </label>
            <input
              type="date"
              min={getTodayString()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Grade de Horários */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-300">
                Horários para {selectedBarber?.nome}:
              </span>
              {isLoadingSlots && (
                <span className="text-xs text-amber-400 animate-pulse">
                  Verificando disponibilidade...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {availableSlots.map((slot) => {
                const isOccupied = occupiedSlots.includes(slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    disabled={isOccupied}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all border text-center flex flex-col items-center justify-center ${
                      isOccupied
                        ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-600 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 scale-105'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-500/60 hover:text-amber-400'
                    }`}
                  >
                    <span>{slot}</span>
                    <span className="text-[9px] font-normal tracking-tight mt-0.5">
                      {isOccupied ? 'Ocupado' : 'Livre'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-6 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Selecionado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-red-500/40" />
                <span>Ocupado (Trava)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-sm font-semibold"
            >
              Voltar
            </button>
            <button
              disabled={!selectedTime}
              onClick={() => setStep(4)}
              className="flex-1 sm:flex-initial px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              Avançar para Resumo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 4: Resumo e Confirmação */}
      {step === 4 && (
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <span className="text-xs text-zinc-400">Passo 4 de 4</span>
          </div>

          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Check className="w-5 h-5 text-amber-400" />
            Confirme seus Dados e Agendamento
          </h2>

          {/* Card Resumo do Pedido */}
          <div className="bg-zinc-900/80 p-4 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-400">Serviço:</span>
              <span className="text-sm font-bold text-zinc-100">{selectedService?.nome}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-400">Barbeiro:</span>
              <span className="text-sm font-bold text-zinc-100">{selectedBarber?.nome}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-400">Horário Escolhido:</span>
              <span className="text-sm font-bold text-amber-400">
                {selectedDate} às {selectedTime}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-zinc-400">Total a Pagar no Local:</span>
              <span className="text-lg font-black text-amber-400">
                R$ {selectedService ? Number(selectedService.preco).toFixed(2) : '0,00'}
              </span>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Seu Nome Completo:
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Pedro Henrique"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                WhatsApp / Celular:
              </label>
              <input
                type="text"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(11) 98888-7777"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-sm font-semibold"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  Garantindo Horário no Banco...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  Confirmar Agendamento
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
