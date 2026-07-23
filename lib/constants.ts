// Datos maestros (NAP) — un único bloque de verdad, usado en toda la web y
// en el JSON-LD. Coinciden con la auditoría SEO/GEO (jul-2026): dirección,
// teléfono y coordenadas verificados en TheFork/Tripadvisor.
export const NEGOCIO = {
  nombre: 'Unión Carnes y Vinos',
  nombreCorto: 'Unión',
  alternateName: 'Bar Unión',
  eslogan: 'Parrilla argentina en Ruzafa · Desde 2019',
  descripcion:
    'Parrilla argentina en el corazón de Ruzafa, Valencia. Carnes premium, empanadas cortadas a cuchillo y vinos argentinos y españoles. Proyecto familiar desde 2019.',
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
