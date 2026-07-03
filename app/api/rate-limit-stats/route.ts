/**
 * /api/rate-limit-stats — Rate limiting statistics (admin only)
 *
 * GET → Returns live rate limit stats: total requests, blocked requests,
 *       per-preset breakdown, top blocked IPs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { getRateLimitStats } from '@/lib/rateLimit';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });

  const stats = getRateLimitStats();
  return NextResponse.json(stats, { headers: CORS });
}
