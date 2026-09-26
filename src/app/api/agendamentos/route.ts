import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';
import { bookingRequestSchema, patchAppointmentSchema } from '@/lib/validations/booking';
import { checkRateLimit } from '@/lib/rate-limiter';
import { AppError, getErrorMessage } from '@/lib/errors';

// GET: Listar agendamentos com filtros opcionais
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const barberId = searchParams.get('barberId') || undefined;
    const clientId = searchParams.get('clientId') || undefined;

    const appointments = dbService.getAppointments({ date, barberId, clientId });
    return NextResponse.json({ success: true, appointments });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST: Criar novo agendamento com trava estrita de concorrência atômica
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting por IP ou cabeçalho
    const ip = request.headers.get('x-forwarded-for') || 'local-client';
    const rateLimit = checkRateLimit(`booking_${ip}`, 20, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas. Aguarde ${rateLimit.retryAfterSeconds} segundos.`,
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // 2. Leitura e validação rigorosa de esquema via Zod
    const rawBody = await request.json().catch(() => null);
    const validationResult = bookingRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errorDetails = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          error: 'Dados de agendamento inválidos.',
          details: errorDetails,
          code: 'VALIDATION_ERROR',
        },
        { status: 422 }
      );
    }

    // 3. Chamada à transação atômica
    const appointment = await dbService.bookAppointmentAtomic(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Agendamento confirmado com sucesso!',
        appointment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error) || 'Erro ao processar agendamento.',
        code: 'BOOKING_FAILED',
      },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar status do agendamento (concluido / cancelado)
export async function PATCH(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);
    const validationResult = patchAppointmentSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'ID e ação válidos são necessários.' },
        { status: 400 }
      );
    }

    const { id, action } = validationResult.data;

    let ok = false;
    if (action === 'cancel') {
      ok = dbService.cancelAppointment(id);
    } else if (action === 'complete') {
      ok = dbService.completeAppointment(id);
    }

    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Agendamento não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status alterado para: ${action}`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
