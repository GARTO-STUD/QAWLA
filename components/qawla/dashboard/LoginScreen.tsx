'use client';

import { useState } from 'react';
import { Logo } from '../Logo';
import { DEMO_ADMIN } from '@/lib/mockData';
import { cn } from '@/lib/utils';

/**
 * LoginScreen — split-screen editorial login.
 *
 * The gateway to the Qawla editorial dashboard. Renders a two-panel
 * layout on desktop (branding left, form right) and a form-only layout
 * on mobile.
 *
 * ── Left panel (desktop only) ──
 *   • Qawla logo + "The newsroom, behind the stories" headline
 *   • Three editorial promises (verified reporting, public confidence,
 *     reader-funded)
 *   • Rotating testimonial block — click to cycle through 3 reader
 *     quotes (Patron, Member, Supporter)
 *   • Night-gradient backdrop with pitch-pattern texture + ambient glows
 *
 * ── Right panel ──
 *   • "Welcome back" heading
 *   • Email + password form with show/hide password toggle
 *   • "Remember me" checkbox + "Forgot password?" link
 *   • Submit button with 700ms simulated auth + loading spinner
 *   • Demo credentials hint box (editor@qawla.com / qawla2025)
 *   • "Back to Qawla" link
 *
 * ── Auth flow ──
 *   1. Pre-fills demo credentials for convenience
 *   2. On submit: 700ms simulated check
 *   3. Permissive in demo — any valid email + password (≥4 chars) succeeds
 *   4. On success: calls onLogin() → parent persists auth to localStorage
 *
 * See DASHBOARD.md for the full architecture overview.
 */
export interface LoginScreenProps {
  onLogin: () => void;
  onBack: () => void;
}

const EDITORIAL_PROMISES = [
  { title: 'Verified reporting', body: 'Every story is researched, cross-checked, and edited before publication.' },
  { title: 'Full editorial control', body: 'Create, edit, and publish articles and blog posts from one dashboard.' },
  { title: 'Reader-funded, not ad-funded', body: 'No paywall, no clickbait, no club sponsorship. Editorial independence by design.' },
];

const TESTIMONIALS = [
  { quote: 'Qawla\'s tactical breakdowns are the best on the internet. Full stop.', author: 'Carla M., Reader since 2024' },
  { quote: 'Finally a football site that treats me like a reader, not a target.', author: 'Liam O., Reader since 2023' },
  { quote: 'Independent journalism that respects the game and the reader.', author: 'James W., Reader since 2024' },
];

export function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [password, setPassword] = useState(DEMO_ADMIN.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate auth check
    setTimeout(() => {
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        onLogin();
      } else if (email && password.length >= 4) {
        // Be permissive in demo mode
        onLogin();
      } else {
        setError('Invalid credentials. Try editor@qawla.com / qawla2025');
        setLoading(false);
      }
    }, 700);
  };

  const cycleTestimonial = () => {
    setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] bg-cream">
      {/* ── Left: Branding ───────────────────────────────────────────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 bg-white border-r border-black/[0.06] overflow-hidden">
        <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pitch/10 blur-3xl animate-float-slow" />
        <div aria-hidden className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold/8 blur-3xl" />

        <div className="relative">
          <Logo size="md" variant="dark" />
        </div>

        <div className="relative max-w-md">
          <span className="badge badge-pitch mb-5">Editorial dashboard</span>
          <h1 className="font-display font-extrabold text-4xl xl:text-5xl text-night leading-tight tracking-tight">
            The newsroom,
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pitch-dark via-pitch to-gold-dark">
              behind the stories.
            </span>
          </h1>
          <p className="mt-5 text-base text-night/60 leading-relaxed">
            Manage the editorial pipeline, review articles, publish
            journalism, and track the readers who fund it.
          </p>

          {/* Editorial promises */}
          <ul className="mt-8 space-y-3">
            {EDITORIAL_PROMISES.map((p) => (
              <li key={p.title} className="flex items-start gap-3">
                <svg className="shrink-0 mt-0.5 text-pitch-darker" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 7" />
                </svg>
                <div>
                  <p className="font-display font-bold text-sm text-night">{p.title}</p>
                  <p className="text-xs text-night/55 mt-0.5">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative">
          <button
            type="button"
            onClick={cycleTestimonial}
            className="text-left group"
          >
            <blockquote className="text-base text-night/75 italic leading-relaxed border-l-2 border-pitch pl-4 max-w-md">
              {TESTIMONIALS[testimonialIdx].quote}
            </blockquote>
            <p className="mt-2 text-xs text-night/55 pl-4">
              — {TESTIMONIALS[testimonialIdx].author}
              <span className="ml-2 inline-flex items-center gap-1 text-pitch-darker opacity-0 group-hover:opacity-100 transition-opacity">
                Next
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </p>
          </button>
        </div>
      </aside>

      {/* ── Right: Form ─────────────────────────────────────────────────── */}
      <main className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="font-display font-extrabold text-3xl text-night tracking-tight">
              Welcome back.
            </h2>
            <p className="mt-2 text-sm text-night/55">
              Sign in to the editorial dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-night/60 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-night placeholder:text-night/30 text-sm focus:outline-none focus:ring-2 focus:ring-pitch/40 focus:border-pitch/30 transition-all"
                placeholder="editor@qawla.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-night/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-black/10 bg-white text-night placeholder:text-night/30 text-sm focus:outline-none focus:ring-2 focus:ring-pitch/40 focus:border-pitch/30 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-lg text-night/40 hover:text-night hover:bg-night/5 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-scale-in">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-night/60 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-black/20 text-pitch focus:ring-pitch/40" />
                Remember me
              </label>
              <a href="#/dashboard" className="font-semibold text-pitch-darker hover:text-pitch-darker">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'btn-primary w-full justify-center',
                loading && 'opacity-70 pointer-events-none',
              )}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-xl border border-pitch/20 bg-pitch/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-pitch-darker mb-1">
              Demo credentials
            </p>
            <p className="text-xs text-night/70 font-mono">
              editor@qawla.com · qawla2025
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 w-full text-xs font-semibold text-night/50 hover:text-night inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Qawla
          </button>
        </div>
      </main>
    </div>
  );
}

export default LoginScreen;
