'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  label?: string;
}

/**
 * AdSense ad slot. Renders a placeholder in development.
 * In production with NEXT_PUBLIC_ADSENSE_ID set, pushes to adsbygoogle.
 *
 * IMPORTANT: this file previously had no 'use client' directive, which
 * means Next.js App Router treated it as a Server Component by default.
 * Server Components only ever execute on the server/during static
 * generation — they never run in the browser. The old `ScriptInjector`
 * sub-component guarded its side effect with `typeof window !== 'undefined'`
 * as if it were client-side code, but that check is always false during an
 * actual server render (no `window` there), so the `adsbygoogle.push({})`
 * call that tells Google's script to fill the ad slot never fired at all —
 * ads would never actually load in production no matter how correctly this
 * component was configured. (The adsbygoogle.js loader script itself is
 * already loaded separately, once, by components/Analytics.tsx — this fix
 * is only about the per-slot push() call.)
 */
export function AdBanner({
  slot = '1234567890',
  format = 'auto',
  className,
  label = 'Advertisement',
}: AdBannerProps) {
  const isProd = process.env.NODE_ENV === 'production';
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!isProd || !adsenseId) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      // adsbygoogle.js hasn't loaded yet, or ad-blocked — fail silently,
      // this must never break the page.
    }
    // Runs once per mount for this specific slot; intentionally not
    // re-run on prop changes since re-pushing the same <ins> element is
    // what AdSense explicitly warns against ("already have ads in this slot").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isProd || !adsenseId) {
    return (
      <div
        className={cn(
          'flex items-center justify-center min-h-[90px] sm:min-h-[120px] bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400 text-xs font-semibold uppercase tracking-wider',
          className,
        )}
        aria-label="Advertisement placeholder"
      >
        {label} · {format}
      </div>
    );
  }

  return (
    <div className={cn('ad-container', className)} aria-label="Advertisement">
      <span className="sr-only">{label}</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
