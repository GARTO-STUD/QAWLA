import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';
import { DONATE_TIERS, ONE_TIME_TIERS } from '@/lib/mockData';
import type { DonateTier } from '@/types';

const ALL_TIERS: DonateTier[] = [...DONATE_TIERS, ...ONE_TIME_TIERS];

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('checkout', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  let body: { tierId?: string; email?: string; name?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  const tier = ALL_TIERS.find((t) => t.id === body.tierId);
  if (!tier) {
    return NextResponse.json(
      { error: 'Invalid tier', availableTiers: ALL_TIERS.map((t) => t.id) },
      { status: 400, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const session = await createCheckoutUrl({
      tier,
      email: body.email,
      name: body.name,
    });
    return NextResponse.json(session, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    return NextResponse.json(
      { error: 'Checkout failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: rateLimitHeaders(rl) },
    );
  }
}

export async function GET(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('read', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  return NextResponse.json(
    { tiers: ALL_TIERS },
    { headers: rateLimitHeaders(rl) },
  );
}
