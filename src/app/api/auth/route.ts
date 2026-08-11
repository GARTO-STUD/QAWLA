import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import {
  createSession,
  verifySession,
  verifyPassword,
  readCookie,
  serializeCookie,
  clearCookie,
  SESSION_COOKIE,
} from '@/lib/session';

// Production must use a derived password hash. There is deliberately no
// default/fallback password.
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function GET(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('auth', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  const cookieHeader = req.headers.get('cookie');
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  if (!token) {
    return NextResponse.json({ authenticated: false }, { headers: rateLimitHeaders(rl) });
  }
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { headers: { 'Set-Cookie': clearCookie(), ...rateLimitHeaders(rl) } },
    );
  }
  return NextResponse.json(
    {
      authenticated: true,
      user: { id: session.userId, email: session.email, name: session.name, role: session.role },
      expiresAt: session.expiresAt,
    },
    { headers: rateLimitHeaders(rl) },
  );
}

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('auth', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) });
  }

  const { password } = body;
  if (!password) {
    return NextResponse.json(
      { authenticated: false, error: 'Password required' },
      { status: 400, headers: rateLimitHeaders(rl) },
    );
  }

  if (!ADMIN_PASSWORD_HASH) {
    return NextResponse.json(
      { authenticated: false, error: 'Server authentication is not configured' },
      { status: 503, headers: rateLimitHeaders(rl) },
    );
  }

  const passwordOk = await verifyPassword(password, ADMIN_PASSWORD_HASH);

  if (!passwordOk) {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid password' },
      { status: 401, headers: rateLimitHeaders(rl) },
    );
  }

  const adminUser = {
    id: 'admin-001',
    email: 'admin@qawla.com',
    name: 'Qawla Admin',
    role: 'admin' as const,
    createdAt: new Date('2024-01-01').toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const { token, cookie, expiresAt } = await createSession(adminUser);
  void token;
  return NextResponse.json(
    {
      authenticated: true,
      user: { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role },
      expiresAt,
    },
    { headers: { 'Set-Cookie': cookie, ...rateLimitHeaders(rl) } },
  );
}

export async function DELETE(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('auth', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  return NextResponse.json(
    { authenticated: false },
    { headers: { 'Set-Cookie': clearCookie(), ...rateLimitHeaders(rl) } },
  );
}
