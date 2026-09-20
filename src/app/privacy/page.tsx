import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${SITE.name} collects, uses and protects personal data across the studio site, the client portal and the editorial archive.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-prose2 px-4 py-14">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-500">Legal</p>
      <h1 className="mt-2 font-serif text-3xl font-black">Privacy policy</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <p className="mt-4 text-sm text-steel-500">
        This policy covers {SITE.domain}: the studio pages, the client portal, and the editorial archive.
      </p>

      <div className="article-body mt-8">
        <h2>Who we are</h2>
        <p>
          {SITE.name} ({SITE.expansionPlain}) is a web development studio operating at {SITE.domain}. For questions
          about this policy or your data, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>

        <h2>What we collect, and why</h2>
        <p>
          <strong>Enquiries.</strong> When you send a brief we store your name, email, company, budget range, the package
          you are interested in and your message, so that we can reply and quote. Lawful basis: steps taken at your
          request prior to entering a contract.
        </p>
        <p>
          <strong>Client accounts.</strong> When you register for the portal we store your name, email, and optionally
          your company, country and phone number, along with a salted hash of your password. We never store the password
          itself. Lawful basis: performance of a contract.
        </p>
        <p>
          <strong>Project material.</strong> Files you upload — briefs, brand assets, content, payment proofs — together
          with project records, milestone payments and the activity log. Lawful basis: performance of a contract.
        </p>
        <p>
          <strong>Payment references.</strong> Transaction hashes and PayPal transaction IDs you supply so a payment can
          be matched to your project. We do not receive or store card numbers; PayPal handles card data on its own
          systems.
        </p>
        <p>
          <strong>Analytics.</strong> Aggregate, privacy-respecting traffic measurement — pages viewed, referrer,
          approximate region and device class — used to understand which pages are useful. Lawful basis: legitimate
          interest in operating and improving the site.
        </p>

        <h2>Cookies</h2>
        <p>
          The portal sets one essential cookie (<code>xaa_session</code>) to keep you signed in. It is HTTP-only, sent
          only over HTTPS, and expires after thirty days or when you sign out. No consent banner is required for it
          because the portal cannot function without it.
        </p>
        <p>
          The editorial archive carries advertising, and advertising partners may set their own cookies on those pages.
          The studio pages and the client portal carry no advertising and no advertising cookies.
        </p>

        <h2>Advertising on the archive</h2>
        <p>
          Articles under <Link href={SITE.magazine.path}>{SITE.magazine.name}</Link> are supported by advertising,
          including Google AdSense and Adsterra. Third-party vendors, including Google, use cookies to serve ads based
          on prior visits to this or other websites. You can opt out of personalised Google advertising at{' '}
          <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google Ads Settings</a>,
          and out of third-party vendor cookies at{' '}
          <a href="https://www.aboutads.info" rel="nofollow noopener" target="_blank">aboutads.info</a>.
        </p>

        <h2>Where your data is stored</h2>
        <p>
          Account, project and payment records are held in a managed database; uploaded files are held in private object
          storage. Both run on Cloudflare&apos;s infrastructure. Files are never public: every download re-checks your
          session and serves only the project owner or the delivery team.
        </p>

        <h2>Who we share it with</h2>
        <p>
          We do not sell personal data. We share it only with the processors needed to run the service — our hosting and
          storage provider, our email provider, and PayPal where you choose that payment rail — and where the law
          requires it. Where we act as a processor of your customers&apos; data during a build, a data processing
          agreement is available on request.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Enquiries: up to 24 months. Account and project records, including invoices: for the duration of the
          relationship and then as long as tax and accounting law requires. Uploaded project files: for the life of the
          project and 12 months after handover, unless you ask us to delete them sooner. Analytics: aggregated, with no
          identifying detail retained.
        </p>

        <h2>Your rights</h2>
        <p>
          If you are in the EU/EEA or the UK you may request access to your data, correction, erasure, restriction,
          portability, or object to processing based on legitimate interest. Write to{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we will respond within one month. You also have the right
          to complain to your national data protection authority.
        </p>

        <h2>Security</h2>
        <p>
          Passwords are stored as PBKDF2-SHA256 hashes with a per-account salt. Sessions are opaque server-side tokens
          that can be revoked. All traffic is served over HTTPS. Uploaded files are private objects, served only through
          an authenticated route.
        </p>

        <h2>Children</h2>
        <p>The service is intended for businesses and is not directed at children under 16.</p>

        <h2>Changes</h2>
        <p>
          We will post any update to this policy on this page. Material changes affecting existing clients are notified
          by email.
        </p>
      </div>
    </div>
  );
}
