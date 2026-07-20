import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICLES, getArticle, getArticlesByCategory } from '@/content/articles';
import { ArticleBody, RelatedArticles } from '@/components/Article';
import { SITE } from '@/lib/site';

interface Props { params: Promise<{ slug: string }>; }
export function generateStaticParams() { return ARTICLES.map((a) => ({ slug: a.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return { title: a.title, description: a.excerpt, alternates: { canonical: `/articles/${slug}` },
    openGraph: { title: a.title, description: a.excerpt, type: 'article' } };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const related = getArticlesByCategory(a.category).filter((x) => x.slug !== slug).slice(0, 2);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt,
    datePublished: a.date, author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name }, inLanguage: 'en'
  };
  return (
    <div className="py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleBody article={a} />
      <RelatedArticles articles={related} />
    </div>
  );
}
