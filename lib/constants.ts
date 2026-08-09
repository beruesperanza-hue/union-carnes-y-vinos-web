// Datos maestros (NAP) — un único bloque de verdad, usado en toda la web y
// en el JSON-LD. Coinciden con la auditoría SEO/GEO (jul-2026): dirección,
// teléfono y coordenadas verificados en TheFork/Tripadvisor.
export const NEGOCIO = {
  nombre: 'Unión Carnes y Vinos',
  nombreCorto: 'Unión',
  alternateName: 'Bar Unión',
  eslogan: 'Parrilla argentina en Ruzafa · Desde 2019',
  descripcion:
    'Restaurante parrilla argentina en Ruzafa, Valencia. Entraña, carnes premium a la brasa, empanadas caseras y vinos Malbec. Bodegón argentino desde 2019. Reservas online.',
  fundacion: '2019-08',

  direccion: {
    calle: 'Carrer de Puerto Rico, 38',
    localidad: 'València',
    barrio: 'Russafa',
    cp: '46006',
    region: 'Comunitat Valenciana',
    pais: 'ES',
  },
  // Aproximadas al nº38 de Puerto Rico — confirmar con el pin real de Maps.
  geo: { lat: 39.4614, lng: -0.3721 },

  telefono: '+34619240402',
  telefonoDisplay: '+34 619 24 04 02',
  email: 'hola@unioncarnesyvinos.com',
  emailLegacy: 'barunionruzafa@gmail.com',

  sitio: process.env.NEXT_PUBLIC_SITE_URL || 'https://unioncarnesyvinos.com',

  whatsappUrl:
    'https://wa.me/34619240402?text=' +
    encodeURIComponent('Hola! Quería consultar por una reserva en Unión Carnes y Vinos.'),
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Carrer+de+Puerto+Rico+38%2C+46006+Valencia',
  theforkUrl: 'https://www.thefork.es/restaurante/union-carnes-y-vinos-r543885',
  instagramUrl: 'https://www.instagram.com/union_carnesyvinos/',
  instagramUser: '@union_carnesyvinos',
  tripadvisorUrl:
    'https://www.tripadvisor.com/Restaurant_Review-g187529-d18901675-Reviews-Union_Carnes_Y_Vinos-Valencia_Province_of_Valencia_Valencian_Community.html',

  // Horario real (corregido jul-2026): cenas de jueves a domingo, mismo horario los 4 días.
  horario: [
    { dia: 'Lunes', horas: 'Cerrado' },
    { dia: 'Martes', horas: 'Cerrado' },
    { dia: 'Miércoles', horas: 'Cerrado' },
    { dia: 'Jueves', horas: '19:30–23:30' },
    { dia: 'Viernes', horas: '19:30–23:30' },
    { dia: 'Sábado', horas: '19:30–23:30' },
    { dia: 'Domingo', horas: '19:30–23:30' },
  ],
  // Formato schema.org openingHoursSpecification (día ISO corto).
  horarioSchema: [
    { dias: ['Thursday', 'Friday', 'Saturday', 'Sunday'], abre: '19:30', cierra: '23:30' },
  ],

  precioMedio: '20 €',
  rangoPrecios: '€€',
};

export const DIAS_SEMANA_ORDEN = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
];

export const DIA_NUMERO_A_NOMBRE: Record<number, string> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábado',
};

// Dónde quiere sentarse el cliente: adentro o en la terraza de la calle.
export const UBICACIONES = {
  ADENTRO: 'adentro',
  VEREDA: 'vereda',
} as const;

export const UBICACIONES_LABEL: Record<string, string> = {
  [UBICACIONES.ADENTRO]: 'Adentro',
  [UBICACIONES.VEREDA]: 'En la terraza',
};

export const ESTADOS_RESERVA = {
  CONFIRMADA: 'confirmada',
  CANCELADA: 'cancelada',
  PENDIENTE: 'pendiente',
};

export const MENSAJES = {
  RESERVA_EXITOSA: '¡Gracias! Tu reserva fue realizada correctamente.',
  RESERVA_DUPLICADA: 'Ya existe una reserva para este horario con tu email.',
  HORARIO_LLENO: 'Lo siento, este horario está completamente lleno.',
  TURNO_PASADO: 'Ese horario ya pasó. Elegí uno más tarde o para otro día.',
  TURNO_CERRADO: 'Ese turno no está disponible por el momento.',
  RESERVA_NO_ENCONTRADA: 'La reserva no fue encontrada.',
  CANCELA_EXITOSA: 'Tu reserva ha sido cancelada.',
  ERROR_GENERICO: 'Ocurrió un error. Por favor intenta más tarde.',
};
