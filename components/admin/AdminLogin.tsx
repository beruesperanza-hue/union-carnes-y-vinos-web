'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        document.cookie = `admin_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brasa-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-brasa-100 rounded-full p-4 mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="font-display uppercase text-3xl text-brasa-100">Unión</h1>
          <p className="text-brasa-400 font-body">Panel de administración</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800 rounded-lg">
            <p className="text-red-300 text-sm font-body">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-brasa-50 rounded-xl shadow-lg p-8 space-y-5">
          <div>
            <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="font-body text-sm font-semibold text-brasa-900 block mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-brasa-200 rounded-lg px-4 py-2.5 font-body"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-ember w-full">
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
