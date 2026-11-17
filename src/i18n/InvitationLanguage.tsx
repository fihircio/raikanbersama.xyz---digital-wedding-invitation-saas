import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  INVITATION_LOCALE,
  INVITATION_MESSAGES,
  InvitationLang,
  InvitationLanguageMode,
  normalizeLanguageMode
} from './invitationMessages';

/**
 * Language context for the public invitation page.
 *
 * Resolution order:
 *  1. Visitor override (persisted per invitation so the choice sticks).
 *  2. The owner's `settings.language_mode` (melayu | english | bilingual).
 *
 * `bilingual` shows both languages side by side for headings and CTAs via
 * `td()`, while body/form labels use `t()` in Malay — visitors can still flip
 * to a single language with the toggle.
 */

interface InvitationLanguageContextValue {
  mode: InvitationLanguageMode;
  lang: InvitationLang;
  isBilingual: boolean;
  hasOverride: boolean;
  t: (key: string) => string;
  td: (key: string) => string;
  setLang: (lang: InvitationLang) => void;
  clearOverride: () => void;
  locale: string;
  formatDate: (value: string | Date | undefined) => string;
}

const InvitationLanguageContext = createContext<InvitationLanguageContextValue | null>(null);

const defaultMessages = INVITATION_MESSAGES.melayu;

function readOverride(storageKey?: string): InvitationLang | null {
  if (!storageKey) return null;
  try {
    const value = localStorage.getItem(`rb_lang_${storageKey}`);
    return value === 'melayu' || value === 'english' ? value : null;
  } catch {
    return null;
  }
}

export const InvitationLanguageProvider: React.FC<{
  mode?: unknown;
  storageKey?: string;
  children: React.ReactNode;
}> = ({ mode, storageKey, children }) => {
  const resolvedMode = normalizeLanguageMode(mode);
  const [override, setOverride] = useState<InvitationLang | null>(() => readOverride(storageKey));

  useEffect(() => {
    setOverride(readOverride(storageKey));
  }, [storageKey]);

  const lang: InvitationLang = override ?? (resolvedMode === 'bilingual' ? 'melayu' : resolvedMode);
  const locale = INVITATION_LOCALE[lang];

  const t = useCallback(
    (key: string) =>
      INVITATION_MESSAGES[lang][key] ?? INVITATION_MESSAGES.melayu[key] ?? key,
    [lang]
  );

  const td = useCallback(
    (key: string) => {
      if (override || resolvedMode !== 'bilingual') return t(key);
      const ms = INVITATION_MESSAGES.melayu[key] ?? key;
      const en = INVITATION_MESSAGES.english[key] ?? key;
      return ms === en ? ms : `${ms} / ${en}`;
    },
    [override, resolvedMode, t]
  );

  const setLang = useCallback(
    (next: InvitationLang) => {
      setOverride(next);
      if (!storageKey) return;
      try {
        localStorage.setItem(`rb_lang_${storageKey}`, next);
      } catch {
        // storage unavailable (private mode); the in-memory choice still applies
      }
    },
    [storageKey]
  );

  const clearOverride = useCallback(() => {
    setOverride(null);
    if (!storageKey) return;
    try {
      localStorage.removeItem(`rb_lang_${storageKey}`);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const formatDate = useCallback(
    (value: string | Date | undefined) => {
      if (!value) return t('dateTBD');
      const date = typeof value === 'string' ? new Date(value) : value;
      if (isNaN(date.getTime())) return t('dateTBD');
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    },
    [locale, t]
  );

  const value = useMemo<InvitationLanguageContextValue>(
    () => ({
      mode: resolvedMode,
      lang,
      isBilingual: resolvedMode === 'bilingual' && !override,
      hasOverride: override !== null,
      t,
      td,
      setLang,
      clearOverride,
      locale,
      formatDate
    }),
    [resolvedMode, lang, override, t, td, setLang, clearOverride, locale, formatDate]
  );

  return (
    <InvitationLanguageContext.Provider value={value}>{children}</InvitationLanguageContext.Provider>
  );
};

/**
 * Fallback used by components rendered outside a provider (catalog previews,
 * editor thumbnails): Malay strings, so nothing renders an raw key.
 */
export const useInvitationLanguage = (): InvitationLanguageContextValue => {
  const context = useContext(InvitationLanguageContext);
  if (context) return context;

  const t = (key: string) => defaultMessages[key] ?? key;
  return {
    mode: 'melayu',
    lang: 'melayu',
    isBilingual: false,
    hasOverride: false,
    t,
    td: t,
    setLang: () => {},
    clearOverride: () => {},
    locale: INVITATION_LOCALE.melayu,
    formatDate: (value?: string | Date) => {
      if (!value) return t('dateTBD');
      const date = typeof value === 'string' ? new Date(value) : value;
      return isNaN(date.getTime()) ? t('dateTBD') : date.toLocaleDateString(INVITATION_LOCALE.melayu, { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };
};
