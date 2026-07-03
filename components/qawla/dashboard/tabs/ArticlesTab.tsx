'use client';

import { useState, useMemo } from 'react';
import { DashCard, StatusPill, ConfidenceChip, DashEmptyState } from '../shared';
import { ARTICLES } from '@/lib/mockData';
import { formatRelative, formatNumber, cn } from '@/lib/utils';
import type { ArticleCategory } from '@/types';

const CATEGORIES: { value: ArticleCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'transfers', label: 'Transfers' },
  { value: 'previews', label: 'Previews' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'tactical', label: 'Tactical' },
  { value: 'opinion', label: 'Opinion' },
  { value: 'youth', label: 'Youth' },
];

/**
 * ArticlesTab — sortable / filterable table of articles.
 *
 * Filters: category pills + search box.
 * Bulk actions: select-all + per-row checkboxes (mock).
 * Each row: title, category, status, confidence, views, publishedAt, actions.
 */
export function ArticlesTab() {
  const [category, setCategory] = useState<ArticleCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, search]);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-night/40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title…"
            className="dash-input !pl-9"
          />
        </div>
        <button className="btn-primary !py-2 !px-4 !text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New article
        </button>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              category === c.value
                ? 'bg-pitch/15 text-pitch'
                : 'bg-black/[0.03] text-night/55 hover:text-night hover:bg-black/[0.06]',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Bulk actions (when items selected) */}
      {selected.size > 0 && (
        <div className="rounded-xl bg-pitch/10 border border-pitch/20 p-3 flex items-center justify-between animate-scale-in">
          <p className="text-xs font-semibold text-pitch">
            {selected.size} selected
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-black/[0.05] hover:bg-black/[0.08] text-xs font-semibold text-night transition-colors">
              Publish
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-black/[0.05] hover:bg-black/[0.08] text-xs font-semibold text-night transition-colors">
              Archive
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-xs font-semibold text-red-400 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <DashEmptyState
          title="No articles match your filters"
          description="Try a different category or search term."
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>}
        />
      ) : (
        <DashCard className="!p-0 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/0.5 text-[10px] uppercase tracking-wider text-night/40">
                  <th className="text-left p-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="rounded border-black/0.20 bg-transparent text-pitch focus:ring-pitch/40"
                    />
                  </th>
                  <th className="text-left p-3 font-semibold">Title</th>
                  <th className="text-left p-3 font-semibold">Category</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Confidence</th>
                  <th className="text-right p-3 font-semibold">Views</th>
                  <th className="text-left p-3 font-semibold">Published</th>
                  <th className="p-3 pr-4 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className={cn(
                      'border-b border-black/0.5 hover:bg-black/[0.02] transition-colors group',
                      selected.has(a.id) && 'bg-pitch/[0.04]',
                    )}
                  >
                    <td className="p-3 pl-4">
                      <input
                        type="checkbox"
                        checked={selected.has(a.id)}
                        onChange={() => toggleOne(a.id)}
                        className="rounded border-black/0.20 bg-transparent text-pitch focus:ring-pitch/40"
                      />
                    </td>
                    <td className="p-3 max-w-md">
                      <p className="text-sm font-semibold text-night line-clamp-1">{a.title}</p>
                      <p className="text-[10px] text-night/40 mt-0.5">{a.id} · {a.author.name}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-semibold text-night/70 capitalize">{a.category}</span>
                    </td>
                    <td className="p-3"><StatusPill status={a.status} /></td>
                    <td className="p-3">
                      {a.confidence ? <ConfidenceChip score={a.confidence.score} /> : <span className="text-night/30 text-xs">—</span>}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm text-night tabular-nums">{formatNumber(a.viewCount)}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-night/55">{formatRelative(a.publishedAt)}</span>
                    </td>
                    <td className="p-3 pr-4">
                      <button className="opacity-0 group-hover:opacity-100 w-7 h-7 inline-flex items-center justify-center rounded-md text-night/50 hover:text-night hover:bg-black/[0.05] transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/5">
            {filtered.map((a) => (
              <label
                key={a.id}
                className={cn(
                  'flex items-start gap-3 p-4 cursor-pointer',
                  selected.has(a.id) && 'bg-pitch/[0.04]',
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={() => toggleOne(a.id)}
                  className="mt-1 rounded border-black/0.20 bg-transparent text-pitch focus:ring-pitch/40"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusPill status={a.status} />
                    {a.confidence && <ConfidenceChip score={a.confidence.score} />}
                  </div>
                  <p className="text-sm font-semibold text-night line-clamp-2">{a.title}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-night/50">
                    <span className="capitalize">{a.category}</span>
                    <span>·</span>
                    <span>{formatNumber(a.viewCount)} views</span>
                    <span>·</span>
                    <span>{formatRelative(a.publishedAt)}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </DashCard>
      )}

      {/* Pagination footer */}
      <div className="flex items-center justify-between text-xs text-night/50">
        <p>
          Showing <span className="font-semibold text-night">{filtered.length}</span> of{' '}
          <span className="font-semibold text-night">{ARTICLES.length}</span> articles
        </p>
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1.5 rounded-md hover:bg-black/[0.05] transition-colors disabled:opacity-40" disabled>
            ‹ Prev
          </button>
          <span className="px-2.5 py-1.5 rounded-md bg-pitch/15 text-pitch font-semibold">1</span>
          <button className="px-2.5 py-1.5 rounded-md hover:bg-black/[0.05] transition-colors">2</button>
          <button className="px-2.5 py-1.5 rounded-md hover:bg-black/[0.05] transition-colors">3</button>
          <button className="px-2.5 py-1.5 rounded-md hover:bg-black/[0.05] transition-colors">
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArticlesTab;
