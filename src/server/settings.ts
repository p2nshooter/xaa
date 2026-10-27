import { newId, nowIso, appEnv } from './db';
import { data } from './data';
import type { SecretDoc, SettingDoc } from './r2/schema';
import { encryptValue, decryptValue, maskSecret } from './crypto';
import { ulid } from './r2/ulid';

/**
 * Payment destinations and studio configuration, both maintained from the
 * admin UI rather than from Worker secrets.
 *
 * The point of keeping them in storage (R2: one object per destination and per
 * setting) is operational: a wallet address
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
  const d = await data();
  const marker = `secret/${COMPANY_SEEDED}`;
  const claim = await d.store.createDoc<SecretDoc>(marker, { value: 'seeding', updated_at: nowIso() });
  if (claim.created) {
    try {
      if ((await d.paymentMethods.countDocs()) === 0) await importCompanyMethods(isStarterBankAccount);
      await d.store.updateDoc<SecretDoc>(marker, claim.doc, () => ({ value: 'done', updated_at: nowIso() }));
    } catch (err) {
      // Let a later request try again rather than leave the marker half-set.
      await d.store.deleteDoc(marker).catch(() => undefined);
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
  const d = await data();
  const rows = (await d.paymentMethods.all())
    .filter((r) => !onlyActive || r.active === 1)
    .sort((a, b) => (onlyActive ? 0 : b.active - a.active) || a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
  return Promise.all(rows.map(openMethod));
}

export async function getPaymentMethod(id: string): Promise<PaymentMethod | null> {
  const row = await (await data()).paymentMethods.get(id);
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

/** The stored fields of a destination; secrets are encrypted here, before they are written. */
async function methodFields(input: PaymentMethodInput, keep?: { address_enc: string; memo_enc: string | null }) {
  return {
    kind: input.kind,
    label: input.label.trim().slice(0, 80),
    network: input.network?.trim() || null,
    currency: input.currency?.trim() || (input.kind === 'crypto' ? 'USDT' : 'EUR'),
    // An empty address field on edit means "leave the stored one alone" — the
    // form never shows the real value back, so blank must not wipe it.
    address_enc: input.address.trim() ? await encryptValue(input.address.trim()) : keep?.address_enc ?? (await encryptValue('')),
    memo_enc: input.memo?.trim() ? await encryptValue(input.memo.trim()) : keep ? keep.memo_enc : null,
    link: input.link?.trim() || null,
    instructions: input.instructions?.trim().slice(0, 1000) || null,
    active: input.active === false ? 0 : 1,
    sort_order: input.sortOrder ?? 0,
    holder: input.holder?.trim() || null,
    bank_name: input.bankName?.trim() || null,
    swift: input.swift?.trim() || null,
    branch: input.branch?.trim() || null,
    bank_country: input.bankCountry?.trim() || null,
  };
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<string> {
  const d = await data();
  const id = newId();
  const now = nowIso();
  await d.paymentMethods.create({ id, ...(await methodFields(input)), created_at: now, updated_at: now });
  return id;
}

export async function updatePaymentMethod(id: string, input: PaymentMethodInput): Promise<void> {
  const d = await data();
  const existing = await d.paymentMethods.get(id);
  if (!existing) throw new Error('Payment method not found.');
  const fields = await methodFields(input, existing);
  await d.paymentMethods.update(id, (cur) => ({ ...cur, ...fields, updated_at: nowIso() }));
}

export async function setPaymentMethodActive(id: string, active: boolean): Promise<void> {
  const d = await data();
  if (!(await d.paymentMethods.get(id))) return;
  await d.paymentMethods.update(id, (cur) => (cur.active === (active ? 1 : 0) ? null : { ...cur, active: active ? 1 : 0, updated_at: nowIso() }));
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await (await data()).paymentMethods.delete(id);
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
  group: 'company' | 'invoicing' | 'paypal' | 'sale' | 'invest' | 'integrations';
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
  { key: 'paypal_webhook_id', label: 'Live webhook ID', hint: 'Filled in automatically: saving or testing the Live keys creates the webhook on PayPal. Lets the portal check PayPal’s signature on notifications.', secret: false, group: 'paypal' },
  { key: 'paypal_sandbox_client_id', label: 'Sandbox client ID', hint: 'developer.paypal.com → Apps & Credentials → Sandbox → your app.', secret: false, group: 'paypal' },
  { key: 'paypal_sandbox_client_secret', label: 'Sandbox secret', hint: 'Encrypted at rest.', secret: true, group: 'paypal' },
  { key: 'paypal_sandbox_webhook_id', label: 'Sandbox webhook ID', hint: 'Filled in automatically when the Sandbox keys are saved or tested.', secret: false, group: 'paypal' },

  // The sale of xaa.es itself (/acquire, server/sale.ts). Owner, 18 Oct 2026:
  // "menu husus di xaa.es untuk menjual lepas xaa.es … harga $10jt … ubah dari
  // portal admin". Blank fields fall back to the defaults in server/sale.ts.
  {
    key: 'sale_status', label: 'Sale status', hint: 'Open shows the price and takes offers on /acquire. Paused keeps the page but stops new offers. Sold marks the site as sold.',
    secret: false, group: 'sale',
    options: [{ value: 'open', label: 'Open — accepting offers' }, { value: 'paused', label: 'Paused — page visible, no new offers' }, { value: 'sold', label: 'Sold' }],
  },
  { key: 'sale_price_usd', label: 'Asking price (USD)', hint: 'Whole dollars, digits only. Shown on /acquire and in the structured data search engines read.', secret: false, group: 'sale', placeholder: '10000000' },
  { key: 'sale_whatsapp', label: 'WhatsApp for buyers', hint: 'Where buyers send proof of funds and payment proof. International format.', secret: false, group: 'sale', placeholder: '+6285691234561' },

  // The investor offering of xaa.es alone (/invest, server/invest.ts). Owner,
  // 19 Oct 2026: "masing2 web nyari investornya, bukan gabungan". Blank fields
  // fall back to the defaults in server/invest.ts (the 14 Oct 2026 terms).
  {
    key: 'invest_visible', label: 'Show the investor offering', hint: 'Shown by default (owner, 27 Oct 2026). While hidden there is no footer link and no sitemap entry, /invest is a 404 and applications are refused; verified investors still see their statement in the portal. Every change is kept in the settings audit log.',
    secret: false, group: 'invest',
    options: [{ value: 'yes', label: 'Shown — /invest, footer link, applications (default)' }, { value: 'no', label: 'Hidden — not shown anywhere' }],
  },
  {
    key: 'invest_status', label: 'Offering status', hint: 'Open takes applications on /invest. Paused keeps the page but stops new applications. Closed marks the raise as complete.',
    secret: false, group: 'invest',
    options: [{ value: 'open', label: 'Open — taking applications' }, { value: 'paused', label: 'Paused — page visible, no new applications' }, { value: 'closed', label: 'Closed — raise complete' }],
  },
  { key: 'invest_target_usd', label: 'Raise target (USD)', hint: 'Whole dollars. An investor’s share is pool × capital ÷ target, so the target also fixes what each dollar earns.', secret: false, group: 'invest', placeholder: '2000000' },
  { key: 'invest_min_usd', label: 'Minimum ticket (USD)', hint: 'Smallest application /invest accepts.', secret: false, group: 'invest', placeholder: '50000' },
  { key: 'invest_pool_pct', label: 'Revenue pool (% of every xaa.es revenue transaction)', hint: 'Shared among verified investors pro rata to capital. Changing it changes every statement from that moment on — agree it with investors first.', secret: false, group: 'invest', placeholder: '30' },
  {
    key: 'invest_indexed', label: 'Show /invest in search engines', hint: 'Off by default: the page opens from its link and the site footer, but search engines are asked not to index it and it is left out of the sitemap.',
    secret: false, group: 'invest',
    options: [{ value: 'no', label: 'No — link only (recommended)' }, { value: 'yes', label: 'Yes — index and list in the sitemap' }],
  },
];

export const SETTING_GROUPS: { id: SettingDef['group']; title: string; blurb: string }[] = [
  { id: 'company', title: 'Company details', blurb: 'Who the invoice is from. Printed on every document the client receives.' },
  { id: 'invoicing', title: 'Invoicing', blurb: 'Numbering and the wording that appears beneath the totals.' },
  {
    id: 'paypal', title: 'PayPal Checkout',
    blurb: 'Clients pay with their PayPal balance or any card through PayPal, and the payment confirms itself the moment PayPal captures it — no transaction ID to paste, nothing to check by hand. Paste a Live and a Sandbox set and save: each set is checked with PayPal and its webhook is created automatically. The switch decides which set checkout uses.',
  },
  {
    id: 'sale', title: 'Sale of xaa.es',
    blurb: 'The /acquire page: whether the site is for sale, the asking price and the WhatsApp number buyers use. Offers and purchase requests arrive in Leads and in Support.',
  },
  {
    id: 'invest', title: 'Investor offering (xaa.es only)',
    blurb: 'The /invest page: whether xaa.es is raising, the target, the minimum ticket and the share of xaa.es revenue paid to investors. Applications arrive in Studio desk → Investors (and in Leads and Support); verified investors follow their statement in the portal. axto.io raises separately on its own site.',
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

const settingName = (key: string) => `setting/${key}`;

async function readSettings(keys: string[]): Promise<Map<string, SettingDoc>> {
  const d = await data();
  const docs = await Promise.all(keys.map((k) => d.store.getDoc<SettingDoc | null>(settingName(k), null)));
  return new Map(keys.flatMap((k, i) => (docs[i] ? [[k, docs[i]!] as const] : [])));
}

/** All settings, with secret values masked — safe to render in the admin UI. */
export async function listSettings(): Promise<SettingValue[]> {
  const stored = await readSettings(SETTING_DEFS.map((d) => d.key));

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
 * Read several settings at once, secrets opened — server-side only.
 * A key that is not stored (or no longer opens) comes back as ''.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = Object.fromEntries(keys.map((k) => [k, '']));
  if (keys.length === 0) return out;
  for (const [key, row] of await readSettings(keys)) {
    if (!row.value) continue;
    const def = SETTING_DEFS.find((d) => d.key === key);
    out[key] = def?.secret ? await decryptValue(row.value) : row.value;
  }
  return out;
}

/** Read one setting's real value, server-side only. */
export async function getSetting(key: string): Promise<string> {
  return (await getSettings([key]))[key] ?? '';
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
  const value = raw.trim();

  // Blank on a secret means "keep what is stored"; the form never echoes it
  // back, so treating blank as a delete would wipe a key on every save.
  if (def.secret && !value) return;
  if (def.options && value && !def.options.some((o) => o.value === value)) throw new Error(`${def.label}: choose one of the listed options.`);

  const doc: SettingDoc = { value: def.secret ? await encryptValue(value) : value, is_secret: def.secret ? 1 : 0, updated_at: nowIso(), updated_by: updatedBy };
  const d = await data();
  let before: string | null = null;
  await d.store.updateDoc<SettingDoc | null>(settingName(key), null, (cur) => { before = cur ? cur.value : null; return doc; });
  // The audit log of settings: who changed what, when — never a secret's value. Unchanged values leave no entry.
  const was = before as string | null;
  if (def.secret ? true : was !== value) {
    const at = nowIso();
    await d.store.append<SettingAuditEntry>(AUDIT_STREAM, `${ulid()}_${key}`, {
      key, from: def.secret ? (was ? '(set)' : '') : (was ?? ''), to: def.secret ? '(changed)' : value, by: updatedBy, at,
    }).catch((e) => console.error('settings audit entry failed (setting saved):', e));
  }
}

/** One change of a setting, kept in the append-only log `l/audit-settings/…`. */
export interface SettingAuditEntry { key: string; from: string; to: string; by: string; at: string }
const AUDIT_STREAM = 'audit-settings';

/** The latest changes of some settings (newest first). */
export async function settingAudit(keys?: string[], limit = 50): Promise<SettingAuditEntry[]> {
  const d = await data();
  const all = await d.store.readLog<SettingAuditEntry>(AUDIT_STREAM, { limit: 5000 });
  return all.map((e) => e.value).filter((e) => !keys || keys.includes(e.key)).reverse().slice(0, limit);
}

export async function clearSetting(key: string): Promise<void> {
  await (await data()).store.deleteDoc(settingName(key));
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
