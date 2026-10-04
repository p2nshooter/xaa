import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { SEO } from '@/content/seo-copy';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/disclaimer', copy: SEO.disclaimer });
}

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-prose2 px-4 py-14">
      <Breadcrumbs trail={[{ k: 'footer.disclaimer' }]} className="!px-0 !pt-0 mb-6" />
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Legal</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Disclaimer</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <p className="mt-4 text-sm text-steel-500">Last reviewed: 4 October 2026.</p>

      <div className="article-body mt-8">
        <p>
          {SITE.name} publishes guides, explanations of its services and articles about building websites and digital
          products. This page explains the limits of that information.
        </p>

        <h2>General information, not a quote or professional advice</h2>
        <p>
          Guides, price ranges and timelines on the public site describe typical projects. They are not a quotation and
          not legal, tax, accounting or security advice. A project&apos;s real scope, cost and schedule are set only in a
          written proposal agreed with you. For legal or regulatory questions about your own project, such as privacy
          compliance or accessibility obligations, consult a qualified professional.
        </p>

        <h2>Code and technical examples</h2>
        <p>
          Code snippets and configuration examples are provided for learning, as-is and without warranty. Test them in a
          safe environment before using them in production, and check the official documentation for the versions you
          use, because tools change quickly.
        </p>

        <h2>Security</h2>
        <p>
          Security guidance on the site is educational and is not a security audit. No website can be guaranteed to be
          free of vulnerabilities; follow current best practice and your organization&apos;s policies.
        </p>

        <h2>Third-party services and trademarks</h2>
        <p>
          Product names, platforms and trademarks mentioned belong to their owners and are used only to identify them.
          A mention is not an endorsement, and {SITE.name} is not responsible for changes to third-party services.
        </p>

        <h2>Accuracy</h2>
        <p>
          We review our pages regularly, but information can become outdated. If you spot an error, please{' '}
          <a href="/contact">tell us</a>.
        </p>

        <h2>Advertising</h2>
        <p>
          Ads on public pages are served by Google AdSense. We do not choose individual advertisers and are not
          responsible for their offers.
        </p>
      </div>
    </div>
  );
}
