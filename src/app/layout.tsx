import type { Metadata, Viewport } from 'next';
import { SiteBeacon } from '@/components/SiteBeacon';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import './copa2026.css';
import { SITE } from '@/lib/site';
import { SiteHeader, SiteFooter } from '@/components/Site';
import { Copa2026 } from '@/components/Copa2026';
import { Analytics } from '@/components/Analytics';
import { jsonLdHtml } from '@/lib/json-ld';
import { PACKAGES, eur } from '@/content/packages';
import { getLang } from '@/lib/i18n.server';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import { SupportWidget } from '@/components/SupportWidget';
import { InstallBar } from '@/components/InstallBar';
import { PWA_EARLY } from '@/lib/pwa-early';
import { translator } from '@/lib/i18n';

// Display face for headings. A clean grotesk rather than the old Playfair:
// the serif read as ornamental next to a pricing table.
const display = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  // No site-wide canonical here: inherited by every page that set none, it
  // told search engines those pages were duplicates of the home page. Each
  // page sets its own through pageMetadata (src/lib/seo.ts).
  icons: {
    icon: [
      { url: '/brand/xaa-mark-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
    ],
    shortcut: '/brand/xaa-mark-64.png',
    apple: '/pwa/apple-touch-icon.png',
  },
  // Installed from the home screen it opens without the browser bar (owner, 20 Oct 2026).
  appleWebApp: { capable: true, title: 'XAA.es', statusBarStyle: 'black-translucent' },
  robots: { index: true, follow: true },
  openGraph: { siteName: SITE.name, type: 'website', locale: 'en_US', images: [DEFAULT_OG_IMAGE] },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE.url] },
  other: { 'google-adsense-account': SITE.adClient },
};

export const viewport: Viewport = { themeColor: '#07112a', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = translator(lang);
  const pwa = {
    label: t('pwa.label'), title: t('pwa.title'), sub: t('pwa.sub'), install: t('pwa.install'), later: t('pwa.later'), close: t('pwa.close'),
    iosTitle: t('pwa.iosTitle'), ios: [t('pwa.ios1'), t('pwa.ios2'), t('pwa.ios3')] as [string, string, string],
    androidTitle: t('pwa.androidTitle'), android: [t('pwa.android1'), t('pwa.android2'), t('pwa.android3')] as [string, string, string],
  };
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Catches the browser's install offer before React starts (lib/pwa-early.ts). */}
        <script dangerouslySetInnerHTML={{ __html: PWA_EARLY }} />
        <meta name="google-adsense-account" content={SITE.adClient} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adClient}`}
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': ['Organization', 'ProfessionalService'],
                  '@id': `${SITE.url}#org`,
                  name: SITE.name,
                  alternateName: SITE.expansionPlain,
                  url: SITE.url,
                  logo: `${SITE.url}/brand/xaa-mark.png`,
                  image: `${SITE.url}/brand/xaa-mark.png`,
                  email: SITE.email,
                  description: SITE.description,
                  areaServed: ['EU', 'Worldwide'],
                  priceRange: '€€€',
                  knowsAbout: [
                    'Web development', 'E-commerce development', 'SaaS development',
                    'Marketplace development', 'Enterprise web platforms', 'UI/UX design',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE.url}#site`,
                  name: SITE.name,
                  url: SITE.url,
                  publisher: { '@id': `${SITE.url}#org` },
                  inLanguage: ['en', 'es', 'id'],
                },
                {
                  '@type': 'OfferCatalog',
                  '@id': `${SITE.url}#catalog`,
                  name: 'Website & platform development packages',
                  provider: { '@id': `${SITE.url}#org` },
                  itemListElement: PACKAGES.map((p) => ({
                    '@type': 'Offer',
                    name: p.name,
                    url: `${SITE.url}/services/${p.slug}`,
                    priceCurrency: 'EUR',
                    priceSpecification: {
                      '@type': 'PriceSpecification',
                      minPrice: p.priceMin,
                      maxPrice: p.priceMax,
                      priceCurrency: 'EUR',
                      description: `${eur(p.priceMin)} – ${eur(p.priceMax)}${p.openEnded ? '+' : ''}`,
                    },
                    category: 'Web development',
                  })),
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans">
        <InstallBar s={pwa} />
        <SiteBeacon />
        <Copa2026 lang={lang} />
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
        <SupportWidget lang={lang} />
        <Analytics />
      </body>
    </html>
  );
}
