'use client';

import { useState } from 'react';
import { createReservationAdmin } from '@/app/actions/reservations';
import { UBICACIONES } from '@/lib/constants';
import { hoyEnES } from '@/lib/fechas';

export default function NuevaReservaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    personas: '2',
    fecha: hoyEnES(),
    hora: '20:00',
    ubicacion: UBICACIONES.ADENTRO as string,
    comentarios: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Email opcional para walk-ins: si no lo dan, generamos uno único para
    // no chocar contra la constraint (fecha+hora+email).
    const email = data.email.trim() || `walkin-${Date.now()}@sin-email.union`;

    const res = await createReservationAdmin({
      ...data,
      email,
      personas: parseInt(data.personas),
    });

    setLoading(false);
    if (res.success) {
      onCreated();
      onClose();
    } else {
      setError(res.error || 'Error al crear la reserva');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display uppercase text-2xl text-brasa-900">Nueva reserva</h2>
          <button onClick={onClose} className="text-brasa-900/50 hover:text-brasa-900 text-xl">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg font-body text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">Fecha</label>
              <input type="date" name="fecha" value={data.fecha} onChange={handleChange} required
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">Hora</label>
              <input type="time" name="hora" value={data.hora} onChange={handleChange} required
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">Nombre</label>
              <input type="text" name="nombre" value={data.nombre} onChange={handleChange} required
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">Apellido</label>
              <input type="text" name="apellido" value={data.apellido} onChange={handleChange}
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">
                Email (opcional)
              </label>
              <input type="email" name="email" value={data.email} onChange={handleChange}
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">Teléfono</label>
              <input type="tel" name="telefono" value={data.telefono} onChange={handleChange}
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">Personas</label>
              <input type="number" name="personas" min={1} max={30} value={data.personas} onChange={handleChange}
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">Sector</label>
              <select name="ubicacion" value={data.ubicacion} onChange={handleChange}
                className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm">
                <option value={UBICACIONES.ADENTRO}>Adentro</option>
                <option value={UBICACIONES.VEREDA}>Terraza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1">
              Comentarios
            </label>
            <textarea name="comentarios" value={data.comentarios} onChange={handleChange} rows={2}
              className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
          </div>

          <p className="font-body text-xs text-brasa-900/40">
            Esta carga no valida turno pasado, cierre ni cupo — es para walk-ins y reservas por
            teléfono. Usala con criterio.
          </p>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-line flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-ember flex-1">
              {loading ? 'Guardando...' : 'Crear reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
