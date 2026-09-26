import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';
import { serviceItemInputSchema } from '@/lib/validations/booking';
import { getErrorMessage } from '@/lib/errors';
import { z } from 'zod';

export async function GET() {
  try {
    const services = dbService.getServices();
    return NextResponse.json({ success: true, services });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = serviceItemInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados de serviço inválidos.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const newService = dbService.addService(parsed.data);

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

const updateServiceSchema = z.object({
  id: z.string().min(1, 'ID do serviço é obrigatório'),
  nome: z.string().min(2).optional(),
  preco: z.number().positive().optional(),
  duracaoMinutos: z.number().int().positive().optional(),
  descricao: z.string().optional(),
  categoria: z.enum(['cabelo', 'barba', 'combo', 'estetica']).optional(),
  destaque: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = updateServiceSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros de atualização inválidos.' },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;

    const updated = dbService.updateService(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Serviço não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID é obrigatório.' }, { status: 400 });
    }

    const deleted = dbService.deleteService(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Serviço não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Serviço excluído com sucesso.' });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
