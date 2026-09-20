import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { SectionHead } from '@/components/Studio';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Send XAA a brief. We reply within one business day with the package your project fits, a realistic price and a delivery estimate.`,
  alternates: { canonical: '/contact' },
};

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden metal-wash text-ivory-50">
        <div className="mk-grid-bg absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <span className="mk-chip border-white/25 text-ivory-100">Contact</span>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight sm:text-5xl">
            Tell us what you need built
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ivory-100/80">
            Send the brief and we come back with the package it lands in, a realistic number, a delivery estimate, and
            what we would leave out of version one. If your project is not a fit, we will say that too.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <SectionHead eyebrow="Project brief" title="Start here" />
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel p-6">
              <h2 className="font-serif text-lg font-black">Direct contact</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">New projects</dt>
                  <dd><a href={`mailto:${SITE.salesEmail}`} className="text-gold-500 underline">{SITE.salesEmail}</a></dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">General</dt>
                  <dd><a href={`mailto:${SITE.email}`} className="text-gold-500 underline">{SITE.email}</a></dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Billing & payments</dt>
                  <dd><a href={`mailto:${SITE.billingEmail}`} className="text-gold-500 underline">{SITE.billingEmail}</a></dd>
                </div>
              </dl>
              <p className="hint mt-4">
                Existing client? Everything about your build — progress, invoices, files — lives in your{' '}
                <Link href="/portal" className="text-gold-500 underline">project portal</Link>.
              </p>
            </div>

            <div className="panel p-6">
              <h2 className="font-serif text-lg font-black">Already decided?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/70">
                You do not need to talk to us first. Open a project, and you will see the exact milestone amounts before
                anything is due.
              </p>
              <Link href="/portal/new" className="btn btn-primary btn-sm mt-4 w-full">Open a project</Link>
              <Link href="/services" className="btn btn-ghost btn-sm mt-2 w-full">Compare packages</Link>
            </div>

            <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
              <h2 className="font-bold">A security note</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/70">
                We never send wallet addresses or payment details by email. Payment information appears only inside your
                signed-in project page.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
