import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TEMPLATES, getTemplate, TIER_LABEL } from '@/content/templates';
import { eur } from '@/content/packages';
import { SectionHead, CtaBand } from '@/components/Studio';
import { BuyButton, BundleUploadForm } from '@/components/forms/StoreForms';
import { currentUser } from '@/server/auth';
import { getBundleMeta } from '@/server/store';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { jsonLdHtml } from '@/lib/json-ld';
import { SITE } from '@/lib/site';
import { pageMetadata, clip } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { demoFor } from '@/content/template-demos';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  const p = t.priceMax ? `${eur(t.price)}–${eur(t.priceMax)}` : eur(t.price);
  const title = `${t.name} SaaS template — ${p}`;
  return pageMetadata({
    path: `/templates/${t.slug}`,
    type: 'website',
    copy: {
      en: { title, description: clip(`${t.summary} Full source code, database and setup guide in one download.`) },
      es: { title: `Plantilla SaaS ${t.name} — ${p}`, description: clip(`${t.summary} Código fuente completo, base de datos y guía de instalación en una descarga.`) },
      id: { title: `Template SaaS ${t.name} — ${p}`, description: clip(`${t.summary} Source code lengkap, database dan panduan setup dalam satu unduhan.`) },
    },
  });
}

type Copy = {
  store: string; buy: string; demo: string; noDemo: string; price: string;
  featTitle: string; incTitle: string; rebrandTitle: string; rebrandLead: string;
  bundleReady: string; bundlePrep: string; notify: string; howTitle: string; how: string[];
  ctaTitle: string; ctaLead: string;
  admin: string; account: string; email: string; password: string; accountNote: string;
  galleryEyebrow: string; galleryTitle: string; galleryLead: string; phone: string;
};
const COPY: Record<Lang, Copy> = {
  en: {
    store: 'SaaS templates', buy: 'Buy — get the bundle', demo: 'Live demo', noDemo: 'Demo on request', price: 'One-time price',
    featTitle: 'What it does', incTitle: 'What you get in the bundle', rebrandTitle: 'Make it yours', rebrandLead: 'After download, these are the only things you change to rebrand it.',
    bundleReady: 'Bundle ready — download unlocks after payment', bundlePrep: 'In development — not on sale yet. It goes on sale the day its bundle is finished and tested.', notify: 'Tell me when it is ready',
    howTitle: 'How buying works', how: ['Click buy — an order opens in your portal.', 'Pay the one-time price (USDT, PayPal or bank).', 'We confirm the payment.', 'Download the single ZIP bundle — full source, database and setup guide.'],
    ctaTitle: 'Want it customised first?', ctaLead: 'We can rebrand, extend or deploy it for you as a fixed-price add-on. Tell us what you need.',
    admin: 'Open the admin console', account: 'Demo account', email: 'Email', password: 'Password',
    accountNote: 'Already filled in on the sign-in page. The demo runs in your browser with sample data; nothing you do is sent anywhere.',
    galleryEyebrow: 'Look inside', galleryTitle: 'Every menu and dashboard', galleryLead: 'Short clips recorded from the live demo, so you can see each screen before you buy.', phone: 'Phone',
  },
  es: {
    store: 'Plantillas SaaS', buy: 'Comprar — obtener el paquete', demo: 'Demo en vivo', noDemo: 'Demo a petición', price: 'Precio único',
    featTitle: 'Qué hace', incTitle: 'Qué incluye el paquete', rebrandTitle: 'Hazlo tuyo', rebrandLead: 'Tras descargar, esto es lo único que cambias para renombrarlo.',
    bundleReady: 'Paquete listo — la descarga se desbloquea tras el pago', bundlePrep: 'En desarrollo — aún no está a la venta. Sale a la venta el día en que su paquete esté terminado y probado.', notify: 'Avísame cuando esté lista',
    howTitle: 'Cómo comprar', how: ['Haz clic en comprar — se abre un pedido en tu portal.', 'Paga el precio único (USDT, PayPal o banco).', 'Confirmamos el pago.', 'Descarga el único paquete ZIP — código, base de datos y guía.'],
    ctaTitle: '¿Lo quieres personalizado antes?', ctaLead: 'Podemos renombrarlo, ampliarlo o desplegarlo por ti como un adicional a precio fijo. Dinos qué necesitas.',
    admin: 'Abrir la consola de administración', account: 'Cuenta de demostración', email: 'Correo', password: 'Contraseña',
    accountNote: 'Ya viene rellenada en la página de acceso. La demo funciona en tu navegador con datos de ejemplo; nada de lo que hagas se envía.',
    galleryEyebrow: 'Por dentro', galleryTitle: 'Cada menú y panel', galleryLead: 'Clips cortos grabados de la demo en vivo, para que veas cada pantalla antes de comprar.', phone: 'Móvil',
  },
  id: {
    store: 'Template SaaS', buy: 'Beli — dapatkan bundel', demo: 'Demo langsung', noDemo: 'Demo sesuai permintaan', price: 'Harga sekali bayar',
    featTitle: 'Apa fungsinya', incTitle: 'Yang Anda dapat dalam bundel', rebrandTitle: 'Jadikan milik Anda', rebrandLead: 'Setelah diunduh, ini saja yang Anda ubah untuk mengganti merek.',
    bundleReady: 'Bundel siap — unduhan terbuka setelah pembayaran', bundlePrep: 'Masih dikembangkan — belum dijual. Mulai dijual pada hari bundelnya selesai dan lolos uji.', notify: 'Kabari saya saat siap',
    howTitle: 'Cara membeli', how: ['Klik beli — pesanan terbuka di portal Anda.', 'Bayar harga sekali (USDT, PayPal, atau bank).', 'Kami konfirmasi pembayaran.', 'Unduh satu bundel ZIP — kode penuh, database, dan panduan setup.'],
    ctaTitle: 'Ingin dikustomisasi dulu?', ctaLead: 'Kami bisa mengganti merek, memperluas, atau men-deploy-kannya untuk Anda sebagai tambahan harga tetap. Beri tahu kebutuhan Anda.',
    admin: 'Buka konsol admin', account: 'Akun demo', email: 'Email', password: 'Kata sandi',
    accountNote: 'Sudah terisi di halaman masuk. Demo berjalan di browser Anda dengan data contoh; tidak ada yang dikirim ke mana pun.',
    galleryEyebrow: 'Lihat isinya', galleryTitle: 'Setiap menu dan dasbor', galleryLead: 'Klip singkat yang direkam dari demo langsung, supaya Anda bisa melihat setiap layar sebelum membeli.', phone: 'Ponsel',
  },
};

export default async function TemplateDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) notFound();
  const [user, bundle, lang] = await Promise.all([currentUser(), getBundleMeta(slug), getLang()]);
  const c = pick(lang, COPY);
  const isAdmin = user?.role === 'admin';
  const priceLabel = t.priceMax ? `${eur(t.price)} – ${eur(t.priceMax)}` : eur(t.price);
  const demo = demoFor(t.slug);

  return (
    <>
      <Breadcrumbs trail={[{ k: 'nav.templates', href: '/templates' }, { label: t.name }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml({
        '@context': 'https://schema.org', '@type': 'Product', name: t.name, description: t.summary,
        offers: { '@type': 'Offer', price: t.price, priceCurrency: 'EUR', url: `${SITE.url}/templates/${t.slug}`, availability: bundle ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
        ...(demo ? { image: demo.shots.map((x) => `${SITE.url}${x.poster}`) } : {}),
      }) }} />

      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <nav className="text-xs text-slate-500">
            <Link href="/templates" className="hover:text-gold-500">{c.store}</Link>
            <span className="mx-2">/</span><span>{t.name}</span>
          </nav>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <span className="chip">{t.category} · {TIER_LABEL[t.tier]}</span>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">{t.name}</h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">{t.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {t.stack.map((s) => <span key={s} className="mk-chip">{s}</span>)}
              </div>
            </div>

            <aside className="panel h-fit p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-steel-500">{c.price}</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">{priceLabel}</p>
              <p className={`mt-2 text-xs ${bundle ? 'text-green-700' : 'text-steel-500'}`} data-testid="bundle-state" data-ready={bundle ? '1' : '0'}>{bundle ? c.bundleReady : c.bundlePrep}</p>
              <div className="mt-4 flex flex-col gap-2">
                {bundle ? (
                  <BuyButton slug={t.slug} label={c.buy} className="btn btn-primary w-full" />
                ) : (
                  <Link href="/contact" className="btn btn-primary w-full" data-testid="notify-ready">{c.notify}</Link>
                )}
                {t.demoUrl ? (
                  <a href={t.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full" data-testid="demo-link">{c.demo} ↗</a>
                ) : (
                  <Link href="/contact" className="btn btn-ghost w-full">{c.noDemo}</Link>
                )}
                {demo ? <a href={demo.login} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full">{c.admin} ↗</a> : null}
              </div>
              {demo ? (
                <div className="mt-4 rounded-lg bg-[color:var(--surface)] p-3 text-xs" data-testid="demo-account">
                  <p className="font-bold uppercase tracking-wide text-steel-500">{c.account}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <dt className="text-steel-500">{c.email}</dt><dd className="break-all font-mono">{demo.account.email}</dd>
                    <dt className="text-steel-500">{c.password}</dt><dd className="break-all font-mono">{demo.account.password}</dd>
                  </dl>
                  <p className="mt-2 leading-relaxed text-steel-500">{c.accountNote}</p>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      {demo?.shots.length ? (
        <section className="mx-auto max-w-6xl px-4 pt-12" aria-labelledby="gallery-title" data-testid="demo-gallery">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">{c.galleryEyebrow}</p>
          <h2 id="gallery-title" className="mt-1 font-display text-2xl font-extrabold">{c.galleryTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-steel-500">{c.galleryLead}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {demo.shots.map((x) => (
              <figure key={x.id} className={`panel mk-lift overflow-hidden ${x.device === 'phone' ? 'sm:col-span-2' : ''}`}>
                <a href={x.src} target="_blank" rel="noopener" className={`block bg-[color:var(--surface)] ${x.device === 'phone' ? 'mx-auto max-w-[300px] py-4' : ''}`}>
                  <picture>
                    {/* Visitors who ask for less motion get the still poster. */}
                    <source media="(prefers-reduced-motion: reduce)" srcSet={x.poster} />
                    <img src={x.src} width={x.width} height={x.height} loading="lazy" decoding="async" alt={pick(lang, x.title)} className="h-auto w-full" />
                  </picture>
                </a>
                <figcaption className="p-4">
                  <p className="font-display font-extrabold">{pick(lang, x.title)}{x.device === 'phone' ? <span className="chip ml-2 align-middle">{c.phone}</span> : null}</p>
                  <p className="mt-1 text-sm leading-relaxed text-steel-500">{pick(lang, x.caption)}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-extrabold">{c.featTitle}</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {t.features.map((f) => <li key={f} className="flex gap-2 text-sm text-steel-500"><span className="tick">✓</span>{f}</li>)}
            </ul>
            <h2 className="mt-8 font-display text-xl font-extrabold">{c.incTitle}</h2>
            <ul className="mt-4 space-y-2">
              {t.includes.map((f) => <li key={f} className="flex gap-2 text-sm"><span className="tick mt-0.5">✓</span><span>{f}</span></li>)}
            </ul>
          </div>
          <div>
            <SectionHead eyebrow={c.rebrandTitle} title={c.rebrandTitle} lead={c.rebrandLead} />
            <ol className="mt-4 space-y-2">
              {t.rebrand.map((r, i) => (
                <li key={r} className="flex gap-3 rounded-lg bg-[color:var(--surface)] p-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[11px] font-extrabold text-white">{i + 1}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 panel p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{c.howTitle}</p>
              <ol className="mt-2 space-y-1.5 text-sm text-steel-500">
                {c.how.map((h) => <li key={h}>• {h}</li>)}
              </ol>
            </div>
            {isAdmin ? <div className="mt-6"><BundleUploadForm slug={t.slug} hasBundle={Boolean(bundle)} /></div> : null}
          </div>
        </div>
      </section>

      <CtaBand title={c.ctaTitle} lead={c.ctaLead} primary={{ href: '/contact', label: 'Contact' }} secondary={{ href: '/templates', label: c.store }} />
    </>
  );
}

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}
