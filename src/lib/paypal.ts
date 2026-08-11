const PAYPAL_ENV = process.env.PAYPAL_ENVIRONMENT === 'live' ? 'live' : 'sandbox';

export const PAYPAL_API_BASE = PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

export function getPayPalEnvironment() {
  return PAYPAL_ENV;
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal authentication failed (${response.status}): ${detail}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}


export interface PayPalOrderDetails {
  id: string;
  status?: string;
  purchase_units?: Array<{
    reference_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{ id?: string; status?: string; amount?: { currency_code?: string; value?: string } }>;
    };
  }>;
}

export async function getPayPalOrder(orderId: string): Promise<PayPalOrderDetails> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    throw new Error(`PayPal order lookup failed (${response.status})`);
  }
  return await response.json() as PayPalOrderDetails;
}

export async function verifyPayPalWebhookSignature(
  rawBody: string,
  headers: Headers,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const required = [
    'paypal-transmission-id',
    'paypal-transmission-time',
    'paypal-transmission-sig',
    'paypal-cert-url',
    'paypal-auth-algo',
  ] as const;
  const values = Object.fromEntries(
    required.map((name) => [name, headers.get(name)]),
  ) as Record<(typeof required)[number], string | null>;

  if (Object.values(values).some((value) => !value)) return false;

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: values['paypal-auth-algo'],
      cert_url: values['paypal-cert-url'],
      transmission_id: values['paypal-transmission-id'],
      transmission_sig: values['paypal-transmission-sig'],
      transmission_time: values['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
    cache: 'no-store',
  });

  if (!response.ok) return false;
  const data = await response.json() as { verification_status?: string };
  return data.verification_status === 'SUCCESS';
}
