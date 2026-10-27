'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from './auth';
import { data } from './data';
import type { ActionState, RevealState } from './actions';
import {
  buyNow, cancelLot, claimDomain, createLot, createMemberLot, getLot, markPayoutPaid, passLot, placeBid, relistLot, revealPayoutDetails, setArchive,
  setDisplayName, setHandover, setPayoutDetails, setProductAuto, setSellerPage, startLot, updateLot, addImage, removeImage, verifyDomain, saveCategory,
  type LotInput, type MemberLotProblem,
} from './auction';
import { CATEGORY_SLUG_RE, cleanDomain, defaultOpening, defaultStep, isLotType, type AuctionCategory, type BidProblem, type DomainProblem, type NameProblem } from './auction-terms';
import { getLang } from '@/lib/i18n.server';
import { pick } from '@/lib/i18n';

/**
 * The auction's server actions (docs/BLUEPRINT.md §10). Every action checks who is calling in the same
 * function that writes; members act on their own lots and claims only, the admin on everything.
 */

const str = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
};
const num = (form: FormData, key: string) => Math.round(Number(str(form, key).replace(/[^\d.]/g, '')) || 0);
const isRedirect = (err: unknown) => typeof err === 'object' && err !== null && 'digest' in err && String((err as { digest?: string }).digest).startsWith('NEXT_REDIRECT');
const fail = (err: unknown): ActionState => {
  if (isRedirect(err)) throw err;
  return { error: err instanceof Error && err.message.length < 200 ? err.message : 'Something went wrong. Please try again.' };
};
const refresh = (...paths: string[]) => { for (const p of ['/auction', '/portal/auction', '/portal/admin/auction', ...paths]) revalidatePath(p); };

async function member() {
  const user = await currentUser();
  if (!user) throw new Error('Please sign in to take part.');
  return user;
}
async function admin() {
  const user = await currentUser();
  if (!user || user.role !== 'admin') throw new Error('Not authorised.');
  return user;
}

/* ---- messages in the visitor's language ----------------------------------------- */

type L = { en: string; es: string; id: string };
const NAME_ERR: Record<NameProblem, L> = {
  length: { en: 'Use at least 2 characters.', es: 'Usa al menos 2 caracteres.', id: 'Minimal 2 karakter.' },
  chars: { en: 'Use letters, digits, spaces and . , & \' ( ) - only.', es: 'Usa solo letras, cifras, espacios y . , & \' ( ) -.', id: 'Gunakan huruf, angka, spasi dan . , & \' ( ) - saja.' },
  contact: { en: 'No e-mail addresses, links or phone numbers in a name.', es: 'Sin correos, enlaces ni teléfonos en el nombre.', id: 'Nama tidak boleh berisi e-mail, tautan atau nomor telepon.' },
  abuse: { en: 'Please choose a different name.', es: 'Elige otro nombre, por favor.', id: 'Silakan pilih nama lain.' },
  brand: { en: 'A name cannot use another company\'s brand.', es: 'El nombre no puede usar la marca de otra empresa.', id: 'Nama tidak boleh memakai merek perusahaan lain.' },
};
const BID_ERR: Record<BidProblem | 'not_found' | 'no_name' | 'admin' | 'no_buy_now' | 'own_lot', L> = {
  closed: { en: 'This lot is closed.', es: 'Este lote está cerrado.', id: 'Lot ini sudah ditutup.' },
  not_started: { en: 'This lot has not started yet.', es: 'Este lote aún no ha empezado.', id: 'Lot ini belum dimulai.' },
  ended: { en: 'This lot has ended.', es: 'Este lote ha terminado.', id: 'Lot ini sudah berakhir.' },
  too_low: { en: 'That bid is below the next price.', es: 'La puja está por debajo del siguiente precio.', id: 'Tawaran di bawah harga berikutnya.' },
  too_high: { en: 'Bids stop at the lot\'s full price.', es: 'Las pujas se detienen en el precio completo del lote.', id: 'Tawaran berhenti di harga penuh lot.' },
  not_next: { en: 'Someone bid first — the next price has moved. Reload and bid again.', es: 'Alguien pujó antes: el siguiente precio cambió. Recarga y vuelve a pujar.', id: 'Ada yang menawar lebih dulu — harga berikutnya berubah. Muat ulang lalu tawar lagi.' },
  already_highest: { en: 'You already have the highest bid.', es: 'Ya tienes la puja más alta.', id: 'Anda sudah menjadi penawar tertinggi.' },
  bad_amount: { en: 'Enter a whole number of euros.', es: 'Escribe euros enteros.', id: 'Masukkan jumlah euro bulat.' },
  not_found: { en: 'Lot not found.', es: 'Lote no encontrado.', id: 'Lot tidak ditemukan.' },
  no_name: { en: 'Choose the name shown if you win first.', es: 'Primero elige el nombre que se mostrará si ganas.', id: 'Pilih dulu nama yang tampil bila Anda menang.' },
  admin: { en: 'Admin accounts run the auction and do not bid.', es: 'Las cuentas de administrador gestionan la subasta y no pujan.', id: 'Akun admin menjalankan lelang dan tidak ikut menawar.' },
  no_buy_now: { en: 'This lot has no buy-now price.', es: 'Este lote no tiene precio de compra inmediata.', id: 'Lot ini tidak punya harga beli langsung.' },
  own_lot: { en: 'You cannot bid on your own lot.', es: 'No puedes pujar en tu propio lote.', id: 'Anda tidak bisa menawar lot milik sendiri.' },
};
const DOMAIN_ERR: Record<DomainProblem | 'no_claim', L> = {
  shape: { en: 'Enter a domain like example.com.', es: 'Escribe un dominio como ejemplo.com.', id: 'Masukkan domain seperti contoh.com.' },
  ours: { en: 'That domain belongs to the XAA / AXTO / ulyah.com family and is not for sale here.', es: 'Ese dominio pertenece a la familia XAA / AXTO / ulyah.com y no se vende aquí.', id: 'Domain itu milik keluarga XAA / AXTO / ulyah.com dan tidak dijual di sini.' },
  brand: { en: 'Domains using another company\'s brand are not accepted.', es: 'No se aceptan dominios con la marca de otra empresa.', id: 'Domain yang memakai merek perusahaan lain tidak diterima.' },
  no_claim: { en: 'Add the domain first to get your DNS record.', es: 'Añade primero el dominio para obtener tu registro DNS.', id: 'Tambahkan domain dulu untuk mendapat catatan DNS Anda.' },
};
const LOT_ERR: Record<MemberLotProblem, L> = {
  no_name: { en: 'Choose the name you sell under first.', es: 'Primero elige el nombre con el que vendes.', id: 'Pilih dulu nama penjual Anda.' },
  no_proof: { en: 'Verify the domain in DNS first (or check it again — the proof counts for 7 days).', es: 'Verifica primero el dominio en DNS (o vuelve a comprobarlo: la prueba vale 7 días).', id: 'Verifikasi domain di DNS dulu (atau periksa lagi — bukti berlaku 7 hari).' },
  domain: DOMAIN_ERR.shape,
  price: { en: 'The asking price is a whole number from €10 to €10,000,000.', es: 'El precio pedido es un entero entre 10 € y 10 000 000 €.', id: 'Harga minta berupa angka bulat €10 sampai €10.000.000.' },
  open_pct: { en: 'The opening bid is 10–100 % of the asking price.', es: 'La puja inicial es el 10–100 % del precio pedido.', id: 'Harga buka 10–100 % dari harga minta.' },
  reserve: { en: 'The reserve sits between the opening bid and the asking price.', es: 'La reserva va entre la puja inicial y el precio pedido.', id: 'Harga cadangan di antara harga buka dan harga minta.' },
  expiry: { en: 'The domain must stay registered at least 30 days after the auction ends.', es: 'El dominio debe seguir registrado al menos 30 días tras la subasta.', id: 'Domain harus masih terdaftar minimal 30 hari setelah lelang berakhir.' },
  declare: { en: 'Confirm that the domain is yours, unlocked for transfer and not in a dispute.', es: 'Confirma que el dominio es tuyo, transferible y sin disputa.', id: 'Konfirmasi bahwa domain milik Anda, bisa ditransfer, dan tidak dalam sengketa.' },
  live: { en: 'That domain is already in a live lot.', es: 'Ese dominio ya está en un lote activo.', id: 'Domain itu sedang ada di lot yang berjalan.' },
  registrar: { en: 'Say where the domain is registered.', es: 'Indica dónde está registrado el dominio.', id: 'Sebutkan registrar domain.' },
};
async function say(m: L): Promise<string> {
  return pick(await getLang(), m);
}

/* ---- members ----------------------------------------------------------------- */

export async function auctionNameAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    const r = await setDisplayName(user, str(form, 'name'));
    if ('error' in r) return { error: await say(NAME_ERR[r.error]), values: { name: str(form, 'name') } };
    refresh();
    return { ok: await say({ en: `Saved — you appear as “${r.name}”.`, es: `Guardado: apareces como «${r.name}».`, id: `Tersimpan — Anda tampil sebagai “${r.name}”.` }) };
  } catch (err) { return fail(err); }
}

/** At most 30 bids an hour per account (a simple brake on scripted bidding). */
async function tooManyBids(userId: string): Promise<boolean> {
  const recent = await (await data()).auctionBids.listDocs('user', userId, { limit: 30 });
  return recent.docs.length >= 30 && recent.docs.every((b) => Date.now() - Date.parse(b.created_at) < 3_600_000);
}

export async function auctionBidAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    if (await tooManyBids(user.id)) return { error: await say({ en: 'That is 30 bids in an hour — please wait a little.', es: '30 pujas en una hora: espera un poco.', id: '30 tawaran dalam satu jam — mohon tunggu sebentar.' }) };
    const r = await placeBid(user, str(form, 'lot'), str(form, 'amount'));
    if ('error' in r) return { error: await say(BID_ERR[r.error]) };
    refresh(`/auction/${r.lot.ref}`);
    return { ok: await say({ en: `You lead at €${r.lot.high_eur.toLocaleString('en-GB')}.${r.extended ? ' The lot was extended by 5 minutes.' : ''}`, es: `Vas primero con ${r.lot.high_eur.toLocaleString('es-ES')} €.${r.extended ? ' El lote se amplió 5 minutos.' : ''}`, id: `Anda memimpin di €${r.lot.high_eur.toLocaleString('id-ID')}.${r.extended ? ' Lot diperpanjang 5 menit.' : ''}` }) };
  } catch (err) { return fail(err); }
}

export async function auctionBuyNowAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    const r = await buyNow(user, str(form, 'lot'));
    if ('error' in r) return { error: await say(BID_ERR[r.error]) };
    refresh(`/auction/${r.lot.ref}`);
    return { ok: await say({ en: 'It is yours — pay from your portal to receive it.', es: 'Es tuyo: paga desde tu portal para recibirlo.', id: 'Lot ini milik Anda — bayar dari portal untuk menerimanya.' }) };
  } catch (err) { return fail(err); }
}

export async function domainClaimAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    const r = await claimDomain(user, str(form, 'domain'));
    if ('error' in r) return { error: await say(DOMAIN_ERR[r.error]), values: { domain: str(form, 'domain') } };
    refresh();
    return { ok: await say({ en: `Add the TXT record below for ${r.claim.domain}, then press “Check now”.`, es: `Añade el registro TXT de abajo para ${r.claim.domain} y pulsa «Comprobar».`, id: `Tambahkan catatan TXT di bawah untuk ${r.claim.domain}, lalu tekan “Periksa sekarang”.` }) };
  } catch (err) { return fail(err); }
}

export async function domainVerifyAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    const r = await verifyDomain(user, str(form, 'domain'));
    if ('error' in r) return { error: await say(DOMAIN_ERR.no_claim) };
    refresh();
    return r.verified
      ? { ok: await say({ en: `${r.claim.domain} is verified. You can put it up now.`, es: `${r.claim.domain} está verificado. Ya puedes subastarlo.`, id: `${r.claim.domain} terverifikasi. Sekarang bisa dilelang.` }) }
      : { error: await say({ en: 'Not visible yet. DNS can take a few minutes to an hour to update — check again shortly.', es: 'Aún no es visible. El DNS tarda de unos minutos a una hora: vuelve a comprobarlo en breve.', id: 'Belum terlihat. Perubahan DNS butuh beberapa menit sampai satu jam — periksa lagi sebentar lagi.' }) };
  } catch (err) { return fail(err); }
}

export async function memberLotAction(_p: ActionState, form: FormData): Promise<ActionState> {
  const values = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, String(v)]));
  try {
    const user = await member();
    const r = await createMemberLot(user, {
      domain: str(form, 'domain'), category: str(form, 'category') || 'domains', summary: str(form, 'summary'), description: str(form, 'description'),
      site_lang: str(form, 'site_lang').slice(0, 2), registrar: str(form, 'registrar'), expires_on: str(form, 'expires_on'), age_note: str(form, 'age_note'),
      asking_eur: num(form, 'asking'), open_pct: num(form, 'open_pct') || 35, reserve_eur: num(form, 'reserve'), buy_now: str(form, 'buy_now') === 'on', declare: str(form, 'declare') === 'on',
    });
    if ('error' in r) return { error: await say(LOT_ERR[r.error]), values };
    refresh(`/auction/${r.lot.ref}`);
    return { ok: await say({ en: `${r.lot.domain} is live until ${r.lot.ends_at.slice(0, 16).replace('T', ' ')} UTC.`, es: `${r.lot.domain} está en subasta hasta el ${r.lot.ends_at.slice(0, 16).replace('T', ' ')} UTC.`, id: `${r.lot.domain} dilelang sampai ${r.lot.ends_at.slice(0, 16).replace('T', ' ')} UTC.` }) };
  } catch (err) { return { ...fail(err), values }; }
}

export async function relistAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    const r = await relistLot(user, str(form, 'lot'), { asking_eur: num(form, 'asking') || undefined, open_pct: num(form, 'open_pct') || undefined, reserve_eur: str(form, 'reserve') ? num(form, 'reserve') : undefined });
    if ('error' in r) return { error: r.error };
    refresh(`/auction/${r.lot.ref}`);
    return { ok: await say({ en: 'Relisted for another 14 days.', es: 'Vuelve a subasta otros 14 días.', id: 'Dilelang ulang 14 hari lagi.' }) };
  } catch (err) { return fail(err); }
}

export async function payoutDetailsAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    const r = await setPayoutDetails(user, str(form, 'method'), str(form, 'details'));
    if ('error' in r) return { error: r.error };
    refresh();
    return { ok: await say({ en: 'Saved (encrypted).', es: 'Guardado (cifrado).', id: 'Tersimpan (terenkripsi).' }) };
  } catch (err) { return fail(err); }
}

export async function sellerPageAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await member();
    await setSellerPage(user.id, str(form, 'on') === 'yes');
    refresh();
    return { ok: str(form, 'on') === 'yes' ? 'On.' : 'Off.' };
  } catch (err) { return fail(err); }
}

/** The seller sent the transfer code; the buyer confirms the domain arrived (that releases the seller's 70 %). */
export async function handoverAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Please sign in.');
    const lot = await getLot(str(form, 'lot'));
    if (!lot || lot.status !== 'sold') return { error: 'Only a paid lot is handed over.' };
    const step = str(form, 'step') === 'received' ? 'received' : 'epp';
    const allowed = user.role === 'admin' || (step === 'epp' ? lot.seller_user === user.id : lot.winner_user === user.id);
    if (!allowed) return { error: 'Not authorised.' };
    await setHandover(lot.id, step, true);
    refresh(`/auction/${lot.ref}`);
    return { ok: step === 'epp' ? 'Marked: transfer code sent.' : 'Marked: the domain is in your account. Thank you!' };
  } catch (err) { return fail(err); }
}

/* ---- the Studio desk ------------------------------------------------------------ */

function lotInput(form: FormData): LotInput {
  const type = str(form, 'type');
  const normal = num(form, 'normal');
  const open = num(form, 'open') || defaultOpening(normal);
  return {
    type: isLotType(type) ? type : 'website', category: str(form, 'category') || 'article-sites', title: str(form, 'title'), summary: str(form, 'summary'),
    description: str(form, 'description'), demo_url: str(form, 'demo_url'), stack: str(form, 'stack'), size_note: str(form, 'size_note'), age_note: str(form, 'age_note'),
    site_lang: str(form, 'site_lang').slice(0, 2), domain: cleanDomain(str(form, 'domain')) ?? '', domain_note: str(form, 'domain_note'),
    traffic: str(form, 'traffic'), traffic_verified: str(form, 'traffic_verified') === 'on',
    handover: str(form, 'handover').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 20),
    normal_eur: normal, open_eur: open, step_eur: num(form, 'step') || defaultStep(open), reserve_eur: num(form, 'reserve'), buy_now_eur: num(form, 'buy_now'),
  };
}

export async function adminLotSaveAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const a = await admin();
    const id = str(form, 'id');
    const r = id ? await updateLot(id, lotInput(form)) : await createLot(lotInput(form), a.name);
    if ('error' in r) return { error: r.error };
    refresh();
    return { ok: id ? 'Lot saved.' : 'Draft created — start it when ready (it then runs 14 days).' };
  } catch (err) { return fail(err); }
}

export async function adminLotStateAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    await admin();
    const id = str(form, 'id');
    const op = str(form, 'op');
    const r = op === 'start' ? await startLot(id) : op === 'cancel' ? await cancelLot(id, str(form, 'reason') || 'Cancelled by the admin') : op === 'pass' ? await passLot(id) : { error: 'Unknown action.' };
    if ('error' in r) return { error: r.error };
    refresh();
    return { ok: op === 'start' ? 'Started — it runs 14 days.' : op === 'cancel' ? 'Cancelled.' : 'Passed on to the next bidder.' };
  } catch (err) { return fail(err); }
}

export async function adminRelistAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const a = await admin();
    const r = await relistLot(a, str(form, 'id'));
    if ('error' in r) return { error: r.error };
    refresh();
    return { ok: `Relisted as ${r.lot.ref}.` };
  } catch (err) { return fail(err); }
}

export async function adminProductAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const a = await admin();
    await setProductAuto(str(form, 'slug'), str(form, 'on') === 'yes', a.name);
    refresh();
    return { ok: str(form, 'on') === 'yes' ? 'The product goes up automatically each round.' : 'The product no longer goes up automatically.' };
  } catch (err) { return fail(err); }
}

export async function adminPayoutAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    const a = await admin();
    const r = await markPayoutPaid(str(form, 'lot'), str(form, 'method'), str(form, 'reference'), a.name);
    if ('error' in r) return { error: r.error };
    refresh();
    return { ok: 'Payout recorded.' };
  } catch (err) { return fail(err); }
}

export async function adminRevealPayoutAction(_p: RevealState, form: FormData): Promise<RevealState> {
  try {
    await admin();
    const r = await revealPayoutDetails(str(form, 'user'));
    return r ? { value: `${r.method}: ${r.details}` } : { error: 'No payout details yet.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : 'Failed.' };
  }
}

export async function adminLotFileAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    await admin();
    const id = str(form, 'id');
    const kind = str(form, 'kind');
    if (kind === 'remove_image') { await removeImage(id, str(form, 'key')); refresh(); return { ok: 'Image removed.' }; }
    const file = form.get('file');
    if (!(file instanceof File) || !file.size) return { error: 'Choose a file.' };
    const r = kind === 'archive' ? await setArchive(id, file) : await addImage(id, file);
    if ('error' in r) return { error: r.error };
    refresh();
    return { ok: kind === 'archive' ? 'Archive uploaded (opens to the winner once paid).' : 'Image added.' };
  } catch (err) { return fail(err); }
}

export async function adminCategoryAction(_p: ActionState, form: FormData): Promise<ActionState> {
  try {
    await admin();
    const slug = str(form, 'slug').toLowerCase();
    if (!CATEGORY_SLUG_RE.test(slug)) return { error: 'Slug: lower-case letters, digits and hyphens.' };
    const group = (['articles', 'saas', 'ecommerce', 'other'] as const).find((g) => g === str(form, 'group')) ?? 'other';
    const names: Pick<AuctionCategory, 'en' | 'es' | 'id'> = { en: str(form, 'en'), es: str(form, 'es') || str(form, 'en'), id: str(form, 'id') || str(form, 'en') };
    if (names.en.length < 2) return { error: 'Give the category an English name.' };
    await saveCategory({ slug, group, ...names, hidden: str(form, 'hidden') === 'on', order: num(form, 'order') });
    refresh();
    return { ok: 'Category saved.' };
  } catch (err) { return fail(err); }
}

