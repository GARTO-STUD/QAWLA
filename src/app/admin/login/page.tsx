'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch('/api/auth', { method: 'GET' })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (data.authenticated) router.push('/admin');
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json() as { authenticated?: boolean; error?: string };
      if (data.authenticated) {
        toast('Welcome back.', 'success');
        router.push('/admin');
      } else {
        toast(data.error ?? 'Invalid password.', 'error');
        setPassword('');
      }
    } catch {
      toast('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center night-gradient pitch-pattern px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex bg-cream/95 rounded-sm p-3 mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-cream">Admin sign in</h1>
          <p className="mt-2 text-cream/70 text-sm normal-case">Qawla editorial dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-dark rounded-sm p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-bold text-cream/90 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || checkingSession}
                placeholder="Enter admin password"
                aria-label="Admin password"
                className="w-full h-12 sm:h-14 pl-4 pr-12 text-base font-medium rounded-sm bg-white/10 border border-white/20 text-cream placeholder:text-cream/35 focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent disabled:opacity-50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading || checkingSession}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-cream/50 hover:text-pitch transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || checkingSession || !password}
            className={cn('btn-primary w-full justify-center min-h-[48px]', (loading || checkingSession || !password) && 'opacity-70')}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-cream/50 normal-case">
              Protected by HMAC-signed sessions · Rate-limited
            </p>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-cream/60 hover:text-pitch transition-colors normal-case">
            ← Back to Qawla
          </Link>
        </div>
      </div>
    </div>
  );
}
