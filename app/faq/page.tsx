import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBoton from '@/components/WhatsAppBoton';
import { JsonLd, faqSchema } from '@/lib/schema';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description:
    'Horarios, reservas de grupos, opciones sin gluten, mascotas y cómo llegar. Todo lo que necesitas saber antes de venir a Unión Carnes y Vinos.',
  alternates: { canonical: '/faq' },
};

const PREGUNTAS = [
  {
    pregunta: '¿Hace falta reservar en Unión?',
    respuesta:
      'Lo recomendamos, especialmente viernes y sábado. Podés reservar online en TheFork o escribirnos por WhatsApp al ' +
      NEGOCIO.telefonoDisplay +
      '.',
  },
  {
    pregunta: '¿Cuánto cuesta cenar en Unión?',
    respuesta:
      'El precio medio es de 20 € por persona, aunque varía según lo que pidas. Los cortes de carne van de 23 € a 27 € e incluyen papas fritas.',
  },
  {
    pregunta: '¿Cuál es el plato más pedido?',
    respuesta:
      'La entraña vuelta y vuelta (300 g, 23 €) es nuestro plato estrella, junto con las empanadas de carne cortadas a cuchillo.',
  },
  {
    pregunta: '¿Tienen opciones vegetarianas?',
    respuesta:
      'Sí: empanada de hongos y queso azul, buñuelos de acelga, provoleta, ñoquis con burrata y varias ensaladas están marcados como vegetarianos en la carta.',
  },
  {
    pregunta: '¿Y opciones sin gluten?',
    respuesta:
      'Varios platos no llevan gluten, como la entraña, el vacío, el bife de chorizo o las mollejas. Consultá con el equipo en sala para el detalle completo de alérgenos.',
  },
  {
    pregunta: '¿Qué días están abiertos?',
    respuesta:
      'Abrimos para cenas de jueves a domingo, de 19:30 a 23:30. Lunes, martes y miércoles permanecemos cerrados.',
  },
  {
    pregunta: '¿Dónde queda Unión Carnes y Vinos?',
    respuesta:
      NEGOCIO.direccion.calle +
      ', en el barrio de Ruzafa, Valencia. A dos minutos del metro Bailén (líneas L0 y L7).',
  },
  {
    pregunta: '¿Puedo reservar para un grupo grande o una celebración?',
    respuesta:
      'Sí, escribinos por WhatsApp contándonos cuántos son y la fecha, y te confirmamos disponibilidad y opciones de menú de grupo.',
  },
  {
    pregunta: '¿Qué vinos tienen?',
    respuesta:
      'Bodega argentina (Malbec de Mendoza y Salta, Pinot Noir y Chardonnay patagónicos) y española (Ribera del Duero, Rioja, Valencia), elegida para acompañar carnes a la parrilla.',
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <WhatsAppBoton />
      <JsonLd data={faqSchema(PREGUNTAS)} />

      <section className="bg-brasa-950 py-16">
        <div className="container-page">
          <p className="eyebrow text-gold-400 mb-3">Antes de venir</p>
          <h1 className="font-display uppercase text-5xl text-brasa-100 leading-[0.88]">
            Preguntas frecuentes
          </h1>
        </div>
      </section>

      <section className="container-page py-16 max-w-[70ch]">
        <dl className="divide-y divide-brasa-200">
          {PREGUNTAS.map((p) => (
            <div key={p.pregunta} className="py-6">
              <dt className="font-display uppercase text-xl text-brasa-900 mb-2">{p.pregunta}</dt>
              <dd className="font-body text-brasa-900/75">{p.respuesta}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Footer />
    </>
  );
}
