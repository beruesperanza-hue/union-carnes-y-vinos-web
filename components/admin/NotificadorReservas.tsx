'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatearFechaLarga, hoyEnES } from '@/lib/fechas';

/**
 * Aviso en pantalla de reservas nuevas, montado una sola vez para todo el
 * panel (app/admin/layout.tsx). Cada pantalla del local lo corre por su cuenta.
 *
 *  - Consulta /api/admin/reservas/nuevas cada pocos segundos.
 *  - El aviso queda hasta que alguien toca "Entendido" y sobrevive a recargas.
 *  - Suena un tono (el navegador exige un toque previo en la pantalla).
 *  - Si el mail de confirmación no salió, lo dice y deja reenviarlo.
 *  - Avisa a las páginas abiertas (evento `union:reservas-cambiaron`) para que se refresquen.
 */

export const EVENTO_RESERVAS_CAMBIARON = 'union:reservas-cambiaron';

interface Reserva {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  personas: number;
  fecha: string;
  hora: string;
  ubicacion: string;
  comentarios: string | null;
  emailEstado: string | null;
  emailError: string | null;
  creadaEn: string;
}

interface Aviso extends Reserva {
  reenviando?: boolean;
  errorReenvio?: string | null;
}

const INTERVALO_MS = 8_000;
const INTERVALO_ERROR_MS = 30_000;
const MAX_VISIBLES = 3;
const MAX_PENDIENTES = 30;

const K_CURSOR = 'union.notif.cursor';
const K_PENDIENTES = 'union.notif.pendientes';
const K_SONIDO = 'union.notif.sonido';

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo === null ? porDefecto : (JSON.parse(crudo) as T);
  } catch {
    return porDefecto;
  }
}

function guardar(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* modo privado o sin espacio: el aviso funciona igual, solo no sobrevive a una recarga */
  }
}

function haceCuanto(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `hace ${h} h` : 'hace más de un día';
}

export default function NotificadorReservas() {
  const pathname = usePathname();
  // En el login (/admin) no hay sesión: consultar daría 401.
  const activo = pathname !== '/admin';

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sinMail, setSinMail] = useState(0);
  const [sonido, setSonido] = useState(true);
  const [audioListo, setAudioListo] = useState(false);
  const [verTodos, setVerTodos] = useState(false);
  const [, setReloj] = useState(0);

  const audio = useRef<AudioContext | null>(null);
  const sonidoRef = useRef(true);
  const vistos = useRef<Set<string>>(new Set());
  const tituloBase = useRef<string | null>(null);

  // ───────── sonido ─────────
  const desbloquearAudio = useCallback(async () => {
    try {
      if (!audio.current) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        audio.current = new AC();
      }
      if (audio.current.state === 'suspended') await audio.current.resume();
      setAudioListo(audio.current.state === 'running');
    } catch {
      setAudioListo(false);
    }
  }, []);

  const sonar = useCallback(() => {
    const ctx = audio.current;
    if (!sonidoRef.current || !ctx || ctx.state !== 'running') return;
    const t0 = ctx.currentTime;
    [
      { f: 880, ini: 0, dur: 0.16 },
      { f: 1318.5, ini: 0.18, dur: 0.32 },
    ].forEach(({ f, ini, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t0 + ini);
      gain.gain.exponentialRampToValueAtTime(0.35, t0 + ini + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + ini + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + ini);
      osc.stop(t0 + ini + dur + 0.05);
    });
  }, []);

  useEffect(() => {
    if (!activo) return;
    const preferido = leer<boolean>(K_SONIDO, true);
    sonidoRef.current = preferido;
    setSonido(preferido);
    // El navegador solo habilita el audio tras un gesto del usuario: el primer toque lo activa.
    const alTocar = () => desbloquearAudio();
    window.addEventListener('pointerdown', alTocar);
    window.addEventListener('keydown', alTocar);
    return () => {
      window.removeEventListener('pointerdown', alTocar);
      window.removeEventListener('keydown', alTocar);
    };
  }, [activo, desbloquearAudio]);

  const alternarSonido = () => {
    const nuevo = !sonidoRef.current;
    sonidoRef.current = nuevo;
    setSonido(nuevo);
    guardar(K_SONIDO, nuevo);
    if (nuevo) {
      desbloquearAudio().then(() => sonar());
    }
  };

  // ───────── consulta periódica ─────────
  useEffect(() => {
    if (!activo) return;

    // Avisos sin atender de antes de recargar (los de más de un día ya no importan).
    const haceUnDia = Date.now() - 24 * 60 * 60 * 1000;
    const guardados = leer<Aviso[]>(K_PENDIENTES, []).filter(
      (a) => new Date(a.creadaEn).getTime() > haceUnDia
    );
    guardados.forEach((a) => vistos.current.add(a.id));
    setAvisos(guardados);

    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let detenido = false;

    const consultar = async () => {
      let proxima = INTERVALO_MS;
      try {
        const cursor = leer<string | null>(K_CURSOR, null);
        const url = cursor
          ? `/api/admin/reservas/nuevas?desde=${encodeURIComponent(cursor)}`
          : '/api/admin/reservas/nuevas';
        const res = await fetch(url, { cache: 'no-store' });

        if (res.status === 401) {
          // Sesión vencida: la propia página redirige al login; acá solo se deja de consultar.
          detenido = true;
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: { ahora: string; sinMail: number; reservas: Reserva[] } = await res.json();
        if (cancelado) return;

        setSinMail(data.sinMail);
        const nuevas = data.reservas.filter((r) => !vistos.current.has(r.id));
        if (nuevas.length > 0) {
          nuevas.forEach((r) => vistos.current.add(r.id));
          setAvisos((prev) => {
            const siguiente = [...prev, ...nuevas].slice(-MAX_PENDIENTES);
            guardar(K_PENDIENTES, siguiente);
            return siguiente;
          });
          sonar();
          window.dispatchEvent(new Event(EVENTO_RESERVAS_CAMBIARON));
        }
        guardar(K_CURSOR, data.ahora);
      } catch (error) {
        console.error('No se pudo consultar reservas nuevas:', error);
        proxima = INTERVALO_ERROR_MS;
      } finally {
        if (!cancelado && !detenido) timer = setTimeout(consultar, proxima);
      }
    };

    consultar();

    // Al volver a la pestaña se consulta enseguida (los navegadores frenan los timers de fondo).
    const alVolver = () => {
      if (document.visibilityState === 'visible' && !detenido) {
        if (timer) clearTimeout(timer);
        consultar();
      }
    };
    document.addEventListener('visibilitychange', alVolver);

    return () => {
      cancelado = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [activo, sonar]);

  // "hace 3 min" se refresca solo
  useEffect(() => {
    if (!activo || avisos.length === 0) return;
    const t = setInterval(() => setReloj((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [activo, avisos.length]);

  // ───────── título de la pestaña ─────────
  useEffect(() => {
    if (!activo) return;
    if (tituloBase.current === null) tituloBase.current = document.title;
    if (avisos.length === 0) {
      if (tituloBase.current !== null) document.title = tituloBase.current;
      return;
    }
    const aviso = `(${avisos.length}) 🔔 Nueva reserva`;
    let alterna = false;
    document.title = aviso;
    const t = setInterval(() => {
      alterna = !alterna;
      document.title = alterna ? (tituloBase.current ?? aviso) : aviso;
    }, 1500);
    return () => {
      clearInterval(t);
      if (tituloBase.current !== null) document.title = tituloBase.current;
    };
  }, [activo, avisos.length, pathname]);

  // ───────── acciones ─────────
  const descartar = (id: string) => {
    setAvisos((prev) => {
      const siguiente = prev.filter((a) => a.id !== id);
      guardar(K_PENDIENTES, siguiente);
      return siguiente;
    });
  };

  const descartarTodos = () => {
    setAvisos([]);
    guardar(K_PENDIENTES, []);
    setVerTodos(false);
  };

  const reenviar = async (id: string) => {
    setAvisos((prev) => prev.map((a) => (a.id === id ? { ...a, reenviando: true, errorReenvio: null } : a)));
    try {
      const res = await fetch(`/api/admin/reservas/${id}/reenviar-mail`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && data.ok === true;
      setAvisos((prev) => {
        const siguiente = prev.map((a) =>
          a.id === id
            ? {
                ...a,
                reenviando: false,
                emailEstado: ok ? 'enviado' : 'fallido',
                emailError: ok ? null : (data.error as string) || a.emailError,
                errorReenvio: ok ? null : (data.error as string) || 'No se pudo reenviar.',
              }
            : a
        );
        guardar(K_PENDIENTES, siguiente);
        return siguiente;
      });
      if (ok) setSinMail((n) => Math.max(0, n - 1));
    } catch {
      setAvisos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, reenviando: false, errorReenvio: 'Sin conexión.' } : a))
      );
    }
  };

  if (!activo) return null;

  const hoy = hoyEnES();
  // Los más recientes primero; el resto queda detrás de "ver todas".
  const ordenados = [...avisos].reverse();
  const visibles = verTodos ? ordenados : ordenados.slice(0, MAX_VISIBLES);
  const ocultos = ordenados.length - visibles.length;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[70] flex flex-col items-stretch gap-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[390px]"
        aria-live="polite"
      >
        {sinMail > 0 && (
          <Link
            href="/admin/reservas?filtro=sinmail"
            className="pointer-events-auto rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 font-body text-sm text-amber-900 shadow-lg hover:bg-amber-100"
          >
            <strong>⚠ {sinMail}</strong>{' '}
            {sinMail === 1 ? 'reserva no recibió' : 'reservas no recibieron'} el mail de confirmación.{' '}
            <span className="underline">Resolver →</span>
          </Link>
        )}

        {ocultos > 0 && (
          <button
            onClick={() => setVerTodos(true)}
            className="pointer-events-auto self-end rounded-full bg-brasa-900 px-4 py-2 font-body text-xs font-semibold text-brasa-100 shadow-lg"
          >
            + {ocultos} {ocultos === 1 ? 'reserva' : 'reservas'} más sin ver
          </button>
        )}

        {visibles.map((a) => {
          const esHoy = a.fecha === hoy;
          const fechaTexto = esHoy ? 'Hoy' : formatearFechaLarga(a.fecha);
          const mailFallo = a.emailEstado === 'fallido';
          return (
            <article
              key={a.id}
              className="pointer-events-auto overflow-hidden rounded-xl border border-brasa-200 border-l-4 border-l-ember-500 bg-white shadow-2xl"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ember-600">
                    🔔 Nueva reserva · {haceCuanto(a.creadaEn)}
                  </p>
                  <button
                    onClick={() => descartar(a.id)}
                    className="-mr-1 -mt-1 h-7 w-7 shrink-0 rounded-full text-brasa-900/50 hover:bg-brasa-100"
                    aria-label="Descartar aviso"
                  >
                    ×
                  </button>
                </div>

                <p className="mt-1 font-display text-2xl leading-tight text-brasa-900">
                  {a.nombre} {a.apellido}
                  <span className="ml-2 font-body text-base text-brasa-900/60">
                    · {a.personas} {a.personas === 1 ? 'persona' : 'personas'}
                  </span>
                </p>
                <p className="mt-1 font-body text-sm text-brasa-900/80 first-letter:uppercase">
                  {fechaTexto} · {a.hora} · {a.ubicacion === 'vereda' ? '☀️ Terraza' : '🏠 Adentro'}
                </p>
                {a.telefono && <p className="font-body text-sm text-brasa-900/60">📱 {a.telefono}</p>}
                {a.comentarios && <p className="mt-1 font-body text-sm text-brasa-900/70">💬 {a.comentarios}</p>}

                <p
                  className={`mt-3 rounded-lg px-3 py-2 font-body text-xs ${
                    mailFallo ? 'bg-red-50 text-red-700' : a.emailEstado === 'enviado' ? 'bg-green-50 text-green-800' : 'bg-brasa-100 text-brasa-900/60'
                  }`}
                >
                  {mailFallo ? (
                    <>
                      ⚠ <strong>El mail de confirmación no salió.</strong>{' '}
                      {a.emailError ? `${a.emailError} ` : ''}Avisale por WhatsApp o reintentá.
                    </>
                  ) : a.emailEstado === 'enviado' ? (
                    <>✉ Confirmación enviada por mail.</>
                  ) : (
                    <>✉ Estado del mail sin confirmar.</>
                  )}
                  {a.errorReenvio && a.errorReenvio !== a.emailError && (
                    <span className="block pt-1 font-semibold">{a.errorReenvio}</span>
                  )}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => descartar(a.id)}
                    className="rounded-lg bg-brasa-900 px-4 py-2 font-body text-sm font-semibold text-brasa-100 hover:bg-brasa-800"
                  >
                    Entendido
                  </button>
                  <Link
                    href={`/admin/calendario?fecha=${a.fecha}`}
                    onClick={() => descartar(a.id)}
                    className="rounded-lg bg-brasa-100 px-3 py-2 font-body text-sm font-semibold text-brasa-900 hover:bg-brasa-200"
                  >
                    Ver el día
                  </Link>
                  {mailFallo && (
                    <button
                      disabled={a.reenviando}
                      onClick={() => reenviar(a.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {a.reenviando ? 'Enviando…' : 'Reenviar mail'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {avisos.length > 1 && (
          <button
            onClick={descartarTodos}
            className="pointer-events-auto self-end rounded-full bg-white px-4 py-2 font-body text-xs font-semibold text-brasa-900 shadow-lg ring-1 ring-brasa-200 hover:bg-brasa-50"
          >
            Entendido todas ({avisos.length})
          </button>
        )}
      </div>

      <div className="fixed bottom-3 left-3 z-[60] flex flex-col items-start gap-1.5">
        {sonido && !audioListo && (
          <p className="max-w-[210px] rounded-lg bg-amber-100 px-3 py-1.5 font-body text-[11px] text-amber-900 shadow">
            Tocá la pantalla una vez para activar el sonido.
          </p>
        )}
        <button
          onClick={alternarSonido}
          aria-pressed={sonido}
          className="flex items-center gap-1.5 rounded-full bg-brasa-950/90 px-3 py-2 font-body text-xs font-semibold text-brasa-100 shadow-lg hover:bg-brasa-950"
        >
          <span aria-hidden="true">{sonido ? '🔔' : '🔕'}</span>
          <span className="hidden sm:inline">{sonido ? 'Sonido de avisos activado' : 'Sonido de avisos apagado'}</span>
          <span className="sm:hidden">{sonido ? 'Sonido' : 'Silencio'}</span>
        </button>
      </div>
    </>
  );
}
