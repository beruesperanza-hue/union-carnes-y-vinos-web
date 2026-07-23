import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { NEGOCIO } from '@/lib/constants';
import { CARTA_COMIDA } from '@/lib/menu';

export const metadata: Metadata = {
  title: 'Argentinian Steakhouse in Valencia · Ruzafa',
  description:
    'Authentic Argentine grill in Ruzafa: premium cuts, hand-cut empanadas & Malbec wines. Rated 9.4/10. Book your table tonight.',
  alternates: { canonical: '/en' },
  openGraph: { locale: 'en_US' },
};

export default function HomeEN() {
  const entrana = CARTA_COMIDA.find((s) => s.id === 'carnes')!.platos.find((p) =>
    p.nombre.includes('Entraña')
  )!;

  return (
    <>
      <Header />
      <WhatsAppBoton en />

      <section className="relative bg-brasa-950 overflow-hidden">
        <div className="container-page grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-14 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="eyebrow text-gold-400 mb-5">Ruzafa · Valencia · Since 2019</p>
            <h1 className="font-display uppercase text-brasa-100 text-[13vw] sm:text-6xl lg:text-[4.6rem] leading-[0.86] text-balance">
              Argentine fire,
              <br />
              <span className="text-ember-400">Valencian soul.</span>
            </h1>
            <p className="font-body text-brasa-300 text-lg mt-6 max-w-[46ch]">
              Argentine steakhouse in the heart of Ruzafa. Premium cuts over charcoal, hand-cut
              empanadas, and a wine list built to match them.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ember">
                Book a table
              </a>
              <Link href="/en/carta" className="btn btn-outline">
                View the menu
              </Link>
            </div>
            <div className="flex items-center gap-5 mt-9 text-brasa-400 font-body text-sm">
              <span className="flex items-center gap-1.5">
                <strong className="text-gold-400 font-display text-lg">9.4</strong>/10 on TheFork
              </span>
              <span className="w-1 h-1 rounded-full bg-brasa-700" />
              <span>1,986 reviews</span>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <Image
                src="/fotos/hero-entrana.jpg"
                alt="Grilled skirt steak sliced, served with Padrón peppers"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brasa-950/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden sm:block bg-malbec-600 text-brasa-100 rounded-xl px-5 py-4 shadow-xl">
              <p className="eyebrow text-gold-400 mb-1">Signature dish</p>
              <p className="font-display uppercase text-xl leading-none">Entraña</p>
              <p className="font-body text-sm text-brasa-200 mt-1">Skirt steak · {entrana.precio}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brasa-900 py-6">
        <div className="container-page">
          <p className="text-center font-body text-brasa-300 text-sm sm:text-base italic">
            &ldquo;Unión&apos;s beef empanadas are the best in Valencia.&rdquo;
            <span className="not-italic text-brasa-500"> — Valencia Plaza, Guía Hedonista</span>
          </p>
        </div>
      </section>

      <section className="container-page py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden order-2 md:order-1">
          <Image
            src="/fotos/empanada-vino.jpg"
            alt="House-made empanada next to a glass of Malbec at Unión"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 md:order-2">
          <p className="eyebrow text-ember-600 mb-3">Our story</p>
          <h2 className="font-display uppercase text-4xl text-brasa-900 leading-[0.9] mb-5">
            Four childhood friends from Buenos Aires, one fire in Ruzafa
          </h2>
          <p className="font-body text-brasa-900/80 mb-4 max-w-[52ch]">
            Unión opened in August 2019, when four childhood friends from Buenos Aires brought the
            neighbourhood parrilla they grew up with to Valencia. Reimagined in 2024 under new
            family ownership, it now pairs modern technique with the same fire as always.
          </p>
          <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            Book a table
          </a>
        </div>
      </section>

      <section className="bg-brasa-50 py-20">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="eyebrow text-ember-600 mb-3">The menu</p>
              <h2 className="font-display uppercase text-4xl text-brasa-900 leading-[0.9]">
                Off the grill
              </h2>
            </div>
            <Link href="/en/carta" className="font-body font-bold text-brasa-900 underline underline-offset-4 hover:text-ember-600">
              Full menu →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARTA_COMIDA.find((s) => s.id === 'carnes')!.platos.map((plato) => (
              <div key={plato.nombre} className="bg-white rounded-xl p-5 border border-brasa-200/60">
                <p className="font-display uppercase text-lg text-brasa-900 leading-tight mb-1.5">
                  {(plato.nombreEn ?? plato.nombre).split('(')[0].trim()}
                </p>
                {plato.descripcionEn && (
                  <p className="font-body text-xs text-brasa-900/50 mb-2">{plato.descripcionEn}</p>
                )}
                <p className="font-body font-bold text-ember-600">{plato.precio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-24 text-center">
        <h2 className="font-display uppercase text-4xl sm:text-5xl text-brasa-900 leading-[0.9] mb-6 text-balance">
          Book your table this week
        </h2>
        <p className="font-body text-brasa-900/70 max-w-[48ch] mx-auto mb-8">
          Open for dinner Thursday through Sunday. Groups, celebrations, long dinners —
          wine included.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ember">
            Book on TheFork
          </a>
          <a href={NEGOCIO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            Message us on WhatsApp
          </a>
        </div>
      </section>

      <Footer en />
    </>
  );
}
