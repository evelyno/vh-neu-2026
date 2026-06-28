/**
 * Hilfsfunktionen zum Erzeugen von JSON-LD (Schema.org).
 * Sorgt für konsistente, suchmaschinen- & LLM-freundliche strukturierte Daten.
 */
import { company } from '../data/site';

const SITE = 'https://www.vonhoegen-bauunternehmung.de';

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a.replace(/<[^>]+>/g, '') },
    })),
  };
}

export function breadcrumbSchema(items: { label: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: new URL(c.href, SITE).href,
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.serviceType ?? opts.name,
    description: opts.description,
    url: new URL(opts.url, SITE).href,
    provider: { '@id': `${SITE}/#organization` },
    areaServed: company.serviceAreas.map((a) => ({ '@type': 'City', name: a })),
  };
}
