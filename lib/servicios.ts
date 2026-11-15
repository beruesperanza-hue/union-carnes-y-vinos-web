// Un día puede tener dos servicios: mediodía (almuerzo) y noche (cena). Se separan por la
// hora del turno: antes de las 17:00 es mediodía. Sin dependencias de servidor, para poder
// usarlo también en el panel del navegador.

export const SERVICIOS = ['almuerzo', 'cena'] as const;
export type Servicio = (typeof SERVICIOS)[number];
export const CORTE_SERVICIO = '17:00';

export function servicioDeHora(hora: string): Servicio {
  return hora < CORTE_SERVICIO ? 'almuerzo' : 'cena';
}

export function esServicio(valor: unknown): valor is Servicio {
  return typeof valor === 'string' && (SERVICIOS as readonly string[]).includes(valor);
}

export const NOMBRE_SERVICIO: Record<Servicio, string> = {
  almuerzo: 'Mediodía',
  cena: 'Noche',
};
