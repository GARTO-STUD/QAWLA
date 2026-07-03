/**
 * components/I18nProvider.tsx — Client-side i18n context
 *
 * Stores locale in localStorage and provides translation function.
 * Defaults to browser language, falls back to English.
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  type Locale,
  type TranslationKey,
  LOCALES,
  LOCALE_NAMES,
  getTranslations,
} from '@/lib/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'qawla_locale';

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && LOCALES.includes(stored)) return stored;
  const browser = navigator.language.slice(0, 2) as Locale;
  if (LOCALES.includes(browser)) return browser;
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const tFn = getTranslations(locale);
  const t = useCallback((key: TranslationKey) => tFn(key), [locale, tFn]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for server components or missing provider
    const tFn = getTranslations('en');
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key: TranslationKey) => tFn(key),
    };
  }
  return ctx;
}

export { LOCALES, LOCALE_NAMES };
