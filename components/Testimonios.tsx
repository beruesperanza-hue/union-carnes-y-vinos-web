import { NEGOCIO } from '@/lib/constants';

// Opiniones reales de clientes verificados en TheFork (solo reservas/pagos
// reales pueden dejar reseña ahí). Curadas a mano — texto tal cual, apenas
// prolijizado en puntuación/mayúsculas para que se lea bien en tarjeta.
const OPINIONES = [
  {
    texto:
      'Es la 3ª vez que vamos y seguro que volveremos, el trato inmejorable y los platos increíbles.',
    autor: 'Carla E.',
    nota: '10',
  },
  {
    texto:
      'Muy rico todo, especialmente los buñuelos, las empanadas, la entraña y el tiramisú. Para volver, muy recomendable.',
    autor: 'Rosaura A.',
    nota: '10',
  },
  {
    texto:
      'La comida de 10, pero el servicio ya es otro nivel. Volveremos 100%, muchas gracias Maria Eugenia.',
    autor: 'Adela M.',
    nota: '10',
  },
  {
    texto: 'Los buñuelos de acelga hasta los niños se los comieron. Todo muy bueno y un trato excelente.',
    autor: 'Vanesa F.',
    nota: '10',
  },
  {
    texto: 'La carne y el tiramisú casero fueron espectaculares.',
    autor: 'Ilya S.',
    nota: '10',
  },
  {
    texto:
      'Es un restaurante sencillo, auténtico, con una excelente calidad de producto y una atención increíble. Totalmente recomendado.',
    autor: 'Laura C.',
    nota: '10',
  },
  {
    texto:
      'Increíble experiencia improvisada. Comida excelente, trato inmejorable. Volveremos, y seguramente pronto.',
    autor: 'Angel L.',
    nota: '10',
  },
  {
    texto: 'Una carta de buena comida argentina. La atención, excelente y muy cercana.',
    autor: 'Manu R.',
    nota: '10',
  },
  {
    texto: 'Qué puedo decir... ¡sencillamente magnífico!',
    autor: 'Juan Carlos M.',
    nota: '10',
  },
];

export default function Testimonios() {
  return (
    <section className="bg-brasa-50 py-20">
      <div className="container-page">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="eyebrow text-ember-600 mb-3">Lo dicen nuestros clientes</p>
            <h2 className="font-display uppercase text-4xl text-brasa-900 leading-[0.9]">
              9,4/10 en TheFork
            </h2>
            <p className="font-body text-sm text-brasa-900/50 mt-2">
              Basado en casi 2.000 opiniones verificadas — solo puntúa quien reservó o pagó con TheFork.
            </p>
          </div>
          <a
            href={`${NEGOCIO.theforkUrl}/opiniones`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body font-bold text-brasa-900 underline underline-offset-4 hover:text-ember-600 whitespace-nowrap"
          >
            Ver todas las opiniones →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OPINIONES.map((op) => (
            <div key={op.autor + op.texto} className="bg-white rounded-xl p-6 border border-brasa-200/60 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gold-500 tracking-tight" aria-hidden="true">
                  ★★★★★
                </span>
                <span className="font-display text-ember-600 text-sm">{op.nota}/10</span>
              </div>
              <p className="font-body text-brasa-900/80 text-sm leading-relaxed flex-1">&ldquo;{op.texto}&rdquo;</p>
              <p className="font-body text-xs font-bold text-brasa-900/50 mt-4 uppercase tracking-wide">
                {op.autor} · TheFork
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
