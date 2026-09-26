'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Scissors, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: 'agendar' | 'meus-agendamentos' | 'admin';
  setCurrentTab: (tab: 'agendar' | 'meus-agendamentos' | 'admin') => void;
  onOpenConcurrencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenConcurrencyModal,
}) => {
  const { role, switchRole } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0d0f14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <button
            type="button"
            onClick={() => setCurrentTab('agendar')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded bg-amber-500 flex items-center justify-center text-zinc-950 font-black">
              <Scissors className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="font-bold text-base tracking-wider text-zinc-100 flex items-center gap-1 font-mono">
                NAVALHA <span className="text-amber-400">D&apos;OURO</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-zinc-400 -mt-1 font-mono">
                Barbearia Tradicional
              </span>
            </div>
          </button>

          {/* Navegação Central */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-md border border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentTab('agendar')}
              className={`px-3.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                currentTab === 'agendar'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Novo Agendamento
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('meus-agendamentos')}
              className={`px-3.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                currentTab === 'meus-agendamentos'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Meus Horários
            </button>
            <button
              type="button"
              onClick={() => {
                if (role !== 'admin') switchRole('admin');
                setCurrentTab('admin');
              }}
              className={`px-3.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Painel Admin
            </button>
          </nav>

          {/* Ações Direitas */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenConcurrencyModal}
              title="Testar Trava Atômica de 2 Agendamentos Simultâneos"
              className="px-2.5 py-1.5 rounded text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Simular</span> Concorrência
            </button>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  switchRole('cliente');
                  if (currentTab === 'admin') setCurrentTab('agendar');
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  role === 'cliente'
                    ? 'bg-zinc-700 text-amber-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  setCurrentTab('admin');
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  role === 'admin'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação Mobile Inferior */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-800 bg-[#0d0f14] py-2 px-2">
        <button
          type="button"
          onClick={() => setCurrentTab('agendar')}
          className={`flex flex-col items-center text-xs py-1 px-2 rounded ${
            currentTab === 'agendar' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Scissors className="w-4 h-4 mb-1" />
          Agendar
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('meus-agendamentos')}
          className={`flex flex-col items-center text-xs py-1 px-2 rounded ${
            currentTab === 'meus-agendamentos' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 mb-1" />
          Meus Horários
        </button>
        <button
          type="button"
          onClick={() => {
            if (role !== 'admin') switchRole('admin');
            setCurrentTab('admin');
          }}
          className={`flex flex-col items-center text-xs py-1 px-2 rounded ${
            currentTab === 'admin' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-1" />
          Admin
        </button>
      </div>
    </header>
  );
};
