'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Wordmark from './Wordmark';

const NAV_ES = [
  { href: '/carta', label: 'La carta' },
  { href: '/vinos', label: 'Vinos' },
  { href: '/historia', label: 'Historia' },
  { href: '/faq', label: 'Preguntas' },
];

const IDIOMAS = [
  { code: 'es', label: 'ES', flag: '🇪🇸', prefix: '' },
  { code: 'en', label: 'EN', flag: '🇬🇧', prefix: '/en' },
  { code: 'it', label: 'IT', flag: '🇮🇹', prefix: '/it' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', prefix: '/fr' },
  { code: 'de', label: 'DE', flag: '🇩🇪', prefix: '/de' },
];

const RESERVAR_LABEL: Record<string, string> = {
  es: 'Reservar',
  en: 'Book a table',
  it: 'Prenota',
  fr: 'Réserver',
  de: 'Reservieren',
};

export default function Header() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname() || '/';

  const idiomaActual = IDIOMAS.find((i) => i.prefix && pathname.startsWith(i.prefix)) ?? IDIOMAS[0];
  const base = idiomaActual.prefix;
  const pathSinPrefijo = base ? pathname.slice(base.length) || '/' : pathname;
  const esCarta = pathSinPrefijo === '/carta';
  const esIngles = idiomaActual.code === 'en';

  return (
    <header className="sticky top-0 z-50 bg-brasa-950/95 backdrop-blur border-b border-brasa-900">
      <div className="container-page flex items-center justify-between h-[74px]">
        <Link href={base || '/'} className="hover:opacity-85 transition-opacity" onClick={() => setAbierto(false)}>
          <Wordmark className="text-[13px] sm:text-[15px]" />
        </Link>

        {esCarta ? (
          <nav className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-3">
              {IDIOMAS.map((idioma) => (
                <Link
                  key={idioma.code}
                  href={(idioma.prefix || '') + pathSinPrefijo}
                  className={`eyebrow flex items-center gap-1.5 transition-colors ${
                    idioma.code === idiomaActual.code ? 'text-gold-400' : 'text-brasa-300 hover:text-gold-400'
                  }`}
                >
                  <span className="text-base leading-none not-italic">{idioma.flag}</span>
                  {idioma.label}
                </Link>
              ))}
            </div>
            <Link href="/reservar" className="btn btn-ember !py-2.5 !px-5 !text-[13px]">
              {RESERVAR_LABEL[idiomaActual.code]}
            </Link>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-7">
            {NAV_ES.map((item) => (
              <Link
                key={item.href}
                href={base + item.href}
                className="eyebrow text-brasa-200 hover:text-ember-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={esIngles ? '/' : '/en'}
              className="eyebrow flex items-center gap-1.5 text-brasa-300 hover:text-gold-400 transition-colors"
            >
              <span className="text-base leading-none not-italic">{esIngles ? '🇪🇸' : '🇬🇧'}</span>
              {esIngles ? 'ES' : 'EN'}
            </Link>
            <Link href="/reservar" className="btn btn-ember !py-2.5 !px-5 !text-[13px]">
              {esIngles ? 'Book a table' : 'Reservar'}
            </Link>
          </nav>
        )}

        <button
          className="md:hidden text-brasa-100 p-2"
          onClick={() => setAbierto((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {abierto ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {abierto && (
        <div className="md:hidden border-t border-brasa-900 bg-brasa-950">
          <div className="container-page py-4 flex flex-col gap-1">
            {esCarta ? (
              <>
                <div className="flex items-center gap-4 py-2.5">
                  {IDIOMAS.map((idioma) => (
                    <Link
                      key={idioma.code}
                      href={(idioma.prefix || '') + pathSinPrefijo}
                      onClick={() => setAbierto(false)}
                      className={`flex items-center gap-1.5 font-body text-base ${
                        idioma.code === idiomaActual.code ? 'text-gold-400' : 'text-brasa-300'
                      }`}
                    >
                      <span className="text-lg leading-none">{idioma.flag}</span>
                      {idioma.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/reservar"
                  onClick={() => setAbierto(false)}
                  className="btn btn-ember mt-3 w-full"
                >
                  {RESERVAR_LABEL[idiomaActual.code]}
                </Link>
              </>
            ) : (
              <>
                {NAV_ES.map((item) => (
                  <Link
                    key={item.href}
                    href={base + item.href}
                    onClick={() => setAbierto(false)}
                    className="py-2.5 text-brasa-100 font-body text-base border-b border-brasa-900/70"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={esIngles ? '/' : '/en'}
                  onClick={() => setAbierto(false)}
                  className="flex items-center gap-2 py-2.5 text-brasa-300 font-body text-base"
                >
                  <span className="text-lg leading-none">{esIngles ? '🇪🇸' : '🇬🇧'}</span>
                  {esIngles ? 'Ver en Español' : 'View in English'}
                </Link>
                <Link
                  href="/reservar"
                  onClick={() => setAbierto(false)}
                  className="btn btn-ember mt-3 w-full"
                >
                  {esIngles ? 'Book a table' : 'Reservar mesa'}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
