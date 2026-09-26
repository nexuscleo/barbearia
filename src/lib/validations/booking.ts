import { z } from 'zod';

// Sanitização básica contra injeções de scripts / XSS em strings
export function sanitizeString(val: string): string {
  return val
    .replace(/[<>]/g, '') // remove tags HTML
    .trim();
}

export const bookingRequestSchema = z.object({
  clienteId: z.string().min(1, 'ID do cliente é obrigatório'),
  clienteNome: z
    .string()
    .min(2, 'Nome deve conter pelo menos 2 caracteres')
    .max(100, 'Nome excessivamente longo')
    .transform(sanitizeString),
  clienteTelefone: z
    .string()
    .min(8, 'Telefone inválido')
    .max(20, 'Telefone inválido')
    .transform(sanitizeString),
  clienteEmail: z
    .string()
    .email('E-mail em formato inválido')
    .transform(sanitizeString),
  barbeiroId: z.string().min(1, 'Selecione um barbeiro válido'),
  servicoId: z.string().min(1, 'Selecione um serviço válido'),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)'),
  horario: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de horário inválido (HH:mm)'),
});

export const patchAppointmentSchema = z.object({
  id: z.string().min(1, 'ID do agendamento é obrigatório'),
  action: z.enum(['cancel', 'complete'], {
    message: 'Ação deve ser "cancel" ou "complete"',
  }),
});

export const serviceItemInputSchema = z.object({
  id: z.string().optional(),
  nome: z
    .string()
    .min(2, 'Nome do serviço deve ter no mínimo 2 caracteres')
    .transform(sanitizeString),
  preco: z
    .number()
    .positive('Preço do serviço deve ser maior que zero'),
  duracaoMinutos: z
    .number()
    .int()
    .min(10, 'Duração mínima de 10 minutos')
    .max(300, 'Duração máxima de 300 minutos'),
  descricao: z
    .string()
    .default('')
    .transform(sanitizeString),
  categoria: z.enum(['cabelo', 'barba', 'combo', 'estetica']).default('cabelo'),
  destaque: z.boolean().default(false),
});

export const simulateConcurrencySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  horario: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  barbeiroId: z.string().optional(),
  servicoId: z.string().optional(),
});
