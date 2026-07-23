import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA, UBICACIONES } from '@/lib/constants';
import { fechaISOaDate, hoyEnES, sumarDias } from '@/lib/fechas';

export async function GET() {
  try {
    const hoyISO = hoyEnES();
    const mananaISO = sumarDias(hoyISO, 1);
    const hoy = fechaISOaDate(hoyISO);
    const manana = fechaISOaDate(mananaISO);

    const [reservasHoy, reservasManana, totalReservas, totalPersonas] = await Promise.all([
      prisma.reservation.findMany({
        where: { fecha: hoy, estado: ESTADOS_RESERVA.CONFIRMADA },
      }),
      prisma.reservation.findMany({
        where: { fecha: manana, estado: ESTADOS_RESERVA.CONFIRMADA },
      }),
      prisma.reservation.count({ where: { estado: ESTADOS_RESERVA.CONFIRMADA } }),
      prisma.reservation.aggregate({
        where: { estado: ESTADOS_RESERVA.CONFIRMADA },
        _sum: { personas: true },
      }),
    ]);

    const personasHoy = reservasHoy.reduce((sum, r) => sum + r.personas, 0);
    const personasManana = reservasManana.reduce((sum, r) => sum + r.personas, 0);
    const veredaHoy = reservasHoy
      .filter((r) => r.ubicacion === UBICACIONES.VEREDA)
      .reduce((sum, r) => sum + r.personas, 0);

    return NextResponse.json({
      reservasHoy: reservasHoy.length,
      reservasManana: reservasManana.length,
      totalReservas,
      totalPersonas: totalPersonas._sum.personas || 0,
      personasHoy,
      personasManana,
      adentroHoy: personasHoy - veredaHoy,
      veredaHoy,
    });
  } catch (error) {
    console.error('Error en stats:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
