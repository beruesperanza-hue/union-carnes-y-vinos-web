'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import { fechaISOaDate, formatearFechaLarga, hoyEnES } from '@/lib/fechas';
import { EVENTO_RESERVAS_CAMBIARON } from '@/components/admin/NotificadorReservas';

interface DiaResumen {
  fecha: string;
  diaSemana: string;
  abre: boolean;
  especial: boolean;
  reservas: number;
  personas: number;
  adentro: number;
  vereda: number;
  capacidad: number;
  cerradoDia: boolean;
  cerrados: number;
  motivo: string | null;
}

interface SectorTurno {
  capacidad: number;
  reservadas: number;
  cerradoFecha: boolean;
  cerradoSemanal: boolean;
  existe?: boolean;
}

interface Turno {
  hora: string;
  especial: boolean;
  pasado: boolean;
  adentro: SectorTurno;
  vereda: SectorTurno & { existe: boolean };
  motivo: string | null;
}

interface CierreFila {
  fecha: string;
  hora: string;
  sector: string;
  motivo: string | null;
}

interface ReservaDia {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  personas: number;
  hora: string;
  ubicacion: string;
  comentarios: string | null;
}

interface DetalleDia {
  fecha: string;
  abre: boolean;
  especial: boolean;
  reemplaza: boolean;
  cerradoDia: boolean;
  cierres: CierreFila[];
  turnos: Turno[];
  reservas: ReservaDia[];
}

interface CuerpoCierre {
  desde: string;
  hasta?: string;
  hora?: string;
  sector?: 'todos' | 'adentro' | 'vereda';
}

interface TurnoEspecialForm {
  hora: string;
  capacidad: number;
  capacidadVereda: number;
}

interface Pendiente {
  titulo: string;
  body: CuerpoCierre;
  impacto: { reservas: number; personas: number };
}

const DIAS_CABECERA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (res.status === 401) {
    window.location.href = '/admin';
    throw new Error('Sesión vencida');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Error inesperado');
  return data as T;
}

function sumarMes(mes: string, delta: number): string {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function nombreMes(mes: string): string {
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(
    fechaISOaDate(`${mes}-01`)
  );
}

function colorOcupacion(personas: number, capacidad: number): string {
  const ratio = capacidad > 0 ? personas / capacidad : 0;
  if (ratio >= 0.85) return 'bg-ember-600';
  if (ratio >= 0.5) return 'bg-ember-400';
  return 'bg-gold-400';
}

export default function CalendarioPage() {
  const hoy = useMemo(() => hoyEnES(), []);
  const [mes, setMes] = useState(hoy.slice(0, 7));
  const [dias, setDias] = useState<DiaResumen[]>([]);
  const [seleccion, setSeleccion] = useState(hoy);
  const [detalle, setDetalle] = useState<DetalleDia | null>(null);
  const [cargandoMes, setCargandoMes] = useState(true);
  const [cargandoDia, setCargandoDia] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [motivo, setMotivo] = useState('');
  const [rangoDesde, setRangoDesde] = useState('');
  const [rangoHasta, setRangoHasta] = useState('');
  const [quitarPendiente, setQuitarPendiente] = useState<{ hora: string; personas: number } | null>(null);
  const pedidoDia = useRef(0);
  const pedidoMes = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const cargarMes = useCallback(async () => {
    const pedido = ++pedidoMes.current;
    try {
      const data = await api<{ dias: DiaResumen[] }>(`/api/admin/calendario?mes=${mes}`);
      // Si mientras tanto se cambió de mes, esta respuesta ya no corresponde.
      if (pedido === pedidoMes.current) setDias(data.dias);
    } catch (e) {
      if (pedido === pedidoMes.current) setError((e as Error).message);
    } finally {
      if (pedido === pedidoMes.current) setCargandoMes(false);
    }
  }, [mes]);

  const cargarDia = useCallback(async () => {
    const pedido = ++pedidoDia.current;
    try {
      const data = await api<DetalleDia>(`/api/admin/calendario/dia?fecha=${seleccion}`);
      if (pedido === pedidoDia.current) setDetalle(data);
    } catch (e) {
      if (pedido === pedidoDia.current) setError((e as Error).message);
    } finally {
      if (pedido === pedidoDia.current) setCargandoDia(false);
    }
  }, [seleccion]);

  useEffect(() => {
    setCargandoMes(true);
    cargarMes();
  }, [cargarMes]);

  useEffect(() => {
    // Al cambiar de día se descarta el detalle anterior: si no, el título
    // mostraría la fecha nueva sobre los turnos de la vieja hasta que llegue
    // la respuesta, y un botón actuaría sobre datos de otro día.
    setDetalle(null);
    setCargandoDia(true);
    setPendiente(null);
    setQuitarPendiente(null);
    cargarDia();
  }, [cargarDia]);

  // /admin/calendario?fecha=YYYY-MM-DD abre ese día (lo usan los avisos de reserva nueva).
  // Reacciona a cada cambio de la URL: estando ya acá, "Ver el día" solo cambia el parámetro.
  const params = useSearchParams();
  useEffect(() => {
    const f = params.get('fecha');
    if (f && /^\d{4}-\d{2}-\d{2}$/.test(f)) {
      setMes(f.slice(0, 7));
      setSeleccion(f);
    }
  }, [params]);

  const irAMes = (nuevo: string) => {
    setMes(nuevo);
    setSeleccion(nuevo === hoy.slice(0, 7) ? hoy : `${nuevo}-01`);
  };

  const elegirDia = (fecha: string) => {
    setSeleccion(fecha);
    // En pantallas angostas el panel queda debajo del calendario.
    if (window.innerWidth < 1024) {
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  const recargar = async () => {
    await Promise.all([cargarMes(), cargarDia()]);
  };

  // Cuando el avisador detecta una reserva nueva, la ocupación se actualiza sola.
  useEffect(() => {
    window.addEventListener(EVENTO_RESERVAS_CAMBIARON, recargar);
    return () => window.removeEventListener(EVENTO_RESERVAS_CAMBIARON, recargar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargarMes, cargarDia]);

  const ejecutar = async (accion: 'cerrar' | 'reabrir', body: CuerpoCierre, motivoTexto?: string) => {
    setOcupado(true);
    setError(null);
    try {
      await api('/api/admin/cierres', {
        method: accion === 'cerrar' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, ...(motivoTexto ? { motivo: motivoTexto } : {}) }),
      });
      setPendiente(null);
      setMotivo('');
      await recargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  const guardarEspeciales = async (body: {
    desde: string;
    hasta?: string;
    turnos: TurnoEspecialForm[];
    reemplaza: boolean;
  }): Promise<boolean> => {
    setOcupado(true);
    setError(null);
    try {
      await api('/api/admin/turnos-especiales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await recargar();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setOcupado(false);
    }
  };

  const quitarEspecial = async (hora?: string) => {
    setOcupado(true);
    setError(null);
    try {
      await api('/api/admin/turnos-especiales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desde: seleccion, ...(hora ? { hora } : {}) }),
      });
      setQuitarPendiente(null);
      await recargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  /**
   * Cerrar: se consulta cuántas reservas ya existen en lo que se cierra.
   * Con `confirmar` (día completo, rangos) o si hay reservas afectadas se pide
   * confirmación; un turno o la terraza sin reservas se cierra en un clic.
   */
  const cerrar = async (titulo: string, body: CuerpoCierre, confirmar: boolean) => {
    setOcupado(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      q.set('desde', body.desde);
      if (body.hasta) q.set('hasta', body.hasta);
      if (body.hora !== undefined) q.set('hora', body.hora);
      if (body.sector) q.set('sector', body.sector);
      const impacto = await api<{ reservas: number; personas: number }>(
        `/api/admin/cierres/impacto?${q.toString()}`
      );
      if (confirmar || impacto.reservas > 0) {
        setPendiente({ titulo, body, impacto });
        setOcupado(false);
        return;
      }
    } catch (e) {
      setError((e as Error).message);
      setOcupado(false);
      return;
    }
    await ejecutar('cerrar', body);
  };

  const celdas = useMemo(() => {
    if (dias.length === 0) return [];
    const primerDia = fechaISOaDate(dias[0].fecha).getUTCDay(); // 0 = domingo
    const huecos = (primerDia + 6) % 7; // semana desde el lunes
    return [...Array<null>(huecos).fill(null), ...dias];
  }, [dias]);

  const totalesMes = useMemo(
    () =>
      dias.reduce(
        (acc, d) => ({
          reservas: acc.reservas + d.reservas,
          personas: acc.personas + d.personas,
          cerrados: acc.cerrados + (d.cerradoDia ? 1 : 0),
        }),
        { reservas: 0, personas: 0, cerrados: 0 }
      ),
    [dias]
  );

  const cierreDiaCompleto = (sector: string) =>
    detalle?.cierres.some((c) => c.hora === '' && c.sector === sector) ?? false;
  const cierreTurno = (hora: string, sector: string) =>
    detalle?.cierres.some((c) => c.hora === hora && c.sector === sector) ?? false;
  const terrazaCerradaTodoElDia = cierreDiaCompleto('vereda');
  const hayTerraza = detalle?.turnos.some((t) => t.vereda.existe) ?? false;
  const esPasado = seleccion < hoy;

  return (
    <div className="min-h-screen bg-brasa-50">
      <AdminHeader />

      <main className="container-page py-10">
        <div className="mb-6">
          <h1 className="font-display uppercase text-4xl text-brasa-900">Calendario</h1>
          <p className="font-body text-sm text-brasa-900/60 mt-1">
            Ocupación por día y control de turnos. Cerrar un día no cancela reservas ya hechas: solo
            evita las nuevas.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-body text-red-700">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-semibold" aria-label="Cerrar aviso">
              ×
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6 items-start">
          {/* ───────── Calendario ───────── */}
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-brasa-200 p-3 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <button
                  onClick={() => irAMes(sumarMes(mes, -1))}
                  className="px-3 py-2 rounded-lg bg-brasa-100 hover:bg-brasa-200 font-body font-semibold text-sm"
                  aria-label="Mes anterior"
                >
                  ←
                </button>
                <div className="text-center">
                  <h2 className="font-display uppercase text-2xl text-brasa-900">{nombreMes(mes)}</h2>
                  <p className="font-body text-xs text-brasa-900/50">
                    {totalesMes.reservas} reservas · {totalesMes.personas} personas
                    {totalesMes.cerrados > 0 && ` · ${totalesMes.cerrados} ${totalesMes.cerrados === 1 ? 'día cerrado' : 'días cerrados'}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => irAMes(hoy.slice(0, 7))}
                    className="px-3 py-2 rounded-lg bg-brasa-100 hover:bg-brasa-200 font-body font-semibold text-sm"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => irAMes(sumarMes(mes, 1))}
                    className="px-3 py-2 rounded-lg bg-brasa-100 hover:bg-brasa-200 font-body font-semibold text-sm"
                    aria-label="Mes siguiente"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
                {DIAS_CABECERA.map((d) => (
                  <div key={d} className="text-center font-body text-[11px] uppercase tracking-wide text-brasa-900/50">
                    {d}
                  </div>
                ))}
              </div>

              {cargandoMes && dias.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-brasa-200 border-t-ember-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {celdas.map((d, i) => {
                    if (!d) return <div key={`h${i}`} />;
                    const nro = Number(d.fecha.slice(8));
                    const esHoy = d.fecha === hoy;
                    const elegido = d.fecha === seleccion;
                    const pasado = d.fecha < hoy;
                    const ratio = d.capacidad > 0 ? Math.min(1, d.personas / d.capacidad) : 0;

                    const base =
                      'relative flex min-h-[64px] sm:min-h-[78px] flex-col rounded-lg border p-1 sm:p-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-500';
                    const estado = !d.abre
                      ? 'border-transparent bg-brasa-100/60 text-brasa-900/40 hover:bg-brasa-100'
                      : d.cerradoDia
                        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-brasa-200 bg-white hover:bg-brasa-50 text-brasa-900';

                    return (
                      <button
                        key={d.fecha}
                        type="button"
                        onClick={() => elegirDia(d.fecha)}
                        aria-pressed={elegido}
                        aria-label={`${formatearFechaLarga(d.fecha)}${d.especial ? ', día especial' : ''}${
                          !d.abre
                            ? ', no abre'
                            : d.cerradoDia
                              ? ', cerrado'
                              : `, ${d.reservas} reservas, ${d.personas} personas`
                        }`}
                        className={`${base} ${estado} ${elegido ? 'ring-2 ring-brasa-900' : ''} ${
                          esHoy && !elegido ? 'ring-2 ring-ember-400' : ''
                        } ${pasado && d.abre && !d.cerradoDia ? 'opacity-70' : ''}`}
                      >
                        <span className="font-body text-xs font-semibold leading-none">
                          {nro}
                          {d.especial && <span className="ml-0.5 text-ember-500" aria-hidden="true">★</span>}
                        </span>

                        {d.abre && d.cerradoDia && (
                          <span className="mt-auto font-body text-[10px] font-bold uppercase tracking-wide">
                            <span className="sm:hidden" aria-hidden="true">✕</span>
                            <span className="hidden sm:inline">Cerrado</span>
                          </span>
                        )}

                        {d.abre && !d.cerradoDia && (
                          <>
                            <span className="mt-2 font-display text-xl leading-none">
                              {d.personas > 0 ? d.personas : <span className="text-brasa-900/25">–</span>}
                            </span>
                            <span className="hidden sm:block font-body text-[10px] text-brasa-900/50 leading-tight">
                              {d.reservas > 0 ? `${d.reservas} res.` : 'sin reservas'}
                            </span>
                            <span className="mt-auto pt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-brasa-100">
                              <span
                                className={`block h-full rounded-full ${colorOcupacion(d.personas, d.capacidad)}`}
                                style={{ width: `${Math.round(ratio * 100)}%` }}
                              />
                            </span>
                            {d.cerrados > 0 && (
                              <span
                                title={`${d.cerrados} ${d.cerrados === 1 ? 'cierre parcial' : 'cierres parciales'}`}
                                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"
                              />
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-body text-[11px] text-brasa-900/55">
                <span className="flex items-center gap-1.5"><i className="inline-block h-1.5 w-5 rounded-full bg-gold-400" /> menos de la mitad</span>
                <span className="flex items-center gap-1.5"><i className="inline-block h-1.5 w-5 rounded-full bg-ember-400" /> más de la mitad</span>
                <span className="flex items-center gap-1.5"><i className="inline-block h-1.5 w-5 rounded-full bg-ember-600" /> casi lleno</span>
                <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-red-500" /> turno o terraza cerrados</span>
                <span className="flex items-center gap-1.5"><span className="text-ember-500">★</span> horario especial</span>
              </div>
            </section>

            {/* Cierre por rango */}
            <section className="bg-white rounded-xl border border-brasa-200 p-5">
              <h2 className="font-display uppercase text-xl text-brasa-900">Cerrar varios días</h2>
              <p className="font-body text-sm text-brasa-900/55 mt-1 mb-4">
                Vacaciones, un evento privado o un feriado largo. Se cierra el día completo, en las dos
                zonas.
              </p>
              <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <label className="font-body text-xs font-semibold text-brasa-900/70">
                  Desde
                  <input
                    type="date"
                    min={hoy}
                    value={rangoDesde}
                    onChange={(e) => {
                      setRangoDesde(e.target.value);
                      if (!rangoHasta || rangoHasta < e.target.value) setRangoHasta(e.target.value);
                    }}
                    className="mt-1.5 w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm font-normal"
                  />
                </label>
                <label className="font-body text-xs font-semibold text-brasa-900/70">
                  Hasta (inclusive)
                  <input
                    type="date"
                    min={rangoDesde || hoy}
                    value={rangoHasta}
                    onChange={(e) => setRangoHasta(e.target.value)}
                    className="mt-1.5 w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm font-normal"
                  />
                </label>
                <button
                  disabled={!rangoDesde || !rangoHasta || ocupado}
                  onClick={() =>
                    cerrar(
                      rangoDesde === rangoHasta
                        ? `Cerrar el ${formatearFechaLarga(rangoDesde)}`
                        : `Cerrar del ${formatearFechaLarga(rangoDesde)} al ${formatearFechaLarga(rangoHasta)}`,
                      { desde: rangoDesde, hasta: rangoHasta, hora: '', sector: 'todos' },
                      true
                    )
                  }
                  className="btn btn-line !py-2.5 disabled:opacity-40"
                >
                  Cerrar
                </button>
              </div>
            </section>
          </div>

          {/* ───────── Panel del día ───────── */}
          <div ref={panelRef} className="lg:sticky lg:top-24 space-y-4 scroll-mt-24">
            <section className="bg-white rounded-xl border border-brasa-200 overflow-hidden">
              <div className={`px-5 py-4 border-l-4 ${detalle?.cerradoDia ? 'border-red-500 bg-red-50' : 'border-ember-500 bg-brasa-100'}`}>
                <p className="font-body text-[11px] uppercase tracking-wide text-brasa-900/50">
                  {esPasado ? 'Día pasado' : seleccion === hoy ? 'Hoy' : 'Día seleccionado'}
                </p>
                <h2 className="font-display uppercase text-xl text-brasa-900 leading-tight">
                  {formatearFechaLarga(seleccion)}
                </h2>
                {detalle?.especial && (
                  <p className="font-body text-xs font-semibold text-ember-600 mt-1">
                    ★ Día especial{detalle.reemplaza ? ' · solo estos horarios' : ''}
                  </p>
                )}
                {detalle?.cerradoDia && (
                  <p className="font-body text-sm font-semibold text-red-700 mt-1">
                    Cerrado
                    {dias.find((d) => d.fecha === seleccion)?.motivo
                      ? ` · ${dias.find((d) => d.fecha === seleccion)?.motivo}`
                      : ''}
                  </p>
                )}
              </div>

              {cargandoDia && !detalle ? (
                <div className="py-14 text-center">
                  <div className="inline-block w-7 h-7 border-4 border-brasa-200 border-t-ember-500 rounded-full animate-spin" />
                </div>
              ) : detalle && !detalle.abre ? (
                <div className="p-5 space-y-4">
                  <p className="font-body text-sm text-brasa-900/60">
                    Este día de la semana no tiene turnos habituales (se definen en{' '}
                    <Link href="/admin/settings" className="underline">Configuración</Link>).
                    {!esPasado && ' Podés abrirlo solo esta vez con un horario especial.'}
                  </p>
                  {!esPasado && (
                    <FormHorariosEspeciales
                      key={seleccion}
                      fecha={seleccion}
                      hayHabituales={false}
                      ocupado={ocupado}
                      onGuardar={guardarEspeciales}
                    />
                  )}
                </div>
              ) : detalle ? (
                <div className="p-5 space-y-5">
                  {/* Acciones del día */}
                  {!esPasado && (
                    <div className="flex flex-wrap gap-2">
                      {detalle.cerradoDia ? (
                        <button
                          disabled={ocupado}
                          onClick={() => ejecutar('reabrir', { desde: seleccion })}
                          className="btn btn-ember !py-2 !text-sm disabled:opacity-50"
                        >
                          Reabrir el día
                        </button>
                      ) : (
                        <>
                          <button
                            disabled={ocupado}
                            onClick={() =>
                              cerrar(
                                `Cerrar todo el ${formatearFechaLarga(seleccion)}`,
                                { desde: seleccion, hora: '', sector: 'todos' },
                                true
                              )
                            }
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-body font-semibold text-sm disabled:opacity-50"
                          >
                            Cerrar todo el día
                          </button>
                          {hayTerraza &&
                            (terrazaCerradaTodoElDia ? (
                              <button
                                disabled={ocupado}
                                onClick={() => ejecutar('reabrir', { desde: seleccion, hora: '', sector: 'vereda' })}
                                className="btn btn-line !py-2 !text-sm disabled:opacity-50"
                              >
                                Reabrir terraza
                              </button>
                            ) : (
                              <button
                                disabled={ocupado}
                                onClick={() =>
                                  cerrar(
                                    `Cerrar la terraza el ${formatearFechaLarga(seleccion)}`,
                                    { desde: seleccion, hora: '', sector: 'vereda' },
                                    false
                                  )
                                }
                                className="btn btn-line !py-2 !text-sm disabled:opacity-50"
                              >
                                ☀️ Cerrar terraza hoy
                              </button>
                            ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Confirmación con impacto */}
                  {pendiente && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
                      <p className="font-body text-sm font-semibold text-brasa-900">{pendiente.titulo}</p>
                      {pendiente.impacto.reservas > 0 ? (
                        <p className="font-body text-sm text-amber-800">
                          Ya hay <strong>{pendiente.impacto.reservas}</strong>{' '}
                          {pendiente.impacto.reservas === 1 ? 'reserva' : 'reservas'} (
                          {pendiente.impacto.personas} personas) en lo que vas a cerrar. No se cancelan
                          solas: tenés que avisarles vos.
                        </p>
                      ) : (
                        <p className="font-body text-sm text-brasa-900/60">No hay reservas en este período.</p>
                      )}
                      <label className="block font-body text-xs font-semibold text-brasa-900/70">
                        Motivo (opcional, solo lo ves vos)
                        <input
                          type="text"
                          maxLength={120}
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          placeholder="Feriado, evento privado, vacaciones…"
                          className="mt-1.5 w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm font-normal bg-white"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          disabled={ocupado}
                          onClick={() => ejecutar('cerrar', pendiente.body, motivo.trim() || undefined)}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-body font-semibold text-sm disabled:opacity-50"
                        >
                          {ocupado ? 'Guardando…' : 'Confirmar cierre'}
                        </button>
                        <button
                          disabled={ocupado}
                          onClick={() => {
                            setPendiente(null);
                            setMotivo('');
                          }}
                          className="px-4 py-2 rounded-lg bg-brasa-100 hover:bg-brasa-200 font-body font-semibold text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Turnos */}
                  <div>
                    <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-brasa-900/50 mb-2">
                      Turnos
                    </h3>
                    <div className="divide-y divide-brasa-100 rounded-lg border border-brasa-200">
                      {detalle.turnos.map((t) => {
                        const turnoCerrado = t.adentro.cerradoFecha && t.vereda.cerradoFecha;
                        const cerradoPorDia = detalle.cerradoDia;
                        const turnoPropio = cierreTurno(t.hora, 'todos');
                        const terrazaPropia = cierreTurno(t.hora, 'vereda');
                        const bloqueado = t.pasado || cerradoPorDia;

                        return (
                          <div key={t.hora} className={`p-3 ${t.pasado ? 'opacity-55' : ''}`}>
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-display text-lg text-brasa-900">{t.hora}</span>
                              <div className="flex flex-wrap justify-end gap-1.5">
                                {t.pasado && <Etiqueta tono="gris">Pasado</Etiqueta>}
                                {t.especial && <Etiqueta tono="dorado">★ Especial</Etiqueta>}
                                {!cerradoPorDia && t.adentro.cerradoFecha && t.vereda.cerradoFecha && (
                                  <Etiqueta tono="rojo">Turno cerrado</Etiqueta>
                                )}
                                {!cerradoPorDia && !turnoCerrado && t.vereda.cerradoFecha && t.vereda.existe && (
                                  <Etiqueta tono="rojo">Terraza cerrada</Etiqueta>
                                )}
                                {(t.adentro.cerradoSemanal || t.vereda.cerradoSemanal) && (
                                  <span title="Cerrado todas las semanas en Configuración">
                                    <Etiqueta tono="ambar">Cierre semanal</Etiqueta>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-3">
                              <Ocupacion icono="🏠" sector={t.adentro} />
                              {t.vereda.existe ? (
                                <Ocupacion icono="☀️" sector={t.vereda} />
                              ) : (
                                <span className="font-body text-xs text-brasa-900/35 self-center">Sin terraza</span>
                              )}
                            </div>

                            {t.especial && !t.pasado && (
                              <div className="mt-3">
                                {quitarPendiente?.hora === t.hora ? (
                                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
                                    <p className="font-body text-xs text-amber-800">
                                      Hay <strong>{quitarPendiente.personas}</strong> personas reservadas a las{' '}
                                      {t.hora}. Si lo quitás no se podrá reservar más ese horario, pero las
                                      reservas siguen existiendo.
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        disabled={ocupado}
                                        onClick={() => quitarEspecial(t.hora)}
                                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-body font-semibold text-xs disabled:opacity-50"
                                      >
                                        Quitar igual
                                      </button>
                                      <button
                                        onClick={() => setQuitarPendiente(null)}
                                        className="px-3 py-1.5 rounded-lg bg-brasa-100 font-body font-semibold text-xs"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    disabled={ocupado}
                                    onClick={() => {
                                      const personas = t.adentro.reservadas + t.vereda.reservadas;
                                      if (personas > 0) setQuitarPendiente({ hora: t.hora, personas });
                                      else quitarEspecial(t.hora);
                                    }}
                                    className="font-body text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                                  >
                                    Quitar horario especial
                                  </button>
                                )}
                              </div>
                            )}

                            {!bloqueado && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {turnoPropio ? (
                                  <button
                                    disabled={ocupado}
                                    onClick={() => ejecutar('reabrir', { desde: seleccion, hora: t.hora, sector: 'todos' })}
                                    className="px-3 py-1.5 rounded-lg bg-brasa-900 text-brasa-100 font-body font-semibold text-xs disabled:opacity-50"
                                  >
                                    Reabrir turno
                                  </button>
                                ) : (
                                  <button
                                    disabled={ocupado || turnoCerrado}
                                    onClick={() =>
                                      cerrar(
                                        `Cerrar el turno de las ${t.hora}`,
                                        { desde: seleccion, hora: t.hora, sector: 'todos' },
                                        false
                                      )
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-body font-semibold text-xs disabled:opacity-40"
                                  >
                                    Cerrar turno
                                  </button>
                                )}

                                {t.vereda.existe && !turnoCerrado &&
                                  (terrazaPropia ? (
                                    <button
                                      disabled={ocupado}
                                      onClick={() => ejecutar('reabrir', { desde: seleccion, hora: t.hora, sector: 'vereda' })}
                                      className="px-3 py-1.5 rounded-lg bg-brasa-900 text-brasa-100 font-body font-semibold text-xs disabled:opacity-50"
                                    >
                                      Reabrir terraza
                                    </button>
                                  ) : (
                                    <button
                                      disabled={ocupado || t.vereda.cerradoFecha}
                                      onClick={() =>
                                        cerrar(
                                          `Cerrar la terraza de las ${t.hora}`,
                                          { desde: seleccion, hora: t.hora, sector: 'vereda' },
                                          false
                                        )
                                      }
                                      className="px-3 py-1.5 rounded-lg bg-brasa-100 hover:bg-brasa-200 text-brasa-900 font-body font-semibold text-xs disabled:opacity-40"
                                    >
                                      Cerrar terraza
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horarios especiales */}
                  {!esPasado && (
                    <details className="rounded-lg border border-brasa-200 bg-brasa-50/60 group" open={detalle.especial}>
                      <summary className="cursor-pointer select-none px-4 py-3 font-body text-sm font-semibold text-brasa-900">
                        ★ Horarios especiales para este día
                      </summary>
                      <div className="px-4 pb-4">
                        <FormHorariosEspeciales
                          key={seleccion}
                          fecha={seleccion}
                          hayHabituales
                          ocupado={ocupado}
                          onGuardar={guardarEspeciales}
                        />
                      </div>
                    </details>
                  )}

                  {/* Reservas del día */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-brasa-900/50">
                        Reservas ({detalle.reservas.length})
                      </h3>
                      <Link
                        href={`/admin/reservas?fecha=${seleccion}`}
                        className="font-body text-xs font-semibold text-ember-600 hover:underline"
                      >
                        Gestionar →
                      </Link>
                    </div>
                    {detalle.reservas.length === 0 ? (
                      <p className="font-body text-sm text-brasa-900/45">Sin reservas confirmadas.</p>
                    ) : (
                      <ul className="divide-y divide-brasa-100 rounded-lg border border-brasa-200">
                        {detalle.reservas.map((r) => (
                          <li key={r.id} className="flex items-start justify-between gap-3 p-3">
                            <div className="min-w-0">
                              <p className="font-body text-sm font-semibold text-brasa-900 truncate">
                                {r.nombre} {r.apellido}
                              </p>
                              <p className="font-body text-xs text-brasa-900/55">
                                {r.hora} · {r.ubicacion === 'vereda' ? '☀️ Terraza' : '🏠 Adentro'}
                                {r.telefono ? ` · ${r.telefono}` : ''}
                              </p>
                              {r.comentarios && (
                                <p className="font-body text-xs text-brasa-900/60 mt-0.5">💬 {r.comentarios}</p>
                              )}
                            </div>
                            <span className="font-display text-lg text-brasa-900 whitespace-nowrap">
                              {r.personas} <span className="text-xs font-body text-brasa-900/45">pers.</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Etiqueta({
  children,
  tono,
}: {
  children: React.ReactNode;
  tono: 'rojo' | 'ambar' | 'gris' | 'dorado';
}) {
  const clases = {
    rojo: 'bg-red-100 text-red-700',
    ambar: 'bg-amber-100 text-amber-800',
    gris: 'bg-brasa-100 text-brasa-900/60',
    dorado: 'bg-gold-400/30 text-brasa-900',
  }[tono];
  return (
    <span className={`rounded-full px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${clases}`}>
      {children}
    </span>
  );
}

function Ocupacion({ icono, sector }: { icono: string; sector: SectorTurno }) {
  const ratio = sector.capacidad > 0 ? Math.min(1, sector.reservadas / sector.capacidad) : 0;
  const cerrado = sector.cerradoFecha || sector.cerradoSemanal;
  return (
    <div className={cerrado ? 'opacity-50' : ''}>
      <div className="flex items-baseline justify-between font-body text-xs text-brasa-900/70">
        <span>{icono}</span>
        <span className="tabular-nums">
          <strong className="text-brasa-900">{sector.reservadas}</strong>/{sector.capacidad}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brasa-100">
        <div
          className={`h-full rounded-full ${colorOcupacion(sector.reservadas, sector.capacidad)}`}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}

function FormHorariosEspeciales({
  fecha,
  hayHabituales,
  ocupado,
  onGuardar,
}: {
  fecha: string;
  /** El día de la semana ya tiene turnos habituales (mostrar la opción de reemplazarlos). */
  hayHabituales: boolean;
  ocupado: boolean;
  onGuardar: (body: {
    desde: string;
    hasta?: string;
    turnos: TurnoEspecialForm[];
    reemplaza: boolean;
  }) => Promise<boolean>;
}) {
  const [turnos, setTurnos] = useState<TurnoEspecialForm[]>([
    { hora: '20:00', capacidad: 30, capacidadVereda: 0 },
  ]);
  const [hasta, setHasta] = useState('');
  const [reemplaza, setReemplaza] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cambiar = (i: number, cambio: Partial<TurnoEspecialForm>) =>
    setTurnos((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...cambio } : t)));

  const guardar = async () => {
    setAviso(null);
    if (turnos.some((t) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t.hora))) {
      setAviso('Completá todos los horarios.');
      return;
    }
    if (new Set(turnos.map((t) => t.hora)).size !== turnos.length) {
      setAviso('Hay horarios repetidos.');
      return;
    }
    if (turnos.some((t) => t.capacidad + t.capacidadVereda <= 0)) {
      setAviso('Cada horario necesita capacidad (adentro o terraza).');
      return;
    }
    const ok = await onGuardar({
      desde: fecha,
      ...(hasta && hasta > fecha ? { hasta } : {}),
      turnos,
      reemplaza: hayHabituales ? reemplaza : false,
    });
    if (ok) setAviso('Guardado.');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {turnos.map((t, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
            <label className="font-body text-[11px] font-semibold text-brasa-900/60">
              Hora
              <input
                type="time"
                value={t.hora}
                onChange={(e) => cambiar(i, { hora: e.target.value })}
                className="mt-1 w-full border border-brasa-200 rounded-lg px-2 py-1.5 font-body text-sm font-normal bg-white"
              />
            </label>
            <label className="font-body text-[11px] font-semibold text-brasa-900/60">
              🏠 Adentro
              <input
                type="number"
                min={0}
                max={500}
                value={t.capacidad}
                onChange={(e) => cambiar(i, { capacidad: Math.max(0, parseInt(e.target.value) || 0) })}
                className="mt-1 w-full border border-brasa-200 rounded-lg px-2 py-1.5 font-body text-sm font-normal bg-white"
              />
            </label>
            <label className="font-body text-[11px] font-semibold text-brasa-900/60">
              ☀️ Terraza
              <input
                type="number"
                min={0}
                max={500}
                value={t.capacidadVereda}
                onChange={(e) => cambiar(i, { capacidadVereda: Math.max(0, parseInt(e.target.value) || 0) })}
                className="mt-1 w-full border border-brasa-200 rounded-lg px-2 py-1.5 font-body text-sm font-normal bg-white"
              />
            </label>
            <button
              type="button"
              disabled={turnos.length === 1}
              onClick={() => setTurnos((prev) => prev.filter((_, idx) => idx !== i))}
              className="mb-0.5 h-8 w-8 rounded-lg bg-brasa-100 hover:bg-brasa-200 font-body text-sm disabled:opacity-30"
              aria-label="Quitar este horario"
            >
              ×
            </button>
          </div>
        ))}
        {turnos.length < 8 && (
          <button
            type="button"
            onClick={() => setTurnos((prev) => [...prev, { hora: '', capacidad: 30, capacidadVereda: 0 }])}
            className="font-body text-xs font-semibold text-ember-600 hover:underline"
          >
            + Agregar otro horario
          </button>
        )}
      </div>

      {hayHabituales && (
        <label className="flex items-start gap-2 font-body text-xs text-brasa-900/70">
          <input
            type="checkbox"
            checked={reemplaza}
            onChange={(e) => setReemplaza(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Usar <strong>solo</strong> estos horarios ese día (se ignoran los habituales). Si no, se
            suman a los habituales y, a la misma hora, reemplazan su capacidad.
          </span>
        </label>
      )}

      <label className="block font-body text-[11px] font-semibold text-brasa-900/60">
        Repetir hasta (opcional, inclusive)
        <input
          type="date"
          min={fecha}
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="mt-1 w-full border border-brasa-200 rounded-lg px-2 py-1.5 font-body text-sm font-normal bg-white"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={ocupado}
          onClick={guardar}
          className="btn btn-ember !py-2 !text-sm disabled:opacity-50"
        >
          {ocupado ? 'Guardando…' : 'Guardar horarios especiales'}
        </button>
        {aviso && <span className="font-body text-xs text-brasa-900/60">{aviso}</span>}
      </div>
    </div>
  );
}
