'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BookingWizard } from '@/components/client/BookingWizard';
import { MyAppointments } from '@/components/client/MyAppointments';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ConcurrencySimulatorModal } from '@/components/common/ConcurrencySimulatorModal';
import { useAuth } from '@/contexts/AuthContext';
import { Scissors, ShieldCheck, Zap, Star, Shield, Clock } from 'lucide-react';

export default function Home() {
  const { role, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'agendar' | 'meus-agendamentos' | 'admin'>('agendar');
  const [isConcurrencyModalOpen, setIsConcurrencyModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Barra de Navegação Superior */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenConcurrencyModal={() => setIsConcurrencyModalOpen(true)}
      />

      {/* Faixa Superior Informativa com Destaque de Trava de Concorrência */}
      <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/10 border-b border-zinc-800/80 px-4 py-2 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-amber-400">Firebase Concurrency Lock Ativo:</span>
          <span className="hidden sm:inline">
            Proteção estrita anti-duplicidade em transação atômica.
          </span>
          <button
            onClick={() => setIsConcurrencyModalOpen(true)}
            className="underline text-amber-400 hover:text-amber-300 font-bold ml-1 cursor-pointer"
          >
            [Testar Simulação de 2 Cliques Simultâneos]
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ABA: AGENDAR (Interface do Cliente) */}
        {currentTab === 'agendar' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                Experiência Premium de Barbearia Tradicional
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
                Agende seu Estilo com a <span className="gold-gradient-text">Navalha D'Ouro</span>
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Escolha seu serviço, selecione seu barbeiro e reserve em segundos sem filas e com confirmação em tempo real.
              </p>
            </div>

            {/* Componente do Agendamento */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
              <BookingWizard onBookingSuccess={() => setCurrentTab('meus-agendamentos')} />
            </div>
          </div>
        )}

        {/* ABA: MEUS AGENDAMENTOS */}
        {currentTab === 'meus-agendamentos' && (
          <div className="py-4">
            <MyAppointments onNewBookingClick={() => setCurrentTab('agendar')} />
          </div>
        )}

        {/* ABA: PAINEL ADMINISTRATIVO */}
        {currentTab === 'admin' && (
          <div className="py-2">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Footer Elegante */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-4 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Scissors className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-zinc-300">Navalha D'Ouro Barber Shop</span>
          <span>•</span>
          <span>Next.js 15 + TailwindCSS + Firebase Full-Stack</span>
        </div>
        <p>© 2026 Navalha D'Ouro. Todos os direitos reservados. Travas atômicas garantidas via Firestore & Cloud Functions.</p>
      </footer>

      {/* Modal de Simulação de Concorrência Simultânea */}
      <ConcurrencySimulatorModal
        isOpen={isConcurrencyModalOpen}
        onClose={() => setIsConcurrencyModalOpen(false)}
        onTestCompleted={() => {}}
      />
    </div>
  );
}
