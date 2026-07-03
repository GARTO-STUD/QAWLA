import { cn } from '@/lib/utils';

/**
 * Logo — Qawla's framed Q monogram.
 *
 * The Q is rendered as a typographic character in the Bricolage
 * Grotesque display font — exactly matching the Q in the "Qawla"
 * wordmark. No geometric ring, no gold dots; just the letter Q
 * as it appears in the site name, set inside a pitch-green framed
 * badge with a cream/white interior.
 *
 * Design language:
 *  - Outer frame: rounded square, pitch-green gradient
 *  - Interior: cream-to-white gradient
 *  - The Q: typographic character in font-display font-extrabold,
 *    deep pitch green for contrast on the light interior
 *
 * Use `size="sm"` for inline contexts (nav, footer), `lg` for hero /
 * login screens, and `xl` for splash. The `wordmark` prop renders the
 * Qawla wordmark beside the mark; the `variant` prop controls the
 * wordmark color (`light` = cream, `dark` = night).
 */
export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wordmark?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

const SIZE_MAP: Record<NonNullable<LogoProps['size']>, { box: string; text: string; qSize: string }> = {
  xs: { box: 'w-7 h-7',   text: 'text-base', qSize: 'text-[18px]' },
  sm: { box: 'w-9 h-9',   text: 'text-lg',   qSize: 'text-[24px]' },
  md: { box: 'w-11 h-11', text: 'text-xl',   qSize: 'text-[30px]' },
  lg: { box: 'w-16 h-16', text: 'text-3xl',  qSize: 'text-[44px]' },
  xl: { box: 'w-24 h-24', text: 'text-4xl',  qSize: 'text-[66px]' },
};

export function Logo({ size = 'sm', wordmark = true, variant = 'dark', className }: LogoProps) {
  const s = SIZE_MAP[size];
  const textColor = variant === 'light' ? 'text-cream' : 'text-night';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('relative inline-flex shrink-0', s.box)}>
        {/* Subtle ambient glow */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-[28%] bg-pitch/20 blur-md opacity-50"
        />
        {/* Outer frame (pitch green gradient) */}
        <span className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-pitch via-pitch-dark to-pitch-darker" />
        {/* Interior (cream to white) */}
        <span className="absolute inset-[3px] rounded-[23%] bg-gradient-to-b from-white to-cream" />
        {/* Inner border line for depth */}
        <span className="absolute inset-[3px] rounded-[23%] border border-pitch/15" />
        {/* Top edge highlight */}
        <span className="absolute top-[3px] left-[3px] right-[3px] h-[2px] rounded-t-[23%] bg-pitch-dark/10" />
        {/* The letter Q — same font as the Qawla wordmark */}
        <span
          className={cn(
            'relative flex items-center justify-center w-full h-full font-display font-extrabold text-pitch-darker leading-none select-none',
            s.qSize,
          )}
          style={{ paddingBottom: '2px' }}
        >
          Q
        </span>
      </span>

      {wordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display font-extrabold tracking-tight', s.text, textColor)}>
            Qawla
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-[10px] uppercase tracking-[0.2em] text-pitch-darker font-semibold mt-1">
              Football, verified
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}

export default Logo;
