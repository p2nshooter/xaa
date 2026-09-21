import type { Metadata } from 'next';
import { SiteBeacon } from '@/components/SiteBeacon';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';
import { SiteHeader, SiteFooter } from '@/components/Site';
import { Analytics } from '@/components/Analytics';
import { GlobalAds } from '@/components/Ads';
import { PageAds } from '@/components/PageAds';
import { jsonLdHtml } from '@/lib/json-ld';
import { PACKAGES, eur } from '@/content/packages';
import { getLang } from '@/lib/i18n.server';

// Display face for headings. A clean grotesk rather than the old Playfair:
// the serif read as ornamental next to a pricing table.
const display = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/brand/xaa-mark-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/brand/xaa-mark-64.png',
    apple: '/brand/xaa-mark-192.png',
  },
  robots: { index: true, follow: true },
  openGraph: { siteName: SITE.name, type: 'website', locale: 'en_US', images: ['/brand/xaa-mark.png'] },
  twitter: { card: 'summary', images: ['/brand/xaa-mark.png'] },
  other: { 'google-adsense-account': SITE.adClient },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`}>
      <head>
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
                  inLanguage: 'en',
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
        <SiteBeacon />
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        {/* Ad units run on the editorial archive only — the commercial pages
            and the client portal stay clean. PageAds enforces that itself. */}
        <PageAds />
        <SiteFooter />
        <Analytics />
        <GlobalAds />
      </body>
    </html>
  );
}
