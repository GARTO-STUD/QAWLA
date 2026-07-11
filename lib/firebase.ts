// Qawla — Firestore REST API client using Web Crypto for JWT signing
// No Google SDK required; works on Cloudflare Workers via fetch + Web Crypto.

import type { AdminUser } from '@/types';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

interface FirestoreJwtHeader {
  alg: 'RS256';
  typ: 'JWT';
  kid: string;
}

interface FirestoreJwtPayload {
  iss: string; // client_email
  sub: string;
  aud: 'https://oauth2.googleapis.com/token';
  iat: number;
  exp: number;
  scope: 'https://www.googleapis.com/auth/datastore';
}

let _cachedAccessToken: { token: string; expiresAt: number } | null = null;
let _privateKey: CryptoKeyPair | null = null;

function b64url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function strToB64url(input: string): string {
  return b64url(new TextEncoder().encode(input));
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(cleaned);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const der = pemToArrayBuffer(pem);
  return crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function signJwt(payload: FirestoreJwtPayload): Promise<string> {
  const serviceEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyPem = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!serviceEmail || !privateKeyPem) {
    throw new Error('Firebase service account credentials not configured');
  }
  const header: FirestoreJwtHeader = { alg: 'RS256', typ: 'JWT', kid: '' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: FirestoreJwtPayload = {
    ...payload,
    iss: serviceEmail,
    sub: serviceEmail,
    iat: now,
    exp: now + 3600,
  };
  const encHeader = strToB64url(JSON.stringify(header));
  const encPayload = strToB64url(JSON.stringify(fullPayload));
  const signInput = `${encHeader}.${encPayload}`;
  const key = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signInput),
  );
  return `${signInput}.${b64url(signature)}`;
}

async function getAccessToken(): Promise<string> {
  if (_cachedAccessToken && _cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return _cachedAccessToken.token;
  }
  const jwt = await signJwt({
    iss: '',
    sub: '',
    aud: 'https://oauth2.googleapis.com/token',
    iat: 0,
    exp: 0,
    scope: 'https://www.googleapis.com/auth/datastore',
  } as FirestoreJwtPayload);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to mint access token: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  _cachedAccessToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

function projectId(): string {
  const id = process.env.FIREBASE_PROJECT_ID;
  if (!id) throw new Error('FIREBASE_PROJECT_ID not set');
  return id;
}

function docUrl(collection: string, id?: string): string {
  const base = `${FIRESTORE_BASE}/projects/${projectId()}/databases/(default)/documents/${collection}`;
  return id ? `${base}/${id}` : base;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/** Firestore stores values wrapped in typed objects like { stringValue: "x" } */
function unwrap(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object') return value;
  const v = value as Record<string, unknown>;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue as { values?: unknown[] }).values?.map(unwrap) ?? [];
  if ('mapValue' in v) {
    const fields = (v.mapValue as { fields?: Record<string, unknown> }).fields ?? {};
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) out[k] = unwrap(val);
    return out;
  }
  if ('nullValue' in v) return null;
  return value;
}

function wrap(value: unknown): unknown {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(wrap) } };
  if (typeof value === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(value as Record<string, unknown>)) fields[k] = wrap(val);
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

export interface FirestoreDoc {
  name: string;
  fields: Record<string, unknown>;
  createTime?: string;
  updateTime?: string;
}

export async function getDoc<T = unknown>(collection: string, id: string): Promise<T | null> {
  const token = await getAccessToken();
  const res = await fetch(docUrl(collection, id), { headers: authHeaders(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getDoc failed: ${res.status}`);
  const doc = (await res.json()) as FirestoreDoc;
  return unwrap(doc.fields) as T;
}

export async function listDocs<T = unknown>(collection: string, opts?: {
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
  orderDirection?: 'ASCENDING' | 'DESCENDING';
  /**
   * NOT supported by Firestore's `documents.list` REST endpoint — there is no
   * generic `filter` query parameter there (only `orderBy`/`pageSize`/`pageToken`
   * are recognized; anything else is silently ignored by the API, which would
   * make this function return ALL documents while callers believed the result
   * was filtered). Use `queryDocs()` instead, which uses the `:runQuery`
   * endpoint and implements real structured filtering.
   */
  filter?: never;
}): Promise<{ data: T[]; nextPageToken?: string }> {
  const token = await getAccessToken();
  const params = new URLSearchParams();
  if (opts?.pageSize) params.set('pageSize', String(opts.pageSize));
  if (opts?.pageToken) params.set('pageToken', opts.pageToken);
  if (opts?.orderBy) {
    // Firestore's REST `orderBy` param encodes direction INLINE in the same
    // string (e.g. "publishedAt desc") — there is no separate
    // `orderDirection` query parameter. The previous version sent
    // `orderBy=field&orderDirection=DESCENDING`, which Firestore ignores,
    // silently falling back to ascending order.
    const direction = (opts.orderDirection ?? 'DESCENDING') === 'DESCENDING' ? 'desc' : 'asc';
    params.set('orderBy', `${opts.orderBy} ${direction}`);
  }
  const url = `${docUrl(collection)}?${params}`;
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`listDocs failed: ${res.status}`);
  const json = (await res.json()) as { documents?: FirestoreDoc[]; nextPageToken?: string };
  const data = (json.documents ?? []).map((d) => unwrap(d.fields) as T);
  return { data, nextPageToken: json.nextPageToken };
}

export async function setDoc<T = unknown>(collection: string, id: string, data: T): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(docUrl(collection, id), {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ fields: wrap(data as unknown as Record<string, unknown>) }),
  });
  if (!res.ok) throw new Error(`setDoc failed: ${res.status} ${await res.text()}`);
}

export async function addDoc<T = unknown>(collection: string, data: T): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(docUrl(collection), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ fields: wrap(data as unknown as Record<string, unknown>) }),
  });
  if (!res.ok) throw new Error(`addDoc failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { name: string };
  const parts = json.name.split('/');
  return parts[parts.length - 1];
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(docUrl(collection, id), { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok && res.status !== 404) throw new Error(`deleteDoc failed: ${res.status}`);
}

const FIRESTORE_OP_MAP: Record<string, string> = {
  '==': 'EQUAL',
  '!=': 'NOT_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  'array-contains': 'ARRAY_CONTAINS',
  'in': 'IN',
  'array-contains-any': 'ARRAY_CONTAINS_ANY',
};

export async function queryDocs<T = unknown>(collection: string, opts: {
  field: string;
  op: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any';
  value: unknown;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'ASCENDING' | 'DESCENDING';
}): Promise<T[]> {
  const token = await getAccessToken();
  const structuredQuery = {
    from: [{ collectionId: collection }],
    where: {
      fieldFilter: {
        field: { fieldPath: opts.field },
        // Firestore's REST API requires the enum name (e.g. "EQUAL"), not the
        // symbolic operator ("=="). Sending "==" directly, as the previous
        // version did, gets rejected with a 400 on every single call —
        // including getAdminByEmail(), which meant admin login could never
        // actually succeed against a real Firestore backend.
        op: FIRESTORE_OP_MAP[opts.op],
        value: wrap(opts.value),
      },
    },
    ...(opts.limit ? { limit: opts.limit } : {}),
    ...(opts.orderBy ? {
      orderBy: [{ field: { fieldPath: opts.orderBy }, direction: opts.orderDirection ?? 'DESCENDING' }],
    } : {}),
  };
  const url = `${FIRESTORE_BASE}/projects/${projectId()}/databases/(default)/documents:runQuery`;
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ structuredQuery }),
  });
  if (!res.ok) throw new Error(`queryDocs failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as Array<{ document?: FirestoreDoc }>;
  return json
    .filter((entry) => entry.document)
    .map((entry) => unwrap(entry.document!.fields) as T);
}

/** Convenience: check if Firebase is configured */
export function isFirebaseConfigured(): boolean {
  return !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

/** Get admin user by email (for session auth) */
export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  if (!isFirebaseConfigured()) return null;
  const users = await queryDocs<AdminUser>('admins', { field: 'email', op: '==', value: email, limit: 1 });
  return users[0] ?? null;
}
