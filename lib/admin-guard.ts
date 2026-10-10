import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { verificarToken } from '@/lib/auth';

export async function adminAutenticado(): Promise<boolean> {
  const store = await cookies();
  return verificarToken(store.get('admin_token')?.value);
}

/**
 * Para route handlers de /api/admin/*. Devuelve una respuesta 401 si no hay
 * sesión válida, o null si se puede continuar:
 *
 *   const sinSesion = await exigirAdminApi();
 *   if (sinSesion) return sinSesion;
 */
export async function exigirAdminApi(): Promise<NextResponse | null> {
  if (await adminAutenticado()) return null;
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

/** Para layouts/páginas del panel: sin sesión válida manda al login. */
export async function exigirAdminPagina(): Promise<void> {
  if (!(await adminAutenticado())) redirect('/admin');
}
