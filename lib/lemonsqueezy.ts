// Qawla — Lemon Squeezy checkout URL builder + webhook signature verification

import type { DonateTier, CheckoutSession } from '@/types';

const LS_API_BASE = 'https://api.lemonsqueezy.com/v1';

export interface CreateCheckoutParams {
  tier: DonateTier;
  email?: string;
  name?: string;
  custom?: Record<string, string>;
  embed?: boolean;
}

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

/** Build the checkout URL via the Lemon Squeezy API. Falls back to a hosted URL. */
export async function createCheckoutUrl(params: CreateCheckoutParams): Promise<CheckoutSession> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const id = randomId();
  const now = Date.now();
  const expiresAt = now + 30 * 60 * 1000;

  if (!apiKey || !storeId) {
    // Dev fallback: construct a direct hosted checkout URL
    return {
      id,
      url: buildFallbackUrl(params.tier, params.embed),
      tierId: params.tier.id,
      amount: params.tier.amount,
      currency: params.tier.currency,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        product_id: parseInt(params.tier.variantId, 10),
        custom_price: Math.round(params.tier.amount * 100),
        checkout_data: {
          email: params.email,
          name: params.name,
          custom: params.custom,
        },
        checkout_options: {
          embed: params.embed ?? false,
          dark: false,
        },
        preview: false,
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
      },
    },
  };

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Fallback to hosted URL on API failure
    return {
      id,
      url: buildFallbackUrl(params.tier, params.embed),
      tierId: params.tier.id,
      amount: params.tier.amount,
      currency: params.tier.currency,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  const json = (await res.json()) as {
    data: { attributes: { url: string } };
  };
  return {
    id,
    url: json.data.attributes.url,
    tierId: params.tier.id,
    amount: params.tier.amount,
    currency: params.tier.currency,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

function buildFallbackUrl(tier: DonateTier, embed?: boolean): string {
  const storeSlug = process.env.LEMONSQUEEZY_STORE_SLUG ?? 'qawla';
  const base = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${tier.variantId}`;
  const params = new URLSearchParams();
  if (embed) params.set('embed', '1');
  params.set('logo', '0');
  return `${base}?${params}`;
}

/** Verify a Lemon Squeezy webhook signature (X-Signature header = sha256 of body + secret). */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = await sha256Hex(`${rawBody}${secret}`);
  return timingSafeEqual(digest, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Parse the standard Lemon Squeezy webhook event. */
export interface ParsedWebhookEvent {
  type: string;
  orderId: string;
  customerEmail: string;
  customerName?: string;
  amount: number;
  currency: string;
  variantId: string;
  status: string;
  createdAt: string;
}

export function parseWebhookEvent(rawBody: string): ParsedWebhookEvent | null {
  try {
    const json = JSON.parse(rawBody) as {
      meta: { event_name: string; custom_data?: Record<string, string> };
      data: {
        id: string;
        type: string;
        attributes: {
          status: string;
          total: number;
          currency: string;
          created_at: string;
          user_email: string;
          first_order_item?: { variant_id: number; product_name: string };
          customer_name?: string;
        };
      };
    };
    return {
      type: json.meta.event_name,
      orderId: json.data.id,
      customerEmail: json.data.attributes.user_email,
      customerName: json.data.attributes.customer_name,
      amount: json.data.attributes.total / 100,
      currency: json.data.attributes.currency,
      variantId: json.data.attributes.first_order_item
        ? String(json.data.attributes.first_order_item.variant_id)
        : '',
      status: json.data.attributes.status,
      createdAt: json.data.attributes.created_at,
    };
  } catch {
    return null;
  }
}
