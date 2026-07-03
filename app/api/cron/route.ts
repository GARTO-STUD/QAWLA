import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitHeaders } from '@/lib/rateLimit';
import { createJob, runPipeline, type OrchestratorContext } from '@/lib/orchestrator';
import { DEFAULT_SOURCES, ingestSource } from '@/lib/ingestion';
import { createBackup } from '@/lib/backup';
import type { RawEvent } from '@/types';

// Cron-triggered ingestion + pipeline + daily backup.
// Protect with a shared secret via the X-Cron-Secret header.
// Configure in Cloudflare Workers Cron Triggers (see wrangler.toml).
//
// Schedule:
//   0 */6 * * *  → ingestion + pipeline (every 6 hours)
//   0 3 * * *     → daily backup (3 AM UTC — runs automatically when cron fires)

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('pipeline', clientId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  // Auth: cron secret OR admin session
  const cronSecret = req.headers.get('x-cron-secret');
  if (CRON_SECRET && cronSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rl) },
    );
  }

  // 1. Ingest from all active sources
  const sources = DEFAULT_SOURCES.filter((s) => s.active && s.feedUrl);
  const allEvents: RawEvent[] = [];
  for (const source of sources) {
    try {
      const events = await ingestSource(source);
      allEvents.push(...events);
    } catch (err) {
      console.error(`Ingestion failed for ${source.name}:`, err);
    }
  }

  // 2. Dedupe by rawHash
  const seen = new Set<string>();
  const deduped = allEvents.filter((e) => {
    if (seen.has(e.rawHash)) return false;
    seen.add(e.rawHash);
    return true;
  });

  // 3. Group by primary entity cluster (simplified: one job per top-N events)
  const topEvents = deduped.slice(0, 5);
  const jobs: Array<{ jobId: string; status: string; articleId?: string; confidence?: number; error?: string }> = [];

  for (const event of topEvents) {
    const job = createJob({ trigger: 'cron', rawEventId: event.id });
    const ctx: OrchestratorContext = {
      job,
      events: deduped.filter((e) =>
        e.entities.some((en) => event.entities.some((een) => en.name === een.name)),
      ).slice(0, 8),
    };
    try {
      const result = await runPipeline(ctx, { skipPublish: false });
      jobs.push({
        jobId: result.job.id,
        status: result.job.status,
        articleId: result.article?.id,
        confidence: result.confidence?.score,
      });
    } catch (err) {
      jobs.push({
        jobId: job.id,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 4. Daily backup (runs on every cron trigger, but createBackup deduplicates by date)
  let backupResult: { status: string; id?: string; error?: string } | null = null;
  try {
    const metadata = await createBackup('cron');
    backupResult = { status: 'completed', id: metadata.id };
  } catch (err) {
    backupResult = { status: 'failed', error: err instanceof Error ? err.message : String(err) };
    console.error('[cron] Backup failed:', err);
  }

  return NextResponse.json({
    ingested: deduped.length,
    jobsRun: jobs.length,
    jobs,
    backup: backupResult,
    timestamp: new Date().toISOString(),
  }, { headers: rateLimitHeaders(rl) });
}
