import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_OCUPAN_MESA, UBICACIONES } from '@/lib/constants';
import { dateAFechaISO, diaSemanaDe, fechaISOaDate, hoyEnES, sumarDias } from '@/lib/fechas';
import { turnosDeRango } from '@/lib/turnos';
import { cierresEnRango, diaCerradoCompleto, type CierreLite } from '@/lib/cierres';
import { exigirAdminApi } from '@/lib/admin-guard';

/** Resumen del mes: una fila por día con reservas, personas y estado de cierre. */
export async function GET(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const mes = new URL(request.url).searchParams.get('mes') || hoyEnES().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
      return NextResponse.json({ error: 'Mes inválido (usar YYYY-MM)' }, { status: 400 });
    }

    const [anio, nroMes] = mes.split('-').map(Number);
    const diasDelMes = new Date(Date.UTC(anio, nroMes, 0)).getUTCDate();
    const primero = `${mes}-01`;
    const ultimo = `${mes}-${String(diasDelMes).padStart(2, '0')}`;

    const [reservas, turnosPorFecha, cierres] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          fecha: { gte: fechaISOaDate(primero), lte: fechaISOaDate(ultimo) },
          estado: { in: ESTADOS_OCUPAN_MESA },
        },
        select: { fecha: true, personas: true, ubicacion: true },
      }),
      turnosDeRango(primero, ultimo),
      cierresEnRango(primero, ultimo),
    ]);

    const reservasPorFecha = new Map<
      string,
      { reservas: number; personas: number; adentro: number; vereda: number }
    >();
    for (const r of reservas) {
      const f = dateAFechaISO(r.fecha);
      const acc = reservasPorFecha.get(f) || { reservas: 0, personas: 0, adentro: 0, vereda: 0 };
      acc.reservas += 1;
      acc.personas += r.personas;
      if (r.ubicacion === UBICACIONES.VEREDA) acc.vereda += r.personas;
      else acc.adentro += r.personas;
      reservasPorFecha.set(f, acc);
    }

    const cierresPorFecha = new Map<string, CierreLite[]>();
    for (const c of cierres) {
      cierresPorFecha.set(c.fecha, [...(cierresPorFecha.get(c.fecha) || []), c]);
    }

    const dias = [];
    for (let f = primero; f <= ultimo; f = sumarDias(f, 1)) {
      const diaSemana = diaSemanaDe(f);
      const delDia = cierresPorFecha.get(f) || [];
      const cerradoDia = diaCerradoCompleto(delDia);
      const resumen = reservasPorFecha.get(f) || { reservas: 0, personas: 0, adentro: 0, vereda: 0 };
      const turnos = turnosPorFecha.get(f)?.turnos ?? [];
      dias.push({
        fecha: f,
        diaSemana,
        abre: turnos.length > 0,
        especial: turnos.some((t) => t.especial),
        ...resumen,
        capacidad: turnos.reduce((s, t) => s + t.capacidad + t.capacidadVereda, 0),
        cerradoDia,
        cerrados: cerradoDia ? 0 : delDia.length,
        motivo: delDia.find((c) => c.hora === '' && c.sector === 'todos')?.motivo ?? null,
      });
    }

    return NextResponse.json({ mes, hoy: hoyEnES(), dias });
  } catch (error) {
    console.error('Error en calendario:', error);
    return NextResponse.json({ error: 'Error al obtener el calendario' }, { status: 500 });
  }
}
