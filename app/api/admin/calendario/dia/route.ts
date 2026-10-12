import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA, UBICACIONES } from '@/lib/constants';
import { diaSemanaDe, esTurnoPasado, fechaISOaDate, hoyEnES } from '@/lib/fechas';
import { turnosDeFecha } from '@/lib/turnos';
import { cierresDeFecha, diaCerradoCompleto, esFechaISO, estadoCierreTurno } from '@/lib/cierres';
import { exigirAdminApi } from '@/lib/admin-guard';

/** Detalle de un día: turnos con ocupación y estado de cierre, y sus reservas. */
export async function GET(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const fecha = new URL(request.url).searchParams.get('fecha');
    if (!esFechaISO(fecha)) {
      return NextResponse.json({ error: 'Fecha inválida (usar YYYY-MM-DD)' }, { status: 400 });
    }

    const diaSemana = diaSemanaDe(fecha);

    const [{ turnos: horarios, reemplaza }, reservas, cierres] = await Promise.all([
      turnosDeFecha(fecha),
      prisma.reservation.findMany({
        where: { fecha: fechaISOaDate(fecha), estado: ESTADOS_RESERVA.CONFIRMADA },
        orderBy: [{ hora: 'asc' }, { createdAt: 'asc' }],
      }),
      cierresDeFecha(fecha),
    ]);

    const turnos = horarios.map((h) => {
      const delTurno = reservas.filter((r) => r.hora === h.hora);
      const adentro = delTurno
        .filter((r) => r.ubicacion !== UBICACIONES.VEREDA)
        .reduce((s, r) => s + r.personas, 0);
      const vereda = delTurno
        .filter((r) => r.ubicacion === UBICACIONES.VEREDA)
        .reduce((s, r) => s + r.personas, 0);
      const cierre = estadoCierreTurno(cierres, h.hora);

      return {
        hora: h.hora,
        especial: h.especial,
        pasado: esTurnoPasado(fecha, h.hora),
        adentro: {
          capacidad: h.capacidad,
          reservadas: adentro,
          cerradoFecha: cierre.adentro,
          cerradoSemanal: h.cerradoManual,
        },
        vereda: {
          existe: h.capacidadVereda > 0,
          capacidad: h.capacidadVereda,
          reservadas: vereda,
          cerradoFecha: cierre.vereda,
          cerradoSemanal: h.cerradoVereda,
        },
        motivo: cierre.motivo,
        cierreDelTurno: cierres.some((c) => c.hora === h.hora),
      };
    });

    return NextResponse.json({
      fecha,
      hoy: hoyEnES(),
      diaSemana,
      abre: horarios.length > 0,
      especial: horarios.some((h) => h.especial),
      reemplaza,
      cerradoDia: diaCerradoCompleto(cierres),
      cierres,
      turnos,
      reservas: reservas.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        apellido: r.apellido,
        telefono: r.telefono,
        personas: r.personas,
        hora: r.hora,
        ubicacion: r.ubicacion,
        comentarios: r.comentarios,
      })),
    });
  } catch (error) {
    console.error('Error en detalle del día:', error);
    return NextResponse.json({ error: 'Error al obtener el día' }, { status: 500 });
  }
}
