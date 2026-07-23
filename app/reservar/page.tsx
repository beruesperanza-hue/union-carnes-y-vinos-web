import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import ReservationForm from '@/components/reservas/ReservationForm';
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

      <section className="container-page py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
        <div className="bg-white rounded-2xl border border-brasa-200 p-6 sm:p-8">
          <ReservationForm />
        </div>

        <div className="space-y-6">
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
            <a href={NEGOCIO.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line !py-2.5">
              Cómo llegar
            </a>
          </div>

          <div className="border-t border-brasa-200 pt-6">
            <h3 className="eyebrow text-brasa-900/50 mb-3">Otras formas de reservar</h3>
            <div className="flex flex-col gap-2">
              <a
                href={NEGOCIO.theforkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-brasa-900/70 underline underline-offset-4 hover:text-ember-600"
              >
                Reservar en TheFork →
              </a>
              <a
                href={NEGOCIO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-brasa-900/70 underline underline-offset-4 hover:text-ember-600"
              >
                Escribir por WhatsApp ({NEGOCIO.telefonoDisplay}) →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
