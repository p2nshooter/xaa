import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { SectionHead, CtaBand } from '@/components/Studio';
import { BrandMark } from '@/components/Site';
import { PACKAGES, eur } from '@/content/packages';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE.name} — ${SITE.expansionPlain}. A European web development studio building websites, stores and platforms with milestone-based payments and a client portal that shows real progress.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden metal-wash text-ivory-50">
        <div className="mk-grid-bg absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-center gap-6">
            <BrandMark size={96} />
            <div>
              <span className="mk-chip border-white/25 text-ivory-100">About the studio</span>
              <h1 className="mt-3 font-serif text-4xl font-black leading-tight sm:text-5xl">
                XAA — <span className="accent-text">{SITE.expansionPlain}</span>
              </h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ivory-100/80">
            We build the websites, stores and platforms that businesses actually operate on — and we structure the
            engagement so the client can see, at any hour, exactly what they have paid for and what has been built.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="article-body">
          <h2>The name</h2>
          <p>
            XAA stands for <strong>eXperience, Architecture and Applications</strong> — the three things that have to be
            right for a digital product to work. <strong>Experience</strong> is what the visitor feels: interface,
            speed, clarity, trust. <strong>Architecture</strong> is what holds it up: data models, services, security,
            infrastructure. <strong>Applications</strong> is what it actually does: accounts, payments, dashboards,
            automation. Get one wrong and the other two do not matter.
          </p>
          <p>
            The studio operates from the <strong>.es</strong> domain and works in English with clients across Europe and
            internationally. Contracts are in euros; payment is by USDT or PayPal.
          </p>

          <h2>How we are different, concretely</h2>
          <p>
            Most development studios ask for 50% up front and then go quiet for six weeks. We split payment into
            <strong> 10% / 40% / 50%</strong>, and the last half only falls due once the build is 75–80% finished and
            you have seen it running. Progress is capped at 80% until it clears, which means neither side is ever far
            ahead of the other.
          </p>
          <p>
            Everything runs through a client portal rather than a chain of emails. You register, choose a package, pay
            the deposit, upload your concept, and from that moment your project page carries a completion date, a live
            progress percentage, a milestone ledger and a dated activity log. There is nothing to chase.
          </p>

          <h2>What we build</h2>
          <p>
            Ten packages, from a {eur(PACKAGES[0]!.priceMin)} landing page to a{' '}
            {eur(PACKAGES[PACKAGES.length - 1]!.priceMin)}+ global enterprise ecosystem, covering corporate sites,
            business platforms, e-commerce, marketplaces, SaaS products and enterprise portals. The scope changes with
            the package; the engineering standard does not.
          </p>

          <h2>Ownership</h2>
          <p>
            At handover you receive the source code, the design files, the admin accounts and the infrastructure. Setup
            and maintenance are separate, optional services — never a lock-in, and never a reason to withhold anything
            we built for you.
          </p>

          <h2>The archive</h2>
          <p>
            Before it became a studio, xaa.es published an independent football magazine covering the road to World Cup
            2026. Those articles are still online, still free, and still ours —{' '}
            <Link href={SITE.magazine.path}>read the archive</Link>. It is also, in a small way, a portfolio: the
            content system, the performance work and the SEO behind it are the same ones we build for clients.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHead eyebrow="What we promise" title="Four commitments, in writing" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            { t: 'A price before you talk to a salesperson', b: 'Every package range is published. We will tell you which one you are in before you send a euro.' },
            { t: 'A date you can hold us to', b: 'Fixed the moment your concept lands, visible on your project page for the life of the build.' },
            { t: 'Progress you can verify', b: 'A percentage, a ledger and an activity log — not a status email written on a Friday afternoon.' },
            { t: 'The keys at the end', b: 'Code, designs, accounts and infrastructure transfer to you at handover. Always.' },
          ].map((x) => (
            <div key={x.t} className="panel p-5">
              <h3 className="font-bold">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/70">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Work with us"
        lead="Send a brief, or open a project and see the exact milestone amounts for your package before anything is due."
        primary={{ href: '/contact', label: 'Send a brief' }}
        secondary={{ href: '/services', label: 'Browse packages' }}
      />
    </>
  );
}
