import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
export const metadata: Metadata = { title: 'Privacy Policy', description: `Privacy policy for ${SITE.name}`, alternates: { canonical: '/privacy' } };
export default function PrivacyPage() {
  const email = `hello@${SITE.domain}`;
  return (
    <div className="mx-auto max-w-prose2 px-4 py-12">
      <h1 className="font-serif text-3xl font-black">Privacy Policy</h1>
      <div className="ornament-rule mt-4 max-w-sm" />
      <div className="article-body mt-6">
        <p>Reading {SITE.name} requires no account and no personal information. We do not ask for your name, email or
          phone number, and we do not sell personal data.</p>
        <h2>Analytics</h2>
        <p>We count anonymous page views to understand which articles are useful. This measurement is cookieless and does
          not identify you personally.</p>
        <h2>Cookies and advertising</h2>
        <p>This site may show ads via Google AdSense. Google and its partners may use cookies to serve ads based on your
          prior visits to this and other websites. You can opt out of personalised advertising in your{' '}
          <a href="https://www.google.com/settings/ads" className="text-gold-600 underline">Google Ad Settings</a>. Learn
          more about{' '}
          <a href="https://policies.google.com/technologies/ads" className="text-gold-600 underline">how Google uses cookies in advertising</a>.
          Questions: <a href={`mailto:${email}`} className="text-gold-600 underline">{email}</a>.</p>
      </div>
    </div>
  );
}
