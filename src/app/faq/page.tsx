import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';
import { jsonLdHtml } from '@/lib/json-ld';
import { eur } from '@/content/packages';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Common questions about XAA: pricing, the 10/40/50 milestone schedule, timelines, ownership of code, USDT and PayPal payments, setup and maintenance.',
  alternates: { canonical: '/faq' },
};

const GROUPS: { group: string; qa: { q: string; a: string }[] }[] = [
  {
    group: 'Pricing',
    qa: [
      {
        q: 'Why is every price a range rather than one number?',
        a: 'Because the same package can be a lean build or a heavily customised one. The range is the honest span between those. After a scope review we fix a single figure in writing, and the milestone amounts recalculate from it — the number does not move afterwards unless you ask for something new.',
      },
      {
        q: 'Are the prices in euros?',
        a: 'Yes. Every contract and invoice is in EUR, at European market rates, before VAT where it applies. You can settle in USDT or PayPal; the conversion is shown on the payment screen.',
      },
      {
        q: 'What is not included in the build price?',
        a: 'Domain registration, third-party licences and subscriptions, payment gateway fees, external API usage, paid stock assets, and the optional setup and care services. All of these are either passed through at cost or quoted separately before you commit.',
      },
      {
        q: 'Do you charge for the quote?',
        a: 'No. Registration, the quote and the scope review are free. The first money that changes hands is the 10% booking deposit, and that is deducted from the total.',
      },
    ],
  },
  {
    group: 'Payments',
    qa: [
      {
        q: 'Why 10% / 40% / 50%?',
        a: 'The 10% reserves a production slot and filters out projects that were never real. The 40% covers the design and build phase. The final 50% falls due only when the work is 75–80% finished and you have seen it running — so you are never paying far ahead of what exists.',
      },
      {
        q: 'Can I pay more than 10% up front?',
        a: 'Yes. Anything above the minimum simply counts towards the next milestone. Some clients settle the first 50% in one transfer to move straight into production.',
      },
      {
        q: 'What happens at 80% progress?',
        a: 'Progress is capped there until the settlement clears. It is a deliberate stop: it protects you from paying for work that does not exist, and protects us from delivering work that has not been paid for. The moment the payment is confirmed the cap lifts automatically.',
      },
      {
        q: 'Which USDT networks do you accept?',
        a: 'TRC20, ERC20 and BEP20. TRC20 is cheapest and what most clients use. The receiving address is shown only on your signed-in project page — we never send an address by email or chat.',
      },
      {
        q: 'Can I pay by bank transfer?',
        a: 'The two standard rails are USDT and PayPal. For enterprise engagements with procurement requirements, ask us — we can usually accommodate SEPA against a formal contract.',
      },
    ],
  },
  {
    group: 'Timelines & process',
    qa: [
      {
        q: 'When do I get a delivery date?',
        a: 'The moment your concept files land. The portal fixes an estimate from the package timeline and shows it on your project page, and we confirm scope against what you uploaded within one business day.',
      },
      {
        q: 'How do I know what is happening during the build?',
        a: 'Your project page carries a live progress percentage, the seven-stage rail, the milestone ledger and a dated activity log. Every payment, upload and progress change is written there automatically.',
      },
      {
        q: 'What if I need changes during the build?',
        a: 'Small adjustments inside the agreed scope are part of the work. Anything that adds scope is quoted and scheduled as a change before it starts — so the date and the price stay honest.',
      },
      {
        q: 'What do you need from me?',
        a: 'A concept or brief, your brand assets, the content (copy, images, product data), and one person who can make decisions. Late content is the single most common cause of a late launch.',
      },
    ],
  },
  {
    group: 'After launch',
    qa: [
      {
        q: 'Do I own the code?',
        a: 'Yes. At handover the source code, design files, admin accounts and infrastructure are transferred to you. Nothing is held back to force you into a maintenance contract.',
      },
      {
        q: 'Is maintenance compulsory?',
        a: `No. Care plans start at ${eur(99)}/month and are month to month with 30 days' notice. Plenty of clients take the one-time setup, get the handover and run it themselves.`,
      },
      {
        q: 'What is the difference between setup and maintenance?',
        a: 'Setup is a one-time service that gets you live: domain, DNS, SSL, hosting, email records, analytics, backups, plus a training call. Maintenance is the monthly work that keeps you live: updates, patching, backups, monitoring and a block of development hours.',
      },
      {
        q: 'Can you take over a site someone else built?',
        a: 'Usually, after a paid audit so we know what we are inheriting. The audit fee is credited against the work if you go ahead.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: GROUPS.flatMap((g) =>
              g.qa.map((x) => ({
                '@type': 'Question',
                name: x.q,
                acceptedAnswer: { '@type': 'Answer', text: x.a },
              }))
            ),
          }),
        }}
      />

      <section className="relative overflow-hidden metal-wash text-ivory-50">
        <div className="mk-grid-bg absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <span className="mk-chip border-white/25 text-ivory-100">FAQ</span>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight sm:text-5xl">
            Questions people ask <span className="accent-text">before they commit</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        {GROUPS.map((g) => (
          <div key={g.group} className="mb-12">
            <SectionHead title={g.group} />
            <div className="mt-6 space-y-3">
              {g.qa.map((x) => (
                <details key={x.q} className="panel group p-5">
                  <summary className="cursor-pointer list-none font-bold marker:hidden">
                    <span className="mr-2 text-gold-500 transition group-open:rotate-90 inline-block">▸</span>
                    {x.q}
                  </summary>
                  <p className="mt-3 pl-6 text-sm leading-relaxed text-ink-800/75">{x.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="panel p-6 text-center">
          <p className="font-serif text-xl font-black">Still unsure about something?</p>
          <p className="mt-2 text-sm text-ink-800/70">Ask before you pay anything. We would rather talk you out of the wrong package than take the order.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-primary">Ask a question</Link>
            <Link href="/process" className="btn btn-ghost">Read the process</Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
