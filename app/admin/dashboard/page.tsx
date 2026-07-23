'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';

interface Stats {
  reservasHoy: number;
  reservasManana: number;
  totalReservas: number;
  totalPersonas: number;
  personasHoy: number;
  personasManana: number;
  adentroHoy: number;
  veredaHoy: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch((err) => console.error('Error loading stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const Tile = ({
    titulo,
    valor,
    sub,
    icono,
  }: {
    titulo: string;
    valor: number | string;
    sub?: string;
    icono: string;
  }) => (
    <div className="bg-white rounded-xl border border-brasa-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-sm text-brasa-900/60 mb-2">{titulo}</p>
          <p className="font-display text-3xl text-brasa-900">{valor}</p>
          {sub && <p className="font-body text-xs text-brasa-900/50 mt-1.5">{sub}</p>}
        </div>
        <span className="text-2xl opacity-60">{icono}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brasa-50">
      <AdminHeader />

      <main className="container-page py-12">
        <h1 className="font-display uppercase text-4xl text-brasa-900 mb-1">Dashboard</h1>
        <p className="font-body text-brasa-900/60 mb-8">Panel de Unión Carnes y Vinos</p>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brasa-200 border-t-ember-500 rounded-full animate-spin" />
          </div>
        ) : stats ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Tile titulo="Reservas hoy" valor={stats.reservasHoy} sub={`${stats.personasHoy} personas`} icono="📅" />
              <Tile titulo="Reservas mañana" valor={stats.reservasManana} sub={`${stats.personasManana} personas`} icono="🕐" />
              <Tile titulo="Total histórico" valor={stats.totalReservas} icono="📖" />
              <Tile titulo="Personas totales" valor={stats.totalPersonas} icono="👥" />
            </div>

            <div className="bg-white rounded-xl border border-brasa-200 p-6 mb-8">
              <p className="font-body text-sm text-brasa-900/60 mb-3">Reparto de hoy</p>
              <div className="flex gap-6">
                <div>
                  <p className="font-display text-2xl text-brasa-900">🏠 {stats.adentroHoy}</p>
                  <p className="font-body text-xs text-brasa-900/50">adentro</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-brasa-900">☀️ {stats.veredaHoy}</p>
                  <p className="font-body text-xs text-brasa-900/50">terraza</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-brasa-200 p-8">
              <h2 className="font-display uppercase text-2xl text-brasa-900 mb-5">Acciones rápidas</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/admin/reservas" className="btn btn-ember text-center">
                  Ver todas las reservas
                </Link>
                <Link href="/admin/settings" className="btn btn-line text-center">
                  Configurar horarios
                </Link>
              </div>
            </div>
          </>
        ) : (
          <p className="font-body text-red-600">Error al cargar estadísticas.</p>
        )}
      </main>
    </div>
  );
}
