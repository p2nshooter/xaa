import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { SEO } from '@/content/seo-copy';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/cookies', copy: SEO.cookies });
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-prose2 px-4 py-14">
      <Breadcrumbs trail={[{ k: 'footer.cookies' }]} className="!px-0 !pt-0 mb-6" />
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Legal</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Cookie policy</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <p className="mt-4 text-sm text-steel-500">Last reviewed: 4 October 2026. This policy covers {SITE.domain}.</p>

      <div className="article-body mt-8">
        <p>
          Cookies are small text files that a website stores in your browser. This page explains which cookies may be
          used when you visit {SITE.domain}, why, and how you can control them.
        </p>

        <h2>Strictly necessary cookies</h2>
        <p>
          If you sign in to the client portal, we set a session cookie so the portal knows you are logged in and can keep
          your projects, invoices and messages private. A language cookie remembers the language you chose. These cookies
          are needed for the service you asked for and are not used for advertising or tracking.
        </p>

        <h2>Statistics</h2>
        <p>
          We count anonymous page views to understand which pages are useful. This counting does not set cookies and does
          not identify you.
        </p>

        <h2>Advertising cookies from Google</h2>
        <p>
          The public pages of the site may show ads served by Google AdSense. Google and its partners may set or read
          cookies to show ads, limit how often you see the same ad, measure performance, personalize ads where you have
          allowed it and prevent fraud. Visitors in the European Economic Area, the United Kingdom and Switzerland are
          asked for consent first; if you decline, you can keep using the site and will see non-personalized ads.
        </p>
        <p>
          You can manage personalized ads in{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google&apos;s Ads Settings</a> and read{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">how Google uses cookies in advertising</a>.
        </p>

        <h2>Controlling cookies in your browser</h2>
        <ul>
          <li><strong>Chrome:</strong> Settings → Privacy and security → Third-party cookies.</li>
          <li><strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data.</li>
          <li><strong>Safari:</strong> Settings → Privacy → Manage Website Data.</li>
          <li><strong>Edge:</strong> Settings → Cookies and site permissions.</li>
        </ul>
        <p>
          Blocking the portal&apos;s session cookie will stop you from signing in, but you can still read every public page.
        </p>

        <h2>Questions</h2>
        <p>
          Write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. See also our <a href="/privacy">privacy policy</a>.
        </p>
      </div>
    </div>
  );
}
