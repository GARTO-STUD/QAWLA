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

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const bytes = new Uint8Array(sig);
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
  // IMPORTANT: without this, Lemon Squeezy has no instruction on where to
  // send the donor after they pay — they'd land on Lemon Squeezy's own
  // generic receipt page (on lemonsqueezy.com), with no path back to Qawla
  // at all, and no branded "thank you" confirmation ever shown. There was
  // previously no success page on this site for them to land on either.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qawla.com';
  const redirectUrl = `${siteUrl}/donate/thank-you`;

  if (!apiKey || !storeId) {
    // Dev fallback: construct a direct hosted checkout URL
    return {
      id,
      url: buildFallbackUrl(params.tier, params.embed, redirectUrl),
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
          redirect_url: redirectUrl,
        },
        product_options: {
          redirect_url: redirectUrl,
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
      url: buildFallbackUrl(params.tier, params.embed, redirectUrl),
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

function buildFallbackUrl(tier: DonateTier, embed?: boolean, redirectUrl?: string): string {
  const storeSlug = process.env.LEMONSQUEEZY_STORE_SLUG ?? 'qawla';
  const base = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${tier.variantId}`;
  const params = new URLSearchParams();
  if (embed) params.set('embed', '1');
  params.set('logo', '0');
  // Lemon Squeezy's hosted "buy link" checkout pages support this same
  // redirect_url override as a query param (documented under "Checkout
  // overrides" in their API docs).
  if (redirectUrl) params.set('checkout[redirect_url]', redirectUrl);
  return `${base}?${params}`;
}

/** Verify a Lemon Squeezy webhook signature.
 * Lemon Squeezy signs the RAW request body with HMAC-SHA256, using the
 * webhook signing secret as the HMAC key, and sends the hex digest in the
 * `X-Signature` header. This must be computed with real HMAC (not a plain
 * SHA-256 hash of body+secret concatenated, which is a different, insecure
 * construction that will never match Lemon Squeezy's actual signature).
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = await hmacSha256Hex(rawBody, secret);
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
