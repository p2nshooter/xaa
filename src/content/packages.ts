/**
 * The XAA service catalogue.
 *
 * ONE source of truth. The marketing pages, the order form, the project
 * record and the payment schedule all read from here, so a price can never
 * say one thing on /services and another inside the client portal.
 *
 * Money is stored in whole euros. Prices are European market rates for
 * custom development; USD figures shown to the client are derived at
 * `USD_PER_EUR` purely so a USDT payer knows roughly what to send — the
 * contract itself is always in EUR.
 */

export const USD_PER_EUR = 1.08;

export type Tier = 'starter' | 'business' | 'advanced' | 'enterprise';

export interface Package {
  slug: string;
  code: string; // catalogue number shown to clients, e.g. "W-03"
  name: string;
  tier: Tier;
  icon: string;
  summary: string;
  /** Who this is genuinely the right size for. */
  bestFor: string[];
  priceMin: number; // EUR
  priceMax: number; // EUR
  /** True when the upper bound is really "and beyond" (bespoke scope). */
  openEnded?: boolean;
  /** Working-day range, used to project a delivery date at order time. */
  daysMin: number;
  daysMax: number;
  timeline: string; // human label, e.g. "3–10 days"
  pages: string;
  /** Everything included in the build price. */
  includes: string[];
  /** Available on top, quoted separately. */
  optional?: string[];
  /** Default setup plan and care plan we recommend with this package. */
  recommendedSetup: string; // setup plan slug
  recommendedCare: string; // care plan slug
  popular?: boolean;
}

export const PACKAGES: Package[] = [
  {
    slug: 'landing-page',
    code: 'W-01',
    name: 'Landing Page',
    tier: 'starter',
    icon: '◈',
    summary:
      'One page, engineered to convert: a single offer, a single audience and a single call to action, built for speed and measured from day one.',
    bestFor: ['Product or campaign launches', 'Freelancers and personal brands', 'Paid-traffic destinations', 'Pre-launch waiting lists'],
    priceMin: 500,
    priceMax: 1500,
    daysMin: 3,
    daysMax: 10,
    timeline: '3–10 days',
    pages: '1 page (multi-section)',
    includes: [
      'Modern, fully responsive design (mobile / tablet / desktop)',
      'Hero, services or product section, pricing, testimonials, FAQ',
      'Contact form with spam protection and email delivery',
      'Conversion-focused copy layout and CTA structure',
      'Core Web Vitals performance pass',
      'Basic on-page SEO and social preview cards',
      'SSL, deployment and go-live',
      'Analytics install and goal tracking',
    ],
    optional: ['Copywriting', 'A/B test variant', 'Multi-language version'],
    recommendedSetup: 'setup-launch',
    recommendedCare: 'care-essential',
  },
  {
    slug: 'portfolio-website',
    code: 'W-02',
    name: 'Personal / Portfolio Website',
    tier: 'starter',
    icon: '◇',
    summary:
      'A personal platform with a real content system behind it, so your work, writing and contact points stay yours to update.',
    bestFor: ['Designers, photographers, architects', 'Consultants and coaches', 'Creators and speakers', 'Personal brands'],
    priceMin: 1000,
    priceMax: 3000,
    daysMin: 7,
    daysMax: 21,
    timeline: '1–3 weeks',
    pages: '5–10 pages',
    includes: [
      'Custom UI/UX design — no bought template',
      'Profile, portfolio and project case-study pages',
      'Blog with categories and tags',
      'Content management system, trained handover included',
      'Contact form and social integrations',
      'SEO structure, sitemap and structured data',
      'Analytics dashboard',
      'Responsive design and accessibility pass',
    ],
    optional: ['Newsletter integration', 'Client login area', 'Shop for prints or digital products'],
    recommendedSetup: 'setup-launch',
    recommendedCare: 'care-essential',
  },
  {
    slug: 'company-profile',
    code: 'W-03',
    name: 'Company Profile Website',
    tier: 'business',
    icon: '▣',
    summary:
      'The website a serious company is judged by: clear positioning, credible proof, and a content system your team can actually run.',
    bestFor: ['SMEs and growing companies', 'Professional services firms', 'Manufacturers and suppliers', 'Local multi-branch businesses'],
    priceMin: 2500,
    priceMax: 7500,
    daysMin: 14,
    daysMax: 42,
    timeline: '2–6 weeks',
    pages: '8–20 pages',
    popular: true,
    includes: [
      'Professional homepage and interior page system',
      'About, services, products, team and portfolio sections',
      'Blog / news centre',
      'Contact pages with Google Maps and multi-office support',
      'Full CMS with editorial roles',
      'SEO foundation: metadata, schema, internal linking, sitemap',
      'Analytics and conversion tracking',
      'Security hardening and performance optimisation',
      'Deployment, SSL and go-live support',
    ],
    optional: ['Multi-language', 'CRM integration', 'Newsletter system', 'Advanced SEO programme'],
    recommendedSetup: 'setup-business',
    recommendedCare: 'care-growth',
  },
  {
    slug: 'corporate-website',
    code: 'W-04',
    name: 'Corporate Website',
    tier: 'business',
    icon: '▤',
    summary:
      'A large, multi-audience corporate site — investors, candidates, press and customers each served properly, in every language you operate in.',
    bestFor: ['Established corporates', 'Groups with multiple divisions', 'Listed and investor-facing companies', 'International brands'],
    priceMin: 5000,
    priceMax: 15000,
    daysMin: 28,
    daysMax: 70,
    timeline: '4–10 weeks',
    pages: '15–50+ pages',
    includes: [
      'Custom UI/UX and a documented design system',
      'Advanced CMS with workflow and publishing roles',
      'News centre, press room and media library',
      'Careers section with vacancy management',
      'Investor relations and corporate governance pages',
      'Company structure and division architecture',
      'Site-wide search with filters',
      'Multi-language with per-market content',
      'Advanced SEO and migration plan with redirects',
      'CRM and API integrations',
      'Security hardening, monitoring and performance budget',
    ],
    optional: ['Accessibility (WCAG) certification pass', 'Investor data feeds', 'Intranet portal'],
    recommendedSetup: 'setup-business',
    recommendedCare: 'care-business',
  },
  {
    slug: 'business-platform',
    code: 'W-05',
    name: 'Business Web Platform',
    tier: 'advanced',
    icon: '▥',
    summary:
      'Not a brochure — a working system. Customer accounts, bookings, an operational dashboard and the reporting your team runs the business on.',
    bestFor: ['Restaurants and hospitality groups', 'Clinics and healthcare practices', 'Schools and training providers', 'Property and professional service firms'],
    priceMin: 7500,
    priceMax: 20000,
    daysMin: 42,
    daysMax: 84,
    timeline: '6–12 weeks',
    pages: 'Public site + application',
    includes: [
      'Public website plus authenticated customer accounts',
      'Admin dashboard with role-based user management',
      'Content management for every public surface',
      'Booking / reservation engine with availability rules',
      'Email and in-app notifications',
      'Operational reports and analytics',
      'Database design, migrations and backups',
      'CRM and third-party API integration',
      'Security review and hardening',
      'Responsive web application across all devices',
    ],
    optional: ['Online payments', 'SMS / WhatsApp notifications', 'Multi-branch or franchise mode'],
    recommendedSetup: 'setup-platform',
    recommendedCare: 'care-business',
  },
  {
    slug: 'ecommerce',
    code: 'W-06',
    name: 'Professional E-Commerce',
    tier: 'advanced',
    icon: '▦',
    summary:
      'A store built around your margins: catalogue depth, a checkout that does not leak, and the back office that keeps fulfilment honest.',
    bestFor: ['Retail and D2C brands', 'B2B wholesalers', 'Subscription products', 'Multi-warehouse operations'],
    priceMin: 10000,
    priceMax: 40000,
    daysMin: 56,
    daysMax: 112,
    timeline: '8–16 weeks',
    pages: 'Storefront + back office',
    popular: true,
    includes: [
      'Product, variant and category management',
      'Search, faceted filters and merchandising rules',
      'Cart and a conversion-optimised checkout',
      'Customer accounts, addresses and order history',
      'Order management, fulfilment states and returns',
      'Payment gateway integration',
      'Shipping and carrier integration with live rates',
      'Invoicing and tax/VAT handling',
      'Discounts, coupons and campaign pricing',
      'Transactional email programme',
      'Admin dashboard, roles and audit trail',
      'E-commerce analytics and SEO for catalogue pages',
      'Security hardening and PCI-aware architecture',
    ],
    optional: ['Subscriptions and memberships', 'B2B price lists and quotes', 'Multi-vendor', 'Multi-currency and multi-language', 'ERP / CRM integration'],
    recommendedSetup: 'setup-platform',
    recommendedCare: 'care-business',
  },
  {
    slug: 'marketplace',
    code: 'W-07',
    name: 'Custom Marketplace',
    tier: 'enterprise',
    icon: '◭',
    summary:
      'Three products in one build — buyer, seller and operator — with the commission, payout and dispute machinery that makes a marketplace survive its first thousand transactions.',
    bestFor: ['Multi-vendor commerce', 'Service and booking marketplaces', 'Rental and listing platforms', 'Regional commerce networks'],
    priceMin: 25000,
    priceMax: 100000,
    openEnded: true,
    daysMin: 84,
    daysMax: 168,
    timeline: '12–24 weeks',
    pages: 'Buyer + seller + admin systems',
    includes: [
      'BUYER: registration, profile, search, cart, checkout, orders, reviews, wishlist, notifications',
      'SELLER: onboarding and verification, seller dashboard, product and inventory management, orders, revenue, withdrawals, analytics',
      'ADMIN: user and seller management, product moderation, transaction monitoring, commission engine, reports, dispute management, system settings',
      'Commission, fee and payout rules engine',
      'Wallet and escrow-style balance handling',
      'Search infrastructure with ranking and filters',
      'Notification system across email and in-app',
      'Scalable database design and caching strategy',
      'Security architecture and abuse controls',
      'Cloud deployment with monitoring and backups',
    ],
    optional: ['AI recommendations', 'Fraud detection', 'Multi-country and multi-currency', 'Mobile app API', 'KYC provider integration'],
    recommendedSetup: 'setup-enterprise',
    recommendedCare: 'care-enterprise',
  },
  {
    slug: 'saas-platform',
    code: 'W-08',
    name: 'SaaS / Web Application',
    tier: 'enterprise',
    icon: '◮',
    summary:
      'A subscription product with real tenancy, billing and roles — the commercial plumbing that turns software into recurring revenue.',
    bestFor: ['CRM, ERP and HR platforms', 'Accounting and finance tools', 'Project management products', 'AI, marketing and support platforms'],
    priceMin: 35000,
    priceMax: 150000,
    openEnded: true,
    daysMin: 98,
    daysMax: 196,
    timeline: '14–28 weeks',
    pages: 'Full product + admin',
    includes: [
      'Authentication, sessions and account recovery',
      'Multi-tenant data model with organisation and user roles',
      'Product dashboard and core application surface',
      'Subscription plans, trials, upgrades and dunning',
      'Billing and payment provider integration',
      'Backend services, queues and scheduled jobs',
      'Relational database design with migrations',
      'Public and internal API with documentation',
      'Admin panel and support tooling',
      'Notifications, email programme and in-app messaging',
      'Product analytics, logging and error tracking',
      'Security review, rate limiting and data protection',
      'Cloud deployment, staging environment and CI/CD',
    ],
    optional: ['AI features and model integration', 'SSO for enterprise customers', 'Usage-based billing', 'Mobile application', 'Data residency per region'],
    recommendedSetup: 'setup-enterprise',
    recommendedCare: 'care-enterprise',
  },
  {
    slug: 'enterprise-platform',
    code: 'W-09',
    name: 'Enterprise Platform',
    tier: 'enterprise',
    icon: '◰',
    summary:
      'Customer, employee and partner portals on one governed architecture, with the security, auditability and uptime an enterprise signs for.',
    bestFor: ['Large companies and groups', 'Financial services', 'Healthcare and logistics', 'Public sector and regulated industries'],
    priceMin: 100000,
    priceMax: 500000,
    openEnded: true,
    daysMin: 168,
    daysMax: 280,
    timeline: '24–40 weeks',
    pages: 'Multi-portal enterprise system',
    includes: [
      'Customer portal, employee portal and partner portal',
      'Microservices architecture behind an API gateway',
      'Authentication, authorisation and full RBAC',
      'SSO, MFA and enterprise identity integration',
      'Audit logs and compliance-ready reporting',
      'Cloud infrastructure as code',
      'Load balancing, CDN and database clustering',
      'Backup, retention and disaster recovery plan',
      'Security architecture, threat model and hardening',
      'Monitoring, alerting and observability stack',
      'ERP, CRM, payment and logistics integrations',
      'Third-party API integration layer',
      'Enterprise support and onboarding for internal teams',
    ],
    optional: ['Data warehouse and BI layer', 'Regulatory compliance programme', 'Dedicated environment per region', '24/7 incident response'],
    recommendedSetup: 'setup-enterprise',
    recommendedCare: 'care-enterprise',
  },
  {
    slug: 'global-ecosystem',
    code: 'W-10',
    name: 'Global Enterprise Ecosystem',
    tier: 'enterprise',
    icon: '◈◈',
    summary:
      'A complete digital ecosystem: customer, partner and internal platforms, an AI layer, and global infrastructure run to an SLA.',
    bestFor: ['International groups', 'Multi-country operations', 'Financial and logistics networks', 'Organisations consolidating many systems'],
    priceMin: 500000,
    priceMax: 1500000,
    openEnded: true,
    daysMin: 280,
    daysMax: 504,
    timeline: '40–72 weeks',
    pages: 'Ecosystem of platforms',
    includes: [
      'CUSTOMER PLATFORM: accounts, subscriptions, wallet, orders, support, loyalty',
      'PARTNER PLATFORM: partner accounts, dashboards, commission engine, API access',
      'INTERNAL PLATFORM: employee management, HR, finance, operations, analytics',
      'AI ECOSYSTEM: assistant, customer support, analytics, recommendations, automation',
      'GLOBAL INFRASTRUCTURE: cloud architecture, microservices, Kubernetes, CDN, load balancing, monitoring, disaster recovery',
      'ENTERPRISE SECURITY: SSO, MFA, RBAC, encryption, audit logs, security monitoring, compliance architecture',
      'GLOBAL SUPPORT: 24/7 monitoring, technical support, maintenance, incident response, SLA',
      'Programme management, architecture governance and documentation',
    ],
    optional: ['Dedicated delivery team', 'Multi-region data residency', 'Custom AI model training', 'Managed operations centre'],
    recommendedSetup: 'setup-enterprise',
    recommendedCare: 'care-enterprise',
  },
];

export function getPackage(slug: string): Package | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}

/* ───────────────────────── Add-on services ───────────────────────── */

export interface AddOn {
  slug: string;
  name: string;
  icon: string;
  priceMin: number;
  priceMax: number;
  openEnded?: boolean;
  blurb: string;
}

export const ADDONS: AddOn[] = [
  { slug: 'ui-ux', name: 'UI/UX Design', icon: '✎', priceMin: 2000, priceMax: 30000, blurb: 'Research, wireframes, high-fidelity design and a reusable design system.' },
  { slug: 'branding', name: 'Branding', icon: '◎', priceMin: 1500, priceMax: 15000, blurb: 'Logo, identity system, typography, colour and brand guidelines.' },
  { slug: 'seo', name: 'SEO Programme', icon: '⌕', priceMin: 1000, priceMax: 10000, openEnded: true, blurb: 'Technical SEO, content architecture, schema and ongoing optimisation.' },
  { slug: 'ai', name: 'AI Integration', icon: '◍', priceMin: 5000, priceMax: 100000, openEnded: true, blurb: 'Assistants, retrieval over your own data, automation and AI features inside your product.' },
  { slug: 'api', name: 'API Integration', icon: '⇄', priceMin: 2000, priceMax: 30000, openEnded: true, blurb: 'Connect ERP, CRM, logistics, accounting or any third-party system.' },
  { slug: 'payments', name: 'Payment Integration', icon: '€', priceMin: 1000, priceMax: 10000, openEnded: true, blurb: 'Card, SEPA, wallet and crypto payment flows with reconciliation.' },
  { slug: 'security-audit', name: 'Security Audit', icon: '⛨', priceMin: 3000, priceMax: 30000, openEnded: true, blurb: 'Threat model, penetration testing, dependency and configuration review.' },
  { slug: 'performance', name: 'Performance Optimisation', icon: '⚡', priceMin: 1500, priceMax: 15000, blurb: 'Core Web Vitals, caching, query tuning and infrastructure right-sizing.' },
  { slug: 'migration', name: 'Migration & Data Import', icon: '⇪', priceMin: 1500, priceMax: 25000, openEnded: true, blurb: 'Move content, catalogue, customers and history off your old platform without losing rankings.' },
  { slug: 'copywriting', name: 'Copywriting & Localisation', icon: '✍', priceMin: 800, priceMax: 12000, blurb: 'Commercial copy, and translation into every market you sell in.' },
];

/* ───────────── One-time setup (separate from the build) ───────────── */

export interface SetupPlan {
  slug: string;
  name: string;
  price: number; // EUR, one-time
  priceMax?: number;
  custom?: boolean;
  blurb: string;
  includes: string[];
}

export const SETUP_PLANS: SetupPlan[] = [
  {
    slug: 'setup-launch',
    name: 'Launch Setup',
    price: 149,
    priceMax: 399,
    blurb: 'A single guided setup session for a website build. We do the configuration with you, once, and hand you the keys.',
    includes: [
      'Domain and DNS configuration',
      'SSL certificate and HTTPS enforcement',
      'Hosting environment configuration and deploy',
      'Business email records (SPF, DKIM, DMARC)',
      'Google Analytics and Search Console',
      'Sitemap submission and indexing check',
      'Backup schedule',
      '1 handover / training call (60 min)',
    ],
  },
  {
    slug: 'setup-business',
    name: 'Business Setup',
    price: 399,
    priceMax: 899,
    blurb: 'Everything in Launch Setup plus the tracking, mail and integration wiring a working company site needs.',
    includes: [
      'Everything in Launch Setup',
      'Staging environment',
      'Transactional email provider configuration',
      'Conversion tracking and tag manager',
      'CRM or newsletter connection',
      'CDN and caching configuration',
      'Uptime monitoring and alerts',
      '2 training sessions for your team',
    ],
  },
  {
    slug: 'setup-platform',
    name: 'Platform Setup',
    price: 899,
    priceMax: 2500,
    blurb: 'Application-grade setup: environments, payments, jobs, observability and a documented runbook.',
    includes: [
      'Everything in Business Setup',
      'Production, staging and preview environments',
      'Payment gateway and webhook configuration',
      'Background jobs and scheduled tasks',
      'Database backup, restore test and retention policy',
      'Error tracking and log aggregation',
      'Role and permission configuration',
      'Operations runbook and admin documentation',
    ],
  },
  {
    slug: 'setup-enterprise',
    name: 'Enterprise Setup',
    price: 2500,
    custom: true,
    blurb: 'Infrastructure provisioning, identity, security baseline and go-live governance for enterprise programmes. Scoped per engagement.',
    includes: [
      'Cloud account structure and infrastructure as code',
      'Network, firewall and secrets management',
      'SSO / MFA and directory integration',
      'CI/CD pipelines with approval gates',
      'Observability stack and on-call routing',
      'Disaster recovery drill',
      'Security baseline and compliance documentation',
      'Go-live plan, cutover rehearsal and support window',
    ],
  },
];

export function getSetupPlan(slug: string): SetupPlan | undefined {
  return SETUP_PLANS.find((p) => p.slug === slug);
}

/* ───────────── Monthly care (separate from the build) ───────────── */

export interface CarePlan {
  slug: string;
  name: string;
  price: number; // EUR / month
  priceMax?: number;
  custom?: boolean;
  response: string;
  hours: string;
  blurb: string;
  includes: string[];
  popular?: boolean;
}

export const CARE_PLANS: CarePlan[] = [
  {
    slug: 'care-essential',
    name: 'Essential Care',
    price: 99,
    response: '2 business days',
    hours: '2 hours / month',
    blurb: 'Keeps a website safe, current and online. For landing pages and portfolio sites.',
    includes: [
      'Platform, dependency and security updates',
      'Daily backups with 30-day retention',
      'Uptime monitoring',
      'SSL renewal and DNS care',
      'Malware and vulnerability scanning',
      'Monthly health report',
      '2 hours of content or small changes',
      'Email support',
    ],
  },
  {
    slug: 'care-growth',
    name: 'Growth Care',
    price: 299,
    response: '1 business day',
    hours: '6 hours / month',
    popular: true,
    blurb: 'Maintenance plus continuous improvement for a company site that has to perform.',
    includes: [
      'Everything in Essential Care',
      'Daily backups with 90-day retention',
      'Performance monitoring and quarterly tuning',
      'SEO health checks and fixes',
      'Analytics reporting with commentary',
      '6 hours of changes, content or new sections',
      'Staging environment for review',
      'Email and chat support',
    ],
  },
  {
    slug: 'care-business',
    name: 'Business Care',
    price: 749,
    response: '4 business hours',
    hours: '16 hours / month',
    blurb: 'For platforms and stores where downtime costs money. Proactive, monitored, on call in business hours.',
    includes: [
      'Everything in Growth Care',
      'Application and database monitoring with alerting',
      'Incident response during business hours',
      'Monthly release cycle for improvements',
      'Payment, integration and webhook monitoring',
      'Quarterly security review',
      '16 hours of development each month',
      'Dedicated account contact',
    ],
  },
  {
    slug: 'care-enterprise',
    name: 'Enterprise Care',
    price: 2500,
    priceMax: 10000,
    custom: true,
    response: '1 hour, 24/7 under SLA',
    hours: 'Dedicated capacity',
    blurb: 'Contracted SLA, 24/7 monitoring and a named team. Scoped to your architecture and compliance obligations.',
    includes: [
      'Everything in Business Care',
      '24/7 monitoring and incident response',
      'Contractual SLA with response and resolution targets',
      'Named engineers and a delivery manager',
      'Capacity planning and cost optimisation',
      'Disaster recovery drills',
      'Compliance and audit support',
      'Roadmap and architecture reviews',
      'Optional dedicated development team',
    ],
  },
];

export function getCarePlan(slug: string): CarePlan | undefined {
  return CARE_PLANS.find((p) => p.slug === slug);
}

/* ───────────────────────── Money helpers ───────────────────────── */

export function eur(amount: number): string {
  return `€${amount.toLocaleString('en-GB')}`;
}

export function usd(amountEur: number): string {
  const v = Math.round((amountEur * USD_PER_EUR) / 10) * 10;
  return `$${v.toLocaleString('en-GB')}`;
}

export function priceRange(min: number, max: number, openEnded?: boolean): string {
  return `${eur(min)} – ${eur(max)}${openEnded ? '+' : ''}`;
}

export const TIER_LABEL: Record<Tier, string> = {
  starter: 'Starter',
  business: 'Business',
  advanced: 'Advanced',
  enterprise: 'Enterprise',
};

/* ──────────── Which add-ons actually belong to which package ──────────── */

/**
 * Add-ons worth offering alongside each package, most relevant first.
 *
 * The package pages used to show the first four entries of ADDONS regardless
 * of what was being sold, so an enterprise platform quote suggested
 * copywriting while an e-commerce build never surfaced payment integration.
 * The order here is a sales judgement, not an alphabetical accident.
 */
const RELATED_ADDONS: Record<string, string[]> = {
  'landing-page': ['copywriting', 'ui-ux', 'seo', 'performance'],
  'portfolio-website': ['ui-ux', 'branding', 'copywriting', 'seo'],
  'company-profile': ['seo', 'ui-ux', 'copywriting', 'migration'],
  'corporate-website': ['seo', 'ui-ux', 'migration', 'api'],
  'business-platform': ['api', 'ui-ux', 'payments', 'security-audit'],
  ecommerce: ['payments', 'migration', 'seo', 'api'],
  marketplace: ['payments', 'security-audit', 'api', 'ai'],
  'saas-platform': ['ai', 'api', 'payments', 'security-audit'],
  'enterprise-platform': ['security-audit', 'api', 'performance', 'ai'],
  'global-ecosystem': ['ai', 'security-audit', 'api', 'branding'],
};

export function relatedAddons(packageSlug: string, limit = 4): AddOn[] {
  const slugs = RELATED_ADDONS[packageSlug] ?? [];
  const picked = slugs
    .map((s) => ADDONS.find((a) => a.slug === s))
    .filter((a): a is AddOn => Boolean(a));
  // Any package we have not mapped still gets a sensible list rather than none.
  return (picked.length ? picked : ADDONS).slice(0, limit);
}
