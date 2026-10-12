import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { fechaISOaDate, hoyEnES } from '@/lib/fechas';
import { parsearAlcance } from '@/lib/cierres';
import { MAX_DIAS_ESPECIALES, parsearTurnosEspeciales } from '@/lib/turnos';
import { exigirAdminApi } from '@/lib/admin-guard';

async function leerCuerpo(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const cuerpo = await request.json();
    return cuerpo && typeof cuerpo === 'object' ? (cuerpo as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Crea o actualiza turnos especiales en una fecha o un rango.
 * Body: { desde, hasta?, turnos: [{ hora, capacidad, capacidadVereda }], reemplaza? }
 *   · un turno especial a la misma hora que uno semanal lo reemplaza ese día;
 *   · reemplaza=true → el día usa solo sus turnos especiales.
 * Volver a enviar la misma hora actualiza su capacidad.
 */
export async function POST(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  const cuerpo = await leerCuerpo(request);
  if (!cuerpo) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });

  const fechasParsed = parsearAlcance({ desde: cuerpo.desde, hasta: cuerpo.hasta });
  if (!fechasParsed.ok) return NextResponse.json({ error: fechasParsed.error }, { status: 400 });
  const { fechas } = fechasParsed.alcance;

  if (fechas.length > MAX_DIAS_ESPECIALES) {
    return NextResponse.json(
      { error: `Rango demasiado largo (máximo ${MAX_DIAS_ESPECIALES} días)` },
      { status: 400 }
    );
  }
  if (fechas[0] < hoyEnES()) {
    return NextResponse.json({ error: 'No se pueden cargar fechas pasadas' }, { status: 400 });
  }

  const turnosParsed = parsearTurnosEspeciales(cuerpo.turnos);
  if (!turnosParsed.ok) return NextResponse.json({ error: turnosParsed.error }, { status: 400 });

  if (cuerpo.reemplaza !== undefined && typeof cuerpo.reemplaza !== 'boolean') {
    return NextResponse.json({ error: 'Valor inválido en "reemplaza"' }, { status: 400 });
  }
  const reemplaza = cuerpo.reemplaza === true;

  const fechasDate = fechas.map(fechaISOaDate);
  const horas = turnosParsed.turnos.map((t) => t.hora);

  try {
    await prisma.$transaction([
      // Se reemplazan las filas de esas horas (así volver a enviar actualiza la capacidad)…
      prisma.turnoEspecial.deleteMany({ where: { fecha: { in: fechasDate }, hora: { in: horas } } }),
      prisma.turnoEspecial.createMany({
        data: fechasDate.flatMap((fecha) =>
          turnosParsed.turnos.map((t) => ({
            fecha,
            hora: t.hora,
            capacidad: t.capacidad,
            capacidadVereda: t.capacidadVereda,
            reemplaza,
          }))
        ),
      }),
      // …y el modo del día se mantiene igual en todas sus filas.
      prisma.turnoEspecial.updateMany({
        where: { fecha: { in: fechasDate } },
        data: { reemplaza },
      }),
    ]);

    revalidatePath('/reservar');
    return NextResponse.json({
      success: true,
      dias: fechas.length,
      turnos: turnosParsed.turnos.length,
    });
  } catch (error) {
    console.error('Error guardando turnos especiales:', error);
    return NextResponse.json({ error: 'Error al guardar los horarios' }, { status: 500 });
  }
}

/**
 * Quita turnos especiales. Body: { desde, hasta?, hora? }
 * Sin `hora` quita todos los de esas fechas (el día vuelve a su horario habitual).
 * No toca reservas ya hechas.
 */
export async function DELETE(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  const cuerpo = await leerCuerpo(request);
  if (!cuerpo) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });

  const parsed = parsearAlcance({ desde: cuerpo.desde, hasta: cuerpo.hasta, hora: cuerpo.hora });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { fechas, hora } = parsed.alcance;
  if (hora === '') {
    return NextResponse.json({ error: 'Horario inválido' }, { status: 400 });
  }

  try {
    const res = await prisma.turnoEspecial.deleteMany({
      where: {
        fecha: { gte: fechaISOaDate(fechas[0]), lte: fechaISOaDate(fechas[fechas.length - 1]) },
        ...(hora !== undefined ? { hora } : {}),
      },
    });

    revalidatePath('/reservar');
    return NextResponse.json({ success: true, eliminados: res.count });
  } catch (error) {
    console.error('Error quitando turnos especiales:', error);
    return NextResponse.json({ error: 'Error al quitar los horarios' }, { status: 500 });
  }
}
