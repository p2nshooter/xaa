import { getSettings } from './settings';
import { parseSaleAuction, type SaleAuctionSettings } from './sale-auction-terms';

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
 *
 * Since 28 Oct 2026 (request 66, docs/BLUEPRINT.md §14) it is sold by AUCTION by
 * default: rounds with a random opening bid between US$10M and US$100M, real bids
 * and a real deadline (server/sale-auction.ts). The winner still closes by
 * agreement and wire or escrow; "fixed" keeps the asking price and offers.
 */

export type SaleStatus = 'open' | 'paused' | 'sold';

export const SALE_DEFAULT_PRICE_USD = 10_000_000;
/** Owner, 18 Oct 2026: "ubah seluruh nomer HP … menjadi +6285691234561". */
export const SALE_DEFAULT_WHATSAPP = '+6285691234561';

export type SaleMode = 'auction' | 'fixed';
export interface Sale {
  status: SaleStatus;
  mode: SaleMode;
  priceUsd: number;
  whatsapp: string;
  auction: SaleAuctionSettings;
}

export const SALE_DEFAULTS: Sale = { status: 'open', mode: 'auction', priceUsd: SALE_DEFAULT_PRICE_USD, whatsapp: SALE_DEFAULT_WHATSAPP, auction: parseSaleAuction({}) };
export const SALE_KEYS = [
  'sale_status', 'sale_price_usd', 'sale_whatsapp', 'sale_mode', 'sale_auction_random', 'sale_auction_open_usd', 'sale_auction_step_usd',
  'sale_auction_days', 'sale_auction_snipe_minutes', 'sale_auction_pay_days', 'sale_auction_restart', 'sale_auction_approval',
];

/** Turn stored strings into a valid sale; anything unusable falls back to the default. */
export function parseSale(raw: Record<string, string>): Sale {
  const status: SaleStatus = raw.sale_status === 'paused' || raw.sale_status === 'sold' ? raw.sale_status : 'open';
  const price = Number(String(raw.sale_price_usd ?? '').replace(/[^\d]/g, ''));
  const whatsapp = String(raw.sale_whatsapp ?? '').replace(/[^\d+ ]/g, '').trim();
  return {
    status,
    mode: raw.sale_mode === 'fixed' ? 'fixed' : 'auction',
    priceUsd: Number.isFinite(price) && price >= 10_000 ? price : SALE_DEFAULT_PRICE_USD,
    whatsapp: /\d{8,}/.test(whatsapp.replace(/\D/g, '')) ? whatsapp : SALE_DEFAULT_WHATSAPP,
    auction: parseSaleAuction(raw),
  };
}

/** Current sale settings. A database that cannot be read shows the defaults, never an error page. */
export async function getSale(): Promise<Sale> {
  try {
    return parseSale(await getSettings(SALE_KEYS));
  } catch {
    return { ...SALE_DEFAULTS };
  }
}

export const usdWhole = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const waLink = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
