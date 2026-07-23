// Recrea el wordmark real de la carta impresa: "UNIÓN" grande + "CARNES &
// VINOS" apilado más chico a la derecha, "DESDE 2019" vertical a la
// izquierda. Tipográfico (sin archivo de logo), así escala perfecto en
// cualquier tamaño y no depende de un PNG.
export default function Wordmark({
  className = '',
  tone = 'claro',
}: {
  className?: string;
  tone?: 'claro' | 'oscuro';
}) {
  const fg = tone === 'claro' ? 'text-brasa-100' : 'text-brasa-900';
  const sub = tone === 'claro' ? 'text-gold-400' : 'text-malbec-600';

  return (
    <div className={`inline-flex items-end gap-2.5 ${className}`}>
      <span
        className={`font-display uppercase leading-[0.8] tracking-tight ${sub} text-[0.55em] rotate-180 [writing-mode:vertical-rl] pb-0.5 opacity-80`}
      >
        Desde 2019
      </span>
      <span className={`font-display uppercase leading-[0.78] ${fg} text-[2.6em]`}>
        Unión
      </span>
      <span className={`font-display uppercase leading-[0.92] ${sub} text-[0.95em] pb-1`}>
        Carnes
        <br />
        &amp; Vinos
      </span>
    </div>
  );
}
