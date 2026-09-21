import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm, AdminAccessLogin } from '@/components/forms/AuthForms';
import { currentUser } from '@/server/auth';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

type Copy = { eyebrow: string; title: string; lead: string; secNote0: string; secLink: string; secNote1: string };
const COPY: Record<Lang, Copy> = {
  en: {
    eyebrow: 'Client portal', title: 'Sign in', lead: 'Your projects, milestones, files and invoices.',
    secNote0: 'We will never email you asking for your password or send you a payment address. Payment details appear only on your project page here. ',
    secLink: 'More on payment security', secNote1: '.',
  },
  es: {
    eyebrow: 'Portal del cliente', title: 'Iniciar sesión', lead: 'Tus proyectos, hitos, archivos y facturas.',
    secNote0: 'Nunca te enviaremos un email pidiendo tu contraseña ni una dirección de pago. Los datos de pago aparecen solo en tu página de proyecto aquí. ',
    secLink: 'Más sobre seguridad de pagos', secNote1: '.',
  },
  id: {
    eyebrow: 'Portal klien', title: 'Masuk', lead: 'Proyek, termin, berkas, dan faktur Anda.',
    secNote0: 'Kami tak pernah mengirim email meminta kata sandi Anda atau mengirim alamat pembayaran. Detail pembayaran hanya muncul di halaman proyek Anda di sini. ',
    secLink: 'Selengkapnya soal keamanan pembayaran', secNote1: '.',
  },
};

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the XAA client portal to see your project progress, milestones and invoices.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentUser()) redirect('/portal');
  const { next } = await searchParams;
  const lang = await getLang();
  const c = pick(lang, COPY);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">{c.eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">{c.title}</h1>
      <p className="mt-3 text-sm text-steel-500">{c.lead}</p>
      <div className="mt-8">
        <LoginForm next={next && next.startsWith('/') ? next : '/portal'} lang={lang} />
      </div>
      <div className="panel mt-6 border-l-4 border-l-[color:var(--accent)] p-5">
        <p className="text-sm text-steel-500">
          {c.secNote0}<Link href="/payments" className="text-gold-500 underline">{c.secLink}</Link>{c.secNote1}
        </p>
      </div>

      {/* Studio access is not advertised: tap the mark five times, quickly, to
          reveal the admin sign-in. Nothing here grants admin — the account is
          seeded in the database and this is only how the owner reaches it. */}
      <AdminAccessLogin lang={lang} />
    </div>
  );
}
