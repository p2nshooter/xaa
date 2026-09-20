import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of engagement',
  description: `The terms under which ${SITE.name} accepts, builds and delivers website and platform projects — payments, timelines, ownership, cancellation and liability.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-prose2 px-4 py-14">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Legal</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Terms of engagement</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <p className="mt-4 text-sm text-steel-500">
        These terms govern development work commissioned from {SITE.name} ({SITE.domain}) and use of the client portal.
        A signed proposal or an accepted quote in the portal incorporates them. Where a separately signed contract
        conflicts with this page, that contract prevails.
      </p>

      <div className="article-body mt-8">
        <h2>1. Quotes and scope</h2>
        <p>
          Published package prices are ranges based on European market rates and are indicative until a scope review is
          completed. After the review we confirm a single contract value in writing. That figure is fixed for the agreed
          scope; work outside it is quoted separately as a change before it begins.
        </p>
        <p>
          Prices are stated in euros and exclude VAT where VAT applies. EU business clients who supply a valid VAT
          number are invoiced under the reverse-charge procedure. Clients outside the EU are invoiced without EU VAT.
        </p>

        <h2>2. Payment schedule</h2>
        <p>Unless a proposal states otherwise, every build is paid in three milestones of the contract value:</p>
        <p>
          <strong>10% booking deposit</strong>, due at order. It reserves a production slot and opens the concept upload.
          <br />
          <strong>40% production payment</strong>, due once scope is agreed, bringing the total to 50%. It starts the
          build.
          <br />
          <strong>50% settlement</strong>, due when recorded progress reaches 75%. Build progress is capped at 80% until
          it is received.
        </p>
        <p>
          Payment is accepted in USDT (TRC20, ERC20 or BEP20) or by PayPal in euros. Network and sender fees are borne
          by the client; our published prices are net of the PayPal commercial fee. Payments are confirmed within one
          business day of receipt, and confirmation is recorded automatically on the project&apos;s activity log.
        </p>
        <p>
          Payment details are published only inside the signed-in client portal. We do not send wallet addresses or
          payment instructions by email or messaging, and we will never ask you to redirect a payment.
        </p>

        <h2>3. Timelines</h2>
        <p>
          The completion estimate is generated when the client&apos;s concept material is received and is based on the
          package timeline. It assumes the client supplies content, feedback and approvals promptly. Delays caused by
          outstanding content, extended review cycles, added scope, or third parties (payment providers, registrars,
          identity checks, external APIs) extend the estimate by the period of the delay.
        </p>
        <p>
          Where a delay originates with us, we record it on the activity log and do not invoice a milestone that has not
          been reached.
        </p>

        <h2>4. Client obligations</h2>
        <p>
          The client provides the brief and concept material, brand assets, content, product data and any required
          third-party account access, and nominates one person authorised to approve work. The client warrants that all
          material supplied is lawful and that the client holds the rights to use it.
        </p>

        <h2>5. Acceptance and delivery</h2>
        <p>
          At 100% progress we deliver the agreed scope, deploy it, and hand over source code, design files, admin
          accounts and infrastructure access. The client has fourteen days from handover to report defects against the
          agreed scope; we correct them at no charge. Requests for new functionality during that period are change
          requests, not defects.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          On receipt of the final settlement, ownership of the bespoke code, designs and content produced for the project
          transfers to the client. Third-party components remain under their own licences, and we retain ownership of
          our pre-existing tooling, libraries and internal frameworks, for which the client receives a perpetual,
          non-exclusive licence to use them within the delivered work.
        </p>
        <p>
          Unless the client asks otherwise in writing, we may describe the work and show it in our portfolio.
        </p>

        <h2>7. Cancellation and refunds</h2>
        <p>
          Either party may cancel in writing. If the client cancels before the concept review, the deposit is refunded
          less any work already performed. If the client cancels during production, the client is billed for the
          progress recorded on the activity log at the point of cancellation, and any balance is refunded on the rail it
          was paid with. Work already completed and paid for is released to the client.
        </p>
        <p>
          If we fail to deliver the agreed scope, unearned milestones are returned in full.
        </p>

        <h2>8. Setup and maintenance</h2>
        <p>
          One-time setup and monthly care plans are separate services with their own fees, and neither is required to
          commission a build. Care plans are billed monthly in advance and may be cancelled by either party with thirty
          days&apos; notice. Cancelling a care plan does not affect ownership of anything already delivered.
        </p>
        <p>
          Unused hours in a care plan do not carry over. Work beyond the monthly allowance is quoted before it starts.
        </p>

        <h2>9. Hosting, third parties and pass-through costs</h2>
        <p>
          Domain registration, hosting, third-party licences and subscriptions, payment gateway fees, external API usage
          and paid assets are charged at cost and are the client&apos;s ongoing responsibility after handover. We are not
          responsible for the availability, pricing or policies of third-party services.
        </p>

        <h2>10. Confidentiality and data</h2>
        <p>
          Material uploaded to the portal is treated as confidential, is stored privately, and is accessible only to the
          client and the delivery team. We process personal data as described in our{' '}
          <Link href="/privacy">privacy policy</Link>. Where we process personal data on the client&apos;s behalf, a data
          processing agreement is available on request.
        </p>

        <h2>11. Warranty and liability</h2>
        <p>
          We warrant that work is performed with reasonable skill and care and conforms to the agreed scope. To the
          fullest extent permitted by law, our total liability arising from an engagement is limited to the fees paid by
          the client for that engagement, and we are not liable for indirect or consequential loss, loss of profit, loss
          of data, or business interruption.
        </p>
        <p>
          No guarantee is given in respect of search engine rankings, traffic volumes, conversion rates or commercial
          outcomes.
        </p>

        <h2>12. Acceptable use</h2>
        <p>
          We do not build systems whose purpose is to deceive users, to collect personal data without a lawful basis, or
          to evade regulation applicable in the market where they operate. We may decline or discontinue work that falls
          into those categories, refunding any unearned milestone.
        </p>

        <h2>13. Governing law</h2>
        <p>
          These terms are governed by Spanish law, and the courts of Spain have jurisdiction, without prejudice to any
          mandatory consumer protection rights the client may enjoy in their country of residence.
        </p>

        <h2>14. Changes</h2>
        <p>
          We may update these terms for future engagements. The version in force when a project is opened continues to
          govern that project.
        </p>

        <h2>15. Editorial archive</h2>
        <p>
          The articles published under <Link href={SITE.magazine.path}>{SITE.magazine.name}</Link> are independent
          editorial content, provided for general information only, and carry advertising. Nothing in that archive is
          professional advice, and it forms no part of any development engagement.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </div>
  );
}
