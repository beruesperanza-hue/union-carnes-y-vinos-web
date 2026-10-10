import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { fechaISOaDate, hoyEnES } from '@/lib/fechas';
import { parsearAlcance } from '@/lib/cierres';
import { exigirAdminApi } from '@/lib/admin-guard';
import { revalidatePath } from 'next/cache';

async function leerCuerpo(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const cuerpo = await request.json();
    return cuerpo && typeof cuerpo === 'object' ? (cuerpo as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Cierra un día, un rango de días, un turno o un sector.
 * Body: { desde, hasta?, hora? ('' = todo el día), sector? ('todos'|'adentro'|'vereda'), motivo? }
 * No cancela reservas existentes: solo evita las nuevas.
 */
export async function POST(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  const cuerpo = await leerCuerpo(request);
  if (!cuerpo) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });

  const parsed = parsearAlcance(cuerpo);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { fechas } = parsed.alcance;
  const hora = parsed.alcance.hora ?? '';
  const sector = parsed.alcance.sector ?? 'todos';

  if (fechas[0] < hoyEnES()) {
    return NextResponse.json({ error: 'No se pueden cerrar fechas pasadas' }, { status: 400 });
  }

  const motivo =
    typeof cuerpo.motivo === 'string' && cuerpo.motivo.trim()
      ? cuerpo.motivo.trim().slice(0, 120)
      : null;

  try {
    await prisma.$transaction(
      fechas.map((f) =>
        prisma.cierre.upsert({
          where: { fecha_hora_sector: { fecha: fechaISOaDate(f), hora, sector } },
          update: { motivo },
          create: { fecha: fechaISOaDate(f), hora, sector, motivo },
        })
      )
    );

    revalidatePath('/reservar');
    return NextResponse.json({ success: true, dias: fechas.length });
  } catch (error) {
    console.error('Error creando cierres:', error);
    return NextResponse.json({ error: 'Error al guardar el cierre' }, { status: 500 });
  }
}

/**
 * Reabre. Mismo body que POST, pero `hora` y `sector` omitidos significan
 * "cualquiera": con solo { desde } reabre todo ese día.
 */
export async function DELETE(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  const cuerpo = await leerCuerpo(request);
  if (!cuerpo) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });

  const parsed = parsearAlcance(cuerpo);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { fechas, hora, sector } = parsed.alcance;

  try {
    const res = await prisma.cierre.deleteMany({
      where: {
        fecha: { gte: fechaISOaDate(fechas[0]), lte: fechaISOaDate(fechas[fechas.length - 1]) },
        ...(hora !== undefined ? { hora } : {}),
        ...(sector !== undefined ? { sector } : {}),
      },
    });

    revalidatePath('/reservar');
    return NextResponse.json({ success: true, eliminados: res.count });
  } catch (error) {
    console.error('Error reabriendo:', error);
    return NextResponse.json({ error: 'Error al reabrir' }, { status: 500 });
  }
}
