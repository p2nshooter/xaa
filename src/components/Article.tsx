import Link from 'next/link';
import { AdSlot } from '@/components/AdSlot';
import { SITE } from '@/lib/site';
import { CATEGORIES, ARTICLES } from '@/content/articles';
import type { Article } from '@/content/types';

export function ArticleCard({ article }: { article: Article }) {
  const cat = CATEGORIES.find((c) => c.slug === article.category);
  return (
    <Link href={`/articles/${article.slug}`} className="premium-card block p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">{cat?.name}</p>
      <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug">{article.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-800/70">{article.excerpt}</p>
      <p className="mt-3 text-xs text-gold-600">{article.minutes} min read</p>
    </Link>
  );
}

/**
 * Full article body with visitor-friendly ad placement: one leaderboard after
 * the intro, one in-article unit mid-way, and one at the end — 2-3 units per
 * article, all centrally controlled and hidden until approved. Never inside a
 * paragraph, never stacked; spacing stays reader-first and AdSense-compliant.
 */
export function ArticleBody({ article }: { article: Article }) {
  const mid = Math.max(2, Math.floor(article.sections.length / 2) + 1);
  return (
    <article className="mx-auto max-w-prose2 px-4">
      <h1 className="font-serif text-3xl font-black leading-tight sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-sm text-gold-600">
        {new Date(article.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
        {article.minutes} min read · {article.author}
      </p>
      <div className="ornament-rule mt-5" />

      <div className="article-body dropcap mt-6">
        {article.sections.map((s, i) => (
          <section key={i}>
            {i === 1 && <AdSlot placement="in_article_1" />}
            {i === mid && mid !== 1 && <AdSlot placement="in_article_2" />}
            {s.h && <h2>{s.h}</h2>}
            {s.p.map((para, j) => (
              <p key={j}>{para}</p>
            ))}
          </section>
        ))}
      </div>

      <AdSlot placement="footer" />
      <div className="ornament-rule mt-8" />
      <p className="mt-4 text-xs leading-relaxed text-ink-800/60">
        This article is educational and general in nature — not personalised advice. Verify current rules and
        figures with official sources, and consult a qualified professional before making decisions.
      </p>
    </article>
  );
}

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <div className="mx-auto mt-12 max-w-prose2 px-4">
      <h2 className="font-serif text-xl font-bold">Keep reading</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}

export function HomeContent() {
  const latest = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div>
      <section className="paper-motif border-b border-[color:var(--accent-soft)]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">Independent · Jargon-free</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-black leading-tight sm:text-5xl">
            {SITE.heroLead} <span className="accent-text">{SITE.heroAccent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-800/75">{SITE.description}</p>
          <div className="ornament-rule mx-auto mt-8 max-w-md" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="premium-card p-4 text-center">
              <span className="text-2xl">{c.icon}</span>
              <p className="mt-2 font-serif text-sm font-bold">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="font-serif text-2xl font-bold">Latest guides</h2>
        <div className="ornament-rule mt-3 max-w-xs" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
        <AdSlot placement="footer" />
      </section>
    </div>
  );
}

export function CategoryContent({ cat, articles }: { cat: (typeof CATEGORIES)[number]; articles: Article[] }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-3xl">{cat.icon}</p>
      <h1 className="mt-2 font-serif text-3xl font-black">{cat.name}</h1>
      <p className="mt-2 max-w-xl text-ink-800/70">{cat.tagline}</p>
      <div className="ornament-rule mt-5 max-w-sm" />
      <AdSlot placement="in_article_1" />
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
