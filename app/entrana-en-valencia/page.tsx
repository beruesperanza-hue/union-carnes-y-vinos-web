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
  title: 'Dónde Comer Entraña en Valencia — La Mejor de Ruzafa',
  description:
    'La entraña vuelta y vuelta de Unión Carnes y Vinos: 300g de skirt steak a la parrilla, el plato más pedido de Ruzafa. Cómo la preparamos, con qué vino marida y cómo reservar.',
  alternates: { canonical: '/entrana-en-valencia' },
  openGraph: {
    title: 'Dónde Comer Entraña en Valencia — Unión Carnes y Vinos',
    description:
      'Entraña vuelta y vuelta a la parrilla, el plato más pedido de nuestra carta. Ruzafa, Valencia.',
    images: [{ url: '/fotos/hero-entrana.jpg', width: 1800, height: 2697, alt: 'Entraña a la parrilla en Unión Carnes y Vinos' }],
  },
};

const PREGUNTAS = [
  {
    pregunta: '¿Qué es la entraña?',
    respuesta:
      'La entraña (skirt steak) es un corte fino y muy sabroso del diafragma de la vaca, típico de la parrilla argentina. Se cocina rápido, "vuelta y vuelta", a fuego fuerte por fuera y jugosa por dentro.',
  },
  {
    pregunta: '¿Cuánto cuesta la entraña en Unión?',
    respuesta: 'La entraña vuelta y vuelta (300 g, con papas fritas) cuesta 23 € en nuestra carta actual.',
  },
  {
    pregunta: '¿La entraña es el plato más pedido?',
    respuesta:
      'Sí, junto con las empanadas de carne cortadas a cuchillo, es el plato que más piden nuestros clientes — con nota 9,4/10 en TheFork.',
  },
  {
    pregunta: '¿Con qué vino marida mejor la entraña?',
    respuesta:
      'Con un Malbec argentino de cuerpo medio como el Amalaya o el Saurus, o con un tinto español de Ribera del Duero como el Balandro — ambos están en nuestra carta de vinos.',
  },
  {
    pregunta: '¿Hay que reservar para comer entraña en Unión?',
    respuesta:
      'Lo recomendamos, especialmente viernes y sábado. Podés reservar en unioncarnesyvinos.com/reservar o por WhatsApp.',
  },
];

export default function EntranaEnValenciaPage() {
  const entrana = CARTA_COMIDA.find((s) => s.id === 'carnes')!.platos.find((p) =>
    p.nombre.includes('Entraña')
  )!;

  return (
    <>
      <Header />
      <WhatsAppBoton />
      <JsonLd data={faqSchema(PREGUNTAS)} />

      <section className="relative bg-brasa-950 overflow-hidden">
        <div className="container-page grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-14 lg:py-20">
          <div>
            <p className="eyebrow text-gold-400 mb-5">Ruzafa · Valencia</p>
            <h1 className="font-display uppercase text-brasa-100 text-[11vw] sm:text-5xl lg:text-[3.6rem] leading-[0.9] text-balance">
              Dónde comer <span className="text-ember-400">entraña</span> en Valencia
            </h1>
            <p className="font-body text-brasa-300 text-lg mt-6 max-w-[48ch]">
              300 gramos de skirt steak a la parrilla, vuelta y vuelta, servido con pimientos de
              Padrón. El plato más pedido de nuestra carta — y el motivo por el que la gente vuelve.
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

          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <Image
              src="/fotos/hero-entrana.jpg"
              alt="Entraña a la parrilla cortada, servida con pimientos de Padrón en Unión Carnes y Vinos"
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
            Qué es la entraña y por qué es distinta
          </h2>
          <p>
            La entraña —skirt steak en inglés— es un corte del diafragma de la vaca: fino, fibroso
            y con un sabor mucho más intenso que cualquier corte magro. En la parrilla argentina es
            uno de los cortes clásicos, junto con el vacío y el bife de chorizo, y se cocina{' '}
            <b>vuelta y vuelta</b>: fuego fuerte, poco tiempo, sellada por fuera y jugosa por dentro.
          </p>
          <p>
            En Unión la servimos en su punto justo, 300 gramos con papas fritas y pimientos de
            Padrón — es, junto a las empanadas de carne cortadas a cuchillo, el plato que más
            pedimos de la carta. La nota de comida en TheFork (9,4/10 sobre casi 2.000 opiniones) lo
            confirma.
          </p>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2 mt-10">
            Cómo la preparamos
          </h2>
          <p>
            Nada de trucos: brasa fuerte, sal gruesa, y el tiempo justo para que quede jugosa sin
            pasarse. Es un corte que no perdona el término — por eso la sacamos siempre vuelta y
            vuelta, tal como se come en cualquier parrilla de Buenos Aires.
          </p>

          <div className="bg-brasa-50 rounded-xl border border-brasa-200 p-6 my-8">
            <p className="eyebrow text-ember-600 mb-2">En la carta</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display uppercase text-xl text-brasa-900">Entraña vuelta y vuelta</p>
                <p className="font-body text-sm text-brasa-900/60">
                  {entrana.descripcion} · 300 g
                </p>
              </div>
              <p className="font-display text-2xl text-ember-600">{entrana.precio}</p>
            </div>
          </div>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2 mt-10">
            Con qué vino marida
          </h2>
          <p>
            La entraña pide un tinto con cuerpo que no tape su sabor. En nuestra bodega recomendamos
            un <b>Malbec argentino</b> — el Amalaya de Salta o el Saurus de Patagonia son los favoritos
            de la casa — o, si preferís algo español, un <b>Ribera del Duero</b> como el Balandro. Los
            dos están en la <Link href="/vinos" className="underline underline-offset-4 hover:text-ember-600">carta de vinos</Link>.
          </p>

          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-2 mt-10">
            Dónde estamos
          </h2>
          <p>
            Unión Carnes y Vinos está en {NEGOCIO.direccion.calle}, en el corazón de Ruzafa —
            abrimos jueves, viernes, sábado y domingo de 19:30 a 23:30.
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
