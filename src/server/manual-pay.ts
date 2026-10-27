import type { PaymentMethod } from './settings';
import { coinsOf, quoteInvoice, type QuoteLine } from './fx';
import { qrSvg } from '@/lib/qr';
import { BANK_CODES, COINS, COIN_INFO, FIAT, FIAT_INFO, formatAmount, isCoin, isFiat, plainAmount, settles } from '@/lib/pay-money';

/**
 * The manual ways to pay one invoice, as the payment guide shows them (docs/BLUEPRINT.md §12.3): every active BNI
 * currency account and every coin of every company wallet, each with the exact amount in its own currency (locked —
 * server/fx.ts), the details to copy and, for a wallet, a QR code drawn here from the stored address.
 */

export interface PayOption {
  key: string;
  destId: string;
  kind: 'bank' | 'crypto' | 'paypal';
  asset: string;
  title: string;
  link: string | null;
  network: string | null;
  amount: number | null;
  amountText: string | null;
  plain: string | null;
  until: string | null;
  rate: string | null;
  stale: boolean;
  address: string;
  memo: string | null;
  holder: string | null;
  bankName: string | null;
  swift: string | null;
  bankCode: string | null;
  branch: string | null;
  bankCountry: string | null;
  instructions: string | null;
  qr: string | null;
}

/** What the buyer said they paid with, as stored on the order or payment — the expected amount is ours. */
export interface PaySubmission {
  method_id: string;
  asset: string;
  label: string;
  network: string | null;
  expected: number | null;
  rate: number | null;
  rate_date: string | null;
  paid: number | null;
  short: number;
  ok: boolean | null;
}

const order = (o: PayOption) =>
  o.kind === 'bank' ? FIAT.indexOf(o.asset as never) : o.kind === 'paypal' ? 500 : 100 + COINS.indexOf(o.asset as never) * 10 + (o.network === 'TRC20' ? 0 : 1);

function rateText(line: QuoteLine): string {
  if (line.asset === 'EUR') return '';
  const per = isCoin(line.asset) && !COIN_INFO[line.asset].stable ? `1 ${line.asset} = €${(1 / line.rate).toLocaleString('en-GB', { maximumFractionDigits: 2 })}` : `1 EUR = ${line.rate.toLocaleString('en-GB', { maximumFractionDigits: 4 })} ${line.asset}`;
  return `${per} · ${line.rate_date}`;
}

export async function payOptions(invoice: string, amountEur: number, methods: PaymentMethod[], opts: { manualPaypal?: boolean } = {}): Promise<PayOption[]> {
  // A manual PayPal destination only while PayPal Checkout is off — otherwise it is a slower copy of it.
  const usable = methods.filter((m) => m.active && !m.unreadable && m.address && (m.kind !== 'paypal' || opts.manualPaypal));
  const pairs: { m: PaymentMethod; asset: string }[] = [];
  for (const m of usable) {
    if (m.kind === 'crypto') for (const c of coinsOf(m)) pairs.push({ m, asset: c });
    else pairs.push({ m, asset: m.kind === 'paypal' ? 'EUR' : m.currency.toUpperCase() });
  }
  const quotable = pairs.filter((p) => p.m.kind !== 'paypal').map((p) => p.asset).filter((a) => isFiat(a) || isCoin(a));
  const lines = quotable.length ? await quoteInvoice(invoice, amountEur, quotable).catch((err) => {
    console.error('quote failed (showing euro amounts):', err);
    return {} as Record<string, QuoteLine>;
  }) : {};

  const out = pairs.map(({ m, asset }): PayOption => {
    const line = m.kind === 'paypal' ? { asset: 'EUR', amount: Math.ceil(amountEur * 100) / 100, rate: 1, rate_date: '', until: '' } as QuoteLine : lines[asset];
    const swift = m.swift?.toUpperCase() ?? null;
    return {
      key: `${m.id}:${asset}`,
      destId: m.id,
      kind: m.kind,
      asset,
      link: m.link,
      title: m.kind === 'paypal' ? 'PayPal' : m.kind === 'bank'
        ? `${asset}${isFiat(asset) ? ` · ${FIAT_INFO[asset].name}` : ''}`
        : `${asset}${m.network && m.network.toUpperCase() !== COIN_INFO[asset as keyof typeof COIN_INFO]?.name.toUpperCase() ? ` · ${m.network}` : ''}`,
      network: m.network,
      amount: line?.amount ?? null,
      amountText: line ? formatAmount(line.amount, asset) : null,
      plain: line ? plainAmount(line.amount, asset) : null,
      until: line?.until || null,
      rate: line ? rateText(line) || null : null,
      stale: Boolean(line?.stale),
      address: m.address,
      memo: m.memo || null,
      holder: m.holder,
      bankName: m.bankName,
      swift,
      bankCode: swift ? BANK_CODES[swift] ?? null : null,
      branch: m.branch,
      bankCountry: m.bankCountry,
      instructions: m.instructions,
      qr: m.kind === 'crypto' ? qrSvg(m.address, { title: `${asset} ${m.network ?? ''} address` }) : null,
    };
  });
  return out.sort((a, b) => order(a) - order(b));
}

/**
 * Resolve what a buyer submitted: the destination they paid to, the asset, our expected amount for it, and how
 * their stated amount compares (up to 2 % short is accepted — the shortfall is recorded either way).
 */
export async function resolveSubmission(
  invoice: string, amountEur: number, methods: PaymentMethod[], key: string, paidRaw: number | null,
): Promise<PaySubmission | null> {
  const [destId, assetRaw] = key.split(':');
  const m = methods.find((x) => x.id === destId && x.active);
  if (!m) return null;
  const asset = (assetRaw || m.currency).toUpperCase();
  if (m.kind === 'crypto' && !coinsOf(m).includes(asset as never)) return null;
  if (m.kind === 'bank' && asset !== m.currency.toUpperCase()) return null;
  let line: QuoteLine | null = null;
  if (m.kind === 'paypal') line = { asset: 'EUR', amount: Math.ceil(amountEur * 100) / 100, rate: 1, rate_date: '', until: '' };
  else if (isFiat(asset) || isCoin(asset)) {
    const lines = await quoteInvoice(invoice, amountEur, [asset]).catch(() => ({}) as Record<string, QuoteLine>);
    line = lines[asset] ?? null;
  }
  const decimals = isFiat(asset) ? FIAT_INFO[asset].decimals : isCoin(asset) ? COIN_INFO[asset].decimals : 2;
  const cmp = line && paidRaw != null ? settles(paidRaw, line.amount, decimals) : null;
  return {
    method_id: m.id,
    asset,
    label: m.kind === 'paypal' ? 'PayPal (manual)' : m.kind === 'bank' ? `${m.swift?.toUpperCase() === 'BNINIDJA' ? 'BNI' : m.bankName || 'Bank'} ${asset}` : `${asset}${m.network ? ` ${m.network}` : ''}`,
    network: m.network,
    expected: line?.amount ?? null,
    rate: line?.rate ?? null,
    rate_date: line?.rate_date || null,
    paid: paidRaw,
    short: cmp?.short ?? 0,
    ok: cmp ? cmp.ok : null,
  };
}

/** One line for the admin and the buyer: "Expected Rp 6.125.437 · stated Rp 6.100.000 (short Rp 25.437)". */
export function submissionLine(p: PaySubmission): string {
  const fmt = (n: number) => formatAmount(n, p.asset);
  const parts = [p.expected != null ? `Expected ${fmt(p.expected)}` : `Paid in ${p.asset}`];
  if (p.paid != null) parts.push(`stated ${fmt(p.paid)}`);
  if (p.short > 0) parts.push(`short ${fmt(p.short)}${p.ok ? ' — within the 2 % fee tolerance' : ''}`);
  if (p.rate_date && p.asset !== 'EUR') parts.push(`rate of ${p.rate_date}`);
  return parts.join(' · ');
}

/** The quote of a template or auction order: one invoice per order, in its euro price. */
export const orderInvoice = (o: { id: string; price: number }) => ({ key: `order-${o.id}`, eur: o.price });
/** The quote of a project milestone: one invoice per milestone; its amount follows the contract. */
export const milestoneInvoice = (projectId: string, milestone: string) => `ms-${projectId}-${milestone}`;
