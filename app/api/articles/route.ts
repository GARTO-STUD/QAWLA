import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { verifySession, readCookie, SESSION_COOKIE } from '@/lib/session';
import { ARTICLES, getArticleById } from '@/lib/mockData';
import type { Article, ArticleStatus, PaginatedResponse } from '@/types';

export async function GET(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('read', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const category = url.searchParams.get('category');
  const tag = url.searchParams.get('tag');
  const status = url.searchParams.get('status') as ArticleStatus | null;
  const search = url.searchParams.get('q');
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') ?? '20', 10), 100);

  // Single article lookup
  if (id) {
    const article = getArticleById(id);
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: rateLimitHeaders(rl) });
    }
    return NextResponse.json({ data: article }, { headers: rateLimitHeaders(rl) });
  }

  // List with filters
  let articles: Article[] = [...ARTICLES];
  if (category) articles = articles.filter((a) => a.category === category);
  if (tag) articles = articles.filter((a) => a.tags.includes(tag));
  if (status) articles = articles.filter((a) => a.status === status);
  if (search) {
    const q = search.toLowerCase();
    articles = articles.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)),
    );
  }

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const total = articles.length;
  const start = (page - 1) * pageSize;
  const data = articles.slice(start, start + pageSize);
  const response: PaginatedResponse<Article> = {
    data,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };

  return NextResponse.json(response, { headers: rateLimitHeaders(rl) });
}

export async function PATCH(req: Request) {
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

  let body: { id?: string; status?: ArticleStatus; featured?: boolean; trending?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id required' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  const article = getArticleById(body.id);
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404, headers: rateLimitHeaders(rl) });
  }

  // Note: in production this would PATCH Firestore. Here we return the would-be updated article.
  const updated: Article = {
    ...article,
    ...(body.status ? { status: body.status } : {}),
    ...(typeof body.featured === 'boolean' ? { featured: body.featured } : {}),
    ...(typeof body.trending === 'boolean' ? { trending: body.trending } : {}),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: updated }, { headers: rateLimitHeaders(rl) });
}
