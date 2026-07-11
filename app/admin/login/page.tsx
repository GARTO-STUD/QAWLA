'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';

const CODE_LENGTH = 6;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');

  useEffect(() => {
    fetch('/api/auth', { method: 'GET' })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (data.authenticated) router.push('/admin');
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submitCode = async (value: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });
      const data = await res.json() as { authenticated?: boolean; error?: string };
      if (data.authenticated) {
        toast('Welcome back.', 'success');
        router.push('/admin');
      } else {
        toast(data.error ?? 'Invalid code.', 'error');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === CODE_LENGTH) submitCode(code);
  };

  const setDigitAt = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index: number, raw: string) => {
    // Digits only — this is a numeric code, not a free-text password.
    const value = raw.replace(/\D/g, '');
    if (!value) {
      setDigitAt(index, '');
      return;
    }
    // Handles a fast typist whose keystroke landed with more than one
    // digit in the event (rare, but happens on some mobile keyboards).
    const chars = value.split('');
    setDigits((prev) => {
      const next = [...prev];
      let i = index;
      for (const ch of chars) {
        if (i >= CODE_LENGTH) break;
        next[i] = ch;
        i++;
      }
      const nextFocus = Math.min(i, CODE_LENGTH - 1);
      requestAnimationFrame(() => inputRefs.current[nextFocus]?.focus());
      if (next.every((d) => d !== '')) submitCode(next.join(''));
      return next;
    });
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      setDigitAt(index - 1, '');
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]!;
    setDigits(next);
    const nextFocus = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
    if (pasted.length === CODE_LENGTH) submitCode(pasted);
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
            <label className="block text-sm font-bold text-cream/90 mb-3 text-center">Enter access code</label>
            <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-display font-bold rounded-xl bg-white/10 border border-white/20 text-cream focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent disabled:opacity-50"
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== CODE_LENGTH}
            className={cn('btn-primary w-full justify-center min-h-[48px]', (loading || code.length !== CODE_LENGTH) && 'opacity-70')}
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
