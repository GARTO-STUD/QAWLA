import { describe, it, expect } from 'vitest';
import {
  createSession,
  verifySession,
  clearCookie,
  readCookie,
  serializeCookie,
  SESSION_COOKIE,
  hashPassword,
  verifyPassword,
  cryptoRandom,
} from '../lib/session';
import type { AdminUser } from '../types';

// Set the JWT secret for tests
process.env.ADMIN_JWT_SECRET = 'test-secret-at-least-32-characters-long-for-hmac-signing';
process.env.NODE_ENV = 'test';

const mockUser: AdminUser = {
  id: 'admin-test-001',
  email: 'editor@qawla.com',
  name: 'Test Editor',
  role: 'admin',
  createdAt: new Date('2024-01-01').toISOString(),
};

describe('session', () => {
  describe('createSession + verifySession', () => {
    it('creates a verifiable session token', async () => {
      const { token, expiresAt } = await createSession(mockUser);
      expect(token).toBeTruthy();
      expect(token.split('.').length).toBe(3); // header.payload.signature

      const session = await verifySession(token);
      expect(session).not.toBeNull();
      expect(session!.userId).toBe(mockUser.id);
      expect(session!.email).toBe(mockUser.email);
      expect(session!.name).toBe(mockUser.name);
      expect(session!.role).toBe('admin');
      expect(session!.expiresAt).toBe(expiresAt);
    });

    it('rejects tampered tokens', async () => {
      const { token } = await createSession(mockUser);
      const tampered = token.slice(0, -4) + 'AAAA';
      const session = await verifySession(tampered);
      expect(session).toBeNull();
    });

    it('rejects malformed tokens', async () => {
      expect(await verifySession('')).toBeNull();
      expect(await verifySession('not.a.jwt')).toBeNull();
      expect(await verifySession('just-a-string')).toBeNull();
    });

    it('rejects tokens signed with a different secret', async () => {
      const { token } = await createSession(mockUser);
      const original = process.env.ADMIN_JWT_SECRET;
      process.env.ADMIN_JWT_SECRET = 'different-secret-also-at-least-32-chars-long';
      const session = await verifySession(token);
      expect(session).toBeNull();
      process.env.ADMIN_JWT_SECRET = original;
    });
  });

  describe('cookie helpers', () => {
    it('clearCookie returns a Max-Age=0 cookie', () => {
      const cookie = clearCookie();
      expect(cookie).toContain(`${SESSION_COOKIE}=`);
      expect(cookie).toContain('Max-Age=0');
      expect(cookie).toContain('HttpOnly');
    });

    it('readCookie extracts value from cookie header', () => {
      const header = `other=foo; ${SESSION_COOKIE}=abc.def.ghi; another=bar`;
      expect(readCookie(header, SESSION_COOKIE)).toBe('abc.def.ghi');
    });

    it('readCookie returns null for missing cookie', () => {
      expect(readCookie(null, SESSION_COOKIE)).toBeNull();
      expect(readCookie('other=foo', SESSION_COOKIE)).toBeNull();
    });

    it('serializeCookie produces a valid Set-Cookie value', () => {
      const cookie = serializeCookie('name', 'value', Math.floor(Date.now() / 1000) + 3600);
      expect(cookie).toContain('name=value');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Strict');
    });
  });

  describe('password hashing', () => {
    it('hashes and verifies a password', async () => {
      const password = 'my-secret-password';
      const hash = await hashPassword(password);
      expect(hash).toMatch(/^pbkdf2\$100000\$/);
      expect(await verifyPassword(password, hash)).toBe(true);
    });

    it('rejects wrong password', async () => {
      const hash = await hashPassword('correct-password');
      expect(await verifyPassword('wrong-password', hash)).toBe(false);
    });

    it('rejects malformed hash', async () => {
      expect(await verifyPassword('password', 'not-a-hash')).toBe(false);
      expect(await verifyPassword('password', 'pbkdf2$1000$salt$hash')).toBe(false);
    });
  });

  describe('cryptoRandom', () => {
    it('returns a URL-safe base64 string of expected length', () => {
      const r = cryptoRandom(32);
      expect(r).toBeTruthy();
      expect(r.length).toBeGreaterThan(20);
      // URL-safe base64 alphabet only
      expect(r).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('produces unique values', () => {
      const a = cryptoRandom(16);
      const b = cryptoRandom(16);
      expect(a).not.toBe(b);
    });
  });
});

describe('session env validation', () => {
  it('throws if ADMIN_JWT_SECRET is missing', async () => {
    const original = process.env.ADMIN_JWT_SECRET;
    delete process.env.ADMIN_JWT_SECRET;
    await expect(createSession(mockUser)).rejects.toThrow('ADMIN_JWT_SECRET');
    process.env.ADMIN_JWT_SECRET = original;
  });

  it('throws if ADMIN_JWT_SECRET is too short', async () => {
    const original = process.env.ADMIN_JWT_SECRET;
    process.env.ADMIN_JWT_SECRET = 'too-short';
    await expect(createSession(mockUser)).rejects.toThrow('32 chars');
    process.env.ADMIN_JWT_SECRET = original;
  });
});
