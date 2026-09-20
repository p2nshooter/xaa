/**
 * Brand configuration for xaa.es.
 *
 * xaa.es is a professional web development studio: custom websites, web
 * platforms, e-commerce, marketplaces, SaaS and enterprise systems, built for
 * European and international clients and paid in USDT or PayPal.
 *
 * The site also keeps the editorial archive it grew out of — the World Cup
 * 2026 magazine now lives under /insights and is still fully published.
 */
export const SITE = {
  id: 'xaa-es', // central ad-control + analytics key (matches ulyah admin)
  name: 'XAA',
  /** What the three letters stand for. Used across the site chrome. */
  expansion: 'eXperience · Architecture · Applications',
  expansionPlain: 'eXperience, Architecture & Applications',
  domain: 'xaa.es',
  url: 'https://xaa.es',
  tagline: 'Professional website & software development',
  description:
    'XAA — eXperience, Architecture & Applications. A European web development studio building landing pages, corporate websites, e-commerce, marketplaces, SaaS and enterprise platforms, with milestone-based payments in USDT or PayPal.',
  locale: 'en',
  email: 'hello@xaa.es',
  salesEmail: 'sales@xaa.es',
  billingEmail: 'billing@xaa.es',
  heroLead: 'Custom websites and platforms,',
  heroAccent: 'engineered to scale',
  adClient: 'ca-pub-6371903555702163',
  analyticsEndpoint: 'https://api.ulyah.com/track',
  adConfigEndpoint: 'https://api.ulyah.com/content/ad-config',
  /**
   * Editorial archive kept from the original site. Named plainly: calling
   * football coverage "Insights" in a studio's menu sets an expectation the
   * content cannot meet.
   */
  magazine: {
    path: '/insights',
    name: 'Football archive',
    blurb: 'The independent World Cup 2026 writing this domain began as. Still published, still free.',
  },
} as const;

/**
 * Copy for the editorial archive. xaa.es began as a World Cup 2026 magazine
 * and those hundred-odd articles are still published; they keep their own
 * voice rather than inheriting the studio's.
 */
export const ARCHIVE = {
  heroLead: 'The road to',
  heroAccent: 'World Cup 2026',
  tagline: 'World Cup 2026 — every match, every story',
  description:
    'Independent, original football writing for World Cup 2026 — the teams, the players, the tactics, the host cities and the history, explained with no hype and no clickbait.',
  note:
    'The XAA editorial archive. We are a web development studio; this magazine is the writing the domain grew out of, and we keep it online and free.',
} as const;

/**
 * Ads belong to the editorial archive only. The commercial side of the site
 * (home, services, pricing, the client portal) stays completely ad-free —
 * nobody signs a six-figure build off a page wrapped in banner units.
 */
export const AD_ROUTES = ['/insights', '/articles', '/category'];

export function adsAllowedOn(pathname: string): boolean {
  return AD_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
