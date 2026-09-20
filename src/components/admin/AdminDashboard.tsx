'use client';

import React, { useState, useEffect } from 'react';
import { Appointment, Barber, ServiceItem } from '@/types';
import { getTodayString } from '@/lib/db-service';
import {
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Scissors,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'agenda' | 'servicos'>('agenda');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [serviceForm, setServiceForm] = useState({
    id: '',
    nome: '',
    preco: '',
    duracaoMinutos: '',
    descricao: '',
    categoria: 'cabelo' as 'cabelo' | 'barba' | 'combo' | 'estetica',
    destaque: false,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resApt, resBarbers, resServices] = await Promise.all([
        fetch(`/api/agendamentos`),
        fetch(`/api/barbers`),
        fetch(`/api/services`),
      ]);

      const [dataApt, dataBarbers, dataServices] = await Promise.all([
        resApt.json(),
        resBarbers.json(),
        resServices.json(),
      ]);

      if (dataApt.success) setAppointments(dataApt.appointments);
      if (dataBarbers.success) setBarbers(dataBarbers.barbers);
      if (dataServices.success) setServices(dataServices.services);
    } catch (e) {
      console.error('Erro ao carregar dados do admin:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Filtro de agendamentos da data selecionada
  const dayAppointments = appointments.filter((apt) => apt.data === selectedDate);
  const filteredDayAppointments = dayAppointments.filter((apt) => {
    if (selectedBarberFilter === 'all') return true;
    return apt.barbeiroId === selectedBarberFilter;
  });

  // Métricas do Dashboard
  const confirmedOrDone = dayAppointments.filter((a) => a.status !== 'cancelado');
  const faturamentoHoje = confirmedOrDone.reduce((acc, curr) => acc + Number(curr.preco || 0), 0);
  const totalAgendamentosHoje = confirmedOrDone.length;
  const concluidosHoje = dayAppointments.filter((a) => a.status === 'concluido').length;
  // Taxa estimada considerando ~13 horários por barbeiro
  const totalCapacidade = barbers.length * 13;
  const taxaOcupacao = totalCapacidade > 0 ? Math.min(100, Math.round((totalAgendamentosHoje / totalCapacidade) * 100)) : 0;

  // Ações de status do agendamento
  const handleUpdateStatus = async (id: string, action: 'complete' | 'cancel') => {
    try {
      const res = await fetch('/api/agendamentos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      console.error('Erro ao atualizar agendamento:', e);
    }
  };

  // Salvar ou Editar Serviço
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = Boolean(serviceForm.id);
      const url = '/api/services';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        ...serviceForm,
        preco: Number(serviceForm.preco),
        duracaoMinutos: Number(serviceForm.duracaoMinutos),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
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
        loadData();
      }
    } catch (e) {
      console.error('Erro ao salvar serviço:', e);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Tem certeza de que deseja remover este serviço da barbearia?')) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      console.error('Erro ao deletar serviço:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Painel de Gestão
            </span>
            <span className="text-xs text-zinc-400 font-mono">Role: Administrador</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight mt-1">
            Gestão Operacional da Barbearia
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Estimado */}
        <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Faturamento Estimado</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-100 mt-2">
            R$ {faturamentoHoje.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Na data de {selectedDate}</span>
        </div>

        {/* Card 2: Agendamentos do Dia */}
        <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Agendamentos</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {totalAgendamentosHoje}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Clientes marcados hoje</span>
        </div>

        {/* Card 3: Clientes Atendidos */}
        <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Atendidos / Concluídos</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-100 mt-2">
            {concluidosHoje}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Cortes e barbas finalizados</span>
        </div>

        {/* Card 4: Taxa de Ocupação */}
        <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Taxa de Ocupação</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-100 mt-2">
            {taxaOcupacao}%
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Capacidade total da barbearia</span>
        </div>
      </div>

      {/* Tabs Administrativas */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'agenda'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agenda dos Barbeiros ({filteredDayAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('servicos')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'servicos'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Scissors className="w-4 h-4" />
          Catálogo de Serviços ({services.length})
        </button>
      </div>

      {/* ABA 1: AGENDA DO DIA DOS BARBEIROS */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          {/* Filtro por Barbeiro */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedBarberFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBarberFilter === 'all'
                  ? 'bg-zinc-800 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              Todos os Barbeiros ({dayAppointments.length})
            </button>
            {barbers.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBarberFilter(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
                  selectedBarberFilter === b.id
                    ? 'bg-zinc-800 text-amber-400 border border-amber-500/40'
                    : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                <img src={b.avatar} alt={b.nome} className="w-4 h-4 rounded-full object-cover" />
                <span>{b.nome}</span>
              </button>
            ))}
          </div>

          {/* Lista de Agendamentos */}
          {filteredDayAppointments.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">
                Nenhum agendamento registrado para {selectedDate} com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredDayAppointments.map((apt) => {
                const isConfirmed = apt.status === 'confirmado';
                const isCompleted = apt.status === 'concluido';
                const isCancelled = apt.status === 'cancelado';

                return (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isCancelled
                        ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                        : isCompleted
                        ? 'bg-zinc-900/60 border-zinc-800'
                        : 'bg-zinc-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                    }`}
                  >
                    <div>
                      {/* Horário & Status */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-amber-400 font-black text-base">
                          <Clock className="w-4 h-4" />
                          <span>{apt.horario}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            isConfirmed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isCompleted
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      {/* Informações do Cliente */}
                      <div className="border-t border-zinc-800/80 pt-2 mb-2">
                        <div className="font-bold text-zinc-100 text-sm">{apt.clienteNome}</div>
                        <div className="text-xs text-zinc-400">{apt.clienteTelefone}</div>
                      </div>

                      {/* Serviço & Barbeiro */}
                      <div className="text-xs text-zinc-400 space-y-1 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                        <div className="flex justify-between">
                          <span>Serviço:</span>
                          <span className="text-zinc-200 font-semibold">{apt.servicoNome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Barbeiro:</span>
                          <span className="text-amber-400 font-medium">{apt.barbeiroNome}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-zinc-800/60">
                          <span>Valor:</span>
                          <span className="text-emerald-400 font-bold">
                            R$ {Number(apt.preco).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    {isConfirmed && (
                      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-zinc-800">
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'complete')}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Concluir
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'cancel')}
                          className="py-1.5 px-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold transition-colors"
                          title="Cancelar e liberar slot"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: GERENCIAMENTO DE SERVIÇOS */}
      {activeTab === 'servicos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Catálogo de Serviços da Barbearia</h2>
              <p className="text-xs text-zinc-400">Adicione, edite preços ou remova opções disponíveis para os clientes</p>
            </div>
            <button
              onClick={() => {
                setServiceForm({
                  id: '',
                  nome: '',
                  preco: '',
                  duracaoMinutos: '45',
                  descricao: '',
                  categoria: 'cabelo',
                  destaque: false,
                });
                setIsServiceModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Novo Serviço
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-100 text-sm">{srv.nome}</h3>
                    {srv.destaque && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{srv.descricao}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 pt-1">
                    <span>{srv.duracaoMinutos} min</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">R$ {Number(srv.preco).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setServiceForm({
                        id: srv.id,
                        nome: srv.nome,
                        preco: String(srv.preco),
                        duracaoMinutos: String(srv.duracaoMinutos),
                        descricao: srv.descricao,
                        categoria: srv.categoria,
                        destaque: Boolean(srv.destaque),
                      });
                      setIsServiceModalOpen(true);
                    }}
                    className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Adicionar / Editar Serviço */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-100">
                {serviceForm.id ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.nome}
                  onChange={(e) => setServiceForm({ ...serviceForm, nome: e.target.value })}
                  placeholder="Ex: Corte Navalhado Tradicional"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={serviceForm.preco}
                    onChange={(e) => setServiceForm({ ...serviceForm, preco: e.target.value })}
                    placeholder="65.00"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceForm.duracaoMinutos}
                    onChange={(e) => setServiceForm({ ...serviceForm, duracaoMinutos: e.target.value })}
                    placeholder="45"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.descricao}
                  onChange={(e) => setServiceForm({ ...serviceForm, descricao: e.target.value })}
                  placeholder="Descreva o que inclui o serviço..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={serviceForm.destaque}
                  onChange={(e) => setServiceForm({ ...serviceForm, destaque: e.target.checked })}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="destaque" className="text-xs text-zinc-300 cursor-pointer">
                  Marcar como serviço em destaque ("Mais Pedido")
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
