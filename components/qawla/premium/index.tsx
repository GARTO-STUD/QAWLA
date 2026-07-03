'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * PageHero — editorial hero banner with eyebrow, title + highlight,
 * description, and CTA slot. Supports a `dark` variant for the night
 * navy palette and a `light` variant for cream backgrounds.
 */
export interface PageHeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  variant?: 'dark' | 'light';
  children?: ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  variant = 'dark',
  children,
  className,
}: PageHeroProps) {
  const isDark = variant === 'dark';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        isDark
          ? 'night-gradient pitch-pattern text-cream'
          : 'bg-cream text-night',
        'pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-20',
        className,
      )}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className={cn(
          'absolute -top-32 left-1/2 -translate-x-1/2 w-[64rem] h-[32rem] rounded-full blur-3xl pointer-events-none',
          isDark ? 'bg-pitch/10' : 'bg-pitch/5',
        )}
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-gold/10"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow && (
            <span
              className={cn(
                'badge mb-4 animate-fade-in-up',
                isDark ? 'bg-pitch/20 text-pitch' : 'bg-pitch/10 text-pitch-dark',
              )}
            >
              {eyebrow}
            </span>
          )}

          <h1
            className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] animate-fade-in-up"
            style={{ animationDelay: '0.05s' }}
          >
            {title}{' '}
            {highlight && (
              <span
                className={cn(
                  'bg-clip-text text-transparent bg-gradient-to-r',
                  isDark
                    ? 'from-pitch via-pitch to-gold'
                    : 'from-pitch-dark via-pitch to-gold-dark',
                )}
              >
                {highlight}
              </span>
            )}
          </h1>

          {description && (
            <p
              className={cn(
                'mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl animate-fade-in-up',
                isDark ? 'text-cream/75' : 'text-night/70',
              )}
              style={{ animationDelay: '0.1s' }}
            >
              {description}
            </p>
          )}

          {children && (
            <div
              className="mt-7 sm:mt-8 animate-fade-in-up"
              style={{ animationDelay: '0.15s' }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * StatCard — single metric tile with optional icon, suffix, and color variant.
 */
export interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  variant?: 'default' | 'pitch' | 'gold' | 'night';
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  suffix,
  variant = 'default',
  icon,
  className,
}: StatCardProps) {
  const variants: Record<NonNullable<StatCardProps['variant']>, string> = {
    default: 'bg-white border-gray-200 text-night',
    pitch: 'bg-gradient-to-br from-pitch to-pitch-dark text-white border-transparent',
    gold: 'bg-gradient-to-br from-gold to-gold-dark text-night border-transparent',
    night: 'bg-gradient-to-br from-night to-night-light text-cream border-transparent',
  };

  const iconWrap: Record<NonNullable<StatCardProps['variant']>, string> = {
    default: 'bg-pitch/10 text-pitch-dark',
    pitch: 'bg-white/15 text-white',
    gold: 'bg-night/10 text-night',
    night: 'bg-pitch/20 text-pitch',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-all card-lift',
        variants[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2',
              variant === 'default' ? 'text-night/60' : 'text-current/80',
            )}
          >
            {label}
          </p>
          <p className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tabular-nums">
            {value}
            {suffix && <span className="text-xl sm:text-2xl ml-0.5">{suffix}</span>}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              'shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center',
              iconWrap[variant],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Skeletons & state views ──────────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md bg-night/5 animate-pulse shimmer',
        className,
      )}
      aria-hidden
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

/* ─── Empty / Error / Loading state views ──────────────────────────────────── */

export interface StateViewProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Check back soon — fresh stories are being scouted right now.',
  icon,
  action,
  className,
}: StateViewProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-gray-300 bg-cream/50 p-10 sm:p-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-pitch/10 text-pitch-dark flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-lg sm:text-xl text-night mb-1.5">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-night/60 max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  icon,
  action,
  className,
}: StateViewProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-red-200 bg-red-50/60 p-10 sm:p-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-lg sm:text-xl text-night mb-1.5">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-night/60 max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 py-10 text-night/60',
        className,
      )}
      role="status"
    >
      <span className="w-5 h-5 rounded-full border-2 border-pitch/30 border-t-pitch animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

/* ─── Convenience re-exports ──────────────────────────────────────────────── */

export default PageHero;
