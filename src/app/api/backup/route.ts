/**
 * /api/backup — Backup management (admin only)
 *
 * GET  ?action=list                 → List all backups
 * GET  ?action=get&id=...           → Download a backup as JSON
 * GET  ?action=status               → Backup system status
 * POST  { action: 'create' }        → Create a manual backup
 * POST  { action: 'restore', id }   → Restore from a backup
 * DELETE ?id=...                    → Delete a backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { rateLimit, getClientId, rateLimitHeaders } from '@/lib/rateLimit';
import {
  createBackup, listBackups, getBackup, deleteBackup, restoreBackup,
} from '@/lib/backup';
import { isFirebaseConfigured } from '@/lib/firebase';


export async function OPTIONS() {
  return new NextResponse(null);
}

async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return (await verifySession(token)) !== null;
}

export async function GET(req: NextRequest) {
  const rl = rateLimit('api', getClientId(req));
  if (!rl.allowed) return new NextResponse(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } });
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const action = req.nextUrl.searchParams.get('action') || 'list';
  try {
    if (action === 'list') {
      const backups = await listBackups();
      return NextResponse.json({ backups, count: backups.length });
    }
    if (action === 'status') {
      const backups = await listBackups();
      const last = backups[0];
      return NextResponse.json({
        configured: isFirebaseConfigured(),
        totalBackups: backups.length,
        lastBackupAt: last?.createdAt || null,
        lastBackupSize: last?.sizeBytes || 0,
        lastBackupStatus: last?.status || 'none',
      });
    }
    if (action === 'get') {
      const id = req.nextUrl.searchParams.get('id');
      if (!id || !/^backup_[A-Za-z0-9_-]{8,80}$/.test(id)) return NextResponse.json({ error: 'Invalid backup id' }, { status: 400 });
      const snapshot = await getBackup(id);
      if (!snapshot) return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
      return new NextResponse(JSON.stringify(snapshot, null, 2), {
        headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="${id}.json"` },
      });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('[backup] request failed:', e);
    return NextResponse.json({ error: 'Backup operation failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rl = rateLimit('ingest', getClientId(req));
  if (!rl.allowed) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }
  try {
    const body = await req.json().catch(() => ({})) as { action?: string; id?: string };
    if (body.action === 'create') {
      const metadata = await createBackup('manual');
      return NextResponse.json({ ok: true, backup: metadata });
    }
    if (body.action === 'restore') {
      if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
      const result = await restoreBackup(body.id);
      return NextResponse.json({ ok: true, restored: result });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('[backup] request failed:', e);
    return NextResponse.json({ error: 'Backup operation failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const rl = rateLimit('api', getClientId(req));
  if (!rl.allowed) return new NextResponse(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } });
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id || !/^backup_[A-Za-z0-9_-]{8,80}$/.test(id)) return NextResponse.json({ error: 'Invalid backup id' }, { status: 400 });
  try {
    await deleteBackup(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[backup] request failed:', e);
    return NextResponse.json({ error: 'Backup operation failed' }, { status: 500 });
  }
}
