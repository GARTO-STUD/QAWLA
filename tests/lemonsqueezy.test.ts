import { describe, it, expect } from 'vitest';
import {
  createCheckoutUrl,
  verifyWebhookSignature,
  parseWebhookEvent,
} from '../lib/lemonsqueezy';
import type { DonateTier } from '../types';

process.env.NODE_ENV = 'test';

const mockTier: DonateTier = {
  id: 'tier_test',
  name: 'Test Tier',
  amount: 12,
  currency: 'USD',
  interval: 'monthly',
  description: 'Test tier',
  perks: ['perk1', 'perk2'],
  variantId: 'test-variant-123',
};

describe('lemonsqueezy', () => {
  describe('createCheckoutUrl', () => {
    it('returns a fallback URL when API credentials are missing', async () => {
      delete process.env.LEMONSQUEEZY_API_KEY;
      delete process.env.LEMONSQUEEZY_STORE_ID;

      const session = await createCheckoutUrl({ tier: mockTier });
      expect(session.url).toContain('test-variant-123');
      expect(session.tierId).toBe(mockTier.id);
      expect(session.amount).toBe(12);
      expect(session.currency).toBe('USD');
      expect(session.createdAt).toBeTruthy();
      expect(session.expiresAt).toBeTruthy();
    });

    it('respects embed flag in fallback URL', async () => {
      delete process.env.LEMONSQUEEZY_API_KEY;
      const session = await createCheckoutUrl({ tier: mockTier, embed: true });
      expect(session.url).toContain('embed=1');
    });

    it('passes through custom store slug', async () => {
      delete process.env.LEMONSQUEEZY_API_KEY;
      process.env.LEMONSQUEEZY_STORE_SLUG = 'my-store';
      const session = await createCheckoutUrl({ tier: mockTier });
      expect(session.url).toContain('my-store.lemonsqueezy.com');
      delete process.env.LEMONSQUEEZY_STORE_SLUG;
    });
  });

  describe('verifyWebhookSignature', () => {
    it('returns false when no signature provided', async () => {
      const ok = await verifyWebhookSignature('{"test":true}', null);
      expect(ok).toBe(false);
    });

    it('returns false when secret is not configured', async () => {
      delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
      const ok = await verifyWebhookSignature('{"test":true}', 'somesig');
      expect(ok).toBe(false);
    });

    it('verifies a correct signature', async () => {
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'test-secret';
      const body = '{"event":"test"}';
      // Lemon Squeezy signs the raw body with real HMAC-SHA256, using the
      // webhook secret as the HMAC key (NOT sha256(body + secret)).
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode('test-secret'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
      const bytes = new Uint8Array(sig);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');

      const ok = await verifyWebhookSignature(body, hex);
      expect(ok).toBe(true);
    });

    it('rejects an incorrect signature', async () => {
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'test-secret';
      const ok = await verifyWebhookSignature('{"test":true}', 'wrong-signature');
      expect(ok).toBe(false);
    });
  });

  describe('parseWebhookEvent', () => {
    it('parses a valid webhook event', () => {
      const raw = JSON.stringify({
        meta: { event_name: 'order_created', custom_data: { foo: 'bar' } },
        data: {
          id: 'order-123',
          type: 'orders',
          attributes: {
            status: 'paid',
            total: 1200,
            currency: 'USD',
            created_at: '2025-01-01T00:00:00Z',
            user_email: 'donor@example.com',
            first_order_item: { variant_id: 456, product_name: 'Membership' },
            customer_name: 'Jane Doe',
          },
        },
      });
      const parsed = parseWebhookEvent(raw);
      expect(parsed).not.toBeNull();
      expect(parsed!.type).toBe('order_created');
      expect(parsed!.orderId).toBe('order-123');
      expect(parsed!.customerEmail).toBe('donor@example.com');
      expect(parsed!.customerName).toBe('Jane Doe');
      expect(parsed!.amount).toBe(12); // 1200 / 100
      expect(parsed!.currency).toBe('USD');
      expect(parsed!.variantId).toBe('456');
      expect(parsed!.status).toBe('paid');
    });

    it('returns null for invalid JSON', () => {
      expect(parseWebhookEvent('not json')).toBeNull();
      expect(parseWebhookEvent('')).toBeNull();
    });

    it('returns null for malformed event shape', () => {
      expect(parseWebhookEvent('{}')).toBeNull();
      expect(parseWebhookEvent('{"meta":{}}')).toBeNull();
    });
  });
});
