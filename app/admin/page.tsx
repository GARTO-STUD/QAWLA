'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { ARTICLES, TRANSFERS, LIVE_MATCHES, SOURCES, SITE_STATS } from '@/lib/mockData';
import { StatCard, TableSkeleton, EmptyState } from '@/components/premium';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { cn, formatDate, formatNumber, formatRelative } from '@/lib/utils';
import type { Article, PipelineJob, AgentResult, JobStage } from '@/types';

type Tab = 'overview' | 'articles' | 'pipeline' | 'sources' | 'transfers' | 'live' | 'donors';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'articles', label: 'Articles', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg> },
  { id: 'pipeline', label: 'Pipeline', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg> },
  { id: 'sources', label: 'Sources', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg> },
  { id: 'transfers', label: 'Transfers', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7"/></svg> },
  { id: 'live', label: 'Live', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { id: 'donors', label: 'Donors', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
];

// Mock pipeline jobs for the demo
const PIPELINE_JOBS: PipelineJob[] = [
  {
    id: 'job-001',
    stage: 'complete' as JobStage,
    status: 'completed',
    trigger: 'cron',
    articleId: 'art-001',
    agentResults: mockAgentResults(),
    confidence: { score: 92, label: 'verified', decision: 'publish', evaluatedAt: new Date().toISOString(), rationale: 'Multi-source verified', breakdown: { sourceTier: 0.95, crossReference: 1.0, entityMatch: 0.9, historical: 0.95 } },
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'job-002',
    stage: 'editor' as JobStage,
    status: 'running',
    trigger: 'manual',
    articleId: 'art-002',
    agentResults: mockAgentResults().slice(0, 4),
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-003',
    stage: 'fact_check' as JobStage,
    status: 'failed',
    trigger: 'cron',
    agentResults: mockAgentResults().slice(0, 2),
    createdAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 88 * 60_000).toISOString(),
    error: 'Provider timeout',
  },
];

function mockAgentResults(): AgentResult[] {
  const now = Date.now();
  return [
    { agent: 'scout', status: 'completed', startedAt: new Date(now - 300_000).toISOString(), completedAt: new Date(now - 280_000).toISOString(), durationMs: 20_000, model: 'moonshotai/kimi-k2.6-instruct', provider: 'nvidia', tokensIn: 1200, tokensOut: 800 },
    { agent: 'factCheck', status: 'completed', startedAt: new Date(now - 280_000).toISOString(), completedAt: new Date(now - 250_000).toISOString(), durationMs: 30_000, model: 'llama-3.3-70b-versatile', provider: 'groq', tokensIn: 1800, tokensOut: 900 },
    { agent: 'analyst', status: 'completed', startedAt: new Date(now - 250_000).toISOString(), completedAt: new Date(now - 215_000).toISOString(), durationMs: 35_000, model: 'gemini-1.5-pro', provider: 'gemini', tokensIn: 2200, tokensOut: 1500 },
    { agent: 'writer', status: 'completed', startedAt: new Date(now - 215_000).toISOString(), completedAt: new Date(now - 175_000).toISOString(), durationMs: 40_000, model: 'moonshotai/kimi-k2.6-instruct', provider: 'nvidia', tokensIn: 2400, tokensOut: 1800 },
    { agent: 'editor', status: 'completed', startedAt: new Date(now - 175_000).toISOString(), completedAt: new Date(now - 135_000).toISOString(), durationMs: 40_000, model: 'llama-3.3-70b-versatile', provider: 'groq', tokensIn: 2600, tokensOut: 2000 },
  ];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [articleFilter, setArticleFilter] = useState<'all' | Article['status']>('all');

  useEffect(() => {
    fetch('/api/auth', { method: 'GET' })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setAuthed(true);
        }
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    toast('Signed out.', 'info');
    router.push('/admin/login');
  };

  const triggerIngest = async () => {
    toast('Ingestion triggered.', 'success');
    try {
      await fetch('/api/ingest', { method: 'POST' });
    } catch { /* ignore */ }
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <svg className="animate-spin text-pitch" width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const filteredArticles = articleFilter === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.status === articleFilter);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <header className="bg-night text-cream sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-display font-extrabold text-lg text-cream hover:text-pitch transition-colors">
                Qawla <span className="text-pitch">Admin</span>
              </Link>
              <span className="hidden sm:inline-flex badge bg-white/10 text-cream text-xs">Editorial dashboard</span>
            </div>
            <button onClick={handleLogout} className="text-sm font-semibold text-cream/70 hover:text-pitch transition-colors px-3 py-2 rounded-lg hover:bg-white/5 min-h-[40px]">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar (desktop) / tabs (mobile) */}
        <nav className="lg:w-60 lg:border-r lg:border-gray-200 bg-white lg:bg-transparent" aria-label="Admin sections">
          {/* Mobile: horizontal scroll tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto p-2 border-b border-gray-200 bg-white sticky top-16 z-20">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors min-h-[40px]',
                  tab === t.id ? 'bg-pitch text-white' : 'text-night/60 hover:bg-pitch/10',
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          {/* Desktop: vertical sidebar */}
          <div className="hidden lg:flex lg:flex-col lg:gap-1 p-4 sticky top-16">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left',
                  tab === t.id ? 'bg-pitch text-white' : 'text-night/70 hover:bg-pitch/10 hover:text-pitch-dk',
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button onClick={triggerIngest} className="w-full btn-primary text-sm justify-center">
                Trigger ingestion
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'articles' && (
            <ArticlesTab
              articles={filteredArticles}
              filter={articleFilter}
              onFilterChange={setArticleFilter}
            />
          )}
          {tab === 'pipeline' && <PipelineTab jobs={PIPELINE_JOBS} />}
          {tab === 'sources' && <SourcesTab />}
          {tab === 'transfers' && <TransfersTab />}
          {tab === 'live' && <LiveTab />}
          {tab === 'donors' && <DonorsTab />}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                    */
/* -------------------------------------------------------------------------- */

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Overview</h1>
        <p className="text-night/60 text-sm mt-1">Real-time newsroom status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Published" value={SITE_STATS.publishedArticles} variant="pitch" />
        <StatCard label="Avg confidence" value={SITE_STATS.avgConfidence} suffix="%" variant="gold" />
        <StatCard label="Pipeline jobs (24h)" value={56} variant="night" />
        <StatCard label="Live matches" value={LIVE_MATCHES.filter(m => m.status === 'live' || m.status === 'halftime').length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline health */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-lg text-night mb-4">Pipeline health (last 24h)</h3>
          <div className="space-y-3">
            {[
              { label: 'Scout', ok: 54, fail: 2, color: 'bg-pitch' },
              { label: 'Fact-checker', ok: 51, fail: 5, color: 'bg-lime-500' },
              { label: 'Analyst', ok: 32, fail: 1, color: 'bg-amber-500' },
              { label: 'Writer', ok: 49, fail: 1, color: 'bg-blue-500' },
              { label: 'Editor', ok: 47, fail: 3, color: 'bg-purple-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-night/80 font-medium">{s.label}</span>
                  <span className="text-night/60 text-xs">{s.ok} ok · {s.fail} failed</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden flex">
                  <div className={cn('h-full', s.color)} style={{ width: `${(s.ok / (s.ok + s.fail)) * 100}%` }} />
                  <div className="h-full bg-red-400" style={{ width: `${(s.fail / (s.ok + s.fail)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-lg text-night mb-4">Recent activity</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {ARTICLES.slice(0, 5).map((a) => (
              <Link key={a.id} href={`/news/${a.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-pitch/5 transition-colors">
                <span className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  a.status === 'published' ? 'bg-pitch' : a.status === 'draft' ? 'bg-amber-400' : 'bg-gray-400',
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-night truncate">{a.title}</p>
                  <p className="text-xs text-night/50">{a.status} · {formatRelative(a.publishedAt)}</p>
                </div>
                {a.confidence && <ConfidenceBadge score={a.confidence.score} label={a.confidence.label} compact />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                    */
/* -------------------------------------------------------------------------- */

function ArticlesTab({ articles, filter, onFilterChange }: { articles: Article[]; filter: string; onFilterChange: (f: 'all' | Article['status']) => void }) {
  const filters: ('all' | Article['status'])[] = ['all', 'published', 'draft', 'in_review', 'archived'];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Articles</h1>
          <p className="text-night/60 text-sm mt-1">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</p>
        </div>
        <button className="btn-primary text-sm">+ New article</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={cn(
              'badge whitespace-nowrap flex-shrink-0 transition-colors min-h-[36px] px-4 py-2 capitalize',
              filter === f ? 'bg-pitch text-white' : 'bg-white border border-gray-200 text-night/70 hover:border-pitch/40',
            )}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <EmptyState title="No articles" description="No articles match this filter." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-night/70">
                <tr>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Title</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs hidden md:table-cell">Confidence</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs hidden lg:table-cell">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-pitch/5 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/news/${a.id}`} className="font-semibold text-night hover:text-pitch-dk line-clamp-1">
                        {a.title}
                      </Link>
                      <p className="text-xs text-night/50 sm:hidden">{a.category}</p>
                    </td>
                    <td className="px-4 py-3 text-night/70 hidden sm:table-cell capitalize">{a.category}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'badge text-[10px] capitalize',
                        a.status === 'published' ? 'bg-emerald-100 text-emerald-700'
                        : a.status === 'draft' ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-night/60',
                      )}>{a.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {a.confidence ? <ConfidenceBadge score={a.confidence.score} label={a.confidence.label} compact /> : '—'}
                    </td>
                    <td className="px-4 py-3 text-night/50 text-xs hidden lg:table-cell">{formatDate(a.publishedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pipeline                                                                    */
/* -------------------------------------------------------------------------- */

function PipelineTab({ jobs }: { jobs: PipelineJob[] }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Pipeline jobs</h1>
          <p className="text-night/60 text-sm mt-1">Five-agent AI-free editorial pipeline</p>
        </div>
        <button className="btn-primary text-sm">+ New job</button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="card p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0',
                  job.status === 'completed' ? 'bg-pitch'
                  : job.status === 'running' ? 'bg-blue-500 animate-pulse'
                  : job.status === 'failed' ? 'bg-red-500'
                  : 'bg-gray-400',
                )} />
                <div>
                  <p className="font-bold text-night text-sm">{job.id}</p>
                  <p className="text-xs text-night/50">Trigger: {job.trigger} · {formatRelative(job.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-gray-100 text-night/60 capitalize">{job.stage.replace('_', ' ')}</span>
                <span className={cn(
                  'badge capitalize text-xs',
                  job.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                  : job.status === 'running' ? 'bg-blue-100 text-blue-700'
                  : job.status === 'failed' ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-night/60',
                )}>{job.status}</span>
              </div>
            </div>

            {/* Agent results */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['scout', 'factCheck', 'analyst', 'writer', 'editor'] as const).map((agentName) => {
                const result = job.agentResults.find((r) => r.agent === agentName);
                return (
                  <div
                    key={agentName}
                    className={cn(
                      'p-2.5 rounded-lg border text-center',
                      !result ? 'border-dashed border-gray-200 opacity-50'
                      : result.status === 'completed' ? 'border-pitch/30 bg-pitch/5'
                      : result.status === 'failed' ? 'border-red-200 bg-red-50'
                      : result.status === 'running' ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50',
                    )}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-night/60">{agentName}</p>
                    <p className="text-xs font-semibold text-night mt-0.5">
                      {!result ? '—' : result.status}
                    </p>
                    {result?.durationMs ? (
                      <p className="text-[10px] text-night/40 mt-0.5">{(result.durationMs / 1000).toFixed(1)}s</p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {job.confidence && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-night/60">Final confidence:</span>
                <ConfidenceBadge score={job.confidence.score} label={job.confidence.label} compact />
              </div>
            )}
            {job.error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">Error: {job.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                     */
/* -------------------------------------------------------------------------- */

function SourcesTab() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Sources</h1>
        <p className="text-night/60 text-sm mt-1">{SOURCES.length} active ingestion sources</p>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-night/70">
              <tr>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Source</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Tier</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Type</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Reliability</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs hidden lg:table-cell">Last polled</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SOURCES.map((s) => (
                <tr key={s.id} className="hover:bg-pitch/5">
                  <td className="px-4 py-3 font-semibold text-night">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'badge text-[10px]',
                      s.tier === 'official' ? 'bg-emerald-100 text-emerald-700'
                      : s.tier === 'tier1' ? 'bg-blue-100 text-blue-700'
                      : s.tier === 'social' ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-night/60',
                    )}>{s.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-night/70 capitalize">{s.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full pitch-gradient" style={{ width: `${s.reliabilityScore * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-night">{Math.round(s.reliabilityScore * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-night/50 text-xs hidden lg:table-cell">
                    {s.lastPolledAt ? formatRelative(s.lastPolledAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-[10px]', s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-night/60')}>
                      {s.active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Transfers                                                                   */
/* -------------------------------------------------------------------------- */

function TransfersTab() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Transfers</h1>
        <p className="text-night/60 text-sm mt-1">{TRANSFERS.length} tracked transfers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRANSFERS.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-bold text-night">{t.player.name}</p>
                <p className="text-xs text-night/60">{t.fromClub.name} → {t.toClub.name}</p>
              </div>
              <span className="badge bg-gray-100 text-night/60 capitalize text-[10px]">{t.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-night/70">{t.fee ? `$${formatNumber(t.fee / 1000)}k` : 'Undisclosed'}</span>
              <ConfidenceBadge score={t.confidence.score} label={t.confidence.label} compact />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Live                                                                        */
/* -------------------------------------------------------------------------- */

function LiveTab() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Live matches</h1>
        <p className="text-night/60 text-sm mt-1">{LIVE_MATCHES.length} matches tracked</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIVE_MATCHES.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-night/50">{m.competition}</span>
              <span className={cn(
                'badge text-[10px]',
                m.status === 'live' ? 'bg-pitch text-white'
                : m.status === 'halftime' ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-night/60',
              )}>{m.status === 'live' ? `${m.minute}'` : m.status}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-night">
              <span>{m.homeTeam.name}</span>
              <span>{m.status === 'scheduled' ? 'vs' : `${m.homeScore} - ${m.awayScore}`}</span>
              <span>{m.awayTeam.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Donors                                                                      */
/* -------------------------------------------------------------------------- */

function DonorsTab() {
  const mockDonors = [
    { id: 'd1', email: 'a***@gmail.com', tier: 'Patron', since: '2024-01-15', total: 325 },
    { id: 'd2', email: 'j***@outlook.com', tier: 'Member', since: '2024-03-02', total: 144 },
    { id: 'd3', email: 'm***@proton.me', tier: 'Supporter', since: '2024-05-18', total: 35 },
    { id: 'd4', email: 's***@icloud.com', tier: 'Patron', since: '2024-02-22', total: 275 },
    { id: 'd5', email: 'k***@gmail.com', tier: 'Member', since: '2024-06-10', total: 48 },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Donors</h1>
        <p className="text-night/60 text-sm mt-1">{SITE_STATS.totalDonors} supporters · ${formatNumber(SITE_STATS.totalRaised)} raised</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total donors" value={SITE_STATS.totalDonors} variant="pitch" />
        <StatCard label="Total raised" value={`$${formatNumber(SITE_STATS.totalRaised)}`} variant="gold" />
        <StatCard label="Avg monthly" value="$26" variant="night" />
        <StatCard label="Churn rate" value="2.4%" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-night/70">
              <tr>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Email</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Tier</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Since</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockDonors.map((d) => (
                <tr key={d.id} className="hover:bg-pitch/5">
                  <td className="px-4 py-3 font-mono text-night/70">{d.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'badge text-[10px]',
                      d.tier === 'Patron' ? 'bg-gold/20 text-gold-dark'
                      : d.tier === 'Member' ? 'bg-pitch/10 text-pitch-dk'
                      : 'bg-gray-100 text-night/60',
                    )}>{d.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-night/60 text-xs hidden sm:table-cell">{formatDate(d.since)}</td>
                  <td className="px-4 py-3 font-bold text-night">${d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
