import { SITE } from '@/lib/site';
import { PACKAGES, SETUP_PLANS, CARE_PLANS, eur, priceRange } from '@/content/packages';
import { TEMPLATES } from '@/content/templates';

/**
 * /llms.txt — a plain-Markdown map of the site for AI assistants and
 * generative search (https://llmstxt.org). Built from the same catalogue the
 * pages render, so a price quoted by an assistant is the price on the site.
 */
export const dynamic = 'force-static';

export function GET() {
  const u = (p: string) => `${SITE.url}${p}`;
  const lines = [
    `# ${SITE.name} (${SITE.domain})`,
    '',
    `> ${SITE.description}`,
    '',
    `${SITE.name} is the web development studio of PT AXTO DIGITAL GLOBAL (Bekasi, Indonesia), serving clients in Europe and internationally. Contracts are in euros; payment is by USDT (TRC20, ERC20, BEP20) or PayPal, in three milestones: 10% deposit, 40% at production start, 50% at 75–80% progress. The site is available in English, Spanish (?lang=es) and Indonesian (?lang=id).`,
    '',
    '## Key pages',
    `- [Services & pricing](${u('/services')}): ten development packages with published price ranges`,
    `- [Ready-made SaaS templates](${u('/templates')}): production-ready SaaS with full source code, database and setup guide`,
    `- [How a project runs](${u('/process')}): the milestone process from deposit to handover`,
    `- [Setup & AI backup/recovery](${u('/care')}): one-time setup and a self-served backup and recovery system`,
    `- [Payments](${u('/payments')}): USDT and PayPal, milestone schedule`,
    `- [Portfolio](${u('/portfolio')}): systems the studio has built and runs`,
    `- [Election & civic systems](${u('/election-systems')}): voter-roll verification and vote tallying`,
    `- [FAQ](${u('/faq')}): pricing, timelines, ownership and payments`,
    `- [Company profile](${u('/company')}): legal entity, leadership and registered activities`,
    `- [Contact](${u('/contact')}): send a brief; reply within one business day`,
    '',
    '## Development packages',
    ...PACKAGES.map((p) => `- [${p.name}](${u(`/services/${p.slug}`)}) — ${priceRange(p.priceMin, p.priceMax, p.openEnded)}, ${p.timeline}: ${p.summary.replace(/\s+/g, ' ').trim()}`),
    '',
    '## One-time setup',
    ...SETUP_PLANS.map((p) => `- ${p.name} — ${p.priceMax ? `${eur(p.price)}–${eur(p.priceMax)}` : eur(p.price)}: ${p.blurb}`),
    '',
    '## AI backup & recovery (one-time install, no monthly SLA)',
    ...CARE_PLANS.map((p) => `- ${p.name} — ${p.priceMax ? `${eur(p.price)}–${eur(p.priceMax)}` : eur(p.price)}: ${p.blurb}`),
    '',
    '## Ready-made SaaS templates',
    ...TEMPLATES.map((t) => `- [${t.name}](${u(`/templates/${t.slug}`)}) — ${t.priceMax ? `${eur(t.price)}–${eur(t.priceMax)}` : eur(t.price)}: ${t.summary}`),
    '',
    '## Contact',
    `- Email: ${SITE.email}`,
    `- Sales: ${SITE.salesEmail}`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
