import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { CARTA_COMIDA, VINOS, ALERGENOS_SV } from '@/lib/menu';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Meny och priser — Argentinsk grill',
  description:
    'Entraña, bife de chorizo, handgjorda empanadas och efterrätter med dulce de leche. Hela menyn från vår argentinska grill i Ruzafa, Valencia, med priser.',
  alternates: {
    canonical: '/sv/carta',
    languages: {
      'es-ES': '/carta',
      'en-US': '/en/carta',
      'it-IT': '/it/carta',
      'fr-FR': '/fr/carta',
      'de-DE': '/de/carta',
      'pt-PT': '/pt/carta',
      'sv-SE': '/sv/carta',
    },
  },
};

export default function CartaSV() {
  return (
    <>
      <Header />
      <WhatsAppBoton lang="sv" />

      <section className="bg-brasa-950 py-16">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">Menyn</p>
          <h1 className="font-display uppercase text-5xl text-brasa-100 leading-[0.88]">
            Empanadas, grill
            <br />och något sött till sist
          </h1>
        </div>
      </section>

      <section className="container-page py-16 space-y-16">
        {CARTA_COMIDA.map((seccion) => (
          <div key={seccion.id}>
            <h2 className="font-display uppercase text-3xl text-brasa-900 mb-1">{seccion.tituloSv}</h2>
            <div className="rule-gold w-24 mb-7" />
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {seccion.platos.map((plato) => (
                <li key={plato.nombre} className="flex justify-between gap-4 border-b border-dashed border-brasa-200 pb-3">
                  <div>
                    <p className="font-body font-semibold text-brasa-900">{plato.nombreSv ?? plato.nombre}</p>
                    {plato.descripcionSv && (
                      <p className="font-body text-sm text-brasa-900/55 mt-0.5">{plato.descripcionSv}</p>
                    )}
                    {plato.alergenos && plato.alergenos.length > 0 && (
                      <p className="font-body text-[11px] text-brasa-900/40 mt-1 uppercase tracking-wide">
                        {plato.alergenos.map((a) => ALERGENOS_SV[a]).join(' · ')}
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
          <p className="eyebrow text-gold-400 mb-3">Vinkällaren</p>
          <h2 className="font-display uppercase text-3xl mb-8">Argentinska och spanska viner</h2>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {VINOS.map((sec) => (
              <div key={sec.id}>
                <h3 className="eyebrow text-brasa-300 mb-3">
                  {sec.tituloSv} <span className="opacity-50">· {sec.origen === 'Argentina' ? 'Argentina' : 'Spanien'}</span>
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
          <p className="mt-8 font-body text-sm text-brasa-200">Ett enda pris är flaskan; &ldquo;4 / 25 €&rdquo; är glas / flaska.</p>
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <p className="font-body text-brasa-900/60 text-sm max-w-[50ch] mx-auto mb-6">
          Genomsnittspris {NEGOCIO.precioMedio} per person. Allergenlista finns i restaurangen på begäran.
        </p>
        <Link href="/reservar" className="btn btn-ember">
          Boka bord
        </Link>
      </section>

      <Footer lang="sv" />
    </>
  );
}
