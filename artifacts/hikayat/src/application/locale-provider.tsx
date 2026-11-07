import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale, Localized } from '@/domain/product';
import { MESSAGES, type MessageKey } from '@/i18n/messages';
import { localStore, STORAGE_KEYS } from '@/infrastructure/storage';

type Params = Record<string, string | number>;

interface LocaleContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: MessageKey, params?: Params) => string;
  pick: (value: Localized) => string;
  formatPrice: (amount: number) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);
const isLocale = (v: unknown): v is Locale => v === 'en' || v === 'ar';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => localStore.read(STORAGE_KEYS.locale, 'en', isLocale));
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStore.write(STORAGE_KEYS.locale, locale);
  }, [locale, dir]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggleLocale = useCallback(() => setLocaleState((l) => (l === 'en' ? 'ar' : 'en')), []);

  const value = useMemo<LocaleContextValue>(() => {
    const priceFmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency', currency: 'SAR', maximumFractionDigits: 0,
    });
    const numFmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US');
    return {
      locale, dir, setLocale, toggleLocale,
      t: (key, params) => {
        let s = MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
        if (params) for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, typeof v === 'number' ? numFmt.format(v) : v);
        return s;
      },
      pick: (v) => v[locale],
      formatPrice: (amount) => priceFmt.format(amount),
    };
  }, [locale, dir, setLocale, toggleLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
  return ctx;
}
