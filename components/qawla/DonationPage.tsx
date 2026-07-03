'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { ONE_TIME_TIERS, SITE_STATS } from '@/lib/mockData';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { DonateTier } from '@/types';

/* ─── Static content ────────────────────────────────────────────────────────
 *
 * One-time donations only. No subscriptions, no monthly tiers.
 * The reader makes a single contribution to support the newsroom.
 */

const IMPACT_STATS = [
  { value: '1,842', label: 'Reader backers' },
  { value: '$47.8k', label: 'Raised to date' },
  { value: '0', label: 'Paywalled articles' },
  { value: '100%', label: 'Editorially independent' },
];

const FAQS = [
  {
    q: 'Where does my money go?',
    a: 'Directly to editorial operations: writer commissions, live data feeds, server costs, and field reporting. We publish a quarterly transparency report. No executive bonuses, no ad sales team — just journalism.',
  },
  {
    q: 'Is my donation refundable?',
    a: 'Yes. If you change your mind within 14 days, email support@qawla.com and we will refund your contribution in full. No questions asked.',
  },
  {
    q: 'Is Qawla really ad-free?',
    a: 'For paying supporters, yes — completely ad-free reading. For free readers, we run a single, clearly-labelled house ad for our own donation tiers. No programmatic ads, no sponsored content, no club sponsorship. Ever.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major cards via Lemon Squeezy, plus PayPal and selected cryptocurrencies (BTC, ETH, USDC). Your card details never touch our servers — Lemon Squeezy handles everything PCI-compliant.',
  },
];

const TRUST_BADGES = [
  {
    label: 'GDPR compliant',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'PCI-DSS via Lemon Squeezy',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    label: '14-day refund',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" />
      </svg>
    ),
  },
  {
    label: 'No spam, ever',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function DonationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="#top" aria-label="Back to Qawla home">
            <Logo size="sm" variant="dark" />
          </Link>
          <Link href="#top" className="btn-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to site
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-cream py-14 sm:py-20 lg:py-24">
          <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] rounded-full blur-3xl pointer-events-none bg-gold/12" />
          <div aria-hidden className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-pitch/10 animate-float-slow" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="badge badge-gold mb-5 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-dark" />
              Reader-funded
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-night animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
              Keep the newsroom
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-gold-dark via-gold to-gold-dark">
                independent.
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-night/65 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Qawla is funded entirely by readers. No paywall, no intrusive ads,
              no club sponsorship. Your contribution pays for football reporting
              done right — and nothing else.
            </p>

            {/* Impact strip */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              {IMPACT_STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-black/[0.06] bg-white shadow-sm p-4">
                  <p className="font-display font-extrabold text-2xl sm:text-3xl text-pitch-darker tabular-nums">{s.value}</p>
                  <p className="text-xs text-night/55 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tier cards (one-time only) */}
        <section className="py-12 sm:py-16 lg:py-20 bg-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="badge badge-pitch mb-3">One-time donation</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-night tracking-tight">
                Choose your contribution.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-night/55 max-w-xl mx-auto">
                A single gift to support independent football journalism. No subscription, no recurring charge.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
              {ONE_TIME_TIERS.map((tier, idx) => (
                <TierCard key={tier.id} tier={tier} delay={idx * 0.08} />
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              {TRUST_BADGES.map((b) => (
                <div
                  key={b.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] text-xs font-semibold text-night/70"
                >
                  <span className="text-pitch-dark">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why support */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="badge badge-pitch mb-3">Why back Qawla</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-night tracking-tight">
                Your backing pays for journalism, not ads.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {[
                {
                  title: 'Reporting isn\'t cheap',
                  body: 'Every published story is researched, written, and edited by people who care about getting it right. Your backing keeps the newsroom rigorous.',
                  stat: '24/7 coverage',
                },
                {
                  title: 'Live coverage costs',
                  body: 'Real-time match commentary runs on dedicated infrastructure plus live data feeds. Reader funding covers the bills.',
                  stat: 'Real-time',
                },
                {
                  title: 'Independent by design',
                  body: 'No club sponsorship. No paid placements. No programmatic ads. The only people we answer to are the readers who support us.',
                  stat: '0 sponsors',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/[0.06] bg-cream/60 p-6 hover:bg-cream hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg text-night">{item.title}</h3>
                    <span className="badge badge-pitch">{item.stat}</span>
                  </div>
                  <p className="text-sm text-night/60 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 lg:py-20 bg-cream">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="badge badge-pitch mb-2.5">FAQ</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-night tracking-tight">
                Questions, answered.
              </h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 hover:border-pitch/20 transition-colors"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                    <h3 className="font-display font-bold text-base sm:text-lg text-night">{faq.q}</h3>
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-pitch/10 text-pitch-dark flex items-center justify-center group-open:rotate-45 transition-transform">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm sm:text-base text-night/65 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-14 sm:py-18 bg-cream">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl pitch-gradient p-8 sm:p-12 lg:p-14 text-center text-white">
              <div className="absolute inset-0 pitch-pattern opacity-30" />
              <div aria-hidden className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl bg-white/10" />
              <div className="relative">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                  Join {formatNumber(SITE_STATS.totalDonors)} readers backing independent football journalism.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-white/85 max-w-xl mx-auto">
                  Every contribution goes to the newsroom. Refundable within 14 days. No paywall for free readers, ever.
                </p>
                <a href="#top" className="mt-6 btn-gold">
                  Choose a contribution
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (compact) */}
      <footer className="bg-cream border-t border-black/[0.08] text-night py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="xs" variant="dark" />
          <p className="text-xs text-night/55">© {new Date().getFullYear()} Qawla. Reader-funded. Built with care.</p>
          <div className="flex items-center gap-4 text-xs text-night/55">
            <a href="#top" className="hover:text-pitch-darker transition-colors">Privacy</a>
            <a href="#top" className="hover:text-pitch-darker transition-colors">Terms</a>
            <a href="#top" className="hover:text-pitch-darker transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Tier card ──────────────────────────────────────────────────────────── */

function TierCard({ tier, delay }: { tier: DonateTier; delay: number }) {
  // Mark the middle tier as recommended for emphasis
  const recommended = tier.id === 'tier_oneoff_50';
  return (
    <div
      className={cn(
        'relative rounded-3xl border p-6 sm:p-7 transition-all card-lift animate-fade-in-up',
        recommended
          ? 'border-pitch/40 bg-white shadow-xl shadow-pitch/10 lg:scale-[1.04] lg:-translate-y-2'
          : 'border-black/[0.06] bg-white shadow-sm hover:shadow-lg',
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-pitch text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
          Recommended
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display font-extrabold text-xl text-night mb-1">{tier.name}</h3>
        <p className="text-sm text-night/55 mb-4 min-h-[2.5rem] flex items-center justify-center">{tier.description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-display font-extrabold text-4xl sm:text-5xl text-night tabular-nums">
            {formatCurrency(tier.amount, tier.currency)}
          </span>
          <span className="text-sm font-semibold text-night/50">one-time</span>
        </div>
      </div>

      <a
        href="#top"
        className={cn(
          'w-full justify-center mb-6',
          recommended ? 'btn-primary' : 'btn-outline',
        )}
      >
        Donate now
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>

      <ul className="space-y-2.5">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm text-night/75">
            <svg className="shrink-0 mt-0.5 text-pitch" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L20 7" />
            </svg>
            <span>{perk}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DonationPage;
