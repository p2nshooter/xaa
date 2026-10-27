import { bucket, newId, nowIso } from './db';
import { data } from './data';
import type { User } from './auth';
import { getTemplate } from '@/content/templates';

/**
 * The SaaS template store: orders and bundle delivery.
 *
 * An order is a single purchase of a single template. The buyer pays through
 * the same rails as everything else (the destinations shown on the checkout),
 * an admin confirms the payment, and the order flips to `paid` — at which point
 * the buyer can download that template's bundle (a zip of full source, database
 * and setup guide). The zip lives once per template in the uploads bucket;
 * buying grants access, it is not copied per order. Orders and bundle records
 * are R2 documents (server/r2/schema.ts: template_orders, template_bundles).
 */

export type OrderStatus = 'pending' | 'submitted' | 'paid' | 'cancelled';

export interface TemplateOrder {
  id: string;
  ref: string;
  slug: string;
  name: string;
  user_id: string;
  price: number;
  status: OrderStatus;
  method: string | null;
  reference: string | null;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
  /** Set when the order pays an auction win (server/auction.ts): the lot it pays for. */
  auction_lot_id?: string | null;
  /** The payment screenshot a bank or USDT payment needs before the admin approves it (uploads bucket). */
  receipt_key?: string | null;
}

export interface BundleMeta {
  slug: string;
  object_key: string;
  filename: string;
  size: number;
  updated_at: string;
}

function makeRef(): string {
  const y = new Date().getFullYear().toString().slice(-2);
  const n = Math.floor(Math.random() * 1_679_616).toString(36).toUpperCase().padStart(4, '0');
  return `TPL-${y}${n}`;
}

export async function createOrder(user: User, slug: string): Promise<TemplateOrder> {
  const tpl = getTemplate(slug);
  if (!tpl) throw new Error('Unknown template.');
  // Reuse an open order for the same template rather than piling up duplicates.
  const d = await data();
  const mine = await d.templateOrders.listAllDocs('user_slug', `${user.id}|${slug}`);
  const open = mine.find((o) => o.status === 'pending' || o.status === 'submitted');
  if (open) return open;

  const order: TemplateOrder = {
    id: newId(),
    ref: makeRef(),
    slug: tpl.slug,
    name: tpl.name,
    user_id: user.id,
    price: tpl.price,
    status: 'pending',
    method: null,
    reference: null,
    note: null,
    created_at: nowIso(),
    confirmed_at: null,
  };
  await d.templateOrders.create(order);
  return order;
}

export async function getOrder(id: string): Promise<TemplateOrder | null> {
  return (await data()).templateOrders.get(id);
}

export async function listUserOrders(userId: string): Promise<TemplateOrder[]> {
  return (await data()).templateOrders.listAllDocs('user', userId);
}

export async function listAllOrders(): Promise<(TemplateOrder & { client_email: string })[]> {
  const d = await data();
  const orders = await d.templateOrders.listAllDocs('all', 'all');
  const ids = [...new Set(orders.map((o) => o.user_id))];
  const users = new Map((await d.users.getMany(ids)).flatMap((u) => (u ? [[u.id, u.email] as const] : [])));
  // Orders of an account that no longer exists are left out, as the old inner join did.
  return orders.flatMap((o) => (users.has(o.user_id) ? [{ ...o, client_email: users.get(o.user_id)! }] : []));
}

/** The order changes only from pending/submitted — a paid or cancelled order is never reopened by a late form post. */
export async function submitOrderPayment(orderId: string, patch: { method: string; reference: string; note?: string }): Promise<void> {
  const d = await data();
  if (!(await d.templateOrders.get(orderId))) return;
  await d.templateOrders.update(orderId, (o) =>
    o.status === 'pending' || o.status === 'submitted'
      ? { ...o, status: 'submitted', method: patch.method, reference: patch.reference.slice(0, 200), note: patch.note?.slice(0, 1000) ?? null }
      : null,
  );
}

/** pending/submitted → paid, once: a second confirmation (admin + PayPal) keeps the first confirmation time. */
export async function confirmOrder(orderId: string): Promise<void> {
  const d = await data();
  if (!(await d.templateOrders.get(orderId))) return;
  await d.templateOrders.update(orderId, (o) => (o.status === 'paid' ? null : { ...o, status: 'paid', confirmed_at: nowIso() }));
}

export async function cancelOrder(orderId: string): Promise<void> {
  const d = await data();
  if (!(await d.templateOrders.get(orderId))) return;
  await d.templateOrders.update(orderId, (o) => (o.status === 'cancelled' ? null : { ...o, status: 'cancelled' }));
}

/** True when this user has a paid order for the template — the download gate. */
export async function hasPaidOrder(userId: string, slug: string): Promise<boolean> {
  const mine = await (await data()).templateOrders.listAllDocs('user_slug', `${userId}|${slug}`);
  return mine.some((o) => o.status === 'paid');
}

/* ───────────────────────── Bundles ───────────────────────── */

export async function getBundleMeta(slug: string): Promise<BundleMeta | null> {
  const doc = await (await data()).bundles.get(slug);
  if (!doc) return null;
  const { id: _id, updated_by: _by, ...meta } = doc;
  return meta;
}

export async function saveBundle(slug: string, file: File, actor: string): Promise<void> {
  if (!getTemplate(slug)) throw new Error('Unknown template.');
  const store = await bucket();
  if (!store) throw new Error('File storage is not configured, so the bundle cannot be stored.');
  const filename = (file.name || `${slug}.zip`).replace(/[^\w.\-]/g, '_').slice(0, 120);
  const key = `templates/${slug}/${filename}`;
  const bytes = await file.arrayBuffer();
  await store.put(key, bytes, { httpMetadata: { contentType: file.type || 'application/zip' } });
  const doc = { id: slug, slug, object_key: key, filename, size: file.size, updated_at: nowIso(), updated_by: actor };
  await (await data()).bundles.upsert(slug, () => doc);
}
