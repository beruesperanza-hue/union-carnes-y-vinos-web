import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Vinos Argentinos para Parrilla: Guía de Maridaje | Unión',
  description: 'Malbec, Cabernet, Sirah: qué vino argentino marida perfecto con carnes a la brasa.',
};

export default function Article() {
  return (
    <>
      <Header />
      <article className="py-16">
        <div className="container-page max-w-3xl">
          <h1 className="font-display text-5xl text-brasa-900 my-6">Vinos argentinos para parrilla</h1>
          <p className="text-lg text-brasa-700 mb-8">El maridaje perfecto: carne a la brasa y Malbec de Mendoza.</p>
          <div className="space-y-6 text-brasa-800">
            <h2 className="font-display text-3xl text-brasa-900">El Malbec: rey de la parrilla</h2>
            <p>Un buen Malbec es el vino argentino por excelencia para la parrilla. Taninos suaves, notas de ciruela, perfecta acidez.</p>
            <h2 className="font-display text-3xl text-brasa-900">Nuestras bodegas</h2>
            <p>Amalaya, Saurus, Domaine Bousquet. Cada uno con su carácter, todos con excelente relación precio-calidad.</p>
            <h2 className="font-display text-3xl text-brasa-900">En Unión</h2>
            <p>Nuestro sommelier te ayuda a elegir el vino perfecto. <Link href="/reservar" className="text-ember-600 font-bold">Reserva y descubre</Link> el mejor maridaje.</p>
          </div>
          <div className="mt-12 pt-8 border-t"><Link href="/" className="text-ember-600 font-bold">← Volver</Link></div>
        </div>
      </article>
      <Footer />
    </>
  );
}
