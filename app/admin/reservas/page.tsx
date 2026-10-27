'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import NuevaReservaModal from '@/components/admin/NuevaReservaModal';
import { cancelReservation, deleteReservation } from '@/app/actions/reservations';
import { UBICACIONES } from '@/lib/constants';
import { formatearFechaLarga } from '@/lib/fechas';
import { EVENTO_RESERVAS_CAMBIARON } from '@/components/admin/NotificadorReservas';

interface Reservation {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  personas: number;
  fecha: string;
  hora: string;
  ubicacion?: string;
  comentarios?: string;
  estado: string;
  emailEstado?: string | null;
  emailError?: string | null;
}

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [filtro, setFiltro] = useState<'hoy' | 'manana' | 'todas' | 'fecha' | 'sinmail' | 'pendientes'>('hoy');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // ?fecha=YYYY-MM-DD (desde el calendario) o ?filtro=sinmail (desde el aviso de mails
  // fallidos). Se reacciona a cada cambio de la URL, no solo al montar: desde esta misma
  // página, un enlace que solo cambia el parámetro no remonta el componente.
  const params = useSearchParams();
  const [listo, setListo] = useState(false);
  const primeraLectura = useRef(true);
  useEffect(() => {
    const f = params.get('fecha');
    if (f && /^\d{4}-\d{2}-\d{2}$/.test(f)) {
      setFiltro('fecha');
      setFechaFiltro(f);
    } else if (params.get('filtro') === 'sinmail') {
      setFiltro('sinmail');
    } else if (params.get('filtro') === 'pendientes') {
      setFiltro('pendientes');
    } else if (!primeraLectura.current) {
      // Se navegó a /admin/reservas sin parámetros (menú): vuelve a la vista normal.
      setFiltro('hoy');
    }
    primeraLectura.current = false;
    setListo(true);
  }, [params]);

  useEffect(() => {
    if (listo) loadReservas();
  }, [listo, filtro, fechaFiltro]);

  const loadReservas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtro === 'fecha' && fechaFiltro) {
        params.append('fecha', fechaFiltro);
      } else {
        params.append('filtro', filtro);
      }
      const response = await fetch(`/api/admin/reservas?${params}`);
      const data = await response.json();
      setReservas(data.reservas || []);
    } catch (error) {
      console.error('Error loading reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const [reenviando, setReenviando] = useState<string | null>(null);
  const [errorMail, setErrorMail] = useState<{ id: string; texto: string } | null>(null);

  const handleReenviar = async (id: string) => {
    setReenviando(id);
    setErrorMail(null);
    try {
      const res = await fetch(`/api/admin/reservas/${id}/reenviar-mail`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        setErrorMail({ id, texto: data.error || 'No se pudo reenviar el mail.' });
      }
      await loadReservas();
    } finally {
      setReenviando(null);
    }
  };

  // Confirmar o rechazar un grupo grande pendiente.
  const [resolviendo, setResolviendo] = useState<string | null>(null);
  const [avisoDecision, setAvisoDecision] = useState<{ id: string; texto: string; error: boolean } | null>(null);

  const handleDecision = async (r: Reservation, accion: 'confirmar' | 'rechazar') => {
    const pregunta =
      accion === 'confirmar'
        ? `¿Confirmar la reserva de ${r.nombre} ${r.apellido} (${r.personas} personas)? Se le manda el mail de confirmación.`
        : `¿Rechazar la reserva de ${r.nombre} ${r.apellido}? Se libera el lugar y se le avisa por mail.`;
    if (!confirm(pregunta)) return;
    setResolviendo(r.id);
    setAvisoDecision(null);
    try {
      const res = await fetch(`/api/admin/reservas/${r.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAvisoDecision({ id: r.id, texto: data.error || 'No se pudo resolver la reserva.', error: true });
      } else if (data.emailEnviado === false) {
        setAvisoDecision({
          id: r.id,
          texto: `Quedó ${accion === 'confirmar' ? 'confirmada' : 'rechazada'}, pero el mail al cliente no salió${
            data.emailError ? `: ${data.emailError}` : ''
          }. Avisale por WhatsApp.`,
          error: true,
        });
      }
      await loadReservas();
      window.dispatchEvent(new Event(EVENTO_RESERVAS_CAMBIARON));
    } finally {
      setResolviendo(null);
    }
  };

  // Cuando el avisador detecta una reserva nueva, la lista se actualiza sola.
  useEffect(() => {
    if (!listo) return;
    const alCambiar = () => loadReservas();
    window.addEventListener(EVENTO_RESERVAS_CAMBIARON, alCambiar);
    return () => window.removeEventListener(EVENTO_RESERVAS_CAMBIARON, alCambiar);
  }, [listo, filtro, fechaFiltro]);

  const estadoMail = (r: Reservation) => {
    if (r.estado === 'pendiente') {
      if (r.emailEstado === 'fallido') {
        return <div className="text-red-700">✉ No salió el mail de &ldquo;solicitud recibida&rdquo;{r.emailError ? `: ${r.emailError}` : ''}</div>;
      }
      return r.emailEstado === 'enviado' ? <div className="text-green-700">✉ Se le avisó que la confirmamos nosotros</div> : null;
    }
    if (r.estado !== 'confirmada' || r.email.includes('sin-email.union') || !r.emailEstado) return null;
    if (r.emailEstado === 'enviado') {
      return <div className="text-green-700">✉ Mail de confirmación enviado</div>;
    }
    if (r.emailEstado === 'fallido') {
      return (
        <div className="col-span-2 flex flex-wrap items-center gap-2 text-red-700">
          <span>✉ El mail no salió{r.emailError ? `: ${r.emailError}` : ''}</span>
          <button
            onClick={() => handleReenviar(r.id)}
            disabled={reenviando === r.id}
            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {reenviando === r.id ? 'Enviando…' : 'Reenviar'}
          </button>
          {errorMail?.id === r.id && <span className="text-xs font-semibold">{errorMail.texto}</span>}
        </div>
      );
    }
    return null;
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    const result = await cancelReservation(id);
    if (result.success) loadReservas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva permanentemente?')) return;
    const result = await deleteReservation(id);
    if (result.success) loadReservas();
  };

  const filtradas = reservas.filter((r) => {
    const texto = `${r.nombre} ${r.apellido} ${r.email} ${r.telefono}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const agrupadas = filtradas.reduce(
    (acc, r) => {
      const key = `${r.fecha}|${r.hora}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {} as Record<string, Reservation[]>
  );

  return (
    <div className="min-h-screen bg-brasa-50">
      <AdminHeader />

      <main className="container-page py-12">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <h1 className="font-display uppercase text-4xl text-brasa-900">Gestión de reservas</h1>
          <button onClick={() => setModalAbierto(true)} className="btn btn-ember">
            + Nueva reserva
          </button>
        </div>

        {avisoDecision && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 font-body text-sm font-semibold text-red-800">
            <span>{avisoDecision.texto}</span>
            <button onClick={() => setAvisoDecision(null)} className="text-xs underline">Cerrar</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-brasa-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-2">Filtro</label>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { value: 'hoy', label: 'Hoy' },
                    { value: 'manana', label: 'Mañana' },
                    { value: 'todas', label: 'Todas' },
                    { value: 'fecha', label: 'Fecha específica' },
                    { value: 'pendientes', label: '⏳ Por confirmar' },
                    { value: 'sinmail', label: '✉ Sin mail' },
                  ] as const
                ).map((f) => (
                  <button key={f.value} onClick={() => setFiltro(f.value)}
                    className={`px-4 py-2 rounded-lg font-body font-semibold text-sm ${
                      filtro === f.value ? 'bg-brasa-900 text-brasa-100' : 'bg-brasa-100 text-brasa-900/70 hover:bg-brasa-200'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filtro === 'fecha' && (
              <div>
                <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-2">Fecha</label>
                <input type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)}
                  className="w-full border border-brasa-200 rounded-lg px-4 py-2 font-body text-sm" />
              </div>
            )}
          </div>

          <div>
            <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-2">Búsqueda</label>
            <input type="text" placeholder="Nombre, email o teléfono..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-brasa-200 rounded-lg px-4 py-2 font-body text-sm" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brasa-200 border-t-ember-500 rounded-full animate-spin" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="font-body text-brasa-900/50">No hay reservas para mostrar</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(agrupadas).map(([clave, resas]) => {
              const [fechaGrupo, horaGrupo] = clave.split('|');
              const enVereda = resas
                .filter((r) => r.ubicacion === UBICACIONES.VEREDA)
                .reduce((sum, r) => sum + r.personas, 0);
              const adentro = resas.reduce((sum, r) => sum + r.personas, 0) - enVereda;

              return (
                <div key={clave} className="bg-white rounded-xl border border-brasa-200 overflow-hidden">
                  <div className="bg-brasa-100 border-l-4 border-ember-500 px-6 py-4">
                    <h2 className="font-display uppercase text-lg text-brasa-900">
                      {formatearFechaLarga(fechaGrupo)} · {horaGrupo}
                    </h2>
                    <p className="font-body text-sm text-brasa-900/60">
                      {resas.reduce((s, r) => s + r.personas, 0)} personas en {resas.length}{' '}
                      {resas.length === 1 ? 'reserva' : 'reservas'} — 🏠 {adentro} adentro · ☀️ {enVereda} terraza
                    </p>
                  </div>

                  <div className="divide-y divide-brasa-100">
                    {resas.map((reserva) => (
                      <div key={reserva.id} className="p-5 hover:bg-brasa-50 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-body font-semibold text-brasa-900">
                            {reserva.nombre} {reserva.apellido}
                            {reserva.estado === 'pendiente' && (
                              <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-800">
                                Por confirmar
                              </span>
                            )}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-1.5 mt-2 text-sm font-body text-brasa-900/60">
                            <div>📧 {reserva.email.includes('sin-email.union') ? '—' : reserva.email}</div>
                            {estadoMail(reserva)}
                            <div>📱 {reserva.telefono || '—'}</div>
                            <div>👥 {reserva.personas} personas</div>
                            <div>{reserva.ubicacion === UBICACIONES.VEREDA ? '☀️ Terraza' : '🏠 Adentro'}</div>
                            {reserva.comentarios && (
                              <div className="col-span-2">💬 {reserva.comentarios}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                          {reserva.estado === 'pendiente' && (
                            <>
                              <button onClick={() => handleDecision(reserva, 'confirmar')}
                                disabled={resolviendo === reserva.id}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-body font-semibold hover:bg-green-700 disabled:opacity-50">
                                {resolviendo === reserva.id ? '…' : '✓ Confirmar'}
                              </button>
                              <button onClick={() => handleDecision(reserva, 'rechazar')}
                                disabled={resolviendo === reserva.id}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-body font-semibold hover:bg-red-200 disabled:opacity-50">
                                Rechazar
                              </button>
                            </>
                          )}
                          {reserva.estado === 'pendiente' ? null : reserva.estado === 'confirmada' ? (
                            <button onClick={() => handleCancel(reserva.id)}
                              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-body font-semibold hover:bg-amber-200">
                              Cancelar
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-body font-semibold">
                              Cancelada
                            </span>
                          )}
                          <button onClick={() => handleDelete(reserva.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-body font-semibold hover:bg-red-100">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modalAbierto && (
        <NuevaReservaModal onClose={() => setModalAbierto(false)} onCreated={loadReservas} />
      )}
    </div>
  );
}
