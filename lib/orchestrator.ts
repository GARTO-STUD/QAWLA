// Qawla — Central job orchestrator
// Runs the AI pipeline stage by stage: ingest → scout → fact_check → analyst → writer → editor → publish
// Each stage produces an AgentResult; failures cascade based on policy.

import type {
  PipelineJob,
  AgentResult,
  JobStage,
  AgentStatus,
  RawEvent,
  Article,
  ConfidenceResult,
} from '@/types';
import { runScout } from '@/lib/agents/scout';
import { runFactCheck } from '@/lib/agents/factCheck';
import type { FactCheckReport } from '@/lib/agents/factCheck';
import { runAnalyst } from '@/lib/agents/analyst';
import type { TacticalReport } from '@/lib/agents/analyst';
import { runWriter } from '@/lib/agents/writer';
import { runEditor } from '@/lib/agents/editor';
import { runGuardian } from '@/lib/agents/guardian';
import { computeConfidence, applyPolicy, type DecisionContext } from '@/lib/confidence';
import { DEFAULT_SOURCES } from '@/lib/ingestion';

// ─── Context ─────────────────────────────────────────────────────────────────

/** Bundles a job with the raw events it should process. */
export interface OrchestratorContext {
  job: PipelineJob;
  events: RawEvent[];
}

/** Options for {@link runPipeline}. */
export interface PipelineOptions {
  /** Skip the publish stage (article stays in_review). */
  skipPublish?: boolean;
}

// ─── Job factory ─────────────────────────────────────────────────────────────

let JOB_COUNTER = 0;

/** Create a new pipeline job in the `ingest` stage. */
export function createJob(opts: {
  trigger: PipelineJob['trigger'];
  rawEventId?: string;
}): PipelineJob {
  const nowIso = new Date().toISOString();
  JOB_COUNTER += 1;
  const id = `job-${Date.now().toString(36)}-${JOB_COUNTER.toString(36)}`;
  return {
    id,
    stage: 'ingest',
    status: 'running',
    trigger: opts.trigger,
    rawEventId: opts.rawEventId,
    agentResults: [],
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function failResult(agent: AgentResult['agent'], err: unknown): AgentResult {
  return {
    agent,
    status: 'failed',
    startedAt: new Date().toISOString(),
    durationMs: 0,
    error: err instanceof Error ? err.message : String(err),
  };
}

function skipResult(agent: AgentResult['agent'], reason: string): AgentResult {
  return {
    agent,
    status: 'skipped',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: 0,
    error: reason,
  };
}

/** Record an agent result on the job and advance the stage pointer. */
function markResult(job: PipelineJob, result: AgentResult, stage?: JobStage): void {
  job.agentResults.push(result);
  if (stage) job.stage = stage;
  job.updatedAt = new Date().toISOString();
}

/** Derive a confidence score from the raw events + source catalog. */
function evaluateConfidence(events: RawEvent[]): ConfidenceResult {
  const sources = DEFAULT_SOURCES;
  const confidence = computeConfidence(events, sources);
  // Apply editorial policy on top of the raw confidence score.
  const ctx: DecisionContext = {
    confidence,
    isTransfer: events.some((e) => e.category === 'transfers'),
  };
  const decision = applyPolicy(ctx);
  return { ...confidence, decision };
}

/** Synthesize a draft Article from agent outputs + raw events. */
function synthesizeArticle(events: RawEvent[], confidence: ConfidenceResult): Article {
  const lead = events[0];
  const title = lead?.headline ?? 'Untitled story';
  const excerpt = lead?.summary ?? lead?.headline ?? '';
  const body = events
    .map((e) => `## ${e.headline}\n\n${e.summary ?? e.body ?? ''}`)
    .join('\n\n');
  const nowIso = new Date().toISOString();
  return {
    id: `art-${Date.now().toString(36)}`,
    slug: (lead?.headline ?? 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title,
    subtitle: 'Editorial analysis',
    excerpt,
    content: `## ${title}\n\n${body || 'Full article body...'}`,
    coverImage: lead?.image,
    category: lead?.category ?? 'news',
    tags: Array.from(new Set(events.flatMap((e) => e.tags))),
    contentType: 'news',
    status: 'in_review',
    author: { id: 'qawla_writer', name: 'Qawla Newsroom', handle: 'qawla', role: 'writer' },
    entities: Array.from(new Set(events.flatMap((e) => e.entities))),
    featured: false,
    trending: false,
    readingTimeMinutes: Math.max(2, Math.ceil(body.split(/\s+/).length / 200)),
    viewCount: 0,
    shareCount: 0,
    publishedAt: nowIso,
    updatedAt: nowIso,
    createdAt: nowIso,
    confidence,
    sourceIds: events.map((e) => e.sourceId),
  };
}

// ─── Pipeline runner ─────────────────────────────────────────────────────────

/**
 * Run the full editorial pipeline for a job.
 *
 * Stages: scout → fact_check → analyst → writer → editor → publish → complete
 * The analyst stage is skipped for non-analysis content. The publish stage is
 * skipped if `skipPublish` is set or the policy decision is not `publish`.
 */
export async function runPipeline(
  ctx: OrchestratorContext,
  options: PipelineOptions = {},
): Promise<{ job: PipelineJob; article: Article | null; confidence: ConfidenceResult | null }> {
  const { job } = ctx;
  const events = ctx.events;

  // 1. Confidence evaluation (drives downstream decisions)
  const confidence = evaluateConfidence(events);
  job.confidence = confidence;

  // 2. Scout
  job.stage = 'scout';
  try {
    const scoutResult = await runScout(events, confidence);
    markResult(job, scoutResult, 'fact_check');
    if (scoutResult.status === 'failed') {
      job.status = 'failed';
      job.error = scoutResult.error ?? 'Scout failed';
      return { job, article: null, confidence };
    }
  } catch (err) {
    markResult(job, failResult('scout', err), 'fact_check');
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : String(err);
    return { job, article: null, confidence };
  }

  // 3. Fact-check
  let factCheckReport: FactCheckReport | undefined;
  try {
    const scoutResult = job.agentResults[job.agentResults.length - 1]!;
    const factResult = await runFactCheck(events, scoutResult);
    markResult(job, factResult, 'analyst');
    if (factResult.status === 'failed') {
      job.status = 'failed';
      job.error = factResult.error ?? 'Fact-check failed';
      return { job, article: null, confidence };
    }
    factCheckReport = factResult.output as FactCheckReport | undefined;
  } catch (err) {
    markResult(job, failResult('factCheck', err), 'analyst');
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : String(err);
    return { job, article: null, confidence };
  }

  // 4. Analyst (only for tactical/analysis content)
  let analystReport: TacticalReport | undefined;
  const isAnalysis = events.some((e) => e.category === 'tactical' || e.category === 'previews');
  if (isAnalysis) {
    try {
      const analystResult = await runAnalyst(events, confidence);
      markResult(job, analystResult, 'writer');
      if (analystResult.status === 'completed') {
        analystReport = analystResult.output as TacticalReport | undefined;
      }
    } catch (err) {
      markResult(job, failResult('analyst', err), 'writer');
      // Analyst is optional — continue pipeline
    }
  } else {
    markResult(job, skipResult('analyst', 'Skipped (non-analysis content)'), 'writer');
  }

  // 5. Writer — produces the draft article
  let article: Article | null = null;
  try {
    // IMPORTANT: pass the actual fact-check and analyst reports through, and
    // use the Writer's real AI-generated article as the published content.
    // A previous version of this code called runWriter(events, confidence)
    // with no reports at all (so the Writer never saw verified claims or
    // tactical analysis), and then discarded writerResult.output entirely in
    // favor of synthesizeArticle() below — a plain concatenation of raw RSS
    // headlines/summaries under "## " headers, not AI prose. That meant the
    // whole multi-agent pipeline ran (and cost tokens) but the actual
    // published article was never the agents' real output.
    const writerResult = await runWriter(events, confidence, undefined, factCheckReport, analystReport);
    markResult(job, writerResult, 'editor');
    if (writerResult.status === 'failed') {
      job.status = 'failed';
      job.error = writerResult.error ?? 'Writer failed';
      return { job, article: null, confidence };
    }
    article = (writerResult.output as Article | undefined) ?? synthesizeArticle(events, confidence);
    job.articleId = article.id;
  } catch (err) {
    markResult(job, failResult('writer', err), 'editor');
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : String(err);
    return { job, article: null, confidence };
  }

  // 6. Editor
  const policyDecision = confidence.decision;
  try {
    const editorResult = await runEditor(article, confidence);
    markResult(job, editorResult, 'publish');
    if (editorResult.status === 'failed') {
      job.status = 'failed';
      job.error = editorResult.error ?? 'Editor failed';
      return { job, article, confidence };
    }
    // IMPORTANT: apply the Editor's actual polished output (sharpened
    // headline, tightened subtitle/excerpt, edited markdown, SEO/OG meta) to
    // the article that actually gets published. A previous version of this
    // code ran the Editor, logged its output for observability, but never
    // merged it into `article` — the Editor's `status` field was correctly
    // ignored (publish/reject stays governed by confidence policy below,
    // not the editor's own subjective publishReady judgment), but its
    // legitimate copy-editing work was thrown away too, along with it. The
    // published article was always the Writer's unedited first draft.
    const edited = editorResult.output as Article | undefined;
    if (edited && article) {
      article.title = edited.title || article.title;
      article.subtitle = edited.subtitle ?? article.subtitle;
      article.excerpt = edited.excerpt || article.excerpt;
      article.content = edited.content || article.content;
      article.ogImage = edited.ogImage ?? article.ogImage;
      article.updatedAt = edited.updatedAt ?? article.updatedAt;
      // NOTE: article.status is deliberately NOT taken from `edited` here —
      // it is governed solely by the confidence-derived `policyDecision`
      // below, never by the Editor's own subjective "publishReady" flag.
    }
  } catch (err) {
    markResult(job, failResult('editor', err), 'publish');
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : String(err);
    return { job, article, confidence };
  }

  // 7. Guardian — silent supervisor (best-effort, never blocks)
  try {
    const guardianResult = await runGuardian({ job, article, events, confidence });
    markResult(job, guardianResult);
  } catch (err) {
    markResult(job, failResult('guardian', err));
    // Guardian failure is non-fatal
  }

  // Stage: Publish
  job.stage = 'publish';
  if (options.skipPublish || policyDecision !== 'publish') {
    markResult(job, skipResult('editor', `Skipped publish (decision: ${policyDecision})`));
    if (article) article.status = 'in_review';
  } else if (article) {
    article.status = 'published';
    article.publishedAt = new Date().toISOString();
  }

  job.stage = 'complete';
  job.status = 'completed';
  job.completedAt = new Date().toISOString();
  return { job, article, confidence };
}

// ─── Read-only helpers (placeholders for future persistence) ─────────────────

/** Get the live status of a job (placeholder for future persistence). */
export async function getJobStatus(jobId: string): Promise<PipelineJob | null> {
  // In production, fetch from Firestore: jobs/${jobId}
  void jobId;
  return null;
}

/** List recent jobs (placeholder). */
export async function listJobs(opts: { limit?: number; status?: AgentStatus } = {}): Promise<PipelineJob[]> {
  void opts;
  return [];
}
