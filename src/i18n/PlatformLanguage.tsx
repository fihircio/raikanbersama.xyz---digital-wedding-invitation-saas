import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PLATFORM_LOCALE, PLATFORM_MESSAGES, PlatformLang } from './platformMessages';

/**
 * Platform UI language (app chrome, auth, dashboard, catalog).
 *
 * Independent from the guest invitation language: this is a per-visitor
 * preference for the product interface, stored locally and defaulting to Malay
 * so the app behaves identically for everyone until they opt in.
 */

const STORAGE_KEY = 'rb_platform_lang';

interface PlatformLanguageContextValue {
  lang: PlatformLang;
  setLang: (lang: PlatformLang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;
}

const PlatformLanguageContext = createContext<PlatformLanguageContextValue | null>(null);

function readStored(): PlatformLang {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'english' ? 'english' : 'melayu';
  } catch {
    return 'melayu';
  }
}

export const PlatformLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<PlatformLang>(() => readStored());

  const setLang = useCallback((next: PlatformLang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable; the in-memory choice still applies
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'melayu' ? 'english' : 'melayu');
  }, [lang, setLang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const template = PLATFORM_MESSAGES[lang][key] ?? PLATFORM_MESSAGES.melayu[key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
        template
      );
    },
    [lang]
  );

  // Keep <html lang> in sync for accessibility and correct hyphenation.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'english' ? 'en' : 'ms';
    }
  }, [lang]);

  const value = useMemo<PlatformLanguageContextValue>(
    () => ({ lang, setLang, toggleLang, t, locale: PLATFORM_LOCALE[lang] }),
    [lang, setLang, toggleLang, t]
  );

  return <PlatformLanguageContext.Provider value={value}>{children}</PlatformLanguageContext.Provider>;
};

/**
 * Falls back to Malay when used outside the provider (tests, isolated previews)
 * so components never render a raw key.
 */
export const usePlatformLanguage = (): PlatformLanguageContextValue => {
  const context = useContext(PlatformLanguageContext);
  if (context) return context;

  return {
    lang: 'melayu',
    setLang: () => {},
    toggleLang: () => {},
    t: (key: string, vars?: Record<string, string | number>) => {
      const template = PLATFORM_MESSAGES.melayu[key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
        template
      );
    },
    locale: PLATFORM_LOCALE.melayu
  };
};
