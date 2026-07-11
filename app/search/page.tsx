'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHero, NotFoundState } from '@/components/premium';
import { ArticleCard } from '@/components/ArticleCard';
import { ARTICLES, BLOG_POSTS, CATEGORIES } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import type { Article } from '@/types';

type Tab = 'all' | 'news' | 'blog' | 'transfers' | 'tactical';

interface SearchHit {
  type: 'news' | 'blog';
  id: string;
  title: string;
  excerpt: string;
  url: string;
  coverImage?: string;
  publishedAt: string;
  category: string;
  readingTimeMinutes: number;
  tags: string[];
  score: number;
  highlights: string[];
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const hits = useMemo<SearchHit[]>(() => {
    if (!debounced.trim()) return [];
    const q = debounced.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const all: SearchHit[] = [];

    for (const a of ARTICLES) {
      if (tab !== 'all' && tab !== a.category && tab !== 'news') continue;
      const haystack = `${a.title} ${a.subtitle ?? ''} ${a.excerpt} ${a.tags.join(' ')} ${a.entities.map((e) => e.name).join(' ')}`.toLowerCase();
      const score = terms.reduce((s, t) => s + (haystack.includes(t) ? 1 : 0), 0);
      if (score === 0) continue;
      all.push({
        type: 'news',
        id: a.id,
        title: a.title,
        excerpt: a.excerpt,
        url: `/news/${a.id}`,
        coverImage: a.coverImage,
        publishedAt: a.publishedAt,
        category: a.category,
        readingTimeMinutes: a.readingTimeMinutes,
        tags: a.tags,
        score,
        highlights: extractHighlights(a.excerpt, terms),
      });
    }
    for (const b of BLOG_POSTS) {
      if (tab !== 'all' && tab !== 'blog') continue;
      const haystack = `${b.title} ${b.subtitle} ${b.excerpt} ${b.tags.join(' ')} ${b.content}`.toLowerCase();
      const score = terms.reduce((s, t) => s + (haystack.includes(t) ? 1 : 0), 0);
      if (score === 0) continue;
      all.push({
        type: 'blog',
        id: b.id,
        title: b.title,
        excerpt: b.excerpt,
        url: `/blog/${b.slug}`,
        coverImage: b.coverImage,
        publishedAt: b.publishedAt,
        category: 'blog',
        readingTimeMinutes: b.readingTimeMinutes,
        tags: b.tags,
        score,
        highlights: extractHighlights(b.excerpt, terms),
      });
    }
    return all.sort((a, b) => b.score - a.score).slice(0, 24);
  }, [debounced, tab]);

  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Find anything on"
        highlight="Qawla."
        description="Search across news, blog posts, transfers, and tactical analysis. Filter by category, sort by relevance."
        variant="dark"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search input */}
        <div className="relative mb-6">
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-night/40 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for players, clubs, tournaments…"
            aria-label="Search query"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent text-lg min-h-[56px] bg-white"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-pitch/10 flex items-center justify-center text-night/50 hover:text-pitch-dk transition-colors"
              aria-label="Clear search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          {([
            { id: 'all', label: 'All' },
            { id: 'news', label: 'News' },
            { id: 'blog', label: 'Blog' },
            { id: 'transfers', label: 'Transfers' },
            { id: 'tactical', label: 'Tactical' },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'badge whitespace-nowrap flex-shrink-0 transition-colors min-h-[36px] px-4 py-2',
                tab === t.id ? 'bg-pitch text-white' : 'bg-white border border-gray-200 text-night/70 hover:border-pitch/40',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {debounced.trim() === '' ? (
          <div className="text-center py-16">
            <p className="text-night/60 mb-4">Try searching for a player, club, or topic.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {['Haaland', 'Real Madrid', 'Champions League', 'transfers', 'tactics'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="badge bg-gray-100 text-night/70 hover:bg-pitch/10 hover:text-pitch-dk transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : hits.length === 0 ? (
          <NotFoundState
            title={`No results for "${debounced}"`}
            description="Try different keywords or browse our latest stories."
          />
        ) : (
          <>
            <p className="text-sm text-night/60 mb-5">
              {hits.length} {hits.length === 1 ? 'result' : 'results'} for <span className="font-bold text-night">"{debounced}"</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {hits.map((hit) => (
                <Link
                  key={`${hit.type}-${hit.id}`}
                  href={hit.url}
                  className="group flex flex-col card card-hover"
                >
                  <div className="flex items-center gap-2 p-4 pb-2">
                    <span className={cn(
                      'badge text-[10px]',
                      hit.type === 'blog' ? 'bg-gold/20 text-gold-dark' : 'bg-pitch/10 text-pitch-dk',
                    )}>
                      {hit.type === 'blog' ? 'Blog' : hit.category}
                    </span>
                    <span className="text-xs text-night/50">{hit.readingTimeMinutes} min read</span>
                  </div>
                  <div className="px-4 pb-4 flex-1">
                    <h3 className="font-display font-bold text-base sm:text-lg text-night leading-tight group-hover:text-pitch-dk transition-colors line-clamp-2">
                      {highlightTerms(hit.title, debounced.split(/\s+/))}
                    </h3>
                    <p className="mt-2 text-sm text-night/70 line-clamp-2">
                      {hit.highlights.length > 0
                        ? highlightTerms(hit.highlights[0]!, debounced.split(/\s+/))
                        : hit.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function extractHighlights(text: string, terms: string[]): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const idx = terms.findIndex((t) => lower.includes(t.toLowerCase()));
  if (idx === -1) return [text.slice(0, 160)];
  const term = terms[idx]!;
  const pos = lower.indexOf(term.toLowerCase());
  const start = Math.max(0, pos - 60);
  const end = Math.min(text.length, pos + term.length + 60);
  return [(start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')];
}

function highlightTerms(text: string, terms: string[]): React.ReactNode {
  const parts: React.ReactNode[] = [text];
  for (const term of terms) {
    if (!term) continue;
    const newParts: React.ReactNode[] = [];
    for (const part of parts) {
      if (typeof part !== 'string') { newParts.push(part); continue; }
      const lower = part.toLowerCase();
      const idx = lower.indexOf(term.toLowerCase());
      if (idx === -1) { newParts.push(part); continue; }
      newParts.push(part.slice(0, idx));
      newParts.push(<mark key={`${term}-${idx}`} className="bg-pitch/20 text-pitch-dk rounded px-0.5">{part.slice(idx, idx + term.length)}</mark>);
      newParts.push(part.slice(idx + term.length));
    }
    parts.length = 0;
    parts.push(...newParts);
  }
  return parts;
}
