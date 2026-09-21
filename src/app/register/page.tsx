import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/forms/AuthForms';
import { currentUser } from '@/server/auth';
import { localisedStages } from '@/content/process';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Register for the XAA client portal — free, and nothing is charged until you open a project and choose to pay the deposit.',
  alternates: { canonical: '/register' },
};

export const dynamic = 'force-dynamic';

type Copy = { eyebrow: string; title: string; lead: string; already: string; signIn: string; nextTitle: string; freeNote: string };
const COPY: Record<Lang, Copy> = {
  en: {
    eyebrow: 'Client portal', title: 'Create your account',
    lead: 'One account gives you the order form, your milestone schedule, the concept upload, a live progress bar and every invoice in one place.',
    already: 'Already registered? ', signIn: 'Sign in', nextTitle: 'What happens next',
    freeNote: 'Registration is free. The first payment is the 10% booking deposit, and you choose when to make it.',
  },
  es: {
    eyebrow: 'Portal del cliente', title: 'Crea tu cuenta',
    lead: 'Una cuenta te da el formulario de pedido, tu calendario de hitos, la subida del concepto, una barra de progreso en vivo y cada factura en un solo lugar.',
    already: '¿Ya te registraste? ', signIn: 'Inicia sesión', nextTitle: 'Qué pasa después',
    freeNote: 'El registro es gratis. El primer pago es el 10% de depósito de reserva, y tú eliges cuándo hacerlo.',
  },
  id: {
    eyebrow: 'Portal klien', title: 'Buat akun Anda',
    lead: 'Satu akun memberi Anda formulir pesanan, jadwal termin, unggah konsep, bar progres langsung, dan tiap faktur di satu tempat.',
    already: 'Sudah terdaftar? ', signIn: 'Masuk', nextTitle: 'Apa yang terjadi selanjutnya',
    freeNote: 'Pendaftaran gratis. Pembayaran pertama adalah DP pemesanan 10%, dan Anda memilih kapan membayarnya.',
  },
};

export default async function RegisterPage() {
  if (await currentUser()) redirect('/portal');
  const lang = await getLang();
  const c = pick(lang, COPY);
  const stages = localisedStages(lang);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_.85fr] lg:items-start">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">{c.eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{c.title}</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-steel-500">{c.lead}</p>
          <div className="mt-8">
            <RegisterForm lang={lang} />
          </div>
          <p className="mt-4 text-sm text-steel-500">
            {c.already}<Link href="/login" className="text-gold-500 underline">{c.signIn}</Link>.
          </p>
        </div>

        <aside className="panel-dark p-7">
          <h2 className="font-display text-xl font-extrabold">{c.nextTitle}</h2>
          <ol className="mt-5 space-y-4">
            {stages.map((s, i) => (
              <li key={s.key} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-extrabold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-xs text-ivory-100/65">{s.blurb}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-white/15 pt-4 text-xs text-ivory-100/60">{c.freeNote}</p>
        </aside>
      </div>
    </div>
  );
}
