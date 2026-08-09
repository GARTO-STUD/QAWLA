/**
 * components/LanguageSwitcher.tsx — Language selector (text only, no flags)
 *
 * Displays as a horizontal row of language names inside the hamburger menu,
 * or a compact dropdown on desktop.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n, LOCALES, LOCALE_NAMES } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ variant = 'dropdown' }: { variant?: 'dropdown' | 'inline' }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Inline variant: horizontal row of buttons (used inside hamburger menu)
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((l: Locale) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className={cn(
              'px-3 py-2 rounded-xl text-sm font-bold transition-all min-h-[40px]',
              locale === l
                ? 'bg-pitch/15 text-pitch-dk border border-pitch/30'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pitch/30'
            )}
          >
            {LOCALE_NAMES[l]}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (desktop header)
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-pitch/30 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{LOCALE_NAMES[locale]}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 scale-in">
          {LOCALES.map((l: Locale) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold transition-colors',
                locale === l ? 'bg-pitch/10 text-pitch-dk' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {LOCALE_NAMES[l]}
              {locale === l && <Check className="w-4 h-4 text-pitch-dk" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
