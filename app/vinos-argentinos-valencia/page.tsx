import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { JsonLd, faqSchema } from '@/lib/schema';
import { NEGOCIO } from '@/lib/constants';
import { VINOS, type Vino } from '@/lib/menu';

export const metadata: Metadata = {
  title: 'Vinos Argentinos en Valencia — Malbec y Más en Ruzafa',
  description:
    'Vinos argentinos en Unión Carnes y Vinos: Malbec de Mendoza, Salta y Patagonia, Cabernet, Pinot Noir, Torrontés y Chardonnay, con precios por copa y botella. Ruzafa, Valencia.',
  alternates: { canonical: '/vinos-argentinos-valencia' },
  openGraph: {
    title: 'Vinos Argentinos en Valencia — Unión Carnes y Vinos',
    description: 'Malbec, Cabernet, Pinot Noir y Torrontés argentinos, elegidos para acompañar la parrilla.',
    images: [{ url: '/fotos/empanada-vino.jpg', width: 1200, height: 1797, alt: 'Copa de vino Malbec argentino en Unión Carnes y Vinos' }],
  },
};

const PREGUNTAS = [
  {
    pregunta: '¿Qué vinos argentinos tiene Unión?',
    respuesta:
      'Malbec de Patagonia (Saurus), Mendoza (Gieco, Furlan, Domaine Bousquet) y Salta (Amalaya), más el orgánico Salvaje; Cabernet Sauvignon y Cabernet Franc de Mendoza; Pinot Noir de Patagonia en tinto y en rosado; y blancos Torrontés-Semillón (Mendoza) y Chardonnay (Patagonia).',
  },
  {
    pregunta: '¿Cuál es el mejor Malbec para acompañar la carne?',
    respuesta:
      'Un Malbec de cuerpo medio como el Saurus de Patagonia (24 €) o el Amalaya de Salta (27 €) acompaña bien la entraña y el vacío. Para algo con más estructura, el Domaine Bousquet Premium Malbec de Mendoza (30 €) va bien con el bife de chorizo con hueso o la picaña.',
  },
  {
    pregunta: '¿Tienen vino argentino por copa?',
    respuesta:
      'Sí: el Gieco Malbec Single Vineyard, el Furlan Torrontés-Semillón y el Saurus Chardonnay se sirven por copa a 4 €, además de la botella.',
  },
  {
    pregunta: '¿Cuánto cuesta una botella de vino argentino?',
    respuesta:
      'Los argentinos van de 24 € a 34 €: la mayoría de los tintos entre 24 y 30 €, y los blancos y el rosado a 24 €.',
  },
  {
    pregunta: '¿Solo tienen vinos argentinos?',
    respuesta:
      'No — la carta combina bodega argentina con una selección española (Ribera del Duero, Rioja, Rías Baixas y más) desde 20 € la botella, para quien prefiera quedarse cerca de casa.',
  },
];

const MARIDAJES = [
  {
    titulo: 'Malbec',
    texto:
      'El de siempre con la parrilla: cuerpo, taninos suaves y fruta madura. Con la entraña, el vacío o la picaña.',
  },
  {
    titulo: 'Cabernet Sauvignon y Cabernet Franc',
    texto:
      'Más estructura y carácter. Para el bife de chorizo con hueso o la costilla madurada.',
  },
  {
    titulo: 'Pinot Noir (tinto y rosado)',
    texto:
      'Más liviano y fresco. Con las empanadas, el chorizo criollo, la provoleta o el huevo con morcilla.',
  },
  {
    titulo: 'Torrontés-Semillón y Chardonnay',
    texto:
      'Blancos para empezar o para quien no quiere tinto: empanadas de hongos, buñuelos, ensaladas y ñoquis.',
  },
];

/** "4 / 25 €" → copa 4 € · botella 25 €; "24 €" → solo botella. */
function precios(v: Vino): { copa?: string; botella: string } {
  const [a, b] = v.precio.replace(/\s*€/, '').split('/').map((x) => x.trim());
  return b ? { copa: `${a} €`, botella: `${b} €` } : { botella: `${a} €` };
}

/** El nombre de la ficha sin la región entre paréntesis (la región va en su propia etiqueta). */
function nombreCorto(v: Vino): string {
  return v.nombre.replace(/\s*\([^)]*\)\s*$/, '');
}

export default function VinosArgentinosPage() {
  const argentinos = VINOS.filter((v) => v.origen === 'Argentina');

  return (
    <>
      <Header />
      <WhatsAppBoton />
      <JsonLd data={faqSchema(PREGUNTAS)} />

      <section className="relative bg-malbec-700 overflow-hidden text-brasa-100">
        <div className="container-page grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-14 lg:py-20">
          <div>
            <p className="eyebrow text-gold-400 mb-5">Ruzafa · Valencia</p>
            <h1 className="font-display uppercase text-brasa-100 text-[10vw] sm:text-5xl lg:text-[3.4rem] leading-[0.9] text-balance">
              Vinos argentinos en <span className="text-gold-400">Valencia</span>
            </h1>
            <p className="font-body text-brasa-200 text-lg mt-6 max-w-[48ch]">
              Malbec de Mendoza, Salta y Patagonia, Cabernet, Pinot Noir, Torrontés y Chardonnay —
              elegidos para acompañar carne a la parrilla.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/reservar" className="btn btn-ember">
                Reservar mesa
              </Link>
              <Link href="/vinos" className="btn btn-outline">
                Ver toda la carta de vinos
              </Link>
            </div>
          </div>

          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <Image
              src="/fotos/empanada-vino.jpg"
              alt="Copa de vino Malbec argentino junto a una empanada en Unión Carnes y Vinos"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <p className="eyebrow text-ember-600 mb-3">La bodega argentina</p>
        <h2 className="font-display uppercase text-3xl text-brasa-900 mb-1">Los vinos de la carta</h2>
        <div className="rule-gold w-24 mb-3" />
        <p className="font-body text-sm text-brasa-900/60 mb-10">
          Precios por botella. Donde figura copa, también lo servimos por copa.
        </p>

        <div className="space-y-12">
          {argentinos.map((sec) => (
            <div key={sec.id} id={sec.id}>
              <h3 className="eyebrow text-ember-600 mb-4">{sec.titulo}</h3>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sec.vinos.map((v) => {
                  const { copa, botella } = precios(v);
                  return (
                    <li
                      key={v.nombre}
                      className="bg-brasa-50 rounded-xl border border-brasa-200 p-5 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <p className="font-body font-semibold text-brasa-900 leading-snug">{nombreCorto(v)}</p>
                        <p className="font-body text-sm text-brasa-900/60 mt-1.5">
                          {[v.uva, v.region].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <p className="font-display text-ember-600 text-xl whitespace-nowrap">
                        {copa && <span className="font-body text-sm text-brasa-900/60 mr-3">Copa {copa}</span>}
                        {botella}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brasa-50 py-16">
        <div className="container-page max-w-[72ch] mx-auto font-body text-brasa-900/85 text-[1.05rem] leading-relaxed">
          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-4">
            Por qué el Malbec y la parrilla van juntos
          </h2>
          <p className="mb-5">
            El Malbec argentino se hizo famoso justamente por esto: cuerpo, taninos suaves y notas
            de fruta madura que acompañan a la carne roja sin taparla. Es la uva insignia de
            Mendoza, pero también da grandes resultados en Salta (a mucha altura, con más
            frescura) y en la Patagonia (más frío, más elegancia).
          </p>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-4 mt-10">Qué tomar con qué</h2>
          <dl className="space-y-4">
            {MARIDAJES.map((m) => (
              <div key={m.titulo}>
                <dt className="font-display uppercase text-lg text-brasa-900">{m.titulo}</dt>
                <dd className="text-brasa-900/75">{m.texto}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6">
            Para la carne, mirá la{' '}
            <Link href="/entrana-en-valencia" className="underline underline-offset-4 hover:text-ember-600">entraña</Link>{' '}
            y el resto de la <Link href="/carta" className="underline underline-offset-4 hover:text-ember-600">carta</Link>. La
            selección de vinos españoles está en{' '}
            <Link href="/vinos" className="underline underline-offset-4 hover:text-ember-600">la carta de vinos completa</Link>.
          </p>

          <p className="mt-6">
            Estamos en {NEGOCIO.direccion.calle}, Ruzafa — abrimos lunes, jueves y viernes de 19:30 a
            23:00, y los sábados de 14:00 a 16:00 y de 19:30 a 23:30.
          </p>

          <div className="mt-10 text-center">
            <Link href="/reservar" className="btn btn-ember">
              Reservar mi mesa
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="max-w-[70ch] mx-auto">
          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-8">Preguntas frecuentes</h2>
          <dl className="divide-y divide-brasa-200">
            {PREGUNTAS.map((p) => (
              <div key={p.pregunta} className="py-5">
                <dt className="font-display uppercase text-lg text-brasa-900 mb-1.5">{p.pregunta}</dt>
                <dd className="font-body text-brasa-900/75 text-sm">{p.respuesta}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer />
    </>
  );
}
