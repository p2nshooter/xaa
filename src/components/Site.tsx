import Link from 'next/link';
import { SITE } from '@/lib/site';
import { CATEGORIES } from '@/content/articles';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--accent-soft)] bg-ivory-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-black tracking-tight">
            {SITE.name}<span className="accent-text">.{SITE.domain.split('.').pop()}</span>
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-gold-600 sm:inline">{SITE.tagline}</span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="text-sm font-medium transition hover:text-gold-600">
              {c.name}
            </Link>
          ))}
        </nav>
        <Link href="/category/insurance" className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-ivory-50 lg:hidden">
          Topics
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[color:var(--accent-soft)] bg-ink-900 text-ivory-100">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl font-black text-ivory-50">
              {SITE.name}<span className="accent-text">.{SITE.domain.split('.').pop()}</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory-100/70">{SITE.description}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Topics</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="hover:text-gold-300">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Site</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              <li><Link href="/about" className="hover:text-gold-300">About</Link></li>
              <li><Link href="/contact" className="hover:text-gold-300">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-gold-300">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gold-300">Terms</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-ivory-100/10 pt-6 text-xs leading-relaxed text-ivory-100/50">
          Disclaimer: {SITE.name} publishes independent educational information only — it is not personalised
          financial, insurance, tax or legal advice, and it does not sell any financial product. Consult a
          qualified professional before making decisions. Figures and rules change over time; verify current
          details with official sources.
        </p>
        <p className="mt-4 text-xs text-ivory-100/40">© {new Date().getFullYear()} {SITE.domain}</p>
      </div>
    </footer>
  );
}
