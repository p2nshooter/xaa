import type { ModuleId, Perm, PlanId, Role, ThemeId } from './types';

/* ───────── Access control ───────── */

export const ROLES: Role[] = ['owner', 'admin', 'member', 'viewer'];
export const PERMS: Perm[] = ['read', 'write', 'delete', 'manage', 'billing'];
export const PERM_LABEL: Record<Perm, string> = {
  read: 'View records',
  write: 'Create & edit records',
  delete: 'Delete records',
  manage: 'Members, API keys, flags, approvals',
  billing: 'Plan & billing',
};
export const RBAC: Record<Role, Perm[]> = {
  owner: ['read', 'write', 'delete', 'manage', 'billing'],
  admin: ['read', 'write', 'delete', 'manage'],
  member: ['read', 'write'],
  viewer: ['read'],
};

/* ───────── Plans (what the SaaS built on this kit would sell) ───────── */

export interface Plan { name: string; price: number; seats: number; apiCalls: number; aiTokens: number; storageMb: number }
export const PLANS: Record<PlanId, Plan> = {
  starter: { name: 'Starter', price: 29, seats: 3, apiCalls: 10_000, aiTokens: 200_000, storageMb: 2_048 },
  growth: { name: 'Growth', price: 99, seats: 15, apiCalls: 250_000, aiTokens: 2_000_000, storageMb: 20_480 },
  enterprise: { name: 'Enterprise', price: 499, seats: 200, apiCalls: 5_000_000, aiTokens: 50_000_000, storageMb: 512_000 },
};

/* ───────── Demo limits — fully working, but bounded ───────── */

export const DEMO_LIMITS = {
  /** Records a visitor can create in one sandbox. */
  records: 40,
  /** Organisations (tenants) a visitor can create. */
  orgs: 3,
  /** Questions answered by Claude with the visitor's own key. */
  aiQuestions: 10,
  /** Rows written to CSV/JSON exports. */
  exportRows: 10,
  /** The sandbox is rebuilt after this long. */
  resetAfterHours: 24,
};

/* ───────── Modules ───────── */

export const MODULES: { id: ModuleId; label: string; short: string; blurb: string }[] = [
  { id: 'overview', label: 'Overview', short: 'OV', blurb: 'Cross-module KPIs and live activity' },
  { id: 'crm', label: 'CRM & Pipeline', short: 'CR', blurb: 'Contacts, deals and a drag-and-drop pipeline' },
  { id: 'helpdesk', label: 'Help Desk', short: 'HD', blurb: 'Tickets with SLA timers and a knowledge base' },
  { id: 'projects', label: 'Projects', short: 'PM', blurb: 'Boards, sprints and a timeline' },
  { id: 'invoices', label: 'Invoicing', short: 'IN', blurb: 'Quotes, invoices, VAT, payments, aged debt' },
  { id: 'ledger', label: 'Ledger & Wallets', short: 'LG', blurb: 'Double-entry ledger with four-eyes approval' },
  { id: 'ai', label: 'AI Workspace', short: 'AI', blurb: 'Retrieval over your data, Claude with your own key' },
  { id: 'admin', label: 'Admin console', short: 'AD', blurb: 'Tenants, roles, billing, API keys, flags, audit' },
];

/* ───────── Themes the buyer can choose ───────── */

export const THEMES: { id: ThemeId; name: string; note: string; swatch: [string, string, string] }[] = [
  { id: 'studio', name: 'Studio', note: 'Bright, airy, rounded — the default', swatch: ['#f7f9fc', '#ffffff', '#2b6bff'] },
  { id: 'midnight', name: 'Midnight', note: 'Dark mode for long sessions', swatch: ['#0b1220', '#131c2e', '#7c9cff'] },
  { id: 'aurora', name: 'Aurora Glass', note: 'Gradient backdrop, frosted panels', swatch: ['#c7d2fe', '#fdf2f8', '#8b5cf6'] },
  { id: 'ledger', name: 'Corporate', note: 'Serif headings, square, dense tables', swatch: ['#f4f1ea', '#ffffff', '#1f3a5f'] },
  { id: 'brutal', name: 'Neo-Brutal', note: 'Thick borders, hard shadows, loud', swatch: ['#fff8e1', '#ffffff', '#111111'] },
];

/* ───────── Which demo shows which modules ───────── */

export interface DemoDef { focus: ModuleId; modules: ModuleId[] }
const ALL: ModuleId[] = MODULES.map((m) => m.id);
export const DEMOS: Record<string, DemoDef> = {
  'crm-starter': { focus: 'crm', modules: ['overview', 'crm', 'admin'] },
  helpdesk: { focus: 'helpdesk', modules: ['overview', 'helpdesk', 'admin'] },
  'project-management': { focus: 'projects', modules: ['overview', 'projects', 'admin'] },
  invoicing: { focus: 'invoices', modules: ['overview', 'invoices', 'admin'] },
  'multi-tenant-saas-kit': { focus: 'admin', modules: ['overview', 'admin', 'crm'] },
  'ai-saas-platform': { focus: 'ai', modules: ['overview', 'ai', 'admin'] },
  'fintech-core': { focus: 'ledger', modules: ['overview', 'ledger', 'admin'] },
  'super-ecosystem': { focus: 'overview', modules: ALL },
};

/** Fixed demo conversion rates to EUR for cross-currency dashboards. */
export const TO_EUR: Record<'EUR' | 'USD' | 'IDR', number> = { EUR: 1, USD: 0.92, IDR: 0.000056 };

export const SLA_HOURS = { urgent: 1, high: 4, normal: 24, low: 72 } as const;
