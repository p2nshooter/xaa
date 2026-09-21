/**
 * Work built and operated by XAA.
 *
 * Every entry here is a real, running system in the studio's own account —
 * these are products we built and run ourselves, not client commissions, and
 * the page says so. Nothing is invented: the scope figures are measured from
 * the source (routes and lines of TypeScript), and the price against each one
 * is what a comparable build costs at the rates published on /services, not a
 * figure anybody was invoiced.
 */

/**
 * The studio's workers.dev subdomain, used for systems that have no custom
 * domain attached. One place to correct it if it ever changes.
 */
export const WORKERS_SUBDOMAIN = 'xaa';

export interface Work {
  slug: string;
  name: string;
  /** Live URL, or null when the system is internal / not publicly reachable. */
  url: string | null;
  urlLabel?: string;
  kind: string;
  summary: string;
  /** What is actually in it — read off the codebase, not marketing. */
  highlights: string[];
  stack: string[];
  /** Measured scope. */
  routes: number;
  loc: number;
  /** Which catalogue package a build of this size lands in. */
  packageSlug: string;
  packageName: string;
  /** Comparable build price at XAA rates, EUR. */
  priceMin: number;
  priceMax: number;
  featured?: boolean;
}

export const WORKS: Work[] = [
  {
    slug: 'axto',
    name: 'AXTO',
    url: 'https://axto.io',
    kind: 'AI & security infrastructure',
    summary:
      'A sovereign AI and security platform: model orchestration, a security operations centre, endpoint agents and a scanning engine, run as one system across twenty-three modules.',
    highlights: [
      'Orchestra — AI workflow orchestration across CPU and GPU workers',
      'SOC, sentinel and threat-feed modules for security operations',
      'Antivirus and scanning engine with edge agents',
      'Vault, compliance and legal modules',
      'Operator dashboard (the largest single module in the platform)',
      'GPU, hybrid and AI studio environments',
    ],
    stack: ['TypeScript', 'React', 'Python', 'Cloudflare Workers', 'Docker Compose'],
    routes: 121,
    loc: 113007,
    packageSlug: 'global-ecosystem',
    packageName: 'Global Enterprise Ecosystem',
    priceMin: 500000,
    priceMax: 1200000,
    featured: true,
  },
  {
    slug: 'ulyah',
    name: 'Ulyah',
    url: 'https://ulyah.com',
    kind: 'Multi-module consumer platform',
    summary:
      'An Islamic reference and study platform — Quran, hadith, classical texts, audio, prayer times and a children’s section — served in multiple languages off a shared API.',
    highlights: [
      'Quran, hadith collections, tafsir editions and pesantren texts',
      'Prayer times, qibla, hijri calendar and imsakiyah tools',
      'Kids section with iqro levels and games',
      'Audiobook and murottal streaming with multiple sources',
      'Donations, user accounts and issued certificates',
      'Multi-language routing, search and an admin panel',
      'Separate worker API with an API-key pool coordinator',
    ],
    stack: ['TypeScript', 'Next.js', 'Cloudflare Workers', 'D1', 'pnpm monorepo'],
    routes: 131,
    loc: 97709,
    packageSlug: 'saas-platform',
    packageName: 'SaaS / Web Application',
    priceMin: 120000,
    priceMax: 350000,
    featured: true,
  },
  {
    slug: 'axto-us',
    name: 'AXTO.us',
    url: 'https://axto.us',
    kind: 'Web application',
    summary:
      'A commercial web application with accounts, an administrative back office and payment flows, built on a typed schema with real migrations.',
    highlights: [
      'Authentication and session handling',
      'Administrative dashboard',
      'Payment and order flows',
      'Typed database schema with versioned migrations',
      'QR generation and short-code handling',
    ],
    stack: ['TypeScript', 'Next.js', 'Drizzle ORM', 'Zod', 'Cloudflare'],
    routes: 69,
    loc: 30552,
    packageSlug: 'saas-platform',
    packageName: 'SaaS / Web Application',
    priceMin: 45000,
    priceMax: 120000,
    featured: true,
  },
  {
    slug: 'quantum-karoseri',
    name: 'Sistem Karoseri — CV. Quantum Karya Bersama',
    url: `https://quantum-karoseri.${WORKERS_SUBDOMAIN}.workers.dev`,
    urlLabel: `quantum-karoseri.${WORKERS_SUBDOMAIN}.workers.dev`,
    kind: 'Production management platform',
    summary:
      'Workshop production management for a vehicle body-building company: from quotation to work order, through per-unit build stages, to payment terms — with a public page so customers track their own unit.',
    highlights: [
      'Quotation requests through to issued work orders (SPK)',
      'Per-unit build-stage tracking, week by week',
      'Payment term recording against each job',
      'Public progress tracking for customers, no login',
      'PDF document generation',
      'Versioned database migrations',
    ],
    stack: ['TypeScript', 'Next.js', 'Drizzle ORM', 'pdf-lib', 'Cloudflare D1'],
    routes: 64,
    loc: 17982,
    packageSlug: 'business-platform',
    packageName: 'Business Web Platform',
    priceMin: 18000,
    priceMax: 45000,
  },
  {
    slug: 'app-desa',
    name: 'App Desa — Sukakarya',
    url: null,
    kind: 'Public administration platform',
    summary:
      'A village administration system covering resident records, document requests and reporting, with QR-verifiable outputs.',
    highlights: [
      'Resident and household records',
      'Document request and issuing workflow',
      'QR verification on issued documents',
      'Role-separated administrative access',
      'Reporting views',
    ],
    stack: ['TypeScript', 'Next.js', 'Cloudflare'],
    routes: 46,
    loc: 24063,
    packageSlug: 'business-platform',
    packageName: 'Business Web Platform',
    priceMin: 25000,
    priceMax: 60000,
  },
  {
    slug: 'xaa',
    name: 'XAA.es',
    url: 'https://xaa.es',
    kind: 'Studio site + client portal',
    summary:
      'This site. A public catalogue of ten packages and, behind it, the client portal that runs every build: milestone payments, concept uploads, live progress and an activity log.',
    highlights: [
      'Ten-package catalogue driving marketing, quoting and contracts from one source',
      'Client accounts with revocable server-side sessions',
      '10 / 40 / 50 milestone schedule enforced in the data layer',
      'Build progress hard-capped at 80% until settlement clears',
      'Private file uploads, session-checked on every download',
      'Studio desk for payment verification and progress updates',
    ],
    stack: ['TypeScript', 'Next.js 15', 'Cloudflare Workers', 'D1', 'R2'],
    routes: 24,
    loc: 18165,
    packageSlug: 'business-platform',
    packageName: 'Business Web Platform',
    priceMin: 12000,
    priceMax: 30000,
  },
  {
    slug: 'axto-dev',
    name: 'AXTO.dev',
    url: 'https://axto.dev',
    kind: 'Corporate site',
    summary: 'The developer-facing site for the AXTO platform, with its own content system and accounts.',
    highlights: ['Editorial content system', 'Account area', 'Cloudflare edge deployment'],
    stack: ['TypeScript', 'Next.js', 'Cloudflare Workers'],
    routes: 8,
    loc: 13316,
    packageSlug: 'corporate-website',
    packageName: 'Corporate Website',
    priceMin: 8000,
    priceMax: 20000,
  },
];

/**
 * The publishing network — several editorial sites sharing one template and a
 * central ad and analytics service. Grouped rather than listed individually:
 * they are the same build repeated, and pretending otherwise would pad the
 * portfolio.
 */
export const NETWORK = {
  name: 'Editorial network',
  summary:
    'Five independent publishing sites on a shared template, each with its own editorial content, structured data and ad configuration, reporting into one central analytics and ad-control service.',
  sites: [
    { name: 'jai.lat', url: 'https://jai.lat', loc: 8972 },
    { name: 'lie.skin', url: 'https://lie.skin', loc: 10427 },
    { name: 'oldco.in', url: 'https://oldco.in', loc: 13176 },
    { name: 'profity.in', url: 'https://profity.in', loc: 10864 },
    { name: 'xad.es', url: 'https://xad.es', loc: 2138 },
  ],
  packageName: 'Personal / Portfolio → Company Profile',
  priceMin: 4000,
  priceMax: 12000,
  priceNote: 'per site',
};

/** Totals for the portfolio header, computed rather than typed by hand. */
export function portfolioTotals() {
  const netSites = NETWORK.sites.length;
  const loc = WORKS.reduce((n, w) => n + w.loc, 0) + NETWORK.sites.reduce((n, s) => n + s.loc, 0);
  const routes = WORKS.reduce((n, w) => n + w.routes, 0);
  const min = WORKS.reduce((n, w) => n + w.priceMin, 0) + NETWORK.priceMin * netSites;
  const max = WORKS.reduce((n, w) => n + w.priceMax, 0) + NETWORK.priceMax * netSites;
  return { systems: WORKS.length + netSites, loc, routes, min, max };
}
