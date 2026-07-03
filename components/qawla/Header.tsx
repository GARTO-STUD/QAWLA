'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { HamburgerMenu, HamburgerTrigger } from './HamburgerMenu';

const NAV_ITEMS = [
  { label: 'Home', href: '#top' },
  { label: 'News', href: '#latest' },
  { label: 'Leagues', href: '#leagues' },
  { label: 'Why Qawla', href: '#features' },
];

/**
 * Header — sticky top navigation with logo, links, CTAs, and
 * a hamburger drawer for mobile.
 *
 * The bar becomes opaque/blurred once the user scrolls past 24px.
 * On mobile, the desktop nav collapses and a hamburger trigger
 * takes its place; tapping it opens a full-height drawer.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-cream/85 backdrop-blur-xl border-b border-black/5 shadow-sm'
            : 'bg-transparent',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link
              href="#top"
              className="group"
              aria-label="Qawla home"
            >
              <Logo size="sm" variant="dark" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-semibold text-night/70 hover:text-night hover:bg-night/5 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden sm:flex items-center gap-2">
              <Link href="#/donate" className="btn-gold !px-4 !py-2 !text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Support
              </Link>
            </div>

            {/* Mobile: hamburger */}
            <div className="sm:hidden">
              <HamburgerTrigger open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <HamburgerMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

export default Header;
