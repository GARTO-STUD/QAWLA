import Link from 'next/link';
import type { Article } from '@/types';
import { ArticleCard } from '@/components/ArticleCard';

interface RelatedArticlesProps {
  articles: Article[];
  title?: string;
}

/**
 * Compute entity overlap between a source article and candidates.
 *
 * NOTE: currently unused dead code (not called from RelatedArticles below,
 * or anywhere else) — there is a separate, similarly-scored implementation
 * in lib/mockData.ts (getRelatedArticles) that's actually wired up. Worth
 * consolidating to one implementation to avoid the two drifting further out
 * of sync. Filters by `status === 'published'` defensively in the meantime,
 * matching the fix already applied to the other implementation, so if this
 * ever does get wired up later it won't surface drafts/rejected stories as
 * "related reading".
 */
export function relatedByEntity(source: Article, candidates: Article[], limit = 3): Article[] {
  const sourceEntityNames = new Set(source.entities.map((e) => e.name.toLowerCase()));
  const sourceTags = new Set(source.tags.map((t) => t.toLowerCase()));

  return candidates
    .filter((c) => c.id !== source.id && c.status === 'published')
    .map((c) => {
      let score = 0;
      for (const e of c.entities) {
        if (sourceEntityNames.has(e.name.toLowerCase())) score += 2;
      }
      for (const t of c.tags) {
        if (sourceTags.has(t.toLowerCase())) score += 1;
      }
      if (c.category === source.category) score += 1;
      if (c.league === source.league && source.league) score += 1;
      return { article: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.article);
}

export function RelatedArticles({ articles, title = 'Related stories' }: RelatedArticlesProps) {
  if (articles.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-12 sm:mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 id="related-heading" className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-night">
          {title}
        </h2>
        <Link
          href="/news"
          className="text-sm font-semibold text-pitch-dk hover:text-pitch-darker transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
