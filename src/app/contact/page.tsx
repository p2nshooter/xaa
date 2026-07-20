import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
export const metadata: Metadata = { title: 'Contact', description: `Contact ${SITE.name}`, alternates: { canonical: '/contact' } };
export default function ContactPage() {
  const email = `hello@${SITE.domain}`;
  return (
    <div className="mx-auto max-w-prose2 px-4 py-12">
      <h1 className="font-serif text-3xl font-black">Contact us</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <div className="article-body mt-6">
        <p>Have a correction, a topic request, or a partnership enquiry? We read every message and usually reply within
          a few days.</p>
        <p><strong>Email:</strong> <a href={`mailto:${email}`} className="text-gold-600 underline">{email}</a></p>
        <p>Please note that we publish general educational information only and cannot provide personalised financial,
          insurance, tax or legal advice.</p>
      </div>
    </div>
  );
}
