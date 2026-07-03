'use client';

import { useState } from 'react';
import { PageHero } from '@/components/premium';
import { useToast } from '@/components/Toast';

const CRYPTO_WALLETS = [
  { name: 'Bitcoin (BTC)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', icon: '₿' },
  { name: 'Ethereum (ETH)', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', icon: 'Ξ' },
  { name: 'USDC (Polygon)', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', icon: '$' },
];

export default function DonatePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: 'one_time' }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        toast('Redirecting to secure checkout…', 'success');
        setTimeout(() => { window.location.href = data.url!; }, 600);
      } else {
        toast('Opening checkout…', 'info');
        setTimeout(() => { window.location.href = 'https://qawla.lemonsqueezy.com'; }, 600);
      }
    } catch {
      toast('Checkout unavailable — please try PayPal or crypto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Support Qawla"
        title="Keep independent football"
        highlight="journalism alive."
        description="No paywall. No intrusive ads. No club sponsorship. Just readers who value verified football reporting. Every contribution — big or small — keeps Qawla running."
        variant="dark"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Card payment */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-pitch/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a854" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-night">Card payment</h3>
              <p className="text-xs text-night/60">Secure checkout via Lemon Squeezy</p>
            </div>
          </div>
          <p className="text-sm text-night/70 mb-5 leading-relaxed">
            Choose any amount you'd like to contribute. One-time payment — no subscription, no recurring charges.
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary justify-center min-h-[48px] disabled:opacity-70"
          >
            {loading ? 'Redirecting…' : 'Support with card'}
          </button>
        </div>

        {/* PayPal */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[#0070ba]/10 flex items-center justify-center">
              <span className="font-display font-extrabold text-[#0070ba] text-lg">P</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-night">PayPal</h3>
              <p className="text-xs text-night/60">One-time donation</p>
            </div>
          </div>
          <p className="text-sm text-night/70 mb-5 leading-relaxed">
            Prefer PayPal? Send your contribution directly — no account signup needed beyond PayPal itself.
          </p>
          <a
            href="https://paypal.me/cnoncanada"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0070ba] text-white font-bold hover:bg-[#005ea6] transition-colors text-sm min-h-[48px]"
          >
            Donate with PayPal
          </a>
        </div>

        {/* Crypto */}
        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <span className="font-display font-extrabold text-amber-600 text-lg">₿</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-night">Cryptocurrency</h3>
              <p className="text-xs text-night/60">BTC · ETH · USDC</p>
            </div>
          </div>
          <p className="text-sm text-night/70 mb-5 leading-relaxed">
            Send crypto directly to any of the wallets below. Click an address to copy it.
          </p>
          <div className="space-y-2.5">
            {CRYPTO_WALLETS.map((w) => (
              <div key={w.name} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-sm font-bold flex-shrink-0">{w.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-night">{w.name}</p>
                  <p className="text-xs text-night/50 font-mono truncate">{w.address}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(w.address);
                    toast('Address copied', 'success');
                  }}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-pitch/10 text-night/50 hover:text-pitch-dk transition-colors"
                  aria-label={`Copy ${w.name} address`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Thank you note */}
        <p className="text-center text-night/50 text-xs max-w-md mx-auto mt-10">
          Qawla is not affiliated with any football club, federation, or league. Donations are voluntary and non-refundable. Thank you for being part of our community.
        </p>
      </div>
    </>
  );
}
