import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import type { WebVitalsMetric } from '@/types';

// This endpoint receives beacons from components/WebVitals.tsx. It did not
// exist at all — WebVitals.tsx has been computing real LCP/CLS/INP/FCP/TTFB
// metrics and calling `navigator.sendBeacon('/api/vitals', ...)` on every
// page load, but every single beacon was 404-ing silently (sendBeacon never
// surfaces delivery failures to the caller), so none of that data was ever
// actually collected.
//
// This is intentionally minimal: it validates the payload shape and logs it.
// Wire this up to real storage (Firestore, an analytics provider, etc.) once
// there's a concrete place you want this data to end up — bolting on an
// unverified persistence layer here would be a bigger product decision than
// "make the 404 go away".

const VALID_NAMES = new Set(['CLS', 'LCP', 'FID', 'INP', 'TTFB', 'FCP']);
const VALID_RATINGS = new Set(['good', 'needs-improvement', 'poor']);

function isValidMetric(x: unknown): x is WebVitalsMetric {
  if (!x || typeof x !== 'object') return false;
  const m = x as Record<string, unknown>;
  return (
    typeof m.name === 'string' && VALID_NAMES.has(m.name) &&
    typeof m.value === 'number' &&
    typeof m.rating === 'string' && VALID_RATINGS.has(m.rating) &&
    typeof m.pathname === 'string' &&
    typeof m.timestamp === 'number'
  );
}

export async function POST(req: Request) {
  const clientId = getClientId(req);
  // sendBeacon can fire once per Core Web Vital per page load (up to ~5) —
  // 'read' is the lightest preset available and fits this low-stakes,
  // no-auth-required endpoint.
  const rl = rateLimit('read', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  let body: unknown;
  try {
    // sendBeacon posts a Blob with type 'application/json'; Next.js's
    // req.json() handles that the same as a normal JSON body.
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  if (!isValidMetric(body)) {
    return NextResponse.json({ error: 'Invalid metric payload' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  // Minimal viable landing spot: structured server log. Cheap, safe, and
  // gives you something to grep/aggregate from Cloudflare's log stream
  // immediately, without committing to a specific analytics backend here.
  console.log('[web-vitals]', JSON.stringify(body));

  return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(rl) });
}
