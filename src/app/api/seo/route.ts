import { NextResponse } from 'next/server';
import { verifySession, readCookie, SESSION_COOKIE } from '@/lib/session';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { runSEOAgent } from '@/lib/agents/seo';
import type { Article } from '@/types';

export async function POST(req: Request) {
  const rl = rateLimit('pipeline', getClientId(req));
  if (!rl.allowed) return rateLimitedResponse(rl);
  const token = readCookie(req.headers.get('cookie'), SESSION_COOKIE);
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders(rl) });

  try {
    const body = await req.json();
    if (!body?.article || typeof body.article !== 'object') {
      return NextResponse.json({ error: 'article required' }, { status: 400, headers: rateLimitHeaders(rl) });
    }
    const article = body.article as Article;
    if (!article.title || !article.content || !article.slug) {
      return NextResponse.json({ error: 'title, content and slug are required' }, { status: 400, headers: rateLimitHeaders(rl) });
    }
    const result = await runSEOAgent(article);
    return NextResponse.json({ result }, { headers: rateLimitHeaders(rl) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'SEO audit failed' }, { status: 500, headers: rateLimitHeaders(rl) });
  }
}
