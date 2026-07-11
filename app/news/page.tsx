import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { PageHero } from '@/components/premium';
import { AdBanner } from '@/components/AdBanner';
import { ARTICLES, CATEGORIES, getFeaturedArticle } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'Football News — Latest headlines & match reports',
  description: 'The latest verified football news, match reports, transfer updates, and tactical analysis from across the world game.',
  alternates: { canonical: '/news' },
};

export default function NewsPage() {
  const featured = getFeaturedArticle();
  const articles = ARTICLES.filter((a) => !a.featured && a.status === 'published');
  const half = Math.ceil(articles.length / 2);

  return (
    <>
      <PageHero
        eyebrow="Newsroom"
        title="Football news,"
        highlight="verified."
        description="The latest from the Qawla newsroom — every story scored for confidence before it reaches you."
        variant="dark"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link href="/news" className="badge bg-pitch text-white whitespace-nowrap flex-shrink-0">All</Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="badge bg-white border border-gray-200 text-night/70 hover:border-pitch hover:text-pitch-dk whitespace-nowrap flex-shrink-0 transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <div className="mb-8 sm:mb-10">
            <ArticleCard article={featured} variant="featured" priority />
          </div>
        )}

        {/* Ad */}
        <div className="my-8 sm:my-10">
          <AdBanner slot="news-top" format="horizontal" />
        </div>

        {/* Grid 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {articles.slice(0, half).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* In-feed ad */}
        <div className="my-8 sm:my-10">
          <AdBanner slot="news-mid" format="horizontal" />
        </div>

        {/* Grid 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {articles.slice(half).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Load more CTA */}
        <div className="mt-12 text-center">
          <p className="text-night/60 mb-4">Showing {articles.length} of {ARTICLES.length} articles</p>
          <button className="btn-secondary">Load more</button>
        </div>
      </div>
    </>
  );
}
