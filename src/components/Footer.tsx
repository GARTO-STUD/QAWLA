'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useI18n } from '@/components/I18nProvider';
import { LIVE_MATCHES } from '@/lib/mockData';
import type { TranslationKey } from '@/lib/i18n';

const FOOTER_LINKS: { titleKey: TranslationKey; links: { href: string; key: TranslationKey }[] }[] = [
  {
    titleKey: 'footer.explore',
    links: [
      { href: '/news', key: 'nav.news' },
      { href: '/blog', key: 'footer.link_blog' },
      { href: '/live', key: 'nav.live' },
      { href: '/transfers', key: 'nav.transfers' },
    ],
  },
  {
    titleKey: 'footer.club',
    links: [
      { href: '/about', key: 'nav.about' },
      { href: '/contact', key: 'footer.link_contact' },
      { href: '/donate', key: 'nav.support' },
    ],
  },
  {
    titleKey: 'footer.legal',
    links: [
      { href: '/privacy', key: 'footer.link_privacy' },
      { href: '/terms', key: 'footer.link_terms' },
    ],
  },
];

const SOCIAL = [
  {
    href: 'https://x.com',
    label: 'X',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
    ),
  },
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    ),
  },
  {
    href: 'https://youtube.com',
    label: 'YouTube',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    ),
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
    ),
  },
];

export function Footer() {
  const { t } = useI18n();
  const liveCount = LIVE_MATCHES.filter((m) => m.status === 'live' || m.status === 'halftime').length;

  return (
    <footer className="mt-auto bg-night text-cream border-t border-white/10">
      {/* "Stay in the game" — broadcast-style CTA band */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            {/* Left: brand statement + CTAs */}
            <div>
              <h2 className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-cream">
                Stay in the game.
              </h2>
              <p className="mt-4 text-cream/60 text-base sm:text-lg max-w-md font-light normal-case">
                Follow Qawla across your favourite platforms — verified football journalism, delivered the moment it happens.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/live" className="btn-primary justify-center">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-night opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-night" />
                  </span>
                  {liveCount} live now
                </Link>
                <Link href="/news" className="btn-night justify-center border border-white/15">
                  Read the latest
                </Link>
              </div>
            </div>
            {/* Right: social grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group flex items-center gap-3 px-4 py-4 rounded-sm bg-white/5 border border-white/10 hover:border-pitch/40 hover:bg-white/[0.07] transition-all"
                >
                  <span className="w-10 h-10 rounded-sm bg-pitch/15 text-pitch flex items-center justify-center group-hover:bg-pitch group-hover:text-night transition-colors">
                    {s.icon}
                  </span>
                  <span className="text-sm font-semibold text-cream/75 group-hover:text-cream transition-colors normal-case">
                    {s.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-5">
              <Logo light />
            </div>
            <p className="text-cream/50 text-sm leading-relaxed max-w-sm font-light normal-case">
              {t('footer.brand_desc')}
            </p>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((section) => (
            <nav key={section.titleKey} aria-label={t(section.titleKey)}>
              <h3 className="text-cream text-xs font-black uppercase tracking-wider mb-4">{t(section.titleKey)}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-cream/50 text-sm hover:text-pitch transition-colors normal-case">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream/40 text-xs text-center sm:text-left normal-case">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 text-xs text-cream/40">
            <Link href="/privacy" className="hover:text-pitch transition-colors normal-case">{t('footer.link_privacy')}</Link>
            <Link href="/terms" className="hover:text-pitch transition-colors normal-case">{t('footer.link_terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
