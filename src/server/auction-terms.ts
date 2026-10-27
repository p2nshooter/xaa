/**
 * The xaa.es auction — the rules (docs/BLUEPRINT.md §10; owner, 27 Oct 2026, requests 55, 58, 59 and 63).
 *
 * xaa.es sells no licences, so this is not axto.io's licence auction: what goes under the hammer is the
 * studio's work — a finished website, the web/script only, a website with its domain — and domain names.
 *
 * Who sells what (request 59): xaa.es's own scripts go up automatically, every two weeks from Friday
 * 07:00 WIB (00:00 UTC) to Friday 07:00 WIB, the next round opening the moment one ends; members sell
 * domain names only, once a DNS TXT record proves the domain is theirs, and xaa.es takes a 30 % sales
 * commission only when one sells (request 63); the admin sells every type, and a website with its
 * domain is the admin's alone. Every other lot runs exactly 14 days from the moment it starts.
 *
 * Prices: bidding opens at 35 % of the lot's reference price (the catalogue price, the admin's price or
 * the member's asking price) and every bid is exactly +5 % of the opening bid, never above the
 * reference price. A bid in the last 5 minutes extends that lot; a reserve price, when set, is never
 * shown and a lot that does not reach it ends unsold and may be relisted. The winner pays through the
 * normal checkout — a bank transfer needs the payment screenshot and the admin's approval — and the
 * assets open only once it is paid; until then the win is shown as "not paid yet".
 *
 * Pure (no storage) so the pages, the actions and the tests share one rule book; server/auction.ts
 * keeps the lots, bids, bidders and domain claims in R2.
 */

const DAY = 86_400_000;
/** The first auction ends on Friday 6 November 2026 at 07:00 WIB (= 00:00 UTC), as on axto.io; then every 14 days. */
export const AUCTION_ANCHOR_MS = Date.UTC(2026, 10, 6, 0, 0, 0);
export const CYCLE_MS = 14 * DAY;
export const AUCTION_TZ = 'Asia/Jakarta';
export const AUCTION_TZ_LABEL = 'WIB';
/** A bid this close to the end moves the end to this long after the bid. */
export const SNIPE_MINUTES = 5;
/** The time a winner is asked to pay in (shown; the win stays theirs after it unless the admin passes it on). */
export const PAY_DAYS = 3;

/** The end of the auction running at `t` (ms): the first Friday-07:00-WIB grid point strictly after it. */
export function cycleEndAfter(t: number): number {
  return AUCTION_ANCHOR_MS + (Math.floor((t - AUCTION_ANCHOR_MS) / CYCLE_MS) + 1) * CYCLE_MS;
}
export const cycleStartOf = (end: number) => end - CYCLE_MS;
/** "2026-11-06" — the id of an auction (its last day). */
export const cycleId = (end: number) => new Date(end).toISOString().slice(0, 10);

/* ---- lots ------------------------------------------------------------------ */

/** What the winner receives (owner: "lelang website jadi, lelang web / script nya aja, dan lelang website + domainya … dan domain saja"). */
export const LOT_TYPES = ['website', 'script', 'website_domain', 'domain'] as const;
export type LotType = (typeof LOT_TYPES)[number];
export const isLotType = (v: unknown): v is LotType => typeof v === 'string' && (LOT_TYPES as readonly string[]).includes(v);
/** Lot types that include a domain name (moved by the admin with the registrar's transfer code). */
export const hasDomain = (t: LotType) => t === 'website_domain' || t === 'domain';
/** Lot types that include code (the archive opens to the winner once paid). */
export const hasCode = (t: LotType) => t !== 'domain';

export type LotStatus = 'draft' | 'open' | 'awaiting_payment' | 'sold' | 'unsold' | 'cancelled';

/** Who put a lot up: xaa.es itself (automatic products), the admin, or a member. */
export const SELLERS = ['xaa', 'admin', 'member'] as const;
export type Seller = (typeof SELLERS)[number];
/** Request 59: members sell domain names only, xaa.es's automatic lots are its scripts, the admin sells every type (a website with its domain is the admin's alone). */
export function sellerMaySell(seller: Seller, type: LotType): boolean {
  if (seller === 'member') return type === 'domain';
  if (seller === 'xaa') return type === 'script';
  return true;
}

/** Every lot runs 14 days from its start; xaa.es's own products follow the Friday 07:00 WIB grid instead. */
export const LOT_DAYS = 14;
export function lotEndFor(seller: Seller, startMs: number): number {
  return seller === 'xaa' ? cycleEndAfter(startMs) : startMs + LOT_DAYS * DAY;
}

/** The categories the owner asked for (article sites, SaaS, e-commerce: clothing, watches …). Admin adds or renames them. */
export interface AuctionCategory { slug: string; group: 'articles' | 'saas' | 'ecommerce' | 'other'; en: string; es: string; id: string }
export const DEFAULT_CATEGORIES: AuctionCategory[] = [
  { slug: 'article-sites', group: 'articles', en: 'Article & blog sites', es: 'Webs de artículos y blogs', id: 'Website artikel & blog' },
  { slug: 'adsense-sites', group: 'articles', en: 'AdSense-ready content sites', es: 'Webs de contenido listas para AdSense', id: 'Website konten siap AdSense' },
  { slug: 'news-portals', group: 'articles', en: 'News & magazine portals', es: 'Portales de noticias y revistas', id: 'Portal berita & majalah' },
  { slug: 'saas', group: 'saas', en: 'SaaS apps', es: 'Aplicaciones SaaS', id: 'Aplikasi SaaS' },
  { slug: 'booking', group: 'saas', en: 'Booking & reservations', es: 'Reservas y citas', id: 'Booking & reservasi' },
  { slug: 'invoicing-crm', group: 'saas', en: 'Invoicing, CRM & HR', es: 'Facturación, CRM y RR. HH.', id: 'Invoice, CRM & HR' },
  { slug: 'learning', group: 'saas', en: 'Courses & learning (LMS)', es: 'Cursos y formación (LMS)', id: 'Kursus & pembelajaran (LMS)' },
  { slug: 'ecommerce-fashion', group: 'ecommerce', en: 'E-commerce: clothing & fashion', es: 'Tienda online: ropa y moda', id: 'Toko online: baju & fashion' },
  { slug: 'ecommerce-muslim-fashion', group: 'ecommerce', en: 'E-commerce: modest & Muslim fashion', es: 'Tienda online: moda modesta y musulmana', id: 'Toko online: busana muslim' },
  { slug: 'ecommerce-watches', group: 'ecommerce', en: 'E-commerce: watches & jewellery', es: 'Tienda online: relojes y joyería', id: 'Toko online: jam tangan & perhiasan' },
  { slug: 'ecommerce-shoes-bags', group: 'ecommerce', en: 'E-commerce: shoes & bags', es: 'Tienda online: calzado y bolsos', id: 'Toko online: sepatu & tas' },
  { slug: 'ecommerce-beauty', group: 'ecommerce', en: 'E-commerce: beauty & skincare', es: 'Tienda online: belleza y cosmética', id: 'Toko online: kosmetik & skincare' },
  { slug: 'ecommerce-electronics', group: 'ecommerce', en: 'E-commerce: electronics & gadgets', es: 'Tienda online: electrónica', id: 'Toko online: elektronik & gadget' },
  { slug: 'ecommerce-food', group: 'ecommerce', en: 'E-commerce: food & drink', es: 'Tienda online: alimentación', id: 'Toko online: makanan & minuman' },
  { slug: 'ecommerce-digital', group: 'ecommerce', en: 'E-commerce: digital products', es: 'Tienda online: productos digitales', id: 'Toko online: produk digital' },
  { slug: 'marketplace-directory', group: 'other', en: 'Marketplaces & directories', es: 'Marketplaces y directorios', id: 'Marketplace & direktori' },
  { slug: 'company-landing', group: 'other', en: 'Company profiles & landing pages', es: 'Webs corporativas y landing pages', id: 'Company profile & landing page' },
  { slug: 'community', group: 'other', en: 'Communities & forums', es: 'Comunidades y foros', id: 'Komunitas & forum' },
  { slug: 'portfolio', group: 'other', en: 'Creative portfolios', es: 'Portafolios creativos', id: 'Portofolio kreatif' },
  { slug: 'property', group: 'other', en: 'Property & real estate', es: 'Inmobiliaria', id: 'Properti' },
  { slug: 'restaurant', group: 'other', en: 'Restaurants & catering', es: 'Restaurantes y catering', id: 'Restoran & katering' },
  { slug: 'domains', group: 'other', en: 'Domain names', es: 'Nombres de dominio', id: 'Nama domain' },
];
export const CATEGORY_SLUG_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

/** The opening bid and the raise (owner, 27 Oct 2026, request 59): 35 % of the normal price, then +5 % of the opening bid — fixed for xaa.es's own products, the default for every other lot. */
export const DEFAULT_OPEN_PCT = 35;
export const DEFAULT_STEP_PCT = 5;
export const defaultOpening = (normal: number) => Math.max(1, Math.ceil((normal * DEFAULT_OPEN_PCT) / 100));
export const defaultStep = (open: number) => Math.max(1, Math.ceil((open * DEFAULT_STEP_PCT) / 100));

/** What a lot's prices must satisfy (all whole euros): open ≤ normal, step ≥ 1, reserve and buy-now within [open, normal]. */
export function priceProblem(p: { normal: number; open: number; step: number; reserve: number; buyNow: number }): string | null {
  for (const [k, v] of Object.entries(p)) if (!Number.isInteger(v) || v < 0) return `${k} must be a whole number of euros`;
  if (p.normal < 1) return 'normal price must be at least €1';
  if (p.open < 1 || p.open > p.normal) return 'opening bid must be between €1 and the normal price';
  if (p.step < 1) return 'raise must be at least €1';
  if (p.reserve && (p.reserve < p.open || p.reserve > p.normal)) return 'reserve must be between the opening bid and the normal price';
  if (p.buyNow && (p.buyNow < p.open || p.buyNow > p.normal)) return 'buy-now price must be between the opening bid and the normal price';
  return null;
}

/**
 * The sales commission on a member's domain lot (owner, 27 Oct 2026, requests 59 and 63: "Bukan biaya 30%,
 * tp komisi penjualan dari lelang domain sebesar 30%"): 30 % of the final price, taken only when the domain
 * sells. Listing, DNS verification, running and relisting a lot cost nothing; an unsold domain is never charged.
 * xaa.es's own lots and the admin's lots carry no commission.
 */
export const MEMBER_COMMISSION_PCT = 30;

/** How a sold member lot's final price splits, in cents-exact euros: xaa.es's commission and the seller's 70 %. */
export function saleSplit(finalEur: number): { commission: number; seller: number } {
  const cents = Math.round(finalEur * 100);
  const commission = Math.round((cents * MEMBER_COMMISSION_PCT) / 100);
  return { commission: commission / 100, seller: (cents - commission) / 100 };
}

export interface LotState {
  status: string; starts_at: string; ends_at: string; normal_eur: number; open_eur: number; step_eur: number;
  bids_count: number; high_eur: number; high_user: string;
}

/** The next bid: the opening bid, then the high bid plus one step — the last step stops at the normal price. */
export const nextBid = (l: Pick<LotState, 'bids_count' | 'high_eur' | 'open_eur' | 'step_eur' | 'normal_eur'>) =>
  l.bids_count > 0 ? Math.min(l.high_eur + l.step_eur, l.normal_eur) : l.open_eur;

export type BidProblem = 'closed' | 'not_started' | 'ended' | 'too_low' | 'too_high' | 'not_next' | 'already_highest' | 'bad_amount';

/** Why a bid cannot be placed (null = it can). Every bid is exactly the next price, whole euros, never above the normal price. */
export function bidProblem(l: LotState, amount: number, userId: string, nowMs: number): BidProblem | null {
  if (l.status !== 'open') return 'closed';
  if (nowMs < Date.parse(l.starts_at)) return 'not_started';
  if (nowMs >= Date.parse(l.ends_at)) return 'ended';
  if (!Number.isInteger(amount) || amount < 1) return 'bad_amount';
  if (l.bids_count > 0 && l.high_user === userId) return 'already_highest';
  if (l.bids_count > 0 && l.high_eur >= l.normal_eur) return 'too_high';
  if (amount > l.normal_eur) return 'too_high';
  const next = nextBid(l);
  if (amount < next) return l.bids_count > 0 && amount > l.high_eur ? 'not_next' : 'too_low';
  if (amount > next) return 'not_next';
  return null;
}

/** Anti-snipe: a bid this close to the end moves the end to SNIPE_MINUTES after the bid. */
export function extendedEnd(endsAt: string, nowMs: number, minutes = SNIPE_MINUTES): string {
  const end = Date.parse(endsAt);
  const guard = minutes * 60_000;
  return guard > 0 && end - nowMs < guard ? new Date(nowMs + guard).toISOString() : endsAt;
}

/** A lot that has ended: sold to the top bid when it reached the reserve, otherwise unsold. */
export function outcomeOf(l: LotState & { reserve_eur: number }): 'awaiting_payment' | 'unsold' {
  return l.bids_count > 0 && l.high_eur >= (l.reserve_eur || 0) ? 'awaiting_payment' : 'unsold';
}

/** A domain as typed: lower case, no scheme, path or leading "www.", letters/digits/hyphens and dots, one known shape. */
export function cleanDomain(raw: unknown): string | null {
  const d = String(raw ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/?#].*$/, '').replace(/\.$/, '').replace(/^www\./, '');
  return /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,24}|xn--[a-z0-9-]{1,59})$/.test(d) ? d : null;
}

/** "shop" and "co.uk" for "shop.co.uk": the name a buyer types and everything after its first dot. */
export function domainParts(domain: string): { name: string; tld: string } {
  const i = domain.indexOf('.');
  return i < 0 ? { name: domain, tld: '' } : { name: domain.slice(0, i), tld: domain.slice(i + 1) };
}

/** The owner's own domains and their sister sites are never put up by a member (request 62: not for sale). */
const NEVER_LISTED = ['xaa.es', 'axto.io', 'ulyah.com', 'axto.dev', 'axto.us'];
export type DomainProblem = 'shape' | 'ours' | 'brand';
export function domainProblem(raw: unknown): DomainProblem | null {
  const d = cleanDomain(raw);
  if (!d) return 'shape';
  if (NEVER_LISTED.some((o) => d === o || d.endsWith(`.${o}`))) return 'ours';
  const { name } = domainParts(d);
  const joined = unleet(fold(name).replace(/[^a-z0-9]/g, ''));
  if (BRANDS_INSIDE.some((b) => joined.includes(b)) || BRANDS.some((b) => !b.includes(' ') && b.length >= 4 && joined === b)) return 'brand';
  return null;
}

/* ---- DNS ownership proof for a member's domain (request 59) ----------------- */

/** The record a member adds: TXT _xaa-verify.<domain> = "xaa-verify=<token>". */
export const DNS_LABEL = '_xaa-verify';
export const dnsRecordName = (domain: string) => `${DNS_LABEL}.${domain}`;
export const dnsRecordValue = (token: string) => `xaa-verify=${token}`;
/** A token is offered for 7 days; a proof counts for 7 days before a lot starts or is relisted, then it is checked again. */
export const DNS_TOKEN_DAYS = 7;
export const DNS_PROOF_DAYS = 7;

/** Whether DNS-over-HTTPS TXT answers carry the token (answers come quoted and may be split into 255-byte strings). */
export function txtHasToken(answers: string[], token: string): boolean {
  const want = dnsRecordValue(token);
  return answers.some((a) => a.replace(/"\s+"/g, '').replace(/^"|"$/g, '').trim() === want);
}

/* ---- the name a winner shows (as on axto.io) ---------------------------------- */

const ABUSE = [
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bitch', 'bastard', 'asshole', 'cock', 'cunt', 'pussy', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'retard', 'porn', 'sex', 'nazi', 'hitler',
  'anjing', 'bangsat', 'babi', 'kontol', 'memek', 'ngentot', 'goblok', 'tolol', 'bajingan', 'jancok', 'jancuk', 'pepek', 'lonte', 'pelacur', 'asu', 'pukimak',
  'scheisse', 'arschloch', 'fotze', 'hure', 'wichser', 'merde', 'putain', 'salope', 'connard', 'encule', 'cazzo', 'stronzo', 'puttana', 'vaffanculo',
  'puta', 'mierda', 'pendejo', 'cabron', 'gilipollas', 'coño', 'cono',
];
const ABUSE_INSIDE = ['fuck', 'motherfucker', 'asshole', 'nigger', 'faggot', 'kontol', 'ngentot', 'bajingan', 'vaffanculo', 'arschloch', 'pukimak', 'gilipollas'];
const BRANDS = [
  'google', 'alphabet', 'youtube', 'microsoft', 'azure', 'apple', 'iphone', 'amazon', 'aws', 'meta', 'facebook', 'instagram', 'whatsapp', 'openai', 'chatgpt',
  'anthropic', 'tesla', 'spacex', 'samsung', 'nvidia', 'intel', 'amd', 'ibm', 'oracle', 'salesforce', 'adobe', 'netflix', 'tiktok', 'bytedance', 'twitter',
  'paypal', 'stripe', 'visa', 'mastercard', 'cloudflare', 'github', 'gitlab', 'linkedin', 'uber', 'airbnb', 'alibaba', 'tencent', 'baidu', 'huawei', 'xiaomi', 'sony',
  'toyota', 'honda', 'coca cola', 'cocacola', 'pepsi', 'nike', 'adidas', 'zara', 'rolex', 'disney', 'gojek', 'tokopedia', 'shopee', 'telkomsel', 'pertamina', 'bni', 'bca',
  'bank mandiri', 'santander', 'bbva', 'telefonica', 'shopify', 'wix', 'wordpress', 'godaddy', 'axto', 'xaa',
];
const BRANDS_INSIDE = ['google', 'youtube', 'microsoft', 'facebook', 'instagram', 'whatsapp', 'openai', 'chatgpt', 'samsung', 'nvidia', 'salesforce', 'netflix', 'tiktok',
  'bytedance', 'paypal', 'cloudflare', 'github', 'linkedin', 'alibaba', 'tencent', 'huawei', 'xiaomi', 'cocacola', 'tokopedia', 'telkomsel', 'pertamina', 'mastercard', 'shopify', 'godaddy'];
const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').toLowerCase();
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };
const unleet = (s: string) => s.replace(/[013457@$]/g, (c) => LEET[c] ?? c);

export type NameProblem = 'length' | 'chars' | 'contact' | 'abuse' | 'brand';
export const cleanDisplayName = (s: unknown) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 48);

/** Why a display name cannot be shown (null = it can). */
export function displayNameProblem(raw: unknown): NameProblem | null {
  const name = cleanDisplayName(raw);
  if (name.length < 2) return 'length';
  if (/@|https?:|www\.|\.(com|net|org|io|id|co|es|de|xyz)\b/i.test(name) || /\d{5,}/.test(name.replace(/\s/g, ''))) return 'contact';
  if (!/\p{L}/u.test(name) || !/^[\p{L}\p{M}\p{N} .,&'’()\-]+$/u.test(name)) return 'chars';
  const plain = fold(name).split(/[^\p{L}\p{N}]+/u).filter(Boolean).map(unleet);
  const joined = plain.join('');
  if (plain.some((w) => ABUSE.includes(w)) || ABUSE_INSIDE.some((w) => joined.includes(w))) return 'abuse';
  const spaced = ` ${plain.join(' ')} `;
  if (BRANDS.some((b) => spaced.includes(` ${b} `)) || BRANDS_INSIDE.some((b) => joined.includes(b))) return 'brand';
  return null;
}

/** A bidder in a public list: the first letter only. */
export const maskName = (name: string) => {
  const n = cleanDisplayName(name);
  return n ? `${[...n][0]}${'•'.repeat(Math.min(5, Math.max(2, n.length - 1)))}` : '—';
};

/** What a lot's index entries carry, so lists read no lot documents (server/r2/schema.ts; R2 allows 2 KB). */
export interface LotSummarySource {
  ref: string; type: LotType; category: string; title: string; status: LotStatus; seller: Seller; seller_name: string;
  normal_eur: number; open_eur: number; step_eur: number; high_eur: number; bids_count: number; reserve_eur: number; buy_now_eur: number;
  starts_at: string; ends_at: string; domain: string; site_lang: string; images: string[];
  winner_name: string; winner_eur: number; paid_at: string; closed_at: string; created_at: string;
}
export const lotSummary = (l: LotSummarySource) => ({
  ref: l.ref, type: l.type, cat: l.category, title: l.title.slice(0, 90), status: l.status, seller: l.seller, sname: l.seller_name.slice(0, 40),
  normal: l.normal_eur, open: l.open_eur, step: l.step_eur, high: l.high_eur, bids: l.bids_count,
  bn: l.buy_now_eur && l.high_eur < l.buy_now_eur ? l.buy_now_eur : 0, rs: l.reserve_eur ? 1 : 0, rm: l.reserve_eur && l.high_eur >= l.reserve_eur ? 1 : 0,
  starts: l.starts_at, ends: l.ends_at, dom: l.domain, lang: l.site_lang, img: l.images.length ? 1 : 0,
  winner: l.winner_name.slice(0, 48), win: l.winner_eur, paid: l.paid_at ? 1 : 0, closed: l.closed_at, created: l.created_at,
});
export type LotCard = ReturnType<typeof lotSummary> & { id: string };

/* ---- the public list: ending soonest first, with the filters of domain-auction sites (request 59) ---- */

export const LOT_SORTS = ['ending', 'newest', 'price_asc', 'price_desc', 'bids', 'az', 'shortest'] as const;
export type LotSort = (typeof LOT_SORTS)[number];
export const ENDS_WITHIN = { '1h': 3_600_000, '24h': DAY, '7d': 7 * DAY } as const;

export interface LotFilter {
  type?: LotType; category?: string; seller?: 'xaa' | 'member'; tld?: string;
  q?: string; qmode?: 'contains' | 'starts' | 'ends'; noHyphen?: boolean; noDigits?: boolean;
  minLen?: number; maxLen?: number; minPrice?: number; maxPrice?: number; minBids?: number;
  endsWithin?: keyof typeof ENDS_WITHIN; buyNow?: boolean; noReserve?: boolean; lang?: string; sort: LotSort;
}

const int = (v: string | null | undefined) => {
  const n = Number(String(v ?? '').replace(/[^\d]/g, ''));
  return v && Number.isFinite(n) && n > 0 ? Math.min(n, 100_000_000) : undefined;
};
/** Filters from the URL (?type=domain&tld=com&q=shop&qmode=starts&sort=ending …): anything unknown is ignored. */
export function parseLotFilter(sp: { get(name: string): string | null }): LotFilter {
  const pickOf = <T extends string>(v: string | null, all: readonly T[]) => (v && (all as readonly string[]).includes(v) ? (v as T) : undefined);
  const on = (k: string) => sp.get(k) === '1';
  const q = (sp.get('q') ?? '').toLowerCase().replace(/[^a-z0-9.-]/g, '').slice(0, 63) || undefined;
  return {
    type: pickOf(sp.get('type'), LOT_TYPES), category: (sp.get('cat') ?? '').match(CATEGORY_SLUG_RE)?.[0],
    seller: pickOf(sp.get('seller'), ['xaa', 'member'] as const), tld: (sp.get('tld') ?? '').toLowerCase().replace(/^\./, '').replace(/[^a-z0-9.-]/g, '').slice(0, 30) || undefined,
    q, qmode: pickOf(sp.get('qmode'), ['contains', 'starts', 'ends'] as const), noHyphen: on('nohyphen'), noDigits: on('nodigits'),
    minLen: int(sp.get('minlen')), maxLen: int(sp.get('maxlen')), minPrice: int(sp.get('min')), maxPrice: int(sp.get('max')), minBids: int(sp.get('bids')),
    endsWithin: pickOf(sp.get('ends'), Object.keys(ENDS_WITHIN) as (keyof typeof ENDS_WITHIN)[]), buyNow: on('buynow'), noReserve: on('noreserve'),
    lang: (sp.get('lang_site') ?? '').match(/^[a-z]{2}$/)?.[0], sort: pickOf(sp.get('sort'), LOT_SORTS) ?? 'ending',
  };
}

/** The current price shown on a card: the high bid, or the opening bid before anyone has bid. */
export const cardPrice = (c: Pick<LotCard, 'bids' | 'high' | 'open'>) => (c.bids > 0 ? c.high : c.open);

/** The running lots that match, in the chosen order (ending soonest first by default). */
export function filterLots(cards: LotCard[], f: LotFilter, nowMs: number): LotCard[] {
  const out = cards.filter((c) => {
    if (c.status !== 'open' || Date.parse(c.starts) > nowMs || Date.parse(c.ends) <= nowMs) return false;
    if (f.type && c.type !== f.type) return false;
    if (f.category && c.cat !== f.category) return false;
    if (f.seller === 'xaa' && c.seller === 'member') return false;
    if (f.seller === 'member' && c.seller !== 'member') return false;
    if (f.lang && c.lang !== f.lang) return false;
    const { name, tld } = domainParts(c.dom || '');
    if (f.tld && tld !== f.tld) return false;
    const text = c.dom ? name : c.title.toLowerCase();
    if (f.q && !(f.qmode === 'starts' ? text.startsWith(f.q) : f.qmode === 'ends' ? text.endsWith(f.q) : text.includes(f.q))) return false;
    if (f.noHyphen && c.dom && name.includes('-')) return false;
    if (f.noDigits && c.dom && /\d/.test(name)) return false;
    if (f.minLen && (!c.dom || name.length < f.minLen)) return false;
    if (f.maxLen && (!c.dom || name.length > f.maxLen)) return false;
    const price = cardPrice(c);
    if (f.minPrice && price < f.minPrice) return false;
    if (f.maxPrice && price > f.maxPrice) return false;
    if (f.minBids && c.bids < f.minBids) return false;
    if (f.endsWithin && Date.parse(c.ends) - nowMs > ENDS_WITHIN[f.endsWithin]) return false;
    if (f.buyNow && !c.bn) return false;
    if (f.noReserve && c.rs) return false;
    return true;
  });
  const byEnd = (a: LotCard, b: LotCard) => a.ends.localeCompare(b.ends) || a.ref.localeCompare(b.ref);
  const sorters: Record<LotSort, (a: LotCard, b: LotCard) => number> = {
    ending: byEnd,
    newest: (a, b) => b.starts.localeCompare(a.starts) || byEnd(a, b),
    price_asc: (a, b) => cardPrice(a) - cardPrice(b) || byEnd(a, b),
    price_desc: (a, b) => cardPrice(b) - cardPrice(a) || byEnd(a, b),
    bids: (a, b) => b.bids - a.bids || byEnd(a, b),
    az: (a, b) => (a.dom || a.title).localeCompare(b.dom || b.title) || byEnd(a, b),
    shortest: (a, b) => domainParts(a.dom || a.title).name.length - domainParts(b.dom || b.title).name.length || byEnd(a, b),
  };
  return out.sort(sorters[f.sort]);
}

/** Index order for a lot's bids: the latest (= highest) sequence number first. */
export const bidSeqDesc = (bidId: string) => String(999_999 - Number(bidId.slice(bidId.lastIndexOf('.') + 1))).padStart(6, '0');

