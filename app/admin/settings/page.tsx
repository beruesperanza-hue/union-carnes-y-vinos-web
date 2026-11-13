'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

const DIAS_ABIERTOS = ['lunes', 'jueves', 'viernes', 'sábado'];

export default function SettingsPage() {
  const [horarios, setHorarios] = useState<Schedule[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHora, setNewHora] = useState('20:00');
  const [newDia, setNewDia] = useState('lunes');

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

        {settings && <ConfiguracionMail destinoInicial={settings.emailRestaurante} />}

        <CapacidadEnBloque horarios={horarios} onCambiado={loadData} />

        <div className="bg-white rounded-xl border border-brasa-200 p-8">
          <h2 className="font-display uppercase text-2xl text-brasa-900 mb-2">Horarios y capacidad</h2>
          <p className="font-body text-sm text-brasa-900/50 mb-6">
            Abrimos lunes, jueves, viernes y sábado (sábado también al mediodía). Cargá la capacidad de adentro y de terraza por turno.
            &ldquo;Cerrar&rdquo; afecta ese horario <strong>todas las semanas</strong>. Para cerrar un
            día puntual, un turno de una fecha o la terraza por lluvia, usá el{' '}
            <Link href="/admin/calendario" className="underline font-semibold">Calendario</Link>. Ahí
            también podés abrir un día especial o sumar un horario solo para una fecha.
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

/** Cambia cuántas personas entran en varios horarios de una vez (por hora, por día o ambos). */
function CapacidadEnBloque({ horarios, onCambiado }: { horarios: Schedule[]; onCambiado: () => Promise<void> }) {
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');
  const [adentro, setAdentro] = useState('');
  const [terraza, setTerraza] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);

  const horasExistentes = Array.from(new Set(horarios.map((h) => h.hora))).sort();
  const alcanza = horarios.filter((h) => (!dia || h.dia === dia) && (!hora || h.hora === hora)).length;

  const numeroValido = (v: string) => v === '' || (/^\d+$/.test(v) && Number(v) <= 500);
  const hayDato = adentro !== '' || terraza !== '';
  const valido = numeroValido(adentro) && numeroValido(terraza) && hayDato && alcanza > 0;

  const aplicar = async () => {
    const donde = `${dia ? `los ${dia}` : 'todos los días'}${hora ? ` a las ${hora}` : ', en todos los horarios'}`;
    if (!confirm(`Se cambia la capacidad de ${alcanza} horario${alcanza === 1 ? '' : 's'} (${donde}). ¿Seguimos?`)) return;
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch('/api/admin/horarios/lote', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(dia ? { dia } : {}),
          ...(hora ? { hora } : {}),
          ...(adentro !== '' ? { capacidad: Number(adentro) } : {}),
          ...(terraza !== '' ? { capacidadVereda: Number(terraza) } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje({ texto: data.error || 'No se pudo cambiar.', error: true });
      } else {
        setMensaje({ texto: `Listo: ${data.cambiados} horario${data.cambiados === 1 ? '' : 's'} actualizado${data.cambiados === 1 ? '' : 's'}. Ya lo ve el cliente.`, error: false });
        setAdentro('');
        setTerraza('');
        await onCambiado();
      }
    } finally {
      setGuardando(false);
    }
  };

  const selectCls = 'w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm bg-white';
  return (
    <div className="bg-white rounded-xl border border-brasa-200 p-8 mb-8">
      <h2 className="font-display uppercase text-2xl text-brasa-900 mb-2">Cuántos entran, en bloque</h2>
      <p className="font-body text-sm text-brasa-900/50 mb-5">
        Cambiá de una vez la capacidad (en personas) de una hora en todos los días, de un día entero o de todo.
        Lo que dejes vacío no se toca. Al cliente le aparece &ldquo;Quedan N lugares&rdquo; cuando quedan pocos y
        &ldquo;Lleno&rdquo; cuando no hay. Para cambiar una fecha puntual, usá el{' '}
        <Link href="/admin/calendario" className="underline font-semibold">Calendario</Link>.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="font-body text-xs font-semibold text-brasa-900/70">
          Día
          <select value={dia} onChange={(e) => setDia(e.target.value)} className={`${selectCls} mt-1.5`}>
            <option value="">Todos los días</option>
            {DIAS_SEMANA_ORDEN.filter((d) => horarios.some((h) => h.dia === d)).map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </label>
        <label className="font-body text-xs font-semibold text-brasa-900/70">
          Hora
          <select value={hora} onChange={(e) => setHora(e.target.value)} className={`${selectCls} mt-1.5`}>
            <option value="">Todas las horas</option>
            {horasExistentes.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label className="font-body text-xs font-semibold text-brasa-900/70">
          🏠 Adentro (personas)
          <input type="number" min={0} max={500} inputMode="numeric" value={adentro} placeholder="No cambiar"
            onChange={(e) => setAdentro(e.target.value)} className={`${selectCls} mt-1.5`} />
        </label>
        <label className="font-body text-xs font-semibold text-brasa-900/70">
          ☀️ Terraza (personas)
          <input type="number" min={0} max={500} inputMode="numeric" value={terraza} placeholder="No cambiar"
            onChange={(e) => setTerraza(e.target.value)} className={`${selectCls} mt-1.5`} />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button onClick={aplicar} disabled={guardando || !valido} className="btn btn-ember disabled:opacity-40">
          {guardando ? 'Aplicando…' : 'Aplicar'}
        </button>
        <span className="font-body text-sm text-brasa-900/60">
          {alcanza === 0 ? 'No hay horarios con ese día y hora.' : `Alcanza a ${alcanza} horario${alcanza === 1 ? '' : 's'}.`}
        </span>
        {mensaje && (
          <span className={`font-body text-sm font-semibold ${mensaje.error ? 'text-red-700' : 'text-green-700'}`}>
            {mensaje.texto}
          </span>
        )}
      </div>
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

interface EstadoMail {
  configurado: boolean;
  faltan: string[];
  remitente: string;
  dryRun: boolean;
}

/** Comprueba que los mails de confirmación salen y permite mandarse uno de prueba. */
function ConfiguracionMail({ destinoInicial }: { destinoInicial: string }) {
  const [estado, setEstado] = useState<EstadoMail | null>(null);
  const [para, setPara] = useState(destinoInicial);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/mail')
      .then((r) => r.json())
      .then(setEstado)
      .catch(() => setEstado(null));
  }, []);

  const probar = async () => {
    setEnviando(true);
    setResultado(null);
    try {
      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: para }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setResultado({ ok: true, texto: `Mail enviado a ${para}. Revisá la bandeja (y spam).` });
      } else {
        setResultado({ ok: false, texto: data.error || 'No se pudo enviar el mail de prueba.' });
      }
    } catch {
      setResultado({ ok: false, texto: 'Sin conexión con el servidor.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-brasa-200 p-8 mb-8">
      <h2 className="font-display uppercase text-2xl text-brasa-900 mb-2">Mail de confirmaciones</h2>
      <p className="font-body text-sm text-brasa-900/50 mb-5">
        Cada reserva hecha desde la web le manda un mail de confirmación al cliente. Si alguno no sale,
        aparece un aviso en las pantallas y en la lista de reservas, con botón para reenviarlo.
      </p>

      {estado === null ? (
        <p className="font-body text-sm text-brasa-900/50">Comprobando…</p>
      ) : estado.configurado || estado.dryRun ? (
        <p className="font-body text-sm text-green-700 mb-5">
          ✅ Configurado. Los mails salen desde <strong>{estado.remitente}</strong>.
          {estado.dryRun && ' (Modo de prueba: no se envían de verdad.)'}
        </p>
      ) : (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 font-body text-sm text-red-800">
          <p className="font-semibold">❌ Los mails no pueden salir: faltan datos en el servidor.</p>
          <p className="mt-1">
            Variables sin cargar en Railway: <code className="font-mono">{estado.faltan.join(', ')}</code>
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <label className="font-body text-xs font-semibold text-brasa-900/70">
          Mandar un mail de prueba a
          <input
            type="email"
            value={para}
            onChange={(e) => setPara(e.target.value)}
            className="mt-1.5 w-full border border-brasa-200 rounded-lg px-3 py-2 font-body text-sm font-normal"
          />
        </label>
        <button onClick={probar} disabled={enviando || !para} className="btn btn-ember !py-2.5 disabled:opacity-50">
          {enviando ? 'Enviando…' : 'Enviar prueba'}
        </button>
      </div>

      {resultado && (
        <p className={`mt-3 font-body text-sm ${resultado.ok ? 'text-green-700' : 'text-red-700'}`}>
          {resultado.ok ? '✅ ' : '❌ '}
          {resultado.texto}
        </p>
      )}

      <details className="mt-5 font-body text-sm text-brasa-900/70">
        <summary className="cursor-pointer font-semibold text-brasa-900">Si dejaron de llegar los mails</summary>
        <div className="mt-3 space-y-2">
          <p>
            Lo más común es el error <code className="font-mono">invalid_grant</code>: el permiso de
            Gmail se venció. Pasa cuando la app de Google quedó en modo &ldquo;Prueba&rdquo; (el permiso
            dura 7 días). La solución:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              En Google Cloud Console, en la pantalla de consentimiento de OAuth, pasá la app a{' '}
              <strong>&ldquo;En producción&rdquo;</strong>.
            </li>
            <li>
              Generá un nuevo token en{' '}
              <a className="underline" href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer">
                OAuth Playground
              </a>{' '}
              (con &ldquo;Use your own OAuth credentials&rdquo; y el permiso <code className="font-mono">gmail.send</code>).
            </li>
            <li>
              Pegalo en Railway como <code className="font-mono">GMAIL_REFRESH_TOKEN</code>, esperá el
              redeploy y mandá otra prueba desde acá.
            </li>
          </ol>
        </div>
      </details>
    </div>
  );
}
