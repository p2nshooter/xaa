import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
export const metadata: Metadata = { title: 'Terms of Use', description: `Terms of use for ${SITE.name}`, alternates: { canonical: '/terms' } };
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-prose2 px-4 py-12">
      <h1 className="font-serif text-3xl font-black">Terms of Use</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <div className="article-body mt-6">
        <p>All content on {SITE.name} is general educational information only. It is not personalised financial,
          insurance, tax or legal advice, and it is not an offer of any product. Rules, rates and figures change over
          time; verify current details with official sources and consult a qualified professional before acting.</p>
        <p>Content is copyright {SITE.domain}. Quotation with attribution and a link is welcome; wholesale republication
          is not. We provide the site "as is" and are not liable for decisions made on the basis of general information
          published here.</p>
      </div>
    </div>
  );
}
