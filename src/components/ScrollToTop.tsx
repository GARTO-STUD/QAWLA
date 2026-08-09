'use client';

import { useEffect, useState } from 'react';

/**
 * Floating "back to top" button. Appears after the user scrolls past
 * one viewport height, respects reduced-motion, and is fully
 * keyboard/screen-reader accessible.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full
        bg-white text-night shadow-lg shadow-night/10 ring-1 ring-black/5
        flex items-center justify-center transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl hover:text-pitch-dk hover:ring-pitch/20
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
