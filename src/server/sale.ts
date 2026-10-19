import { getSettings } from './settings';

/**
 * The sale of xaa.es itself — the domain, the code, the client portal, the
 * catalogue and the brand — offered on /acquire.
 *
 * Owner, 18 Oct 2026: "buatkan menu husus di xaa.es untuk menjual lepas xaa.es
 * … harga $10jt seperti axto.io … ubah dari portal admin". The admin changes
 * status, price and WhatsApp under Settings → Sale of xaa.es; until then the
 * defaults below apply. A sale of this size is closed by agreement, proof of
 * funds and a SWIFT wire or escrow, never by an unattended card checkout, so
 * the page collects offers and purchase requests into Leads and Support.
 */

export type SaleStatus = 'open' | 'paused' | 'sold';

export const SALE_DEFAULT_PRICE_USD = 10_000_000;
/** Owner, 18 Oct 2026: "ubah seluruh nomer HP … menjadi +6285691234561". */
export const SALE_DEFAULT_WHATSAPP = '+6285691234561';

export interface Sale {
  status: SaleStatus;
  priceUsd: number;
  whatsapp: string;
}

export const SALE_DEFAULTS: Sale = { status: 'open', priceUsd: SALE_DEFAULT_PRICE_USD, whatsapp: SALE_DEFAULT_WHATSAPP };

/** Turn stored strings into a valid sale; anything unusable falls back to the default. */
export function parseSale(raw: Record<string, string>): Sale {
  const status: SaleStatus = raw.sale_status === 'paused' || raw.sale_status === 'sold' ? raw.sale_status : 'open';
  const price = Number(String(raw.sale_price_usd ?? '').replace(/[^\d]/g, ''));
  const whatsapp = String(raw.sale_whatsapp ?? '').replace(/[^\d+ ]/g, '').trim();
  return {
    status,
    priceUsd: Number.isFinite(price) && price >= 10_000 ? price : SALE_DEFAULT_PRICE_USD,
    whatsapp: /\d{8,}/.test(whatsapp.replace(/\D/g, '')) ? whatsapp : SALE_DEFAULT_WHATSAPP,
  };
}

/** Current sale settings. A database that cannot be read shows the defaults, never an error page. */
export async function getSale(): Promise<Sale> {
  try {
    return parseSale(await getSettings(['sale_status', 'sale_price_usd', 'sale_whatsapp']));
  } catch {
    return { ...SALE_DEFAULTS };
  }
}

export const usdWhole = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const waLink = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
