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
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="font-display uppercase text-xl">Unión</span>
          <span className="text-[10px] bg-brasa-800 px-2 py-1 rounded uppercase tracking-wide">Admin</span>
        </Link>

        <nav className="flex items-center gap-5 font-body text-sm">
          <Link href="/admin/dashboard" className="hover:text-ember-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/reservas" className="hover:text-ember-400 transition-colors">
            Reservas
          </Link>
          <Link href="/admin/settings" className="hover:text-ember-400 transition-colors">
            ⚙️ Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 pl-4 border-l border-brasa-800 hover:text-ember-400 transition-colors"
          >
            🚪 Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
