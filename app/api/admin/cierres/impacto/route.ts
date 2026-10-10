import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA, UBICACIONES } from '@/lib/constants';
import { fechaISOaDate } from '@/lib/fechas';
import { parsearAlcance } from '@/lib/cierres';
import { exigirAdminApi } from '@/lib/admin-guard';

/**
 * Cuántas reservas confirmadas ya existen dentro de lo que se está por cerrar.
 * Sirve para avisar antes de confirmar: cerrar NO cancela reservas, y la
 * persona del panel tiene que saber a quién avisarle.
 * Query: ?desde=&hasta=&hora=&sector= (mismos valores que POST /api/admin/cierres)
 */
export async function GET(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  const q = new URL(request.url).searchParams;
  const parsed = parsearAlcance({
    desde: q.get('desde') ?? undefined,
    hasta: q.get('hasta') ?? undefined,
    hora: q.get('hora') ?? undefined,
    sector: q.get('sector') ?? undefined,
  });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { fechas } = parsed.alcance;
  const hora = parsed.alcance.hora ?? '';
  const sector = parsed.alcance.sector ?? 'todos';

  try {
    const agregado = await prisma.reservation.aggregate({
      where: {
        fecha: { gte: fechaISOaDate(fechas[0]), lte: fechaISOaDate(fechas[fechas.length - 1]) },
        estado: ESTADOS_RESERVA.CONFIRMADA,
        ...(hora !== '' ? { hora } : {}),
        ...(sector === 'vereda' ? { ubicacion: UBICACIONES.VEREDA } : {}),
        ...(sector === 'adentro' ? { ubicacion: { not: UBICACIONES.VEREDA } } : {}),
      },
      _count: true,
      _sum: { personas: true },
    });

    return NextResponse.json({
      reservas: agregado._count,
      personas: agregado._sum.personas || 0,
    });
  } catch (error) {
    console.error('Error calculando impacto:', error);
    return NextResponse.json({ error: 'Error al calcular el impacto' }, { status: 500 });
  }
}
