import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { exigirAdminApi } from '@/lib/admin-guard';
import { DIAS_SEMANA_ORDEN } from '@/lib/constants';
import { esCapacidad, MAX_CAPACIDAD } from '@/lib/turnos';

const esHora = (v: unknown): v is string => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/**
 * Cambia la capacidad de varios horarios semanales de una vez.
 * Body: { dia?, hora?, capacidad?, capacidadVereda?, soloContar? }
 *   · dia y/o hora filtran (ninguno = todos los horarios);
 *   · capacidad / capacidadVereda: lo que no se manda no se toca;
 *   · soloContar=true no cambia nada: devuelve cuántos horarios alcanzaría.
 */
export async function PUT(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const cuerpo = await request.json().catch(() => null);
    if (!cuerpo || typeof cuerpo !== 'object') {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }
    const { dia, hora, capacidad, capacidadVereda, soloContar } = cuerpo as Record<string, unknown>;

    if (dia !== undefined && (typeof dia !== 'string' || !DIAS_SEMANA_ORDEN.includes(dia))) {
      return NextResponse.json({ error: 'Día inválido' }, { status: 400 });
    }
    if (hora !== undefined && !esHora(hora)) {
      return NextResponse.json({ error: 'Horario inválido (usar HH:mm)' }, { status: 400 });
    }

    const where = {
      ...(dia !== undefined ? { dia: dia as string } : {}),
      ...(hora !== undefined ? { hora: hora as string } : {}),
    };

    if (soloContar === true) {
      return NextResponse.json({ alcanza: await prisma.schedule.count({ where }) });
    }

    const data: { capacidad?: number; capacidadVereda?: number } = {};
    if (capacidad !== undefined) {
      if (!esCapacidad(capacidad)) {
        return NextResponse.json({ error: `Capacidad inválida (entero entre 0 y ${MAX_CAPACIDAD})` }, { status: 400 });
      }
      data.capacidad = capacidad;
    }
    if (capacidadVereda !== undefined) {
      if (!esCapacidad(capacidadVereda)) {
        return NextResponse.json({ error: `Capacidad de terraza inválida (entero entre 0 y ${MAX_CAPACIDAD})` }, { status: 400 });
      }
      data.capacidadVereda = capacidadVereda;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Cargá la capacidad de adentro o de la terraza' }, { status: 400 });
    }

    const res = await prisma.schedule.updateMany({ where, data });
    revalidatePath('/reservar');
    return NextResponse.json({ success: true, cambiados: res.count });
  } catch (error) {
    console.error('Error cambiando capacidades en bloque:', error);
    return NextResponse.json({ error: 'Error al cambiar las capacidades' }, { status: 500 });
  }
}
