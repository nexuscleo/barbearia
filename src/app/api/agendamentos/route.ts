import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';
import { BookingRequest } from '@/types';

// GET: Listar agendamentos com filtros opcionais
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const barberId = searchParams.get('barberId') || undefined;
    const clientId = searchParams.get('clientId') || undefined;

    const appointments = dbService.getAppointments({ date, barberId, clientId });
    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Criar novo agendamento com trava estrita de concorrência atômica
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    if (!body.barbeiroId || !body.servicoId || !body.data || !body.horario || !body.clienteNome) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios ausentes (barbeiro, serviço, data, horário, nome).' },
        { status: 400 }
      );
    }

    // Chamada à transação atômica
    const appointment = await dbService.bookAppointmentAtomic(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Agendamento confirmado com sucesso!',
        appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Captura rejeição de concorrência
    const statusCode = error.statusCode || (error.code === 'SLOT_ALREADY_BOOKED' ? 409 : 500);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao processar agendamento.',
        code: error.code || 'BOOKING_FAILED',
      },
      { status: statusCode }
    );
  }
}

// PATCH: Atualizar status do agendamento (concluido / cancelado)
export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'ID e ação são necessários.' }, { status: 400 });
    }

    let ok = false;
    if (action === 'cancel') {
      ok = dbService.cancelAppointment(id);
    } else if (action === 'complete') {
      ok = dbService.completeAppointment(id);
    }

    if (!ok) {
      return NextResponse.json({ success: false, error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Status alterado para: ${action}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
