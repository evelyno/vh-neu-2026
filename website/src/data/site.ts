/**
 * Zentrale Stammdaten der Website.
 * Hier werden alle seitenübergreifenden Inhalte (Firmendaten, Navigation,
 * Standardtexte für SEO) gepflegt — Header, Footer und alle Seiten greifen
 * darauf zu. Änderungen an Adresse, Telefon o. Ä. nur hier vornehmen.
 */

export const company = {
  legalName: 'Vonhoegen Bauunternehmung GmbH',
  shortName: 'Vonhoegen',
  street: 'Monnetstraße 5',
  postalCode: '52146',
  city: 'Würselen',
  region: 'Nordrhein-Westfalen',
  regionShort: 'NRW',
  country: 'DE',
  countryName: 'Deutschland',
  // Telefon in zwei Formaten: anzeige + maschinenlesbar (tel:)
  phone: '+49 (0)2405 - 4294-860',
  phoneHref: '+4924054294860',
  fax: '+49 (0)2405 - 4294-862',
  mobile: '+49 (0)171 - 2135501',
  mobileHref: '+491712135501',
  email: 'info@vonhoegen-bauunternehmung.de',
  // Haupteinzugsgebiet (für lokale SEO / GEO)
  primaryArea: 'Aachen & Städteregion',
  serviceAreas: ['Würselen', 'Aachen', 'Städteregion Aachen', 'Düsseldorf', 'Köln', 'Rheinland'],
  foundingHint: 'seit 1987',
  geo: { lat: 50.8231, lng: 6.1287 }, // Würselen (Richtwert — bei Bedarf präzisieren)
} as const;

/**
 * Hero-Variante der Startseite.
 *  'v2' = neue, links-unten verankerte Variante (harmoniert mit den Unterseiten)
 *  'v1' = ursprüngliche, zentrierte Variante
 * Zum Zurückwechseln einfach auf 'v1' setzen.
 */
export const heroVariant: 'v1' | 'v2' = 'v2';

export type NavChild = { label: string; href: string; img?: string; desc?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

/** Hauptnavigation — von Header (Desktop-Mega-Menü + Mobile) genutzt. */
export const nav: NavItem[] = [
  { label: 'Startseite', href: '/' },
  {
    label: 'Leistungen',
    href: '/leistungen',
    children: [
      {
        label: 'Industriebau',
        href: '/leistungen/industriebau',
        img: '/img/industriebau.webp',
        desc: 'Produktions-, Logistik- & Gewerbehallen — schlüsselfertig.',
      },
      {
        label: 'Pharmabau',
        href: '/leistungen/pharmabau',
        img: '/img/pharma-reinraum.webp',
        desc: 'Reinraum- & GMP-konformer Bau, validierbar dokumentiert.',
      },
      {
        label: 'Brandschutz',
        href: '/leistungen/brandschutz',
        img: '/img/brandschutz.webp',
        desc: 'Konzepte, Schottungen & Ertüchtigungen nach Norm.',
      },
      {
        label: 'Sanierung',
        href: '/leistungen/sanierung',
        img: '/img/sanierung.webp',
        desc: 'Schadstoff- & Rückbau nach TRGS 519, energetisch revitalisiert.',
      },
      {
        label: 'Privatbau',
        href: '/leistungen/privatbau',
        img: '/img/umbau.webp',
        desc: 'Wohnungsbau & Bauen im Bestand — vom Eigenheim bis zum Umbau.',
      },
    ],
  },
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'Referenzen', href: '/referenzen' },
  { label: 'Kontakt', href: '/kontakt' },
];

/** Footer-Spalten (separat pflegbar). */
export const footerLeistungen: NavChild[] = nav.find((n) => n.label === 'Leistungen')!.children!;

export const footerUnternehmen: NavChild[] = [
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'Referenzen', href: '/referenzen' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutz', href: '/datenschutz' },
];
