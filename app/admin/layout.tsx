import NotificadorReservas from '@/components/admin/NotificadorReservas';

// Un único layout para todo el panel: el avisador queda montado mientras se
// navega entre Dashboard, Calendario, Reservas y Configuración.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NotificadorReservas />
    </>
  );
}
