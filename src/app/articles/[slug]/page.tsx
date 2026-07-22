import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICLES, CATEGORIES, getArticle, getArticlesByCategory } from '@/content/articles';
import { ArticleBody, RelatedArticles } from '@/components/Article';
import { SITE } from '@/lib/site';

interface Props { params: Promise<{ slug: string }>; }
export function generateStaticParams() { return ARTICLES.map((a) => ({ slug: a.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  const url = `${SITE.url}/articles/${slug}`;
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      title: a.title,
      description: a.excerpt,
      type: 'article',
      url,
      siteName: SITE.name,
      publishedTime: a.date,
      modifiedTime: a.date,
      authors: [a.author],
      section: a.category,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const cat = CATEGORIES.find((c) => c.slug === a.category);
  const catName = cat?.name ?? a.category;
  const related = getArticlesByCategory(a.category).filter((x) => x.slug !== slug).slice(0, 2);
  const wordCount = a.sections.reduce((n, s) => n + s.p.join(' ').split(/\s+/).filter(Boolean).length, 0);
  const url = `${SITE.url}/articles/${slug}`;
  // Rich structured data: a full Article plus a BreadcrumbList, both eligible
  // for rich results in search — a real organic-traffic boost over the bare
  // headline-only markup.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: a.title,
        description: a.excerpt,
        datePublished: a.date,
        dateModified: a.date,
        articleSection: catName,
        wordCount,
        inLanguage: SITE.locale,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: { '@type': 'Organization', name: a.author, url: SITE.url },
        publisher: {
          '@type': 'Organization',
          name: SITE.name,
          url: SITE.url,
          logo: { '@type': 'ImageObject', url: `${SITE.url}/icon.svg` },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: SITE.url },
          { '@type': 'ListItem', position: 2, name: catName, item: `${SITE.url}/category/${a.category}` },
          { '@type': 'ListItem', position: 3, name: a.title, item: url },
        ],
      },
    ],
  };
  return (
    <div className="py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleBody article={a} />
      <RelatedArticles articles={related} />
    </div>
  );
}
