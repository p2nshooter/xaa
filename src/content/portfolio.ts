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
 * The studio's workers.dev subdomain, for systems with no custom domain.
 *
 * Deliberately EMPTY until someone has opened the resulting URL and seen it
 * answer. This environment cannot reach *.workers.dev to check, and a dead
 * link on a portfolio page costs more credibility than a missing one — so a
 * work with no verified URL renders without a button instead of guessing.
 * Fill this in once, and every entry using it goes live.
 */
export const WORKERS_SUBDOMAIN = 'axto';

export interface Work {
  slug: string;
  name: string;
  /** Live URL, or null when the system is internal / not publicly reachable. */
  url: string | null;
  urlLabel?: string;
  /** Shown in place of a button when a URL exists but is not yet verified. */
  urlPending?: string;
  /** Extra production domains served by the same codebase. */
  tenants?: { domain: string; url: string; note: string }[];
  /** Playable demos. Stamped, sampled and stripped of every real person. */
  demos?: { label: string; href: string; note: string }[];
  /** Renders the large DEMO / sampling-only stamp across the entry. */
  stamped?: boolean;
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
  /** For a multi-app platform: each app/module priced on its own. */
  modules?: WorkModule[];
}

/** One app/module inside a platform, with its own measured size and price. */
export interface WorkModule {
  name: string;
  purpose: string;
  loc: number;
  priceMin: number;
  priceMax: number;
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
    // Each module priced on its own at XAA rates. Sizes are lines of code read
    // straight off the repository; the price is comparable build value, the way
    // every figure on this page is — not an invoice anyone received.
    modules: [
      { name: 'Operator Dashboard', purpose: 'The unified console that drives all twenty-plus modules — the largest single app in the platform.', loc: 46870, priceMin: 120000, priceMax: 300000 },
      { name: 'Detection & Scanning Engine', purpose: 'The core engine that scans, detects and classifies threats (TypeScript + Python).', loc: 15581, priceMin: 60000, priceMax: 150000 },
      { name: 'Orchestra', purpose: 'AI workload orchestration with multi-provider, multi-GPU routing.', loc: 8454, priceMin: 45000, priceMax: 110000 },
      { name: 'SOC', purpose: 'Security operations centre — alerts, cases and response workflows.', loc: 5414, priceMin: 35000, priceMax: 85000 },
      { name: 'AI Studios (CPU / GPU / Hybrid)', purpose: 'The studio environments for running and building AI workloads.', loc: 6264, priceMin: 35000, priceMax: 90000 },
      { name: 'Edge & Endpoint Agents', purpose: 'Agents that run on the edge and on endpoints, reporting back to the core.', loc: 5111, priceMin: 30000, priceMax: 70000 },
      { name: 'Sentinel', purpose: 'Real-time monitoring and detection across the fleet.', loc: 4061, priceMin: 25000, priceMax: 60000 },
      { name: 'Vault', purpose: 'Secrets and credential vault for the whole platform.', loc: 3978, priceMin: 22000, priceMax: 55000 },
      { name: 'Legal', purpose: 'Legal and case-management module.', loc: 3947, priceMin: 18000, priceMax: 45000 },
      { name: 'Compliance', purpose: 'Compliance controls, evidence and reporting.', loc: 3275, priceMin: 18000, priceMax: 45000 },
      { name: 'YP scanning service', purpose: 'Standalone Python analysis and scanning service.', loc: 2590, priceMin: 12000, priceMax: 30000 },
      { name: 'Antivirus', purpose: 'Antivirus, quarantine and cleanup.', loc: 1909, priceMin: 15000, priceMax: 40000 },
      { name: 'Threat Feed', purpose: 'Threat-intelligence feeds and enrichment.', loc: 900, priceMin: 12000, priceMax: 30000 },
    ],
  },
  {
    slug: 'ulyah',
    name: 'Ulyah ecosystem',
    url: 'https://ulyah.com',
    kind: 'Multi-tenant platform · 5 production domains',
    summary:
      'One codebase serving five independent sites, each on its own domain, in its own language, with its own visual identity — an Islamic reference and study platform covering Quran, hadith, classical texts, audio and daily practice.',
    highlights: [
      'Five tenants from a single codebase, each with a distinct theme',
      'One native language per domain, enforced in both directions',
      'Quran translations in 11 languages; scripture never machine-translated',
      'Hadith collections, tafsir editions and pesantren texts',
      'Prayer times, qibla, hijri calendar and imsakiyah tools',
      'Kids section with iqro levels and games',
      'Audiobook and murottal streaming across multiple CDN sources',
      'Donations, user accounts and issued certificates',
      'Separate worker API with an API-key pool coordinator',
    ],
    stack: ['TypeScript', 'Next.js', 'Cloudflare Workers', 'D1', 'KV', 'pnpm monorepo'],
    routes: 131,
    loc: 97709,
    packageSlug: 'enterprise-platform',
    packageName: 'Enterprise Platform',
    priceMin: 150000,
    priceMax: 400000,
    featured: true,
    tenants: [
      { domain: 'ulyah.com', url: 'https://ulyah.com', note: 'Indonesian · hub' },
      { domain: 'xad.es', url: 'https://xad.es', note: 'English' },
      { domain: '1fr.fr', url: 'https://1fr.fr', note: 'French' },
      { domain: 'tilawa.de', url: 'https://tilawa.de', note: 'German' },
      { domain: 'dawa.es', url: 'https://dawa.es', note: 'Spanish' },
    ],
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
    url: WORKERS_SUBDOMAIN ? `https://quantum-karoseri.${WORKERS_SUBDOMAIN}.workers.dev` : null,
    urlLabel: WORKERS_SUBDOMAIN ? `quantum-karoseri.${WORKERS_SUBDOMAIN}.workers.dev` : undefined,
    urlPending: 'Deployed on workers.dev — link published once verified',
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
    name: 'Desa Sukakarya — civic & election suite',
    url: null,
    urlPending: 'Production system — demos below',
    kind: 'Public administration platform',
    stamped: true,
    summary:
      'A village administration platform and the election tooling built alongside it: resident records and document issuing, voter-roll verification, a standalone voter register that runs offline, and live vote tallying.',
    highlights: [
      'Resident and household records with QR-verifiable documents',
      'Voter-roll verification with per-household grouping and flagging',
      'Offline-first voter register — no database, files merged between officers',
      'Role separation down to individual polling stations',
      'Live vote count with per-station and per-hamlet breakdowns',
      'Printable reports and recapitulation sheets',
    ],
    stack: ['TypeScript', 'Next.js', 'Cloudflare', 'Offline-first HTML'],
    routes: 46,
    loc: 24063,
    packageSlug: 'business-platform',
    packageName: 'Business Web Platform',
    priceMin: 25000,
    priceMax: 60000,
    demos: [
      {
        label: 'Voter register',
        href: '/demos/voter-list-demo',
        note: 'Sign in with any account — the PIN fills itself in',
      },
      {
        label: 'Voter-roll verification',
        href: '/demos/dpt-verification-demo',
        note: 'Household grouping, flagging and recapitulation',
      },
      {
        label: 'Live vote count',
        href: '/demos/real-count-demo',
        note: 'Per-station tallying and progress',
      },
    ],
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
    'Independent publishing sites on a shared template, each with its own editorial content, structured data and ad configuration, reporting into one central analytics and ad-control service.',
  sites: [
    { name: 'jai.lat', url: 'https://jai.lat', loc: 8972 },
    { name: 'lie.skin', url: 'https://lie.skin', loc: 10427 },
    { name: 'oldco.in', url: 'https://oldco.in', loc: 13176 },
    { name: 'profity.in', url: 'https://profity.in', loc: 10864 },
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
