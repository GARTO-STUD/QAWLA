'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: Record<string, unknown>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel?: () => void;
        onError?: (error: unknown) => void;
      }) => { render: (container: HTMLElement) => Promise<void> };
    };
  }
}

function loadPayPalScript(clientId: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.paypal) return resolve();

    const existing = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('PayPal SDK failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons&enable-funding=card`;
    script.async = true;
    script.dataset.paypalSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PayPal SDK failed to load'));
    document.head.appendChild(script);
  });
}

export function PayPalCheckout({ amount, onSuccess }: { amount: number; onSuccess?: (orderId: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'success'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
      setStatus('error');
      setMessage('PayPal is not configured yet. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to your environment variables.');
      return;
    }

    const setup = async () => {
      try {
        await loadPayPalScript(clientId);
        if (cancelled || !containerRef.current || !window.paypal) return;

        containerRef.current.innerHTML = '';
        await window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'paypal', height: 48 },
          createOrder: async () => {
            const response = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount }),
            });
            const data = await response.json();
            if (!response.ok || !data.id) throw new Error(data.error || 'Unable to create PayPal order');
            return data.id;
          },
          onApprove: async ({ orderID }) => {
            setStatus('loading');
            setMessage('Confirming your payment…');
            const response = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID }),
            });
            const data = await response.json();
            if (!response.ok || data.status !== 'COMPLETED') throw new Error(data.error || 'Payment could not be completed');
            setStatus('success');
            setMessage('Thank you! Your donation was completed successfully.');
            onSuccess?.(orderID);
          },
          onCancel: () => {
            setStatus('ready');
            setMessage('Payment cancelled. You can try again whenever you are ready.');
          },
          onError: (error) => {
            console.error('PayPal Checkout error:', error);
            setStatus('error');
            setMessage('PayPal could not complete the payment. Please try again.');
          },
        }).render(containerRef.current);

        if (!cancelled) setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unable to load PayPal.');
      }
    };

    setup();
    return () => { cancelled = true; };
  }, [amount, onSuccess]);

  return (
    <div className="mt-5">
      {status === 'loading' && <p className="mb-3 text-xs text-night/50 text-center">{message || 'Loading secure PayPal Checkout…'}</p>}
      <div ref={containerRef} className={status === 'success' ? 'hidden' : ''} />
      {message && status !== 'loading' && (
        <p className={`mt-3 text-xs text-center ${status === 'error' ? 'text-red-600' : status === 'success' ? 'text-pitch-dk' : 'text-night/55'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
