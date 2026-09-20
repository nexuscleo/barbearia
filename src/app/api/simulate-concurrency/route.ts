import { NextRequest, NextResponse } from 'next/server';
import { dbService, getTodayString } from '@/lib/db-service';
import { BookingRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date || getTodayString();
    const horario = body.horario || '16:00';
    const barbeiroId = body.barbeiroId || 'barber-1';
    const servicoId = body.servicoId || 'srv-1';

    const reqCliente1: BookingRequest = {
      clienteId: 'cliente-alfa',
      clienteNome: 'João Victor (Cliente A)',
      clienteEmail: 'joao.a@exemplo.com',
      clienteTelefone: '(11) 98888-1111',
      barbeiroId,
      servicoId,
      data: date,
      horario
    };

    const reqCliente2: BookingRequest = {
      clienteId: 'cliente-beta',
      clienteNome: 'Mateus Henrique (Cliente B)',
      clienteEmail: 'mateus.b@exemplo.com',
      clienteTelefone: '(11) 97777-2222',
      barbeiroId,
      servicoId,
      data: date,
      horario
    };

    // Dispara AMBAS as requisições em paralelo exato via Promise.allSettled
    const startTime = Date.now();
    const [resultA, resultB] = await Promise.allSettled([
      dbService.bookAppointmentAtomic(reqCliente1),
      dbService.bookAppointmentAtomic(reqCliente2)
    ]);
    const durationMs = Date.now() - startTime;

    const parseResult = (res: PromiseSettledResult<any>, clientLabel: string) => {
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
        return {
          status: 'REJECTED_CONFLICT',
          httpCode: 409,
          message: res.reason.message || 'Conflito de concorrência detectado.',
          code: res.reason.code || 'SLOT_ALREADY_BOOKED',
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

    return NextResponse.json({
      success: true,
      simulationTimeMs: durationMs,
      targetSlot: `${date} às ${horario}`,
      lockStrictlyEnforced,
      verdict: lockStrictlyEnforced
        ? 'PROVA DE CONCORRÊNCIA APROVADA: Um agendamento garantiu o lock atômico e o segundo foi rigorosamente rejeitado com HTTP 409.'
        : 'FALHA DE CONCORRÊNCIA: Ambos conseguiram ou ambos falharam de forma inesperada.',
      cliente1: summaryA,
      cliente2: summaryB,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
