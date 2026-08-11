import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Legacy checkout disabled. Use /api/paypal/create-order for PayPal Checkout.' },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json({ provider: 'paypal', endpoint: '/api/paypal/create-order' });
}
