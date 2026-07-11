import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/lemonsqueezy';
import { setDoc, queryDocs, isFirebaseConfigured } from '@/lib/firebase';
import type { Donor } from '@/types';

// Lemon Squeezy webhook receiver.
//
// This route did not exist at all — meaning the only "confirmation" of a
// donation succeeding was the donor's own browser reaching the (previously
// nonexistent) thank-you page, which anyone could visit directly without
// paying anything. This is the actual source of truth: Lemon Squeezy calls
// this URL server-to-server once a payment genuinely clears.
//
// Setup required (see the master plan's env var list):
//   - Configure this URL as the webhook endpoint in the Lemon Squeezy
//     dashboard: https://yourdomain.com/api/webhooks/lemonsqueezy
//   - Set LEMONSQUEEZY_WEBHOOK_SECRET to the signing secret shown there.
//   - Subscribe to at least: order_created, subscription_payment_success.
//
// Kept intentionally minimal: verifies the signature, extracts the relevant
// fields, and upserts a `donors` record. Extend the switch below if you want
// to react to other event types (cancellations, refunds, etc.) — the
// signature verification and body-parsing plumbing is the part that's
// tedious/risky to get right, not the business logic on top of it.

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: Record<string, unknown>;
  };
  data: {
    type: string;
    id: string;
    attributes: {
      user_email?: string;
      user_name?: string;
      email?: string;
      total?: number; // cents
      total_usd?: number;
      currency?: string;
      status?: string;
      renews_at?: string;
      product_name?: string;
      variant_name?: string;
    };
  };
}

export async function POST(req: Request) {
  // Signature verification needs the EXACT raw body bytes — parsing with
  // req.json() first and re-serializing would almost certainly produce a
  // byte-for-byte different string (key order, whitespace) and make every
  // signature check fail. Read as text once, verify, then parse that same
  // string.
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: LemonSqueezyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;

  try {
    switch (eventName) {
      case 'order_created':
      case 'subscription_payment_success': {
        const attrs = payload.data.attributes;
        const email = attrs.user_email ?? attrs.email;
        if (!email) break;

        const amountCents = attrs.total ?? attrs.total_usd ?? 0;
        const amount = amountCents / 100;
        const currency = attrs.currency ?? 'USD';
        const tier = attrs.variant_name ?? attrs.product_name;

        if (isFirebaseConfigured()) {
          // Upsert: accumulate totalContributed if this email already
          // donated before, rather than overwriting their history.
          const existing = await queryDocs<Donor>('donors', {
            field: 'email',
            op: '==',
            value: email,
            limit: 1,
          });
          const prior = existing[0];
          const donor: Donor = {
            id: prior?.id ?? `donor-${payload.data.id}`,
            email,
            name: attrs.user_name ?? prior?.name,
            totalContributed: (prior?.totalContributed ?? 0) + amount,
            currency,
            tier: tier ?? prior?.tier,
            since: prior?.since ?? new Date().toISOString(),
          };
          await setDoc('donors', donor.id, donor);
        } else {
          // No Firestore configured — at minimum, don't lose the event
          // silently. Wire up real persistence before launch.
          console.log('[lemonsqueezy-webhook] order_created (no Firestore configured):', { email, amount, currency, tier });
        }
        break;
      }
      default:
        // Unhandled event types are fine to ignore — Lemon Squeezy sends
        // many event types (subscription_cancelled, subscription_resumed,
        // etc.) that this minimal handler doesn't need to act on yet.
        break;
    }
  } catch (err) {
    // Never let a downstream storage error cause Lemon Squeezy to see a
    // failure and retry indefinitely — log it and still acknowledge receipt.
    console.error('[lemonsqueezy-webhook] handler error:', err);
  }

  return NextResponse.json({ received: true });
}
