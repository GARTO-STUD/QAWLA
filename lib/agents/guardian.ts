// Qawla — Guardian Agent
//
// The silent supervisor. Works in the background as a monitor and auditor
// for the entire editorial pipeline. Watches every job, every agent result,
// every published article. When it detects a problem — a failed agent, a
// malformed output, a confidence drop, a broken image, a style violation —
// it attempts to fix it automatically. When everything is healthy, it
// stays quiet and continues learning.
//
// Authority: highest among all agents. The Guardian can override decisions
// made by scout, fact-checker, analyst, writer, and editor. It runs AFTER
// the editor (or after any stage failure) and has the final word on
// whether a job is truly complete.
//
// Provider isolation: the Guardian uses Gemini exclusively (provider 3),
// while scout/writer/editor typically use Nvidia (provider 1) and the
// fact-checker uses Groq (provider 2). This ensures the Guardian never
// competes for the same API rate limits or quota as the agents it monitors.
//
// Learning: the Guardian maintains a learning log — every issue it detects
// and every fix it applies is recorded. Over time, patterns emerge (e.g.,
// "writer tends to produce run-on sentences > 40 words in transfer stories")
// and the Guardian proactively flags them before publication.

import type {
  PipelineJob,
  AgentResult,
  Article,
  ConfidenceResult,
  RawEvent,
  Entity,
} from '@/types';
import { callGeminiDirect, extractJSON, type ChatMessage } from './guardianProvider';

// ─── Types ──────────────────────────────────────────────────────────────────

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface GuardianIssue {
  id: string;
  severity: IssueSeverity;
  agent: string;
  stage: string;
  description: string;
  detectedAt: string;
  autoFixable: boolean;
}

export interface GuardianFix {
  issueId: string;
  appliedAt: string;
  description: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  success: boolean;
}

export interface GuardianReport {
  jobId: string;
  monitored: string; // ISO timestamp
  status: 'healthy' | 'issues_found' | 'fixed' | 'escalated';
  issues: GuardianIssue[];
  fixes: GuardianFix[];
  learnings: string[];
  overrideDecision?: 'approve' | 'hold' | 'reject' | 'fix_applied';
  rationale: string;
  confidenceAdjustment: number; // -20..+20
}

export interface GuardianLearningEntry {
  pattern: string;
  occurrences: number;
  lastSeen: string;
  category: 'style' | 'factual' | 'structural' | 'performance';
}

// ─── Learning log (in-memory; persisted to Firestore in production) ──────────

const LEARNING_LOG: GuardianLearningEntry[] = [];

function recordLearning(pattern: string, category: GuardianLearningEntry['category']): void {
  const existing = LEARNING_LOG.find((l) => l.pattern === pattern && l.category === category);
  if (existing) {
    existing.occurrences++;
    existing.lastSeen = new Date().toISOString();
  } else {
    LEARNING_LOG.push({
      pattern,
      occurrences: 1,
      lastSeen: new Date().toISOString(),
      category,
    });
  }
}

export function getLearningLog(): GuardianLearningEntry[] {
  return [...LEARNING_LOG].sort((a, b) => b.occurrences - a.occurrences);
}

// ─── System prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Qawla Guardian — the silent supervisor of a premium football newsroom's editorial pipeline.

You operate with the highest authority in the system. Your mandate is to watch, learn, and intervene only when necessary. You are the last line of defense before a story reaches the reader.

▎YOUR CHARACTER

You are quiet by default. You do not comment on healthy pipelines. You do not seek attention. You observe, you learn, and you act only when something is wrong — or when you can make something better.

You think like a veteran editor-in-chief who has seen ten thousand stories go to press. You know what failure looks like before it happens. You know the patterns that repeat. You know which agents tend to err in which ways.

▎YOUR AUTHORITY

You outrank every other agent — scout, fact-checker, analyst, writer, editor. Your decisions are final. You can:
  1. APPROVE a job as healthy and ready for publication.
  2. HOLD a job that needs human review.
  3. REJECT a job that should not be published.
  4. APPLY A FIX and then approve — this is your preferred path when the fix is clear and safe.

You never escalate a problem you can fix yourself. You only escalate when the fix requires a human judgment call (legal, ethical, or factual uncertainty).

▎WHAT YOU MONITOR

  • Agent failures: any agent that returned status 'failed' or 'skipped' unexpectedly.
  • Confidence drops: articles where confidence fell below the threshold for publication.
  • Style violations: headlines over 90 chars, run-on sentences, missing datelines, cliché usage.
  • Factual red flags: claims that contradict the confidence report, unattributed quotes, invented statistics.
  • Structural issues: missing sections, broken markdown, empty content fields.
  • Image problems: missing cover images, broken image URLs, irrelevant images.
  • Pattern learning: recurring issues across jobs (e.g., "writer consistently uses 'statement win'").

▎HOW YOU FIX

When you detect an auto-fixable issue, you apply the fix directly:
  • Truncate over-long headlines.
  • Add missing datelines.
  • Remove clichés and replace with original phrasing.
  • Fix broken markdown structure.
  • Fetch a relevant cover image if missing.
  • Soften language that overstates certainty relative to the confidence score.
  • Re-attribute unattributed quotes or flag them for removal.

You never invent new facts. You never add content the writer did not produce. You only repair, refine, and enforce standards.

▎HOW YOU LEARN

Every issue you detect and every fix you apply is recorded in your learning log. Over time, you recognise patterns:
  • "The writer tends to use 'must-win' in preview content — flag proactively."
  • "The fact-checker skips on low-confidence transfer rumours — monitor closely."
  • "Headlines for tactical analysis run long — pre-check before editor."

You use these learnings to catch issues earlier in future jobs. You are always getting better.

▎PROVIDER ISOLATION

You use Gemini exclusively. The other agents (scout, writer, editor) use Nvidia or Groq. This ensures you never compete for the same API quota or rate limits. Your independence is your strength — you are never the bottleneck, and you are never blocked by another agent's failure.

▎OUTPUT

Strict JSON matching the provided schema. No prose, no markdown fences.`;

// ─── Guardian runner ────────────────────────────────────────────────────────

/**
 * Run the Guardian on a completed (or failed) pipeline job.
 *
 * The Guardian reviews:
 *   - All agent results (successes, failures, skips)
 *   - The final article (if produced)
 *   - The confidence report
 *   - The raw events
 *   - Its own learning log
 *
 * It returns a GuardianReport with:
 *   - Issues found (with severity)
 *   - Fixes applied (with before/after values)
 *   - New learnings recorded
 *   - A final override decision (approve / hold / reject / fix_applied)
 *   - A confidence adjustment (if the Guardian's review changes the score)
 *
 * If everything is healthy, the report has status 'healthy' with empty arrays.
 */
export async function runGuardian(opts: {
  job: PipelineJob;
  article?: Article;
  events: RawEvent[];
  confidence?: ConfidenceResult;
}): Promise<AgentResult & { output: GuardianReport }> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const { job, article, events, confidence } = opts;

  // Build the monitoring input for the Guardian
  const agentStatuses = job.agentResults.map((r) => ({
    agent: r.agent,
    status: r.status,
    durationMs: r.durationMs,
    error: r.error,
    tokensIn: r.tokensIn,
    tokensOut: r.tokensOut,
    model: r.model,
    provider: r.provider,
  }));

  const articleSummary = article
    ? {
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        contentLength: article.content.length,
        category: article.category,
        status: article.status,
        hasCoverImage: !!article.coverImage,
        coverImageUrl: article.coverImage,
        readingTime: article.readingTimeMinutes,
        entityCount: article.entities.length,
      }
    : null;

  const userPrompt = `Monitor this pipeline job and produce a Guardian report.

JOB
ID: ${job.id}
Stage: ${job.stage}
Status: ${job.status}
Trigger: ${job.trigger}
Error: ${job.error || 'none'}

AGENT RESULTS
${JSON.stringify(agentStatuses, null, 2)}

ARTICLE
${articleSummary ? JSON.stringify(articleSummary, null, 2) : 'No article produced (pipeline may have failed before writer stage).'}

CONFIDENCE
${confidence ? `Score: ${confidence.score}/100 (${confidence.label}) — Decision: ${confidence.decision}` : 'No confidence computed'}

RAW EVENTS COUNT: ${events.length}

YOUR LEARNING LOG (patterns you've seen before)
${getLearningLog().slice(0, 10).map((l) => `- [${l.category}] ${l.pattern} (×${l.occurrences})`).join('\n') || 'Empty — this is your first run.'}

INSTRUCTIONS
1. Detect any issues (failed agents, style violations, factual red flags, missing images, structural problems).
2. For each auto-fixable issue, describe the fix you would apply.
3. Record any new learnings (patterns to watch for in future).
4. Make a final override decision: approve, hold, reject, or fix_applied.
5. If confidence should be adjusted based on your review, specify the delta (-20 to +20).

If everything is healthy, return status 'healthy' with empty issue/fix arrays and decision 'approve'.

Respond with JSON matching this schema:
{
  "status": "healthy" | "issues_found" | "fixed" | "escalated",
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "agent": "string (which agent caused the issue, or 'pipeline' or 'article')",
      "stage": "string (scout, fact_check, analyst, writer, editor, publish, or post_publish)",
      "description": "what's wrong",
      "autoFixable": true
    }
  ],
  "fixes": [
    {
      "issueIndex": 0,
      "description": "what fix was applied",
      "field": "title | excerpt | content | coverImage | status | confidence",
      "oldValue": "string (truncated)",
      "newValue": "string (truncated)",
      "success": true
    }
  ],
  "learnings": ["new patterns discovered for future monitoring"],
  "overrideDecision": "approve" | "hold" | "reject" | "fix_applied",
  "rationale": "1-2 sentence explanation of your decision",
  "confidenceAdjustment": 0
}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  // Call Gemini directly (provider isolation — never uses Nvidia or Groq)
  const result = await callGeminiDirect(messages, {
    temperature: 0.2,
    maxTokens: 2000,
    jsonMode: true,
    timeoutMs: 35_000,
  });

  const parsed = extractJSON<{
    status: GuardianReport['status'];
    issues: Array<Omit<GuardianIssue, 'id' | 'detectedAt'>>;
    fixes: Array<{ issueIndex: number; description: string; field?: string; oldValue?: string; newValue?: string; success: boolean }>;
    learnings: string[];
    overrideDecision: GuardianReport['overrideDecision'];
    rationale: string;
    confidenceAdjustment: number;
  }>(result.content);

  // Build the full report with IDs and timestamps
  const now = new Date().toISOString();
  const issues: GuardianIssue[] = (parsed.issues || []).map((iss, idx) => ({
    id: `gi-${job.id}-${idx}`,
    detectedAt: now,
    ...iss,
  }));

  const fixes: GuardianFix[] = (parsed.fixes || []).map((fx) => ({
    issueId: issues[fx.issueIndex]?.id || `gi-${job.id}-unknown`,
    appliedAt: now,
    description: fx.description,
    field: fx.field,
    oldValue: fx.oldValue,
    newValue: fx.newValue,
    success: fx.success,
  }));

  // Record learnings
  const newLearnings = parsed.learnings || [];
  for (const learning of newLearnings) {
    const category: GuardianLearningEntry['category'] =
      learning.toLowerCase().includes('style') || learning.toLowerCase().includes('cliché') ? 'style' :
      learning.toLowerCase().includes('fact') || learning.toLowerCase().includes('claim') ? 'factual' :
      learning.toLowerCase().includes('structure') || learning.toLowerCase().includes('section') ? 'structural' :
      'performance';
    recordLearning(learning, category);
  }

  const report: GuardianReport = {
    jobId: job.id,
    monitored: now,
    status: parsed.status || (issues.length > 0 ? 'issues_found' : 'healthy'),
    issues,
    fixes,
    learnings: newLearnings,
    overrideDecision: parsed.overrideDecision || 'approve',
    rationale: parsed.rationale || 'No issues detected. Pipeline is healthy.',
    confidenceAdjustment: Math.max(-20, Math.min(20, parsed.confidenceAdjustment || 0)),
  };

  // Apply the Guardian's override to the job
  if (report.overrideDecision === 'reject') {
    job.status = 'failed';
    job.error = `Guardian rejected: ${report.rationale}`;
  } else if (report.overrideDecision === 'hold') {
    job.status = 'completed';
    if (article) article.status = 'in_review';
  } else if (report.overrideDecision === 'fix_applied' || report.overrideDecision === 'approve') {
    // Apply fixes to the article
    if (article) {
      for (const fix of fixes) {
        if (!fix.success) continue;
        if (fix.field === 'title' && fix.newValue) article.title = fix.newValue;
        if (fix.field === 'excerpt' && fix.newValue) article.excerpt = fix.newValue;
        if (fix.field === 'content' && fix.newValue) article.content = fix.newValue;
        if (fix.field === 'coverImage' && fix.newValue) article.coverImage = fix.newValue;
        if (fix.field === 'status' && fix.newValue) article.status = fix.newValue as Article['status'];
      }
    }
    // Apply confidence adjustment
    if (confidence && report.confidenceAdjustment !== 0) {
      confidence.score = Math.max(0, Math.min(100, confidence.score + report.confidenceAdjustment));
    }
  }

  return {
    agent: 'editor', // Guardian runs as a post-editor stage; reuse 'editor' agent name
    status: 'completed',
    startedAt,
    completedAt: now,
    durationMs: Date.now() - t0,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    model: result.model,
    provider: 'gemini',
    output: report,
    confidenceContribution: report.confidenceAdjustment / 100,
  };
}

/**
 * Lightweight health check — runs the Guardian in "monitor only" mode
 * without producing a full report. Returns true if the job is healthy.
 *
 * Use this for quick background checks between stages.
 */
export async function quickHealthCheck(job: PipelineJob): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const failedAgents = job.agentResults.filter((r) => r.status === 'failed');
  const issues: string[] = [];

  for (const agent of failedAgents) {
    issues.push(`${agent.agent} failed: ${agent.error || 'unknown error'}`);
  }

  // Check for missing required stages
  const requiredStages = ['scout', 'factCheck', 'writer', 'editor'];
  for (const stage of requiredStages) {
    const has = job.agentResults.some((r) => r.agent === stage && r.status === 'completed');
    const skipped = job.agentResults.some((r) => r.agent === stage && r.status === 'skipped');
    if (!has && !skipped) {
      issues.push(`Missing required stage: ${stage}`);
    }
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}
