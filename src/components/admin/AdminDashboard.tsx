'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Appointment, Barber, ServiceItem } from '@/types';
import { getTodayString } from '@/lib/date-utils';
import { bookingApi } from '@/services/booking-api';
import { AdminMetricsBar } from './AdminMetricsBar';
import { AdminAppointmentsList } from './AdminAppointmentsList';
import { AdminServicesList } from './AdminServicesList';
import { AdminServiceModal, ServiceFormData } from './AdminServiceModal';
import { Calendar, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'agenda' | 'servicos'>('agenda');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    id: '',
    nome: '',
    preco: '',
    duracaoMinutos: '',
    descricao: '',
    categoria: 'cabelo',
    destaque: false,
  });

  const fetchData = useCallback(async () => {
    try {
      const [aptList, barberData, svcList] = await Promise.all([
        bookingApi.getAppointments(),
        bookingApi.getBarbers(),
        bookingApi.getServices(),
      ]);

      setAppointments(aptList);
      setBarbers(barberData.barbers);
      setServices(svcList);
    } catch (e: unknown) {
      console.error('Erro ao carregar dados do admin:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      bookingApi.getAppointments(),
      bookingApi.getBarbers(),
      bookingApi.getServices(),
    ])
      .then(([aptList, barberData, svcList]) => {
        if (!isMounted) return;
        setAppointments(aptList);
        setBarbers(barberData.barbers);
        setServices(svcList);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar dados do admin:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const dayAppointments = appointments.filter((apt) => apt.data === selectedDate);
  const confirmedOrDone = dayAppointments.filter((a) => a.status !== 'cancelado');
  const faturamentoHoje = confirmedOrDone.reduce((acc, curr) => acc + Number(curr.preco || 0), 0);
  const totalAgendamentosHoje = confirmedOrDone.length;
  const concluidosHoje = dayAppointments.filter((a) => a.status === 'concluido').length;
  const totalCapacidade = barbers.length * 13;
  const taxaOcupacao = totalCapacidade > 0 ? Math.min(100, Math.round((totalAgendamentosHoje / totalCapacidade) * 100)) : 0;

  const handleUpdateStatus = async (id: string, action: 'complete' | 'cancel') => {
    try {
      await bookingApi.updateAppointmentStatus(id, action);
      fetchData();
    } catch (e: unknown) {
      console.error('Erro ao atualizar agendamento:', e);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = Boolean(serviceForm.id);
      const payload = {
        nome: serviceForm.nome,
        preco: Number(serviceForm.preco),
        duracaoMinutos: Number(serviceForm.duracaoMinutos),
        descricao: serviceForm.descricao,
        categoria: serviceForm.categoria,
        destaque: serviceForm.destaque,
      };

      if (isEditing) {
        await bookingApi.updateService(serviceForm.id, payload);
      } else {
        await bookingApi.createService(payload);
      }

      setIsServiceModalOpen(false);
      setServiceForm({
        id: '',
        nome: '',
        preco: '',
        duracaoMinutos: '',
        descricao: '',
        categoria: 'cabelo',
        destaque: false,
      });
      fetchData();
    } catch (e: unknown) {
      console.error('Erro ao salvar serviço:', e);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja remover este serviço da barbearia?')) return;
    try {
      await bookingApi.deleteService(id);
      fetchData();
    } catch (e: unknown) {
      console.error('Erro ao deletar serviço:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-lg border border-zinc-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
            Administração Geral
          </span>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 mt-0.5">
            Gestão Operacional da Barbearia
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <input
              type="date"
              aria-label="Selecionar data da agenda"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-zinc-200 focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              fetchData();
            }}
            title="Recarregar dados"
            className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Métricas */}
      <AdminMetricsBar
        faturamentoHoje={faturamentoHoje}
        totalAgendamentosHoje={totalAgendamentosHoje}
        concluidosHoje={concluidosHoje}
        taxaOcupacao={taxaOcupacao}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`pb-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors border-b-2 ${
            activeTab === 'agenda'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Agenda do Dia ({dayAppointments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('servicos')}
          className={`pb-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors border-b-2 ${
            activeTab === 'servicos'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Serviços ({services.length})
        </button>
      </div>

      {activeTab === 'agenda' ? (
        <AdminAppointmentsList
          appointments={dayAppointments}
          barbers={barbers}
          selectedBarberFilter={selectedBarberFilter}
          onFilterChange={setSelectedBarberFilter}
          onStatusChange={handleUpdateStatus}
        />
      ) : (
        <AdminServicesList
          services={services}
          onOpenCreateModal={() => {
            setServiceForm({
              id: '',
              nome: '',
              preco: '',
              duracaoMinutos: '',
              descricao: '',
              categoria: 'cabelo',
              destaque: false,
            });
            setIsServiceModalOpen(true);
          }}
          onEditService={(s) => {
            setServiceForm({
              id: s.id,
              nome: s.nome,
              preco: String(s.preco),
              duracaoMinutos: String(s.duracaoMinutos),
              descricao: s.descricao,
              categoria: s.categoria,
              destaque: Boolean(s.destaque),
            });
            setIsServiceModalOpen(true);
          }}
          onDeleteService={handleDeleteService}
        />
      )}

      <AdminServiceModal
        isOpen={isServiceModalOpen}
        serviceForm={serviceForm}
        onChange={(updates) => setServiceForm((prev) => ({ ...prev, ...updates }))}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleSaveService}
      />
    </div>
  );
};
