import { NextRequest, NextResponse } from 'next/server';
import { dbService, AVAILABLE_HOURS } from '@/lib/db-service';
import { getErrorMessage } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');

    const barbers = dbService.getBarbers();

    // Se fornecida data e barberId, retorna também os slots disponíveis
    if (barberId && date) {
      const occupied = dbService.getOccupiedSlots(barberId, date);
      return NextResponse.json({
        success: true,
        barbers,
        allSlots: AVAILABLE_HOURS,
        occupiedSlots: occupied,
      });
    }

    return NextResponse.json({ success: true, barbers });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
