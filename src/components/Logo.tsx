import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Use a light (cream) wordmark for placement on dark/night backgrounds. */
  light?: boolean;
}

/**
 * Qawla Logo — An elegant "Q" monogram.
 *
 * A soft-rounded badge filled with the pitch gradient, with the letter
 * "Q" rendered in the same display typeface as the "Qawla" wordmark.
 * Carefully sized so the Q (including its descender tail) sits perfectly
 * centered inside the badge.
 */
export function Logo({ className, showText = true, size = 'md', light = false }: LogoProps) {
  const dim = size === 'sm' ? 30 : size === 'lg' ? 46 : 38;
  // Q font-size tuned per badge size so the glyph (with descender) fits.
  const qSize = size === 'sm' ? 'text-[1.05rem]' : size === 'lg' ? 'text-[1.6rem]' : 'text-[1.3rem]';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <a
      href="/"
      className={cn('inline-flex items-center gap-2.5 group', className)}
      aria-label="Qawla home"
    >
      <span
        className="relative inline-flex items-center justify-center rounded-[30%] pitch-gradient shadow-md shadow-pitch/25 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 overflow-hidden flex-shrink-0"
        style={{ width: dim, height: dim }}
      >
        {/* Soft top-left sheen for depth */}
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)',
          }}
          aria-hidden
        />
        {/* The Q letterform — same Playfair serif as the wordmark.
            Nudge up slightly so the descender tail doesn't make it
            look bottom-heavy. */}
        <span
          className={cn(
            'font-serif font-bold leading-none text-white select-none',
            qSize,
          )}
          style={{ transform: 'translateY(-0.06em)' }}
          aria-hidden
        >
          Q
        </span>
      </span>
      {showText && (
        <span className={cn('font-serif font-bold tracking-tight', light ? 'text-cream' : 'text-night', textSize)}>
          Qawla
        </span>
      )}
    </a>
  );
}
