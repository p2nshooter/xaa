import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { SEO } from '@/content/seo-copy';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/editorial-policy', copy: SEO.editorial });
}

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-prose2 px-4 py-14">
      <Breadcrumbs trail={[{ k: 'footer.editorial' }]} className="!px-0 !pt-0 mb-6" />
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Editorial</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Editorial policy</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <p className="mt-4 text-sm text-steel-500">Last reviewed: 4 October 2026.</p>

      <div className="article-body mt-8">
        <p>
          Besides building websites, {SITE.name} publishes guides that explain how projects work, what each part of our
          client portal does and how to make good decisions about a website. This page sets out the standards behind
          that writing.
        </p>

        <h2>Our standards</h2>
        <ul>
          <li><strong>Useful first:</strong> every guide answers a real question a client or reader asks.</li>
          <li><strong>Accurate:</strong> technical claims are checked against official documentation and tested where possible.</li>
          <li><strong>Honest:</strong> we explain trade-offs and limits, including when a simpler or cheaper option is enough.</li>
          <li><strong>Plain language:</strong> technical terms are explained the first time they appear.</li>
          <li><strong>Clearly labeled:</strong> pages that describe our own services say so; guides are written to be useful whether or not you hire us.</li>
        </ul>

        <h2>Sources</h2>
        <ul>
          <li>Official documentation and specifications for the technologies we use.</li>
          <li>Recognized standards for accessibility, security and the web platform.</li>
          <li>Our own experience delivering projects, described without exaggeration.</li>
        </ul>

        <h2>Review and corrections</h2>
        <p>
          Guides are written and reviewed by our team before publication and updated when tools or rules change. When we
          find a mistake, we correct it promptly. Report errors to{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or through our <a href="/contact">contact page</a>.
        </p>

        <h2>Advertising</h2>
        <p>
          Public pages may carry ads served by Google AdSense, kept separate from editorial content. Advertisers have no
          influence on what we write.
        </p>
      </div>
    </div>
  );
}
