import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Entraña Argentina: Guía Completa | Unión Carnes y Vinos',
  description: 'Qué es la entraña argentina, cómo se cocina, por qué es el mejor corte. Entraña vuelta y vuelta en Valencia.',
};

export default function Article() {
  return (
    <>
      <Header />
      <article className="py-16">
        <div className="container-page max-w-3xl">
          <h1 className="font-display text-5xl text-brasa-900 my-6">La entraña argentina: el mejor corte</h1>
          <p className="text-lg text-brasa-700 mb-8">Descubre por qué la entraña es el corte elegido en las mejores parrillas.</p>
          <div className="space-y-6 text-brasa-800">
            <h2 className="font-display text-3xl text-brasa-900">¿Qué es la entraña?</h2>
            <p>La entraña es un corte del diafragma de la vaca. En Argentina, es sinónimo de parrilla auténtica.</p>
            <h2 className="font-display text-3xl text-brasa-900">Vuelta y vuelta: el punto perfecto</h2>
            <p>Cocinada rápido a fuego alto, sellada por ambos lados pero jugosa por dentro. Este es el arte de la parrilla.</p>
            <h2 className="font-display text-3xl text-brasa-900">En Unión</h2>
            <p>Nuestra entraña es el plato estrella. Fuego de leña, punto perfecto, servida al instante. <Link href="/reservar" className="text-ember-600 font-bold">Reserva para probarla</Link>.</p>
          </div>
          <div className="mt-12 pt-8 border-t"><Link href="/" className="text-ember-600 font-bold">← Volver</Link></div>
        </div>
      </article>
      <Footer />
    </>
  );
}
