import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';
import { getTodayString } from '@/lib/date-utils';
import { Appointment, BookingRequest } from '@/types';
import { simulateConcurrencySchema } from '@/lib/validations/booking';
import { AppError, getErrorMessage } from '@/lib/errors';

export interface ClientSimulationSummary {
  status: 'SUCCESS' | 'REJECTED_CONFLICT';
  httpCode: number;
  message: string;
  code?: string;
  appointmentId?: string;
  slotLock?: string;
  client: string;
}

export interface SimulationResultResponse {
  success: boolean;
  simulationTimeMs: number;
  targetSlot: string;
  lockStrictlyEnforced: boolean;
  verdict: string;
  cliente1: ClientSimulationSummary;
  cliente2: ClientSimulationSummary;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parsed = simulateConcurrencySchema.safeParse(rawBody);
    const data = parsed.success ? parsed.data : {};

    const date = data.date || getTodayString();
    const horario = data.horario || '16:00';
    const barbeiroId = data.barbeiroId || 'barber-1';
    const servicoId = data.servicoId || 'srv-1';

    const reqCliente1: BookingRequest = {
      clienteId: 'cliente-alfa',
      clienteNome: 'João Victor (Cliente A)',
      clienteEmail: 'joao.a@exemplo.com',
      clienteTelefone: '(11) 98888-1111',
      barbeiroId,
      servicoId,
      data: date,
      horario,
    };

    const reqCliente2: BookingRequest = {
      clienteId: 'cliente-beta',
      clienteNome: 'Mateus Henrique (Cliente B)',
      clienteEmail: 'mateus.b@exemplo.com',
      clienteTelefone: '(11) 97777-2222',
      barbeiroId,
      servicoId,
      data: date,
      horario,
    };

    // Dispara AMBAS as requisições em paralelo exato via Promise.allSettled
    const startTime = Date.now();
    const [resultA, resultB] = await Promise.allSettled([
      dbService.bookAppointmentAtomic(reqCliente1),
      dbService.bookAppointmentAtomic(reqCliente2),
    ]);
    const durationMs = Date.now() - startTime;

    const parseResult = (
      res: PromiseSettledResult<Appointment>,
      clientLabel: string
    ): ClientSimulationSummary => {
      if (res.status === 'fulfilled') {
        return {
          status: 'SUCCESS',
          httpCode: 201,
          message: 'Agendamento aceito com sucesso pela trava atômica!',
          appointmentId: res.value.id,
          slotLock: res.value.slotLock,
          client: clientLabel,
        };
      } else {
        const reason = res.reason;
        const code = reason instanceof AppError ? reason.code : 'SLOT_ALREADY_BOOKED';
        const msg = getErrorMessage(reason) || 'Conflito de concorrência detectado.';
        return {
          status: 'REJECTED_CONFLICT',
          httpCode: 409,
          message: msg,
          code,
          client: clientLabel,
        };
      }
    };

    const summaryA = parseResult(resultA, 'Cliente A (João Victor)');
    const summaryB = parseResult(resultB, 'Cliente B (Mateus Henrique)');

    // Determina se a trava funcionou perfeitamente (exatamente 1 sucesso e 1 rejeição)
    const lockStrictlyEnforced =
      (summaryA.status === 'SUCCESS' && summaryB.status === 'REJECTED_CONFLICT') ||
      (summaryB.status === 'SUCCESS' && summaryA.status === 'REJECTED_CONFLICT');

    const responsePayload: SimulationResultResponse = {
      success: true,
      simulationTimeMs: durationMs,
      targetSlot: `${date} às ${horario}`,
      lockStrictlyEnforced,
      verdict: lockStrictlyEnforced
        ? 'PROVA DE CONCORRÊNCIA APROVADA: Um agendamento garantiu o lock atômico e o segundo foi rigorosamente rejeitado com HTTP 409.'
        : 'FALHA DE CONCORRÊNCIA: Ambos conseguiram ou ambos falharam de forma inesperada.',
      cliente1: summaryA,
      cliente2: summaryB,
    };

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
