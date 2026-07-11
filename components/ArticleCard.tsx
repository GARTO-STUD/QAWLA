import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { cn, formatRelative, formatNumber } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  className?: string;
  priority?: boolean;
}

export function ArticleCard({
  article,
  variant = 'default',
  className,
  priority = false,
}: ArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/news/${article.id}`}
        className={cn(
          'group flex gap-3 p-3 rounded-xl hover:bg-pitch/5 transition-colors',
          className,
        )}
      >
        {article.coverImage && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-pitch-dk">
            {article.category}
          </span>
          <h4 className="font-display font-bold text-sm text-night leading-snug line-clamp-2 group-hover:text-pitch-dk transition-colors">
            {article.title}
          </h4>
          <span className="text-xs text-night/50">{formatRelative(article.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/news/${article.id}`}
        className={cn(
          'group grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 card card-hover overflow-hidden',
          className,
        )}
      >
        <div className="relative aspect-[16/9] sm:aspect-auto sm:h-full bg-gray-100 overflow-hidden">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, 200px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 pitch-pattern bg-night" />
          )}
        </div>
        <div className="p-4 sm:py-5 sm:pr-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="badge bg-pitch/10 text-pitch-dk">
              {article.category}
            </span>
            {article.trending && (
              <span className="badge bg-gold/20 text-gold-dark">Trending</span>
            )}
          </div>
          <h3 className="font-display font-extrabold text-lg sm:text-xl text-night leading-tight group-hover:text-pitch-dk transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-night/70 line-clamp-2">{article.excerpt}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-night/50">
            <span>{article.author.name}</span>
            <span>·</span>
            <span>{formatRelative(article.publishedAt)}</span>
            <span>·</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/news/${article.id}`}
        className={cn(
          'group relative block rounded-2xl overflow-hidden card card-hover min-h-[400px] sm:min-h-[480px]',
          className,
        )}
      >
        <div className="absolute inset-0 bg-night">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
            />
          ) : (
            <div className="absolute inset-0 pitch-pattern" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
        </div>
        <div className="relative p-6 sm:p-8 flex flex-col h-full min-h-[400px] sm:min-h-[480px] justify-end">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="badge bg-pitch text-white">Featured</span>
            <span className="badge bg-white/20 text-white backdrop-blur">{article.category}</span>
            {article.trending && (
              <span className="badge bg-gold text-night">Trending</span>
            )}
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-cream leading-tight group-hover:text-pitch transition-colors">
            {article.title}
          </h2>
          <p className="mt-3 text-cream/80 text-sm sm:text-base line-clamp-2">{article.excerpt}</p>
          <div className="mt-4 flex items-center gap-3 text-xs text-cream/60 flex-wrap">
            <span className="font-semibold text-cream">{article.author.name}</span>
            <span>·</span>
            <span>{formatRelative(article.publishedAt)}</span>
            <span>·</span>
            <span>{article.readingTimeMinutes} min read</span>
            <span>·</span>
            <span>{formatNumber(article.viewCount)} views</span>
          </div>
        </div>
      </Link>
    );
  }

  // default
  return (
    <Link
      href={`/news/${article.id}`}
      className={cn('group flex flex-col card card-hover', className)}
    >
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 pitch-pattern bg-night flex items-center justify-center">
            <span className="text-cream/40 text-sm">Qawla</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="badge bg-night/80 text-cream backdrop-blur">{article.category}</span>
          {article.trending && (
            <span className="badge bg-gold text-night">Hot</span>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        {article.confidence && (
          <div className="mb-2">
            <ConfidenceBadge score={article.confidence.score} label={article.confidence.label} compact />
          </div>
        )}
        <h3 className="font-display font-extrabold text-base sm:text-lg text-night leading-tight group-hover:text-pitch-dk transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-night/70 line-clamp-2 flex-1">{article.excerpt}</p>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-night/50">
          <span className="font-medium text-night/70">{article.author.name}</span>
          <span>{formatRelative(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
