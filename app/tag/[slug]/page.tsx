import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { PageHero, EmptyState } from '@/components/premium';
import { ARTICLES } from '@/lib/mockData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  return {
    title: `#${tag} — Football stories tagged "${tag}"`,
    description: `All Qawla stories tagged with "${tag}".`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  const articles = ARTICLES.filter((a) => a.tags.includes(tag));

  return (
    <>
      <PageHero
        eyebrow="Tag"
        title={`#${tag}`}
        description={`${articles.length} ${articles.length === 1 ? 'story' : 'stories'} tagged with "${tag}".`}
        variant="dark"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {articles.length === 0 ? (
          <EmptyState
            title={`No stories tagged "${tag}"`}
            description="Try a different tag or browse our latest stories."
            action={{ label: 'Browse all news', href: '/news' }}
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Other popular tags */}
        <section className="mt-12 pt-8 border-t border-gray-200" aria-labelledby="popular-tags">
          <h2 id="popular-tags" className="font-display font-bold text-lg text-night mb-4">Popular tags</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(ARTICLES.flatMap((a) => a.tags))).slice(0, 20).map((t) => (
              <Link
                key={t}
                href={`/tag/${t}`}
                className={`badge transition-colors ${t === tag ? 'bg-pitch text-white' : 'bg-gray-100 text-night/70 hover:bg-pitch/10 hover:text-pitch-dk'}`}
              >
                #{t}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
