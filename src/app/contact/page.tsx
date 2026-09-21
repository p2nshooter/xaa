import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { SectionHead } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Send XAA a brief. We reply within one business day with the package your project fits, a realistic price and a delivery estimate.`,
  alternates: { canonical: '/contact' },
};

export const dynamic = 'force-dynamic';

type Copy = {
  chip: string; h1: string; heroLead: string;
  briefEyebrow: string; briefTitle: string;
  directTitle: string; newProjects: string; general: string; billing: string;
  existing0: string; existingLink: string; existing1: string;
  decidedTitle: string; decidedBody: string; openBtn: string; compareBtn: string;
  secTitle: string; secBody: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Contact', h1: 'Tell us what you need built',
    heroLead: 'Send the brief and we come back with the package it lands in, a realistic number, a delivery estimate, and what we would leave out of version one. If your project is not a fit, we will say that too.',
    briefEyebrow: 'Project brief', briefTitle: 'Start here',
    directTitle: 'Direct contact', newProjects: 'New projects', general: 'General', billing: 'Billing & payments',
    existing0: 'Existing client? Everything about your build — progress, invoices, files — lives in your ',
    existingLink: 'project portal', existing1: '.',
    decidedTitle: 'Already decided?',
    decidedBody: 'You do not need to talk to us first. Open a project, and you will see the exact milestone amounts before anything is due.',
    openBtn: 'Open a project', compareBtn: 'Compare packages',
    secTitle: 'A security note',
    secBody: 'We never send wallet addresses or payment details by email. Payment information appears only inside your signed-in project page.',
  },
  es: {
    chip: 'Contacto', h1: 'Cuéntanos qué necesitas construir',
    heroLead: 'Envía el brief y volvemos con el paquete en el que encaja, una cifra realista, una fecha estimada y qué dejaríamos fuera de la versión uno. Si tu proyecto no encaja, también te lo diremos.',
    briefEyebrow: 'Brief del proyecto', briefTitle: 'Empieza aquí',
    directTitle: 'Contacto directo', newProjects: 'Nuevos proyectos', general: 'General', billing: 'Facturación y pagos',
    existing0: '¿Ya eres cliente? Todo sobre tu desarrollo — avance, facturas, archivos — vive en tu ',
    existingLink: 'portal de proyecto', existing1: '.',
    decidedTitle: '¿Ya lo tienes decidido?',
    decidedBody: 'No hace falta que hables con nosotros primero. Abre un proyecto y verás los importes exactos de cada hito antes de que venza nada.',
    openBtn: 'Abrir un proyecto', compareBtn: 'Comparar paquetes',
    secTitle: 'Una nota de seguridad',
    secBody: 'Nunca enviamos direcciones de wallet ni datos de pago por email. La información de pago aparece solo dentro de tu página de proyecto con sesión iniciada.',
  },
  id: {
    chip: 'Kontak', h1: 'Beri tahu kami apa yang perlu dibangun',
    heroLead: 'Kirim brief-nya dan kami kembali dengan paket yang cocok, angka realistis, perkiraan waktu, dan apa yang akan kami tinggalkan dari versi satu. Jika proyek Anda tak cocok, kami akan bilang juga.',
    briefEyebrow: 'Brief proyek', briefTitle: 'Mulai di sini',
    directTitle: 'Kontak langsung', newProjects: 'Proyek baru', general: 'Umum', billing: 'Penagihan & pembayaran',
    existing0: 'Sudah jadi klien? Semua tentang build Anda — progres, faktur, berkas — ada di ',
    existingLink: 'portal proyek Anda', existing1: '.',
    decidedTitle: 'Sudah memutuskan?',
    decidedBody: 'Anda tak perlu bicara dengan kami dulu. Buka proyek, dan Anda akan melihat jumlah tiap termin persis sebelum ada yang jatuh tempo.',
    openBtn: 'Buka proyek', compareBtn: 'Bandingkan paket',
    secTitle: 'Catatan keamanan',
    secBody: 'Kami tak pernah mengirim alamat wallet atau detail pembayaran via email. Informasi pembayaran hanya muncul di dalam halaman proyek Anda saat masuk.',
  },
};

export default async function ContactPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <span className="chip">{c.chip}</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">{c.h1}</h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600">{c.heroLead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <SectionHead eyebrow={c.briefEyebrow} title={c.briefTitle} />
            <div className="mt-6">
              <EnquiryForm lang={lang} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel p-6">
              <h2 className="font-display text-lg font-extrabold">{c.directTitle}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">{c.newProjects}</dt>
                  <dd><a href={`mailto:${SITE.salesEmail}`} className="text-gold-500 underline">{SITE.salesEmail}</a></dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">{c.general}</dt>
                  <dd><a href={`mailto:${SITE.email}`} className="text-gold-500 underline">{SITE.email}</a></dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">{c.billing}</dt>
                  <dd><a href={`mailto:${SITE.billingEmail}`} className="text-gold-500 underline">{SITE.billingEmail}</a></dd>
                </div>
              </dl>
              <p className="hint mt-4">
                {c.existing0}
                <Link href="/portal" className="text-gold-500 underline">{c.existingLink}</Link>{c.existing1}
              </p>
            </div>

            <div className="panel p-6">
              <h2 className="font-display text-lg font-extrabold">{c.decidedTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{c.decidedBody}</p>
              <Link href="/portal/new" className="btn btn-primary btn-sm mt-4 w-full">{c.openBtn}</Link>
              <Link href="/services" className="btn btn-ghost btn-sm mt-2 w-full">{c.compareBtn}</Link>
            </div>

            <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
              <h2 className="font-bold">{c.secTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{c.secBody}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
