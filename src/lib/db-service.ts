import { Appointment, Barber, BookingRequest, ServiceItem } from '@/types';
import { BookingConflictError, NotFoundError } from '@/lib/errors';

// Dados iniciais realistas da Barbearia
export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-1',
    nome: 'Mateus "Navalha" Silva',
    especialidade: 'Especialista em Degradê, Fade & Visagismo Masculino',
    avatar: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
    avaliacao: 4.9,
    ativo: true,
  },
  {
    id: 'barber-2',
    nome: 'Carlos Eduardo (Kadu)',
    especialidade: 'Mestre em Barboterapia & Barba Lenhador Tradicional',
    avatar: 'https://images.unsplash.com/photo-1517832606589-7629c339590a?auto=format&fit=crop&q=80&w=400',
    avaliacao: 5.0,
    ativo: true,
  },
  {
    id: 'barber-3',
    nome: 'Enzo Ferrari',
    especialidade: 'Cortes Modernos, Texturização & Pigmentação',
    avatar: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=400',
    avaliacao: 4.8,
    ativo: true,
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    nome: 'Corte Degradê Navalhado',
    preco: 60.0,
    duracaoMinutos: 45,
    descricao: 'Corte contemporâneo com transição limpa na navalha, finalização com pomada matte premium.',
    categoria: 'cabelo',
    destaque: true,
  },
  {
    id: 'srv-2',
    nome: 'Barboterapia & Toalha Quente',
    preco: 50.0,
    duracaoMinutos: 35,
    descricao: 'Modelagem de barba com esfoliação facial, óleos essenciais, toalha quente e pós-barba refrescante.',
    categoria: 'barba',
    destaque: true,
  },
  {
    id: 'srv-3',
    nome: 'Combo Executivo (Cabelo + Barba)',
    preco: 95.0,
    duracaoMinutos: 75,
    descricao: 'Experiência completa: corte na tesoura ou navalha e alinhamento impecável de barba com toalha aquecida.',
    categoria: 'combo',
    destaque: true,
  },
  {
    id: 'srv-4',
    nome: 'Pigmentação de Barba ou Cabelo',
    preco: 45.0,
    duracaoMinutos: 30,
    descricao: 'Preenchimento harmônico de falhas e realce dos fios grisalhos com tintura hipoalergênica.',
    categoria: 'estetica',
  },
  {
    id: 'srv-5',
    nome: 'Tratamento Capilar & Hidratação',
    preco: 40.0,
    duracaoMinutos: 30,
    descricao: 'Lavagem com shampoo purificante e nutrição profunda dos fios danificados.',
    categoria: 'cabelo',
  },
];

export const AVAILABLE_HOURS = [
  '09:00', '09:45', '10:30', '11:15',
  '13:00', '13:45', '14:30', '15:15', '16:00', '16:45', '17:30', '18:15', '19:00',
];

import { getTodayString } from '@/lib/date-utils';
export { getTodayString };

// Armazenamento em memória com persistência e travas atômicas
export class DatabaseStore {
  private barbers: Barber[] = [...INITIAL_BARBERS];
  private services: ServiceItem[] = [...INITIAL_SERVICES];
  private appointments: Appointment[] = [];
  private slotLocks: Set<string> = new Set(); // Conjunto com chaves: `${barbeiroId}_${data}_${horario}`
  private transactionMutex: Promise<void> = Promise.resolve();

  constructor() {
    this.seedInitialAppointments();
  }

  private seedInitialAppointments() {
    const today = getTodayString();

    const seedBookings: Omit<Appointment, 'id' | 'slotLock' | 'criadoEm'>[] = [
      {
        clienteId: 'cli-sample-1',
        clienteNome: 'Lucas Oliveira',
        clienteTelefone: '(11) 98765-4321',
        clienteEmail: 'lucas@exemplo.com',
        barbeiroId: 'barber-1',
        barbeiroNome: 'Mateus "Navalha" Silva',
        servicoId: 'srv-1',
        servicoNome: 'Corte Degradê Navalhado',
        preco: 60.0,
        duracaoMinutos: 45,
        data: today,
        horario: '10:30',
        status: 'concluido',
      },
      {
        clienteId: 'cli-sample-2',
        clienteNome: 'Gabriel Santos',
        clienteTelefone: '(11) 99882-1234',
        clienteEmail: 'gabriel@exemplo.com',
        barbeiroId: 'barber-1',
        barbeiroNome: 'Mateus "Navalha" Silva',
        servicoId: 'srv-3',
        servicoNome: 'Combo Executivo (Cabelo + Barba)',
        preco: 95.0,
        duracaoMinutos: 75,
        data: today,
        horario: '14:30',
        status: 'confirmado',
      },
      {
        clienteId: 'cli-sample-3',
        clienteNome: 'Rodrigo Lima',
        clienteTelefone: '(11) 97112-9988',
        clienteEmail: 'rodrigo@exemplo.com',
        barbeiroId: 'barber-2',
        barbeiroNome: 'Carlos Eduardo (Kadu)',
        servicoId: 'srv-2',
        servicoNome: 'Barboterapia & Toalha Quente',
        preco: 50.0,
        duracaoMinutos: 35,
        data: today,
        horario: '11:15',
        status: 'confirmado',
      },
    ];

    for (const b of seedBookings) {
      const lockKey = `${b.barbeiroId}_${b.data}_${b.horario}`;
      this.slotLocks.add(lockKey);
      this.appointments.push({
        ...b,
        id: `apt-${Math.random().toString(36).substring(2, 9)}`,
        slotLock: lockKey,
        criadoEm: new Date().toISOString(),
      });
    }
  }

  // Barbeiros
  public getBarbers(): Barber[] {
    return this.barbers;
  }

  public getBarberById(id: string): Barber | undefined {
    return this.barbers.find((b) => b.id === id);
  }

  // Serviços
  public getServices(): ServiceItem[] {
    return this.services;
  }

  public getServiceById(id: string): ServiceItem | undefined {
    return this.services.find((s) => s.id === id);
  }

  public addService(service: Omit<ServiceItem, 'id'>): ServiceItem {
    const newService: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`,
    };
    this.services.push(newService);
    return newService;
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.services[idx] = { ...this.services[idx], ...updates };
    return this.services[idx];
  }

  public deleteService(id: string): boolean {
    const initialLen = this.services.length;
    this.services = this.services.filter((s) => s.id !== id);
    return this.services.length < initialLen;
  }

  // Agendamentos
  public getAppointments(filters?: { date?: string; barberId?: string; clientId?: string }): Appointment[] {
    return this.appointments.filter((apt) => {
      if (filters?.date && apt.data !== filters.date) return false;
      if (filters?.barberId && apt.barbeiroId !== filters.barberId) return false;
      if (filters?.clientId && apt.clienteId !== filters.clientId) return false;
      return true;
    });
  }

  public getOccupiedSlots(barberId: string, date: string): string[] {
    return this.appointments
      .filter((apt) => apt.barbeiroId === barberId && apt.data === date && apt.status !== 'cancelado')
      .map((apt) => apt.horario);
  }

  public cancelAppointment(id: string): boolean {
    const apt = this.appointments.find((a) => a.id === id);
    if (!apt) return false;
    apt.status = 'cancelado';
    this.slotLocks.delete(apt.slotLock);
    return true;
  }

  public completeAppointment(id: string): boolean {
    const apt = this.appointments.find((a) => a.id === id);
    if (!apt) return false;
    apt.status = 'concluido';
    return true;
  }

  /**
   * TRANSAÇÃO ATÔMICA COM CONTROLE ESTRITO DE CONCORRÊNCIA:
   * Evita estritamente que duas requisições simultâneas reservem o mesmo barbeiro
   * na mesma data e horário.
   */
  public async bookAppointmentAtomic(req: BookingRequest): Promise<Appointment> {
    return new Promise<Appointment>((resolve, reject) => {
      this.transactionMutex = this.transactionMutex.then(async () => {
        try {
          const barber = this.getBarberById(req.barbeiroId);
          if (!barber) {
            throw new NotFoundError(`Barbeiro com ID "${req.barbeiroId}" não encontrado.`);
          }

          const service = this.getServiceById(req.servicoId);
          if (!service) {
            throw new NotFoundError(`Serviço com ID "${req.servicoId}" não encontrado.`);
          }

          const lockKey = `${req.barbeiroId}_${req.data}_${req.horario}`;

          // Verificação atômica de colisão
          const isSlotLocked = this.slotLocks.has(lockKey);
          const hasExistingBooking = this.appointments.some(
            (a) => a.barbeiroId === req.barbeiroId && a.data === req.data && a.horario === req.horario && a.status !== 'cancelado'
          );

          if (isSlotLocked || hasExistingBooking) {
            throw new BookingConflictError(
              `CONFLITO DE CONCORRÊNCIA: O barbeiro "${barber.nome}" já possui agendamento confirmado no dia ${req.data} às ${req.horario}.`
            );
          }

          // Gravação atômica da trava e do agendamento
          this.slotLocks.add(lockKey);

          const newAppointment: Appointment = {
            id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            clienteId: req.clienteId,
            clienteNome: req.clienteNome,
            clienteTelefone: req.clienteTelefone,
            clienteEmail: req.clienteEmail,
            barbeiroId: barber.id,
            barbeiroNome: barber.nome,
            servicoId: service.id,
            servicoNome: service.nome,
            preco: service.preco,
            duracaoMinutos: service.duracaoMinutos,
            data: req.data,
            horario: req.horario,
            status: 'confirmado',
            criadoEm: new Date().toISOString(),
            slotLock: lockKey,
          };

          this.appointments.push(newAppointment);
          resolve(newAppointment);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

// Singleton global para persistência em tempo de execução no Node / Next.js
declare global {
  var __barbeariaDb: DatabaseStore | undefined;
}

export const dbService: DatabaseStore = global.__barbeariaDb || new DatabaseStore();

if (process.env.NODE_ENV !== 'production') {
  global.__barbeariaDb = dbService;
}
