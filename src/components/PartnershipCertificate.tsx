import { Cinzel, Great_Vibes } from 'next/font/google';

/**
 * The XAA.ES Digital Global partnership agreement, rebuilt as real markup.
 *
 * The original is a 1536×1024 raster: every word in it is pixels, so it blurs
 * when zoomed and "pecah" on a phone. Here the text is text — rendered by the
 * browser at whatever resolution the screen has, selectable, searchable and
 * readable by search engines and screen readers. The wording is transcribed
 * from the signed original unchanged.
 *
 * Two lines in the original need the signatories' confirmation, so they are
 * kept exactly as signed and isolated here rather than silently "fixed":
 *   - DATE_LINE: 14 October 2026 is a Wednesday, not a Friday.
 *   - ECOSYSTEM_NAME: the closing sentence reads "XAIA.ES", not "XAA.ES".
 */
const DATE_LINE = 'Friday, 14 October 2026';
const ECOSYSTEM_NAME = 'XAIA.ES';

const title = Cinzel({ subsets: ['latin'], weight: ['600', '700'], display: 'swap' });
const script = Great_Vibes({ subsets: ['latin'], weight: '400', display: 'swap' });

const NAVY = '#0b2a6b';
const BLUE = '#1d4ed8';
const GOLD = '#c9a24a';

const ALLOCATIONS = [
  { label: 'INFAQ', pct: '10%', note: 'Allocated for charitable giving and social welfare.', icon: 'heart' },
  { label: 'CTO & TEAM', pct: '50%', note: 'Allocated for the CTO and technical team who work on development and operations.', icon: 'team' },
  { label: 'CEO', pct: '30%', note: 'Allocated for the CEO for leadership and strategic management.', icon: 'person' },
  { label: 'OPERATIONAL RESERVE FUND', pct: '10%', note: 'Allocated for operational reserve funds and future needs.', icon: 'gear' },
] as const;

function Icon({ name }: { name: (typeof ALLOCATIONS)[number]['icon'] }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'heart':
      return <svg {...common}><path d="M12 9.5c-1.2-2-4.5-2-5 .5-.4 2 2.2 3.8 5 5.5 2.8-1.7 5.4-3.5 5-5.5-.5-2.5-3.8-2.5-5-.5z" /><path d="M3 18h4l3 1.5h5l4-2.5" /></svg>;
    case 'team':
      return <svg {...common}><circle cx="12" cy="8" r="2.5" /><circle cx="6" cy="9.5" r="2" /><circle cx="18" cy="9.5" r="2" /><path d="M8 19v-2a4 4 0 0 1 8 0v2M2.5 19v-1.5A3 3 0 0 1 6 14.5M21.5 19v-1.5a3 3 0 0 0-3.5-3" /></svg>;
    case 'person':
      return <svg {...common}><circle cx="12" cy="7.5" r="3" /><path d="M6 20v-2a6 6 0 0 1 12 0v2" /><path d="M12 13.5l-1 2.5 1 1.5 1-1.5-1-2.5" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></svg>;
  }
}

export function PartnershipCertificate() {
  return (
    <div
      className="rounded-2xl p-[10px] shadow-xl"
      style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE} 45%, #3b82f6 55%, ${NAVY})` }}
    >
      <div className="rounded-xl p-[3px]" style={{ background: GOLD }}>
        <div
          className="rounded-[10px] px-5 py-7 text-center sm:px-10 sm:py-10"
          style={{ background: 'radial-gradient(ellipse at center, #ffffff 0%, #f3f7ff 70%, #e6eeff 100%)', color: NAVY }}
        >
          {/* Masthead */}
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <p className="order-2 text-[10px] font-bold uppercase leading-5 tracking-[0.28em] sm:order-1 sm:text-left">
              <span className="block text-sm tracking-[0.2em]">XAA.ES</span>
              Digital Ecosystem<br />Global Platform
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/xaa-mark-192.png"
              alt="XAA.ES seal"
              width={96}
              height={96}
              className="order-1 mx-auto h-20 w-20 rounded-full ring-4 sm:order-2 sm:h-24 sm:w-24"
              style={{ boxShadow: `0 0 0 3px ${GOLD}` }}
            />
            <p className="order-3 text-[10px] font-bold uppercase leading-5 tracking-[0.28em] sm:text-right">
              Together building<br />the digital ecosystem<br />for a better future
            </p>
          </div>

          <h3 className={`${title.className} mt-6 text-[26px] font-bold leading-tight sm:text-5xl`} style={{ color: NAVY }}>
            Partnership Agreement
          </h3>
          <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.35em] sm:text-base" style={{ color: NAVY }}>
            XAA.ES Digital Global
          </p>
          <div className="mx-auto mt-3 h-px w-2/3" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

          <p className="mx-auto mt-5 max-w-3xl text-[13px] leading-relaxed sm:text-[15px]">
            On this day, <strong>{DATE_LINE}</strong>, the parties hereby agree to establish a partnership within the
            XAA.ES Digital Global business ecosystem for the development and management of the business as follows:
          </p>

          <div className="mt-7 grid gap-8 text-left md:grid-cols-2 md:gap-10">
            {/* Parties */}
            <div>
              <p className="inline-block rounded-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white" style={{ background: NAVY, boxShadow: `0 0 0 2px ${GOLD}` }}>
                The Parties Involved
              </p>
              <ol className="mt-5 space-y-5 text-[13px] leading-relaxed sm:text-sm">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span>
                    <strong>Name:</strong> <strong>Ulyah Munayah</strong><br />
                    <strong>Position:</strong> Chief Executive Officer (CEO)<br />
                    PT Axto Digital Global<br />
                    <em>(Hereinafter referred to as the FIRST PARTY)</em>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span>
                    <strong>Name:</strong> <strong>Yusron Efendi</strong><br />
                    <strong>Position:</strong> Chief Technology Officer (CTO)<br />
                    PT Axto Digital Global<br />
                    <em>(Hereinafter referred to as the SECOND PARTY)</em>
                  </span>
                </li>
              </ol>
              <p className="mt-5 text-center text-[13px] italic">
                Both parties, hereinafter collectively referred to as<br />
                <strong className="not-italic">“THE PARTIES”</strong>
              </p>
            </div>

            {/* Allocation */}
            <div>
              <p className="text-[13px] leading-relaxed sm:text-sm">
                By this agreement, the parties agree to share the responsibilities and profit allocation as follows:
              </p>
              <ul className="mt-4 space-y-3">
                {ALLOCATIONS.map((a) => (
                  <li key={a.label} className="grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: NAVY, boxShadow: `0 0 0 2px ${GOLD}` }}>
                      <Icon name={a.icon} />
                    </span>
                    <span className="flex items-center justify-between gap-2 rounded-md py-2 pl-3 pr-2 text-white" style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE})` }}>
                      <span className="text-[11px] font-extrabold uppercase leading-tight tracking-wide">{a.label}</span>
                      <span className="rounded px-2 py-0.5 text-base font-extrabold" style={{ background: '#f6e7b8', color: NAVY }}>{a.pct}</span>
                    </span>
                    <span className="col-span-2 text-xs leading-snug text-slate-700 sm:col-span-1">{a.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mx-auto mt-8 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          <p className="mx-auto mt-4 max-w-2xl text-[13px] italic leading-relaxed" style={{ color: BLUE }}>
            This partnership is made in good faith, with full responsibility, and as a commitment together to achieve the
            goals of the {ECOSYSTEM_NAME} ecosystem globally.
          </p>

          {/* Signatures */}
          <div className="mt-6 grid items-end gap-6 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">First Party (CEO)</p>
              <p className={`${script.className} mt-1 text-4xl leading-none`} style={{ color: NAVY }}>Ulyah Munayah</p>
              <div className="mx-auto mt-1 h-px w-48" style={{ background: NAVY }} />
              <p className="mt-1 text-sm">Ulyah Munayah</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-full p-1.5" style={{ background: `conic-gradient(${GOLD}, #f6e7b8, ${GOLD}, #a88430, ${GOLD})` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/xaa-mark-192.png" alt="" width={84} height={84} className="h-full w-full rounded-full" />
              </span>
              <span className="-mt-1 flex gap-1" aria-hidden>
                <span className="h-6 w-4 [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]" style={{ background: NAVY }} />
                <span className="h-6 w-4 [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]" style={{ background: NAVY }} />
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Second Party (CTO)</p>
              <p className={`${script.className} mt-1 text-4xl leading-none`} style={{ color: NAVY }}>Yusron Efendi</p>
              <div className="mx-auto mt-1 h-px w-48" style={{ background: NAVY }} />
              <p className="mt-1 text-sm">Yusron Efendi</p>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em]">XAA.ES · One ecosystem. Endless possibilities.</p>
        </div>
      </div>
    </div>
  );
}
