import Link from 'next/link';
import { SITE } from '@/lib/site';
import { CATEGORIES, ARTICLES } from '@/content/articles';

/**
 * Magazine-style chrome (v2 redesign): a breaking-news ticker of the latest
 * pieces, a bold masthead, a sticky icon nav, and a rich footer with a giant
 * watermark. All motion comes from the CSS "magazine kit" in globals.css and
 * respects prefers-reduced-motion.
 */

function latest(n: number) {
  return [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, n);
}

export function SiteHeader() {
  const ticker = latest(8);
  return (
    <header id="top">
      {/* Ticker bar — the site feels alive the moment it loads. */}
      <div className="bg-ink-950 text-ivory-50">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5 text-[11px]">
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 font-bold uppercase tracking-widest">
            <span className="mk-live-dot" /> Latest
          </span>
          <div className="mk-ticker relative flex-1">
            <div className="mk-ticker-track">
              {[...ticker, ...ticker].map((a, i) => (
                <Link key={i} href={`/articles/${a.slug}`} className="whitespace-nowrap opacity-80 transition hover:opacity-100">
                  <span className="mr-2 text-gold-300">◆</span>
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
          <span className="hidden shrink-0 opacity-60 md:inline">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div className="relative overflow-hidden border-b border-[color:var(--accent-soft)] bg-ivory-50">
        <div className="mk-orb" style={{ width: 280, height: 280, right: -90, top: -130, background: 'var(--accent)' }} />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-3 px-4 py-6">
          <Link href="/" className="flex flex-wrap items-baseline gap-3">
            <span className="font-serif text-4xl font-black tracking-tight sm:text-5xl">
              {SITE.name}
              <span className="accent-text">.{SITE.domain.split('.').pop()}</span>
            </span>
            <span className="trophy-chip hidden sm:inline-flex"><span className="wc-ball-spin" aria-hidden>⚽</span> {SITE.tagline}</span>
          </Link>
          <p className="hidden max-w-xs text-right text-[11px] leading-snug text-ink-800/60 md:block">{SITE.description}</p>
        </div>
      </div>

      {/* Sticky icon nav — scrolls horizontally on mobile, no hidden menus. */}
      <nav className="sticky top-0 z-40 border-b border-[color:var(--accent-soft)] bg-ivory-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-3 text-sm font-semibold [scrollbar-width:none]">
          <Link href="/" className="mk-underline shrink-0 whitespace-nowrap transition hover:text-gold-600">
            ⌂ Home
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="mk-underline shrink-0 whitespace-nowrap transition hover:text-gold-600">
              <span className="mr-1" aria-hidden>{c.icon}</span>
              {c.name}
            </Link>
          ))}
          <Link href="/about" className="mk-underline shrink-0 whitespace-nowrap opacity-70 transition hover:text-gold-600">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const fresh = latest(4);
  return (
    <footer className="relative mt-16 overflow-hidden bg-ink-900 text-ivory-100">
      {/* Gradient hairline + giant watermark give the footer its own stage. */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
      <div className="mk-watermark text-ivory-50">{SITE.name}</div>
      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-serif text-2xl font-black text-ivory-50">
              {SITE.name}
              <span className="accent-text">.{SITE.domain.split('.').pop()}</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory-100/70">{SITE.description}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Topics</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="transition hover:text-gold-300">
                    <span className="mr-1.5" aria-hidden>{c.icon}</span>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Fresh off the desk</p>
            <ul className="mt-3 space-y-2.5 text-sm text-ivory-100/70">
              {fresh.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`} className="line-clamp-2 transition hover:text-gold-300">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-300">Site</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory-100/70">
              <li><Link href="/about" className="transition hover:text-gold-300">About</Link></li>
              <li><Link href="/contact" className="transition hover:text-gold-300">Contact</Link></li>
              <li><Link href="/privacy" className="transition hover:text-gold-300">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-gold-300">Terms</Link></li>
              <li><a href="#top" className="transition hover:text-gold-300">↑ Back to top</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-ivory-100/10 pt-6 text-xs leading-relaxed text-ivory-100/50">
          {SITE.name} is an independent football magazine. Original editorial only — match schedules, squads and results change; always confirm fixtures and times with official FIFA and broadcaster sources before you plan around a game.
        </p>
        <p className="mt-4 text-xs text-ivory-100/40">© {new Date().getFullYear()} {SITE.domain}</p>
      </div>
    </footer>
  );
}
