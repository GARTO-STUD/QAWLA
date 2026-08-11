import { NextResponse } from 'next/server';
import { rateLimit, getClientId, rateLimitedResponse, rateLimitHeaders } from '@/lib/rateLimit';
import { getPayPalAccessToken, PAYPAL_API_BASE, getPayPalOrder } from '@/lib/paypal';
import { getDoc, setDoc } from '@/lib/firebase';

function validOrderId(orderID: string): boolean {
  return /^[A-Z0-9-]{5,80}$/i.test(orderID);
}

export async function POST(req: Request) {
  const clientId = getClientId(req);
  const rl = rateLimit('checkout', clientId);
  if (!rl.allowed) return rateLimitedResponse(rl);

  try {
    const contentLength = Number(req.headers.get('content-length') || '0');
    if (contentLength > 16_384) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413, headers: rateLimitHeaders(rl) });
    }
    const body = await req.json() as { orderID?: string };
    const orderID = body.orderID?.trim();

    if (!orderID || !validOrderId(orderID)) {
      return NextResponse.json(
        { error: 'Invalid PayPal order ID' },
        { status: 400, headers: rateLimitHeaders(rl) },
      );
    }

    // Never trust the amount or success state supplied by the browser.
    const pending = process.env.FIREBASE_PROJECT_ID
      ? await getDoc<{ amount?: string; currency?: string; status?: string }>('paypal_payments', orderID)
      : null;

    const order = await getPayPalOrder(orderID);
    const unit = order.purchase_units?.[0];
    const paypalAmount = unit?.amount?.value;
    const paypalCurrency = unit?.amount?.currency_code;

    if (!unit || unit.reference_id !== 'qawla-donation' || paypalCurrency !== 'USD') {
      return NextResponse.json(
        { error: 'Payment validation failed' },
        { status: 400, headers: rateLimitHeaders(rl) },
      );
    }

    if (pending && (pending.amount !== paypalAmount || pending.currency !== paypalCurrency)) {
      console.error('[paypal] Amount/currency mismatch', { orderID });
      return NextResponse.json(
        { error: 'Payment validation failed' },
        { status: 400, headers: rateLimitHeaders(rl) },
      );
    }

    // A repeated browser callback after a successful capture should remain
    // idempotent instead of attempting a second capture.
    if (order.status === 'COMPLETED') {
      if (process.env.FIREBASE_PROJECT_ID) {
        await setDoc('paypal_payments', orderID, {
          ...(pending ?? {}),
          orderId: orderID,
          amount: paypalAmount,
          currency: paypalCurrency,
          status: 'COMPLETED',
          updatedAt: new Date().toISOString(),
        });
      }
      return NextResponse.json(
        { id: orderID, status: 'COMPLETED' },
        { headers: rateLimitHeaders(rl) },
      );
    }

    if (order.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Payment has not been approved' },
        { status: 409, headers: rateLimitHeaders(rl) },
      );
    }

    const accessToken = await getPayPalAccessToken();
    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `qawla-capture-${orderID}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json() as {
      id?: string;
      status?: string;
      purchase_units?: Array<{ payments?: { captures?: Array<{ id?: string; status?: string }> } }>;
    };

    if (!response.ok || data.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment could not be completed' },
        { status: response.ok ? 409 : response.status, headers: rateLimitHeaders(rl) },
      );
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      await setDoc('paypal_payments', orderID, {
        ...(pending ?? {}),
        orderId: orderID,
        captureId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null,
        amount: paypalAmount,
        currency: paypalCurrency,
        status: 'COMPLETED',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { id: data.id ?? orderID, status: 'COMPLETED' },
      { headers: rateLimitHeaders(rl) },
    );
  } catch (error) {
    console.error('[paypal] Capture failed:', error);
    return NextResponse.json(
      { error: 'Payment could not be completed' },
      { status: 500, headers: rateLimitHeaders(rl) },
    );
  }
}
