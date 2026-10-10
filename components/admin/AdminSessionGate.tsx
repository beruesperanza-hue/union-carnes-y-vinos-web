import { exigirAdminPagina } from '@/lib/admin-guard';

/**
 * Layout de servidor para las páginas del panel: sin sesión válida redirige
 * al login antes de renderizar nada. Las páginas en sí son client components,
 * así que el chequeo vive acá.
 */
export default async function AdminSessionGate({ children }: { children: React.ReactNode }) {
  await exigirAdminPagina();
  return <>{children}</>;
}
