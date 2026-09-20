export type UserRole = 'cliente' | 'admin';

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  telefone?: string;
  role: UserRole;
  criadoEm?: string;
}

export interface Barber {
  id: string;
  nome: string;
  especialidade: string;
  avatar: string;
  avaliacao: number;
  ativo: boolean;
}

export interface ServiceItem {
  id: string;
  nome: string;
  preco: number;
  duracaoMinutos: number;
  descricao: string;
  categoria: 'cabelo' | 'barba' | 'combo' | 'estetica';
  destaque?: boolean;
}

export type AppointmentStatus = 'confirmado' | 'cancelado' | 'concluido';

export interface Appointment {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  barbeiroId: string;
  barbeiroNome: string;
  servicoId: string;
  servicoNome: string;
  preco: number;
  duracaoMinutos: number;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  status: AppointmentStatus;
  criadoEm: string;
  slotLock: string; // chave única: `${barbeiroId}_${data}_${horario}`
}

export interface BookingRequest {
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  barbeiroId: string;
  servicoId: string;
  data: string;
  horario: string;
}
