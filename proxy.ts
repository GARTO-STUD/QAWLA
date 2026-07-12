// middleware.ts — Edge-level protection for /admin/*
//
// This runs BEFORE any page HTML/JS is sent to the browser, unlike the old
// client-side `useEffect` redirect in app/admin/page.tsx which still shipped
// the full admin bundle to unauthenticated visitors before redirecting them.
//
// Required because Next.js Middleware cannot import Node-only APIs — this
// file only uses Web Crypto (via lib/session.ts), which is Edge-safe.

import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import type { AdminSession } from '@/types';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page itself must stay reachable without a session.
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let session: AdminSession | null = null;
  try {
    session = token ? await verifySession(token) : null;
  } catch {
    // ADMIN_JWT_SECRET missing/invalid — fail closed (treat as unauthenticated)
    // rather than crashing the whole edge function for every /admin request.
    session = null;
  }

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protects every /admin route AND every /api/admin route (if you add one
  // later) at the edge, before any handler or page component runs.
  matcher: ['/admin/:path*'],
};
