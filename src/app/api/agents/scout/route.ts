import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { verifySession, readCookie, SESSION_COOKIE } from '@/lib/session';
import { runScout } from '@/lib/agents/scout';
import { computeConfidence } from '@/lib/confidence';
import { DEFAULT_SOURCES } from '@/lib/ingestion';
import type { RawEvent, ConfidenceResult } from '@/types';

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

  let body: { events?: RawEvent[]; confidence?: ConfidenceResult } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json(
      { error: 'events array required' },
      { status: 400, headers: rateLimitHeaders(rl) },
    );
  }

  const confidence = body.confidence ?? computeConfidence(body.events, DEFAULT_SOURCES);

  try {
    const result = await runScout(body.events, confidence);
    return NextResponse.json({ result }, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    return NextResponse.json(
      { error: 'Scout agent failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: rateLimitHeaders(rl) },
    );
  }
}

export async function GET(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('read', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  return NextResponse.json({
    agent: 'scout',
    description: 'First-pass intake: triages raw events, deduplicates, ranks by signal strength, extracts entities.',
    input: { events: 'RawEvent[]', confidence: 'ConfidenceResult (optional)' },
    output: 'ScoutReport',
  }, { headers: rateLimitHeaders(rl) });
}
