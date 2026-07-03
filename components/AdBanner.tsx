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
 */
export function AdBanner({
  slot = '1234567890',
  format = 'auto',
  className,
  label = 'Advertisement',
}: AdBannerProps) {
  const isProd = process.env.NODE_ENV === 'production';
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

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
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <ScriptInjector />
    </div>
  );
}

function ScriptInjector() {
  // Inline script to push the ad; runs client-side after hydration
  if (typeof window !== 'undefined') {
    const w = window as unknown as { adsbygoogle?: unknown[] };
    w.adsbygoogle = w.adsbygoogle || [];
    w.adsbygoogle.push({});
  }
  return null;
}
