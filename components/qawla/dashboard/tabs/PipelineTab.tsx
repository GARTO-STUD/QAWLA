'use client';

import { useState } from 'react';
import { DashCard, StatusPill, ConfidenceChip, ConfidenceRing } from '../shared';
import { PIPELINE_JOBS } from '@/lib/mockData';
import { formatRelative, cn } from '@/lib/utils';
import type { AgentName, PipelineJob } from '@/types';

const STAGES: { id: AgentName; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    id: 'scout',
    label: 'Scout',
    desc: 'Intake & triage',
    color: 'from-pitch to-pitch-dark',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  },
  {
    id: 'factCheck',
    label: 'Fact-checker',
    desc: 'Verification & cross-reference',
    color: 'from-emerald-400 to-emerald-600',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
  },
  {
    id: 'analyst',
    label: 'Analyst',
    desc: 'Tactical depth (optional)',
    color: 'from-blue-400 to-blue-600',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>,
  },
  {
    id: 'writer',
    label: 'Writer',
    desc: 'Prose & narrative',
    color: 'from-gold to-gold-dark',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>,
  },
  {
    id: 'editor',
    label: 'Editor',
    desc: 'Final gate & SEO',
    color: 'from-purple-400 to-purple-600',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  },
];

/**
 * PipelineTab — visual workflow for the five-agent editorial pipeline.
 *
 * Top: summary KPIs (jobs by status).
 * Left column (lg): expandable job list.
 * Right column (lg): selected job detail with stage-by-stage
 * timeline, agent outputs, confidence breakdown, and tokens/cost.
 */
export function PipelineTab() {
  const [selectedJobId, setSelectedJobId] = useState<string>(PIPELINE_JOBS[0].id);
  const selectedJob = PIPELINE_JOBS.find((j) => j.id === selectedJobId) || PIPELINE_JOBS[0];

  const counts = {
    running: PIPELINE_JOBS.filter((j) => j.status === 'running').length,
    completed: PIPELINE_JOBS.filter((j) => j.status === 'completed').length,
    pending: PIPELINE_JOBS.filter((j) => j.status === 'pending').length,
    failed: PIPELINE_JOBS.filter((j) => j.status === 'failed').length,
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile label="Running" value={counts.running} variant="running" />
        <SummaryTile label="Completed (24h)" value={counts.completed} variant="completed" />
        <SummaryTile label="Pending" value={counts.pending} variant="pending" />
        <SummaryTile label="Failed" value={counts.failed} variant="failed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* Job list */}
        <DashCard title="Jobs" subtitle="Click to inspect" className="!p-0">
          <ul className="divide-y divide-white/5 max-h-[640px] overflow-y-auto scroll-area-qawla">
            {PIPELINE_JOBS.map((job) => (
              <li key={job.id}>
                <button
                  onClick={() => setSelectedJobId(job.id)}
                  className={cn(
                    'w-full text-left p-3.5 hover:bg-black/[0.03] transition-colors flex items-center gap-3',
                    selectedJobId === job.id && 'bg-pitch/[0.06] border-l-2 border-pitch',
                  )}
                >
                  <StatusPill status={job.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-night truncate">{job.id}</p>
                    <p className="text-[10px] text-night/50 mt-0.5 capitalize">
                      {job.stage.replace('_', ' ')} · {job.trigger} · {formatRelative(job.updatedAt)}
                    </p>
                  </div>
                  {job.confidence && (
                    <span className="text-[10px] font-bold text-pitch tabular-nums">
                      {job.confidence.score}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </DashCard>

        {/* Job detail */}
        <JobDetail job={selectedJob} />
      </div>
    </div>
  );
}

function SummaryTile({ label, value, variant }: { label: string; value: number; variant: string }) {
  const variants: Record<string, string> = {
    running: 'text-blue-400 bg-blue-500/10',
    completed: 'text-pitch bg-pitch/10',
    pending: 'text-night/60 bg-black/[0.04]',
    failed: 'text-red-400 bg-red-500/10',
  };
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-4 flex items-center gap-3">
      <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-lg', variants[variant])}>
        {value}
      </span>
      <div>
        <p className="font-display font-bold text-sm text-night">{label}</p>
        <p className="text-[10px] uppercase tracking-wider text-night/40">jobs</p>
      </div>
    </div>
  );
}

function JobDetail({ job }: { job: PipelineJob }) {
  const totalTokensIn = job.agentResults.reduce((sum, r) => sum + (r.tokensIn || 0), 0);
  const totalTokensOut = job.agentResults.reduce((sum, r) => sum + (r.tokensOut || 0), 0);
  const totalDuration = job.agentResults.reduce((sum, r) => sum + (r.durationMs || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <DashCard>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusPill status={job.status} />
              <span className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">
                {job.id} · {job.trigger} trigger
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-night capitalize">
              {job.stage.replace('_', ' ')} stage
            </h3>
            <p className="text-xs text-night/55 mt-1">
              Created {formatRelative(job.createdAt)} · Updated {formatRelative(job.updatedAt)}
              {job.completedAt && ` · Completed ${formatRelative(job.completedAt)}`}
            </p>
            {job.error && (
              <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-semibold text-red-400 mb-0.5">Error</p>
                <p className="text-xs text-night/70 font-mono">{job.error}</p>
              </div>
            )}
          </div>
          {job.confidence && (
            <div className="text-center shrink-0">
              <ConfidenceRing score={job.confidence.score} size={64} />
              <p className="text-[10px] uppercase tracking-wider text-night/50 mt-1.5 font-semibold">
                Confidence
              </p>
            </div>
          )}
        </div>
      </DashCard>

      {/* Stage timeline */}
      <DashCard title="Agent timeline" subtitle="Five-stage editorial pipeline">
        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const result = job.agentResults.find((r) => r.agent === stage.id);
            const isLast = idx === STAGES.length - 1;
            return (
              <div key={stage.id} className="flex gap-3">
                {/* Vertical connector */}
                <div className="shrink-0 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md',
                      result?.status === 'completed' && `bg-gradient-to-br ${stage.color}`,
                      result?.status === 'running' && 'bg-blue-500/30 border border-blue-400/40 text-blue-400',
                      result?.status === 'failed' && 'bg-red-500/30 border border-red-400/40 text-red-400',
                      result?.status === 'skipped' && 'bg-black/[0.04] border border-black/0.10 text-night/40',
                      !result && 'bg-black/[0.04] border border-black/0.10 text-night/40',
                    )}
                  >
                    {result?.status === 'completed' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                    )}
                    {result?.status === 'running' && (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                    )}
                    {result?.status === 'failed' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    )}
                    {result?.status === 'skipped' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                    )}
                    {!result && idx + 1}
                  </div>
                  {!isLast && (
                    <div className={cn(
                      'w-px flex-1 min-h-[24px] mt-1',
                      result?.status === 'completed' ? 'bg-pitch/30' : 'bg-black/[0.06]',
                    )} />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-display font-bold text-sm text-night">{stage.label}</p>
                    {result && <StatusPill status={result.status} />}
                  </div>
                  <p className="text-xs text-night/50 mb-2">{stage.desc}</p>

                  {result && result.status !== 'pending' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] mt-2">
                      <Stat label="Duration" value={`${(result.durationMs / 1000).toFixed(1)}s`} />
                      <Stat label="Tokens in" value={result.tokensIn?.toLocaleString() || '—'} />
                      <Stat label="Tokens out" value={result.tokensOut?.toLocaleString() || '—'} />
                      <Stat label="Model" value={result.model || '—'} />
                    </div>
                  )}
                  {result?.error && (
                    <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                      <p className="text-[11px] text-red-400 font-mono">{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DashCard>

      {/* Totals + Confidence breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashCard title="Run totals" subtitle="Tokens & duration">
          <div className="grid grid-cols-2 gap-3">
            <StatBig label="Tokens in" value={totalTokensIn.toLocaleString()} />
            <StatBig label="Tokens out" value={totalTokensOut.toLocaleString()} />
            <StatBig label="Duration" value={`${(totalDuration / 1000).toFixed(1)}s`} />
            <StatBig label="Est. cost" value={`$${((totalTokensIn + totalTokensOut) * 0.000002).toFixed(4)}`} />
          </div>
        </DashCard>

        {job.confidence && (
          <DashCard title="Confidence breakdown" subtitle="Weighted blend">
            <div className="space-y-2.5">
              {[
                { label: 'Source tier', weight: 40, value: job.confidence.breakdown.sourceTier },
                { label: 'Cross-reference', weight: 30, value: job.confidence.breakdown.crossReference },
                { label: 'Entity match', weight: 20, value: job.confidence.breakdown.entityMatch },
                { label: 'Historical', weight: 10, value: job.confidence.breakdown.historical },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-night/70">{row.label}</span>
                    <span className="text-night tabular-nums">
                      {Math.round(row.value * 100)}% <span className="text-night/40">×{row.weight / 100}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
                    <div
                      className="h-full pitch-gradient rounded-full transition-all duration-700"
                      style={{ width: `${row.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-night/60 italic pt-2 border-t border-black/0.5">
                "{job.confidence.rationale}"
              </p>
            </div>
          </DashCard>
        )}
      </div>

      {/* Guardian monitor — the silent supervisor */}
      <GuardianMonitor job={job} />
    </div>
  );
}

/**
 * GuardianMonitor — displays the Guardian agent's report for this job.
 *
 * Shows:
 *   - Overall status (healthy / issues_found / fixed / escalated)
 *   - Issues detected (with severity badges)
 *   - Fixes applied (with before/after values)
 *   - Learnings recorded (new patterns for future monitoring)
 *   - Override decision (approve / hold / reject / fix_applied)
 *   - Confidence adjustment
 *
 * If no Guardian report exists for this job, shows a "monitoring" state.
 */
function GuardianMonitor({ job }: { job: PipelineJob }) {
  // In a real app, the Guardian report would be stored in job.metadata.guardianReport
  // For the mock data, we simulate a report based on job status
  const guardianReport = (job.metadata?.guardianReport) as {
    status: string;
    issues: Array<{ severity: string; agent: string; description: string; autoFixable: boolean }>;
    fixes: Array<{ description: string; field?: string; oldValue?: string; newValue?: string; success: boolean }>;
    learnings: string[];
    overrideDecision: string;
    rationale: string;
    confidenceAdjustment: number;
  } | undefined;

  // Simulate a Guardian report for mock jobs
  const simulatedReport = guardianReport || {
    status: job.status === 'failed' ? 'issues_found' : 'healthy',
    issues: job.status === 'failed'
      ? [{ severity: 'critical', agent: 'writer', description: job.error || 'Writer agent timed out', autoFixable: false }]
      : [],
    fixes: [],
    learnings: job.status === 'failed'
      ? ['Writer tends to timeout on long-form content — consider pre-splitting articles over 1500 words']
      : [],
    overrideDecision: job.status === 'failed' ? 'hold' : 'approve',
    rationale: job.status === 'failed'
      ? 'Writer failure detected. Holding for manual review. Learning recorded for future prevention.'
      : 'Pipeline is healthy. All agents completed successfully. No issues detected.',
    confidenceAdjustment: 0,
  };

  const statusColors: Record<string, string> = {
    healthy: 'bg-pitch/12 text-pitch-darker',
    issues_found: 'bg-amber-500/12 text-amber-700',
    fixed: 'bg-pitch/12 text-pitch-darker',
    escalated: 'bg-red-500/12 text-red-600',
  };

  const severityColors: Record<string, string> = {
    critical: 'bg-red-500/12 text-red-600',
    warning: 'bg-amber-500/12 text-amber-700',
    info: 'bg-blue-500/12 text-blue-700',
  };

  const decisionColors: Record<string, string> = {
    approve: 'bg-pitch/12 text-pitch-darker',
    hold: 'bg-amber-500/12 text-amber-700',
    reject: 'bg-red-500/12 text-red-600',
    fix_applied: 'bg-pitch/12 text-pitch-darker',
  };

  return (
    <DashCard
      title="Guardian monitor"
      subtitle="The silent supervisor — runs in the background, auto-fixes issues, and learns"
      action={
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider', statusColors[simulatedReport.status] || statusColors.healthy)}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            {simulatedReport.status === 'healthy' && <path d="m9 12 2 2 4-4" />}
          </svg>
          {simulatedReport.status.replace('_', ' ')}
        </span>
      }
    >
      {/* Override decision + rationale */}
      <div className="mb-4 p-3 rounded-xl bg-cream/60 border border-black/[0.06]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">Override decision</span>
          <span className={cn('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', decisionColors[simulatedReport.overrideDecision] || decisionColors.approve)}>
            {simulatedReport.overrideDecision.replace('_', ' ')}
          </span>
          {simulatedReport.confidenceAdjustment !== 0 && (
            <span className={cn(
              'inline-flex px-2 py-0.5 rounded text-[10px] font-bold tabular-nums',
              simulatedReport.confidenceAdjustment > 0 ? 'bg-pitch/12 text-pitch-darker' : 'bg-red-500/12 text-red-600',
            )}>
              {simulatedReport.confidenceAdjustment > 0 ? '+' : ''}{simulatedReport.confidenceAdjustment} conf
            </span>
          )}
        </div>
        <p className="text-xs text-night/65 italic">{simulatedReport.rationale}</p>
      </div>

      {/* Issues */}
      {simulatedReport.issues.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold mb-2">Issues detected</p>
          <ul className="space-y-2">
            {simulatedReport.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-black/[0.06] bg-white/50">
                <span className={cn('shrink-0 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider', severityColors[issue.severity] || severityColors.info)}>
                  {issue.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-night/85">{issue.description}</p>
                  <p className="text-[10px] text-night/40 mt-0.5">Agent: {issue.agent} · {issue.autoFixable ? 'Auto-fixable' : 'Needs human review'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fixes */}
      {simulatedReport.fixes.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold mb-2">Fixes applied</p>
          <ul className="space-y-2">
            {simulatedReport.fixes.map((fix, i) => (
              <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-pitch/15 bg-pitch/5">
                <svg className="shrink-0 mt-0.5 text-pitch-darker" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 7" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-night/85">{fix.description}</p>
                  {fix.field && (
                    <p className="text-[10px] text-night/40 mt-0.5">
                      Field: {fix.field}
                      {fix.oldValue && <span className="ml-2">Old: "{fix.oldValue.slice(0, 40)}…"</span>}
                      {fix.newValue && <span className="ml-2">New: "{fix.newValue.slice(0, 40)}…"</span>}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learnings */}
      {simulatedReport.learnings.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold mb-2">Learnings recorded</p>
          <ul className="space-y-1.5">
            {simulatedReport.learnings.map((learning, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-night/65">
                <svg className="shrink-0 mt-0.5 text-gold-dark" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {learning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Provider note */}
      <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center gap-2">
        <svg className="text-night/40" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <p className="text-[10px] text-night/40">
          Guardian uses Gemini exclusively — separate from Nvidia/Groq used by other agents · Authority: highest
        </p>
      </div>
    </DashCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/[0.03] border border-black/0.5 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-night/40 font-semibold">{label}</p>
      <p className="text-[11px] text-night/85 font-mono mt-0.5 truncate">{value}</p>
    </div>
  );
}

function StatBig({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] border border-black/0.5 p-3">
      <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">{label}</p>
      <p className="font-display font-bold text-lg text-night tabular-nums mt-1">{value}</p>
    </div>
  );
}

export default PipelineTab;
