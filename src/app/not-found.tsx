import Link from 'next/link';
import type { Metadata } from 'next';
import { PACKAGES, priceRange } from '@/content/packages';
import { SITE } from '@/lib/site';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

type Copy = {
  eyebrow: string; title: string; lead: string;
  packages: string; process: string; contact: string;
  clientNote0: string; clientLink: string; clientNote1: string; archiveLink: string; clientNote2: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    eyebrow: 'Error 404', title: "That page isn't here",
    lead: 'The link may be out of date, or the address mistyped. Nothing is broken on your side — here is where most people are heading.',
    packages: 'Packages & pricing', process: 'How a project runs', contact: 'Contact the studio',
    clientNote0: 'Already a client? Your build is in the ', clientLink: 'client portal',
    clientNote1: '. Looking for the old football writing? It is still published in the ', archiveLink: 'archive', clientNote2: '.',
  },
  es: {
    eyebrow: 'Error 404', title: 'Esa página no está aquí',
    lead: 'El enlace puede estar desactualizado, o la dirección mal escrita. Nada está roto de tu lado — aquí es a donde va la mayoría.',
    packages: 'Paquetes y precios', process: 'Cómo funciona un proyecto', contact: 'Contactar al estudio',
    clientNote0: '¿Ya eres cliente? Tu desarrollo está en el ', clientLink: 'portal del cliente',
    clientNote1: '. ¿Buscas los viejos artículos de fútbol? Siguen publicados en el ', archiveLink: 'archivo', clientNote2: '.',
  },
  id: {
    eyebrow: 'Error 404', title: 'Halaman itu tidak ada di sini',
    lead: 'Tautannya mungkin kedaluwarsa, atau alamatnya salah ketik. Tak ada yang rusak di sisi Anda — inilah tujuan kebanyakan orang.',
    packages: 'Paket & harga', process: 'Cara sebuah proyek berjalan', contact: 'Hubungi studio',
    clientNote0: 'Sudah jadi klien? Build Anda ada di ', clientLink: 'portal klien',
    clientNote1: '. Mencari tulisan sepak bola lama? Masih diterbitkan di ', archiveLink: 'arsip', clientNote2: '.',
  },
};

export default async function NotFound() {
  const c = pick(await getLang(), COPY);
  const popular = PACKAGES.filter((p) => p.popular);

  return (
    <div className="hero relative overflow-hidden">
      <div className="hero-grid absolute inset-0" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">{c.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-steel-500">{c.lead}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/services" className="btn btn-primary">{c.packages}</Link>
          <Link href="/process" className="btn btn-ghost">{c.process}</Link>
          <Link href="/contact" className="btn btn-ghost">{c.contact}</Link>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          {popular.map((p) => (
            <Link key={p.slug} href={`/services/${p.slug}`} className="premium-card block p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">{p.code}</p>
              <p className="mt-1 font-display text-base font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-steel-500">{priceRange(p.priceMin, p.priceMax, p.openEnded)} · {p.timeline}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-steel-500">
          {c.clientNote0}<Link href="/portal" className="text-gold-500 underline">{c.clientLink}</Link>
          {c.clientNote1}<Link href={SITE.magazine.path} className="text-gold-500 underline">{c.archiveLink}</Link>{c.clientNote2}
        </p>
      </div>
    </div>
  );
}
