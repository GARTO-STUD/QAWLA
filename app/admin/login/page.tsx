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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth', { method: 'GET' })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (data.authenticated) router.push('/admin');
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="inline-flex bg-cream/95 rounded-2xl p-3 mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-cream">Admin sign in</h1>
          <p className="mt-2 text-cream/70 text-sm">Qawla editorial dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-cream/90 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent min-h-[48px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn('btn-primary w-full justify-center min-h-[48px]', loading && 'opacity-70')}
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
            <p className="text-xs text-cream/50">
              Protected by HMAC-signed sessions · Rate-limited
            </p>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-cream/60 hover:text-pitch transition-colors">
            ← Back to Qawla
          </Link>
        </div>
      </div>
    </div>
  );
}
