import { NextRequest, NextResponse } from 'next/server';
import { configuracionMail, esEmailValido, sendTestEmail } from '@/lib/email';
import { exigirAdminApi } from '@/lib/admin-guard';

/**
 * Estado de la configuración del mail. Solo dice QUÉ variables faltan y el
 * remitente; nunca devuelve valores de credenciales.
 */
export async function GET() {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;
  return NextResponse.json(configuracionMail());
}

/** Manda un mail de prueba para comprobar que las confirmaciones salen. Body: { to } */
export async function POST(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  let to: unknown;
  try {
    ({ to } = await request.json());
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const destino = typeof to === 'string' ? to.trim().toLowerCase() : '';
  if (!esEmailValido(destino)) {
    return NextResponse.json({ error: 'Ingresá un email válido.' }, { status: 400 });
  }

  const resultado = await sendTestEmail(destino);
  return NextResponse.json({ ok: resultado.ok, error: resultado.ok ? undefined : resultado.error });
}
