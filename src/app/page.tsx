'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BookingWizard } from '@/components/client/BookingWizard';
import { MyAppointments } from '@/components/client/MyAppointments';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ConcurrencySimulatorModal } from '@/components/common/ConcurrencySimulatorModal';
import { Scissors } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'agendar' | 'meus-agendamentos' | 'admin'>('agendar');
  const [isConcurrencyModalOpen, setIsConcurrencyModalOpen] = useState<boolean>(false);

  // Schema.org JSON-LD para SEO técnico conforme Seção 6.1
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BarberShop',
    name: "Navalha D'Ouro",
    description: 'Barbearia clássica com agendamento online inteligente e controle de concorrência atômica.',
    openingHours: 'Mo-Sa 09:00-19:00',
    telephone: '+55-11-98765-4321',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0e12] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Barra de Navegação Superior */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenConcurrencyModal={() => setIsConcurrencyModalOpen(true)}
      />

      {/* Faixa Informativa de Concorrência */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-zinc-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-amber-400">Transações Atômicas Ativas:</span>
          <span className="hidden sm:inline">
            Proteção estrita anti double-booking via motor ACID.
          </span>
          <button
            type="button"
            onClick={() => setIsConcurrencyModalOpen(true)}
            className="underline text-amber-400 hover:text-amber-300 font-bold ml-1 cursor-pointer"
          >
            [Simular Concorrência Simultânea]
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ABA: AGENDAR */}
        {currentTab === 'agendar' && (
          <div className="space-y-8">
            {/* Header Editorial Assimétrico */}
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
                Barbearia &amp; Estética Masculina
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
                Agende seu Corte na <span className="text-amber-400">Navalha D&apos;Ouro</span>
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                Cortes tradicionais, navalhados de alta precisão e barboterapia completa. Selecione
                o profissional e garanta sua reserva em tempo real sem filas.
              </p>
            </div>

            {/* Painel do Wizard */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 sm:p-7 shadow-sm">
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

      {/* Rodapé Editorial */}
      <footer className="border-t border-zinc-800 bg-[#0d0f14] py-8 px-4 text-center text-xs text-zinc-500 space-y-2 font-mono">
        <div className="flex items-center justify-center gap-2">
          <Scissors className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-zinc-300">Navalha D&apos;Ouro Barber Shop</span>
          <span>•</span>
          <span>Next.js 16 + TypeScript + Tailwind CSS</span>
        </div>
        <p>© 2026 Navalha D&apos;Ouro. Todos os direitos reservados. Travas atômicas serializadas.</p>
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
