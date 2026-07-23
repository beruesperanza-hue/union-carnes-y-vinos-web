import { NEGOCIO } from './constants';
import { CARTA_COMIDA } from './menu';

// JSON-LD Restaurant, reutilizado en todas las páginas vía RootLayout.
// Ver auditoría GEO/AEO: es la señal nº1 para que los motores de IA lean
// horarios, carta y contacto sin ambigüedad.
export function restaurantSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${NEGOCIO.sitio}/#restaurant`,
    name: NEGOCIO.nombre,
    alternateName: NEGOCIO.alternateName,
    description: NEGOCIO.descripcion,
    servesCuisine: ['Argentine', 'Steakhouse', 'Wine Bar'],
    priceRange: NEGOCIO.rangoPrecios,
    image: `${NEGOCIO.sitio}/fotos/hero-parrilla.jpg`,
    url: NEGOCIO.sitio,
    telephone: NEGOCIO.telefono,
    email: NEGOCIO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: NEGOCIO.direccion.calle,
      addressLocality: NEGOCIO.direccion.localidad,
      postalCode: NEGOCIO.direccion.cp,
      addressRegion: NEGOCIO.direccion.region,
      addressCountry: NEGOCIO.direccion.pais,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: NEGOCIO.geo.lat,
      longitude: NEGOCIO.geo.lng,
    },
    openingHoursSpecification: NEGOCIO.horarioSchema.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dias,
      opens: h.abre,
      closes: h.cierra,
    })),
    acceptsReservations: 'True',
    hasMenu: `${NEGOCIO.sitio}/carta`,
    foundingDate: NEGOCIO.fundacion,
    sameAs: [NEGOCIO.instagramUrl, NEGOCIO.theforkUrl, NEGOCIO.tripadvisorUrl],
  };
}

// Menu + MenuItem — permite que Google/AI Overviews citen platos y precios
// directamente desde el schema, no solo desde el texto visible.
export function menuSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${NEGOCIO.sitio}/carta/#menu`,
    name: `Carta de ${NEGOCIO.nombre}`,
    hasMenuSection: CARTA_COMIDA.map((seccion) => ({
      '@type': 'MenuSection',
      name: seccion.titulo,
      hasMenuItem: seccion.platos.map((plato) => ({
        '@type': 'MenuItem',
        name: plato.nombre,
        description: plato.descripcion,
        offers: {
          '@type': 'Offer',
          price: plato.precio.replace(/[^\d,]/g, '').replace(',', '.'),
          priceCurrency: 'EUR',
        },
      })),
    })),
  };
}

export function faqSchema(preguntas: { pregunta: string; respuesta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    // eslint-disable-next-line react/no-danger
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
