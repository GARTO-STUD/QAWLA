import { NextRequest, NextResponse } from 'next/server';
import { addDoc, deleteDoc, isFirebaseConfigured, listDocs, setDoc } from '@/lib/firebase';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { rateLimit, getClientId } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

type Ad = {
  id: string;
  title: string;
  advertiser?: string;
  imageUrl?: string;
  targetUrl: string;
  pages: string[];
  startsAt: string;
  endsAt: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

async function admin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

function cleanUrl(value: unknown, allowEmpty = false) {
  if (typeof value !== 'string' || (!value && !allowEmpty)) throw new Error('Invalid URL');
  if (!value && allowEmpty) return '';
  const u = new URL(value);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http/https URLs are allowed');
  return u.toString();
}

function normalize(body: Record<string, unknown>, existing?: Ad): Omit<Ad, 'id' | 'createdAt'> {
  const title = String(body.title ?? '').trim().slice(0, 140);
  const advertiser = String(body.advertiser ?? '').trim().slice(0, 100);
  const targetUrl = cleanUrl(body.targetUrl);
  const imageUrl = body.imageUrl ? cleanUrl(body.imageUrl, true) : '';
  const pages = Array.isArray(body.pages) ? body.pages.map(String).filter((p) => p.startsWith('/')).slice(0, 20) : [];
  const startsAt = new Date(String(body.startsAt)).toISOString();
  const endsAt = new Date(String(body.endsAt)).toISOString();
  if (!title || !pages.length || !Number.isFinite(Date.parse(startsAt)) || !Number.isFinite(Date.parse(endsAt)) || new Date(endsAt) <= new Date(startsAt)) throw new Error('Invalid ad data');
  return { title, advertiser, imageUrl, targetUrl, pages, startsAt, endsAt, active: body.active !== false, priority: Math.max(0, Math.min(100, Number(body.priority ?? 0) || 0)), updatedAt: new Date().toISOString() };
}

export async function GET(req: NextRequest) {
  const rl = rateLimit('api', getClientId(req));
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  if (!isFirebaseConfigured()) return NextResponse.json({ ads: [] });
  try {
    const { data } = await listDocs<Ad>('ads', { pageSize: 100, orderBy: 'priority', orderDirection: 'DESCENDING' });
    const isAdmin = !!(await admin(req));
    if (isAdmin && req.nextUrl.searchParams.get('admin') === '1') return NextResponse.json({ ads: data });
    const page = req.nextUrl.searchParams.get('page') || '/';
    const now = Date.now();
    const ads = data.filter((ad) => ad.active && ad.pages.includes(page) && Date.parse(ad.startsAt) <= now && Date.parse(ad.endsAt) > now).sort((a,b) => b.priority - a.priority);
    return NextResponse.json({ ads: ads.slice(0, 3) }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (e) {
    console.error('[ads] GET failed', e);
    return NextResponse.json({ error: 'Unable to load ads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rl = rateLimit('ingest', getClientId(req));
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  try {
    const body = await req.json() as Record<string, unknown>;
    const now = new Date().toISOString();
    const data = normalize(body);
    const id = await addDoc('ads', { ...data, createdAt: now });
    await setDoc('ads', id, { id, ...data, createdAt: now });
    return NextResponse.json({ ok: true, ad: { id, ...data, createdAt: now } });
  } catch (e) {
    console.error('[ads] POST failed', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid ad' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json() as Record<string, unknown>;
    const id = String(body.id ?? '');
    if (!/^[A-Za-z0-9_-]{8,150}$/.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const { data } = await listDocs<Ad>('ads', { pageSize: 100 });
    const existing = data.find((x) => x.id === id);
    if (!existing) return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    const updated = normalize({ ...existing, ...body }, existing);
    await setDoc('ads', id, { ...updated, createdAt: existing.createdAt });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[ads] PATCH failed', e);
    return NextResponse.json({ error: 'Unable to update ad' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const id = req.nextUrl.searchParams.get('id') || '';
    if (!/^[A-Za-z0-9_-]{8,150}$/.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    await deleteDoc('ads', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[ads] DELETE failed', e);
    return NextResponse.json({ error: 'Unable to delete ad' }, { status: 500 });
  }
}
