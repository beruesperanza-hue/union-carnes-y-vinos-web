import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.ADMIN_SESSION_SECRET || 'union-carnes-y-vinos-dev-secret';

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
  return timingSafeEqual(a, b);
}
