'use server';

import prisma from '@/lib/db';
import { sendReservationConfirmation, sendReservationCancellation } from '@/lib/email';
import { MENSAJES, ESTADOS_RESERVA, UBICACIONES } from '@/lib/constants';
import { esTurnoPasado, fechaISOaDate, formatearFechaLarga } from '@/lib/fechas';
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

export async function createReservation(data: CreateReservationData) {
  try {
    // El turno se compara contra la hora de Valencia, no la del servidor.
    if (esTurnoPasado(data.fecha, data.hora)) {
      return { success: false, error: MENSAJES.TURNO_PASADO };
    }

    const fecha = fechaISOaDate(data.fecha);
    const ubicacion =
      data.ubicacion === UBICACIONES.VEREDA ? UBICACIONES.VEREDA : UBICACIONES.ADENTRO;

    const dayOfWeek = fecha.getUTCDay();
    const diaNombre = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][
      dayOfWeek
    ];

    const horario = await prisma.schedule.findUnique({
      where: { dia_hora: { dia: diaNombre, hora: data.hora } },
    });

    if (!horario || !horario.activo) {
      return { success: false, error: MENSAJES.TURNO_CERRADO };
    }
    if (ubicacion === UBICACIONES.VEREDA && horario.cerradoVereda) {
      return { success: false, error: MENSAJES.TURNO_CERRADO };
    }
    if (ubicacion === UBICACIONES.ADENTRO && horario.cerradoManual) {
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
        comentarios: data.comentarios || null,
        estado: ESTADOS_RESERVA.CONFIRMADA,
      },
    });

    await sendReservationConfirmation(
      data.email,
      data.nombre,
      formatearFechaLarga(data.fecha),
      data.hora,
      data.personas,
      data.telefono,
      ubicacion
    );

    revalidatePath('/admin');
    revalidatePath('/reservar');

    return {
      success: true,
      message: MENSAJES.RESERVA_EXITOSA,
      reservationId: reservation.id,
    };
  } catch (error) {
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
    const email = tieneEmail
      ? data.email!.trim()
      : `walkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@sin-email.union`;

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
      },
    });

    if (tieneEmail) {
      await sendReservationConfirmation(
        email,
        data.nombre,
        formatearFechaLarga(data.fecha),
        data.hora,
        data.personas,
        data.telefono,
        ubicacion
      );
    }

    revalidatePath('/admin');
    return { success: true, message: 'Reserva cargada', reservationId: reservation.id };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { success: false, error: MENSAJES.RESERVA_DUPLICADA };
    }
    console.error('Error creating admin reservation:', error);
    return { success: false, error: MENSAJES.ERROR_GENERICO };
  }
}
