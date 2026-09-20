import Link from 'next/link';
import { SITE } from '@/lib/site';

/**
 * Studio chrome. A quiet, confident header — mark, wordmark, what the three
 * letters mean — plus the one thing every visitor is here to do: look at the
 * packages and open a project.
 *
 * The editorial archive the domain started as is still published; it lives
 * behind the "Insights" link and keeps its own navigation.
 *
 * Deliberately NOT session-aware: reading the cookie here would opt every
 * route — including a hundred pre-rendered archive articles — out of static
 * rendering for the sake of one button. The portal shows who you are once
 * you are inside it.
 */

const NAV = [
  { href: '/services', label: 'Services' },
  { href: '/process', label: 'How it works' },
  { href: '/care', label: 'Setup & Care' },
  { href: '/payments', label: 'Payments' },
  { href: '/work', label: 'Capabilities' },
  { href: SITE.magazine.path, label: SITE.magazine.name },
];

export function BrandMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/xaa-mark-192.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export function SiteHeader() {
  return (
    <header id="top">
      {/* Positioning strip — the promise, the payment rails, the guarantee. */}
      <div className="bg-ink-950 text-ivory-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-[11px]">
          <span className="flex items-center gap-2">
            <span className="mk-live-dot" />
            Taking projects for the next production slot — start from a 10% deposit
          </span>
          <span className="hidden items-center gap-3 opacity-70 sm:flex">
            <span>Paid in USDT or PayPal</span>
            <span aria-hidden>·</span>
            <span>Milestone-based, never all up front</span>
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div className="relative overflow-hidden border-b border-[color:var(--accent-soft)] bg-ivory-50">
        <div className="mk-orb" style={{ width: 300, height: 300, right: -110, top: -160, background: 'var(--accent)' }} />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark size={48} />
            <span>
              <span className="block font-serif text-3xl font-black leading-none tracking-tight sm:text-4xl">
                XAA<span className="accent-text">.es</span>
              </span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-steel-500">
                {SITE.expansion}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/portal" className="btn btn-ghost btn-sm">Client portal</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Start a project</Link>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 border-b border-[color:var(--accent-soft)] bg-ivory-50/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-3 text-sm font-semibold [scrollbar-width:none]">
          <Link href="/" className="mk-underline shrink-0 whitespace-nowrap transition hover:text-gold-500">Home</Link>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="mk-underline shrink-0 whitespace-nowrap transition hover:text-gold-500">
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="mk-underline shrink-0 whitespace-nowrap opacity-70 transition hover:text-gold-500">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-ink-900 text-ivory-100">
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
      <div className="mk-watermark text-ivory-50">XAA</div>
      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size={40} />
              <p className="font-serif text-2xl font-black text-ivory-50">
                XAA<span className="accent-text">.es</span>
              </p>
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">{SITE.expansion}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory-100/70">
              A European development studio. We design, build, deploy and maintain websites, stores and platforms —
              from a single landing page to an enterprise ecosystem.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Services</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              <li><Link href="/services" className="transition hover:text-gold-300">All packages</Link></li>
              <li><Link href="/services#addons" className="transition hover:text-gold-300">Add-on services</Link></li>
              <li><Link href="/care#setup" className="transition hover:text-gold-300">One-time setup</Link></li>
              <li><Link href="/care#maintenance" className="transition hover:text-gold-300">Monthly maintenance</Link></li>
              <li><Link href="/work" className="transition hover:text-gold-300">Capabilities & stack</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Working with us</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              <li><Link href="/process" className="transition hover:text-gold-300">How a project runs</Link></li>
              <li><Link href="/payments" className="transition hover:text-gold-300">USDT & PayPal</Link></li>
              <li><Link href="/faq" className="transition hover:text-gold-300">FAQ</Link></li>
              <li><Link href="/register" className="transition hover:text-gold-300">Open a project</Link></li>
              <li><Link href="/portal" className="transition hover:text-gold-300">Client portal</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Studio</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              <li><Link href="/about" className="transition hover:text-gold-300">About XAA</Link></li>
              <li><Link href="/contact" className="transition hover:text-gold-300">Contact</Link></li>
              <li><Link href={SITE.magazine.path} className="transition hover:text-gold-300">{SITE.magazine.name}</Link></li>
              <li><Link href="/terms" className="transition hover:text-gold-300">Terms</Link></li>
              <li><Link href="/privacy" className="transition hover:text-gold-300">Privacy</Link></li>
              <li><a href="#top" className="transition hover:text-gold-300">↑ Back to top</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-ivory-100/10 pt-6 text-xs leading-relaxed text-ivory-100/50">
          All prices are indicative European market rates in euros, quoted before VAT where applicable, and are confirmed
          in writing after a scope review. Setup and monthly maintenance are priced separately from the build. Domain
          registration, third-party licences, payment gateway fees and external API usage are billed at cost.
        </p>
        <p className="mt-4 text-xs text-ivory-100/40">© {new Date().getFullYear()} {SITE.domain} — {SITE.expansionPlain}</p>
      </div>
    </footer>
  );
}
