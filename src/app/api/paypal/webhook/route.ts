import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse } from '@/lib/rateLimit';
import { verifyPayPalWebhookSignature } from '@/lib/paypal';
import { getDoc, setDoc } from '@/lib/firebase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const rl = rateLimit('api', getClientId(req));
  if (!rl.allowed) return rateLimitedResponse(rl);

  const rawBody = await req.text();
  if (rawBody.length > 512_000) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let event: { id?: string; event_type?: string; resource?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const valid = await verifyPayPalWebhookSignature(rawBody, req.headers);
    if (!valid) return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });

    const supplementary = event.resource?.['supplementary_data'];
    const relatedIds = supplementary && typeof supplementary === 'object'
      ? (supplementary as Record<string, unknown>)['related_ids']
      : null;
    const orderId = relatedIds && typeof relatedIds === 'object'
      ? (relatedIds as Record<string, unknown>)['order_id']
      : null;

    // PAYMENT.CAPTURE.* resources normally expose the originating order ID
    // under supplementary_data.related_ids.order_id.
    const customOrderId = typeof event.resource?.['custom_id'] === 'string'
      ? event.resource['custom_id']
      : typeof orderId === 'string' ? orderId : null;

    if (process.env.FIREBASE_PROJECT_ID && event.id) {
      const existing = await getDoc('paypal_webhook_events', event.id);
      if (existing) return NextResponse.json({ received: true, duplicate: true });

      await setDoc('paypal_webhook_events', event.id, {
        eventId: event.id,
        eventType: event.event_type ?? 'unknown',
        receivedAt: new Date().toISOString(),
        orderId: customOrderId,
      });

      if (customOrderId && event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const payment = await getDoc<Record<string, unknown>>('paypal_payments', customOrderId);
        await setDoc('paypal_payments', customOrderId, {
          ...(payment ?? {}),
          orderId: customOrderId,
          status: 'COMPLETED',
          webhookEventId: event.id,
          webhookUpdatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[paypal webhook] processing failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
