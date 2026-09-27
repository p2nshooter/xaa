import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES, getArticlesByCategory } from '@/content/articles';
import { CategoryContent } from '@/components/Article';
import { pageMetadata, clip } from '@/lib/seo';

interface Props { params: Promise<{ slug: string }>; }
export function generateStaticParams() { return CATEGORIES.map((c) => ({ slug: c.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CATEGORIES.find((x) => x.slug === slug);
  if (!c) return {};
  return pageMetadata({ path: `/category/${slug}`, copy: { title: `${c.name} — World Cup 2026 archive`, description: clip(c.tagline) }, multilingual: false });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const c = CATEGORIES.find((x) => x.slug === slug);
  if (!c) notFound();
  return <CategoryContent cat={c} articles={getArticlesByCategory(slug)} />;
}
