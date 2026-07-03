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
import { runAnalyst } from '@/lib/agents/analyst';
import { runWriter } from '@/lib/agents/writer';
import { runEditor } from '@/lib/agents/editor';
import { runGuardian } from '@/lib/agents/guardian';
import { computeConfidence, applyPolicy } from '@/lib/confidence';
import { DEFAULT_SOURCES } from '@/lib/ingestion';

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const STAGE_ORDER: JobStage[] = [
  'ingest', 'scout', 'fact_check', 'analyst', 'writer', 'editor', 'publish', 'complete',
];

export function nextStage(current: JobStage): JobStage | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx === STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1]!;
}

export function createJob(opts: { trigger: PipelineJob['trigger']; rawEventId?: string; articleId?: string }): PipelineJob {
  const now = new Date().toISOString();
  return {
    id: randomId(),
    stage: 'ingest',
    status: 'pending',
    trigger: opts.trigger,
    rawEventId: opts.rawEventId,
    articleId: opts.articleId,
    agentResults: [],
    createdAt: now,
    updatedAt: now,
  };
}

function markResult(job: PipelineJob, result: AgentResult): void {
  const existing = job.agentResults.findIndex((r) => r.agent === result.agent);
  if (existing >= 0) job.agentResults[existing] = result;
  else job.agentResults.push(result);
  job.updatedAt = new Date().toISOString();
}

export interface OrchestratorContext {
  job: PipelineJob;
  events: RawEvent[];
  existingArticle?: Article;
}

/** Run scout → factCheck → analyst → writer → editor with policy-aware gating. */
export async function runPipeline(
  ctx: OrchestratorContext,
  options: { skipPublish?: boolean } = {},
): Promise<{ job: PipelineJob; article?: Article; confidence?: ConfidenceResult }> {
  const { job, events } = ctx;
  job.status = 'running';
  job.updatedAt = new Date().toISOString();

  // Compute confidence up-front (used by all downstream stages)
  const sources = DEFAULT_SOURCES.filter((s) => events.some((e) => e.sourceId === s.id));
  const confidence = computeConfidence(events, sources.length > 0 ? sources : DEFAULT_SOURCES);
  job.confidence = confidence;

  const policyDecision = applyPolicy({
    confidence,
    isTransfer: events.some((e) => e.category === 'transfers'),
  });

  // Stage: Scout
  job.stage = 'scout';
  let scoutResult: AgentResult;
  try {
    const out = await runScout(events, confidence);
    scoutResult = out;
    markResult(job, out);
  } catch (err) {
    scoutResult = failResult('scout', err);
    markResult(job, scoutResult);
    job.status = 'failed';
    job.error = scoutResult.error;
    return { job };
  }

  // Stage: Fact-check — skip only if decision is reject
  if (policyDecision === 'reject') {
    job.stage = 'fact_check';
    markResult(job, skipResult('factCheck', 'Rejected by confidence gate'));
  } else {
    job.stage = 'fact_check';
    try {
      const out = await runFactCheck(events, scoutResult);
      markResult(job, out);
    } catch (err) {
      markResult(job, failResult('factCheck', err));
      // Fact-check failures don't kill the pipeline; we proceed with caution
    }
  }

  // Stage: Analyst — only for tactical / analysis content
  const isAnalysis = events.some((e) =>
    e.category === 'tactical' || e.category === 'reviews' || e.category === 'previews');
  if (isAnalysis && policyDecision !== 'reject') {
    job.stage = 'analyst';
    try {
      const out = await runAnalyst(events, confidence);
      markResult(job, out);
    } catch (err) {
      markResult(job, failResult('analyst', err));
    }
  } else {
    markResult(job, skipResult('analyst', 'Not analysis content'));
  }

  // Stage: Writer — only if decision is publish or hold
  if (policyDecision === 'reject') {
    job.stage = 'writer';
    markResult(job, skipResult('writer', 'Rejected by confidence gate'));
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    return { job, confidence };
  }

  job.stage = 'writer';
  let article: Article | undefined;
  try {
    const out = await runWriter(events, confidence, ctx.existingArticle);
    markResult(job, out);
    article = out.output as Article;
  } catch (err) {
    markResult(job, failResult('writer', err));
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : String(err);
    return { job, confidence };
  }

  // Stage: Editor
  job.stage = 'editor';
  try {
    const out = await runEditor(article, confidence);
    markResult(job, out);
    article = out.output as Article;
  } catch (err) {
    markResult(job, failResult('editor', err));
    // Editor failure: keep writer's draft
  }

  // Stage: Guardian — the silent supervisor runs after the editor.
  // Uses Gemini exclusively (separate from Nvidia/Groq used by other agents).
  // Monitors the full pipeline, auto-fixes issues, and has final override authority.
  job.stage = 'publish'; // reuse publish stage for Guardian (post-editor)
  try {
    const guardianResult = await runGuardian({ job, article, events, confidence });
    // Store the Guardian's report in the job metadata
    if (!job.metadata) job.metadata = {};
    job.metadata.guardianReport = guardianResult.output;
    // The Guardian may have modified the article or confidence in place
    if (guardianResult.output.overrideDecision === 'reject') {
      job.status = 'failed';
      job.error = guardianResult.output.rationale;
      job.completedAt = new Date().toISOString();
      return { job, article, confidence };
    }
  } catch (err) {
    // Guardian failure is non-fatal — the pipeline can still publish
    if (!job.metadata) job.metadata = {};
    job.metadata.guardianError = err instanceof Error ? err.message : String(err);
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
