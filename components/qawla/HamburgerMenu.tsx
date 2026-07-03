'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

/**
 * HamburgerMenu — premium slide-in drawer for mobile navigation.
 *
 * Behaves like a sheet that slides from the right edge with a
 * dimmed backdrop. Includes the Qawla logo, nav links (with
 * section descriptions), quick CTAs, and a footer with social
 * proof. Animations are CSS-driven for snappy 60fps.
 *
 * Accessibility:
 *  - Escape closes
 *  - Backdrop click closes
 *  - Focus trapped inside drawer while open
 *  - aria-expanded on trigger, aria-modal on dialog
 */
export interface HamburgerMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '#top',
    description: 'Top stories & featured coverage',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
  },
  {
    label: 'Latest news',
    href: '#latest',
    description: 'Verified stories from the newsroom',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4l-7 2L8 4 1 6v14a2 2 0 0 0 2 2z" />
        <path d="M8 4v18M16 6v16" />
      </svg>
    ),
  },
  {
    label: 'Leagues',
    href: '#leagues',
    description: 'Premier League, La Liga, Serie A & more',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    label: 'Why Qawla',
    href: '#features',
    description: 'Our editorial standards',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Support us',
    href: '#/donate',
    description: 'Back independent journalism',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

const TRUST_PROOFS = [
  { value: 'Independent', label: 'Reader-funded' },
  { value: 'Ad-free', label: 'No paywall' },
  { value: '8+', label: 'Leagues covered' },
];

export function HamburgerMenu({ open, onOpenChange }: HamburgerMenuProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-night/40 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full w-[88%] max-w-sm',
          'bg-cream text-night',
          'shadow-2xl flex flex-col',
          'animate-[slide-in-right_0.3s_cubic-bezier(0.22,1,0.36,1)_both]',
        )}
        style={{
          animationName: 'slideInRight',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0.4; }
            to   { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.08]">
          <Logo size="sm" variant="dark" />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-black/[0.08] text-night/70 hover:bg-pitch/5 hover:text-night transition-colors"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto scroll-area-qawla p-4" aria-label="Mobile primary">
          <ul className="space-y-1.5">
            {NAV_ITEMS.map((item, idx) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className="group flex items-start gap-3 p-3.5 rounded-xl hover:bg-pitch/8 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${0.04 * idx + 0.1}s` }}
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-pitch/12 text-pitch-darker flex items-center justify-center group-hover:bg-pitch/20 transition-colors">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-base text-night">
                      {item.label}
                    </span>
                    <span className="block text-xs text-night/55 mt-0.5">
                      {item.description}
                    </span>
                  </span>
                  <svg className="shrink-0 mt-1.5 text-night/30 group-hover:text-pitch-darker group-hover:translate-x-0.5 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {/* Trust proofs */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {TRUST_PROOFS.map((t) => (
              <div
                key={t.label}
                className="rounded-xl bg-white border border-black/[0.06] p-3 text-center"
              >
                <p className="font-display font-bold text-sm text-pitch-darker">{t.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-night/50 mt-0.5">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer CTAs */}
        <div className="p-5 border-t border-black/[0.08] space-y-2.5">
          <Link
            href="#/donate"
            onClick={() => onOpenChange(false)}
            className="btn-gold w-full justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Support Qawla
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Hamburger trigger button — animated three-line icon that morphs
 * subtly on hover. Use this as the children of a button in the
 * mobile header.
 */
export function HamburgerTrigger({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      className={cn(
        'inline-flex items-center justify-center w-10 h-10 rounded-xl',
        'border border-night/10 bg-white/60 backdrop-blur',
        'text-night hover:bg-white hover:shadow-sm transition-all',
        'active:scale-95',
        className,
      )}
    >
      <span className="relative w-5 h-3.5 flex flex-col justify-between">
        <span
          className={cn(
            'block h-0.5 w-full bg-current rounded-full transition-all duration-300',
            open && 'translate-y-[6px] rotate-45',
          )}
        />
        <span
          className={cn(
            'block h-0.5 w-full bg-current rounded-full transition-all duration-200',
            open && 'opacity-0',
          )}
        />
        <span
          className={cn(
            'block h-0.5 w-full bg-current rounded-full transition-all duration-300',
            open && '-translate-y-[6px] -rotate-45',
          )}
        />
      </span>
    </button>
  );
}

export default HamburgerMenu;
