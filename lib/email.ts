import { google } from 'googleapis';
import { NEGOCIO, UBICACIONES, UBICACIONES_LABEL } from '@/lib/constants';

// Gmail API vía OAuth2 (usa HTTPS, no SMTP → funciona en Railway).
// Mismo patrón que La Esperanza. Variables en Railway: GMAIL_CLIENT_ID,
// GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN (+ EMAIL_FROM opcional).
//
// Un fallo de envío NUNCA rompe la reserva, pero tampoco se pierde en silencio:
// enviarMail devuelve el resultado, quien llama lo guarda en la reserva
// (Reservation.emailEstado) y el panel lo muestra con opción de reenviar.
// EMAIL_DRY_RUN=1 registra el mail en el log en vez de enviarlo (desarrollo).
const FROM = process.env.EMAIL_FROM || NEGOCIO.emailLegacy;

const VARIABLES_GMAIL = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'] as const;
const TIMEOUT_ENVIO_MS = 10_000;
const ESPERA_REINTENTO_MS = 1_500;

const LOGO_URL = `${NEGOCIO.sitio}/fotos/hero-entrana.jpg`;
const WHATSAPP_URL = `${NEGOCIO.whatsappUrl}`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export interface ResultadoMail {
  ok: boolean;
  /** Motivo en castellano, apto para mostrarle a quien administra. */
  error?: string;
  /** No había a quién enviarle (reserva cargada sin email). */
  omitido?: boolean;
}

/** Dirección razonable y sin saltos de línea (evita inyectar cabeceras en el mail). */
export function esEmailValido(valor: unknown): valor is string {
  return (
    typeof valor === 'string' &&
    valor.length <= 254 &&
    /^[^\s@<>",;:\\]+@[^\s@<>",;:\\]+\.[^\s@<>",;:\\]{2,}$/.test(valor)
  );
}

/** Texto que viene del cliente, antes de meterlo en el HTML del mail. */
function esc(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function configuracionMail(): { configurado: boolean; faltan: string[]; remitente: string; dryRun: boolean } {
  const faltan = VARIABLES_GMAIL.filter((v) => !process.env[v]);
  return {
    configurado: faltan.length === 0,
    faltan: [...faltan],
    remitente: FROM,
    dryRun: process.env.EMAIL_DRY_RUN === '1',
  };
}

/** Traduce el error de Gmail/Google a algo que se pueda accionar. */
function describirError(error: unknown): { mensaje: string; reintentable: boolean } {
  const e = error as { message?: string; code?: number | string; status?: number; response?: { status?: number; data?: { error?: string; error_description?: string } } };
  const texto = `${e?.message ?? ''} ${e?.response?.data?.error ?? ''} ${e?.response?.data?.error_description ?? ''}`;
  const status = e?.response?.status ?? e?.status ?? (typeof e?.code === 'number' ? e.code : undefined);
  const codigo = typeof e?.code === 'string' ? e.code : '';

  if (/invalid_grant/i.test(texto)) {
    return {
      mensaje: 'Google rechazó el permiso de envío (invalid_grant): el token de Gmail venció o fue revocado. Hay que generar uno nuevo.',
      reintentable: false,
    };
  }
  if (/invalid_client|unauthorized_client/i.test(texto)) {
    return { mensaje: 'Client ID o Client Secret de Gmail incorrectos.', reintentable: false };
  }
  if (status === 401 || status === 403) {
    return { mensaje: 'Gmail rechazó el envío: falta permiso (scope gmail.send) o la cuenta bloqueó el acceso.', reintentable: false };
  }
  if (status === 429) {
    return { mensaje: 'Se alcanzó el límite diario de envíos de Gmail.', reintentable: false };
  }
  if (/ETIMEDOUT|ECONNRESET|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|timeout|socket hang up/i.test(`${texto} ${codigo}`)) {
    return { mensaje: 'No se pudo conectar con Gmail (red o tiempo de espera agotado).', reintentable: true };
  }
  if (status && status >= 500) {
    return { mensaje: `Gmail tuvo un error temporal (${status}).`, reintentable: true };
  }
  return { mensaje: (e?.message || 'Error desconocido al enviar').slice(0, 160), reintentable: false };
}

// RFC 2047 encoded-word — necesario para cualquier header con tildes/ñ
// (Subject y el nombre visible del remitente), si no el cliente de mail
// puede mostrarlo mal codificado (ej. "Unión" -> "UniÃ³n").
function encodeWord(texto: string): string {
  return `=?UTF-8?B?${Buffer.from(texto).toString('base64')}?=`;
}

function base64Body(text: string): string {
  return (Buffer.from(text, 'utf-8').toString('base64').match(/.{1,76}/g) || []).join('\r\n');
}

function buildRawMessage(to: string, subject: string, html: string, text: string): string {
  const boundary = `union_${Date.now().toString(36)}`;

  const message = [
    `From: ${encodeWord(NEGOCIO.nombre)} <${FROM}>`,
    `To: ${to}`,
    `Subject: ${encodeWord(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(text),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(html),
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function enviarMail(to: string, subject: string, html: string, text: string): Promise<ResultadoMail> {
  if (to.includes('sin-email.union')) return { ok: true, omitido: true }; // walk-in sin email real

  // Defensa en profundidad: aunque la validación se haga antes, un salto de línea acá
  // permitiría agregar cabeceras (Bcc:, etc.) al mail que sale de la casilla del local.
  if (!esEmailValido(to)) return { ok: false, error: 'La dirección de email no es válida.' };

  const config = configuracionMail();
  if (config.dryRun) {
    console.log(`✉️  [EMAIL_DRY_RUN] a ${to} · asunto: ${subject}`);
    return { ok: true };
  }
  if (!config.configurado) {
    const error = `Faltan variables de Gmail en el servidor: ${config.faltan.join(', ')}.`;
    console.error('❌ EMAIL NO ENVIADO:', error);
    return { ok: false, error };
  }

  let ultimo = 'Error desconocido al enviar';
  for (let intento = 1; intento <= 2; intento++) {
    try {
      const res = await gmail.users.messages.send(
        { userId: 'me', requestBody: { raw: buildRawMessage(to, subject, html, text) } },
        { timeout: TIMEOUT_ENVIO_MS }
      );
      console.log('✅ EMAIL ENVIADO A:', to, '- id:', res.data.id);
      return { ok: true };
    } catch (error) {
      const { mensaje, reintentable } = describirError(error);
      ultimo = mensaje;
      console.error(`❌ ERROR AL ENVIAR EMAIL (intento ${intento}/2):`, mensaje, error);
      if (!reintentable || intento === 2) break;
      await espera(ESPERA_REINTENTO_MS);
    }
  }
  return { ok: false, error: ultimo };
}

function boton(href: string, label: string, bg: string, color = '#ffffff'): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td align="center" bgcolor="${bg}" style="border-radius:6px;">
          <a href="${href}" target="_blank"
             style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;color:${color};text-decoration:none;border-radius:6px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

function layout(preheader: string, titulo: string, contenido: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background-color:#FBF6EC;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FBF6EC;">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:600px;background-color:#ffffff;border-radius:10px;overflow:hidden;">

          <tr>
            <td align="center" style="background-color:#17130F;padding:36px 24px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#C9A45C;text-transform:uppercase;">Desde 2019</p>
              <p style="margin:4px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:32px;font-weight:900;color:#F3E7CE;text-transform:uppercase;letter-spacing:1px;">
                Unión <span style="color:#C9A45C;font-size:20px;">Carnes &amp; Vinos</span>
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="background-color:#722F37;padding:16px 24px;">
              <h1 style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:24px;letter-spacing:2px;text-transform:uppercase;color:#D9B876;font-weight:bold;">
                ${titulo}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 8px 32px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#2b2b2b;">
              ${contenido}
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    ${boton(WHATSAPP_URL, '💬 Escribinos por WhatsApp', '#25D366')}
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    ${boton(NEGOCIO.mapsUrl, '📍 Cómo llegar', '#17130F')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#17130F;padding:28px 32px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#F3E7CE;" align="center">
              <p style="margin:0 0 6px 0;">
                <a href="${NEGOCIO.mapsUrl}" target="_blank" style="color:#ffffff;text-decoration:underline;">
                  ${NEGOCIO.direccion.calle}, ${NEGOCIO.direccion.localidad}
                </a>
              </p>
              <p style="margin:0 0 6px 0;">
                WhatsApp:
                <a href="${WHATSAPP_URL}" target="_blank" style="color:#ffffff;text-decoration:underline;">
                  ${NEGOCIO.telefonoDisplay}
                </a>
              </p>
              <p style="margin:0 0 6px 0;">
                <a href="${NEGOCIO.instagramUrl}" target="_blank" style="color:#ffffff;text-decoration:underline;">
                  ${NEGOCIO.instagramUser}
                </a>
              </p>
              <p style="margin:16px 0 0 0;font-size:11px;color:#8a7a63;">
                Unión Carnes y Vinos · Desde 2019
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

const PIE_TEXTO = [
  `WhatsApp: ${NEGOCIO.telefonoDisplay} → ${WHATSAPP_URL}`,
  `Cómo llegar: ${NEGOCIO.mapsUrl}`,
  `Dirección: ${NEGOCIO.direccion.calle}, ${NEGOCIO.direccion.localidad}`,
  `Instagram: ${NEGOCIO.instagramUser}`,
  '',
  'Unión Carnes y Vinos · Desde 2019',
].join('\n');

export async function sendReservationConfirmation(
  email: string,
  nombre: string,
  fecha: string,
  hora: string,
  personas: number,
  telefono: string,
  ubicacion: string = UBICACIONES.ADENTRO
): Promise<ResultadoMail> {
  const ubicacionLabel = UBICACIONES_LABEL[ubicacion] || UBICACIONES_LABEL[UBICACIONES.ADENTRO];

  const fila = (label: string, valor: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#8a7a63;">${label}</td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#17130F;font-weight:bold;">${valor}</td>
    </tr>`;

  const contenido = `
    <p style="margin:0 0 16px 0;">Hola <strong>${esc(nombre)}</strong>,</p>
    <p style="margin:0 0 24px 0;">¡Tu mesa quedó reservada! Estos son los datos:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${fila('Fecha', fecha)}
      ${fila('Hora', hora)}
      ${fila('Personas', String(personas))}
      ${fila('Mesa', ubicacionLabel)}
      ${fila('Teléfono', esc(telefono))}
    </table>

    ${
      ubicacion === UBICACIONES.VEREDA
        ? `<p style="margin:0 0 16px 0;font-size:14px;color:#8a7a63;">La terraza depende del clima. Si llueve, te reubicamos adentro.</p>`
        : ''
    }

    <p style="margin:0 0 8px 0;">Si necesitás cambiar o cancelar la reserva, escribinos por WhatsApp.</p>
    <p style="margin:0 0 8px 0;">¡Te esperamos! 🔥</p>
  `;

  const texto = [
    `Hola ${nombre},`,
    '',
    '¡Tu reserva en Unión Carnes y Vinos está confirmada!',
    '',
    `Fecha: ${fecha}`,
    `Hora: ${hora}`,
    `Personas: ${personas}`,
    `Mesa: ${ubicacionLabel}`,
    `Teléfono: ${telefono}`,
    '',
    'Si necesitás cambiar o cancelar la reserva, escribinos por WhatsApp.',
    '',
    PIE_TEXTO,
  ].join('\n');

  return enviarMail(
    email,
    // La fecha en el asunto: se encuentra en la bandeja y no se agrupa con otras reservas.
    `Reserva confirmada: ${fecha}, ${hora} · Unión Carnes y Vinos`,
    layout(`Reserva confirmada para el ${fecha} a las ${hora}.`, 'Reserva confirmada', contenido),
    texto
  );
}

export interface ReservaParaAviso {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  personas: number;
  fecha: string;
  hora: string;
  ubicacion: string;
  comentarios?: string | null;
  origen: string;
  /** true = grupo grande: queda pendiente y hay que confirmarla desde el panel. */
  pendiente?: boolean;
}

/** Aviso interno al local: entró una reserva nueva (web o bot). */
export async function sendNewReservationAlert(r: ReservaParaAviso): Promise<ResultadoMail> {
  const ubicacionLabel = UBICACIONES_LABEL[r.ubicacion] || UBICACIONES_LABEL[UBICACIONES.ADENTRO];
  const cliente = `${r.nombre} ${r.apellido}`.trim();
  const sinEmailReal = r.email.includes('sin-email.union');
  const origenLabel = r.origen === 'bot' ? 'asistente de Telegram' : 'la web';

  const fila = (label: string, valor: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#8a7a63;">${label}</td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#17130F;font-weight:bold;">${valor}</td>
    </tr>`;

  const contenido = `
    <p style="margin:0 0 ${r.pendiente ? '12px' : '24px'} 0;">Entró una reserva desde ${origenLabel}:</p>
    ${
      r.pendiente
        ? `<p style="margin:0 0 24px 0;padding:12px 16px;background:#FDE8D8;border-left:4px solid #BC3E11;font-weight:bold;">⚠ Es un grupo de ${r.personas} personas: hay que CONFIRMARLA desde el panel (Reservas → Pendientes). El cliente todavía no recibió confirmación.</p>`
        : ''
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${fila('Cliente', esc(cliente))}
      ${fila('Fecha', esc(r.fecha))}
      ${fila('Hora', esc(r.hora))}
      ${fila('Personas', String(r.personas))}
      ${fila('Mesa', ubicacionLabel)}
      ${fila('Teléfono', esc(r.telefono))}
      ${sinEmailReal ? '' : fila('Email', esc(r.email))}
      ${r.comentarios ? fila('Comentarios', esc(r.comentarios)) : ''}
    </table>
  `;

  const texto = [
    `Entró una reserva desde ${origenLabel}:`,
    ...(r.pendiente ? ['⚠ GRUPO GRANDE: hay que CONFIRMARLA desde el panel (Reservas → Pendientes).'] : []),
    '',
    `Cliente: ${cliente}`,
    `Fecha: ${r.fecha}`,
    `Hora: ${r.hora}`,
    `Personas: ${r.personas}`,
    `Mesa: ${ubicacionLabel}`,
    `Teléfono: ${r.telefono}`,
    ...(sinEmailReal ? [] : [`Email: ${r.email}`]),
    ...(r.comentarios ? [`Comentarios: ${r.comentarios}`] : []),
  ].join('\n');

  return enviarMail(
    NEGOCIO.emailAvisos,
    `${r.pendiente ? 'ENTRÓ NUEVA RESERVA — CONFIRMAR' : 'ENTRÓ NUEVA RESERVA'}: ${r.fecha}, ${r.hora} · ${r.personas} pers. · ${cliente}`.replace(/[\r\n]+/g, ' '),
    layout(esc(`Nueva reserva de ${cliente} para el ${r.fecha} a las ${r.hora}.`), r.pendiente ? 'Reserva por confirmar' : 'Entró nueva reserva', contenido),
    texto
  );
}

/** Cliente: recibimos tu solicitud de un grupo grande, la confirmamos a la brevedad. */
export async function sendReservationRequestReceived(
  email: string,
  nombre: string,
  fecha: string,
  hora: string,
  personas: number,
  telefono: string,
  ubicacion: string = UBICACIONES.ADENTRO
): Promise<ResultadoMail> {
  const ubicacionLabel = UBICACIONES_LABEL[ubicacion] || UBICACIONES_LABEL[UBICACIONES.ADENTRO];

  const fila = (label: string, valor: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#8a7a63;">${label}</td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#17130F;font-weight:bold;">${valor}</td>
    </tr>`;

  const contenido = `
    <p style="margin:0 0 16px 0;">Hola <strong>${esc(nombre)}</strong>,</p>
    <p style="margin:0 0 24px 0;">Recibimos tu solicitud de reserva. Por ser un grupo de ${personas} personas, <strong>la confirmamos nosotros</strong>: te escribimos a la brevedad.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${fila('Fecha', fecha)}
      ${fila('Hora', hora)}
      ${fila('Personas', String(personas))}
      ${fila('Mesa', ubicacionLabel)}
      ${fila('Teléfono', esc(telefono))}
    </table>

    <p style="margin:0 0 8px 0;"><strong>Todavía no es una reserva confirmada.</strong> Si necesitás una respuesta urgente, escribinos por WhatsApp.</p>
  `;

  const texto = [
    `Hola ${nombre},`,
    '',
    `Recibimos tu solicitud de reserva. Por ser un grupo de ${personas} personas, la confirmamos nosotros: te escribimos a la brevedad.`,
    '',
    `Fecha: ${fecha}`,
    `Hora: ${hora}`,
    `Personas: ${personas}`,
    `Mesa: ${ubicacionLabel}`,
    `Teléfono: ${telefono}`,
    '',
    'Todavía no es una reserva confirmada. Si necesitás una respuesta urgente, escribinos por WhatsApp.',
    '',
    PIE_TEXTO,
  ].join('\n');

  return enviarMail(
    email,
    `Recibimos tu solicitud de reserva: ${fecha}, ${hora} · Unión Carnes y Vinos`,
    layout(`Recibimos tu solicitud para el ${fecha} a las ${hora}. Te confirmamos a la brevedad.`, 'Solicitud recibida', contenido),
    texto
  );
}

/** Cliente: no pudimos confirmar el grupo para ese día/horario. */
export async function sendReservationRejected(
  email: string,
  nombre: string,
  fecha: string,
  hora: string
): Promise<ResultadoMail> {
  const contenido = `
    <p style="margin:0 0 16px 0;">Hola <strong>${esc(nombre)}</strong>,</p>
    <p style="margin:0 0 16px 0;">Lamentablemente <strong>no pudimos confirmar tu reserva</strong> para el ${esc(fecha)} a las ${esc(hora)}.</p>
    <p style="margin:0 0 8px 0;">Escribinos por WhatsApp y buscamos juntos otro día u horario para tu grupo.</p>
  `;

  const texto = [
    `Hola ${nombre},`,
    '',
    `Lamentablemente no pudimos confirmar tu reserva para el ${fecha} a las ${hora}.`,
    'Escribinos por WhatsApp y buscamos juntos otro día u horario para tu grupo.',
    '',
    PIE_TEXTO,
  ].join('\n');

  return enviarMail(
    email,
    'No pudimos confirmar tu reserva · Unión Carnes y Vinos',
    layout('No pudimos confirmar tu reserva.', 'Reserva no confirmada', contenido),
    texto
  );
}

export async function sendReservationCancellation(email: string, nombre?: string): Promise<ResultadoMail> {
  const saludo = nombre ? `Hola <strong>${esc(nombre)}</strong>,` : 'Hola,';

  const contenido = `
    <p style="margin:0 0 16px 0;">${saludo}</p>
    <p style="margin:0 0 16px 0;">Tu reserva en Unión fue cancelada.</p>
    <p style="margin:0 0 8px 0;">Si fue un error o querés reservar para otro día, escribinos por WhatsApp.</p>
  `;

  const texto = [
    nombre ? `Hola ${nombre},` : 'Hola,',
    '',
    'Tu reserva en Unión Carnes y Vinos fue cancelada.',
    'Si fue un error o querés reservar para otro día, escribinos por WhatsApp.',
    '',
    PIE_TEXTO,
  ].join('\n');

  return enviarMail(
    email,
    'Cancelación de tu reserva en Unión Carnes y Vinos',
    layout('Tu reserva fue cancelada.', 'Reserva cancelada', contenido),
    texto
  );
}

/** Para el botón "Enviar mail de prueba" de Configuración. */
export async function sendTestEmail(to: string): Promise<ResultadoMail> {
  const contenido = `
    <p style="margin:0 0 16px 0;">Este es un mail de prueba del sistema de reservas.</p>
    <p style="margin:0 0 8px 0;">Si lo estás leyendo, <strong>las confirmaciones de reserva están saliendo bien</strong>. ✅</p>
  `;
  const texto = [
    'Este es un mail de prueba del sistema de reservas.',
    'Si lo estás leyendo, las confirmaciones de reserva están saliendo bien.',
    '',
    PIE_TEXTO,
  ].join('\n');
  return enviarMail(
    to,
    'Prueba de mail · Unión Carnes y Vinos',
    layout('Prueba del sistema de reservas.', 'Mail de prueba', contenido),
    texto
  );
}
