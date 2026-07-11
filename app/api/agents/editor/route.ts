import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { verifySession, readCookie, SESSION_COOKIE } from '@/lib/session';
import { runEditor } from '@/lib/agents/editor';
import { computeConfidence } from '@/lib/confidence';
import { DEFAULT_SOURCES } from '@/lib/ingestion';
import { getArticleById, ARTICLES } from '@/lib/mockData';
import type { Article, ConfidenceResult } from '@/types';

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('pipeline', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  const cookieHeader = req.headers.get('cookie');
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders(rl) });
  }

  let body: { article?: Article; articleId?: string; confidence?: ConfidenceResult } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  let article = body.article;
  if (!article && body.articleId) {
    article = getArticleById(body.articleId) ?? ARTICLES[0];
  }
  if (!article) {
    return NextResponse.json(
      { error: 'article or articleId required' },
      { status: 400, headers: rateLimitHeaders(rl) },
    );
  }

  const confidence = body.confidence ?? article.confidence ?? computeConfidence([], DEFAULT_SOURCES);

  try {
    const result = await runEditor(article, confidence);
    return NextResponse.json({ result }, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    return NextResponse.json(
      { error: 'Editor agent failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: rateLimitHeaders(rl) },
    );
  }
}

export async function GET(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('read', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  return NextResponse.json({
    agent: 'editor',
    description: 'Final polish: structural edit, headline sharpening, fact-vs-prose consistency check, SEO meta, house-style enforcement.',
    input: { article: 'Article', articleId: 'string (alternative)', confidence: 'ConfidenceResult (optional)' },
    output: 'EditorReport & edited Article',
  }, { headers: rateLimitHeaders(rl) });
}
