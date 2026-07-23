import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Nuestra Historia — De Buenos Aires a Ruzafa',
  description:
    'Cuatro amigos de la infancia de Buenos Aires abrieron Unión en 2019. Hoy, nueva etapa familiar con la misma parrilla y más fuego.',
  alternates: { canonical: '/historia' },
};

export default function HistoriaPage() {
  return (
    <>
      <Header />
      <WhatsAppBoton />

      <section className="bg-brasa-950 py-16">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">Desde 2019</p>
          <h1 className="font-display uppercase text-5xl text-brasa-100 leading-[0.88]">
            Nuestra historia
          </h1>
        </div>
      </section>

      <section className="container-page py-16 grid md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
          <Image
            src="/fotos/detalle-corte.jpg"
            alt="Corte de entraña servido en Unión Carnes y Vinos"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="font-body text-brasa-900/85 space-y-5 text-[1.05rem] leading-relaxed">
          <p>
            <strong className="text-brasa-900">Agosto de 2019.</strong> Cuatro amigos de la
            infancia, todos de Buenos Aires, abren un local en Puerto Rico 38, en el corazón de
            Ruzafa. La idea es simple: traer a Valencia la parrillita de barrio con la que
            crecieron — sin pretensiones, con buena carne y mejor compañía.
          </p>
          <p>
            El boca a boca hace el resto. Las empanadas cortadas a cuchillo se vuelven la firma de
            la casa, y en 2023 la Guía Hedonista de Valencia Plaza las nombra directamente{' '}
            <em>&ldquo;las mejores de Valencia&rdquo;</em>.
          </p>
          <p>
            <strong className="text-brasa-900">2024.</strong> El proyecto entra en una nueva
            etapa bajo gestión familiar: se renueva el local, se actualiza la carta y se suma una
            bodega pensada específicamente para acompañar cortes a la parrilla — argentina y
            española. Nace el nombre que lleva hoy: <strong>Unión Carnes y Vinos</strong>.
          </p>
          <p>
            La entraña vuelta y vuelta sigue siendo el plato que todos piden. El fuego, el mismo
            de siempre.
          </p>
          <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ember mt-4">
            Reservar mesa
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
