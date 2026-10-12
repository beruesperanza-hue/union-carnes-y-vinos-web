// Fuente única de "qué turnos tiene una fecha". La disponibilidad pública, la
// validación al reservar y el calendario del admin pasan todos por acá, así que
// un día especial se comporta igual en todos lados.
//
// Turnos de una fecha = turnos semanales activos de ese día de la semana
//                       + turnos especiales de esa fecha (TurnoEspecial).
//   · un especial a la misma hora que uno semanal lo reemplaza (ese día);
//   · si la fecha está en modo `reemplaza`, los semanales se ignoran.
// Los cierres por fecha (lib/cierres.ts) se aplican después, encima de esto.

import prisma from '@/lib/db';
import { dateAFechaISO, diaSemanaDe, fechaISOaDate, sumarDias } from '@/lib/fechas';
import { esFechaISO } from '@/lib/cierres';

export interface TurnoEfectivo {
  hora: string;
  capacidad: number;
  capacidadVereda: number;
  /** Cierre semanal de Configuración. Un turno especial nunca lo hereda. */
  cerradoManual: boolean;
  cerradoVereda: boolean;
  especial: boolean;
}

export interface TurnosDeFecha {
  turnos: TurnoEfectivo[];
  /** La fecha usa solo sus turnos especiales. */
  reemplaza: boolean;
}

interface Semanal {
  dia: string;
  hora: string;
  capacidad: number;
  capacidadVereda: number;
  cerradoManual: boolean;
  cerradoVereda: boolean;
}

interface Especial {
  fecha: string;
  hora: string;
  capacidad: number;
  capacidadVereda: number;
  reemplaza: boolean;
}

export const MAX_DIAS_ESPECIALES = 62;
export const MAX_TURNOS_ESPECIALES = 8;
export const MAX_CAPACIDAD = 500;

/** Función pura: combina semanales y especiales para una fecha. */
export function combinarTurnos(
  fechaISO: string,
  semanales: Semanal[],
  especiales: Especial[]
): TurnosDeFecha {
  const delDia = especiales.filter((e) => e.fecha === fechaISO);
  const reemplaza = delDia.some((e) => e.reemplaza);
  const porHora = new Map<string, TurnoEfectivo>();

  if (!reemplaza) {
    const dia = diaSemanaDe(fechaISO);
    for (const s of semanales) {
      if (s.dia !== dia) continue;
      porHora.set(s.hora, {
        hora: s.hora,
        capacidad: s.capacidad,
        capacidadVereda: s.capacidadVereda,
        cerradoManual: s.cerradoManual,
        cerradoVereda: s.cerradoVereda,
        especial: false,
      });
    }
  }

  for (const e of delDia) {
    porHora.set(e.hora, {
      hora: e.hora,
      capacidad: e.capacidad,
      capacidadVereda: e.capacidadVereda,
      cerradoManual: false,
      cerradoVereda: false,
      especial: true,
    });
  }

  const turnos = [...porHora.values()].sort((a, b) => a.hora.localeCompare(b.hora));
  return { turnos, reemplaza };
}

/**
 * Turnos de cada fecha de un rango (inclusive). Los semanales se leen una sola
 * vez. Si la tabla de especiales no está disponible (el `db push` del arranque
 * todavía no corrió) se registra y se sigue solo con los semanales: el
 * formulario público no puede caerse por esto.
 */
export async function turnosDeRango(
  desde: string,
  hasta: string
): Promise<Map<string, TurnosDeFecha>> {
  const semanales = await prisma.schedule.findMany({
    where: { activo: true },
    select: {
      dia: true,
      hora: true,
      capacidad: true,
      capacidadVereda: true,
      cerradoManual: true,
      cerradoVereda: true,
    },
  });

  let especiales: Especial[] = [];
  try {
    const filas = await prisma.turnoEspecial.findMany({
      where: { fecha: { gte: fechaISOaDate(desde), lte: fechaISOaDate(hasta) } },
    });
    especiales = filas.map((f) => ({
      fecha: dateAFechaISO(f.fecha),
      hora: f.hora,
      capacidad: f.capacidad,
      capacidadVereda: f.capacidadVereda,
      reemplaza: f.reemplaza,
    }));
  } catch (error) {
    console.error('No se pudieron leer los turnos especiales:', error);
  }

  const resultado = new Map<string, TurnosDeFecha>();
  for (let f = desde; f <= hasta; f = sumarDias(f, 1)) {
    resultado.set(f, combinarTurnos(f, semanales, especiales));
  }
  return resultado;
}

export async function turnosDeFecha(fechaISO: string): Promise<TurnosDeFecha> {
  const mapa = await turnosDeRango(fechaISO, fechaISO);
  return mapa.get(fechaISO) ?? { turnos: [], reemplaza: false };
}

// ───────── Validación del alta de turnos especiales ─────────

export interface TurnoEspecialInput {
  hora: string;
  capacidad: number;
  capacidadVereda: number;
}

function esHoraTurno(valor: unknown): valor is string {
  return typeof valor === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

function esCapacidad(valor: unknown): valor is number {
  return Number.isInteger(valor) && (valor as number) >= 0 && (valor as number) <= MAX_CAPACIDAD;
}

export function parsearTurnosEspeciales(
  raw: unknown
): { ok: true; turnos: TurnoEspecialInput[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: 'Cargá al menos un horario' };
  }
  if (raw.length > MAX_TURNOS_ESPECIALES) {
    return { ok: false, error: `Máximo ${MAX_TURNOS_ESPECIALES} horarios por operación` };
  }

  const turnos: TurnoEspecialInput[] = [];
  const vistos = new Set<string>();
  for (const t of raw as Array<Record<string, unknown>>) {
    if (!t || typeof t !== 'object' || !esHoraTurno(t.hora)) {
      return { ok: false, error: 'Horario inválido (usar HH:mm)' };
    }
    if (vistos.has(t.hora)) return { ok: false, error: `Horario repetido: ${t.hora}` };
    vistos.add(t.hora);

    const capacidad = t.capacidad === undefined ? 30 : t.capacidad;
    const capacidadVereda = t.capacidadVereda === undefined ? 0 : t.capacidadVereda;
    if (!esCapacidad(capacidad) || !esCapacidad(capacidadVereda)) {
      return { ok: false, error: `Capacidad inválida (entero entre 0 y ${MAX_CAPACIDAD})` };
    }
    if (capacidad + capacidadVereda === 0) {
      return { ok: false, error: `El horario ${t.hora} no tiene capacidad` };
    }
    turnos.push({ hora: t.hora, capacidad, capacidadVereda });
  }
  return { ok: true, turnos };
}

export { esFechaISO };
