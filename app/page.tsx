import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import Wordmark from '@/components/Wordmark';
import { NEGOCIO } from '@/lib/constants';
import { CARTA_COMIDA } from '@/lib/menu';

export default function Home() {
  const entrana = CARTA_COMIDA.find((s) => s.id === 'carnes')!.platos.find((p) =>
    p.nombre.includes('Entraña')
  )!;

  return (
    <>
      <Header />
      <WhatsAppBoton />

      {/* HERO */}
      <section className="relative bg-brasa-950 overflow-hidden">
        <div className="container-page grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-14 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="eyebrow text-gold-400 mb-5">Ruzafa · Valencia · Desde 2019</p>
            <h1 className="font-display uppercase text-brasa-100 text-[13vw] sm:text-6xl lg:text-[4.6rem] leading-[0.86] text-balance">
              Fuego argentino,
              <br />
              <span className="text-ember-400">alma valenciana.</span>
            </h1>
            <p className="font-body text-brasa-300 text-lg mt-6 max-w-[46ch]">
              Parrilla argentina en el corazón de Ruzafa. Cortes premium a la brasa, empanadas
              cortadas a cuchillo y una bodega de Malbec pensada para acompañarlos.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ember">
                Reservar mesa
              </a>
              <Link href="/carta" className="btn btn-outline">
                Ver la carta
              </Link>
            </div>
            <div className="flex items-center gap-5 mt-9 text-brasa-400 font-body text-sm">
              <span className="flex items-center gap-1.5">
                <strong className="text-gold-400 font-display text-lg">9,4</strong>/10 en TheFork
              </span>
              <span className="w-1 h-1 rounded-full bg-brasa-700" />
              <span>1.986 opiniones</span>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <Image
                src="/fotos/hero-entrana.jpg"
                alt="Entraña a la parrilla cortada, servida con pimientos de Padrón"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brasa-950/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden sm:block bg-malbec-600 text-brasa-100 rounded-xl px-5 py-4 shadow-xl">
              <p className="eyebrow text-gold-400 mb-1">Plato estrella</p>
              <p className="font-display uppercase text-xl leading-none">Entraña</p>
              <p className="font-body text-sm text-brasa-200 mt-1">Vuelta y vuelta · {entrana.precio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRENSA / PRUEBA SOCIAL */}
      <section className="bg-brasa-900 py-6">
        <div className="container-page">
          <p className="text-center font-body text-brasa-300 text-sm sm:text-base italic">
            &ldquo;Las empanadas de carne del Unión son las mejores de Valencia.&rdquo;
            <span className="not-italic text-brasa-500"> — Valencia Plaza, Guía Hedonista</span>
          </p>
        </div>
      </section>

      {/* SOBRE NOSOTROS */}
      <section className="container-page py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden order-2 md:order-1">
          <Image
            src="/fotos/empanada-vino.jpg"
            alt="Empanada casera de Unión Carnes y Vinos junto a una copa de Malbec"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 md:order-2">
          <p className="eyebrow text-ember-600 mb-3">Nuestra historia</p>
          <h2 className="font-display uppercase text-4xl text-brasa-900 leading-[0.9] mb-5">
            Cuatro amigos de Buenos Aires, un fuego en Ruzafa
          </h2>
          <p className="font-body text-brasa-900/80 mb-4 max-w-[52ch]">
            Unión nació en agosto de 2019, cuando cuatro amigos de la infancia de Buenos Aires
            decidieron traer a Valencia la parrillita de barrio con la que crecieron. Reimaginada
            en 2024 bajo nueva gestión familiar, hoy combina técnica actual con el mismo fuego de
            siempre.
          </p>
          <Link href="/historia" className="btn btn-line">
            Conocer la historia completa
          </Link>
        </div>
      </section>

      {/* CARTA DESTACADA */}
      <section className="bg-brasa-50 py-20">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="eyebrow text-ember-600 mb-3">La carta</p>
              <h2 className="font-display uppercase text-4xl text-brasa-900 leading-[0.9]">
                Carnes a la parrilla
              </h2>
            </div>
            <Link href="/carta" className="font-body font-bold text-brasa-900 underline underline-offset-4 hover:text-ember-600">
              Ver carta completa →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARTA_COMIDA.find((s) => s.id === 'carnes')!.platos.map((plato) => (
              <div key={plato.nombre} className="bg-white rounded-xl p-5 border border-brasa-200/60">
                <p className="font-display uppercase text-lg text-brasa-900 leading-tight mb-1.5">
                  {plato.nombre.split('(')[0].split('—')[0].trim()}
                </p>
                {plato.descripcion && (
                  <p className="font-body text-xs text-brasa-900/50 mb-2">{plato.descripcion}</p>
                )}
                <p className="font-body font-bold text-ember-600">{plato.precio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VINOS */}
      <section className="bg-malbec-700 py-20 text-brasa-100">
        <div className="container-page grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow text-gold-400 mb-3">Carnes & Vinos</p>
            <h2 className="font-display uppercase text-4xl leading-[0.9] mb-5">
              Malbec de Mendoza, para acompañar el fuego
            </h2>
            <p className="font-body text-brasa-200 mb-6 max-w-[48ch]">
              Bodega argentina y española elegida para maridar con parrilla: Amalaya, Saurus,
              Domaine Bousquet — y una selección de tintos de Ribera y Rioja para quien prefiera
              lo español.
            </p>
            <Link href="/vinos" className="btn btn-outline">
              Ver la carta de vinos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Amalaya Malbec', 'Saurus Malbec', 'Domaine Bousquet', 'Rioja Vega Crianza'].map((v) => (
              <div key={v} className="border border-brasa-100/20 rounded-xl p-4 font-body text-sm text-brasa-200">
                {v}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-page py-24 text-center">
        <Wordmark className="text-[15px] justify-center mb-6 [text-align:left]" tone="oscuro" />
        <h2 className="font-display uppercase text-4xl sm:text-5xl text-brasa-900 leading-[0.9] mb-6 text-balance">
          Reservá tu mesa esta semana
        </h2>
        <p className="font-body text-brasa-900/70 max-w-[48ch] mx-auto mb-8">
          Cenas de jueves a domingo. Grupos, celebraciones y sobremesas largas — con vino en la
          copa.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ember">
            Reservar en TheFork
          </a>
          <a href={NEGOCIO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
