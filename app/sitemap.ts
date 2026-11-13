import type { MetadataRoute } from 'next';
import { NEGOCIO } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = [
    '', '/carta', '/vinos', '/reservar', '/historia', '/faq',
    '/entrana-en-valencia', '/empanadas-argentinas-valencia', '/vinos-argentinos-valencia',
    '/en', '/en/carta', '/it/carta', '/fr/carta', '/de/carta', '/pt/carta', '/sv/carta',
  ];
  return rutas.map((ruta) => ({
    url: `${NEGOCIO.sitio}${ruta}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: ruta === '' || ruta === '/en' ? 1 : 0.7,
  }));
}
