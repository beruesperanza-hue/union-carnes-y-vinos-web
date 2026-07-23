import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { dateAFechaISO, fechaISOaDate, hoyEnES, sumarDias } from '@/lib/fechas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filtro = searchParams.get('filtro') || 'hoy';
    const fecha = searchParams.get('fecha');

    let whereClause: any = {};

    // "Hoy" es hoy en Valencia, no en la zona horaria del servidor.
    let diaISO: string | null = null;
    if (filtro === 'hoy') {
      diaISO = hoyEnES();
    } else if (filtro === 'manana') {
      diaISO = sumarDias(hoyEnES(), 1);
    } else if (filtro === 'fecha' && fecha) {
      diaISO = fecha;
    }

    if (diaISO) {
      whereClause = {
        fecha: {
          gte: fechaISOaDate(diaISO),
          lt: fechaISOaDate(sumarDias(diaISO, 1)),
        },
      };
    }

    const reservas = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });

    return NextResponse.json({
      reservas: reservas.map((r) => ({ ...r, fecha: dateAFechaISO(r.fecha) })),
    });
  } catch (error) {
    console.error('Error en reservas:', error);
    return NextResponse.json({ error: 'Error al obtener reservas' }, { status: 500 });
  }
}
