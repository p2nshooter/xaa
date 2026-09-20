import Link from 'next/link';
import { SITE } from '@/lib/site';

/**
 * Studio chrome — light, quiet, and out of the way. Mark, wordmark, what the
 * three letters mean, and the one thing every visitor is here to do: look at
 * the packages and open a project.
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
      {/* Positioning strip — the promise and the payment rails, one line. */}
      <div className="bg-[color:var(--accent-ink)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-[11px] font-medium">
          <span className="flex items-center gap-2">
            <span className="mk-live-dot" />
            Taking projects for the next production slot — start from a 10% deposit
          </span>
          <span className="hidden items-center gap-3 text-white/75 sm:flex">
            <span>Paid in USDT or PayPal</span>
            <span aria-hidden>·</span>
            <span>Milestone-based, never all up front</span>
          </span>
        </div>
      </div>

      {/* Masthead + navigation on one bar. Only this part sticks, so the
          promo strip scrolls away instead of eating the viewport. */}
      <div className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={38} />
            <span>
              <span className="block font-display text-[22px] font-extrabold leading-none tracking-tight">
                XAA<span className="accent-text">.es</span>
              </span>
              {/* Kept off narrow widths: at ~1100px it wrapped to two lines
                  and pushed the nav out of alignment. */}
              <span className="mt-1 hidden whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.16em] text-steel-400 xl:block">
                {SITE.expansion}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-800 lg:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="mk-underline whitespace-nowrap transition hover:text-gold-500">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/portal" className="btn btn-ghost btn-sm hidden sm:inline-flex">Client portal</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Start a project</Link>
          </div>
        </div>

        {/* Below the masthead on small screens, so nothing is hidden in a menu. */}
        <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 pb-2.5 text-sm font-medium text-ink-800 [scrollbar-width:none] lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="shrink-0 whitespace-nowrap transition hover:text-gold-500">
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="shrink-0 whitespace-nowrap text-steel-500 transition hover:text-gold-500">
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--line)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark size={36} />
              <p className="font-display text-xl font-extrabold tracking-tight">
                XAA<span className="accent-text">.es</span>
              </p>
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-500">{SITE.expansion}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-steel-500">
              A European development studio. We design, build, deploy and maintain websites, stores and platforms —
              from a single landing page to an enterprise ecosystem.
            </p>
          </div>

          <FooterColumn
            title="Services"
            links={[
              ['/services', 'All packages'],
              ['/services#addons', 'Add-on services'],
              ['/care#setup', 'One-time setup'],
              ['/care#maintenance', 'Monthly maintenance'],
              ['/work', 'Capabilities & stack'],
            ]}
          />
          <FooterColumn
            title="Working with us"
            links={[
              ['/process', 'How a project runs'],
              ['/payments', 'USDT & PayPal'],
              ['/faq', 'FAQ'],
              ['/register', 'Open a project'],
              ['/portal', 'Client portal'],
            ]}
          />
          <FooterColumn
            title="Studio"
            links={[
              ['/about', 'About XAA'],
              ['/contact', 'Contact'],
              [SITE.magazine.path, SITE.magazine.name],
              ['/terms', 'Terms'],
              ['/privacy', 'Privacy'],
            ]}
          />
        </div>

        <p className="mt-12 border-t border-[color:var(--line)] pt-6 text-xs leading-relaxed text-steel-500">
          All prices are indicative European market rates in euros, quoted before VAT where applicable, and are confirmed
          in writing after a scope review. Setup and monthly maintenance are priced separately from the build. Domain
          registration, third-party licences, payment gateway fees and external API usage are billed at cost.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-steel-400">
          <p>© {new Date().getFullYear()} {SITE.domain} — {SITE.expansionPlain}</p>
          <a href="#top" className="transition hover:text-gold-500">↑ Back to top</a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-900">{title}</p>
      <ul className="mt-3.5 space-y-2.5 text-sm text-steel-500">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="transition hover:text-gold-500">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
