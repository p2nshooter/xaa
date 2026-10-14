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
  holder: string | null;
  bank_name: string | null;
  swift: string | null;
  branch: string | null;
  bank_country: string | null;
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
  holder: string | null;
  bankName: string | null;
  swift: string | null;
  branch: string | null;
  bankCountry: string | null;
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
    holder: row.holder ?? null,
    bankName: row.bank_name ?? null,
    swift: row.swift ?? null,
    branch: row.branch ?? null,
    bankCountry: row.bank_country ?? null,
    unreadable: Boolean(row.address_enc) && address === '',
  };
}

const COMPANY_SEEDED = '__company_methods_seeded__';
let companyChecked = false;

/** The two accounts the owner asked to be ready on day one (14 Oct 2026). */
export const isStarterBankAccount = (m: PaymentMethodInput) => m.kind === 'bank' && (m.currency === 'EUR' || m.currency === 'USD');

/**
 * A fresh install never shows a client an empty payment screen: the first
 * time destinations are listed, the company's BNI EUR and USD accounts are
 * put in place (encrypted like any other). This happens once per database —
 * the marker is written even when destinations already exist, so whatever an
 * admin later disables or deletes stays that way. The rest of the company
 * list (crypto, other currencies) stays one click away under Payments.
 */
export async function ensureStarterMethods(): Promise<void> {
  if (companyChecked) return;
  const database = await db();
  const claim = await database
    .prepare('INSERT OR IGNORE INTO app_secrets (key, value, updated_at) VALUES (?, ?, ?)')
    .bind(COMPANY_SEEDED, 'seeding', nowIso())
    .run();
  if ((claim.meta?.changes ?? 0) > 0) {
    try {
      const count = await database.prepare('SELECT COUNT(*) AS n FROM payment_methods').first<{ n: number }>();
      if (!count?.n) await importCompanyMethods(isStarterBankAccount);
      await database.prepare('UPDATE app_secrets SET value = ?, updated_at = ? WHERE key = ?').bind('done', nowIso(), COMPANY_SEEDED).run();
    } catch (err) {
      // Let a later request try again rather than leave the marker half-set.
      await database.prepare('DELETE FROM app_secrets WHERE key = ?').bind(COMPANY_SEEDED).run();
      throw err;
    }
  }
  companyChecked = true;
}

export async function listPaymentMethods(onlyActive = false): Promise<PaymentMethod[]> {
  try {
    await ensureStarterMethods();
  } catch (err) {
    console.error('starter payment methods could not be prepared (continuing):', err);
  }
  return listStoredMethods(onlyActive);
}

async function listStoredMethods(onlyActive: boolean): Promise<PaymentMethod[]> {
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
  holder?: string;
  bankName?: string;
  swift?: string;
  branch?: string;
  bankCountry?: string;
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<string> {
  const database = await db();
  const id = newId();
  const now = nowIso();
  await database
    .prepare(
      `INSERT INTO payment_methods (id, kind, label, network, currency, address_enc, memo_enc, link,
        instructions, active, sort_order, holder, bank_name, swift, branch, bank_country, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
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
      input.instructions?.trim().slice(0, 1000) || null,
      input.active === false ? 0 : 1,
      input.sortOrder ?? 0,
      input.holder?.trim() || null,
      input.bankName?.trim() || null,
      input.swift?.trim() || null,
      input.branch?.trim() || null,
      input.bankCountry?.trim() || null,
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
        memo_enc = ?, link = ?, instructions = ?, active = ?, sort_order = ?, holder = ?, bank_name = ?,
        swift = ?, branch = ?, bank_country = ?, updated_at = ?
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
      input.instructions?.trim().slice(0, 1000) || null,
      input.active === false ? 0 : 1,
      input.sortOrder ?? 0,
      input.holder?.trim() || null,
      input.bankName?.trim() || null,
      input.swift?.trim() || null,
      input.branch?.trim() || null,
      input.bankCountry?.trim() || null,
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

/**
 * The full decrypted value of one destination, for the admin reveal (show/hide)
 * button. Server-side only, and the caller must be an admin.
 */
export async function revealPaymentMethod(id: string): Promise<{ address: string; memo: string } | null> {
  const m = await getPaymentMethod(id);
  if (!m) return null;
  return { address: m.address, memo: m.memo };
}

/**
 * A ready-made international transfer guide for BNI, offered as the default
 * `instructions` when an admin adds a BNI account. Indonesia's BNI receives
 * inbound foreign-currency wires under one SWIFT/BIC, so a European client
 * paying in EUR needs exactly these fields — most get it wrong the first time.
 */
export const BNI_SWIFT = 'BNINIDJA';
export function bniTransferGuide(opts: { holder?: string; account?: string; branch?: string; currency?: string }): string {
  const cur = opts.currency || 'EUR';
  const lines = [
    `International transfer to Bank Negara Indonesia (BNI), Indonesia.`,
    ``,
    `Beneficiary bank : BANK NEGARA INDONESIA (PERSERO) TBK`,
    `SWIFT / BIC      : ${BNI_SWIFT}`,
  ];
  if (opts.branch) lines.push(`Branch           : ${opts.branch}`);
  lines.push(
    `Beneficiary name : ${opts.holder || '[account holder]'}`,
    `Account number   : ${opts.account || '[account number]'}`,
    `Currency         : ${cur}`,
    ``,
    `Steps from your bank / provider (Wise, Revolut, or a bank wire):`,
    `1. Choose an INTERNATIONAL / SWIFT transfer, not a domestic one.`,
    `2. Country: Indonesia. Bank: BNI. SWIFT/BIC: ${BNI_SWIFT}.`,
    `3. Enter the beneficiary name EXACTLY as above and the account number.`,
    `4. Send in ${cur}; BNI converts to IDR on arrival at their rate.`,
    `5. Pay the sender + correspondent fees ("OUR") so the full amount arrives,`,
    `   or tell us if you send "SHA" so we can reconcile the small shortfall.`,
    `6. Reference: your project code (XAA-…). Arrival is usually 1–3 business days.`,
    ``,
    `After sending, paste the wire reference below so we can match your payment.`
  );
  return lines.join('\n');
}

/* ───────────────────────── Studio settings ───────────────────────── */

export interface SettingDef {
  key: string;
  label: string;
  hint: string;
  secret: boolean;
  group: 'company' | 'invoicing' | 'paypal' | 'integrations';
  placeholder?: string;
  /** Fixed choices: rendered as a select instead of a text field. */
  options?: { value: string; label: string }[];
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

  // PayPal Checkout (server/paypal.ts). Two complete credential sets; the mode
  // decides which one checkout uses. Client IDs are public by design (PayPal
  // puts them in every buyer's browser); secrets are encrypted at rest.
  {
    key: 'paypal_mode', label: 'Checkout uses', hint: 'Live moves real money. Sandbox is PayPal’s test environment — nothing is charged and test payments are labelled as such.',
    secret: false, group: 'paypal',
    options: [{ value: 'live', label: 'Live — real payments' }, { value: 'sandbox', label: 'Sandbox — test payments only' }],
  },
  { key: 'paypal_client_id', label: 'Live client ID', hint: 'developer.paypal.com → Apps & Credentials → Live → your app.', secret: false, group: 'paypal' },
  { key: 'paypal_client_secret', label: 'Live secret', hint: 'Same screen, “Secret key 1”. Encrypted at rest.', secret: true, group: 'paypal' },
  { key: 'paypal_webhook_id', label: 'Live webhook ID (optional)', hint: 'Lets the portal check PayPal’s signature on notifications. Payments confirm without it.', secret: false, group: 'paypal' },
  { key: 'paypal_sandbox_client_id', label: 'Sandbox client ID', hint: 'developer.paypal.com → Apps & Credentials → Sandbox → your app.', secret: false, group: 'paypal' },
  { key: 'paypal_sandbox_client_secret', label: 'Sandbox secret', hint: 'Encrypted at rest.', secret: true, group: 'paypal' },
  { key: 'paypal_sandbox_webhook_id', label: 'Sandbox webhook ID (optional)', hint: 'The webhook created on the Sandbox app.', secret: false, group: 'paypal' },
];

export const SETTING_GROUPS: { id: SettingDef['group']; title: string; blurb: string }[] = [
  { id: 'company', title: 'Company details', blurb: 'Who the invoice is from. Printed on every document the client receives.' },
  { id: 'invoicing', title: 'Invoicing', blurb: 'Numbering and the wording that appears beneath the totals.' },
  {
    id: 'paypal', title: 'PayPal Checkout',
    blurb: 'Clients pay with their PayPal balance or any card through PayPal, and the payment confirms itself the moment PayPal captures it — no transaction ID to paste, nothing to check by hand. Fill in a Live and a Sandbox set; the switch decides which one checkout uses.',
  },
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

/**
 * Read several settings in one query, secrets opened — server-side only.
 * A key that is not stored (or no longer opens) comes back as ''.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = Object.fromEntries(keys.map((k) => [k, '']));
  if (keys.length === 0) return out;
  const database = await db();
  const { results } = await database
    .prepare(`SELECT key, value FROM app_settings WHERE key IN (${keys.map(() => '?').join(',')})`)
    .bind(...keys)
    .all<{ key: string; value: string }>();
  for (const row of results ?? []) {
    if (!row.value) continue;
    const def = SETTING_DEFS.find((d) => d.key === row.key);
    out[row.key] = def?.secret ? await decryptValue(row.value) : row.value;
  }
  return out;
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
  if (def.options && value && !def.options.some((o) => o.value === value)) throw new Error(`${def.label}: choose one of the listed options.`);

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
/**
 * Import the company's own destinations (src/content/company-payments.ts,
 * taken from the ulyah.com repository). Idempotent: a destination whose
 * address is already stored — active or not — is skipped, so pressing the
 * button twice never creates duplicates.
 */
export async function importCompanyMethods(only?: (m: PaymentMethodInput) => boolean): Promise<number> {
  const { COMPANY_PAYMENT_METHODS } = await import('@/content/company-payments');
  const existing = new Set((await listStoredMethods(false)).map((m) => (m.address ?? '').trim()).filter(Boolean));
  let added = 0;
  for (const m of COMPANY_PAYMENT_METHODS) {
    if (only && !only(m)) continue;
    if (existing.has(m.address.trim())) continue;
    await createPaymentMethod(m);
    added += 1;
  }
  return added;
}

export async function seedMethodsFromEnv(): Promise<number> {
  // Skips any address already stored, so it can run beside the starter BNI
  // accounts (and twice) without creating duplicates.
  const existing = new Set((await listStoredMethods(false)).map((m) => (m.address ?? '').trim()).filter(Boolean));

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
  const fresh = candidates.filter((c) => c.address.trim() && !existing.has(c.address.trim()));
  for (const c of fresh) await createPaymentMethod(c);
  return fresh.length;
}
