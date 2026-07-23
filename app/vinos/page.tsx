import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { VINOS, COCTELES } from '@/lib/menu';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Vinos Argentinos y Españoles',
  description:
    'Malbec de Mendoza, blends patagónicos y referencias españolas elegidas para carne a la parrilla. Descubre nuestra bodega en Ruzafa, Valencia.',
  alternates: { canonical: '/vinos' },
};

export default function VinosPage() {
  const argentinos = VINOS.filter((v) => v.origen === 'Argentina');
  const espanoles = VINOS.filter((v) => v.origen === 'España');

  return (
    <>
      <Header />
      <WhatsAppBoton />

      <section className="bg-malbec-700 py-16 text-brasa-100">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">Carnes & Vinos</p>
          <h1 className="font-display uppercase text-5xl leading-[0.88]">
            La bodega
          </h1>
          <p className="font-body text-brasa-200 mt-5 max-w-[52ch]">
            Elegimos cada etiqueta pensando en la parrilla: Malbec de Mendoza y Salta, blends
            patagónicos, y una selección española de Ribera, Rioja y Valencia para quien prefiere
            quedarse cerca de casa.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display uppercase text-3xl text-brasa-900 mb-1">🇦🇷 Argentina</h2>
        <div className="rule-gold w-24 mb-7" />
        <div className="grid md:grid-cols-3 gap-x-10 gap-y-8">
          {argentinos.map((sec) => (
            <div key={sec.id}>
              <h3 className="eyebrow text-ember-600 mb-3">{sec.titulo}</h3>
              <ul className="space-y-2">
                {sec.vinos.map((v) => (
                  <li key={v.nombre} className="flex justify-between gap-4 text-sm font-body text-brasa-900/85">
                    <span>{v.nombre}</span>
                    <span className="font-semibold whitespace-nowrap">{v.precio}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brasa-50 py-16">
        <div className="container-page">
          <h2 className="font-display uppercase text-3xl text-brasa-900 mb-1">🇪🇸 España</h2>
          <div className="rule-gold w-24 mb-7" />
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-8">
            {espanoles.map((sec) => (
              <div key={sec.id}>
                <h3 className="eyebrow text-ember-600 mb-3">{sec.titulo}</h3>
                <ul className="space-y-2">
                  {sec.vinos.map((v) => (
                    <li key={v.nombre} className="flex justify-between gap-4 text-sm font-body text-brasa-900/85">
                      <span>{v.nombre}</span>
                      <span className="font-semibold whitespace-nowrap">{v.precio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display uppercase text-3xl text-brasa-900 mb-1">Cócteles y copas</h2>
        <div className="rule-gold w-24 mb-7" />
        <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-2.5">
          {COCTELES.map((c) => (
            <li key={c.nombre} className="flex justify-between gap-4 border-b border-dashed border-brasa-200 pb-2 font-body text-brasa-900/85">
              <span>{c.nombre}</span>
              <span className="font-semibold whitespace-nowrap">{c.precio}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page pb-20 text-center">
        <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ember">
          Reservar mesa
        </a>
      </section>

      <Footer />
    </>
  );
}
