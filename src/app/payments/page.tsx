import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';
import { eur, usd, USD_PER_EUR } from '@/content/packages';

export const metadata: Metadata = {
  title: 'Payments — USDT & PayPal',
  description:
    'XAA invoices in euros and accepts USDT (TRC20, ERC20, BEP20) and PayPal. Milestone payments of 10%, 40% and 50%, confirmed within one business day.',
  alternates: { canonical: '/payments' },
};

export default function PaymentsPage() {
  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <span className="chip">Payments</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Invoiced in euros. <span className="accent-text">Paid in USDT or PayPal.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Two rails, both settling worldwide, both confirmed within one business day. Every invoice is issued in EUR
            because that is the contract currency; how you send the money is your choice.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-7">
            <div className="flex items-center gap-3">
              <span className="mk-icon-bubble text-gold-500">₮</span>
              <div>
                <h2 className="font-display text-2xl font-extrabold">USDT</h2>
                <p className="text-sm text-steel-500">Tether, on three networks</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-steel-500">
              The fastest option, and the one most international clients use. We accept USDT on TRC20, ERC20 and BEP20.
              The exact receiving address for your network is shown on your project&apos;s payment screen — we never send
              an address by email, and you should never accept one that arrives that way.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex gap-2"><span className="tick">✓</span> TRC20 (Tron) — lowest fees, recommended</li>
              <li className="flex gap-2"><span className="tick">✓</span> ERC20 (Ethereum)</li>
              <li className="flex gap-2"><span className="tick">✓</span> BEP20 (BNB Smart Chain)</li>
              <li className="flex gap-2"><span className="tick">✓</span> Confirmed on-chain, usually within minutes</li>
            </ul>
            <div className="mt-5 rounded-lg bg-ivory-100/70 p-4 text-sm">
              <p className="font-bold">How the amount is worked out</p>
              <p className="mt-1 text-steel-500">
                Invoices are in EUR. Your project page converts the milestone into USDT at the rate on the day —
                currently about {USD_PER_EUR.toFixed(2)} USDT per euro, so {eur(1000)} ≈ {usd(1000)}. Send the USDT amount
                shown on the payment screen, paste the transaction hash, and the milestone clears once we verify it
                on-chain.
              </p>
            </div>
            <p className="mt-4 text-xs text-steel-500">
              Network fees are paid by the sender. Send only USDT on the network you selected — a transfer on the wrong
              network cannot be recovered.
            </p>
          </article>

          <article className="panel p-7">
            <div className="flex items-center gap-3">
              <span className="mk-icon-bubble text-gold-500">₽</span>
              <div>
                <h2 className="font-display text-2xl font-extrabold">PayPal</h2>
                <p className="text-sm text-steel-500">EUR, card or balance</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-steel-500">
              If you would rather pay from a company card or a PayPal balance, every milestone can be settled in euros
              through PayPal. The payment screen gives you the invoice reference to quote so the transfer is matched to
              your project automatically.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex gap-2"><span className="tick">✓</span> Paid in EUR, the contract currency</li>
              <li className="flex gap-2"><span className="tick">✓</span> Card, bank or PayPal balance</li>
              <li className="flex gap-2"><span className="tick">✓</span> Buyer protection on your side</li>
              <li className="flex gap-2"><span className="tick">✓</span> Confirmed within one business day</li>
            </ul>
            <div className="mt-5 rounded-lg bg-ivory-100/70 p-4 text-sm">
              <p className="font-bold">A note on fees</p>
              <p className="mt-1 text-steel-500">
                PayPal&apos;s processing fee on cross-border commercial payments is charged to us and is already built
                into the published prices — you pay the invoice amount and nothing more. Currency conversion, if your
                account is not in EUR, is between you and PayPal.
              </p>
            </div>
            <p className="mt-4 text-xs text-steel-500">
              Always send as a payment for goods and services, quoting your project reference (XAA-…). Friends-and-family
              transfers remove your protection and we will ask you to resend.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <SectionHead eyebrow="Every milestone, the same five steps" title="How a payment clears" />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { n: '1', t: 'Milestone falls due', b: 'The portal raises it automatically when the stage is reached.' },
            { n: '2', t: 'Choose your rail', b: 'USDT on your network, or PayPal in EUR. The screen shows the exact amount.' },
            { n: '3', t: 'Send and record it', b: 'Paste the transaction hash or PayPal ID; attach a screenshot if you like.' },
            { n: '4', t: 'We verify', b: 'On-chain or in the PayPal account, within one business day.' },
            { n: '5', t: 'Stage unlocks', b: 'Status, progress cap and the activity log update by themselves.' },
          ].map((s) => (
            <li key={s.n} className="premium-card p-5">
              <span className="font-display text-2xl font-extrabold accent-text">{s.n}</span>
              <p className="mt-2 text-sm font-bold">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-steel-500">{s.b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="panel p-6">
            <h2 className="font-display text-xl font-extrabold">Invoices, VAT and receipts</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-steel-500">
              <li className="flex gap-2"><span className="tick">✓</span> Every milestone produces a numbered invoice in EUR.</li>
              <li className="flex gap-2"><span className="tick">✓</span> EU business clients: supply your VAT number and the reverse-charge rule is applied.</li>
              <li className="flex gap-2"><span className="tick">✓</span> Clients outside the EU are invoiced without EU VAT.</li>
              <li className="flex gap-2"><span className="tick">✓</span> Receipts are issued for USDT payments with the transaction hash on the document.</li>
              <li className="flex gap-2"><span className="tick">✓</span> Domain fees, third-party licences and gateway charges are passed through at cost.</li>
            </ul>
          </div>
          <div className="panel p-6">
            <h2 className="font-display text-xl font-extrabold">Refunds and cancellation</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-steel-500">
              <li className="flex gap-2"><span className="tick">✓</span> Cancel before the concept review and the deposit is refunded less any work performed.</li>
              <li className="flex gap-2"><span className="tick">✓</span> Cancel during production and you are billed for the progress recorded on the activity log, no more.</li>
              <li className="flex gap-2"><span className="tick">✓</span> Work completed and paid for is yours, whatever happens next — code and design files are released.</li>
              <li className="flex gap-2"><span className="tick">✓</span> If we fail to deliver the agreed scope, unearned milestones are returned on the same rail you paid with.</li>
            </ul>
            <p className="mt-4 text-xs text-steel-500">
              Full detail in the <Link href="/terms" className="underline">terms of engagement</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
          <h2 className="font-display text-lg font-extrabold">Security: how to know a payment request is really from us</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel-500">
            Payment details are shown <strong>only</strong> inside your signed-in project page at{' '}
            <code className="rounded bg-ivory-100 px-1.5 py-0.5 text-xs">xaa.es/portal</code>. We will never email you a
            wallet address, never message you asking to redirect a payment to a &ldquo;new&rdquo; address, and never ask for
            your password. If you receive anything like that, it is not us — forward it to us and confirm the details on
            your project page before sending anything.
          </p>
        </div>
      </section>

      <CtaBand
        title="Ready when you are"
        lead="Open a project to see your exact milestone amounts in both EUR and USDT before anything is due."
      />
    </>
  );
}
