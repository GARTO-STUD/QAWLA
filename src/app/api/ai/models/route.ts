import { NextResponse } from 'next/server';
import { getConfiguredAIProviders } from '@/lib/aiWaterfall';
import { readCookie, SESSION_COOKIE, verifySession } from '@/lib/session';

async function isAdmin(req: Request) {
  const token = readCookie(req.headers.get('cookie'), SESSION_COOKIE);
  return !!(token && await verifySession(token));
}

export async function GET(req: Request) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const providers = getConfiguredAIProviders();
  return NextResponse.json({ providers, freeOnly: process.env.QAWLA_AI_FREE_ONLY === 'true' });
}
