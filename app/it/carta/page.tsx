import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { CARTA_COMIDA, VINOS, ALERGENOS_IT } from '@/lib/menu';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Menù e Prezzi — Griglia Argentina',
  description:
    'Entraña, bife de chorizo, empanadas fatte a mano e dolci con dulce de leche. Il menù completo della nostra griglia argentina a Ruzafa, Valencia, con i prezzi.',
  alternates: {
    canonical: '/it/carta',
    languages: {
      'es-ES': '/carta',
      'en-US': '/en/carta',
      'it-IT': '/it/carta',
      'fr-FR': '/fr/carta',
      'de-DE': '/de/carta',
    },
  },
};

export default function CartaIT() {
  return (
    <>
      <Header />
      <WhatsAppBoton lang="it" />

      <section className="bg-brasa-950 py-16">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">Il menù</p>
          <h1 className="font-display uppercase text-5xl text-brasa-100 leading-[0.88]">
            Empanadas, griglia
            <br />e un tocco dolce
          </h1>
        </div>
      </section>

      <section className="container-page py-16 space-y-16">
        {CARTA_COMIDA.map((seccion) => (
          <div key={seccion.id}>
            <h2 className="font-display uppercase text-3xl text-brasa-900 mb-1">{seccion.tituloIt}</h2>
            <div className="rule-gold w-24 mb-7" />
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {seccion.platos.map((plato) => (
                <li key={plato.nombre} className="flex justify-between gap-4 border-b border-dashed border-brasa-200 pb-3">
                  <div>
                    <p className="font-body font-semibold text-brasa-900">{plato.nombreIt ?? plato.nombre}</p>
                    {plato.descripcionIt && (
                      <p className="font-body text-sm text-brasa-900/55 mt-0.5">{plato.descripcionIt}</p>
                    )}
                    {plato.alergenos && plato.alergenos.length > 0 && (
                      <p className="font-body text-[11px] text-brasa-900/40 mt-1 uppercase tracking-wide">
                        {plato.alergenos.map((a) => ALERGENOS_IT[a]).join(' · ')}
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
          <p className="eyebrow text-gold-400 mb-3">Cantina</p>
          <h2 className="font-display uppercase text-3xl mb-8">Vini argentini e spagnoli</h2>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {VINOS.map((sec) => (
              <div key={sec.id}>
                <h3 className="eyebrow text-brasa-300 mb-3">
                  {sec.tituloIt} <span className="opacity-50">· {sec.origen === 'Argentina' ? 'Argentina' : 'Spagna'}</span>
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
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <p className="font-body text-brasa-900/60 text-sm max-w-[50ch] mx-auto mb-6">
          Prezzo medio {NEGOCIO.precioMedio} a persona. Elenco allergeni disponibile in sala su richiesta.
        </p>
        <Link href="/reservar" className="btn btn-ember">
          Prenota un tavolo
        </Link>
      </section>

      <Footer lang="it" />
    </>
  );
}
