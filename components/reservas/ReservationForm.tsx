'use client';

import { useState } from 'react';
import { createReservation } from '@/app/actions/reservations';
import { UBICACIONES } from '@/lib/constants';
import { formatearFechaLarga, hoyEnES, sumarDias } from '@/lib/fechas';

interface AvailableSlot {
  hora: string;
  pasado: boolean;
  disponible: boolean;
  salon: { disponible: boolean; libres: number; cerrado: boolean };
  vereda: { existe: boolean; disponible: boolean; libres: number; cerrado: boolean };
}

export default function ReservationForm() {
  const [step, setStep] = useState<'fecha' | 'horario' | 'datos' | 'confirmacion'>('fecha');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    personas: '2',
    fecha: '',
    hora: '',
    ubicacion: UBICACIONES.ADENTRO as string,
    comentarios: '',
  });

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [sinServicio, setSinServicio] = useState(false);

  const cargarDisponibilidad = async (fecha: string, personas: string) => {
    if (!fecha) return;
    setLoadingSlots(true);
    setSinServicio(false);
    try {
      const response = await fetch(`/api/disponibilidad?fecha=${fecha}&personas=${personas}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al cargar horarios disponibles');
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data.slots || []);
        setSinServicio((data.slots || []).length === 0);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value;
    setFormData((prev) => ({ ...prev, fecha, hora: '' }));
    setError(null);
    await cargarDisponibilidad(fecha, formData.personas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createReservation({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        personas: parseInt(formData.personas),
        fecha: formData.fecha,
        hora: formData.hora,
        ubicacion: formData.ubicacion,
        comentarios: formData.comentarios,
      });

      if (response.success) {
        setSuccess(true);
        setStep('confirmacion');
        setTimeout(() => {
          setFormData({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            personas: '2',
            fecha: '',
            hora: '',
            ubicacion: UBICACIONES.ADENTRO as string,
            comentarios: '',
          });
          setStep('fecha');
          setSuccess(false);
        }, 6000);
      } else {
        setError(response.error || 'Error al crear la reserva');
        // El cupo pudo agotarse mientras completaba el form: refrescamos.
        if (formData.fecha) await cargarDisponibilidad(formData.fecha, formData.personas);
      }
    } catch (err) {
      setError('Error al procesar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const today = hoyEnES();
  const maxDateStr = sumarDias(today, 60);

  return (
    <div className="w-full">
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">✅</span>
          <div>
            <h3 className="font-body font-semibold text-green-900">¡Reserva confirmada!</h3>
            <p className="font-body text-green-700 text-sm">Te enviamos un email de confirmación.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">⚠️</span>
          <p className="font-body text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 mb-8">
          {(['fecha', 'horario', 'datos'] as const).map((s, i) => {
            const labels = ['Fecha', 'Horario', 'Datos'];
            return (
              <button
                key={s}
                type="button"
                onClick={() => s === 'fecha' && setStep('fecha')}
                className={`flex-1 py-3 rounded-lg font-body font-semibold flex flex-col items-center gap-1 ${
                  step === s
                    ? 'bg-brasa-900 text-brasa-100'
                    : ['fecha', 'horario', 'datos'].indexOf(step) > i
                    ? 'bg-green-600 text-white'
                    : 'bg-brasa-100 text-brasa-900/50'
                }`}
              >
                <span className="text-lg">{i + 1}</span>
                <span className="text-xs font-normal">{labels[i]}</span>
              </button>
            );
          })}
        </div>

        {step === 'fecha' && (
          <div className="space-y-4">
            <h3 className="font-display uppercase text-xl text-brasa-900">📅 Elegí una fecha</h3>
            <p className="font-body text-sm text-brasa-900/60">
              Abrimos jueves, viernes, sábado y domingo — el resto de los días no vas a ver horarios.
            </p>

            <div>
              <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleDateSelect}
                min={today}
                max={maxDateStr}
                className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body"
                required
              />
            </div>

            {sinServicio && !loadingSlots && (
              <div className="p-4 bg-brasa-100 rounded-lg text-center font-body text-brasa-900/70 text-sm">
                Ese día no abrimos. Elegí jueves, viernes, sábado o domingo.
              </div>
            )}

            {formData.fecha && !sinServicio && (
              <button type="button" onClick={() => setStep('horario')} className="btn btn-ember w-full">
                Continuar
              </button>
            )}
          </div>
        )}

        {step === 'horario' && (
          <div className="space-y-4">
            <h3 className="font-display uppercase text-xl text-brasa-900">🕐 Elegí un horario</h3>

            <div>
              <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">
                Cantidad de personas
              </label>
              <select
                name="personas"
                value={formData.personas}
                onChange={async (e) => {
                  handleInputChange(e);
                  await cargarDisponibilidad(formData.fecha, e.target.value);
                }}
                className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
            </div>

            {loadingSlots ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-brasa-200 border-t-ember-500 rounded-full animate-spin" />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.hora}
                    type="button"
                    onClick={() => {
                      const ubicacion = slot.salon.disponible
                        ? UBICACIONES.ADENTRO
                        : UBICACIONES.VEREDA;
                      setFormData((prev) => ({ ...prev, hora: slot.hora, ubicacion }));
                      setStep('datos');
                    }}
                    disabled={!slot.disponible}
                    className={`py-3 rounded-lg font-body font-semibold ${
                      slot.disponible
                        ? 'bg-brasa-100 text-brasa-900 hover:bg-brasa-200 cursor-pointer'
                        : 'bg-brasa-50 text-brasa-900/30 cursor-not-allowed'
                    }`}
                  >
                    {slot.hora}
                    {!slot.disponible && (
                      <div className="text-[10px]">{slot.pasado ? 'Ya pasó' : 'Lleno'}</div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-brasa-100 rounded-lg text-center font-body text-brasa-900/70 text-sm">
                No hay horarios disponibles para esta fecha
              </div>
            )}

            <button type="button" onClick={() => setStep('fecha')} className="btn btn-line w-full">
              Atrás
            </button>
          </div>
        )}

        {step === 'datos' && (
          <div className="space-y-4">
            <h3 className="font-display uppercase text-xl text-brasa-900">👤 Tus datos</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">Nombre *</label>
                <input
                  type="text" name="nombre" value={formData.nombre} onChange={handleInputChange}
                  className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body" required
                />
              </div>
              <div>
                <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">Apellido *</label>
                <input
                  type="text" name="apellido" value={formData.apellido} onChange={handleInputChange}
                  className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body" required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">Email *</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body" required
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">Teléfono *</label>
                <input
                  type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange}
                  className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body" required
                  placeholder="+34 XXX XX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">
                ¿Dónde preferís sentarte?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: UBICACIONES.ADENTRO, label: 'Adentro', icono: '🏠' },
                  { value: UBICACIONES.VEREDA, label: 'En la terraza', icono: '☀️' },
                ].map((opcion) => (
                  <button
                    key={opcion.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, ubicacion: opcion.value }))}
                    className={`py-3 px-4 rounded-lg font-body font-semibold border-2 flex items-center justify-center gap-2 ${
                      formData.ubicacion === opcion.value
                        ? 'bg-brasa-900 border-brasa-900 text-brasa-100'
                        : 'bg-white border-brasa-200 text-brasa-900 hover:border-brasa-400'
                    }`}
                  >
                    <span>{opcion.icono}</span>
                    {opcion.label}
                  </button>
                ))}
              </div>
              {formData.ubicacion === UBICACIONES.VEREDA && (
                <p className="font-body text-xs text-brasa-900/50 mt-2">
                  La terraza depende del clima. Si llueve te reubicamos adentro.
                </p>
              )}
            </div>

            <div>
              <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">
                Comentarios (opcional)
              </label>
              <textarea
                name="comentarios" value={formData.comentarios} onChange={handleInputChange}
                className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body" rows={3}
                placeholder="Alergias, celebración especial, etc."
              />
            </div>

            <div className="bg-brasa-50 p-4 rounded-lg border border-brasa-200">
              <p className="font-body text-sm text-brasa-900">
                <span className="font-semibold">{formData.personas} personas</span> el{' '}
                <span className="font-semibold">{formatearFechaLarga(formData.fecha)}</span> a las{' '}
                <span className="font-semibold">{formData.hora}</span>,{' '}
                <span className="font-semibold">
                  {formData.ubicacion === UBICACIONES.VEREDA ? 'en la terraza' : 'adentro'}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep('horario')} className="btn btn-line flex-1">
                Atrás
              </button>
              <button type="submit" disabled={loading} className="btn btn-ember flex-1">
                {loading ? 'Confirmando...' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
