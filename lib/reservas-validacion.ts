// Validación del lado del servidor de los datos de una reserva. Las server
// actions son endpoints públicos: lo que valida el formulario del navegador no
// protege nada (alguien puede llamarlas directo con cualquier valor).

import { esEmailValido } from '@/lib/email';
import { esFechaISO } from '@/lib/cierres';

export const MAX_PERSONAS_PUBLICO = 20;

export interface DatosReserva {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  personas: number;
  fecha: string;
  hora: string;
  comentarios: string | null;
}

type Entrada = Partial<Record<keyof DatosReserva, unknown>>;

function texto(valor: unknown, max: number): string | null {
  if (typeof valor !== 'string') return null;
  // Sin caracteres de control (incluye saltos de línea): estos datos terminan en mails y listados.
  const limpio = valor.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return limpio.length >= 1 && limpio.length <= max ? limpio : null;
}

/**
 * Datos de una reserva hecha por el cliente desde la web: todo obligatorio y
 * con límites. Devuelve los valores ya normalizados (email en minúsculas, etc.).
 */
export function validarReservaPublica(
  entrada: Entrada
): { ok: true; datos: DatosReserva } | { ok: false; error: string } {
  const nombre = texto(entrada.nombre, 60);
  if (!nombre) return { ok: false, error: 'Revisá el nombre (hasta 60 caracteres).' };

  const apellido = texto(entrada.apellido, 60);
  if (!apellido) return { ok: false, error: 'Revisá el apellido (hasta 60 caracteres).' };

  const email = typeof entrada.email === 'string' ? entrada.email.trim().toLowerCase() : '';
  if (!esEmailValido(email)) {
    return { ok: false, error: 'El email no parece válido. Revisalo para que te llegue la confirmación.' };
  }

  const telefono = texto(entrada.telefono, 25);
  if (!telefono || !/^[0-9+()\-.\s]{6,25}$/.test(telefono)) {
    return { ok: false, error: 'Revisá el teléfono (solo números, con o sin +34).' };
  }

  const personas = entrada.personas;
  if (!Number.isInteger(personas) || (personas as number) < 1 || (personas as number) > MAX_PERSONAS_PUBLICO) {
    return {
      ok: false,
      error: `Para grupos de más de ${MAX_PERSONAS_PUBLICO} personas escribinos por WhatsApp.`,
    };
  }

  if (!esFechaISO(entrada.fecha)) return { ok: false, error: 'Elegí una fecha válida.' };
  if (typeof entrada.hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(entrada.hora)) {
    return { ok: false, error: 'Elegí un horario válido.' };
  }

  let comentarios: string | null = null;
  if (typeof entrada.comentarios === 'string' && entrada.comentarios.trim()) {
    comentarios = texto(entrada.comentarios, 300);
    if (!comentarios) return { ok: false, error: 'El comentario es demasiado largo (hasta 300 caracteres).' };
  }

  return {
    ok: true,
    datos: {
      nombre,
      apellido,
      email,
      telefono,
      personas: personas as number,
      fecha: entrada.fecha as string,
      hora: entrada.hora,
      comentarios,
    },
  };
}
