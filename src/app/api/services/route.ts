import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET() {
  try {
    const services = dbService.getServices();
    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.nome || !body.preco || !body.duracaoMinutos) {
      return NextResponse.json({ success: false, error: 'Campos nome, preço e duração são obrigatórios.' }, { status: 400 });
    }

    const newService = dbService.addService({
      nome: body.nome,
      preco: Number(body.preco),
      duracaoMinutos: Number(body.duracaoMinutos),
      descricao: body.descricao || '',
      categoria: body.categoria || 'cabelo',
      destaque: Boolean(body.destaque)
    });

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do serviço é obrigatório.' }, { status: 400 });
    }

    const updated = dbService.updateService(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Serviço não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Serviço excluído com sucesso.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
