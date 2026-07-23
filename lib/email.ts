import { google } from 'googleapis';
import { NEGOCIO, UBICACIONES, UBICACIONES_LABEL } from '@/lib/constants';

// Gmail API vía OAuth2 (usa HTTPS, no SMTP → funciona en Railway).
// Mismo patrón que La Esperanza. Hasta que se configuren las credenciales
// (GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN en Railway), el envío falla
// silenciosamente (se loguea el error) sin romper la reserva.
const FROM = process.env.EMAIL_FROM || NEGOCIO.emailLegacy;

const LOGO_URL = `${NEGOCIO.sitio}/fotos/hero-entrana.jpg`;
const WHATSAPP_URL = `${NEGOCIO.whatsappUrl}`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

function encodeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
}

function base64Body(text: string): string {
  return (Buffer.from(text, 'utf-8').toString('base64').match(/.{1,76}/g) || []).join('\r\n');
}

function buildRawMessage(to: string, subject: string, html: string, text: string): string {
  const boundary = `union_${Date.now().toString(36)}`;

  const message = [
    `From: ${NEGOCIO.nombre} <${FROM}>`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
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

async function enviarMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (to.includes('sin-email.union')) return true; // walk-in sin email real, no hay a quién mandarle

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: buildRawMessage(to, subject, html, text) },
    });
    console.log('✅ EMAIL ENVIADO A:', to, '- id:', res.data.id);
    return true;
  } catch (error) {
    console.error('❌ ERROR AL ENVIAR EMAIL (¿configuraste GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN?):', error);
    return false;
  }
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
) {
  const ubicacionLabel = UBICACIONES_LABEL[ubicacion] || UBICACIONES_LABEL[UBICACIONES.ADENTRO];

  const fila = (label: string, valor: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#8a7a63;">${label}</td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #F3E7CE;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#17130F;font-weight:bold;">${valor}</td>
    </tr>`;

  const contenido = `
    <p style="margin:0 0 16px 0;">Hola <strong>${nombre}</strong>,</p>
    <p style="margin:0 0 24px 0;">¡Tu mesa quedó reservada! Estos son los datos:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${fila('Fecha', fecha)}
      ${fila('Hora', hora)}
      ${fila('Personas', String(personas))}
      ${fila('Mesa', ubicacionLabel)}
      ${fila('Teléfono', telefono)}
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
    'Confirmación de tu reserva en Unión Carnes y Vinos',
    layout(`Reserva confirmada para el ${fecha} a las ${hora}.`, 'Reserva confirmada', contenido),
    texto
  );
}

export async function sendReservationCancellation(email: string, nombre?: string) {
  const saludo = nombre ? `Hola <strong>${nombre}</strong>,` : 'Hola,';

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
