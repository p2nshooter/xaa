import { db, bucket, newId, nowIso } from './db';
import type { User } from './auth';
import { getTemplate } from '@/content/templates';

/**
 * The SaaS template store: orders and bundle delivery.
 *
 * An order is a single purchase of a single template. The buyer pays through
 * the same rails as everything else (the destinations shown on the checkout),
 * an admin confirms the payment, and the order flips to `paid` — at which point
 * the buyer can download that template's bundle (a zip of full source, database
 * and setup guide). The zip lives once per template in R2; buying grants access,
 * it is not copied per order.
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
  const database = await db();
  const open = await database
    .prepare("SELECT * FROM template_orders WHERE user_id = ? AND slug = ? AND status IN ('pending','submitted') ORDER BY created_at DESC LIMIT 1")
    .bind(user.id, slug)
    .first<TemplateOrder>();
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
  await database
    .prepare(
      `INSERT INTO template_orders (id, ref, slug, name, user_id, price, status, method, reference, note, created_at, confirmed_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(order.id, order.ref, order.slug, order.name, order.user_id, order.price, order.status, null, null, null, order.created_at, null)
    .run();
  return order;
}

export async function getOrder(id: string): Promise<TemplateOrder | null> {
  const database = await db();
  return (await database.prepare('SELECT * FROM template_orders WHERE id = ?').bind(id).first<TemplateOrder>()) ?? null;
}

export async function listUserOrders(userId: string): Promise<TemplateOrder[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT * FROM template_orders WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<TemplateOrder>();
  return results ?? [];
}

export async function listAllOrders(): Promise<(TemplateOrder & { client_email: string })[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT o.*, u.email AS client_email FROM template_orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC')
    .all<TemplateOrder & { client_email: string }>();
  return results ?? [];
}

export async function submitOrderPayment(orderId: string, patch: { method: string; reference: string; note?: string }): Promise<void> {
  const database = await db();
  await database
    .prepare("UPDATE template_orders SET status = 'submitted', method = ?, reference = ?, note = ? WHERE id = ? AND status IN ('pending','submitted')")
    .bind(patch.method, patch.reference.slice(0, 200), patch.note?.slice(0, 1000) ?? null, orderId)
    .run();
}

export async function confirmOrder(orderId: string): Promise<void> {
  const database = await db();
  await database
    .prepare("UPDATE template_orders SET status = 'paid', confirmed_at = ? WHERE id = ?")
    .bind(nowIso(), orderId)
    .run();
}

export async function cancelOrder(orderId: string): Promise<void> {
  const database = await db();
  await database.prepare("UPDATE template_orders SET status = 'cancelled' WHERE id = ?").bind(orderId).run();
}

/** True when this user has a paid order for the template — the download gate. */
export async function hasPaidOrder(userId: string, slug: string): Promise<boolean> {
  const database = await db();
  const row = await database
    .prepare("SELECT 1 AS ok FROM template_orders WHERE user_id = ? AND slug = ? AND status = 'paid' LIMIT 1")
    .bind(userId, slug)
    .first<{ ok: number }>();
  return Boolean(row);
}

/* ───────────────────────── Bundles ───────────────────────── */

export async function getBundleMeta(slug: string): Promise<BundleMeta | null> {
  const database = await db();
  return (await database.prepare('SELECT * FROM template_bundles WHERE slug = ?').bind(slug).first<BundleMeta>()) ?? null;
}

export async function saveBundle(slug: string, file: File, actor: string): Promise<void> {
  if (!getTemplate(slug)) throw new Error('Unknown template.');
  const store = await bucket();
  if (!store) throw new Error('File storage is not configured, so the bundle cannot be stored.');
  const filename = (file.name || `${slug}.zip`).replace(/[^\w.\-]/g, '_').slice(0, 120);
  const key = `templates/${slug}/${filename}`;
  const bytes = await file.arrayBuffer();
  await store.put(key, bytes, { httpMetadata: { contentType: file.type || 'application/zip' } });
  const database = await db();
  await database
    .prepare(
      `INSERT INTO template_bundles (slug, object_key, filename, size, updated_at, updated_by)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(slug) DO UPDATE SET object_key=excluded.object_key, filename=excluded.filename,
         size=excluded.size, updated_at=excluded.updated_at, updated_by=excluded.updated_by`
    )
    .bind(slug, key, filename, file.size, nowIso(), actor)
    .run();
}
