'use client';

import { useState } from 'react';
import { PageHero } from '@/components/premium';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { useToast } from '@/components/Toast';
import { CryptoQrModal } from '@/components/CryptoQrModal';
import { cn } from '@/lib/utils';
import { PayPalCheckout } from '@/components/PayPalCheckout';

const AMOUNTS = [
  { amount: 10,  label: '$10',  blurb: 'Buy us a coffee',       accent: 'from-pitch/15 to-pitch/5' },
  { amount: 50,  label: '$50',  blurb: 'Fuel a story',          accent: 'from-gold/20 to-gold/5' },
  { amount: 250, label: '$250', blurb: 'Founding backer',       accent: 'from-night/10 to-night/5' },
] as const;

const CRYPTO_WALLETS: { name: string; address: string; icon: string }[] = [
  { name: 'USDT (TRC20)',  address: 'TFR2Pja7NEjEbr6KmhDPh2C3P3xgprkEQ6',          icon: '₮' },
  { name: 'USDC (TRC20)',  address: 'TFR2Pja7NEjEbr6KmhDPh2C3P3xgprkEQ6',          icon: '$' },
  { name: 'TRX (Tron)',    address: 'TFR2Pja7NEjEbr6KmhDPh2C3P3xgprkEQ6',          icon: 'Ⓣ' },
  { name: 'USDT (ERC20)',  address: '0x3384AD84cF442d97048859d989E51D223d7b09AE',  icon: '₮' },
  { name: 'Bitcoin (BTC)', address: 'bc1qw38fcel5gfqtuyp0net73m9xdaf4ev4290ted9',  icon: '₿' },
  { name: 'Solana (SOL)',  address: '7UXgTKc5wvRPrKHx1BBnHEZ21gtU4BfC7hvseGo8fgiq', icon: '◎' },
];

const PERKS = [
  { title: 'No paywall', desc: 'Every reader gets every story — free, forever.' },
  { title: 'No intrusive ads', desc: 'No popups, no auto-play, no trackers following you.' },
  { title: 'No club sponsorship', desc: 'We answer to readers, not the clubs we cover.' },
  { title: 'Independent & honest', desc: 'If we get it wrong, we say so — publicly.' },
];

export default function DonatePage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [qrWallet, setQrWallet] = useState<typeof CRYPTO_WALLETS[number] | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const { toast } = useToast();

  const handleCopy = (name: string, address: string) => {
    navigator.clipboard?.writeText(address);
    setCopied(name);
    toast('Address copied', 'success');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <PageHero
        eyebrow="Support Qawla"
        title="Keep independent football"
        highlight="journalism alive."
        description="No paywall. No intrusive ads. No club sponsorship. Just readers who value verified football reporting. Every contribution keeps Qawla running."
        variant="light"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Perks band — what your support makes possible */}
        <Reveal className="mb-10 sm:mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PERKS.map((p) => (
              <div key={p.title} className="rounded-sm bg-white border border-black/5 p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-sm bg-pitch/10 flex items-center justify-center mb-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d5c0e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="font-display font-bold text-sm text-night leading-tight">{p.title}</p>
                <p className="text-[11px] text-night/50 mt-1 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Choose an amount — PayPal, preset amounts */}
        <Reveal className="mb-6">
          <div className="text-center mb-6 sm:mb-8">
            <span className="badge bg-pitch/20 text-pitch-dk mb-3">Step 1</span>
            <h2 className="heading-serif text-2xl sm:text-3xl text-night">Choose an amount</h2>
            <p className="mt-2 text-sm text-night/55 font-light normal-case">One-time payment via PayPal — no subscription, no recurring charges.</p>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4" stagger={0.1}>
            {AMOUNTS.map((a) => (
              <StaggerItem key={a.amount}>
                <button
                  type="button"
                  onClick={() => setSelectedAmount(a.amount)}
                  className={cn(
                    'group relative block w-full overflow-hidden rounded-sm border-2 bg-white p-6 sm:p-8 text-center transition-all duration-300',
                    selectedAmount === a.amount ? 'border-pitch shadow-xl shadow-pitch/10 -translate-y-1' : 'border-black/8 hover:border-pitch hover:shadow-xl hover:shadow-pitch/10 hover:-translate-y-1',
                  )}
                >
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity', a.accent)} aria-hidden />
                  <div className="relative">
                    <span className="font-serif font-bold text-4xl sm:text-5xl text-night block normal-case">
                      {a.label}
                    </span>
                    <span className="mt-2 inline-block text-xs font-bold uppercase tracking-wider text-pitch-dk">{a.blurb}</span>
                  </div>
                </button>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal delay={0.12} className="mt-6 mx-auto max-w-md rounded-sm border border-black/5 bg-white p-5 sm:p-6">
            <div className="text-center mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-night/45">Selected donation</p>
              <p className="heading-serif text-2xl text-night mt-1">${selectedAmount}</p>
            </div>
            <PayPalCheckout amount={selectedAmount} />
            <p className="mt-3 text-[10px] text-center text-night/40 normal-case">Secure checkout powered by PayPal. Eligible customers may be offered PayPal or card payment.</p>
          </Reveal>
        </Reveal>

        {/* Other ways to pay */}
        <div className="mt-12 sm:mt-16">
          <Reveal className="text-center mb-6 sm:mb-8">
            <span className="badge bg-gold/15 text-gold-dark mb-3">Step 2</span>
            <h2 className="heading-serif text-2xl sm:text-3xl text-night">Other ways to give</h2>
            <p className="mt-2 text-sm text-night/55 font-light normal-case">Prefer a custom amount, or crypto? We accept both.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* PayPal */}
            <Reveal>
              <div className="h-full rounded-sm bg-white border border-black/5 p-6 sm:p-7 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-sm bg-[#0070ba]/10 flex items-center justify-center">
                    <span className="font-serif font-bold text-[#0070ba] text-xl normal-case">P</span>
                  </div>
                  <div>
                    <h3 className="heading-serif text-lg text-night">PayPal</h3>
                    <p className="text-[11px] text-night/50">PayPal or eligible card, one-time</p>
                  </div>
                </div>
                <p className="text-sm text-night/60 leading-relaxed mb-5 flex-1 normal-case">
                  Pay securely with PayPal. Depending on eligibility, PayPal may also offer card checkout without requiring a PayPal account.
                </p>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm bg-[#0070ba] text-white font-bold hover:bg-[#005ea6] active:scale-[0.98] transition-all text-sm min-h-[48px]"
                >
                  Choose an amount above
                </button>
              </div>
            </Reveal>

            {/* Crypto */}
            <Reveal delay={0.08}>
              <div className="h-full rounded-sm bg-white border border-black/5 p-6 sm:p-7 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-sm bg-amber-50 flex items-center justify-center">
                    <span className="font-serif font-bold text-amber-600 text-xl normal-case">₿</span>
                  </div>
                  <div>
                    <h3 className="heading-serif text-lg text-night">Cryptocurrency</h3>
                    <p className="text-[11px] text-night/50">BTC · USDT · USDC · TRX · SOL</p>
                  </div>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-sm p-2.5 mb-4 leading-snug normal-case">
                  ⚠️ Only send the exact coin/network listed. Wrong network = permanent loss.
                </p>
                <div className="space-y-2 flex-1">
                  {CRYPTO_WALLETS.map((w) => (
                    <div
                      key={w.name}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-sm bg-cream border border-black/5 hover:border-pitch/30 hover:bg-pitch/5 transition-all group"
                    >
                      <button
                        type="button"
                        onClick={() => setQrWallet(w)}
                        aria-label={`Show QR code for ${w.name}`}
                        className="w-8 h-8 rounded-sm bg-white border border-black/8 flex items-center justify-center text-sm font-bold flex-shrink-0 hover:border-pitch/40 transition-colors"
                      >
                        {w.icon}
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrWallet(w)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-[11px] font-bold text-night">{w.name}</p>
                        <p className="text-[11px] text-night/45 font-mono truncate">{w.address}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrWallet(w)}
                        aria-label={`Show QR code for ${w.name}`}
                        className="flex-shrink-0 w-7 h-7 rounded-md bg-night/5 text-night/50 hover:bg-pitch/15 hover:text-pitch-dk transition-colors flex items-center justify-center"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM21 14v.01M17 21v.01M21 18v3" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(w.name, w.address)}
                        className={cn(
                          'flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors',
                          copied === w.name ? 'bg-pitch text-night' : 'bg-night/5 text-night/50 group-hover:bg-pitch/15 group-hover:text-pitch-dk'
                        )}
                      >
                        {copied === w.name ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Closing note */}
        <Reveal delay={0.1}>
          <p className="text-center text-night/45 text-xs max-w-lg mx-auto mt-12 leading-relaxed normal-case">
            Qawla is not affiliated with any football club, federation, or league. Donations are voluntary and non-refundable. Thank you for being part of our community.
          </p>
        </Reveal>
      </div>

      <CryptoQrModal
        open={!!qrWallet}
        onClose={() => setQrWallet(null)}
        name={qrWallet?.name ?? ''}
        address={qrWallet?.address ?? ''}
        icon={qrWallet?.icon ?? ''}
        onCopy={() => qrWallet && handleCopy(qrWallet.name, qrWallet.address)}
        copied={copied === qrWallet?.name}
      />
    </>
  );
}
