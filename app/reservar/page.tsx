import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Reservar Mesa',
  description:
    'Reservá online en segundos o escribinos por WhatsApp. Abierto para cenas de jueves a domingo. Carrer de Puerto Rico 38, Ruzafa, Valencia.',
  alternates: { canonical: '/reservar' },
};

export default function ReservarPage() {
  return (
    <>
      <Header />
      <WhatsAppBoton />

      <section className="bg-brasa-950 py-16">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">Reservar</p>
          <h1 className="font-display uppercase text-5xl text-brasa-100 leading-[0.88]">
            Guardamos tu mesa
          </h1>
        </div>
      </section>

      <section className="container-page py-16 grid md:grid-cols-2 gap-6">
        <a
          href={NEGOCIO.theforkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-brasa-200 p-8 hover:border-ember-500 transition-colors"
        >
          <p className="eyebrow text-ember-600 mb-3">Recomendado</p>
          <h2 className="font-display uppercase text-2xl text-brasa-900 mb-3">Reservar en TheFork</h2>
          <p className="font-body text-brasa-900/70 mb-6">
            Elegí día y horario online al instante. 9,4/10 con 1.986 opiniones — la forma más
            rápida de asegurar mesa.
          </p>
          <span className="btn btn-ember">Abrir TheFork →</span>
        </a>

        <a
          href={NEGOCIO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-brasa-200 p-8 hover:border-ember-500 transition-colors"
        >
          <p className="eyebrow text-ember-600 mb-3">Grupos y consultas</p>
          <h2 className="font-display uppercase text-2xl text-brasa-900 mb-3">Escribir por WhatsApp</h2>
          <p className="font-body text-brasa-900/70 mb-6">
            Ideal para grupos grandes, celebraciones o si preferís confirmar por mensaje directo
            con nosotros.
          </p>
          <span className="btn btn-line">{NEGOCIO.telefonoDisplay} →</span>
        </a>
      </section>

      <section className="bg-brasa-50 py-16">
        <div className="container-page grid sm:grid-cols-2 gap-10">
          <div>
            <h3 className="eyebrow text-ember-600 mb-3">Horario</h3>
            <ul className="font-body text-brasa-900 space-y-1.5 tabular-nums">
              {NEGOCIO.horario.map((h) => (
                <li key={h.dia} className="flex justify-between max-w-xs">
                  <span>{h.dia}</span>
                  <span className={h.horas === 'Cerrado' ? 'text-brasa-900/40' : 'font-semibold'}>
                    {h.horas}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-ember-600 mb-3">Dónde estamos</h3>
            <p className="font-body text-brasa-900 mb-1">{NEGOCIO.direccion.calle}</p>
            <p className="font-body text-brasa-900/70 mb-4">
              {NEGOCIO.direccion.barrio}, {NEGOCIO.direccion.localidad} · Metro Bailén (L0, L7)
            </p>
            <a href={NEGOCIO.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line">
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
