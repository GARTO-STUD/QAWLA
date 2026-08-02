'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
    ),
  },
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    ),
  },
  {
    href: 'https://youtube.com',
    label: 'YouTube',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    ),
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
    ),
  },
];

export function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="mt-auto bg-white border-t border-gray-200">
      {/* Newsletter - Light version */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-night">
                {t('footer.newsletter_title')}
              </h2>
              <p className="mt-3 text-night/70 text-sm sm:text-base max-w-md">
                {t('footer.newsletter_desc')}
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.email_placeholder')}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-night placeholder:text-night/40 focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent min-h-[48px] text-sm"
                aria-label={t('footer.email_aria')}
              />
              <button
                type="submit"
                className="btn-primary justify-center whitespace-nowrap"
              >
                {subscribed ? t('footer.subscribed') : t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer - Light version */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-5">
              <Logo />
            </div>
            <p className="text-night/60 text-sm leading-relaxed max-w-sm mb-6">
              {t('footer.brand_desc')}
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-night/60 hover:text-pitch-dk hover:border-pitch/40 hover:bg-pitch/10 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((section) => (
            <nav key={section.titleKey} aria-label={t(section.titleKey)}>
              <h3 className="text-night/90 text-sm font-bold uppercase tracking-wider mb-4">{t(section.titleKey)}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-night/55 text-sm hover:text-pitch-dk transition-colors">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Removed trust badges section as requested */}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-night/40 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 text-xs text-night/40">
            <Link href="/privacy" className="hover:text-night/80 transition-colors">{t('footer.link_privacy')}</Link>
            <Link href="/terms" className="hover:text-night/80 transition-colors">{t('footer.link_terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
