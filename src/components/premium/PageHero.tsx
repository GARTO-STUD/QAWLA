import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: 'left' | 'center';
  variant?: 'light' | 'dark' | 'pitch';
  children?: React.ReactNode;
  className?: string;
  /** Optional soft background image, shown faintly behind the content on a light hero. */
  bgImage?: string;
  /** Eyebrow accent color. default 'pitch' */
  accent?: 'pitch' | 'gold';
}

/**
 * Page hero — elegant, light, editorial.
 *
 * Defaults to a clean white/cream background with a Playfair Display
 * serif title, subtle floating gradient orbs, and a faint pitch grid.
 * Pass `variant="dark"` for the rare dark hero, or `variant="pitch"`
 * for a pitch-gradient hero.
 */
export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  align = 'left',
  variant = 'light',
  children,
  className,
  bgImage,
  accent = 'pitch',
}: PageHeroProps) {
  const isDark = variant === 'dark';
  const isPitch = variant === 'pitch';

  const bgClass = isDark
    ? 'bg-night'
    : isPitch
    ? 'pitch-gradient'
    : 'bg-cream';

  const textClass = isDark || isPitch ? 'text-cream' : 'text-night';
  const subTextClass = isDark || isPitch ? 'text-cream/80' : 'text-night/65';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        bgClass,
        !isDark && !isPitch && 'pitch-pattern-light',
        className,
      )}
    >
      {/* Faint background image on light hero */}
      {bgImage && !isDark && !isPitch && (
        <div className="absolute inset-0 opacity-[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {bgImage && isDark && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgImage} alt="" className="w-full h-full object-cover animate-hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-br from-night via-night/85 to-night/40" />
        </div>
      )}

      {/* Decorative orbs */}
      <div
        className={cn(
          'absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl animate-float-slow pointer-events-none',
          isDark ? 'bg-pitch/10' : 'bg-pitch/10',
        )}
        aria-hidden
      />
      <div
        className={cn(
          'absolute -bottom-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl animate-float pointer-events-none',
          isDark ? 'bg-gold/10' : 'bg-gold/10',
        )}
        aria-hidden
      />

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28',
          align === 'center' && 'text-center',
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.12em] mb-5 fade-in-up',
              isDark || isPitch
                ? 'bg-white/10 text-pitch backdrop-blur'
                : 'bg-pitch/10 text-pitch-dk ring-1 ring-pitch/15',
              accent === 'gold' && !isDark && !isPitch && 'bg-gold/15 text-gold-dark ring-gold/20',
            )}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-pitch opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pitch" />
            </span>
            {eyebrow}
          </span>
        )}

        <h1
          className={cn(
            'heading-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl fade-in-up stagger-1 max-w-4xl',
            textClass,
            align === 'center' && 'mx-auto',
          )}
        >
          {title}
          {highlight && (
            <>
              {' '}
              <span className="gradient-text-pitch italic">{highlight}</span>
            </>
          )}
        </h1>

        {description && (
          <p
            className={cn(
              'mt-6 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl fade-in-up stagger-2 font-light',
              subTextClass,
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        )}

        {children && (
          <div className={cn('mt-9 fade-in-up stagger-3', align === 'center' && 'flex justify-center')}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
