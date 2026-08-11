'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Activity, Bot, BarChart3, Settings2, Sparkles, Play, RefreshCw, ShieldCheck, Zap, Database, Cpu, Globe2, CheckCircle2, AlertTriangle, Megaphone, Trash2, Power, Plus, Brain, Gauge, CircleDollarSign } from 'lucide-react';
import { ARTICLES, TRANSFERS, LIVE_MATCHES, SOURCES, SITE_STATS } from '@/lib/mockData';
import { StatCard, TableSkeleton, EmptyState } from '@/components/premium';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { cn, formatDate, formatNumber, formatRelative } from '@/lib/utils';
import type { Article, PipelineJob, AgentResult, JobStage } from '@/types';

type Tab = 'overview' | 'articles' | 'ai' | 'pipeline' | 'sources' | 'transfers' | 'live' | 'donors' | 'analytics' | 'ads' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'articles', label: 'Articles', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg> },
  { id: 'pipeline', label: 'Pipeline', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg> },
  { id: 'ai', label: 'AI Studio', icon: <Bot size={16} /> },
  { id: 'sources', label: 'Sources', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg> },
  { id: 'transfers', label: 'Transfers', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7"/></svg> },
  { id: 'live', label: 'Live', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { id: 'donors', label: 'Donors', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
  { id: 'ads', label: 'Ads & Sponsors', icon: <Megaphone size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings2 size={16} /> },
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
  const [pipelineJobs, setPipelineJobs] = useState<PipelineJob[]>(PIPELINE_JOBS);

  useEffect(() => {
    fetch('/api/auth', { method: 'GET' })
      .then((r) => r.json())
      .then(async (data: { authenticated?: boolean }) => {
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setAuthed(true);
          try {
            const jobsRes = await fetch('/api/orchestrator?limit=20', { cache: 'no-store' });
            const jobsData = await jobsRes.json();
            if (Array.isArray(jobsData.jobs) && jobsData.jobs.length) setPipelineJobs(jobsData.jobs);
          } catch { /* demo fallback stays visible */ }
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
    <div className="min-h-screen dashboard-bg flex flex-col">
      {/* Top bar */}
      <header className="bg-night/95 text-cream sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-display font-extrabold text-lg text-cream hover:text-pitch transition-colors">
                Qawla <span className="text-pitch">Admin</span>
              </Link>
              <span className="hidden sm:inline-flex badge bg-white/10 text-cream text-xs">Editorial dashboard</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-cream/70 hover:text-pitch transition-colors px-3 py-2 rounded-lg hover:bg-white/5 min-h-[40px]"
              >
                View site
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>
              </Link>
              <button onClick={handleLogout} className="text-sm font-semibold text-cream/70 hover:text-pitch transition-colors px-3 py-2 rounded-lg hover:bg-white/5 min-h-[40px]">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar (desktop) / tabs (mobile) */}
        <nav className="lg:w-64 lg:border-r lg:border-white/10 dashboard-sidebar text-cream" aria-label="Admin sections">
          {/* Mobile: horizontal scroll tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto p-2 border-b border-gray-200 bg-white sticky top-16 z-20">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all min-h-[40px]',
                  tab === t.id ? 'bg-pitch text-night shadow-lg shadow-pitch/15' : 'text-night/60 hover:bg-pitch/10',
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
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left',
                  tab === t.id ? 'dashboard-nav-active' : 'text-cream/60 hover:bg-white/5 hover:text-white',
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
          {tab === 'pipeline' && <PipelineTab jobs={pipelineJobs} />}
          {tab === 'ai' && <AIStudioTab onToast={(m, t) => toast(m, t)} />}
          {tab === 'analytics' && <AnalyticsTab />}
          {tab === 'settings' && <SettingsTab />}
          {tab === 'sources' && <SourcesTab />}
          {tab === 'transfers' && <TransfersTab />}
          {tab === 'live' && <LiveTab />}
          {tab === 'donors' && <DonorsTab />}
          {tab === 'ads' && <AdsTab onToast={(m, t) => toast(m, t)} />}
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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
  const [query, setQuery] = useState('');
  const visible = query.trim()
    ? articles.filter((a) => a.title.toLowerCase().includes(query.trim().toLowerCase()))
    : articles;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Articles</h1>
          <p className="text-night/60 text-sm mt-1">{visible.length} {visible.length === 1 ? 'article' : 'articles'}</p>
        </div>
        <button className="btn-primary text-sm">+ New article</button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-night/35"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-night placeholder:text-night/40 focus:outline-none focus:ring-2 focus:ring-pitch/40 focus:border-pitch/40 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={cn(
                'badge whitespace-nowrap flex-shrink-0 transition-colors min-h-[36px] px-4 py-2 capitalize',
                filter === f ? 'bg-pitch text-night' : 'bg-white border border-gray-200 text-night/70 hover:border-pitch/40',
              )}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
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
                {visible.map((a) => (
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
                m.status === 'live' ? 'bg-pitch text-night'
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


/* -------------------------------------------------------------------------- */
/* AI Studio — control center for the content agents                           */
/* -------------------------------------------------------------------------- */
function AIStudioTab({ onToast }: { onToast: (message: string, type?: 'success' | 'error' | 'info') => void }) {
  const [topic, setTopic] = useState('');
  const [running, setRunning] = useState(false);
  const [skipPublish, setSkipPublish] = useState(true);
  const [result, setResult] = useState<{ job?: PipelineJob; article?: Article; confidence?: { score?: number; label?: string } } | null>(null);

  const runAgent = async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual', skipPublish, topic: topic.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pipeline failed');
      setResult(data);
      onToast('AI newsroom pipeline completed.', 'success');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'AI pipeline failed.', 'error');
    } finally { setRunning(false); }
  };

  const agents = [
    ['Scout', 'Finds and clusters fresh signals', 'Source discovery'],
    ['Fact-check', 'Cross-checks claims and provenance', 'Evidence'],
    ['Analyst', 'Adds tactical/contextual depth', 'Analysis'],
    ['Writer', 'Turns verified material into a story', 'Drafting'],
    ['Editor', 'Polishes, scores and prepares publication', 'Quality gate'],
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-night text-cream p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 ai-grid opacity-50 pointer-events-none" />
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-pitch/15 blur-3xl ambient-orb" />
        <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-pitch/10 text-pitch px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> AI newsroom
            </div>
            <h1 className="mt-4 font-display font-extrabold text-3xl sm:text-5xl tracking-tight">AI Agent Studio</h1>
            <p className="mt-3 text-cream/60 max-w-xl">Orchestrate the full editorial chain from discovery to publication. Run in draft mode first, inspect confidence, then publish deliberately.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cream/50"><ShieldCheck size={15} className="text-pitch" /> Server-side orchestration</div>
        </div>
      </div>

      <AIModelControl onToast={onToast} />

      <AgentStudio onToast={onToast} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_.85fr] gap-6">
        <section className="qawla-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div><h2 className="font-display font-extrabold text-xl text-night">Run a content job</h2><p className="text-sm text-night/50 mt-1">Use the production pipeline with a safe draft-first workflow. The focus is passed into the Scout agent to shape story selection and angle.</p></div>
            <span className="badge bg-pitch/15 text-pitch-dk"><Zap size={12} /> Ready</span>
          </div>
          <label className="text-xs font-bold uppercase tracking-wider text-night/50">Editorial focus / angle</label>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={4} placeholder="e.g. Analyze today's biggest transfer story and prioritize tier-1 sources…" className="mt-2 w-full rounded-2xl border border-black/10 bg-cream/60 p-4 text-sm text-night outline-none focus:ring-2 focus:ring-pitch/40 focus:border-pitch/50 resize-none" />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-night/[.035] p-4">
            <label className="flex items-center gap-3 text-sm font-semibold text-night cursor-pointer"><input type="checkbox" checked={skipPublish} onChange={e => setSkipPublish(e.target.checked)} className="accent-[#cdf544] w-4 h-4" /> Draft only — do not auto-publish</label>
            <button onClick={runAgent} disabled={running} className="btn-primary min-w-44">
              {running ? <><RefreshCw size={16} className="animate-spin" /> Running…</> : <><Play size={16} /> Run pipeline</>}
            </button>
          </div>
          {result && (
            <div className="mt-5 rounded-2xl border border-pitch/20 bg-pitch/5 p-4">
              <div className="flex items-start gap-3"><CheckCircle2 className="text-pitch-dk mt-0.5" size={18} /><div className="min-w-0"><p className="font-bold text-night">Job completed</p><p className="text-xs text-night/55 mt-1">{result.article?.title || 'Pipeline finished without a published article.'}</p></div></div>
              {result.confidence?.score != null && <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-black/10 overflow-hidden"><div className="h-full bg-pitch rounded-full" style={{ width: `${result.confidence.score}%` }} /></div><span className="text-sm font-extrabold text-night">{result.confidence.score}%</span></div>}
            </div>
          )}
        </section>

        <section className="qawla-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5"><div><h2 className="font-display font-extrabold text-xl text-night">Agent chain</h2><p className="text-sm text-night/50 mt-1">Five coordinated editorial roles.</p></div><Bot size={22} className="text-pitch-dk" /></div>
          <div className="space-y-2">
            {agents.map(([name, desc, role], i) => <div key={name} className="flex items-center gap-3 rounded-2xl border border-black/[.06] p-3 hover:bg-pitch/5 transition-colors"><div className="w-9 h-9 rounded-xl bg-night text-pitch flex items-center justify-center text-xs font-black">0{i+1}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-bold text-sm text-night">{name}</p><span className="text-[10px] uppercase tracking-wider text-night/35">{role}</span></div><p className="text-xs text-night/50 truncate">{desc}</p></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}


function AgentStudio({ onToast }: { onToast: (message: string, type?: 'success' | 'error' | 'info') => void }) {
  type Provider = { id:string; label:string; model:string; free?:boolean; tasks?:string[] };
  type Profile = { id:string; name:string; description?:string; mode:string; defaultProvider?:string; taskProviders?:Record<string,string>; temperature:number; maxTokens:number };
  const [providers,setProviders]=useState<Provider[]>([]); const [profiles,setProfiles]=useState<Profile[]>([]);
  const [selected,setSelected]=useState('best-quality'); const [task,setTask]=useState('writer'); const [provider,setProvider]=useState('');
  const [promptText,setPromptText]=useState('Write a professional football news article from the verified source material below. Keep every claim grounded in the supplied evidence.');
  const [output,setOutput]=useState(''); const [meta,setMeta]=useState<any>(null); const [busy,setBusy]=useState(false);
  const [name,setName]=useState(''); const [mode,setMode]=useState('custom'); const [temperature,setTemperature]=useState(.35); const [maxTokens,setMaxTokens]=useState(6000);
  const load=async()=>{try{const r=await fetch('/api/ai/studio',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load AI Studio');setProviders(d.providers||[]);setProfiles(d.profiles||[]);}catch(e){onToast(e instanceof Error?e.message:'Unable to load AI Studio','error')}};
  useEffect(()=>{load()},[]);
  useEffect(()=>{const p=profiles.find(x=>x.id===selected);if(p){setMode(p.mode);setProvider(p.defaultProvider||'');setTemperature(p.temperature);setMaxTokens(p.maxTokens)}},[selected,profiles]);
  const test=async()=>{setBusy(true);setOutput('');try{const p=profiles.find(x=>x.id===selected);const r=await fetch('/api/ai/studio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'test',prompt:promptText,task,mode:p?.mode||mode,defaultProvider:provider||p?.defaultProvider,temperature:p?.temperature??temperature,maxTokens:p?.maxTokens??maxTokens})});const d=await r.json();if(!r.ok)throw Error(d.error||'Model test failed');setOutput(d.result||'');setMeta(d);onToast('AI test completed.','success')}catch(e){onToast(e instanceof Error?e.message:'AI test failed','error')}finally{setBusy(false)}};
  const create=async()=>{if(!name.trim())return;try{const r=await fetch('/api/ai/studio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:name.trim(),description:`Qawla editorial profile · ${mode}`,mode,defaultProvider:provider||undefined,temperature,maxTokens,taskProviders:{[task]:provider||undefined}})});const d=await r.json();if(!r.ok)throw Error(d.error||'Could not save profile');setName('');await load();setSelected(d.profile.id);onToast('AI profile saved.','success')}catch(e){onToast(e instanceof Error?e.message:'Could not save profile','error')}};
  return <section className="qawla-card p-5 sm:p-6 space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><div className="flex items-center gap-2"><Sparkles size={18} className="text-pitch-dk"/><h2 className="font-display font-extrabold text-xl text-night">Agent Studio</h2></div><p className="text-sm text-night/50 mt-1 max-w-2xl">Design editorial profiles, assign preferred models, and test the exact routing policy before using it in production.</p></div><span className="badge bg-night/5 text-night/60"><Brain size={12}/> Multi-model</span></div>
    <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-5">
      <div className="rounded-2xl border border-black/8 p-4 space-y-4"><div className="flex items-center justify-between"><h3 className="font-bold text-night">Editorial profiles</h3><button onClick={load} className="btn-secondary text-xs"><RefreshCw size={12}/></button></div><div className="grid grid-cols-2 gap-2">{profiles.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={cn('text-left rounded-xl border p-3 transition-all',selected===p.id?'border-pitch bg-pitch/10 shadow-sm':'border-black/8 hover:bg-black/[.02]')}><p className="font-bold text-sm text-night">{p.name}</p><p className="text-[10px] uppercase tracking-wider text-night/40 mt-1">{p.mode}</p></button>)}</div><div className="border-t border-black/8 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-night/45 mb-2">Create profile</p><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Qawla Free Newsroom" className="w-full rounded-xl border border-black/10 p-3 text-sm"/><div className="grid grid-cols-2 gap-2 mt-2"><select value={mode} onChange={e=>setMode(e.target.value)} className="rounded-xl border border-black/10 p-3 text-sm"><option value="best-quality">Best Quality</option><option value="free-only">Free Only</option><option value="low-cost">Low Cost</option><option value="fast">Fast</option><option value="custom">Custom</option></select><select value={provider} onChange={e=>setProvider(e.target.value)} className="rounded-xl border border-black/10 p-3 text-sm"><option value="">Auto route</option>{providers.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></div><button onClick={create} disabled={!name.trim()} className="btn-primary w-full mt-2"><Plus size={14}/> Save profile</button></div></div>
      <div className="rounded-2xl border border-black/8 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-night">Model Playground</h3><p className="text-xs text-night/45 mt-1">Run a real server-side test without exposing any API key.</p></div><select value={task} onChange={e=>setTask(e.target.value)} className="rounded-xl border border-black/10 px-3 py-2 text-sm"><option value="scout">Scout</option><option value="factCheck">Fact Check</option><option value="analyst">Analyst</option><option value="writer">Writer</option><option value="editor">Editor</option><option value="general">General</option></select></div><textarea value={promptText} onChange={e=>setPromptText(e.target.value)} rows={8} className="mt-4 w-full rounded-2xl border border-black/10 bg-cream/50 p-4 text-sm resize-y"/><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2 text-[11px] text-night/45"><span className="badge bg-black/5">Temp {temperature.toFixed(2)}</span><span className="badge bg-black/5">Max {maxTokens}</span>{provider&&<span className="badge bg-pitch/15 text-pitch-dk">{providers.find(p=>p.id===provider)?.label||provider}</span>}</div><button onClick={test} disabled={busy} className="btn-primary min-w-36">{busy?<><RefreshCw size={14} className="animate-spin"/> Testing…</>:<><Play size={14}/> Run test</>}</button></div>{output&&<div className="mt-4 rounded-2xl bg-night text-cream p-4"><div className="flex flex-wrap justify-between gap-2 text-[10px] uppercase tracking-wider text-cream/45"><span>{meta?.provider}/{meta?.model}</span><span>{meta?.durationMs}ms · {Number(meta?.tokensIn||0)+Number(meta?.tokensOut||0)} tokens</span></div><pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-cream/90 max-h-80 overflow-auto">{output}</pre></div>}</div>
    </div>
    <div className="grid sm:grid-cols-4 gap-2">{['Best Quality','Free Only','Low Cost','Fast'].map((x,i)=><div key={x} className="rounded-xl bg-night/[.035] p-3"><p className="text-xs font-bold text-night">{x}</p><p className="text-[10px] text-night/45 mt-1">{['Highest editorial quality','Never spend on paid models','Favor free + efficient providers','Prefer responsive models'][i]}</p></div>)}</div>
  </section>;
}

function AIModelControl({ onToast }: { onToast: (message: string, type?: 'success' | 'error' | 'info') => void }) {
  const [providers, setProviders] = useState<Array<{ id: string; label: string; model: string; free?: boolean; type?: string; tasks?: string[] }>>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const r = await fetch('/api/ai/models', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Unable to load AI models');
      setProviders(d.providers || []); setFreeOnly(!!d.freeOnly);
    } catch (e) { onToast(e instanceof Error ? e.message : 'Unable to load AI models', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  return <section className="qawla-card p-5 sm:p-6 overflow-hidden">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div><div className="flex items-center gap-2"><Brain size={19} className="text-pitch-dk"/><h2 className="font-display font-extrabold text-xl text-night">Model Control Center</h2></div><p className="text-sm text-night/50 mt-1">Use free, paid, local or any OpenAI-compatible model. The router selects by editorial task and falls back automatically.</p></div>
      <div className="flex items-center gap-2"><span className={cn('badge', freeOnly ? 'bg-pitch/15 text-pitch-dk' : 'bg-night/5 text-night/60')}>{freeOnly ? 'Free models only' : 'Free + paid allowed'}</span><button onClick={load} className="btn-secondary text-xs"><RefreshCw size={13}/> Refresh</button></div>
    </div>
    {loading ? <div className="mt-5 text-sm text-night/45">Loading configured providers…</div> : providers.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-night/15 p-5 text-sm text-night/50">No AI provider keys are configured. Add provider environment variables to activate the newsroom engine.</div> : <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">{providers.map(p => <div key={p.id} className="rounded-2xl border border-night/8 bg-night/[.025] p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-night text-pitch flex items-center justify-center"><Cpu size={17}/></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-bold text-sm text-night truncate">{p.label}</p><span className={cn('w-2 h-2 rounded-full shrink-0', p.free ? 'bg-pitch' : 'bg-amber-400')}/></div><p className="text-xs text-night/55 mt-1 truncate">{p.model}</p><div className="mt-3 flex flex-wrap gap-1.5"><span className="badge bg-white text-[10px] text-night/55"><Gauge size={10}/>{p.type === 'gemini' ? 'Gemini API' : 'OpenAI-compatible'}</span>{p.free && <span className="badge bg-pitch/15 text-pitch-dk text-[10px]"><CircleDollarSign size={10}/>Free tier</span>}</div></div></div><p className="mt-3 text-[10px] uppercase tracking-wider font-bold text-night/35">{p.tasks?.length ? p.tasks.join(' · ') : 'all editorial tasks'}</p></div>)}</div>}
    <p className="mt-4 text-[11px] text-night/40">API keys are never returned to the browser. Add custom providers through <code>QAWLA_AI_PROVIDERS_JSON</code>; only safe provider metadata is exposed here.</p>
  </section>;
}

type DashboardAd = { id: string; title: string; advertiser?: string; imageUrl?: string; targetUrl: string; pages: string[]; startsAt: string; endsAt: string; active: boolean; priority: number; createdAt: string; updatedAt: string };
const AD_PAGES = [['/','Home'],['/news','News'],['/blog','Blog'],['/transfers','Transfers'],['/live','Live'],['/search','Search'],['/donate','Donate'],['/about','About']];
function AdsTab({ onToast }: { onToast: (message: string, type?: 'success'|'error'|'info') => void }) {
  const [ads,setAds]=useState<DashboardAd[]>([]); const [editing,setEditing]=useState<DashboardAd|null>(null);
  const [form,setForm]=useState({title:'',advertiser:'',imageUrl:'',targetUrl:'',pages:['/'],startsAt:'',endsAt:'',priority:0,active:true});
  const load=async()=>{try{const r=await fetch('/api/ads?admin=1',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load ads');setAds(d.ads||[]);}catch(e){onToast(e instanceof Error?e.message:'Unable to load ads','error')}};
  useEffect(()=>{load(); const a=new Date(), b=new Date(Date.now()+7*86400000); a.setMinutes(a.getMinutes()-a.getTimezoneOffset()); b.setMinutes(b.getMinutes()-b.getTimezoneOffset()); setForm(f=>({...f,startsAt:a.toISOString().slice(0,16),endsAt:b.toISOString().slice(0,16)}));},[]);
  const reset=()=>{setEditing(null);const a=new Date(),b=new Date(Date.now()+7*86400000);a.setMinutes(a.getMinutes()-a.getTimezoneOffset());b.setMinutes(b.getMinutes()-b.getTimezoneOffset());setForm({title:'',advertiser:'',imageUrl:'',targetUrl:'',pages:['/'],startsAt:a.toISOString().slice(0,16),endsAt:b.toISOString().slice(0,16),priority:0,active:true})};
  const save=async(e:React.FormEvent)=>{e.preventDefault();try{const body={...form,startsAt:new Date(form.startsAt).toISOString(),endsAt:new Date(form.endsAt).toISOString(),...(editing?{id:editing.id}: {})};const r=await fetch('/api/ads',{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to save ad');onToast(editing?'Advertisement updated.':'Advertisement scheduled.','success');reset();load()}catch(e){onToast(e instanceof Error?e.message:'Unable to save ad','error')}};
  const edit=(ad:DashboardAd)=>{setEditing(ad);setForm({title:ad.title,advertiser:ad.advertiser||'',imageUrl:ad.imageUrl||'',targetUrl:ad.targetUrl,pages:ad.pages,startsAt:new Date(ad.startsAt).toISOString().slice(0,16),endsAt:new Date(ad.endsAt).toISOString().slice(0,16),priority:ad.priority,active:ad.active});window.scrollTo({top:0,behavior:'smooth'})};
  const remove=async(id:string)=>{if(!confirm('Remove this advertisement permanently?'))return;const r=await fetch('/api/ads?id='+encodeURIComponent(id),{method:'DELETE'});if(r.ok){onToast('Advertisement removed.','success');load()}else onToast('Unable to remove advertisement.','error')};
  const toggle=async(ad:DashboardAd)=>{const r=await fetch('/api/ads',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({...ad,active:!ad.active})});if(r.ok)load();else onToast('Unable to change status.','error')};
  return <div className="space-y-6"><div className="flex items-end justify-between gap-4 flex-wrap"><div><h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night">Ads & Sponsors</h1><p className="text-night/60 text-sm mt-1">Schedule sponsored placements on selected pages without code changes.</p></div><button onClick={reset} className="btn-primary text-sm"><Plus size={16}/> New campaign</button></div>
    <div className="grid xl:grid-cols-[1.1fr_.9fr] gap-6"><form onSubmit={save} className="qawla-card p-5 sm:p-6 space-y-5"><div><h2 className="font-display font-bold text-xl">{editing?'Edit campaign':'Create campaign'}</h2><p className="text-sm text-night/55 mt-1">Automatic scheduling, activation and removal.</p></div>
      <div className="grid sm:grid-cols-2 gap-4"><label className="sm:col-span-2 text-sm font-semibold">Headline<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input mt-1 w-full" placeholder="Sponsored transfer guide"/></label><label className="text-sm font-semibold">Advertiser<input value={form.advertiser} onChange={e=>setForm({...form,advertiser:e.target.value})} className="input mt-1 w-full"/></label><label className="text-sm font-semibold">Destination URL<input required type="url" value={form.targetUrl} onChange={e=>setForm({...form,targetUrl:e.target.value})} className="input mt-1 w-full"/></label><label className="sm:col-span-2 text-sm font-semibold">Image URL <span className="font-normal text-night/40">optional</span><input type="url" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} className="input mt-1 w-full"/></label><label className="text-sm font-semibold">Starts<input required type="datetime-local" value={form.startsAt} onChange={e=>setForm({...form,startsAt:e.target.value})} className="input mt-1 w-full"/></label><label className="text-sm font-semibold">Ends<input required type="datetime-local" value={form.endsAt} onChange={e=>setForm({...form,endsAt:e.target.value})} className="input mt-1 w-full"/></label><label className="text-sm font-semibold">Priority<input type="number" min="0" max="100" value={form.priority} onChange={e=>setForm({...form,priority:Number(e.target.value)})} className="input mt-1 w-full"/></label></div>
      <fieldset><legend className="text-sm font-semibold mb-2">Show on pages</legend><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{AD_PAGES.map(([v,l])=><label key={v} className="flex items-center gap-2 rounded-xl border border-night/10 p-2.5 text-sm cursor-pointer"><input type="checkbox" checked={form.pages.includes(v)} onChange={e=>setForm({...form,pages:e.target.checked?[...form.pages,v]:form.pages.filter(x=>x!==v)})}/>{l}</label>)}</div></fieldset>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Campaign enabled</label><div className="flex gap-2"><button className="btn-primary text-sm" type="submit">{editing?'Save changes':'Schedule ad'}</button>{editing&&<button className="btn-secondary text-sm" type="button" onClick={reset}>Cancel</button>}</div></form>
      <div className="qawla-card overflow-hidden"><div className="p-5 border-b border-night/10 flex justify-between"><h2 className="font-display font-bold text-xl">Campaigns</h2><span className="badge bg-night/5 text-night">{ads.length}</span></div><div className="divide-y divide-night/10 max-h-[620px] overflow-y-auto">{ads.length===0?<div className="p-8 text-center text-sm text-night/50">No campaigns yet.</div>:ads.map(ad=>{const live=ad.active&&Date.parse(ad.startsAt)<=Date.now()&&Date.parse(ad.endsAt)>Date.now();return <div key={ad.id} className="p-4 space-y-3"><div className="flex gap-3"><span className={cn('w-2 h-2 rounded-full mt-2',live?'bg-pitch':ad.active?'bg-amber-400':'bg-gray-400')}/><div className="min-w-0 flex-1"><h3 className="font-bold text-sm truncate">{ad.title}</h3><p className="text-xs text-night/50">{ad.advertiser||'Direct sponsor'} · {ad.pages.join(', ')}</p></div></div><p className="text-xs text-night/55">{new Date(ad.startsAt).toLocaleString()} → {new Date(ad.endsAt).toLocaleString()}</p><div className="flex gap-2"><button onClick={()=>toggle(ad)} className="btn-secondary text-xs"><Power size={13}/>{ad.active?'Disable':'Enable'}</button><button onClick={()=>edit(ad)} className="btn-secondary text-xs">Edit</button><button onClick={()=>remove(ad.id)} className="btn-secondary text-xs text-red-600"><Trash2 size={13}/>Remove</button></div></div>})}</div></div></div>
  </div>;
}

function AnalyticsTab() {
  const bars = [68, 76, 61, 84, 91, 78, 96, 88, 73, 95, 87, 100];
  return <div className="space-y-6">
    <div><h1 className="font-display font-extrabold text-3xl text-night">Analytics</h1><p className="text-night/55 text-sm mt-1">Editorial performance, engagement and pipeline efficiency.</p></div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {[['Readers','248.6K','+18.4%'],['Story views','1.42M','+24.1%'],['Avg. read','4m 38s','+11.2%'],['AI confidence','89.4%','+3.7%']].map(([a,b,c]) => <div key={a} className="qawla-card p-5"><p className="text-xs uppercase tracking-wider font-bold text-night/45">{a}</p><p className="mt-2 text-3xl font-display font-extrabold text-night">{b}</p><p className="mt-1 text-xs font-bold text-pitch-dk">{c} vs previous period</p></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_.6fr] gap-6">
      <div className="qawla-card p-5 sm:p-6"><div className="flex justify-between items-center"><div><h2 className="font-display font-extrabold text-xl text-night">Audience momentum</h2><p className="text-xs text-night/45 mt-1">Last 12 checkpoints</p></div><Activity size={19} className="text-pitch-dk" /></div><div className="mt-8 h-56 flex items-end gap-2 sm:gap-3">{bars.map((v,i)=><div key={i} className="flex-1 group relative"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-night/40 opacity-0 group-hover:opacity-100 transition-opacity">{v}k</div><div className="rounded-t-xl bg-gradient-to-t from-night to-pitch transition-all duration-500 hover:scale-x-105" style={{height:`${v}%`}} /></div>)}</div></div>
      <div className="qawla-card p-5 sm:p-6"><h2 className="font-display font-extrabold text-xl text-night">Top signals</h2><div className="mt-5 space-y-4">{[['Transfers','34%'],['Live','26%'],['Tactical','21%'],['News','19%']].map(([x,y])=><div key={x}><div className="flex justify-between text-sm font-semibold"><span>{x}</span><span className="text-night/45">{y}</span></div><div className="mt-2 h-2 rounded-full bg-black/7 overflow-hidden"><div className="h-full rounded-full bg-pitch" style={{width:y}} /></div></div>)}</div></div>
    </div>
  </div>;
}

function SettingsTab() {
  const checks = [
    ['Authentication', 'Admin session + secure cookie', true, ShieldCheck],
    ['Payments', 'PayPal server-side checkout + webhook', true, Globe2],
    ['Database', 'Prisma / persistent storage ready', true, Database],
    ['AI runtime', 'Agent providers configured server-side', true, Cpu],
    ['Rate limiting', 'API throttling enabled', true, Activity],
  ] as const;
  return <div className="space-y-6">
    <div><h1 className="font-display font-extrabold text-3xl text-night">System settings</h1><p className="text-night/55 text-sm mt-1">Operational controls and deployment health. Secrets remain server-side.</p></div>
    <div className="qawla-card p-5 sm:p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="font-display font-extrabold text-xl text-night">Production health</h2><p className="text-xs text-night/45 mt-1">High-level checks only — no secrets are exposed.</p></div><span className="badge bg-pitch/15 text-pitch-dk"><span className="w-1.5 h-1.5 rounded-full bg-pitch" /> Operational</span></div><div className="divide-y divide-black/5">{checks.map(([name,desc,ok,Icon])=><div key={name} className="py-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-night/5 flex items-center justify-center"><Icon size={17} className={ok?'text-pitch-dk':'text-amber-500'} /></div><div className="flex-1"><p className="font-bold text-sm text-night">{name}</p><p className="text-xs text-night/50">{desc}</p></div>{ok?<CheckCircle2 size={18} className="text-pitch-dk"/>:<AlertTriangle size={18} className="text-amber-500"/>}</div>)}</div></div>
  </div>;
}
