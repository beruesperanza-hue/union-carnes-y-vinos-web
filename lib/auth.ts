import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.ADMIN_SESSION_SECRET || 'union-carnes-y-vinos-dev-secret';

const VIDA_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

function sign(value: string): string {
  return createHmac('sha256', SECRET).update(value).digest('hex');
}

export function crearToken(username: string): string {
  const payload = `${username}.${Date.now()}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function verificarToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payloadB64, firma] = token.split('.');
  if (!payloadB64 || !firma) return false;

  const payload = Buffer.from(payloadB64, 'base64url').toString('utf-8');
  const firmaEsperada = sign(payload);

  const a = Buffer.from(firma);
  const b = Buffer.from(firmaEsperada);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  // El payload es `usuario.timestamp`. La cookie vence a los 7 días, pero eso
  // lo controla el navegador; acá se valida del lado del servidor.
  const emitidoEn = Number(payload.slice(payload.lastIndexOf('.') + 1));
  if (!Number.isFinite(emitidoEn)) return false;
  const edad = Date.now() - emitidoEn;
  return edad >= -60_000 && edad <= VIDA_TOKEN_MS;
}
