'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Scissors, ShieldCheck, User, Zap, LogOut, CheckCircle2 } from 'lucide-react';

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
  const { user, role, switchRole } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-zinc-800/80 bg-zinc-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div 
            onClick={() => setCurrentTab('agendar')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-zinc-100 flex items-center gap-1">
                NAVALHA <span className="gold-gradient-text">D'OURO</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-zinc-400 -mt-1 font-mono">
                Barbearia & Barber Shop
              </span>
            </div>
          </div>

          {/* Navegação Central */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setCurrentTab('agendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'agendar'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Novo Agendamento
            </button>
            <button
              onClick={() => setCurrentTab('meus-agendamentos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'meus-agendamentos'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Meus Horários
            </button>
            <button
              onClick={() => {
                if (role !== 'admin') switchRole('admin');
                setCurrentTab('admin');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Painel Admin
            </button>
          </nav>

          {/* Ações Direitas: Simulador de Concorrência & Alternância de Papel */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão para abrir o teste de concorrência simultânea */}
            <button
              onClick={onOpenConcurrencyModal}
              title="Testar Trava Atômica de 2 Agendamentos Simultâneos"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Simular</span> Concorrência
            </button>

            {/* Alternador Rápido de Acesso (Cliente / Admin) */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => {
                  switchRole('cliente');
                  if (currentTab === 'admin') setCurrentTab('agendar');
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  role === 'cliente'
                    ? 'bg-zinc-700 text-amber-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cliente
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  setCurrentTab('admin');
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
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
      <div className="md:hidden flex items-center justify-around border-t border-zinc-800 bg-zinc-950/95 py-2 px-2">
        <button
          onClick={() => setCurrentTab('agendar')}
          className={`flex flex-col items-center text-xs py-1 px-2 rounded ${
            currentTab === 'agendar' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Scissors className="w-4 h-4 mb-1" />
          Agendar
        </button>
        <button
          onClick={() => setCurrentTab('meus-agendamentos')}
          className={`flex flex-col items-center text-xs py-1 px-2 rounded ${
            currentTab === 'meus-agendamentos' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 mb-1" />
          Meus Agendamentos
        </button>
        <button
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
