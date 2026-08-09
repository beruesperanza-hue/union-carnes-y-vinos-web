import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Bodegón Argentino: Concepto y Tradición | Unión',
  description: 'Qué es un bodegón argentino. Concepto, tradición y experiencia en Ruzafa, Valencia.',
};

export default function Article() {
  return (
    <>
      <Header />
      <article className="py-16">
        <div className="container-page max-w-3xl">
          <h1 className="font-display text-5xl text-brasa-900 my-6">Bodegón argentino: concepto y tradición</h1>
          <p className="text-lg text-brasa-700 mb-8">Descubre el alma del bodegón: comida auténtica, ambiente de barrio, gente.</p>
          <div className="space-y-6 text-brasa-800">
            <h2 className="font-display text-3xl text-brasa-900">¿Qué es un bodegón?</h2>
            <p>Un bodegón no es un restaurante elegante. Es un espacio íntimo, familiar. Parrilla, vino, gente buena.</p>
            <h2 className="font-display text-3xl text-brasa-900">Tradición porteña</h2>
            <p>Los bodegones nacieron en Buenos Aires como espacios de encuentro. Ahora llevan esa esencia al mundo.</p>
            <h2 className="font-display text-3xl text-brasa-900">Unión: bodegón en Valencia</h2>
            <p>Desde 2019, traemos esa tradición argentina a Ruzafa. Fuego, vino, calidez. <Link href="/reservar" className="text-ember-600 font-bold">Reserva y siéntelo</Link>.</p>
          </div>
          <div className="mt-12 pt-8 border-t"><Link href="/" className="text-ember-600 font-bold">← Volver</Link></div>
        </div>
      </article>
      <Footer />
    </>
  );
}
