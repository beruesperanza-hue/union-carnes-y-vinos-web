import Link from 'next/link';
import Wordmark from './Wordmark';
import { NEGOCIO } from '@/lib/constants';

type Lang = 'es' | 'en' | 'it' | 'fr' | 'de';

const DIAS: Record<Lang, Record<string, string>> = {
  es: {},
  en: { Lunes: 'Monday', Martes: 'Tuesday', Miércoles: 'Wednesday', Jueves: 'Thursday', Viernes: 'Friday', Sábado: 'Saturday', Domingo: 'Sunday', Cerrado: 'Closed' },
  it: { Lunes: 'Lunedì', Martes: 'Martedì', Miércoles: 'Mercoledì', Jueves: 'Giovedì', Viernes: 'Venerdì', Sábado: 'Sabato', Domingo: 'Domenica', Cerrado: 'Chiuso' },
  fr: { Lunes: 'Lundi', Martes: 'Mardi', Miércoles: 'Mercredi', Jueves: 'Jeudi', Viernes: 'Vendredi', Sábado: 'Samedi', Domingo: 'Dimanche', Cerrado: 'Fermé' },
  de: { Lunes: 'Montag', Martes: 'Dienstag', Miércoles: 'Mittwoch', Jueves: 'Donnerstag', Viernes: 'Freitag', Sábado: 'Samstag', Domingo: 'Sonntag', Cerrado: 'Geschlossen' },
};

const TEXTOS: Record<Lang, {
  tagline: string;
  visitanos: string;
  llamar: string;
  horario: string;
  derechos: string;
  verOtroIdioma: string;
  verOtroIdiomaHref: string;
}> = {
  es: {
    tagline: 'Parrilla argentina en Ruzafa, Valencia. Proyecto familiar desde 2019.',
    visitanos: 'Visitanos',
    llamar: 'Llamar al restaurante',
    horario: 'Horario',
    derechos: 'Todos los derechos reservados.',
    verOtroIdioma: 'View in English',
    verOtroIdiomaHref: '/en',
  },
  en: {
    tagline: 'Argentine grill in Ruzafa, Valencia. Family project since 2019.',
    visitanos: 'Visit us',
    llamar: 'Call the restaurant',
    horario: 'Hours',
    derechos: 'All rights reserved.',
    verOtroIdioma: 'Ver en Español',
    verOtroIdiomaHref: '/',
  },
  it: {
    tagline: 'Griglia argentina a Ruzafa, Valencia. Un progetto di famiglia dal 2019.',
    visitanos: 'Vieni a trovarci',
    llamar: 'Chiama il ristorante',
    horario: 'Orari',
    derechos: 'Tutti i diritti riservati.',
    verOtroIdioma: 'Vedi in spagnolo',
    verOtroIdiomaHref: '/carta',
  },
  fr: {
    tagline: 'Grillades argentines à Ruzafa, Valence. Projet familial depuis 2019.',
    visitanos: 'Nous rendre visite',
    llamar: 'Appeler le restaurant',
    horario: 'Horaires',
    derechos: 'Tous droits réservés.',
    verOtroIdioma: 'Voir en espagnol',
    verOtroIdiomaHref: '/carta',
  },
  de: {
    tagline: 'Argentinischer Grill in Ruzafa, Valencia. Familienprojekt seit 2019.',
    visitanos: 'Besuchen Sie uns',
    llamar: 'Restaurant anrufen',
    horario: 'Öffnungszeiten',
    derechos: 'Alle Rechte vorbehalten.',
    verOtroIdioma: 'Auf Spanisch ansehen',
    verOtroIdiomaHref: '/carta',
  },
};

export default function Footer({ lang = 'es' }: { lang?: Lang }) {
  const t = TEXTOS[lang];
  const dias = DIAS[lang];

  return (
    <footer className="bg-brasa-950 text-brasa-200 mt-24">
      <div className="container-page py-14 grid md:grid-cols-3 gap-10">
        <div>
          <Wordmark className="text-[12px] mb-4" />
          <p className="font-body text-sm text-brasa-300 max-w-[26ch]">{t.tagline}</p>
        </div>

        <div>
          <h4 className="eyebrow text-gold-400 mb-4">{t.visitanos}</h4>
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
                {t.llamar}
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
          <h4 className="eyebrow text-gold-400 mb-4">{t.horario}</h4>
          <ul className="font-body text-sm space-y-1.5 text-brasa-300 tabular-nums">
            {NEGOCIO.horario.map((h) => (
              <li key={h.dia} className="flex justify-between gap-6">
                <span>{dias[h.dia] ?? h.dia}</span>
                <span className={h.horas === 'Cerrado' ? 'text-brasa-500' : ''}>
                  {h.horas === 'Cerrado' ? (dias.Cerrado ?? h.horas) : h.horas}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-brasa-900">
        <div className="container-page py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-brasa-500 font-body">
          <span>© 2019–2026 {NEGOCIO.nombre}. {t.derechos}</span>
          <Link href={t.verOtroIdiomaHref} className="hover:text-gold-400">
            {t.verOtroIdioma}
          </Link>
        </div>
      </div>
    </footer>
  );
}
