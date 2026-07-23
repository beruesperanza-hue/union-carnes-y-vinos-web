import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { JsonLd, menuSchema } from '@/lib/schema';
import { CARTA_COMIDA, VINOS, COCTELES, ALERGENOS } from '@/lib/menu';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Carta — Empanadas, Parrilla y Postres Argentinos',
  description:
    'Entraña, bife de chorizo, empanadas cortadas a cuchillo y postres caseros. Carta completa con precios de nuestra parrilla argentina en Ruzafa, Valencia.',
  alternates: { canonical: '/carta' },
};

export default function CartaPage() {
  return (
    <>
      <Header />
      <WhatsAppBoton />
      <JsonLd data={menuSchema()} />

      <section className="bg-brasa-950 py-16">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">La carta</p>
          <h1 className="font-display uppercase text-5xl text-brasa-100 leading-[0.88]">
            Empanadas, parrilla
            <br />y algo dulce al final
          </h1>
        </div>
      </section>

      <section className="container-page py-16 space-y-16">
        {CARTA_COMIDA.map((seccion) => (
          <div key={seccion.id} id={seccion.id}>
            <h2 className="font-display uppercase text-3xl text-brasa-900 mb-1">{seccion.titulo}</h2>
            <div className="rule-gold w-24 mb-7" />
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {seccion.platos.map((plato) => (
                <li key={plato.nombre} className="flex justify-between gap-4 border-b border-dashed border-brasa-200 pb-3">
                  <div>
                    <p className="font-body font-semibold text-brasa-900">{plato.nombre}</p>
                    {plato.descripcion && (
                      <p className="font-body text-sm text-brasa-900/55 mt-0.5">{plato.descripcion}</p>
                    )}
                    {plato.alergenos && plato.alergenos.length > 0 && (
                      <p className="font-body text-[11px] text-brasa-900/40 mt-1 uppercase tracking-wide">
                        {plato.alergenos.map((a) => ALERGENOS[a]).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="font-display text-ember-600 text-lg whitespace-nowrap">{plato.precio}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="bg-malbec-700 py-16 text-brasa-100">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">Bodega</p>
          <h2 className="font-display uppercase text-3xl mb-8">Vinos, copas y cervezas</h2>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {VINOS.map((sec) => (
              <div key={sec.id}>
                <h3 className="eyebrow text-brasa-300 mb-3">
                  {sec.titulo} <span className="opacity-50">· {sec.origen}</span>
                </h3>
                <ul className="space-y-2">
                  {sec.vinos.map((v) => (
                    <li key={v.nombre} className="flex justify-between gap-4 text-sm font-body text-brasa-200">
                      <span>{v.nombre}</span>
                      <span className="text-gold-400 whitespace-nowrap">{v.precio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <h3 className="eyebrow text-brasa-300 mb-3">Cócteles y copas</h3>
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-2">
              {COCTELES.map((c) => (
                <li key={c.nombre} className="flex justify-between gap-4 text-sm font-body text-brasa-200">
                  <span>{c.nombre}</span>
                  <span className="text-gold-400 whitespace-nowrap">{c.precio}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <p className="font-body text-brasa-900/60 text-sm max-w-[50ch] mx-auto mb-6">
          Precio medio {NEGOCIO.precioMedio} por persona. Alérgenos disponibles a pedido en sala.
        </p>
        <Link href="/reservar" className="btn btn-ember">
          Reservar mesa
        </Link>
      </section>

      <Footer />
    </>
  );
}
