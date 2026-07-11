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
}

export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  align = 'left',
  variant = 'dark',
  children,
  className,
}: PageHeroProps) {
  const bgClass = variant === 'light'
    ? 'bg-cream'
    : variant === 'pitch'
    ? 'pitch-gradient'
    : 'night-gradient';

  const textClass = variant === 'light' ? 'text-night' : 'text-cream';
  const subTextClass = variant === 'light' ? 'text-night/70' : 'text-cream/80';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        bgClass,
        variant !== 'light' && 'pitch-pattern',
        className,
      )}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-pitch/10 blur-3xl animate-float-slow pointer-events-none" aria-hidden />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gold/10 blur-3xl animate-float pointer-events-none" aria-hidden />

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24',
          align === 'center' && 'text-center',
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 fade-in-up',
              variant === 'light' ? 'bg-pitch/10 text-pitch-dk' : 'bg-white/10 text-pitch backdrop-blur',
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
            'font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.05] tracking-tight fade-in-up stagger-1 max-w-4xl',
            textClass,
            align === 'center' && 'mx-auto',
          )}
        >
          {title}
          {highlight && (
            <>
              {' '}
              <span className="gradient-text-pitch">{highlight}</span>
            </>
          )}
        </h1>

        {description && (
          <p
            className={cn(
              'mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl fade-in-up stagger-2',
              subTextClass,
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        )}

        {children && (
          <div className={cn('mt-8 fade-in-up stagger-3', align === 'center' && 'flex justify-center')}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
