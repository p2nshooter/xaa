import { db, newId, nowIso, appEnv } from './db';
import { encryptValue, decryptValue, maskSecret } from './crypto';

/**
 * Payment destinations and studio configuration, both maintained from the
 * admin UI rather than from Worker secrets.
 *
 * The point of moving them into the database is operational: a wallet address
 * should be changeable by the person who owns it, in thirty seconds, without a
 * deploy. Anything sensitive is encrypted before it is written (see crypto.ts)
 * and only ever leaves the server masked, except on the one screen where the
 * client actually has to copy it.
 */

export type MethodKind = 'crypto' | 'paypal' | 'bank';

export interface PaymentMethodRow {
  id: string;
  kind: MethodKind;
  label: string;
  network: string | null;
  currency: string;
  address_enc: string;
  memo_enc: string | null;
  link: string | null;
  instructions: string | null;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** A method with its secrets opened, for the client's payment screen. */
export interface PaymentMethod {
  id: string;
  kind: MethodKind;
  label: string;
  network: string | null;
  currency: string;
  address: string;
  memo: string;
  link: string | null;
  instructions: string | null;
  active: boolean;
  sortOrder: number;
  /** True when the stored value will not open with the current key. */
  unreadable: boolean;
}

async function openMethod(row: PaymentMethodRow): Promise<PaymentMethod> {
  const address = await decryptValue(row.address_enc);
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    network: row.network,
    currency: row.currency,
    address,
    memo: row.memo_enc ? await decryptValue(row.memo_enc) : '',
    link: row.link,
    instructions: row.instructions,
    active: row.active === 1,
    sortOrder: row.sort_order,
    unreadable: Boolean(row.address_enc) && address === '',
  };
}

export async function listPaymentMethods(onlyActive = false): Promise<PaymentMethod[]> {
  const database = await db();
  const { results } = await database
    .prepare(
      onlyActive
        ? 'SELECT * FROM payment_methods WHERE active = 1 ORDER BY sort_order ASC, created_at ASC'
        : 'SELECT * FROM payment_methods ORDER BY active DESC, sort_order ASC, created_at ASC'
    )
    .all<PaymentMethodRow>();
  return Promise.all((results ?? []).map(openMethod));
}

export async function getPaymentMethod(id: string): Promise<PaymentMethod | null> {
  const database = await db();
  const row = await database.prepare('SELECT * FROM payment_methods WHERE id = ?').bind(id).first<PaymentMethodRow>();
  return row ? openMethod(row) : null;
}

export interface PaymentMethodInput {
  kind: MethodKind;
  label: string;
  network?: string;
  currency?: string;
  address: string;
  memo?: string;
  link?: string;
  instructions?: string;
  active?: boolean;
  sortOrder?: number;
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<string> {
  const database = await db();
  const id = newId();
  const now = nowIso();
  await database
    .prepare(
      `INSERT INTO payment_methods (id, kind, label, network, currency, address_enc, memo_enc, link,
        instructions, active, sort_order, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      id,
      input.kind,
      input.label.trim().slice(0, 80),
      input.network?.trim() || null,
      input.currency?.trim() || (input.kind === 'crypto' ? 'USDT' : 'EUR'),
      await encryptValue(input.address.trim()),
      input.memo?.trim() ? await encryptValue(input.memo.trim()) : null,
      input.link?.trim() || null,
      input.instructions?.trim().slice(0, 500) || null,
      input.active === false ? 0 : 1,
      input.sortOrder ?? 0,
      now,
      now
    )
    .run();
  return id;
}

export async function updatePaymentMethod(id: string, input: PaymentMethodInput): Promise<void> {
  const database = await db();
  // An empty address field means "leave the stored one alone" — the form
  // never shows the real value back, so blank must not wipe it.
  const existing = await database
    .prepare('SELECT address_enc, memo_enc FROM payment_methods WHERE id = ?')
    .bind(id)
    .first<{ address_enc: string; memo_enc: string | null }>();
  if (!existing) throw new Error('Payment method not found.');

  const addressEnc = input.address.trim() ? await encryptValue(input.address.trim()) : existing.address_enc;
  const memoEnc = input.memo?.trim() ? await encryptValue(input.memo.trim()) : existing.memo_enc;

  await database
    .prepare(
      `UPDATE payment_methods SET kind = ?, label = ?, network = ?, currency = ?, address_enc = ?,
        memo_enc = ?, link = ?, instructions = ?, active = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(
      input.kind,
      input.label.trim().slice(0, 80),
      input.network?.trim() || null,
      input.currency?.trim() || (input.kind === 'crypto' ? 'USDT' : 'EUR'),
      addressEnc,
      memoEnc,
      input.link?.trim() || null,
      input.instructions?.trim().slice(0, 500) || null,
      input.active === false ? 0 : 1,
      input.sortOrder ?? 0,
      nowIso(),
      id
    )
    .run();
}

export async function setPaymentMethodActive(id: string, active: boolean): Promise<void> {
  const database = await db();
  await database
    .prepare('UPDATE payment_methods SET active = ?, updated_at = ? WHERE id = ?')
    .bind(active ? 1 : 0, nowIso(), id)
    .run();
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const database = await db();
  await database.prepare('DELETE FROM payment_methods WHERE id = ?').bind(id).run();
}

/** What an admin sees in the list: enough to identify, never enough to use. */
export function maskedAddress(m: PaymentMethod): string {
  if (m.unreadable) return 'unreadable — re-enter';
  return maskSecret(m.address, m.kind === 'crypto' ? 'address' : 'token');
}

/* ───────────────────────── Studio settings ───────────────────────── */

export interface SettingDef {
  key: string;
  label: string;
  hint: string;
  secret: boolean;
  group: 'company' | 'invoicing' | 'integrations';
  placeholder?: string;
}

/**
 * Everything an admin can configure without a deploy.
 *
 * Only values that genuinely belong to the running business live here.
 * Prices, packages and copy stay in the repository, where they are reviewable
 * and versioned — a settings screen is the wrong place to edit a contract.
 */
export const SETTING_DEFS: SettingDef[] = [
  { key: 'company_name', label: 'Legal entity name', hint: 'Appears on every invoice.', secret: false, group: 'company', placeholder: 'XAA' },
  { key: 'company_address', label: 'Registered address', hint: 'Full postal address, one per line.', secret: false, group: 'company' },
  { key: 'company_tax_id', label: 'VAT / tax number', hint: 'Shown on invoices; leave blank if not registered.', secret: false, group: 'company' },
  { key: 'company_reg_no', label: 'Company registration number', hint: 'Optional, printed beside the tax number.', secret: false, group: 'company' },
  { key: 'contact_email', label: 'Contact email', hint: 'Where clients reply.', secret: false, group: 'company', placeholder: 'hello@xaa.es' },
  { key: 'billing_email', label: 'Billing email', hint: 'Printed on invoices for payment queries.', secret: false, group: 'company', placeholder: 'billing@xaa.es' },

  { key: 'invoice_prefix', label: 'Invoice prefix', hint: 'Leading text on invoice numbers.', secret: false, group: 'invoicing', placeholder: 'XAA-INV' },
  { key: 'invoice_footer', label: 'Invoice footer note', hint: 'Payment terms or a thank-you line.', secret: false, group: 'invoicing' },
  { key: 'vat_note', label: 'VAT treatment note', hint: 'e.g. "Reverse charge — VAT to be accounted for by the recipient".', secret: false, group: 'invoicing' },

  { key: 'notify_email', label: 'Notification inbox', hint: 'Where new leads and payments should be emailed.', secret: false, group: 'integrations' },
  { key: 'smtp_api_key', label: 'Email provider API key', hint: 'Resend, Postmark or similar. Encrypted at rest.', secret: true, group: 'integrations' },
  { key: 'telegram_bot_token', label: 'Telegram bot token', hint: 'Optional alerting channel. Encrypted at rest.', secret: true, group: 'integrations' },
  { key: 'telegram_chat_id', label: 'Telegram chat ID', hint: 'Where alerts are delivered.', secret: false, group: 'integrations' },
  { key: 'tron_api_key', label: 'TronGrid API key', hint: 'For automated on-chain USDT verification. Encrypted at rest.', secret: true, group: 'integrations' },
  { key: 'etherscan_api_key', label: 'Etherscan API key', hint: 'For automated ERC20 verification. Encrypted at rest.', secret: true, group: 'integrations' },
  { key: 'paypal_client_id', label: 'PayPal client ID', hint: 'For automated PayPal verification.', secret: false, group: 'integrations' },
  { key: 'paypal_client_secret', label: 'PayPal client secret', hint: 'Encrypted at rest.', secret: true, group: 'integrations' },
];

export const SETTING_GROUPS: { id: SettingDef['group']; title: string; blurb: string }[] = [
  { id: 'company', title: 'Company details', blurb: 'Who the invoice is from. Printed on every document the client receives.' },
  { id: 'invoicing', title: 'Invoicing', blurb: 'Numbering and the wording that appears beneath the totals.' },
  { id: 'integrations', title: 'Integrations', blurb: 'Keys for email, alerting and automated payment verification. Secret values are encrypted before they are written.' },
];

export interface SettingValue {
  key: string;
  value: string;
  isSecret: boolean;
  /** Set for secrets: the stored value exists but is never sent to the browser. */
  present: boolean;
  masked: string;
  unreadable: boolean;
  updatedAt: string | null;
}

/** All settings, with secret values masked — safe to render in the admin UI. */
export async function listSettings(): Promise<SettingValue[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT key, value, is_secret, updated_at FROM app_settings')
    .all<{ key: string; value: string; is_secret: number; updated_at: string }>();
  const stored = new Map((results ?? []).map((r) => [r.key, r]));

  return Promise.all(
    SETTING_DEFS.map(async (def) => {
      const row = stored.get(def.key);
      if (!row || !row.value) {
        return { key: def.key, value: '', isSecret: def.secret, present: false, masked: '', unreadable: false, updatedAt: null };
      }
      if (!def.secret) {
        return { key: def.key, value: row.value, isSecret: false, present: true, masked: row.value, unreadable: false, updatedAt: row.updated_at };
      }
      const plain = await decryptValue(row.value);
      return {
        key: def.key,
        value: '',
        isSecret: true,
        present: true,
        masked: plain ? maskSecret(plain) : 'unreadable — re-enter',
        unreadable: plain === '',
        updatedAt: row.updated_at,
      };
    })
  );
}

/** Read one setting's real value, server-side only. */
export async function getSetting(key: string): Promise<string> {
  const def = SETTING_DEFS.find((d) => d.key === key);
  const database = await db();
  const row = await database.prepare('SELECT value FROM app_settings WHERE key = ?').bind(key).first<{ value: string }>();
  if (!row?.value) return '';
  return def?.secret ? decryptValue(row.value) : row.value;
}

/**
 * Company details for invoices, falling back to the values compiled into the
 * site so an invoice is never blank on a fresh install.
 */
export async function invoiceIdentity() {
  const [name, address, taxId, regNo, billing, prefix, footer, vatNote] = await Promise.all([
    getSetting('company_name'),
    getSetting('company_address'),
    getSetting('company_tax_id'),
    getSetting('company_reg_no'),
    getSetting('billing_email'),
    getSetting('invoice_prefix'),
    getSetting('invoice_footer'),
    getSetting('vat_note'),
  ]);
  return {
    name: name || 'XAA',
    address,
    taxId,
    regNo,
    billingEmail: billing || 'billing@xaa.es',
    prefix: prefix || 'XAA-INV',
    footer,
    vatNote: vatNote || 'Services supplied from the EU. Where the reverse-charge procedure applies, VAT is to be accounted for by the recipient.',
  };
}

export async function saveSetting(key: string, raw: string, updatedBy: string): Promise<void> {
  const def = SETTING_DEFS.find((d) => d.key === key);
  if (!def) throw new Error(`Unknown setting: ${key}`);
  const database = await db();
  const value = raw.trim();

  // Blank on a secret means "keep what is stored"; the form never echoes it
  // back, so treating blank as a delete would wipe a key on every save.
  if (def.secret && !value) return;

  await database
    .prepare(
      `INSERT INTO app_settings (key, value, is_secret, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, is_secret = excluded.is_secret,
         updated_at = excluded.updated_at, updated_by = excluded.updated_by`
    )
    .bind(key, def.secret ? await encryptValue(value) : value, def.secret ? 1 : 0, nowIso(), updatedBy)
    .run();
}

export async function clearSetting(key: string): Promise<void> {
  const database = await db();
  await database.prepare('DELETE FROM app_settings WHERE key = ?').bind(key).run();
}

/**
 * One-time import of payment destinations that were configured as Worker
 * secrets before this screen existed, so upgrading does not silently empty
 * the client's payment page. Runs only when no method has been created yet.
 */
export async function seedMethodsFromEnv(): Promise<number> {
  const existing = await listPaymentMethods();
  if (existing.length > 0) return 0;

  const env = await appEnv();
  const candidates: PaymentMethodInput[] = [];
  if (env.USDT_TRC20_ADDRESS) candidates.push({ kind: 'crypto', label: 'USDT · TRC20', network: 'TRC20', currency: 'USDT', address: env.USDT_TRC20_ADDRESS, sortOrder: 1 });
  if (env.USDT_ERC20_ADDRESS) candidates.push({ kind: 'crypto', label: 'USDT · ERC20', network: 'ERC20', currency: 'USDT', address: env.USDT_ERC20_ADDRESS, sortOrder: 2 });
  if (env.USDT_BEP20_ADDRESS) candidates.push({ kind: 'crypto', label: 'USDT · BEP20', network: 'BEP20', currency: 'USDT', address: env.USDT_BEP20_ADDRESS, sortOrder: 3 });
  if (env.PAYPAL_EMAIL || env.PAYPAL_LINK) {
    candidates.push({
      kind: 'paypal',
      label: 'PayPal',
      currency: 'EUR',
      address: env.PAYPAL_EMAIL || env.PAYPAL_LINK || '',
      link: env.PAYPAL_LINK,
      sortOrder: 4,
    });
  }
  for (const c of candidates) await createPaymentMethod(c);
  return candidates.length;
}
