import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA } from '@/lib/constants';
import { dateAFechaISO, fechaISOaDate, hoyEnES } from '@/lib/fechas';
import { exigirAdminApi } from '@/lib/admin-guard';

/** Hasta dónde se mira hacia atrás cuando una pantalla estuvo apagada. */
const VENTANA_MAXIMA_MS = 48 * 60 * 60 * 1000;
/**
 * Se re-lee un poco antes del cursor para no perder una reserva cuyo registro
 * se confirmó tarde. La pantalla descarta las repetidas por id, así que
 * reaparecer en dos consultas no genera un segundo aviso.
 */
const SOLAPE_MS = 90_000;
/**
 * Una reserva web recién creada todavía no tiene resultado de mail (el envío
 * tarda un par de segundos). Se espera ese tiempo antes de anunciarla para que
 * el aviso diga si el mail salió o no, en lugar de mostrar un estado a medias.
 */
const ESPERA_MAIL_MS = 30_000;

/**
 * Reservas hechas desde la web desde `desde` (ISO). Las pantallas del local lo
 * consultan cada pocos segundos. Sin `desde` solo devuelve la hora del servidor
 * para arrancar el cursor (no avisa de reservas viejas).
 *
 * `sinMail` = cuántas reservas vigentes (de hoy en adelante, de cualquier origen)
 * no pudieron recibir su confirmación por mail. Es el mismo criterio que el
 * filtro "Sin mail" de la lista de reservas, para que el aviso y la lista
 * coincidan y el aviso no se apague hasta que alguien las resuelva.
 */
export async function GET(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const ahora = new Date();
    const desdeParam = new URL(request.url).searchParams.get('desde');

    let desde: Date | null = null;
    if (desdeParam) {
      const parsed = new Date(desdeParam);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Parámetro "desde" inválido' }, { status: 400 });
      }
      desde = new Date(
        Math.max(parsed.getTime() - SOLAPE_MS, ahora.getTime() - VENTANA_MAXIMA_MS)
      );
    }

    const [filas, sinMail] = await Promise.all([
      desde
        ? prisma.reservation.findMany({
            where: {
              origen: 'web',
              estado: ESTADOS_RESERVA.CONFIRMADA,
              createdAt: { gt: desde },
              OR: [
                { emailEstado: { not: null } },
                { createdAt: { lt: new Date(ahora.getTime() - ESPERA_MAIL_MS) } },
              ],
            },
            // Si se acumularon más de 20 (pantalla apagada), importan las más recientes.
            orderBy: { createdAt: 'desc' },
            take: 20,
          })
        : Promise.resolve([]),
      prisma.reservation.count({
        where: {
          estado: ESTADOS_RESERVA.CONFIRMADA,
          emailEstado: 'fallido',
          fecha: { gte: fechaISOaDate(hoyEnES()) },
        },
      }),
    ]);

    return NextResponse.json({
      ahora: ahora.toISOString(),
      sinMail,
      reservas: [...filas].reverse().map((r) => ({
        id: r.id,
        nombre: r.nombre,
        apellido: r.apellido,
        telefono: r.telefono,
        personas: r.personas,
        fecha: dateAFechaISO(r.fecha),
        hora: r.hora,
        ubicacion: r.ubicacion,
        comentarios: r.comentarios,
        emailEstado: r.emailEstado,
        emailError: r.emailError,
        creadaEn: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error en reservas nuevas:', error);
    return NextResponse.json({ error: 'Error al consultar reservas nuevas' }, { status: 500 });
  }
}
