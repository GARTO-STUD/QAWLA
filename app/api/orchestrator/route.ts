import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { verifySession, readCookie, SESSION_COOKIE } from '@/lib/session';
import { createJob, runPipeline, type OrchestratorContext } from '@/lib/orchestrator';
import { DEFAULT_SOURCES, ingestSource } from '@/lib/ingestion';
import type { PipelineJob, RawEvent } from '@/types';

// In-memory job store (per isolate). In production, persist to Firestore.
const jobStore = new Map<string, PipelineJob>();

export async function GET(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('read', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  // Pipeline job data (raw event ids, per-agent errors, draft article ids for
  // unpublished stories) is internal editorial data, not public content —
  // this previously had no auth check at all, unlike POST/PATCH on this same
  // route, and would leak that data to anyone.
  const cookieHeader = req.headers.get('cookie');
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);

  let jobs = Array.from(jobStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (status) jobs = jobs.filter((j) => j.status === status);
  jobs = jobs.slice(0, limit);

  return NextResponse.json({ jobs, total: jobStore.size }, { headers: rateLimitHeaders(rl) });
}

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('pipeline', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  // Auth
  const cookieHeader = req.headers.get('cookie');
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders(rl) });
  }

  let body: { trigger?: PipelineJob['trigger']; sourceIds?: string[]; skipPublish?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // Default trigger: manual
  }

  // Ingest events from requested sources (or all)
  const sources = body.sourceIds?.length
    ? DEFAULT_SOURCES.filter((s) => body.sourceIds!.includes(s.id))
    : DEFAULT_SOURCES;

  let allEvents: RawEvent[] = [];
  for (const source of sources.slice(0, 3)) {
    try {
      const events = await ingestSource(source);
      allEvents = allEvents.concat(events);
    } catch { /* ignore source failures */ }
  }

  if (allEvents.length === 0) {
    return NextResponse.json(
      { error: 'No events to process', code: 'no_events' },
      { status: 400, headers: rateLimitHeaders(rl) },
    );
  }

  const job = createJob({
    trigger: body.trigger ?? 'manual',
    rawEventId: allEvents[0]!.id,
  });
  jobStore.set(job.id, job);

  const ctx: OrchestratorContext = { job, events: allEvents.slice(0, 8) };

  try {
    const result = await runPipeline(ctx, { skipPublish: body.skipPublish });
    jobStore.set(job.id, result.job);
    return NextResponse.json(
      { job: result.job, article: result.article, confidence: result.confidence },
      { headers: rateLimitHeaders(rl) },
    );
  } catch (err) {
    const failed = job;
    failed.status = 'failed';
    failed.error = err instanceof Error ? err.message : String(err);
    jobStore.set(failed.id, failed);
    return NextResponse.json(
      { error: failed.error, job: failed },
      { status: 500, headers: rateLimitHeaders(rl) },
    );
  }
}

export async function PATCH(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('pipeline', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  const cookieHeader = req.headers.get('cookie');
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders(rl) });
  }

  let body: { jobId?: string; status?: PipelineJob['status']; stage?: PipelineJob['stage'] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  if (!body.jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  const job = jobStore.get(body.jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: rateLimitHeaders(rl) });
  }

  if (body.status) job.status = body.status;
  if (body.stage) job.stage = body.stage;
  job.updatedAt = new Date().toISOString();
  jobStore.set(job.id, job);

  return NextResponse.json({ job }, { headers: rateLimitHeaders(rl) });
}
