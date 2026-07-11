'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { PageHero } from '@/components/premium';
import { useToast } from '@/components/Toast';

// One-time donation amounts. These map 1:1 to lib/mockData.ts's
// ONE_TIME_TIERS ids — the previous version of this page called
// `/api/checkout` with a hardcoded `tierId: 'one_time'`, which matches NONE
// of the real tier ids (tier_oneoff_10/50/250, tier_supporter, etc.). Every
// single click therefore failed server-side validation silently, and the
// button's fallback path sent everyone to the bare, generic Lemon Squeezy
// storefront instead of an actual checkout for a specific amount.
const AMOUNTS = [
  { tierId: 'tier_oneoff_10', label: '$10', blurb: 'Buy us a coffee' },
  { tierId: 'tier_oneoff_50', label: '$50', blurb: 'Fuel a story' },
  { tierId: 'tier_oneoff_250', label: '$250', blurb: 'Founding backer' },
] as const;

// Real wallet addresses provided directly by the site owner via screenshots
// of their exchange app (2026-07). IMPORTANT: cryptocurrency addresses are
// irreversible — a single wrong character means permanently lost funds.
// These were transcribed from screenshots; before going live, manually
// verify every address here against the wallet app itself (copy-paste, not
// re-typing) rather than trusting this transcription alone.
// Note: USDT (TRC20), TRX, and USDC (TRC20) intentionally share the same
// address — all three run on the Tron network, which uses one address format
// per wallet regardless of which Tron-based token is being received.
const CRYPTO_WALLETS: { name: string; address: string; icon: string; note?: string }[] = [
  { name: 'USDT (TRC20)', address: 'TFR2Pja7NEjEbr6KmhDPh2C3P3xgprkEQ6', icon: '₮' },
  { name: 'USDC (TRC20)', address: 'TFR2Pja7NEjEbr6KmhDPh2C3P3xgprkEQ6', icon: '$' },
  { name: 'TRX (Tron)', address: 'TFR2Pja7NEjEbr6KmhDPh2C3P3xgprkEQ6', icon: 'Ⓣ' },
  { name: 'USDT (ERC20)', address: '0x3384AD84cF442d97048859d989E51D223d7b09AE', icon: '₮' },
  { name: 'Bitcoin (BTC)', address: 'bc1qw38fcel5gfqtuyp0net73m9xdaf4ev4290ted9', icon: '₿' },
  { name: 'Solana (SOL)', address: '7UXgTKc5wvRPrKHx1BBnHEZ21gtU4BfC7hvseGo8fgiq', icon: '◎' },
];

// Minimal typing for the parts of Lemon Squeezy's "Lemon.js" overlay SDK
// this page actually calls. Verify against Lemon Squeezy's current docs
// before launch — third-party embed SDKs occasionally change their API
// shape, and this couldn't be tested against a live checkout in this
// environment (no network access here).
declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (opts: { eventHandler: (event: { event: string }) => void }) => void;
      Url: { Open: (url: string) => void };
    };
  }
}

export default function DonatePage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Registers the overlay's success/close event handler once the script
    // (loaded below via next/script) has initialized window.LemonSqueezy.
    if (typeof window === 'undefined' || !window.LemonSqueezy) return;
    window.LemonSqueezy.Setup({
      eventHandler: (event) => {
        if (event.event === 'Checkout.Success') {
          setPaymentDone(true);
          toast('Thank you for supporting Qawla!', 'success');
        }
      },
    });
  }, [toast]);

  const handleCheckout = async (tierId: string) => {
    setLoadingTier(tierId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, embed: true }),
      });
      const data = await res.json() as { url?: string; error?: string };

      if (!data.url) {
        toast('Checkout unavailable right now — please try PayPal or crypto below.', 'error');
        return;
      }

      // Open as an overlay on THIS page instead of navigating away to a
      // separate lemonsqueezy.com tab/page. Falls back to a normal redirect
      // if the Lemon.js script hasn't loaded (slow network, blocked script,
      // etc.) so the donation flow still works either way.
      if (window.LemonSqueezy?.Url) {
        window.LemonSqueezy.Url.Open(data.url);
      } else {
        toast('Redirecting to secure checkout…', 'info');
        window.location.href = data.url;
      }
    } catch {
      toast('Checkout unavailable — please try PayPal or crypto.', 'error');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      {/* Lemon Squeezy's overlay checkout SDK — lets Url.Open() render the
          payment form as a modal on top of the current page instead of a
          full-page redirect to a separate lemonsqueezy.com domain. */}
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" onLoad={() => window.createLemonSqueezy?.()} />

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
              <p className="text-xs text-night/60">Secure checkout — stays on qawla.com, no subscription</p>
            </div>
          </div>

          {paymentDone ? (
            <div className="flex items-center gap-2 text-pitch-dk font-semibold text-sm p-3 rounded-lg bg-pitch/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Payment received — thank you!
            </div>
          ) : (
            <>
              <p className="text-sm text-night/70 mb-5 leading-relaxed">
                Choose an amount. One-time payment — no subscription, no recurring charges.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {AMOUNTS.map((a) => (
                  <button
                    key={a.tierId}
                    onClick={() => handleCheckout(a.tierId)}
                    disabled={loadingTier !== null}
                    className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 border-gray-200 hover:border-pitch hover:bg-pitch/5 transition-colors disabled:opacity-60 min-h-[76px]"
                  >
                    <span className="font-display font-extrabold text-xl text-night">
                      {loadingTier === a.tierId ? '…' : a.label}
                    </span>
                    <span className="text-[11px] text-night/50 text-center leading-tight">{a.blurb}</span>
                  </button>
                ))}
              </div>
            </>
          )}
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
              <p className="text-xs text-night/60">BTC · USDT · USDC · TRX · SOL</p>
            </div>
          </div>
          <p className="text-sm text-night/70 mb-5 leading-relaxed">
            Send crypto directly to any of the wallets below. Click an address to copy it.
          </p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4">
            ⚠️ Only send the exact coin/network listed next to each address. Sending the wrong asset or network to an address results in permanent loss of funds.
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
