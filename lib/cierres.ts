// Cierres puntuales por fecha. Un solo módulo para que la disponibilidad
// pública, la validación al reservar y el panel admin usen exactamente la
// misma regla (ver modelo Cierre en prisma/schema.prisma).

import prisma from '@/lib/db';
import { dateAFechaISO, fechaISOaDate, sumarDias } from '@/lib/fechas';

export const SECTORES_CIERRE = ['todos', 'adentro', 'vereda'] as const;
export type SectorCierre = (typeof SECTORES_CIERRE)[number];

/** Tope de días por operación de rango (vacaciones largas entran de sobra). */
export const MAX_DIAS_RANGO = 92;

export interface CierreLite {
  fecha: string; // 'YYYY-MM-DD'
  hora: string; // '' = todo el día
  sector: string;
  motivo: string | null;
}

export interface EstadoCierre {
  adentro: boolean;
  vereda: boolean;
  motivo: string | null;
}

export function esFechaISO(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  // Rechaza 2026-02-31 y similares: tiene que sobrevivir el ida y vuelta.
  return dateAFechaISO(fechaISOaDate(valor)) === valor;
}

/** '' (todo el día) o 'HH:mm'. */
export function esHoraCierre(valor: unknown): valor is string {
  return typeof valor === 'string' && (valor === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(valor));
}

export function esSectorCierre(valor: unknown): valor is SectorCierre {
  return typeof valor === 'string' && (SECTORES_CIERRE as readonly string[]).includes(valor);
}

/**
 * Todas las fechas entre `desde` y `hasta` (inclusive).
 * Devuelve null si el rango es inválido o supera MAX_DIAS_RANGO.
 */
export function expandirRango(desde: string, hasta: string): string[] | null {
  if (!esFechaISO(desde) || !esFechaISO(hasta) || hasta < desde) return null;
  const fechas: string[] = [];
  let actual = desde;
  while (actual <= hasta) {
    fechas.push(actual);
    if (fechas.length > MAX_DIAS_RANGO) return null;
    actual = sumarDias(actual, 1);
  }
  return fechas;
}

export interface AlcanceCierre {
  fechas: string[];
  /** undefined = "cualquiera" (útil para reabrir); '' = todo el día. */
  hora?: string;
  /** undefined = "cualquiera" (útil para reabrir). */
  sector?: SectorCierre;
}

/**
 * Valida y normaliza el cuerpo de las operaciones de cierre.
 * `desde` es obligatorio; `hasta` por defecto es el mismo día.
 */
export function parsearAlcance(raw: {
  desde?: unknown;
  hasta?: unknown;
  hora?: unknown;
  sector?: unknown;
}): { ok: true; alcance: AlcanceCierre } | { ok: false; error: string } {
  if (!esFechaISO(raw.desde)) return { ok: false, error: 'Fecha "desde" inválida' };
  const hasta = raw.hasta === undefined || raw.hasta === null ? raw.desde : raw.hasta;
  if (!esFechaISO(hasta)) return { ok: false, error: 'Fecha "hasta" inválida' };

  const fechas = expandirRango(raw.desde, hasta);
  if (!fechas) {
    return { ok: false, error: `Rango inválido (máximo ${MAX_DIAS_RANGO} días)` };
  }

  let hora: string | undefined;
  if (raw.hora !== undefined && raw.hora !== null) {
    if (!esHoraCierre(raw.hora)) return { ok: false, error: 'Horario inválido' };
    hora = raw.hora;
  }

  let sector: SectorCierre | undefined;
  if (raw.sector !== undefined && raw.sector !== null) {
    if (!esSectorCierre(raw.sector)) return { ok: false, error: 'Sector inválido' };
    sector = raw.sector;
  }

  return { ok: true, alcance: { fechas, hora, sector } };
}

/**
 * Estado de un turno concreto dado los cierres de ESA fecha.
 * Un cierre aplica si es de todo el día ('') o de ese mismo horario.
 */
export function estadoCierreTurno(cierresDelDia: CierreLite[], hora: string): EstadoCierre {
  const estado: EstadoCierre = { adentro: false, vereda: false, motivo: null };
  for (const c of cierresDelDia) {
    if (c.hora !== '' && c.hora !== hora) continue;
    if (c.sector === 'todos' || c.sector === 'adentro') estado.adentro = true;
    if (c.sector === 'todos' || c.sector === 'vereda') estado.vereda = true;
    if (!estado.motivo && c.motivo) estado.motivo = c.motivo;
  }
  return estado;
}

/** ¿Hay un cierre de todo el día para todos los sectores? */
export function diaCerradoCompleto(cierresDelDia: CierreLite[]): boolean {
  return cierresDelDia.some((c) => c.hora === '' && c.sector === 'todos');
}

function aLite(c: { fecha: Date; hora: string; sector: string; motivo: string | null }): CierreLite {
  return { fecha: dateAFechaISO(c.fecha), hora: c.hora, sector: c.sector, motivo: c.motivo };
}

/**
 * Cierres de un rango de fechas. Si la consulta falla (p. ej. la tabla todavía
 * no existe porque el `db push` del arranque no corrió) devuelve [] y lo deja en
 * el log: es preferible que el formulario público siga funcionando a que se
 * caiga por un chequeo accesorio. Con la tabla ausente no hay cierres, así que
 * [] es además el resultado correcto.
 */
export async function cierresEnRango(desde: string, hasta: string): Promise<CierreLite[]> {
  try {
    const filas = await prisma.cierre.findMany({
      where: { fecha: { gte: fechaISOaDate(desde), lte: fechaISOaDate(hasta) } },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    return filas.map(aLite);
  } catch (error) {
    console.error('No se pudieron leer los cierres:', error);
    return [];
  }
}

export async function cierresDeFecha(fechaISO: string): Promise<CierreLite[]> {
  return cierresEnRango(fechaISO, fechaISO);
}
