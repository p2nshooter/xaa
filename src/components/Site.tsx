import Link from 'next/link';
import { SITE } from '@/lib/site';
import { translator } from '@/lib/i18n';
import { getLang } from '@/lib/i18n.server';
import { LangSwitcher } from '@/components/LangSwitcher';

/**
 * Studio chrome — light, quiet, and out of the way. Mark, wordmark, what the
 * three letters mean, and the one thing every visitor is here to do: look at
 * the packages and open a project.
 *
 * The editorial archive the domain started as is still published, but it is
 * deliberately NOT in the primary nav any more. It is football writing, and a
 * "Insights" link in the main menu of a development studio promised thinking
 * about software and delivered World Cup coverage. It sits in the footer now,
 * labelled for what it is, and keeps its own navigation.
 *
 * The chrome is language-aware (getLang) so the picker in the header can switch
 * the whole site. That reads the sticky cookie, which opts these shared parts
 * out of static rendering — an accepted cost for a manually localised site.
 */

const NAV = [
  { href: '/services', key: 'nav.services' },
  { href: '/portfolio', key: 'nav.work' },
  { href: '/process', key: 'nav.process' },
  { href: '/care', key: 'nav.care' },
  { href: '/payments', key: 'nav.payments' },
  { href: '/capabilities', key: 'nav.capabilities' },
  { href: '/faq', key: 'nav.faq' },
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

export async function SiteHeader() {
  const lang = await getLang();
  const t = translator(lang);
  return (
    <header id="top">
      {/* Positioning strip — the promise and the payment rails, one line. */}
      <div className="bg-[color:var(--accent-ink)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-[11px] font-medium">
          <span className="flex items-center gap-2">
            <span className="mk-live-dot" />
            {t('promo.slot')}
          </span>
          <span className="hidden items-center gap-3 text-white/75 sm:flex">
            <span>{t('promo.paid')}</span>
            <span aria-hidden>·</span>
            <span>{t('promo.milestone')}</span>
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
                {t(n.key)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LangSwitcher current={lang} label={t('lang.label')} />
            <Link href="/portal" className="btn btn-ghost btn-sm hidden sm:inline-flex">{t('nav.portal')}</Link>
            <Link href="/register" className="btn btn-primary btn-sm">{t('nav.start')}</Link>
          </div>
        </div>

        {/* Below the masthead on small screens, so nothing is hidden in a menu. */}
        <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 pb-2.5 text-sm font-medium text-ink-800 [scrollbar-width:none] lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="shrink-0 whitespace-nowrap transition hover:text-gold-500">
              {t(n.key)}
            </Link>
          ))}
          <Link href="/contact" className="shrink-0 whitespace-nowrap text-steel-500 transition hover:text-gold-500">
            {t('nav.contact')}
          </Link>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const lang = await getLang();
  const t = translator(lang);
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
              {t('footer.tagline')}
            </p>
          </div>

          <FooterColumn
            title={t('footer.services')}
            links={[
              ['/services', t('footer.allPackages')],
              ['/portfolio', t('footer.workBuilt')],
              ['/portfolio#super-enterprise', t('footer.superEnterprise')],
              ['/election-systems', t('footer.election')],
              ['/services#addons', t('footer.addons')],
              ['/care#setup', t('footer.setup')],
              ['/care#maintenance', t('footer.maintenance')],
              ['/capabilities', t('footer.capabilities')],
            ]}
          />
          <FooterColumn
            title={t('footer.working')}
            links={[
              ['/process', t('footer.processRuns')],
              ['/payments', t('footer.usdtPaypal')],
              ['/faq', t('footer.faqLong')],
              ['/register', t('footer.openProject')],
              ['/portal', t('nav.portal')],
            ]}
          />
          <FooterColumn
            title={t('footer.studio')}
            links={[
              ['/about', t('footer.about')],
              ['/contact', t('footer.contact')],
              [SITE.magazine.path, t('footer.archive')],
              ['/terms', t('footer.terms')],
              ['/privacy', t('footer.privacy')],
            ]}
          />
        </div>

        <p className="mt-12 border-t border-[color:var(--line)] pt-6 text-xs leading-relaxed text-steel-500">
          {t('footer.legal')}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-steel-400">
          <p>© {new Date().getFullYear()} {SITE.domain} — {SITE.expansionPlain}</p>
          <a href="#top" className="transition hover:text-gold-500">{t('footer.backToTop')}</a>
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
