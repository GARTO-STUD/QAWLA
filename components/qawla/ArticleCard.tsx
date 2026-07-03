'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatRelative, formatNumber, truncate } from '@/lib/utils';
import type { Article } from '@/types';

/**
 * ArticleCard — editorial card for football stories.
 *
 * Public-facing card. No confidence scores, no tags, no source lists —
 * those live in the editorial dashboard only.
 *
 * Variants:
 *  - default  : standard 16:9 image + title + excerpt + meta + share
 *  - featured : large hero card with overlay gradient
 *  - compact  : horizontal layout for sidebars
 *  - minimal  : text-only for dense lists
 */
export interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'minimal';
  priority?: boolean;
  className?: string;
}

const CATEGORY_LABEL: Record<Article['category'], string> = {
  news: 'News',
  transfers: 'Transfers',
  previews: 'Preview',
  reviews: 'Review',
  tactical: 'Tactical',
  opinion: 'Opinion',
  live: 'Live',
  youth: 'Youth',
  international: 'International',
};

/** Elegant share button with popover. */
function ShareButton({ title, slug }: { title: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async (kind: 'copy' | 'twitter' | 'facebook' | 'linkedin') => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/news/${slug}` : '';
    if (kind === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* ignore */
      }
      return;
    }
    const encoded = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const targets = {
      twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    };
    window.open(targets[kind], '_blank', 'noopener,noreferrer,width=600,height=540');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-night/45 hover:text-pitch-dark hover:bg-pitch/8 transition-all"
        aria-label="Share article"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-black/8 bg-white shadow-xl p-1.5 animate-scale-in origin-top-right">
            <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-night/40">
              Share
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); share('copy'); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-night/75 hover:bg-night/5 transition-colors text-left"
            >
              {copied ? (
                <svg className="text-pitch-dark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              )}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); share('twitter'); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-night/75 hover:bg-night/5 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Share on X
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); share('facebook'); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-night/75 hover:bg-night/5 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z" /></svg>
              Facebook
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); share('linkedin'); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-night/75 hover:bg-night/5 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
              LinkedIn
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ArticleCard({
  article,
  variant = 'default',
  priority = false,
  className,
}: ArticleCardProps) {
  const href = `/news/${article.slug}`;

  /* ── Featured ──────────────────────────────────────────────────────────── */
  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className={cn(
          'group relative block overflow-hidden rounded-2xl bg-night text-cream card-lift shadow-lg',
          'aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]',
          className,
        )}
      >
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/75 to-night/10" />

        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-pitch text-white">{CATEGORY_LABEL[article.category]}</span>
            {article.trending && (
              <span className="badge bg-gold/25 text-gold backdrop-blur">Trending</span>
            )}
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl leading-tight mb-2 group-hover:text-pitch transition-colors">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-cream/75 leading-relaxed line-clamp-2 mb-3 max-w-2xl">
              {truncate(article.excerpt, 180)}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 text-xs text-cream/60">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-cream/90">{article.author.name}</span>
              <span aria-hidden>·</span>
              <span>{formatRelative(article.publishedAt)}</span>
              <span aria-hidden>·</span>
              <span>{article.readingTimeMinutes} min</span>
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <ShareButton title={article.title} slug={article.slug} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Compact (horizontal) ──────────────────────────────────────────────── */
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={cn(
          'group flex gap-4 p-3 rounded-xl hover:bg-cream transition-colors',
          className,
        )}
      >
        {article.coverImage && (
          <div className="relative shrink-0 w-24 h-20 sm:w-28 sm:h-24 rounded-lg overflow-hidden bg-cream">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="112px"
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-pitch-dark">
            {CATEGORY_LABEL[article.category]}
          </span>
          <h4 className="font-display font-bold text-sm sm:text-base text-night leading-snug line-clamp-2 group-hover:text-pitch-dark transition-colors">
            {article.title}
          </h4>
          <div className="mt-1 flex items-center gap-2 text-xs text-night/50">
            <span>{formatRelative(article.publishedAt)}</span>
            <span aria-hidden>·</span>
            <span>{formatNumber(article.viewCount)} views</span>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Minimal (text-only) ───────────────────────────────────────────────── */
  if (variant === 'minimal') {
    return (
      <Link
        href={href}
        className={cn(
          'group block py-3 border-b border-gray-200 last:border-b-0',
          className,
        )}
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-pitch-dark">
            {CATEGORY_LABEL[article.category]}
          </span>
          <span className="text-xs text-night/40">{formatRelative(article.publishedAt)}</span>
        </div>
        <h4 className="font-display font-bold text-base text-night leading-snug line-clamp-2 group-hover:text-pitch-dark transition-colors">
          {article.title}
        </h4>
      </Link>
    );
  }

  /* ── Default ──────────────────────────────────────────────────────────── */
  return (
    <Link
      href={href}
      className={cn(
        'group block overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm hover:shadow-xl transition-all card-lift',
        className,
      )}
    >
      {article.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden bg-cream">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="badge bg-white/95 backdrop-blur text-night shadow-sm">
              {CATEGORY_LABEL[article.category]}
            </span>
            {article.trending && (
              <span className="badge bg-gold/95 text-night shadow-sm">Trending</span>
            )}
          </div>
        </div>
      )}

      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-night leading-tight mb-2 line-clamp-2 group-hover:text-pitch-dark transition-colors">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-sm text-night/60 leading-relaxed line-clamp-2 mb-4">
            {truncate(article.excerpt, 140)}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 text-xs text-night/45 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-night/65 truncate">{article.author.name}</span>
            <span aria-hidden className="text-night/25">·</span>
            <span className="shrink-0">{formatRelative(article.publishedAt)}</span>
            <span aria-hidden className="text-night/25">·</span>
            <span className="shrink-0">{article.readingTimeMinutes} min</span>
          </div>
          <div onClick={(e) => e.preventDefault()} className="shrink-0">
            <ShareButton title={article.title} slug={article.slug} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
