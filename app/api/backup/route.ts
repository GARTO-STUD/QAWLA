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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return (await verifySession(token)) !== null;
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }
  const action = req.nextUrl.searchParams.get('action') || 'list';
  try {
    if (action === 'list') {
      const backups = await listBackups();
      return NextResponse.json({ backups, count: backups.length }, { headers: CORS });
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
      }, { headers: CORS });
    }
    if (action === 'get') {
      const id = req.nextUrl.searchParams.get('id');
      if (!id) return NextResponse.json({ error: 'id required' }, { status: 400, headers: CORS });
      const snapshot = await getBackup(id);
      if (!snapshot) return NextResponse.json({ error: 'Backup not found' }, { status: 404, headers: CORS });
      return new NextResponse(JSON.stringify(snapshot, null, 2), {
        headers: { ...CORS, 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="${id}.json"` },
      });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: CORS });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }
  const rl = rateLimit('ingest', getClientId(req));
  if (!rl.allowed) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { ...CORS, 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }
  try {
    const body = await req.json().catch(() => ({})) as { action?: string; id?: string };
    if (body.action === 'create') {
      const metadata = await createBackup('manual');
      return NextResponse.json({ ok: true, backup: metadata }, { headers: CORS });
    }
    if (body.action === 'restore') {
      if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400, headers: CORS });
      const result = await restoreBackup(body.id);
      return NextResponse.json({ ok: true, restored: result }, { headers: CORS });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: CORS });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400, headers: CORS });
  try {
    await deleteBackup(id);
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}
