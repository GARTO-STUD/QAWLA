'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/I18nProvider';
import { cn } from '@/lib/utils';
import { LIVE_MATCHES } from '@/lib/mockData';
import type { TranslationKey } from '@/lib/i18n';

const NAV: { href: string; key: TranslationKey }[] = [
  { href: '/news', key: 'nav.news' },
  { href: '/live', key: 'nav.live' },
  { href: '/transfers', key: 'nav.transfers' },
  { href: '/blog', key: 'nav.blog' },
  { href: '/about', key: 'nav.about' },
  { href: '/donate', key: 'nav.support' },
];

export function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ticker = LIVE_MATCHES.slice(0, 4);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Live score ticker — the broadcast signature strip */}
      <div className="hidden sm:block bg-pitch text-night overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-6 h-8 text-[11px] font-black uppercase tracking-wide whitespace-nowrap overflow-x-auto no-scrollbar">
          {ticker.map((m) => (
            <Link key={m.id} href="/live" className="flex items-center gap-1.5 flex-shrink-0 hover:underline">
              {(m.status === 'live' || m.status === 'halftime') && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" aria-hidden />
              )}
              <span>{m.homeTeam.shortName}</span>
              <span>{m.status === 'scheduled' ? 'vs' : `${m.homeScore}-${m.awayScore}`}</span>
              <span>{m.awayTeam.shortName}</span>
              {m.status === 'live' && <span>{m.minute}&apos;</span>}
            </Link>
          ))}
        </div>
      </div>

      <div
        className={cn(
          'w-full transition-all duration-300 bg-night text-cream',
          scrolled ? 'shadow-lg shadow-night/20 border-b border-white/10' : 'border-b border-white/5',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
            <Logo light />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-xs font-black uppercase tracking-wide text-cream/75 hover:text-pitch hover:bg-white/5 rounded-sm transition-colors"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/search"
                className="inline-flex items-center justify-center w-10 h-10 rounded-sm text-cream/80 hover:text-pitch hover:bg-white/5 transition-colors"
                aria-label={t('nav.search')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-sm text-cream hover:bg-white/10 active:scale-95 transition-all"
              aria-label={t('nav.open_menu')}
              aria-expanded={open}
            >
              <Menu width={24} height={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile off-canvas sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-night/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-night text-cream shadow-2xl slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <Logo size="sm" light />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-11 h-11 rounded-sm text-cream hover:bg-white/10 active:scale-95 transition-all"
                aria-label={t('nav.close_menu')}
              >
                <X width={24} height={24} strokeWidth={2.5} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-sm text-base font-black uppercase tracking-wide text-cream hover:bg-white/10 transition-colors min-h-[44px]"
                    >
                      {t(item.key)}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream/40">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/search"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-sm text-base font-black uppercase tracking-wide text-cream hover:bg-white/10 transition-colors min-h-[44px]"
                  >
                    {t('nav.search')}
                  </Link>
                </li>
              </ul>

              {/* Language switcher inside hamburger */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-black text-cream/50 uppercase tracking-wider px-4 mb-2">{t('nav.language')}</p>
                <div className="px-4">
                  <LanguageSwitcher variant="inline" />
                </div>
              </div>
            </nav>
            <div className="p-4 border-t border-white/10">
              <Link href="/donate" onClick={() => setOpen(false)} className="btn-primary w-full justify-center">
                {t('home.support_btn')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
