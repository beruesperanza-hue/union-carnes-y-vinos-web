import type { MetadataRoute } from 'next';
import { NEGOCIO } from '@/lib/constants';

// Permitimos explícitamente los crawlers de los principales motores de IA
// (GEO/AEO): que la carta, horarios y FAQ sean legibles y citables.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
    ],
    sitemap: `${NEGOCIO.sitio}/sitemap.xml`,
  };
}
