import Link from 'next/link';
import Wordmark from './Wordmark';
import { NEGOCIO } from '@/lib/constants';

export default function Footer({ en = false }: { en?: boolean }) {
  return (
    <footer className="bg-brasa-950 text-brasa-200 mt-24">
      <div className="container-page py-14 grid md:grid-cols-3 gap-10">
        <div>
          <Wordmark className="text-[12px] mb-4" />
          <p className="font-body text-sm text-brasa-400 max-w-[26ch]">
            {en
              ? 'Argentine grill in Ruzafa, Valencia. Family project since 2019.'
              : 'Parrilla argentina en Ruzafa, Valencia. Proyecto familiar desde 2019.'}
          </p>
        </div>

        <div>
          <h4 className="eyebrow text-gold-400 mb-4">{en ? 'Visit us' : 'Visitanos'}</h4>
          <ul className="font-body text-sm space-y-2.5 text-brasa-300">
            <li>
              <a href={NEGOCIO.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ember-400 transition-colors">
                {NEGOCIO.direccion.calle}, {NEGOCIO.direccion.localidad}
              </a>
            </li>
            <li>
              <a href={NEGOCIO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ember-400 transition-colors">
                WhatsApp {NEGOCIO.telefonoDisplay}
              </a>
            </li>
            <li>
              <a href={`tel:${NEGOCIO.telefono}`} className="hover:text-ember-400 transition-colors">
                {en ? 'Call the restaurant' : 'Llamar al restaurante'}
              </a>
            </li>
            <li>
              <a href={NEGOCIO.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ember-400 transition-colors">
                {NEGOCIO.instagramUser}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-gold-400 mb-4">{en ? 'Hours' : 'Horario'}</h4>
          <ul className="font-body text-sm space-y-1.5 text-brasa-300 tabular-nums">
            {NEGOCIO.horario.map((h) => (
              <li key={h.dia} className="flex justify-between gap-6">
                <span>{h.dia}</span>
                <span className={h.horas === 'Cerrado' ? 'text-brasa-500' : ''}>{h.horas}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-brasa-900">
        <div className="container-page py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-brasa-500 font-body">
          <span>© 2019–2026 {NEGOCIO.nombre}. {en ? 'All rights reserved.' : 'Todos los derechos reservados.'}</span>
          <Link href={en ? '/' : '/en'} className="hover:text-gold-400">
            {en ? 'Ver en Español' : 'View in English'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
