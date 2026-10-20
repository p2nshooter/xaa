/**
 * Every collection the portal keeps in R2, with its uniqueness guards and
 * indexes (docs/R2-DATA-BLUEPRINT.md §7). One place, so the app, the D1
 * migration, the nightly backup and the tests all agree on the key layout.
 *
 * Index sort keys: newest first by created_at unless a list needs another
 * order (pending payments oldest first, revenue by confirmation time, payouts
 * by period, support threads by last activity).
 */
import type { User } from '../auth';
import type { Lead } from '../leads';
import type { PaymentMethodRow } from '../settings';
import type { Payment, Project, ProjectFile, ProjectUpdate } from '../projects';
import type { RecoveryEvent } from '../recovery';
import type { BundleMeta, TemplateOrder } from '../store';
import type { PayPalCheckout } from '../paypal';
import type { Investor, Payout } from '../invest';
import type { SupportThread } from '../support';
import type { Store } from './store.ts';
import { newestFirst, oldestFirst } from './ulid.ts';

export type UserDoc = User & { password_hash: string };
export type BundleDoc = BundleMeta & { id: string; updated_by: string | null };
export type CheckoutDoc = PayPalCheckout & { claim?: string };
export interface ProjectAiDoc {
  id: string;
  project_id: string;
  provider: string;
  api_key_enc: string | null;
  schedule: string;
  updated_at: string;
  updated_by: string | null;
}

/** A single setting (k/setting/<key>); secret values are encrypted before they get here. */
export interface SettingDoc {
  value: string;
  is_secret: number;
  updated_at: string;
  updated_by: string | null;
}

/** An internal secret or marker (k/secret/<key>). */
export interface SecretDoc {
  value: string;
  updated_at: string;
}

const lower = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();

export function collections(store: Store) {
  return {
    users: store.collection<UserDoc>({
      name: 'users',
      unique: [{ name: 'email', value: (u) => u.email }],
      indexes: [{ name: 'all', key: () => 'all', meta: (u) => ({ email: u.email, name: u.name, role: u.role }) }],
    }),
    projects: store.collection<Project>({
      name: 'projects',
      unique: [{ name: 'ref', value: (p) => p.ref }],
      indexes: [
        { name: 'user', key: (p) => p.user_id },
        { name: 'all', key: () => 'all' },
      ],
    }),
    payments: store.collection<Payment>({
      name: 'payments',
      indexes: [
        { name: 'project', key: (p) => p.project_id },
        { name: 'pending', key: (p) => (p.status === 'pending' ? 'all' : null), sort: (p) => oldestFirst(p.created_at) },
        { name: 'confirmed', key: (p) => (p.status === 'confirmed' && p.confirmed_at ? 'all' : null), sort: (p) => oldestFirst(p.confirmed_at ?? '') },
      ],
    }),
    files: store.collection<ProjectFile>({ name: 'files', indexes: [{ name: 'project', key: (f) => f.project_id }] }),
    updates: store.collection<ProjectUpdate>({ name: 'updates', indexes: [{ name: 'project', key: (u) => u.project_id }] }),
    enquiries: store.collection<Lead>({
      name: 'enquiries',
      indexes: [
        { name: 'all', key: () => 'all' },
        { name: 'status', key: (l) => l.status ?? 'new' },
      ],
    }),
    paymentMethods: store.collection<PaymentMethodRow>({ name: 'payment_methods' }),
    projectAi: store.collection<ProjectAiDoc>({ name: 'project_ai' }),
    recoveryEvents: store.collection<RecoveryEvent>({
      name: 'recovery_events',
      indexes: [
        { name: 'project', key: (e) => e.project_id },
        { name: 'backups', key: (e) => (e.kind === 'backup' && e.object_key ? e.project_id : null) },
      ],
    }),
    templateOrders: store.collection<TemplateOrder>({
      name: 'template_orders',
      indexes: [
        { name: 'user', key: (o) => o.user_id },
        { name: 'all', key: () => 'all' },
        { name: 'user_slug', key: (o) => `${o.user_id}|${o.slug}` },
        { name: 'paid', key: (o) => (o.status === 'paid' && o.confirmed_at ? 'all' : null), sort: (o) => oldestFirst(o.confirmed_at ?? '') },
      ],
    }),
    checkouts: store.collection<CheckoutDoc>({
      name: 'paypal_checkouts',
      unique: [{ name: 'paypal_order_id', value: (c) => c.paypal_order_id }],
      indexes: [
        { name: 'project', key: (c) => c.project_id },
        { name: 'template_order', key: (c) => c.template_order_id },
        { name: 'all', key: () => 'all' },
        {
          // Payments that never count as revenue (server/revenue.ts): sandbox money, refunds, reversals.
          name: 'excluded',
          key: (c) => (c.env === 'sandbox' || /^PayPal (refunded|reversed)/.test(c.detail ?? '') ? 'all' : null),
          meta: (c) => ({ payment_id: c.payment_id, template_order_id: c.template_order_id }),
        },
      ],
    }),
    investors: store.collection<Investor>({
      name: 'investors',
      indexes: [
        { name: 'all', key: () => 'all' },
        { name: 'email', key: (i) => lower(i.email), sort: (i) => newestFirst(i.verified_at ?? i.created_at) },
      ],
    }),
    payouts: store.collection<Payout>({
      name: 'investor_payouts',
      indexes: [
        { name: 'investor', key: (p) => p.investor_id, sort: (p) => `${p.period}_${oldestFirst(p.paid_at)}` },
        { name: 'all', key: () => 'all', sort: (p) => `${p.period}_${oldestFirst(p.paid_at)}` },
      ],
    }),
    bundles: store.collection<BundleDoc>({ name: 'template_bundles' }),
    threads: store.collection<SupportThread>({
      name: 'support_threads',
      unique: [{ name: 'token', value: (t) => t.token }],
      indexes: [
        { name: 'recent', key: () => 'all', sort: (t) => newestFirst(t.updated_at) },
        { name: 'unread', key: (t) => (t.unread_admin > 0 && t.status === 'open' ? 'all' : null) },
      ],
    }),
  };
}

export type Collections = ReturnType<typeof collections>;
export type Data = Collections & { store: Store };

export function dataFor(store: Store): Data {
  return { store, ...collections(store) };
}

/** Support messages are an append-only log per thread: l/support/<threadId>/<time>-<id>. */
export const messageStream = (threadId: string) => `support/${threadId}`;
export const messageId = (createdAt: string, id: string) => `${oldestFirst(createdAt)}-${id.replace(/[^\w-]/g, '')}`;
/** A log position just after every message written at `createdAt` (messages "after" that moment). */
export const messagesAfter = (createdAt: string) => `${oldestFirst(createdAt)}-~`;
