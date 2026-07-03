'use client';

import { DashCard, KpiTile, StatusPill, ConfidenceChip, MiniBarChart, Sparkline } from '../shared';
import { SITE_STATS, ARTICLES, PIPELINE_JOBS, ACTIVITY_FEED, DONOR_STATS } from '@/lib/mockData';
import { formatRelative, formatNumber, formatCurrency, cn } from '@/lib/utils';

const ICONS = {
  publish: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>,
  pipeline: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg>,
  donor: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  source: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>,
  comment: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  fail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>,
};

const ICON_BG: Record<string, string> = {
  publish: 'bg-pitch/15 text-pitch',
  pipeline: 'bg-blue-500/15 text-blue-400',
  donor: 'bg-gold/15 text-gold',
  source: 'bg-purple-500/15 text-purple-400',
  comment: 'bg-black/[0.06] text-night/70',
  fail: 'bg-red-500/15 text-red-400',
};

/**
 * OverviewTab — newsroom at a glance.
 *
 * Top: 4 KPI tiles (articles, live matches, pipeline, revenue).
 * Middle: 2-column grid with article-views bar chart (left) and
 * revenue sparkline (right).
 * Bottom: 2-column grid with pipeline status (left) and activity
 * feed (right).
 */
export function OverviewTab() {
  const runningJobs = PIPELINE_JOBS.filter((j) => j.status === 'running').length;
  const failedJobs = PIPELINE_JOBS.filter((j) => j.status === 'failed').length;
  const completed24h = PIPELINE_JOBS.filter((j) => j.status === 'completed').length;

  // Sample article views bar chart
  const articleViews = ARTICLES.slice(0, 8).map((a, i) => ({
    label: `A${i + 1}`,
    value: a.viewCount,
  }));

  // Revenue sparkline
  const revenueSeries = DONOR_STATS.monthly.map((m) => m.revenue);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-night tracking-tight">
            Good evening, Editor.
          </h2>
          <p className="text-sm text-night/55 mt-1">
            {runningJobs} pipeline {runningJobs === 1 ? 'job' : 'jobs'} running ·{' '}
            {completed24h} completed in the last 24h ·{' '}
            {failedJobs > 0 ? (
              <span className="text-red-400 font-semibold">{failedJobs} need attention</span>
            ) : (
              <span className="text-pitch font-semibold">all systems healthy</span>
            )}
          </p>
        </div>
        <button className="btn-primary !py-2 !px-4 !text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New pipeline run
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiTile
          label="Published articles"
          value={formatNumber(SITE_STATS.publishedArticles)}
          delta={{ value: '12%', positive: true }}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>}
          variant="pitch"
        />
        <KpiTile
          label="Pipeline jobs (24h)"
          value={PIPELINE_JOBS.length}
          delta={{ value: '8%', positive: true }}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg>}
          variant="gold"
        />
        <KpiTile
          label="Total raised"
          value={formatCurrency(SITE_STATS.totalRaised)}
          delta={{ value: '5.2%', positive: true }}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
        />
        <KpiTile
          label="Avg confidence"
          value={`${SITE_STATS.avgConfidence}%`}
          delta={{ value: '2pt', positive: true }}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
          variant="pitch"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <DashCard
          title="Article views (last 8)"
          subtitle="Top-performing stories by view count"
          action={
            <button className="text-xs font-semibold text-pitch hover:text-pitch-dark transition-colors">
              View all →
            </button>
          }
        >
          <MiniBarChart data={articleViews} height={140} color="#00d96a" />
        </DashCard>

        <DashCard
          title="Reader revenue"
          subtitle="Monthly donations (last 12 months)"
          action={
            <span className="badge badge-pitch">
              {formatCurrency(revenueSeries[revenueSeries.length - 1])}/mo
            </span>
          }
        >
          <Sparkline data={revenueSeries} height={120} color="#ffc857" />
          <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-black/0.5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">12mo total</p>
              <p className="font-display font-bold text-base text-night tabular-nums">
                {formatCurrency(revenueSeries.reduce((a, b) => a + b, 0))}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">Avg/mo</p>
              <p className="font-display font-bold text-base text-night tabular-nums">
                {formatCurrency(Math.round(revenueSeries.reduce((a, b) => a + b, 0) / 12))}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">Active donors</p>
              <p className="font-display font-bold text-base text-night tabular-nums">
                {formatNumber(DONOR_STATS.activeMonthly)}
              </p>
            </div>
          </div>
        </DashCard>
      </div>

      {/* Pipeline + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Pipeline status */}
        <DashCard
          title="Pipeline status"
          subtitle={`${runningJobs} running · ${failedJobs} failed`}
        >
          <div className="space-y-2">
            {PIPELINE_JOBS.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/0.5 hover:bg-black/[0.04] transition-colors"
              >
                <div className="shrink-0">
                  <StatusPill status={job.status} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-night truncate">
                    {job.id} · <span className="text-night/60 capitalize">{job.stage.replace('_', ' ')}</span>
                  </p>
                  <p className="text-[10px] text-night/40 mt-0.5">
                    {formatRelative(job.updatedAt)} · {job.agentResults.length}/5 agents
                  </p>
                </div>
                {job.confidence && (
                  <ConfidenceChip score={job.confidence.score} />
                )}
              </div>
            ))}
          </div>
        </DashCard>

        {/* Activity feed */}
        <DashCard
          title="Recent activity"
          subtitle="Latest newsroom events"
        >
          <ul className="space-y-2.5">
            {ACTIVITY_FEED.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start gap-3 group">
                <span className={cn(
                  'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                  ICON_BG[a.icon] || 'bg-black/[0.06] text-night/60',
                )}>
                  {ICONS[a.icon as keyof typeof ICONS] || ICONS.pipeline}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-night/85 leading-relaxed">
                    <span className="font-semibold text-night">{a.actor}</span>{' '}
                    <span className="text-night/60">—</span>{' '}
                    {a.target}
                  </p>
                  <p className="text-[10px] text-night/40 mt-0.5">{formatRelative(a.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        </DashCard>
      </div>
    </div>
  );
}

export default OverviewTab;
