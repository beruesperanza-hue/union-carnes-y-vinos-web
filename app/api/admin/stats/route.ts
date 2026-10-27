import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA, ESTADOS_OCUPAN_MESA, UBICACIONES } from '@/lib/constants';
import { fechaISOaDate, hoyEnES, sumarDias } from '@/lib/fechas';
import { exigirAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const hoyISO = hoyEnES();
    const mananaISO = sumarDias(hoyISO, 1);
    const hoy = fechaISOaDate(hoyISO);
    const manana = fechaISOaDate(mananaISO);

    const [reservasHoy, reservasManana, totalReservas, totalPersonas, pendientes] = await Promise.all([
      prisma.reservation.findMany({
        where: { fecha: hoy, estado: { in: ESTADOS_OCUPAN_MESA } },
      }),
      prisma.reservation.findMany({
        where: { fecha: manana, estado: { in: ESTADOS_OCUPAN_MESA } },
      }),
      prisma.reservation.count({ where: { estado: ESTADOS_RESERVA.CONFIRMADA } }),
      prisma.reservation.aggregate({
        where: { estado: ESTADOS_RESERVA.CONFIRMADA },
        _sum: { personas: true },
      }),
      prisma.reservation.count({
        where: { estado: ESTADOS_RESERVA.PENDIENTE, fecha: { gte: hoy } },
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
      pendientes,
    });
  } catch (error) {
    console.error('Error en stats:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
