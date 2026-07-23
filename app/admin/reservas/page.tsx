'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NuevaReservaModal from '@/components/admin/NuevaReservaModal';
import { cancelReservation, deleteReservation } from '@/app/actions/reservations';
import { UBICACIONES } from '@/lib/constants';
import { formatearFechaLarga } from '@/lib/fechas';

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
}

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [filtro, setFiltro] = useState<'hoy' | 'manana' | 'todas' | 'fecha'>('hoy');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    loadReservas();
  }, [filtro, fechaFiltro]);

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
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-1.5 mt-2 text-sm font-body text-brasa-900/60">
                            <div>📧 {reserva.email.includes('sin-email.union') ? '—' : reserva.email}</div>
                            <div>📱 {reserva.telefono || '—'}</div>
                            <div>👥 {reserva.personas} personas</div>
                            <div>{reserva.ubicacion === UBICACIONES.VEREDA ? '☀️ Terraza' : '🏠 Adentro'}</div>
                            {reserva.comentarios && (
                              <div className="col-span-2">💬 {reserva.comentarios}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {reserva.estado === 'confirmada' ? (
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
