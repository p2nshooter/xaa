import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
export const metadata: Metadata = { title: 'About', description: `About ${SITE.name}`, alternates: { canonical: '/about' } };
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-prose2 px-4 py-12">
      <h1 className="font-serif text-3xl font-black">About {SITE.name}</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <div className="article-body mt-6">
        <p>{SITE.name} is an independent editorial project with one goal: making {SITE.tagline.toLowerCase()} genuinely
          understandable. We publish clear, jargon-free guides and explainers, written to be useful to real people
          making real decisions — free to read, with no registration.</p>
        <h2>Our principles</h2>
        <p>We sell no financial products, take no commissions, and make no promises of returns or riches. Every article
          is written originally by our editorial team and is educational in nature. Where rules, rates or figures change
          over time, we remind readers to verify current details with official sources and, where it matters, a
          qualified professional.</p>
        <h2>How we are funded</h2>
        <p>{SITE.name} is supported by advertising, shown in a limited, clearly-marked and reader-friendly way. Ads never
          influence our editorial judgement, and we keep them out of the way of the reading experience.</p>
      </div>
    </div>
  );
}
