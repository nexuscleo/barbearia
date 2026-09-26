'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, RefreshCw, Cpu } from 'lucide-react';
import { getTodayString } from '@/lib/date-utils';
import { bookingApi } from '@/services/booking-api';
import { SimulationResultResponse } from '@/app/api/simulate-concurrency/route';

interface ConcurrencySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCompleted?: () => void;
}

export const ConcurrencySimulatorModal: React.FC<ConcurrencySimulatorModalProps> = ({
  isOpen,
  onClose,
  onTestCompleted,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<SimulationResultResponse | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('16:00');
  const selectedDate = getTodayString();

  if (!isOpen) return null;

  const runSimulation = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const data = await bookingApi.runConcurrencySimulation({
        date: selectedDate,
        horario: selectedSlot,
        barbeiroId: 'barber-1',
        servicoId: 'srv-1',
      });
      setTestResult(data);
      if (onTestCompleted) onTestCompleted();
    } catch (e: unknown) {
      console.error('Erro na simulação:', e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Simulador de Concorrência & Trava Atômica
              </h2>
              <p className="text-xs text-zinc-400">
                Teste de colisão: 2 requisições paralelas exatas disputando o mesmo barbeiro e horário.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-sm font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* Parâmetros do Teste */}
        <div className="grid grid-cols-2 gap-3 bg-zinc-900/60 p-3.5 rounded-md border border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-500 block mb-1 font-mono text-[11px] uppercase">
              Barbeiro Alvo:
            </span>
            <strong className="text-zinc-200">Mateus &ldquo;Navalha&rdquo; Silva</strong>
          </div>
          <div>
            <span className="text-zinc-500 block mb-1 font-mono text-[11px] uppercase">
              Horário Disputado:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                placeholder="16:00"
                className="bg-zinc-950 border border-zinc-700 px-2 py-1 rounded text-amber-400 font-mono font-bold w-20 text-center"
              />
              <span className="text-zinc-500 text-[11px] font-mono">Data: {selectedDate}</span>
            </div>
          </div>
        </div>

        {/* Botão de Disparo */}
        <button
          type="button"
          id="btn-disparar-concorrencia"
          disabled={isRunning}
          onClick={runSimulation}
          className="w-full py-3 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
              Processando Transação Concorrente...
            </>
          ) : (
            'Disparar 2 Agendamentos Simultâneos em Paralelo'
          )}
        </button>

        {/* Resultados Comparativos */}
        {testResult && (
          <div className="space-y-3 pt-1">
            <div
              className={`p-3.5 rounded-md border flex items-center gap-3 text-xs font-semibold ${
                testResult.lockStrictlyEnforced
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}
            >
              {testResult.lockStrictlyEnforced ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div>
                <div className="font-bold">{testResult.verdict}</div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Tempo da transação: {testResult.simulationTimeMs}ms • Slot: {testResult.targetSlot}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Cliente A */}
              <div
                className={`p-3 rounded-md border space-y-1.5 ${
                  testResult.cliente1.status === 'SUCCESS'
                    ? 'bg-zinc-900/80 border-emerald-500/40'
                    : 'bg-zinc-900/80 border-red-500/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200">{testResult.cliente1.client}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      testResult.cliente1.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    HTTP {testResult.cliente1.httpCode}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {testResult.cliente1.message}
                </p>
                {testResult.cliente1.slotLock && (
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Lock ID: {testResult.cliente1.slotLock}
                  </div>
                )}
              </div>

              {/* Cliente B */}
              <div
                className={`p-3 rounded-md border space-y-1.5 ${
                  testResult.cliente2.status === 'SUCCESS'
                    ? 'bg-zinc-900/80 border-emerald-500/40'
                    : 'bg-zinc-900/80 border-red-500/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200">{testResult.cliente2.client}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      testResult.cliente2.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    HTTP {testResult.cliente2.httpCode}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {testResult.cliente2.message}
                </p>
                {testResult.cliente2.code && (
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Código: {testResult.cliente2.code}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
