import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ESTADOS_RESERVA } from '@/lib/constants';
import { enviarConfirmacionDeReserva } from '@/lib/reservas-mail';
import { exigirAdminApi } from '@/lib/admin-guard';

/** Vuelve a mandar el mail de confirmación de una reserva y guarda el resultado. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const { id } = await params;
    const reserva = await prisma.reservation.findUnique({ where: { id } });

    if (!reserva) {
      return NextResponse.json({ error: 'La reserva no existe' }, { status: 404 });
    }
    if (reserva.estado !== ESTADOS_RESERVA.CONFIRMADA) {
      return NextResponse.json({ error: 'La reserva está cancelada: no se envía confirmación.' }, { status: 400 });
    }
    if (reserva.email.includes('sin-email.union')) {
      return NextResponse.json({ error: 'Esta reserva se cargó sin email.' }, { status: 400 });
    }

    const { resultado, emailEstado } = await enviarConfirmacionDeReserva(reserva);
    return NextResponse.json({
      ok: resultado.ok,
      emailEstado,
      error: resultado.ok ? undefined : resultado.error,
    });
  } catch (error) {
    console.error('Error reenviando mail:', error);
    return NextResponse.json({ error: 'Error al reenviar el mail' }, { status: 500 });
  }
}
