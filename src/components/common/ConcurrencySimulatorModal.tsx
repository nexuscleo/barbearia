'use client';

import React, { useState } from 'react';
import { Zap, CheckCircle2, XCircle, ShieldAlert, Clock, RefreshCw, Sparkles } from 'lucide-react';
import { getTodayString } from '@/lib/db-service';

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
  const [testResult, setTestResult] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('16:00');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  if (!isOpen) return null;

  const runSimulation = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/simulate-concurrency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          horario: selectedSlot,
          barbeiroId: 'barber-1',
          servicoId: 'srv-1',
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (onTestCompleted) onTestCompleted();
    } catch (e: any) {
      setTestResult({
        success: false,
        error: e.message || 'Erro ao disparar simulação',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2">
                Simulador de Concorrência & Trava Atômica
              </h2>
              <p className="text-xs text-zinc-400">
                Teste de estresse: 2 clientes clicando para agendar o <strong>mesmo barbeiro e horário</strong> simultaneamente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-base font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Parâmetros do Teste */}
        <div className="grid grid-cols-2 gap-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-400 block mb-1">Barbeiro Alvo:</span>
            <strong className="text-zinc-200">Mateus "Navalha" Silva</strong>
          </div>
          <div>
            <span className="text-zinc-400 block mb-1">Horário Disputado:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                placeholder="16:00"
                className="bg-zinc-950 border border-zinc-700 px-2 py-1 rounded text-amber-400 font-mono font-bold w-20 text-center"
              />
              <span className="text-zinc-500 text-[10px]">Data: {selectedDate}</span>
            </div>
          </div>
        </div>

        {/* Botão de Disparo */}
        <button
          id="btn-disparar-concorrencia"
          disabled={isRunning}
          onClick={runSimulation}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
              Disparando Requisições Paralelas Simultâneas...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 stroke-[3]" />
              Disparar 2 Agendamentos Simultâneos no Mesmo Milissegundo
            </>
          )}
        </button>

        {/* Resultados Comparativos */}
        {testResult && (
          <div className="space-y-3 pt-2">
            {/* Veredito Geral */}
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
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
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Tempo total da transação atômica: {testResult.simulationTimeMs}ms
                </div>
              </div>
            </div>

            {/* Comparação dos dois clientes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Cliente A */}
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  testResult.cliente1?.status === 'SUCCESS'
                    ? 'bg-zinc-900/80 border-emerald-500/40'
                    : 'bg-zinc-900/80 border-red-500/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200">Cliente 1: João Victor</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      testResult.cliente1?.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    HTTP {testResult.cliente1?.httpCode}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {testResult.cliente1?.message}
                </p>
                {testResult.cliente1?.slotLock && (
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Lock ID: {testResult.cliente1?.slotLock}
                  </div>
                )}
              </div>

              {/* Cliente B */}
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  testResult.cliente2?.status === 'SUCCESS'
                    ? 'bg-zinc-900/80 border-emerald-500/40'
                    : 'bg-zinc-900/80 border-red-500/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200">Cliente 2: Mateus Henrique</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      testResult.cliente2?.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    HTTP {testResult.cliente2?.httpCode}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {testResult.cliente2?.message}
                </p>
                {testResult.cliente2?.code && (
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Código de Erro: {testResult.cliente2?.code}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
