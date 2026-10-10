'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/admin');
    router.refresh();
  };

  return (
    <header className="bg-brasa-950 text-brasa-100 sticky top-0 z-50 shadow-lg">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 min-h-16 py-2">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="font-display uppercase text-xl">Unión</span>
          <span className="text-[10px] bg-brasa-800 px-2 py-1 rounded uppercase tracking-wide">Admin</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5 font-body text-sm">
          <Link href="/admin/dashboard" className="hover:text-ember-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/calendario" className="hover:text-ember-400 transition-colors">
            Calendario
          </Link>
          <Link href="/admin/reservas" className="hover:text-ember-400 transition-colors">
            Reservas
          </Link>
          <Link href="/admin/settings" className="hover:text-ember-400 transition-colors">
            ⚙️ Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="sm:ml-2 sm:pl-4 sm:border-l border-brasa-800 hover:text-ember-400 transition-colors"
          >
            🚪 Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
