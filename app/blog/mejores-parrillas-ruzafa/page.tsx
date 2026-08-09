import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mejores Parrillas en Ruzafa 2026 | Unión Carnes y Vinos',
  description: 'Parrillas argentinas en Ruzafa, Valencia. Carnes premium a la brasa, empanadas caseras y vinos Malbec.',
};

export default function Article() {
  return (
    <>
      <Header />
      <article className="py-16">
        <div className="container-page max-w-3xl">
          <h1 className="font-display text-5xl text-brasa-900 my-6">Mejores parrillas en Ruzafa 2026</h1>
          <p className="text-lg text-brasa-700 mb-8">Ruzafa es el corazón culinario de Valencia. Descubre dónde comer parrilla argentina auténtica.</p>
          <div className="space-y-6 text-brasa-800">
            <h2 className="font-display text-3xl text-brasa-900">¿Por qué Ruzafa?</h2>
            <p>Ruzafa concentra la mejor oferta gastronómica de Valencia. Desde bares de barrio hasta restaurantes gourmet.</p>
            <h2 className="font-display text-3xl text-brasa-900">Parrilla argentina en Ruzafa</h2>
            <p>La parrilla argentina es un concepto: fuego real, carnes de calidad, vinos que acompañen. Unión Carnes y Vinos trae esta tradición desde 2019.</p>
            <h3 className="font-display text-2xl text-brasa-900">Entraña vuelta y vuelta</h3>
            <p>El plato que define una parrilla. En Unión, la entraña es cocinada a fuego de leña. Con 9.4/10 en TheFork, es el favorito.</p>
            <h2 className="font-display text-3xl text-brasa-900">Conclusión</h2>
            <p>Si buscas la mejor parrilla argentina en Ruzafa, <Link href="/reservar" className="text-ember-600 font-bold">reserva tu mesa</Link> en Unión.</p>
          </div>
          <div className="mt-12 pt-8 border-t"><Link href="/" className="text-ember-600 font-bold">← Volver</Link></div>
        </div>
      </article>
      <Footer />
    </>
  );
}
