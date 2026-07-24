import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { JsonLd, faqSchema } from '@/lib/schema';
import { NEGOCIO } from '@/lib/constants';
import { VINOS } from '@/lib/menu';

export const metadata: Metadata = {
  title: 'Vinos Argentinos en Valencia — Malbec y Más en Ruzafa',
  description:
    'Carta de vinos argentinos en Unión Carnes y Vinos: Malbec de Mendoza y Salta, Pinot Noir y Chardonnay de Patagonia, elegidos para maridar con parrilla. Ruzafa, Valencia.',
  alternates: { canonical: '/vinos-argentinos-valencia' },
  openGraph: {
    title: 'Vinos Argentinos en Valencia — Unión Carnes y Vinos',
    description: 'Malbec, Pinot Noir y Torrontés argentinos, elegidos para acompañar la parrilla.',
    images: [{ url: '/fotos/empanada-vino.jpg', width: 1200, height: 1797, alt: 'Copa de vino Malbec argentino en Unión Carnes y Vinos' }],
  },
};

const PREGUNTAS = [
  {
    pregunta: '¿Qué vinos argentinos tiene Unión?',
    respuesta:
      'Malbec de Salta (Amalaya) y Patagonia (Saurus, Domaine Bousquet), Pinot Noir de Patagonia (Verum, Saurus), Torrontés de Salta (La Puerta) y Chardonnay de Patagonia (Saurus).',
  },
  {
    pregunta: '¿Cuál es el mejor Malbec para acompañar la carne?',
    respuesta:
      'El Amalaya de Salta (24 €) y el Saurus de Patagonia (23 € la botella, también por copa) son los más pedidos con la entraña y el bife de chorizo.',
  },
  {
    pregunta: '¿Tienen vino por copa?',
    respuesta:
      'Sí, varias etiquetas argentinas y españolas están disponibles por copa además de la botella entera — Saurus Malbec, Saurus Chardonnay y varios tintos españoles.',
  },
  {
    pregunta: '¿Solo tienen vinos argentinos?',
    respuesta:
      'No — la carta combina bodega argentina con una selección española (Ribera del Duero, Rioja, Valencia) para quien prefiera quedarse cerca de casa.',
  },
];

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
              Malbec de Mendoza y Salta, Pinot Noir y Chardonnay de Patagonia — elegidos
              específicamente para acompañar carne a la parrilla.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/reservar" className="btn btn-ember">
                Reservar mesa
              </Link>
              <Link href="/vinos" className="btn btn-outline">
                Ver la carta de vinos
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

      <section className="container-page py-16 max-w-[72ch] mx-auto">
        <div className="font-body text-brasa-900/85 space-y-5 text-[1.05rem] leading-relaxed">
          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2">
            Por qué el Malbec y la parrilla van juntos
          </h2>
          <p>
            El Malbec argentino se hizo famoso justamente por esto: cuerpo, taninos suaves y notas
            de fruta madura que acompañan a la carne roja sin taparla. Es la uva insignia de
            Mendoza, pero también da grandes resultados en Salta (a mucha altura, con más
            frescura) y en la Patagonia (más frío, más elegancia).
          </p>
          <p>
            En Unión armamos la carta pensando en eso: cada vino argentino que servimos está
            elegido para acompañar un corte específico de la parrilla, no solo por ser conocido.
          </p>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2 mt-10">
            Los argentinos de la carta
          </h2>
          <div className="not-prose my-6 space-y-6">
            {argentinos.map((sec) => (
              <div key={sec.id}>
                <h3 className="eyebrow text-ember-600 mb-3">{sec.titulo}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {sec.vinos.map((v) => (
                    <div key={v.nombre} className="bg-brasa-50 rounded-xl border border-brasa-200 p-4 flex justify-between items-center gap-3">
                      <span className="font-body text-sm text-brasa-900">{v.nombre}</span>
                      <span className="font-display text-ember-600 whitespace-nowrap">{v.precio}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2 mt-10">
            Maridaje recomendado
          </h2>
          <p>
            Con la <Link href="/entrana-en-valencia" className="underline underline-offset-4 hover:text-ember-600">entraña</Link> y el bife de chorizo, un Malbec de cuerpo medio como el
            Amalaya o el Saurus. Con las empanadas, un tinto joven o incluso el Torrontés bien
            frío si preferís blanco. La carta completa, con los vinos españoles incluidos, está en{' '}
            <Link href="/vinos" className="underline underline-offset-4 hover:text-ember-600">nuestra página de vinos</Link>.
          </p>

          <p>
            Estamos en {NEGOCIO.direccion.calle}, Ruzafa — abrimos jueves a domingo de 19:30 a
            23:30.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link href="/reservar" className="btn btn-ember">
            Reservar mi mesa
          </Link>
        </div>
      </section>

      <section className="bg-brasa-50 py-16">
        <div className="container-page max-w-[70ch] mx-auto">
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
