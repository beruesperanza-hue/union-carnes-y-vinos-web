'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { DIAS_SEMANA_ORDEN } from '@/lib/constants';

interface Schedule {
  id: string;
  dia: string;
  hora: string;
  capacidad: number;
  capacidadVereda: number;
  activo: boolean;
  cerradoManual: boolean;
  cerradoVereda: boolean;
}

interface Settings {
  capacidadPorTurno: number;
  diasAvanzados: number;
  nombreRestaurante: string;
  emailRestaurante: string;
  telefonoRestaurante: string;
  direccionRestaurante: string;
}

const DIAS_ABIERTOS = ['jueves', 'viernes', 'sábado', 'domingo'];

export default function SettingsPage() {
  const [horarios, setHorarios] = useState<Schedule[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHora, setNewHora] = useState('20:00');
  const [newDia, setNewDia] = useState('jueves');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [horariosRes, settingsRes] = await Promise.all([
        fetch('/api/admin/horarios'),
        fetch('/api/admin/configuracion'),
      ]);
      const horariosData = await horariosRes.json();
      const settingsData = await settingsRes.json();
      setHorarios(horariosData.horarios || []);
      setSettings(settingsData.settings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHorario = async () => {
    if (!newHora) return;
    const response = await fetch('/api/admin/horarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia: newDia, hora: newHora, capacidad: settings?.capacidadPorTurno || 30 }),
    });
    if (response.ok) {
      await loadData();
      setNewHora('20:00');
    }
  };

  const handleDeleteHorario = async (id: string) => {
    if (!confirm('¿Eliminar este horario?')) return;
    await fetch(`/api/admin/horarios/${id}`, { method: 'DELETE' });
    await loadData();
  };

  const handleUpdateHorario = async (id: string, data: Partial<Schedule>) => {
    setHorarios((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
    await fetch(`/api/admin/horarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) alert('Configuración guardada');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brasa-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-96">
          <div className="inline-block w-8 h-8 border-4 border-brasa-200 border-t-ember-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brasa-50">
      <AdminHeader />

      <main className="container-page py-12">
        <h1 className="font-display uppercase text-4xl text-brasa-900 mb-8">Configuración</h1>

        <div className="bg-white rounded-xl border border-brasa-200 p-8 mb-8">
          <h2 className="font-display uppercase text-2xl text-brasa-900 mb-6">Datos del restaurante</h2>
          {settings && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <Campo label="Nombre" value={settings.nombreRestaurante}
                  onChange={(v) => setSettings({ ...settings, nombreRestaurante: v })} />
                <Campo label="Email" value={settings.emailRestaurante}
                  onChange={(v) => setSettings({ ...settings, emailRestaurante: v })} />
                <Campo label="Teléfono" value={settings.telefonoRestaurante}
                  onChange={(v) => setSettings({ ...settings, telefonoRestaurante: v })} />
                <Campo label="Dirección" value={settings.direccionRestaurante}
                  onChange={(v) => setSettings({ ...settings, direccionRestaurante: v })} />
                <Campo label="Capacidad por turno (default)" type="number"
                  value={String(settings.capacidadPorTurno)}
                  onChange={(v) => setSettings({ ...settings, capacidadPorTurno: parseInt(v) || 0 })} />
                <Campo label="Días de reserva anticipada" type="number"
                  value={String(settings.diasAvanzados)}
                  onChange={(v) => setSettings({ ...settings, diasAvanzados: parseInt(v) || 0 })} />
              </div>
              <button onClick={handleSaveSettings} disabled={saving} className="btn btn-ember">
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-brasa-200 p-8">
          <h2 className="font-display uppercase text-2xl text-brasa-900 mb-2">Horarios y capacidad</h2>
          <p className="font-body text-sm text-brasa-900/50 mb-6">
            Abrimos jueves a domingo. Cargá la capacidad de adentro y de terraza por turno.
            &ldquo;Cerrar&rdquo; afecta ese horario todas las semanas (no solo hoy) — para bloquear
            un día puntual, eliminá y volvé a crear el horario después.
          </p>

          <div className="bg-brasa-50 border border-brasa-200 rounded-xl p-5 mb-8">
            <h3 className="font-body font-semibold text-brasa-900 mb-3 text-sm">Agregar horario</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <select value={newDia} onChange={(e) => setNewDia(e.target.value)}
                className="border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm">
                {DIAS_SEMANA_ORDEN.map((dia) => (
                  <option key={dia} value={dia}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</option>
                ))}
              </select>
              <input type="time" value={newHora} onChange={(e) => setNewHora(e.target.value)}
                className="border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
              <button onClick={handleAddHorario} className="btn btn-line !py-2">+ Agregar</button>
            </div>
          </div>

          <div className="space-y-6">
            {[...DIAS_ABIERTOS, ...DIAS_SEMANA_ORDEN.filter((d) => !DIAS_ABIERTOS.includes(d))].map((dia) => {
              const horariosDelDia = horarios.filter((h) => h.dia === dia);
              if (horariosDelDia.length === 0) return null;

              return (
                <div key={dia} className="border border-brasa-200 rounded-xl overflow-hidden">
                  <div className="bg-brasa-100 px-4 py-2">
                    <h3 className="font-body font-semibold text-brasa-900 capitalize text-sm">{dia}</h3>
                  </div>
                  <div className="divide-y divide-brasa-100 overflow-x-auto">
                    {horariosDelDia.map((h) => (
                      <div key={h.id} className="flex items-center gap-4 p-4 min-w-[560px]">
                        <span className="font-display text-lg text-brasa-900 w-16">{h.hora}</span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-body text-brasa-900/50">🏠</span>
                          <input type="number" value={h.capacidad} min={0}
                            onChange={(e) => handleUpdateHorario(h.id, { capacidad: parseInt(e.target.value) || 0 })}
                            className="w-16 border border-brasa-200 rounded px-2 py-1 font-body text-sm" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-body text-brasa-900/50">☀️</span>
                          <input type="number" value={h.capacidadVereda} min={0}
                            onChange={(e) => handleUpdateHorario(h.id, { capacidadVereda: parseInt(e.target.value) || 0 })}
                            className="w-16 border border-brasa-200 rounded px-2 py-1 font-body text-sm" />
                        </div>

                        <label className="flex items-center gap-1.5 font-body text-xs text-brasa-900/70">
                          <input type="checkbox" checked={h.cerradoManual}
                            onChange={(e) => handleUpdateHorario(h.id, { cerradoManual: e.target.checked })} />
                          Cerrar adentro
                        </label>

                        <label className="flex items-center gap-1.5 font-body text-xs text-brasa-900/70">
                          <input type="checkbox" checked={h.cerradoVereda}
                            onChange={(e) => handleUpdateHorario(h.id, { cerradoVereda: e.target.checked })} />
                          Cerrar terraza
                        </label>

                        <button onClick={() => handleDeleteHorario(h.id)}
                          className="ml-auto text-xs font-body text-red-500 hover:text-red-700">
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="font-body text-xs font-semibold text-brasa-900/70 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm" />
    </div>
  );
}
