import { Appointment, Barber, BookingRequest, ServiceItem } from '@/types';
import { SimulationResultResponse } from '@/app/api/simulate-concurrency/route';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: Record<string, string[]>;
  [key: string]: unknown;
}

export const bookingApi = {
  async getServices(): Promise<ServiceItem[]> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Falha ao carregar catálogo de serviços.');
    const data = await res.json();
    return data.services || [];
  },

  async createService(service: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar serviço.');
    return data.service;
  },

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch('/api/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar serviço.');
    return data.service;
  },

  async deleteService(id: string): Promise<boolean> {
    const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao excluir serviço.');
    return data.success;
  },

  async getBarbers(filter?: { date?: string; barberId?: string }): Promise<{
    barbers: Barber[];
    allSlots?: string[];
    occupiedSlots?: string[];
  }> {
    let url = '/api/barbers';
    if (filter?.barberId && filter?.date) {
      url += `?barberId=${filter.barberId}&date=${filter.date}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao consultar profissionais.');
    const data = await res.json();
    return {
      barbers: data.barbers || [],
      allSlots: data.allSlots,
      occupiedSlots: data.occupiedSlots,
    };
  },

  async getAppointments(filter?: { date?: string; barberId?: string; clientId?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filter?.date) params.append('date', filter.date);
    if (filter?.barberId) params.append('barberId', filter.barberId);
    if (filter?.clientId) params.append('clientId', filter.clientId);

    const qs = params.toString();
    const res = await fetch(`/api/agendamentos${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Falha ao listar agendamentos.');
    const data = await res.json();
    return data.appointments || [];
  },

  async createAppointment(req: BookingRequest): Promise<{ appointment: Appointment }> {
    const res = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.error || 'Falha ao processar agendamento.');
      (err as unknown as { statusCode: number; code: string }).statusCode = res.status;
      (err as unknown as { statusCode: number; code: string }).code = data.code || 'BOOKING_FAILED';
      throw err;
    }

    return { appointment: data.appointment };
  },

  async updateAppointmentStatus(id: string, action: 'cancel' | 'complete'): Promise<void> {
    const res = await fetch('/api/agendamentos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar agendamento.');
  },

  async runConcurrencySimulation(params: {
    date: string;
    horario: string;
    barbeiroId: string;
    servicoId: string;
  }): Promise<SimulationResultResponse> {
    const res = await fetch('/api/simulate-concurrency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha no teste de concorrência.');
    return data;
  },
};
