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
  backgroundImage?: string;
}

export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  align = 'left',
  variant = 'light',
  children,
  className,
  backgroundImage,
}: PageHeroProps) {
  const bgClass = variant === 'light'
    ? 'bg-gradient-to-br from-cream via-white to-pitch/5'
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
      {/* Hero Background Image for light variant */}
      {variant === 'light' && backgroundImage && (
        <div className="absolute inset-0 opacity-10">
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </div>
      )}
      
      {/* Decorative orbs - adjusted colors for light mode */}
      {variant === 'light' ? (
        <>
          <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-pitch/15 blur-3xl animate-float-slow pointer-events-none" aria-hidden />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gold/10 blur-3xl animate-float pointer-events-none" aria-hidden />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-pitch/5 to-transparent blur-2xl pointer-events-none" aria-hidden />
        </>
      ) : (
        <>
          <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-pitch/10 blur-3xl animate-float-slow pointer-events-none" aria-hidden />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gold/10 blur-3xl animate-float pointer-events-none" aria-hidden />
        </>
      )}

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28',
          align === 'center' && 'text-center',
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5 fade-in-up',
              variant === 'light' ? 'bg-pitch/10 text-pitch-dk border border-pitch/20' : 'bg-white/10 text-pitch backdrop-blur',
            )}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-pitch opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pitch" />
            </span>
            {eyebrow}
          </span>
        )}

        <h1
          className={cn(
            'font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight fade-in-up stagger-1 max-w-4xl',
            textClass,
            align === 'center' && 'mx-auto',
          )}
        >
          {title}
          {highlight && (
            <>
              {' '}
              <span className={cn(
                variant === 'light' 
                  ? 'bg-gradient-to-r from-pitch via-pitch-dark to-pitch-darker bg-clip-text text-transparent' 
                  : 'gradient-text-pitch'
              )}>
                {highlight}
              </span>
            </>
          )}
        </h1>

        {description && (
          <p
            className={cn(
              'mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl fade-in-up stagger-2',
              subTextClass,
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        )}

        {children && (
          <div className={cn('mt-10 fade-in-up stagger-3', align === 'center' && 'flex justify-center')}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
