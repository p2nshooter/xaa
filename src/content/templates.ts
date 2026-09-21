/**
 * Ready-made SaaS templates — sold as a finished, production-ready codebase.
 *
 * Each one is a complete application the buyer rebrands (logo, name, colours)
 * and ships. After payment the buyer downloads a single bundle: full source,
 * the database schema/seed, and a setup guide. Prices are one-time, in EUR, and
 * span cheap starters through super-enterprise platforms whose source alone is
 * worth hundreds of thousands to millions.
 *
 * `demoUrl` is only set when there is a real, reachable demo — a dead link on a
 * store page costs more than a missing one, exactly as on the portfolio. Where a
 * bundle is not yet uploaded the store still sells it and the download shows a
 * "preparing your bundle" state until the studio attaches the zip.
 */

export type TemplateTier = 'starter' | 'business' | 'enterprise' | 'super';

export const TIER_LABEL: Record<TemplateTier, string> = {
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
  super: 'Super Enterprise',
};

export const TIER_ORDER: TemplateTier[] = ['starter', 'business', 'enterprise', 'super'];

export interface SaaSTemplate {
  slug: string;
  name: string;
  category: string;
  tier: TemplateTier;
  tagline: string;
  summary: string;
  /** One-time price, EUR. */
  price: number;
  /** Upper bound when the build is scoped (enterprise / super tiers). */
  priceMax?: number;
  /** Only when a real running demo exists. */
  demoUrl?: string;
  stack: string[];
  /** Everything in the bundle. */
  includes: string[];
  /** The headline features of the app itself. */
  features: string[];
  /** Step-by-step: what the buyer changes to make it theirs. */
  rebrand: string[];
  popular?: boolean;
}

export const TEMPLATES: SaaSTemplate[] = [
  /* ───────── Starter — cheap, single-purpose ───────── */
  {
    slug: 'waitlist',
    name: 'Waitlist & Landing',
    category: 'Marketing',
    tier: 'starter',
    tagline: 'Collect sign-ups and referrals before you launch.',
    summary: 'A launch page with a waitlist, referral positions, email capture and a simple admin. Ship a pre-launch page in an afternoon.',
    price: 390,
    stack: ['Next.js', 'TypeScript', 'SQLite/D1', 'Email'],
    includes: ['Full source code', 'Database schema + seed', 'Setup & deployment guide', 'Rebrand guide', '3 months of bug-fix updates'],
    features: ['Waitlist with referral positions', 'Email capture and export', 'Share links and leaderboard', 'Simple admin', 'Analytics-ready'],
    rebrand: ['Replace /public/logo.svg', 'Set name and colours in config/brand.ts', 'Point .env at your database', 'Deploy'],
  },
  {
    slug: 'linkinbio',
    name: 'Link-in-Bio',
    category: 'Creators',
    tier: 'starter',
    tagline: 'A hosted links page with click analytics.',
    summary: 'A multi-user link-in-bio: profiles, blocks, themes and click analytics. Run it for yourself or as a small hosted product.',
    price: 490,
    stack: ['Next.js', 'TypeScript', 'SQLite/D1', 'Tailwind'],
    includes: ['Full source code', 'Database schema + seed', 'Setup & deployment guide', 'Rebrand guide', '3 months of bug-fix updates'],
    features: ['Profiles and link blocks', 'Themes and custom colours', 'Click analytics', 'Multi-user', 'Custom domains ready'],
    rebrand: ['Swap the logo and app name', 'Set the default theme', 'Configure .env', 'Deploy'],
  },
  {
    slug: 'formbuilder',
    name: 'Forms & Surveys',
    category: 'Productivity',
    tier: 'starter',
    tagline: 'Build forms, collect responses, see results.',
    summary: 'A form and survey builder: drag-drop fields, logic, response collection, charts and CSV export. Embeddable anywhere.',
    price: 690,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Charts'],
    includes: ['Full source code', 'Database schema + seed', 'Setup & deployment guide', 'Rebrand guide', '6 months of bug-fix updates'],
    features: ['Drag-drop form builder', 'Conditional logic', 'Response dashboard and charts', 'CSV export', 'Embeds and share links'],
    rebrand: ['Replace the logo and name', 'Set the accent colour', 'Configure .env and database', 'Deploy'],
  },

  /* ───────── Business — full products ───────── */
  {
    slug: 'crm-starter',
    name: 'CRM & Sales Pipeline',
    category: 'Sales',
    tier: 'business',
    tagline: 'Contacts, deals and a drag-drop pipeline, ready to ship.',
    summary: 'A complete CRM: contacts and companies, a Kanban deal pipeline, tasks, notes and activity timeline, with team roles and a dashboard. Multi-tenant from the first commit.',
    price: 1490,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind', 'Auth'],
    includes: ['Full source code (front and back end)', 'Database schema + seed data', 'Setup & deployment guide (PDF + README)', 'Rebrand guide', '.env template and config', '6 months of bug-fix updates'],
    features: ['Contacts, companies and deals', 'Drag-and-drop pipeline stages', 'Tasks, notes and activity log', 'Team members with roles', 'Dashboard with pipeline value', 'CSV import/export'],
    rebrand: ['Replace /public/logo.svg with your logo', 'Set NAME, DOMAIN and colours in config/brand.ts', 'Swap the primary colour token in tailwind.config', 'Edit the seed data in db/seed.sql', 'Point .env at your database and run the migration'],
    popular: true,
  },
  {
    slug: 'invoicing',
    name: 'Invoicing & Billing',
    category: 'Finance',
    tier: 'business',
    tagline: 'Send invoices, take payments, track what is owed.',
    summary: 'Client invoicing with quotes, recurring invoices, tax/VAT handling, PDF export and online payment links. A finance dashboard shows paid, due and overdue at a glance.',
    price: 1290,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe/PayPal', 'PDF'],
    includes: ['Full source code', 'Database schema + seed data', 'Setup & deployment guide', 'Rebrand guide', 'Payment-gateway wiring (Stripe + PayPal)', '6 months of bug-fix updates'],
    features: ['Quotes → invoices → receipts', 'Recurring invoices and reminders', 'Tax / VAT and multi-currency', 'PDF export with your branding', 'Online payment links', 'Aged-debt dashboard'],
    rebrand: ['Drop your logo into /public/brand', 'Set company name, address and tax IDs in settings', 'Choose the invoice template and accent colour', 'Add your Stripe/PayPal keys in .env', 'Run the migration and seed'],
  },
  {
    slug: 'booking',
    name: 'Booking & Appointments',
    category: 'Services',
    tier: 'business',
    tagline: 'Calendars, availability and online booking, done.',
    summary: 'An appointment platform for clinics, salons, coaches and studios: services, staff, availability rules, online booking, reminders and a back-office calendar. Handles time zones and buffers.',
    price: 1390,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Email/SMS', 'Calendar'],
    includes: ['Full source code', 'Database schema + seed data', 'Setup & deployment guide', 'Rebrand guide', 'Email + SMS reminder wiring', '6 months of bug-fix updates'],
    features: ['Services, staff and resources', 'Availability rules and buffers', 'Public booking page', 'Email/SMS reminders', 'Back-office calendar', 'No-show and cancellation handling'],
    rebrand: ['Replace the logo and favicon in /public', 'Set business name, hours and services in settings', 'Pick the theme colour', 'Add your email/SMS provider keys in .env', 'Seed your services and staff'],
  },
  {
    slug: 'ecommerce',
    name: 'E-Commerce Storefront',
    category: 'Commerce',
    tier: 'business',
    tagline: 'Catalogue, cart and checkout — a store you own.',
    summary: 'A self-hosted store: products with variants, cart, a conversion checkout, orders, customer accounts and an admin back office. No monthly platform fee, no revenue share.',
    price: 1990,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe/PayPal', 'Tailwind'],
    includes: ['Full source code', 'Database schema + seed catalogue', 'Setup & deployment guide', 'Rebrand guide', 'Payment + shipping wiring', '6 months of bug-fix updates'],
    features: ['Products, variants and categories', 'Cart and optimised checkout', 'Orders and fulfilment states', 'Customer accounts', 'Discounts and coupons', 'Admin dashboard'],
    rebrand: ['Add your logo and store name in config/brand.ts', 'Set the colour theme', 'Load your catalogue (CSV or admin)', 'Add payment + shipping keys in .env', 'Deploy and point your domain'],
    popular: true,
  },
  {
    slug: 'helpdesk',
    name: 'Help Desk & Support',
    category: 'Support',
    tier: 'business',
    tagline: 'Tickets, inbox and a knowledge base.',
    summary: 'A support desk: shared inbox, tickets with statuses and SLAs, canned replies, a public knowledge base and a customer portal. Roles for agents and admins.',
    price: 1290,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Email', 'Search'],
    includes: ['Full source code', 'Database schema + seed data', 'Setup & deployment guide', 'Rebrand guide', 'Inbound-email wiring', '6 months of bug-fix updates'],
    features: ['Shared inbox and tickets', 'Statuses, priorities and tags', 'Canned replies and macros', 'Public knowledge base', 'Customer portal', 'Agent performance view'],
    rebrand: ['Replace the logo and set the product name', 'Choose the accent colour', 'Configure the support email address', 'Seed knowledge-base categories', 'Deploy'],
  },
  {
    slug: 'project-management',
    name: 'Project & Task Management',
    category: 'Productivity',
    tier: 'business',
    tagline: 'Boards, tasks, sprints — your own Trello/Jira.',
    summary: 'A team workspace: projects, boards, tasks with assignees and due dates, sprints, comments and a timeline. Multi-tenant with per-workspace members.',
    price: 1590,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Realtime', 'Tailwind'],
    includes: ['Full source code', 'Database schema + seed data', 'Setup & deployment guide', 'Rebrand guide', 'Realtime updates wiring', '6 months of bug-fix updates'],
    features: ['Projects and Kanban boards', 'Tasks, assignees, due dates', 'Sprints and backlog', 'Comments and mentions', 'Timeline / Gantt view', 'Workspaces and roles'],
    rebrand: ['Swap the logo and app name', 'Set the theme colour', 'Adjust default board columns in seed', 'Configure .env and database', 'Deploy'],
  },
  {
    slug: 'lms',
    name: 'Online Courses (LMS)',
    category: 'Education',
    tier: 'business',
    tagline: 'Sell and deliver courses, track progress.',
    summary: 'A learning platform: courses, lessons, video, quizzes, student progress, certificates and paid enrolment. An instructor back office and a student dashboard.',
    price: 1790,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Video', 'Payments'],
    includes: ['Full source code', 'Database schema + seed course', 'Setup & deployment guide', 'Rebrand guide', 'Payment + video wiring', '6 months of bug-fix updates'],
    features: ['Courses, modules and lessons', 'Video and downloadable resources', 'Quizzes and grading', 'Progress tracking and certificates', 'Paid enrolment', 'Instructor + student roles'],
    rebrand: ['Add your logo and academy name', 'Set the brand colours', 'Load your first course from the seed', 'Add payment + video provider keys', 'Deploy'],
  },
  {
    slug: 'restaurant',
    name: 'Restaurant Ordering & QR Menu',
    category: 'Hospitality',
    tier: 'business',
    tagline: 'QR menu, orders and a kitchen screen.',
    summary: 'A restaurant system: a QR digital menu, table ordering, a kitchen display, order status and a simple admin for items and categories. Dine-in and takeaway.',
    price: 1190,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Realtime', 'QR'],
    includes: ['Full source code', 'Database schema + seed menu', 'Setup & deployment guide', 'Rebrand guide', 'Printable QR codes', '6 months of bug-fix updates'],
    features: ['QR digital menu', 'Table and takeaway orders', 'Kitchen display screen', 'Order status tracking', 'Menu and category admin', 'Multi-language menu'],
    rebrand: ['Replace the logo and set the restaurant name', 'Pick the theme colour', 'Load your menu from the seed or admin', 'Generate QR codes for your tables', 'Deploy'],
  },
  {
    slug: 'subscription-box',
    name: 'Subscriptions & Memberships',
    category: 'Recurring revenue',
    tier: 'business',
    tagline: 'Plans, subscribers and recurring billing.',
    summary: 'A subscription business in a box: plans and pricing, sign-up, recurring billing, a member dashboard, dunning and an admin with MRR and churn. Bring your own gateway.',
    price: 1690,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Webhooks'],
    includes: ['Full source code', 'Database schema + seed plans', 'Setup & deployment guide', 'Rebrand guide', 'Billing + webhook wiring', '6 months of bug-fix updates'],
    features: ['Plans, trials and upgrades', 'Recurring billing and dunning', 'Member dashboard', 'MRR, churn and cohort admin', 'Coupons and referrals', 'Webhook-driven state'],
    rebrand: ['Swap the logo and product name', 'Set the theme colour', 'Define your plans in the seed', 'Add Stripe keys and webhook secret', 'Deploy'],
  },

  /* ───────── Enterprise — platforms, scoped range ───────── */
  {
    slug: 'multi-tenant-saas-kit',
    name: 'Multi-Tenant SaaS Platform Kit',
    category: 'SaaS foundation',
    tier: 'enterprise',
    tagline: 'The base every serious SaaS needs — tenancy, billing, roles.',
    summary: 'A production SaaS foundation: organisations and tenancy, auth and SSO, subscription billing, roles and permissions (RBAC), a public + internal API, admin console and audit logs. Start your product on top of it instead of from zero.',
    price: 40000,
    priceMax: 90000,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'SSO', 'API'],
    includes: ['Full source code (monorepo)', 'Database schema + migrations', 'Setup & deployment guide + architecture doc', 'Rebrand + white-label guide', 'CI/CD and IaC templates', '12 months of bug-fix updates'],
    features: ['Organisations and multi-tenancy', 'Auth, SSO (OAuth2/OIDC) and MFA', 'Subscription billing and metering', 'RBAC and permission modelling', 'Public + internal API with docs', 'Admin console and audit logs'],
    rebrand: ['White-label from config/brand and theme tokens', 'Set tenant defaults and plan matrix', 'Wire your billing provider keys', 'Configure SSO providers', 'Deploy with the included IaC'],
    popular: true,
  },
  {
    slug: 'marketplace-platform',
    name: 'Marketplace Platform',
    category: 'Marketplace',
    tier: 'enterprise',
    tagline: 'Buyer, seller and operator — commission and payouts built in.',
    summary: 'A three-sided marketplace: buyer storefront, seller onboarding and dashboards, and an operator back office with a commission engine, escrow-style balances, payouts and dispute handling. The machinery that survives the first thousand transactions.',
    price: 70000,
    priceMax: 150000,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Payments', 'Search', 'Queues'],
    includes: ['Full source code (monorepo)', 'Database schema + migrations', 'Setup, deployment and scaling guide', 'Rebrand + white-label guide', 'Commission/payout config', '12 months of bug-fix updates'],
    features: ['Buyer, seller and admin apps', 'Commission and fee engine', 'Wallet, escrow and payouts', 'Search, ranking and filters', 'Reviews, disputes and moderation', 'KYC-ready onboarding'],
    rebrand: ['White-label the three apps from brand config', 'Set commission and payout rules', 'Wire payment and KYC providers', 'Load categories and seed sellers', 'Deploy with scaling notes'],
  },
  {
    slug: 'erp-suite',
    name: 'ERP Suite',
    category: 'Operations',
    tier: 'enterprise',
    tagline: 'Inventory, orders, purchasing, accounting — one system.',
    summary: 'A modular ERP: inventory and warehouses, sales and purchase orders, suppliers and customers, invoicing and basic accounting, with roles and reporting. Multi-company and multi-currency.',
    price: 90000,
    priceMax: 180000,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Reporting', 'API'],
    includes: ['Full source code (modular monorepo)', 'Database schema + migrations', 'Setup, deployment and admin guide', 'Rebrand guide', 'Module configuration guide', '12 months of bug-fix updates'],
    features: ['Inventory and multi-warehouse', 'Sales and purchase orders', 'Suppliers, customers and invoicing', 'Basic accounting and reports', 'Multi-company, multi-currency', 'Roles and audit trail'],
    rebrand: ['Set company and branding in config', 'Enable the modules you need', 'Import master data from seed', 'Configure currencies and tax', 'Deploy'],
  },

  /* ───────── Super Enterprise — source worth hundreds of thousands to millions ───────── */
  {
    slug: 'ai-saas-platform',
    name: 'AI SaaS Platform (BYOK)',
    category: 'AI platform',
    tier: 'super',
    tagline: 'A full multi-tenant AI product on your customers’ own keys.',
    summary: 'A complete AI SaaS platform: multi-tenant workspaces, assistants over the customer’s own data, retrieval pipelines, a model router across providers, usage metering and billing, an evaluation harness and an admin console. Bring-your-own-key throughout, so data never leaves the tenant.',
    price: 180000,
    priceMax: 600000,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Vector DB', 'Model router', 'Billing'],
    includes: ['Full source code (monorepo)', 'Database + vector schema and migrations', 'Architecture, deployment and scaling guide', 'White-label + rebrand guide', 'Model-router and prompt library', '12 months of bug-fix updates'],
    features: ['Multi-tenant workspaces and SSO', 'Assistants over tenant data (RAG)', 'Multi-provider model router (BYOK)', 'Usage metering and subscription billing', 'Evaluation and guardrails', 'Admin console and audit logs'],
    rebrand: ['White-label from brand and theme tokens', 'Set the model providers and defaults', 'Configure tenancy and plan matrix', 'Wire billing and BYOK storage', 'Deploy with the included IaC'],
    popular: true,
  },
  {
    slug: 'fintech-core',
    name: 'Fintech / Neobank Core',
    category: 'Fintech',
    tagline: 'Accounts, ledger, cards and payments — a banking core.',
    tier: 'super',
    summary: 'A fintech core platform: a double-entry ledger, customer accounts and wallets, KYC/onboarding, card and payment rails integration, transaction monitoring, statements and a compliance-ready audit trail. The foundation a neobank or wallet is built on.',
    price: 300000,
    priceMax: 900000,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Ledger', 'Payments', 'KYC'],
    includes: ['Full source code (monorepo)', 'Ledger + database schema and migrations', 'Architecture, security and deployment guide', 'White-label guide', 'Compliance and audit documentation', '12 months of bug-fix updates'],
    features: ['Double-entry ledger', 'Accounts, wallets and statements', 'KYC and onboarding', 'Card and payment rails integration', 'Transaction monitoring and limits', 'Compliance-ready audit trail'],
    rebrand: ['White-label the apps from brand config', 'Configure ledger and product accounts', 'Wire payment/card and KYC providers', 'Set limits and monitoring rules', 'Deploy on the hardened reference infra'],
  },
  {
    slug: 'super-ecosystem',
    name: 'Global Enterprise Ecosystem',
    category: 'Ecosystem',
    tier: 'super',
    tagline: 'Customer, partner and internal platforms + AI + global infra.',
    summary: 'A complete digital ecosystem as source: customer, partner and internal platforms sharing one identity and API layer, an AI layer, global multi-region infrastructure as code, enterprise security (SSO/MFA/RBAC), and the backup-and-recovery system built in. The largest thing we sell, delivered as a codebase.',
    price: 500000,
    priceMax: 1200000,
    stack: ['Monorepo', 'TypeScript', 'PostgreSQL', 'Kubernetes', 'AI layer', 'IaC'],
    includes: ['Full source code (multi-app monorepo)', 'All schemas and migrations', 'Architecture, security and operations manuals', 'White-label + rebrand guide', 'Global IaC (multi-region) templates', '12 months of bug-fix updates'],
    features: ['Customer, partner and internal platforms', 'Shared identity, SSO/MFA and RBAC', 'AI layer: assistants, retrieval, automation', 'Global multi-region infrastructure as code', 'AI backup & recovery built in', 'Observability and audit across the estate'],
    rebrand: ['White-label every app from one brand config', 'Set tenancy, roles and the plan matrix', 'Configure regions in the IaC', 'Wire billing, AI and identity providers', 'Deploy region by region with the runbook'],
  },
];

export function getTemplate(slug: string): SaaSTemplate | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export const TEMPLATE_CATEGORIES = Array.from(new Set(TEMPLATES.map((t) => t.category)));
