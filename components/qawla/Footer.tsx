'use client';

import Link from 'next/link';
import { Logo } from './Logo';

const FOOTER_LINKS = {
  Explore: [
    { label: 'Latest news', href: '#latest' },
    { label: 'Leagues', href: '#leagues' },
    { label: 'Why Qawla', href: '#features' },
    { label: 'Support us', href: '#/donate' },
  ],
  Coverage: [
    { label: 'Premier League', href: '#leagues' },
    { label: 'La Liga', href: '#leagues' },
    { label: 'Serie A', href: '#leagues' },
    { label: 'Champions League', href: '#leagues' },
  ],
  Contact: [
    { label: 'editorial@qawla.com', href: 'mailto:editorial@qawla.com' },
    { label: 'support@qawla.com', href: 'mailto:support@qawla.com' },
    { label: 'privacy@qawla.com', href: 'mailto:privacy@qawla.com' },
  ],
};

/**
 * Footer — site-wide footer with newsletter, link columns, brand,
 * and legal line. Light-themed (cream background, night text).
 * Sticks to the bottom of the viewport when content is short.
 */
export function Footer() {
  return (
    <footer
      id="legal"
      className="relative mt-auto bg-cream border-t border-black/[0.08]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 lg:pt-20 pb-8">
        {/* Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-10 sm:pb-12 border-b border-black/[0.08]">
          <div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-night mb-2">
              Never miss a story.
            </h3>
            <p className="text-night/60 max-w-md text-sm sm:text-base leading-relaxed">
              The biggest football news, transfers, and tactical breakdowns —
              delivered weekly to your inbox. No spam, ever.
            </p>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-3 lg:justify-end"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 lg:max-w-xs px-4 py-3 rounded-xl bg-white border border-black/[0.1] text-night placeholder:text-night/40 focus:outline-none focus:ring-2 focus:ring-pitch/40 focus:border-pitch/30 min-h-[44px]"
            />
            <button
              type="submit"
              className="btn-gold !px-6 !py-3 justify-center"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 sm:py-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Logo size="sm" variant="dark" />
            <p className="text-night/55 text-sm leading-relaxed mb-4 max-w-xs mt-3">
              Premium football journalism, covered with depth and integrity.
              Reader-funded. No clickbait.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-night/50 mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li key={`${title}-${idx}`}>
                    <Link
                      href={item.href}
                      className="text-sm text-night/65 hover:text-pitch-darker transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-night/50 text-center sm:text-left">
            © {new Date().getFullYear()} Qawla. All rights reserved. Built
            with care for readers who think the game.
          </p>
          <div className="flex items-center gap-4 text-xs text-night/50">
            <Link href="#top" className="hover:text-pitch-darker transition-colors">
              Back to top
            </Link>
            <span aria-hidden>·</span>
            <Link href="#/donate" className="hover:text-pitch-darker transition-colors">
              Donate
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
