import type { Metadata } from 'next';
import { Anton, Work_Sans } from 'next/font/google';
import './globals.css';
import { NEGOCIO } from '@/lib/constants';
import { JsonLd, restaurantSchema } from '@/lib/schema';

const display = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const body = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(NEGOCIO.sitio),
  title: {
    default: `${NEGOCIO.nombre} | Parrilla Argentina en Ruzafa, Valencia`,
    template: `%s | ${NEGOCIO.nombre}`,
  },
  description: NEGOCIO.descripcion,
  keywords: [
    'restaurante argentino valencia',
    'parrilla argentina valencia',
    'bodegón argentino ruzafa',
    'entraña vuelta y vuelta',
    'carnes a la brasa valencia',
    'empanadas caseras argentina',
    'vinos malbec valencia',
    'mejores restaurantes ruzafa',
    'parrilla buenos aires valencia',
    'comida argentina españa',
  ],
  authors: [{ name: NEGOCIO.nombre }],
  alternates: {
    canonical: '/',
    languages: { 'es-ES': '/', 'en-US': '/en' },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: NEGOCIO.sitio,
    siteName: NEGOCIO.nombre,
    title: `${NEGOCIO.nombre} | Parrilla Argentina en Ruzafa, Valencia`,
    description: NEGOCIO.descripcion,
    images: [{ url: '/fotos/hero-entrana.jpg', width: 1800, height: 2697, alt: 'Entraña a la parrilla en Unión Carnes y Vinos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${NEGOCIO.nombre} | Parrilla Argentina en Ruzafa, Valencia`,
    description: NEGOCIO.descripcion,
    images: ['/fotos/hero-entrana.jpg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <JsonLd data={restaurantSchema()} />
        {children}
      </body>
    </html>
  );
}
