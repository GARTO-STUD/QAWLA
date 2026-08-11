import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { getPayPalAccessToken, PAYPAL_API_BASE } from '@/lib/paypal';
import { setDoc } from '@/lib/firebase';

const ALLOWED_AMOUNTS = new Set([10, 50, 250]);

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('checkout', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  try {
    const contentLength = Number(req.headers.get('content-length') || '0');
    if (contentLength > 16_384) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413, headers: rateLimitHeaders(rl) });
    }
    const body = await req.json() as { amount?: number };
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || !ALLOWED_AMOUNTS.has(amount)) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400, headers: rateLimitHeaders(rl) },
      );
    }

    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `qawla-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: 'qawla-donation',
          description: `Qawla donation - $${amount}`,
          amount: { currency_code: 'USD', value: amount.toFixed(2) },
        }],
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: 'PayPal could not create the order' },
        { status: response.status, headers: rateLimitHeaders(rl) },
      );
    }

    // Keep the server-side amount/order relationship. The browser is never
    // trusted as the source of truth during capture.
    if (process.env.FIREBASE_PROJECT_ID && data.id) {
      try {
        await setDoc('paypal_payments', data.id, {
          orderId: data.id,
          amount: amount.toFixed(2),
          currency: 'USD',
          status: 'CREATED',
          createdAt: new Date().toISOString(),
        });
      } catch (storageError) {
        console.error('[paypal] Failed to persist pending payment:', storageError);
        return NextResponse.json(
          { error: 'Payment could not be initialized' },
          { status: 503, headers: rateLimitHeaders(rl) },
        );
      }
    }

    return NextResponse.json({ id: data.id }, { headers: rateLimitHeaders(rl) });
  } catch (error) {
    return NextResponse.json(
      { error: 'PayPal order creation failed' },
      { status: 500, headers: rateLimitHeaders(rl) },
    );
  }
}
