import { NEGOCIO } from '@/lib/constants';

type Lang = 'es' | 'en' | 'it' | 'fr' | 'de';

const TEXTOS: Record<Lang, { boton: string; aria: string }> = {
  es: { boton: 'Escribinos', aria: 'Escribinos por WhatsApp' },
  en: { boton: 'WhatsApp', aria: 'Chat with us on WhatsApp' },
  it: { boton: 'WhatsApp', aria: 'Scrivici su WhatsApp' },
  fr: { boton: 'WhatsApp', aria: 'Écrivez-nous sur WhatsApp' },
  de: { boton: 'WhatsApp', aria: 'Schreiben Sie uns auf WhatsApp' },
};

export default function WhatsAppBoton({ lang = 'es' }: { lang?: Lang }) {
  const t = TEXTOS[lang];
  return (
    <a
      href={NEGOCIO.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.aria}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-[#25D366] text-brasa-950 rounded-full shadow-lg shadow-black/20 pl-3.5 pr-4 py-3 font-body font-bold text-sm hover:brightness-105 transition"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.07c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.32-1.65-.62-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36h.55c.18 0 .41-.03.63.48.24.55.8 1.9.87 2.04.07.14.11.3.02.49-.09.19-.14.3-.28.46-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.27.37-.22.62-.13.25.09 1.6.75 1.87.89.27.14.45.2.51.32.07.11.07.68-.17 1.36Z" />
      </svg>
      <span>{t.boton}</span>
    </a>
  );
}
