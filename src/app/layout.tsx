import type { Metadata } from 'next';
import { SiteBeacon } from "@/components/SiteBeacon";
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';
import { SiteHeader, SiteFooter } from '@/components/Site';
import { Analytics } from '@/components/Analytics';
import { GlobalAds } from '@/components/Ads';

const serif = Playfair_Display({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-serif', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
  robots: { index: true, follow: true },
  openGraph: { siteName: SITE.name, type: 'website', locale: 'en_US' },
  other: { 'google-adsense-account': SITE.adClient }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        {/* Google AdSense — verification + loader on every page. */}
        <meta name="google-adsense-account" content={SITE.adClient} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adClient}`}
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                { '@type': 'Organization', '@id': `${SITE.url}#org`, name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg` },
                { '@type': 'WebSite', '@id': `${SITE.url}#site`, name: SITE.name, url: SITE.url, publisher: { '@id': `${SITE.url}#org` }, inLanguage: 'en' },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans">
        <SiteBeacon />
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
        <Analytics />
        <GlobalAds />
      </body>
    </html>
  );
}
