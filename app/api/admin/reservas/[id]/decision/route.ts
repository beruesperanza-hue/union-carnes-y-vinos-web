import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA } from '@/lib/constants';
import { dateAFechaISO, formatearFechaLarga } from '@/lib/fechas';
import { exigirAdminApi } from '@/lib/admin-guard';
import { sendReservationRejected } from '@/lib/email';
import { enviarConfirmacionDeReserva } from '@/lib/reservas-mail';

/**
 * Decisión del local sobre una reserva pendiente (grupo grande).
 *  - confirmar: pasa a confirmada y el cliente recibe el mail de confirmación.
 *  - rechazar:  pasa a cancelada (libera el lugar) y el cliente recibe el aviso.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const { id } = await params;
    const { accion } = await request.json().catch(() => ({ accion: null }));
    if (accion !== 'confirmar' && accion !== 'rechazar') {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
    }

    const reserva = await prisma.reservation.findUnique({ where: { id } });
    if (!reserva) return NextResponse.json({ error: 'La reserva no existe.' }, { status: 404 });
    if (reserva.estado !== ESTADOS_RESERVA.PENDIENTE) {
      return NextResponse.json(
        { error: 'Esta reserva ya no está pendiente (otra pantalla la resolvió).' },
        { status: 409 }
      );
    }

    // updateMany con el estado en el filtro: si dos pantallas deciden a la vez, solo una gana.
    const nuevoEstado = accion === 'confirmar' ? ESTADOS_RESERVA.CONFIRMADA : ESTADOS_RESERVA.CANCELADA;
    const { count } = await prisma.reservation.updateMany({
      where: { id: reserva.id, estado: ESTADOS_RESERVA.PENDIENTE },
      data: { estado: nuevoEstado },
    });
    if (count === 0) {
      return NextResponse.json({ error: 'Esta reserva ya fue resuelta por otra pantalla.' }, { status: 409 });
    }

    revalidatePath('/admin');
    revalidatePath('/reservar');

    if (accion === 'confirmar') {
      const { resultado } = await enviarConfirmacionDeReserva(reserva);
      return NextResponse.json({
        ok: true,
        estado: nuevoEstado,
        emailEnviado: resultado.omitido ? null : resultado.ok,
        emailError: resultado.ok ? undefined : resultado.error,
      });
    }

    const resultado = await sendReservationRejected(
      reserva.email,
      reserva.nombre,
      formatearFechaLarga(dateAFechaISO(reserva.fecha)),
      reserva.hora
    );
    return NextResponse.json({
      ok: true,
      estado: nuevoEstado,
      emailEnviado: resultado.omitido ? null : resultado.ok,
      emailError: resultado.ok ? undefined : resultado.error,
    });
  } catch (error) {
    console.error('Error resolviendo reserva pendiente:', error);
    return NextResponse.json({ error: 'No se pudo resolver la reserva.' }, { status: 500 });
  }
}
