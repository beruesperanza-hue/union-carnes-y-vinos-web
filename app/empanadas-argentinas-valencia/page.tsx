import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { JsonLd, faqSchema } from '@/lib/schema';
import { NEGOCIO } from '@/lib/constants';
import { CARTA_COMIDA } from '@/lib/menu';

export const metadata: Metadata = {
  title: 'Empanadas Argentinas en Valencia — Cortadas a Cuchillo',
  description:
    'Las empanadas argentinas de Unión Carnes y Vinos, cortadas a cuchillo, con carne, hongos y queso azul o cerdo BBQ. "Las mejores de Valencia" según Valencia Plaza. Ruzafa, Valencia.',
  alternates: { canonical: '/empanadas-argentinas-valencia' },
  openGraph: {
    title: 'Empanadas Argentinas en Valencia — Unión Carnes y Vinos',
    description: 'Empanadas cortadas a cuchillo, fritas, en Ruzafa. "Las mejores de Valencia" — Valencia Plaza.',
    images: [{ url: '/fotos/empanada.jpg', width: 1200, height: 1200, alt: 'Empanada argentina cortada a cuchillo en Unión Carnes y Vinos' }],
  },
};

const PREGUNTAS = [
  {
    pregunta: '¿Qué hace diferentes a las empanadas de Unión?',
    respuesta:
      'Están cortadas a cuchillo (no picadas a máquina), lo que le da a la carne una textura mucho más jugosa. Se sirven fritas, al estilo tradicional argentino.',
  },
  {
    pregunta: '¿Qué sabores de empanadas tienen?',
    respuesta:
      'Tres: carne cortada a cuchillo, hongos con champiñones, mozzarella y queso azul, y cerdo BBQ agridulce con salsa picante. Las tres cuestan 3,3 € la unidad.',
  },
  {
    pregunta: '¿Son realmente "las mejores de Valencia"?',
    respuesta:
      'Es la frase que usó la Guía Hedonista de Valencia Plaza al nombrar a Unión "Restorán de la Semana": "las empanadas de carne del Unión son las mejores de Valencia".',
  },
  {
    pregunta: '¿Las empanadas son para compartir o de entrada?',
    respuesta: 'Funcionan como entrada antes de la carne, o para picar varias entre la mesa — la mayoría de los clientes pide de los tres sabores.',
  },
];

export default function EmpanadasPage() {
  const empanadas = CARTA_COMIDA.find((s) => s.id === 'empanadas')!;

  return (
    <>
      <Header />
      <WhatsAppBoton />
      <JsonLd data={faqSchema(PREGUNTAS)} />

      <section className="relative bg-brasa-950 overflow-hidden">
        <div className="container-page grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-14 lg:py-20">
          <div>
            <p className="eyebrow text-gold-400 mb-5">Ruzafa · Valencia</p>
            <h1 className="font-display uppercase text-brasa-100 text-[10vw] sm:text-5xl lg:text-[3.4rem] leading-[0.9] text-balance">
              Empanadas argentinas en <span className="text-ember-400">Valencia</span>
            </h1>
            <p className="font-body text-brasa-300 text-lg mt-6 max-w-[48ch]">
              Cortadas a cuchillo, fritas, tres sabores. &ldquo;Las empanadas de carne del Unión son
              las mejores de Valencia&rdquo; — Valencia Plaza, Guía Hedonista.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/reservar" className="btn btn-ember">
                Reservar mesa
              </Link>
              <Link href="/carta" className="btn btn-outline">
                Ver la carta completa
              </Link>
            </div>
          </div>

          <div className="relative aspect-[1/1] rounded-2xl overflow-hidden">
            <Image
              src="/fotos/empanada.jpg"
              alt="Empanada argentina cortada a cuchillo de Unión Carnes y Vinos"
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
            Cortadas a cuchillo, no picadas a máquina
          </h2>
          <p>
            La diferencia entre una empanada cualquiera y una empanada argentina de verdad está en
            el corte: la carne se corta a cuchillo, en trozos pequeños e irregulares, en vez de
            picarse a máquina. El resultado es una textura mucho más jugosa, con más carácter en
            cada bocado.
          </p>
          <p>
            Las freímos al estilo tradicional — masa crocante por fuera, relleno jugoso por dentro.
            Es el plato con el que arrancamos casi todas las mesas.
          </p>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2 mt-10">
            Los tres sabores de la carta
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 not-prose my-6">
            {empanadas.platos.map((p) => (
              <div key={p.nombre} className="bg-brasa-50 rounded-xl border border-brasa-200 p-5">
                <p className="font-display uppercase text-base text-brasa-900 leading-tight mb-2">
                  {p.nombre.replace('Empanada frita de ', '').replace('Empanada de ', '')}
                </p>
                <p className="font-display text-ember-600">{p.precio}</p>
              </div>
            ))}
          </div>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2 mt-10">
            &ldquo;Las mejores de Valencia&rdquo;
          </h2>
          <p>
            Cuando la Guía Hedonista de Valencia Plaza nombró a Unión &ldquo;Restorán de la
            Semana&rdquo;, la frase que usó el crítico Kike Parra fue exactamente esa: las empanadas
            de carne del Unión son las mejores de Valencia. Es también uno de los platos mejor
            valorados en nuestras 9,4/10 de nota en TheFork.
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
