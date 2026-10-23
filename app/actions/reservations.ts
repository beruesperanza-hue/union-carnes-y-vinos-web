'use server';

import prisma from '@/lib/db';
import { sendReservationCancellation, esEmailValido } from '@/lib/email';
import { enviarConfirmacionDeReserva } from '@/lib/reservas-mail';
import { validarReservaPublica } from '@/lib/reservas-validacion';
import { MENSAJES, ESTADOS_RESERVA, UBICACIONES } from '@/lib/constants';
import { esTurnoPasado, fechaISOaDate } from '@/lib/fechas';
import { cierresDeFecha, diaCerradoCompleto, estadoCierreTurno } from '@/lib/cierres';
import { turnosDeFecha } from '@/lib/turnos';
import { revalidatePath } from 'next/cache';

interface CreateReservationData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  personas: number;
  /** 'YYYY-MM-DD' — se compara siempre en hora de Valencia. */
  fecha: string;
  hora: string;
  ubicacion?: string;
  comentarios?: string;
}

export async function createReservation(entrada: CreateReservationData) {
  try {
    // Esto es un endpoint público: se valida y normaliza todo acá, no se confía en el formulario.
    const validada = validarReservaPublica(entrada);
    if (!validada.ok) {
      return { success: false, error: validada.error };
    }
    const data = {
      ...validada.datos,
      ubicacion: entrada.ubicacion,
    };

    // El turno se compara contra la hora de Valencia, no la del servidor.
    if (esTurnoPasado(data.fecha, data.hora)) {
      return { success: false, error: MENSAJES.TURNO_PASADO };
    }

    const fecha = fechaISOaDate(data.fecha);
    const ubicacion =
      data.ubicacion === UBICACIONES.VEREDA ? UBICACIONES.VEREDA : UBICACIONES.ADENTRO;

    // Turnos semanales + especiales de esa fecha: un día especial reserva igual.
    const { turnos } = await turnosDeFecha(data.fecha);
    const horario = turnos.find((t) => t.hora === data.hora);

    if (!horario) {
      return { success: false, error: MENSAJES.TURNO_CERRADO };
    }
    if (ubicacion === UBICACIONES.VEREDA && horario.cerradoVereda) {
      return { success: false, error: MENSAJES.TURNO_CERRADO };
    }
    if (ubicacion === UBICACIONES.ADENTRO && horario.cerradoManual) {
      return { success: false, error: MENSAJES.TURNO_CERRADO };
    }

    // Cierres puntuales por fecha (se revalidan acá porque el formulario puede
    // haber quedado abierto desde antes de que se cerrara el día).
    const cierres = await cierresDeFecha(data.fecha);
    if (diaCerradoCompleto(cierres)) {
      return { success: false, error: MENSAJES.DIA_CERRADO };
    }
    const cierreTurno = estadoCierreTurno(cierres, data.hora);
    if (ubicacion === UBICACIONES.VEREDA ? cierreTurno.vereda : cierreTurno.adentro) {
      return { success: false, error: MENSAJES.TURNO_CERRADO };
    }

    // Buscar si ya existe una reserva para ese horario y email
    const existingReservation = await prisma.reservation.findFirst({
      where: { email: data.email, fecha, hora: data.hora },
    });

    if (existingReservation) {
      return { success: false, error: MENSAJES.RESERVA_DUPLICADA };
    }

    // Contar personas reservadas para ese horario y sector
    const reservedCount = await prisma.reservation.aggregate({
      where: {
        fecha,
        hora: data.hora,
        ubicacion,
        estado: ESTADOS_RESERVA.CONFIRMADA,
      },
      _sum: { personas: true },
    });

    const capacidadSector =
      ubicacion === UBICACIONES.VEREDA ? horario.capacidadVereda : horario.capacidad;
    const reservedPersonas = reservedCount._sum.personas || 0;
    if (reservedPersonas + data.personas > capacidadSector) {
      return { success: false, error: MENSAJES.HORARIO_LLENO };
    }

    const reservation = await prisma.reservation.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        personas: data.personas,
        fecha,
        hora: data.hora,
        ubicacion,
        comentarios: data.comentarios,
        estado: ESTADOS_RESERVA.CONFIRMADA,
        origen: 'web',
      },
    });

    // El resultado se guarda en la reserva: si falla, el panel lo muestra y se puede reenviar.
    // Mientras tanto la reserva ya está tomada: un problema de mail nunca la cancela.
    const { resultado } = await enviarConfirmacionDeReserva(reservation);

    revalidatePath('/admin');
    revalidatePath('/reservar');

    return {
      success: true,
      message: MENSAJES.RESERVA_EXITOSA,
      reservationId: reservation.id,
      emailEnviado: resultado.ok,
    };
  } catch (error: any) {
    // Doble clic o reintento: la restricción única (fecha+hora+email) ya frenó el duplicado.
    if (error?.code === 'P2002') {
      return { success: false, error: MENSAJES.RESERVA_DUPLICADA };
    }
    console.error('Error creating reservation:', error);
    return { success: false, error: MENSAJES.ERROR_GENERICO };
  }
}

export async function cancelReservation(reservationId: string) {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });

    if (!reservation) {
      return { success: false, error: MENSAJES.RESERVA_NO_ENCONTRADA };
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { estado: ESTADOS_RESERVA.CANCELADA },
    });

    await sendReservationCancellation(reservation.email, reservation.nombre);

    revalidatePath('/admin');
    return { success: true, message: MENSAJES.CANCELA_EXITOSA };
  } catch (error) {
    console.error('Error canceling reservation:', error);
    return { success: false, error: MENSAJES.ERROR_GENERICO };
  }
}

export async function updateReservation(
  reservationId: string,
  data: Partial<CreateReservationData>
) {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });

    if (!reservation) {
      return { success: false, error: MENSAJES.RESERVA_NO_ENCONTRADA };
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.apellido && { apellido: data.apellido }),
        ...(data.email && { email: data.email }),
        ...(data.telefono && { telefono: data.telefono }),
        ...(data.personas && { personas: data.personas }),
        ...(data.ubicacion && { ubicacion: data.ubicacion }),
        ...(data.comentarios !== undefined && { comentarios: data.comentarios }),
      },
    });

    revalidatePath('/admin');
    return { success: true, message: 'Reserva actualizada', reservation: updated };
  } catch (error) {
    console.error('Error updating reservation:', error);
    return { success: false, error: MENSAJES.ERROR_GENERICO };
  }
}

export async function deleteReservation(reservationId: string) {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });

    if (!reservation) {
      return { success: false, error: MENSAJES.RESERVA_NO_ENCONTRADA };
    }

    await prisma.reservation.delete({ where: { id: reservationId } });

    revalidatePath('/admin');
    return { success: true, message: 'Reserva eliminada' };
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return { success: false, error: MENSAJES.ERROR_GENERICO };
  }
}

interface CreateReservationAdminData {
  nombre: string;
  apellido: string;
  /** Opcional: si no se carga, no se manda mail y se guarda un placeholder único. */
  email?: string;
  telefono: string;
  personas: number;
  fecha: string;
  hora: string;
  ubicacion?: string;
  comentarios?: string;
  /** Quién la carga: 'admin' (panel, por defecto) o 'bot'. Estas no disparan aviso en pantallas. */
  origen?: 'admin' | 'bot';
}

/**
 * Alta desde el panel admin: sin las restricciones del formulario público
 * (turno pasado, cerrado o lleno) — para walk-ins, teléfono o forzar un
 * hueco. Igual respeta duplicados exactos (mismo email+fecha+hora) por la
 * constraint de la base.
 */
export async function createReservationAdmin(data: CreateReservationAdminData) {
  try {
    const fecha = fechaISOaDate(data.fecha);
    const ubicacion =
      data.ubicacion === UBICACIONES.VEREDA ? UBICACIONES.VEREDA : UBICACIONES.ADENTRO;
    const tieneEmail = !!data.email && data.email.trim().length > 0;
    if (tieneEmail && !esEmailValido(data.email!.trim())) {
      return { success: false, error: 'El email no parece válido.' };
    }
    const email = tieneEmail
      ? data.email!.trim().toLowerCase()
      : `walkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@sin-email.union`;
    const origen = data.origen === 'bot' ? 'bot' : 'admin';

    const reservation = await prisma.reservation.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email,
        telefono: data.telefono,
        personas: data.personas,
        fecha,
        hora: data.hora,
        ubicacion,
        comentarios: data.comentarios || null,
        estado: ESTADOS_RESERVA.CONFIRMADA,
        origen,
      },
    });

    // También registra el resultado; sin email real queda como 'sin-email'.
    const { resultado } = await enviarConfirmacionDeReserva(reservation);

    revalidatePath('/admin');
    return {
      success: true,
      message: 'Reserva cargada',
      reservationId: reservation.id,
      emailEnviado: resultado.omitido ? null : resultado.ok,
      emailError: !resultado.ok ? resultado.error : undefined,
    };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { success: false, error: MENSAJES.RESERVA_DUPLICADA };
    }
    console.error('Error creating admin reservation:', error);
    return { success: false, error: MENSAJES.ERROR_GENERICO };
  }
}
