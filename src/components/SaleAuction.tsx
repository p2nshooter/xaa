'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ActionState } from '@/server/actions';
import { placeSaleBidAction, registerSaleBidderAction } from '@/server/sale-auction-actions';
import { riseDate, type PublicRound } from '@/server/sale-auction-terms';
import type { MySaleAuction } from '@/server/sale-auction-store';
import { pick, type Lang } from '@/lib/i18n';

/**
 * The auction of xaa.es on /acquire (docs/BLUEPRINT.md §14, request 66): the live board — opening or current bid,
 * countdown, latest bids with masked names, the rules — and the member's side: sign in, register, wait for approval,
 * bid, lead or be outbid, win. A dark auction house in gold (owner, 28 Oct 2026: "high class, super premium, indah").
 * Everything shown comes from the server (saleAuctionView); the page refreshes itself every 20 s while a round runs.
 */

type Copy = {
  round: string; title: string; lead: string; opening: string; current: string; winning: string; endsIn: string; bids: string; noBids: string;
  noReserve: string; urgency: string; openingNote: string; rises: string; latest: string; none: string; rulesTitle: string; rules: string[]; ruleApproval: string; ruleOpen: string;
  signIn: string; signInBtn: string; registerBtn0: string; regTitle: string; regLead: string; name: string; company: string; country: string; phone: string;
  funds: string; message: string; register: string; pending: string; rejected: string; admin: string; yourBid: string; bid: string; bidding: string;
  binding: string; leading: string; outbid: string; ended: string; awaiting: string; youWon: string; sold: string; next: string; units: [string, string, string, string];
};

const COPY: Record<Lang, Copy> = {
  en: {
    round: 'Round {n}', title: 'The auction', lead: 'Real bids, a real deadline and one buyer for xaa.es. Every bid appears here the moment it is placed.',
    opening: 'Opening bid', current: 'Current bid', winning: 'Winning bid', endsIn: 'Ends in', bids: 'Bids: {n}', noBids: 'No bids yet — a bid at the opening price can win.',
    noReserve: 'No hidden reserve: the highest bid when the clock stops buys xaa.es — the domain, the studio, the platform and the brand.',
    urgency: 'An opportunity measured in days: when this round closes, the price is whatever the best bid says.',
    openingNote: 'The opening bid started at US$10 million on 28 October 2026 and rises by {weekly} every week, the same for every bidder — a bid placed now can win at a price no later bid is allowed.',
    rises: 'Rises to {next} on {date}',
    latest: 'Latest bids', none: 'No bids in this round yet.', rulesTitle: 'How it works',
    rules: [
      'Every bid is at least the opening bid of the day, which rises by {weekly} every week; after the first bid, also at least the current bid plus {step}. You may bid higher at once.',
      'A bid in the last {min} minutes extends the round by {min} minutes, so every bidder gets a fair last word.',
      'Every bid is binding: the winner signs the NDA and the purchase agreement and pays within {days} days by SWIFT wire or escrow.',
    ],
    ruleApproval: 'The owner verifies every bidder before they can bid. Names are shown masked.', ruleOpen: 'Any signed-in member can register and bid. Names are shown masked.',
    signIn: 'Sign in or create an account to register as a bidder.', signInBtn: 'Sign in', registerBtn0: 'Create account',
    regTitle: 'Register to bid', regLead: 'Tell the owner who is bidding. Your name appears masked on this page; your company and contact details are seen only by the owner.',
    name: 'Name shown with your bids', company: 'Company or fund (optional)', country: 'Country', phone: 'Phone / WhatsApp', funds: 'Proof of funds or financing (optional)',
    message: 'Message to the owner (optional)', register: 'Register as a bidder', pending: 'Thank you — your registration is waiting for the owner\'s approval.',
    rejected: 'Your registration was not approved. Contact the owner to discuss.', admin: 'Administrators run the auction and cannot bid.',
    yourBid: 'Your bid in US dollars (whole dollars)', bid: 'Bid {amount}', bidding: 'Placing your bid…', binding: 'By bidding you commit to buy at that price if your bid wins.',
    leading: 'You hold the highest bid.', outbid: 'You have been outbid — your best bid was {amount}.',
    ended: 'This round has ended', awaiting: 'Won at {amount} — the winner is closing with the owner.', youWon: 'You won with {amount}. The owner will contact you — please close by {date}.',
    sold: 'xaa.es has been sold at auction.', next: 'A new round opens shortly.', units: ['d', 'h', 'm', 's'],
  },
  es: {
    round: 'Ronda {n}', title: 'La subasta', lead: 'Pujas reales, un plazo real y un único comprador para xaa.es. Cada puja aparece aquí en el momento en que se hace.',
    opening: 'Puja de salida', current: 'Puja actual', winning: 'Puja ganadora', endsIn: 'Termina en', bids: 'Pujas: {n}', noBids: 'Aún no hay pujas: una puja al precio de salida puede ganar.',
    noReserve: 'Sin precio de reserva oculto: la puja más alta al terminar el tiempo compra xaa.es — el dominio, el estudio, la plataforma y la marca.',
    urgency: 'Una oportunidad que se mide en días: cuando esta ronda cierre, el precio será lo que diga la mejor puja.',
    openingNote: 'La puja de salida empezó en 10 millones de dólares el 28 de octubre de 2026 y sube {weekly} cada semana, igual para todos: una puja hecha ahora puede ganar a un precio que ninguna puja posterior podrá ofrecer.',
    rises: 'Sube a {next} el {date}',
    latest: 'Últimas pujas', none: 'Todavía no hay pujas en esta ronda.', rulesTitle: 'Cómo funciona',
    rules: [
      'Cada puja es al menos la puja de salida del día, que sube {weekly} cada semana; tras la primera puja, también al menos la puja actual más {step}. Puedes pujar más alto de inmediato.',
      'Una puja en los últimos {min} minutos amplía la ronda {min} minutos, para que todos tengan una última palabra justa.',
      'Cada puja es vinculante: el ganador firma el NDA y el contrato de compraventa y paga en {days} días por transferencia SWIFT o depósito en garantía.',
    ],
    ruleApproval: 'El propietario verifica a cada pujador antes de que pueda pujar. Los nombres se muestran ocultos.', ruleOpen: 'Cualquier miembro con sesión iniciada puede registrarse y pujar. Los nombres se muestran ocultos.',
    signIn: 'Inicia sesión o crea una cuenta para registrarte como pujador.', signInBtn: 'Iniciar sesión', registerBtn0: 'Crear cuenta',
    regTitle: 'Regístrate para pujar', regLead: 'Di al propietario quién puja. Tu nombre aparece oculto en esta página; tu empresa y tus datos de contacto solo los ve el propietario.',
    name: 'Nombre que aparece con tus pujas', company: 'Empresa o fondo (opcional)', country: 'País', phone: 'Teléfono / WhatsApp', funds: 'Prueba de fondos o financiación (opcional)',
    message: 'Mensaje al propietario (opcional)', register: 'Registrarme como pujador', pending: 'Gracias: tu registro espera la aprobación del propietario.',
    rejected: 'Tu registro no fue aprobado. Contacta con el propietario.', admin: 'Los administradores dirigen la subasta y no pueden pujar.',
    yourBid: 'Tu puja en dólares estadounidenses (enteros)', bid: 'Pujar {amount}', bidding: 'Enviando tu puja…', binding: 'Al pujar te comprometes a comprar a ese precio si tu puja gana.',
    leading: 'Tienes la puja más alta.', outbid: 'Te han superado: tu mejor puja fue de {amount}.',
    ended: 'Esta ronda ha terminado', awaiting: 'Adjudicada por {amount}: el ganador está cerrando con el propietario.', youWon: 'Has ganado con {amount}. El propietario te contactará; cierra antes del {date}.',
    sold: 'xaa.es se ha vendido en subasta.', next: 'Pronto se abre una nueva ronda.', units: ['d', 'h', 'm', 's'],
  },
  id: {
    round: 'Putaran {n}', title: 'Lelang', lead: 'Tawaran nyata, tenggat nyata, dan satu pembeli untuk xaa.es. Setiap tawaran muncul di sini begitu diajukan.',
    opening: 'Tawaran pembuka', current: 'Tawaran saat ini', winning: 'Tawaran menang', endsIn: 'Berakhir dalam', bids: 'Tawaran: {n}', noBids: 'Belum ada tawaran — tawaran sebesar harga pembuka bisa menang.',
    noReserve: 'Tanpa reserve tersembunyi: tawaran tertinggi saat waktu habis membeli xaa.es — domain, studio, platform, dan mereknya.',
    urgency: 'Peluang yang dihitung dalam hari: saat putaran ini ditutup, harganya adalah tawaran terbaik.',
    openingNote: 'Tawaran pembuka dimulai dari US$10 juta pada 28 Oktober 2026 dan naik {weekly} setiap minggu, sama untuk setiap penawar — tawaran yang diajukan sekarang bisa menang di harga yang tidak lagi diizinkan untuk tawaran berikutnya.',
    rises: 'Naik menjadi {next} pada {date}',
    latest: 'Tawaran terbaru', none: 'Belum ada tawaran di putaran ini.', rulesTitle: 'Cara kerjanya',
    rules: [
      'Setiap tawaran minimal sebesar tawaran pembuka hari itu, yang naik {weekly} setiap minggu; setelah tawaran pertama, juga minimal tawaran saat ini ditambah {step}. Anda boleh langsung menawar lebih tinggi.',
      'Tawaran dalam {min} menit terakhir memperpanjang putaran {min} menit, sehingga setiap penawar mendapat kesempatan terakhir yang adil.',
      'Setiap tawaran mengikat: pemenang menandatangani NDA dan perjanjian jual beli, lalu membayar dalam {days} hari lewat transfer SWIFT atau escrow.',
    ],
    ruleApproval: 'Pemilik memverifikasi setiap penawar sebelum bisa menawar. Nama ditampilkan tersamar.', ruleOpen: 'Setiap member yang masuk bisa mendaftar dan menawar. Nama ditampilkan tersamar.',
    signIn: 'Masuk atau buat akun untuk mendaftar sebagai penawar.', signInBtn: 'Masuk', registerBtn0: 'Buat akun',
    regTitle: 'Daftar untuk menawar', regLead: 'Beri tahu pemilik siapa yang menawar. Nama Anda tampil tersamar di halaman ini; perusahaan dan kontak hanya dilihat pemilik.',
    name: 'Nama yang tampil bersama tawaran', company: 'Perusahaan atau dana (opsional)', country: 'Negara', phone: 'Telepon / WhatsApp', funds: 'Bukti dana atau pembiayaan (opsional)',
    message: 'Pesan untuk pemilik (opsional)', register: 'Daftar sebagai penawar', pending: 'Terima kasih — pendaftaran Anda menunggu persetujuan pemilik.',
    rejected: 'Pendaftaran Anda tidak disetujui. Hubungi pemilik untuk berdiskusi.', admin: 'Admin menjalankan lelang dan tidak bisa menawar.',
    yourBid: 'Tawaran Anda dalam dolar AS (dolar bulat)', bid: 'Tawar {amount}', bidding: 'Mengajukan tawaran…', binding: 'Dengan menawar, Anda berkomitmen membeli di harga itu bila tawaran Anda menang.',
    leading: 'Anda memegang tawaran tertinggi.', outbid: 'Tawaran Anda terlampaui — tawaran terbaik Anda {amount}.',
    ended: 'Putaran ini telah berakhir', awaiting: 'Dimenangkan di {amount} — pemenang sedang menyelesaikan dengan pemilik.', youWon: 'Anda menang dengan {amount}. Pemilik akan menghubungi Anda — selesaikan paling lambat {date}.',
    sold: 'xaa.es telah terjual melalui lelang.', next: 'Putaran baru segera dibuka.', units: ['h', 'j', 'm', 'd'],
  },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

/** Gold countdown tiles. */
export function GoldCountdown({ to, units }: { to: string; units: [string, string, string, string] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const left = Math.max(0, Date.parse(to) - (now ?? Date.parse(to)));
  const parts = [Math.floor(left / 86_400_000), Math.floor(left / 3_600_000) % 24, Math.floor(left / 60_000) % 60, Math.floor(left / 1000) % 60];
  return (
    <span className="inline-flex gap-2" aria-live="off" data-testid="sale-countdown">
      {parts.map((n, i) => (
        <span key={i} className="sauc-tile flex min-w-[3.4rem] flex-col items-center rounded-xl px-2.5 py-2 text-center">
          <span className="sauc-serif sauc-nums text-2xl font-semibold leading-none text-[#f9eccb]">{now === null ? '–' : String(n).padStart(i ? 2 : 1, '0')}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ecc96a]/80">{units[i]}</span>
        </span>
      ))}
    </span>
  );
}

export function SaleAuction({ lang, round: r, me, approval, signedIn }: { lang: Lang; round: PublicRound | null; me: MySaleAuction | null; approval: boolean; signedIn: boolean }) {
  const c = pick(lang, COPY);
  const router = useRouter();
  const open = r?.status === 'open';
  const won = r && (r.status === 'awaiting_payment' || r.status === 'sold');
  const nextMin = r?.nextMinUsd || 0;
  const [amount, setAmount] = useState(String(nextMin || ''));
  const [regState, regAction, regPending] = useActionState<ActionState, FormData>(registerSaleBidderAction, {});
  const [bidState, bidAction, bidPending] = useActionState<ActionState, FormData>(placeSaleBidAction, {});
  useEffect(() => { if (nextMin && (!amount || Number(amount) < nextMin)) setAmount(String(nextMin)); }, [nextMin]); // eslint-disable-line react-hooks/exhaustive-deps
  // A live round refreshes itself: new bids, the extended deadline, the close.
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => router.refresh(), 20_000);
    return () => clearInterval(iv);
  }, [open, router]);
  const bidNum = Number(amount.replace(/[^\d]/g, '')) || 0;
  // A registration's success is the pending / bid panel itself; only its errors need a line.
  const state: ActionState = bidState.error || bidState.ok ? bidState : regState.error ? regState : {};

  return (
    <section id="bid" className="sauc-house relative isolate scroll-mt-28 overflow-hidden py-20 text-white sm:py-24" data-testid="sale-auction">
      <div className="sauc-glow pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="sauc-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#ecc96a]">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#e0b44d]/70" aria-hidden />
            {r ? fill(c.round, { n: r.no }) : c.title}
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#e0b44d]/70" aria-hidden />
          </p>
          <h2 className="sauc-serif mt-4 text-4xl font-semibold tracking-tight sm:text-6xl"><span className="sauc-gold italic">{c.title}</span></h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{c.lead}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="sauc-glass relative rounded-[28px] p-6 sm:p-8">
            {!r ? <p className="text-slate-300">{c.next}</p> : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3d98b]/70">{won ? c.winning : r.bidsCount ? c.current : c.opening}</p>
                    <p className="sauc-gold sauc-shimmer sauc-serif sauc-nums mt-2 text-5xl font-semibold leading-none tracking-tight sm:text-6xl" data-testid="sale-amount">{usd(won ? r.winnerUsd : r.bidsCount ? r.highUsd : r.openUsd)}</p>
                    <p className="mt-3 text-sm text-slate-400">{fill(c.bids, { n: r.bidsCount })}{r.bidsCount ? <> · <span className="text-[#f9eccb]">{r.leader}</span></> : null}</p>
                  </div>
                  {open ? (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3d98b]/70">{c.endsIn}</p>
                      <div className="mt-2"><GoldCountdown to={r.endsAt} units={c.units} /></div>
                    </div>
                  ) : null}
                </div>
                <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#e0b44d]/30 to-transparent" aria-hidden />
                {open ? (
                  <>
                    {!r.bidsCount ? <p className="text-sm font-medium text-emerald-300">{c.noBids}</p> : null}
                    <p className="mt-3 flex gap-3 rounded-2xl border border-[#e0b44d]/25 bg-gradient-to-r from-[#e0b44d]/[0.12] via-[#e0b44d]/[0.05] to-transparent px-4 py-3 text-sm font-medium leading-relaxed text-[#f9eccb]">
                      <span className="text-[#ecc96a]" aria-hidden>✦</span>{c.noReserve}
                    </p>
                    <p className="sauc-serif mt-4 text-lg italic leading-snug text-slate-200">“{c.urgency}”</p>
                    {r.nextRiseAt ? (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e0b44d]/30 bg-[#e0b44d]/[0.08] px-3.5 py-1.5 text-xs font-semibold text-[#f3d98b]" data-testid="sale-rise">
                        <span aria-hidden>▲</span><span className="sauc-nums">{fill(c.rises, { next: usd(r.openUsd + r.weeklyUsd), date: riseDate(r.nextRiseAt, lang) })}</span>
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs leading-relaxed text-slate-400">{fill(c.openingNote, { weekly: usd(r.weeklyUsd) })} {c.opening}: <b className="sauc-nums font-semibold text-[#f9eccb]">{usd(r.openUsd)}</b>.</p>
                  </>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                    <p className="sauc-serif text-lg text-white">{r.status === 'sold' ? c.sold : c.ended}</p>
                    {r.status === 'awaiting_payment' ? <p className="mt-1">{fill(c.awaiting, { amount: usd(r.winnerUsd) })}</p> : null}
                    {r.status === 'unsold' || r.status === 'cancelled' ? <p className="mt-1">{c.next}</p> : null}
                  </div>
                )}
                <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3d98b]/70">{c.latest}</p>
                {r.bids.length ? (
                  <ol className="mt-3 space-y-1.5" data-testid="sale-bids">
                    {r.bids.map((b, i) => (
                      <li key={`${b.at}-${i}`} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${i === 0 ? 'border border-[#e0b44d]/25 bg-gradient-to-r from-[#e0b44d]/[0.14] to-transparent' : 'border border-transparent bg-white/[0.02]'}`}>
                        <span className={`font-medium ${i === 0 ? 'text-[#f9eccb]' : 'text-slate-200'}`}>{i === 0 ? <span className="mr-1.5 text-[#ecc96a]" aria-hidden>♛</span> : null}{b.name}</span>
                        <span className={`sauc-serif sauc-nums text-base font-semibold ${i === 0 ? 'text-[#f3d98b]' : 'text-white'}`}>{usd(b.amountUsd)}</span>
                        <span className="hidden text-xs text-slate-500 sm:inline">{new Date(b.at).toLocaleString()}</span>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-3 text-sm text-slate-400">{c.none}</p>}
              </>
            )}
          </div>

          <div className="sauc-glass relative rounded-[28px] p-6 sm:p-8" data-testid="sale-action">
            {won && me?.winner ? (
              <p className="sauc-serif text-2xl leading-snug text-[#f9eccb]">♛ {fill(c.youWon, { amount: usd(me.amountUsd), date: new Date(me.payBy).toLocaleDateString() })}</p>
            ) : !open ? (
              <p className="text-slate-300">{r?.status === 'sold' ? c.sold : c.next}</p>
            ) : !signedIn ? (
              <div>
                <p className="sauc-serif text-xl leading-snug">{c.signIn}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="/register?next=%2Facquire%23bid" className="sauc-btn">{c.registerBtn0}</a>
                  <a href="/login?next=%2Facquire%23bid" className="sauc-btn-ghost">{c.signInBtn}</a>
                </div>
              </div>
            ) : me?.admin ? (
              <p className="text-sm text-[#f9eccb]">{c.admin}</p>
            ) : !me?.bidder ? (
              <form action={regAction} data-testid="sale-register">
                <input type="hidden" name="lang" value={lang} />
                <h3 className="sauc-serif text-2xl">{c.regTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.regLead}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input className="sauc-input sm:col-span-2" name="displayName" placeholder={c.name} required defaultValue={regState.values?.displayName} />
                  <input className="sauc-input" name="company" placeholder={c.company} defaultValue={regState.values?.company} />
                  <input className="sauc-input" name="country" placeholder={c.country} required defaultValue={regState.values?.country} />
                  <input className="sauc-input sm:col-span-2" name="phone" placeholder={c.phone} required defaultValue={regState.values?.phone} />
                  <input className="sauc-input sm:col-span-2" name="funds" placeholder={c.funds} defaultValue={regState.values?.funds} />
                  <textarea className="sauc-input sm:col-span-2" name="message" rows={2} placeholder={c.message} defaultValue={regState.values?.message} />
                </div>
                <button type="submit" className="sauc-btn mt-5 w-full" disabled={regPending}>{c.register}</button>
              </form>
            ) : me.bidder.status === 'pending' ? (
              <p className="rounded-2xl border border-[#e0b44d]/25 bg-[#e0b44d]/[0.08] p-4 text-sm leading-relaxed text-[#f9eccb]" data-testid="sale-pending">⏳ {c.pending}</p>
            ) : me.bidder.status === 'rejected' ? (
              <p className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">{c.rejected}</p>
            ) : (
              <div data-testid="sale-bid">
                {me.leading ? <p className="flex items-center gap-2 rounded-2xl border border-[#e0b44d]/30 bg-gradient-to-r from-[#e0b44d]/[0.16] to-transparent px-4 py-3 text-sm font-semibold text-[#f9eccb]"><span className="text-[#ecc96a]" aria-hidden>♛</span>{c.leading}</p>
                  : (
                    <form action={bidAction}>
                      <input type="hidden" name="lang" value={lang} />
                      {me.myBestUsd ? <p className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">{fill(c.outbid, { amount: usd(me.myBestUsd) })}</p> : null}
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3d98b]/70">{c.yourBid}
                        <input className="sauc-input sauc-serif sauc-nums mt-2 text-2xl font-semibold" name="amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} data-testid="sale-amount-input" />
                      </label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[0, 1, 4].map((k) => {
                          const v = nextMin + k * (r?.stepUsd || 0);
                          return <button key={k} type="button" className={`sauc-chip ${bidNum === v ? 'sauc-chip-on' : ''}`} onClick={() => setAmount(String(v))}>{usd(v)}</button>;
                        })}
                      </div>
                      <button type="submit" className="sauc-btn mt-6 w-full" disabled={bidPending || bidNum < nextMin}>{bidPending ? c.bidding : fill(c.bid, { amount: usd(bidNum || nextMin) })}</button>
                    </form>
                  )}
                <p className="mt-3 text-xs leading-relaxed text-slate-400">{c.binding}</p>
              </div>
            )}
            {state.error || state.ok ? (
              <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${state.ok ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/25 bg-rose-500/10 text-rose-200'}`} data-testid="sale-msg">{state.ok || state.error}</p>
            ) : null}
            {r && open ? (
              <div className="mt-8">
                <div className="mb-5 h-px bg-gradient-to-r from-transparent via-[#e0b44d]/30 to-transparent" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3d98b]/70">{c.rulesTitle}</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                  {c.rules.map((x) => <li key={x} className="flex gap-3"><span className="mt-0.5 text-[10px] text-[#e0b44d]" aria-hidden>◆</span>{fill(x, { step: usd(r.stepUsd), weekly: usd(r.weeklyUsd), min: r.snipeMinutes, days: r.payDays })}</li>)}
                  <li className="flex gap-3"><span className="mt-0.5 text-[10px] text-[#e0b44d]" aria-hidden>◆</span>{approval ? c.ruleApproval : c.ruleOpen}</li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
