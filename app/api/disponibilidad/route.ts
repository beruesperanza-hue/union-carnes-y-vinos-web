import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA, UBICACIONES } from '@/lib/constants';
import { diaSemanaDe, esTurnoPasado, fechaISOaDate } from '@/lib/fechas';
import { cierresDeFecha, diaCerradoCompleto, estadoCierreTurno } from '@/lib/cierres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaStr = searchParams.get('fecha');
    const personasStr = searchParams.get('personas');

    const personas = parseInt(personasStr || '');

    // La fecha llega como 'YYYY-MM-DD' desde el <input type="date">.
    if (!fechaStr || !/^\d{4}-\d{2}-\d{2}$/.test(fechaStr) || isNaN(personas) || personas < 1 || personas > 20) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const fecha = fechaISOaDate(fechaStr);
    const diaNombre = diaSemanaDe(fechaStr);

    const horarios = await prisma.schedule.findMany({
      where: { dia: diaNombre, activo: true },
      orderBy: { hora: 'asc' },
    });

    if (horarios.length === 0) {
      return NextResponse.json({
        fecha: fechaStr,
        dia: diaNombre,
        slots: [],
        mensaje: 'No abrimos este día',
      });
    }

    // Cierres puntuales de esta fecha (feriado, evento privado, lluvia...).
    // El motivo es una nota interna: no se expone al público.
    const cierres = await cierresDeFecha(fechaStr);
    if (diaCerradoCompleto(cierres)) {
      return NextResponse.json({
        fecha: fechaStr,
        dia: diaNombre,
        slots: [],
        cerradoDia: true,
        mensaje: 'Ese día estamos cerrados. Elegí otra fecha.',
      });
    }

    const slots = await Promise.all(
      horarios.map(async (horario) => {
        const cierre = estadoCierreTurno(cierres, horario.hora);
        const salonCerrado = horario.cerradoManual || cierre.adentro;
        const veredaCerrada = horario.cerradoVereda || cierre.vereda;

        const [salonCount, veredaCount] = await Promise.all([
          prisma.reservation.aggregate({
            where: {
              fecha,
              hora: horario.hora,
              ubicacion: UBICACIONES.ADENTRO,
              estado: ESTADOS_RESERVA.CONFIRMADA,
            },
            _sum: { personas: true },
          }),
          prisma.reservation.aggregate({
            where: {
              fecha,
              hora: horario.hora,
              ubicacion: UBICACIONES.VEREDA,
              estado: ESTADOS_RESERVA.CONFIRMADA,
            },
            _sum: { personas: true },
          }),
        ]);

        const pasado = esTurnoPasado(fechaStr, horario.hora);

        const salonReservadas = salonCount._sum.personas || 0;
        const salonLibres = horario.capacidad - salonReservadas;
        const salonDisponible = !pasado && !salonCerrado && salonLibres >= personas;

        const veredaExiste = horario.capacidadVereda > 0;
        const veredaReservadas = veredaCount._sum.personas || 0;
        const veredaLibres = horario.capacidadVereda - veredaReservadas;
        const veredaDisponible =
          veredaExiste && !pasado && !veredaCerrada && veredaLibres >= personas;

        return {
          hora: horario.hora,
          pasado,
          disponible: salonDisponible || veredaDisponible,
          salon: { disponible: salonDisponible, libres: salonLibres, cerrado: salonCerrado },
          vereda: {
            existe: veredaExiste,
            disponible: veredaDisponible,
            libres: veredaLibres,
            cerrado: veredaCerrada,
          },
        };
      })
    );

    return NextResponse.json({ fecha: fechaStr, dia: diaNombre, slots });
  } catch (error) {
    console.error('Error en disponibilidad:', error);
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 });
  }
}
