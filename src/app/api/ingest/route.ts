import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { verifySession, readCookie, SESSION_COOKIE } from '@/lib/session';
import { DEFAULT_SOURCES, ingestSource } from '@/lib/ingestion';
import type { RawEvent } from '@/types';

// In-memory event store (per isolate). In production, this is Firestore.
const eventStore = new Map<string, RawEvent[]>();

export async function GET(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('read', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  const sources = DEFAULT_SOURCES.map((s) => ({
    id: s.id,
    name: s.name,
    tier: s.tier,
    type: s.type,
    active: s.active,
    feedUrl: s.feedUrl,
    lastPolledAt: s.lastPolledAt,
  }));

  const totalEvents = Array.from(eventStore.values()).reduce((sum, evs) => sum + evs.length, 0);

  return NextResponse.json({
    sources,
    totalEvents,
    recentEvents: Array.from(eventStore.values()).flat().slice(-20).reverse(),
  }, { headers: rateLimitHeaders(rl) });
}

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('ingest', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  // Auth check — only admins can trigger ingestion
  const cookieHeader = req.headers.get('cookie');
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rl) },
    );
  }

  let body: { sourceIds?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine — ingest all sources
  }

  const sources = body.sourceIds?.length
    ? DEFAULT_SOURCES.filter((s) => body.sourceIds!.includes(s.id))
    : DEFAULT_SOURCES;

  const results: Array<{ sourceId: string; ingested: number; error?: string }> = [];
  let totalIngested = 0;

  for (const source of sources) {
    try {
      const events = await ingestSource(source);
      // Dedupe by rawHash
      const existing = eventStore.get(source.id) ?? [];
      const existingHashes = new Set(existing.map((e) => e.rawHash));
      const newEvents = events.filter((e) => !existingHashes.has(e.rawHash));
      eventStore.set(source.id, [...existing, ...newEvents].slice(-200));
      results.push({ sourceId: source.id, ingested: newEvents.length });
      totalIngested += newEvents.length;
    } catch (err) {
      results.push({
        sourceId: source.id,
        ingested: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ingested: totalIngested,
    sources: results,
    timestamp: new Date().toISOString(),
  }, { headers: rateLimitHeaders(rl) });
}
