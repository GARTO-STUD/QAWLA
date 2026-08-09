// Qawla — HMAC-signed JWT admin sessions (no external deps)
// Tokens are stateless: header.payload.signature, signed with HMAC-SHA256.

import type { AdminSession, AdminUser } from '@/types';

const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const COOKIE_NAME = 'qawla_admin_session';

function getSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be set and at least 32 chars');
  }
  return secret;
}

function b64url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function strToB64url(input: string): string {
  return b64url(new TextEncoder().encode(input));
}

function b64urlToStr(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return b64url(sig);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSession(user: AdminUser): Promise<{ token: string; cookie: string; expiresAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SECONDS;
  const payload: AdminSession = {
    token: cryptoRandom(32),
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    issuedAt: now,
    expiresAt,
  };
  const header = { alg: 'HS256', typ: 'JWT' };
  const encHeader = strToB64url(JSON.stringify(header));
  const encPayload = strToB64url(JSON.stringify(payload));
  const signingInput = `${encHeader}.${encPayload}`;
  const signature = await hmacSign(signingInput, getSecret());
  const token = `${signingInput}.${signature}`;
  return {
    token,
    cookie: serializeCookie(COOKIE_NAME, token, expiresAt),
    expiresAt,
  };
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  if (!token || token.split('.').length !== 3) return null;
  const [encHeader, encPayload, signature] = token.split('.');
  const signingInput = `${encHeader}.${encPayload}`;
  const expectedSig = await hmacSign(signingInput, getSecret());
  if (!timingSafeEqual(signature, expectedSig)) return null;
  try {
    const payload = JSON.parse(b64urlToStr(encPayload)) as AdminSession;
    if (payload.expiresAt < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function cryptoRandom(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return b64url(bytes);
}

export function serializeCookie(name: string, value: string, expiresAt: number): string {
  const maxAge = expiresAt - Math.floor(Date.now() / 1000);
  return [
    `${name}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Strict',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

export function clearCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Strict',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

export function readCookie(cookieHeader: string | null, name: string = COOKIE_NAME): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? match[1] : null;
}

export const SESSION_COOKIE = COOKIE_NAME;

/** Hash a password using PBKDF2 (100k iterations, SHA-256) */
export async function hashPassword(password: string): Promise<string> {
  const salt = cryptoRandom(16);
  const iterations = 100_000;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' },
    key,
    256,
  );
  const hash = b64url(bits);
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const expected = parts[3];
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' },
    key,
    256,
  );
  const actual = b64url(bits);
  return timingSafeEqual(actual, expected);
}
