import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { dateAFechaISO, fechaISOaDate, hoyEnES, sumarDias } from '@/lib/fechas';
import { exigirAdminApi } from '@/lib/admin-guard';
import { esFechaISO } from '@/lib/cierres';

export async function GET(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    // La UI manda solo ?fecha=YYYY-MM-DD para "Fecha específica": si viene una
    // fecha y no un filtro explícito, se filtra por esa fecha (antes caía en "hoy").
    const filtro = searchParams.get('filtro') || (fecha ? 'fecha' : 'hoy');
    if (fecha && !esFechaISO(fecha)) {
      return NextResponse.json({ error: 'Fecha inválida (usar YYYY-MM-DD)' }, { status: 400 });
    }

    let whereClause: any = {};

    // Reservas vigentes de hoy en adelante cuyo mail de confirmación falló.
    if (filtro === 'sinmail') {
      whereClause = {
        estado: 'confirmada',
        emailEstado: 'fallido',
        fecha: { gte: fechaISOaDate(hoyEnES()) },
      };
    }

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
