import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { NEGOCIO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Unión Carnes y Vinos',
  description:
    'Preguntas y respuestas sobre Unión, parrilla argentina en Valencia. Reservas, menú, horarios, ubicación y contacto.',
  openGraph: {
    title: 'Preguntas Frecuentes | Unión Carnes y Vinos',
    description: 'Todo lo que necesitas saber sobre nuestro restaurante argentino en Ruzafa.',
  },
};

const faqs = [
  {
    pregunta: '¿Dónde está ubicado Unión Carnes y Vinos?',
    respuesta: `Nos encontramos en Carrer de Puerto Rico, 38, en el barrio de Ruzafa, Valencia (46006).`,
  },
  {
    pregunta: '¿Cuál es el horario de atención?',
    respuesta: 'Abierto de jueves a domingo, de 19:30 a 23:30.',
  },
  {
    pregunta: '¿Es necesario hacer reserva?',
    respuesta: 'Recomendamos reserva, especialmente viernes y sábados.',
  },
  {
    pregunta: '¿Qué tipo de carne sirven?',
    respuesta: 'Carnes premium argentinas a la brasa: entraña, bife de chorizo, vacío, milanesas.',
  },
  {
    pregunta: '¿Cuál es el plato más popular?',
    respuesta: 'La entraña vuelta y vuelta. 9.4/10 en TheFork.',
  },
  {
    pregunta: '¿Qué vinos ofrecen?',
    respuesta: 'Malbec argentino y tintos españoles de Ribera y Rioja.',
  },
  {
    pregunta: '¿Puedo encargar postres especiales?',
    respuesta: 'Sí, Chocotorta y Tiramisú. Consulta con 48 horas de anticipación.',
  },
  {
    pregunta: '¿Hacen eventos privados?',
    respuesta: 'Sí, aceptamos grupos y eventos privados. Contacta por WhatsApp.',
  },
  {
    pregunta: '¿Cuál es el rango de precios?',
    respuesta: 'Carnes: 23-27 €. Postres: 24-36 €. Ticket promedio: 40-50 € por persona.',
  },
  {
    pregunta: '¿Cómo hago una reserva?',
    respuesta: 'Online, WhatsApp o teléfono.',
  },
];

export default function FAQ() {
  return (
    <>
      <Header />

      <section className="bg-brasa-950 text-brasa-100 py-16">
        <div className="container-page">
          <h1 className="font-display text-5xl mb-4 leading-tight">Preguntas Frecuentes</h1>
          <p className="text-brasa-300 max-w-2xl">Todo lo que necesitas saber sobre Unión.</p>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-brasa-200 pb-8">
              <h3 className="font-display text-xl text-brasa-900 mb-3">{faq.pregunta}</h3>
              <p className="font-body text-brasa-700">{faq.respuesta}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
