// Envío del mail de confirmación de UNA reserva y registro del resultado en la
// propia reserva (emailEstado). Lo usan el alta pública, el alta del panel/bot
// y el botón "Reenviar" del admin, para que el estado siempre quede guardado.

import prisma from '@/lib/db';
import { sendReservationConfirmation, sendNewReservationAlert, type ResultadoMail } from '@/lib/email';
import { dateAFechaISO, formatearFechaLarga } from '@/lib/fechas';

export type EmailEstado = 'enviado' | 'fallido' | 'sin-email';

interface ReservaParaMail {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  personas: number;
  fecha: Date;
  hora: string;
  ubicacion: string;
}

export async function enviarConfirmacionDeReserva(
  r: ReservaParaMail
): Promise<{ resultado: ResultadoMail; emailEstado: EmailEstado }> {
  const resultado = await sendReservationConfirmation(
    r.email,
    r.nombre,
    formatearFechaLarga(dateAFechaISO(r.fecha)),
    r.hora,
    r.personas,
    r.telefono,
    r.ubicacion
  );

  const emailEstado: EmailEstado = resultado.omitido ? 'sin-email' : resultado.ok ? 'enviado' : 'fallido';

  try {
    await prisma.reservation.update({
      where: { id: r.id },
      data: {
        emailEstado,
        emailError: resultado.ok ? null : (resultado.error ?? 'Error desconocido').slice(0, 200),
      },
    });
  } catch (error) {
    // La reserva ya existe y el mail ya salió (o falló): no se rompe nada por no poder anotarlo.
    console.error('No se pudo registrar el estado del mail de la reserva', r.id, error);
  }

  return { resultado, emailEstado };
}

interface ReservaParaAviso extends ReservaParaMail {
  apellido: string;
  comentarios: string | null;
  origen: string;
}

/**
 * Avisa al local (mail "ENTRÓ NUEVA RESERVA"). Nunca lanza: si el aviso falla,
 * la reserva y la confirmación al cliente no se ven afectadas.
 */
export async function avisarReservaNueva(r: ReservaParaAviso): Promise<void> {
  try {
    const res = await sendNewReservationAlert({
      ...r,
      fecha: formatearFechaLarga(dateAFechaISO(r.fecha)),
    });
    if (!res.ok) console.error('No se pudo enviar el aviso de reserva nueva:', res.error);
  } catch (error) {
    console.error('No se pudo enviar el aviso de reserva nueva:', error);
  }
}
