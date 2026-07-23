'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Wordmark from './Wordmark';
import { NEGOCIO } from '@/lib/constants';

const NAV_ES = [
  { href: '/carta', label: 'La carta' },
  { href: '/vinos', label: 'Vinos' },
  { href: '/historia', label: 'Historia' },
  { href: '/faq', label: 'Preguntas' },
];

export default function Header() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const esIngles = pathname?.startsWith('/en');
  const base = esIngles ? '/en' : '';

  return (
    <header className="sticky top-0 z-50 bg-brasa-950/95 backdrop-blur border-b border-brasa-900">
      <div className="container-page flex items-center justify-between h-[74px]">
        <Link href={base || '/'} className="hover:opacity-85 transition-opacity" onClick={() => setAbierto(false)}>
          <Wordmark className="text-[13px] sm:text-[15px]" />
        </Link>

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
            className="eyebrow text-brasa-400 hover:text-gold-400 transition-colors"
          >
            {esIngles ? 'ES' : 'EN'}
          </Link>
          <a href={NEGOCIO.theforkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ember !py-2.5 !px-5 !text-[13px]">
            {esIngles ? 'Book a table' : 'Reservar'}
          </a>
        </nav>

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
              className="py-2.5 text-brasa-400 font-body text-base"
            >
              {esIngles ? 'Ver en Español' : 'View in English'}
            </Link>
            <a
              href={NEGOCIO.theforkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ember mt-3 w-full"
            >
              {esIngles ? 'Book a table' : 'Reservar mesa'}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
