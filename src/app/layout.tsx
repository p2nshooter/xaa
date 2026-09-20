import type { Metadata } from 'next';
import { SiteBeacon } from '@/components/SiteBeacon';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';
import { SiteHeader, SiteFooter } from '@/components/Site';
import { Analytics } from '@/components/Analytics';
import { GlobalAds } from '@/components/Ads';
import { PageAds } from '@/components/PageAds';
import { jsonLdHtml } from '@/lib/json-ld';
import { PACKAGES, eur } from '@/content/packages';

const serif = Playfair_Display({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-serif', display: 'swap' });
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
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
