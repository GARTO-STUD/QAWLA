import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { PageHero } from '@/components/premium';
import { AdBanner } from '@/components/AdBanner';
import { Reveal, StaggerContainer, StaggerItem, FadeIn } from '@/components/motion';
import { ARTICLES, CATEGORIES, getFeaturedArticle } from '@/lib/mockData';
import { formatRelative } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Football News — Latest headlines & match reports',
  description: 'The latest verified football news, match reports, transfer updates, and tactical analysis from across the world game.',
  alternates: { canonical: '/news' },
};

export default function NewsPage() {
  const featured = getFeaturedArticle();
  const articles = ARTICLES.filter((a) => !a.featured && a.status === 'published');
  const mainGrid = articles.slice(0, 6);
  const moreStories = articles.slice(6);

  // Most recent for the "ticker" rail
  const ticker = [...articles].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow="Newsroom"
        title="Football news,"
        highlight="verified."
        description="The latest from the Qawla newsroom — every story sourced and verified before it reaches you."
        variant="light"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        {/* Category chips */}
        <Reveal className="mb-8 sm:mb-10">
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <Link href="/news" className="badge bg-pitch text-night whitespace-nowrap flex-shrink-0">All</Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="badge bg-white border border-black/10 text-night/65 hover:border-pitch hover:text-pitch-dk whitespace-nowrap flex-shrink-0 transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Magazine layout: featured + ticker rail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 mb-10 sm:mb-14">
          {/* Featured */}
          {featured && (
            <Reveal>
              <ArticleCard article={featured} variant="featured" priority />
            </Reveal>
          )}

          {/* Latest ticker rail */}
          <aside className="lg:order-2">
            <Reveal>
              <div className="rounded-2xl bg-white border border-black/5 overflow-hidden h-full">
                <div className="px-5 py-4 border-b border-black/5 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-night/60">Just in</h2>
                </div>
                <ol className="divide-y divide-black/5">
                  {ticker.map((a, i) => (
                    <li key={a.id}>
                      <Link
                        href={`/news/${a.id}`}
                        className="group flex gap-3 px-5 py-4 hover:bg-pitch/5 transition-colors"
                      >
                        <span className="font-serif font-bold text-2xl text-pitch/30 group-hover:text-pitch-dk transition-colors leading-none mt-0.5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-pitch-dk">{a.category}</span>
                          <h3 className="font-display font-bold text-sm text-night leading-snug line-clamp-2 group-hover:text-pitch-dk transition-colors">
                            {a.title}
                          </h3>
                          <span className="text-[11px] text-night/45">{formatRelative(a.publishedAt)}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
                <div className="px-5 py-3 border-t border-black/5">
                  <Link href="/news" className="text-xs font-bold text-pitch-dk hover:gap-2 inline-flex items-center gap-1.5 transition-all">
                    View all news
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* Section divider */}
        <Reveal className="flex items-center gap-4 mb-6 sm:mb-8">
          <h2 className="heading-serif text-2xl sm:text-3xl text-night">More stories</h2>
          <span className="flex-1 h-px bg-black/8" />
          <span className="text-xs text-night/40 font-mono">{articles.length} articles</span>
        </Reveal>

        {/* Main grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" stagger={0.08}>
          {mainGrid.map((article) => (
            <StaggerItem key={article.id}>
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* In-feed ad */}
        <div className="my-8 sm:my-10">
          <AdBanner slot="news-mid" format="horizontal" />
        </div>

        {/* More stories (compact list) */}
        {moreStories.length > 0 && (
          <Reveal>
            <div className="rounded-2xl bg-cream border border-black/5 p-5 sm:p-6">
              <h3 className="heading-serif text-lg text-night mb-4">More from the archive</h3>
              <ul className="divide-y divide-black/5">
                {moreStories.map((a) => (
                  <li key={a.id}>
                    <Link href={`/news/${a.id}`} className="group flex items-center gap-4 py-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pitch-dk w-20 flex-shrink-0">{a.category}</span>
                      <span className="flex-1 font-display font-semibold text-sm text-night group-hover:text-pitch-dk transition-colors line-clamp-1">
                        {a.title}
                      </span>
                      <span className="text-xs text-night/40 hidden sm:inline">{formatRelative(a.publishedAt)}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-night/30 group-hover:text-pitch-dk group-hover:translate-x-0.5 transition-all flex-shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {/* Load more */}
        <Reveal className="mt-10 text-center">
          <button className="btn-secondary">Load more stories</button>
        </Reveal>
      </div>
    </>
  );
}
