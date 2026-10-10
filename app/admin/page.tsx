import { redirect } from 'next/navigation';
import AdminLogin from '@/components/admin/AdminLogin';
import { adminAutenticado } from '@/lib/admin-guard';

export const metadata = {
  title: 'Admin - Unión Carnes y Vinos',
  robots: 'noindex, nofollow',
};

export default async function AdminPage() {
  // Se valida la firma y el vencimiento, no solo que la cookie exista:
  // una cookie vieja o inventada debe mostrar el login, no el panel.
  if (await adminAutenticado()) {
    redirect('/admin/dashboard');
  }

  return <AdminLogin />;
}
