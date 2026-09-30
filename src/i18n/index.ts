import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { it } from './locales/it';

export const LANGUAGES = ['it', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];
/** Preferenza salvata: una lingua oppure quella del dispositivo. */
export type LanguagePreference = Language | 'system';

/** Nome di ogni lingua nella lingua stessa (non si traduce). */
export const LANGUAGE_NAMES: Record<Language, string> = { it: 'Italiano', en: 'English' };

const isSupported = (code: string | null | undefined): code is Language =>
  LANGUAGES.includes(code as Language);

/** Lingua da usare per una preferenza; con "system" prima lingua supportata del dispositivo, altrimenti inglese. */
export function resolveLanguage(pref: LanguagePreference): Language {
  if (pref !== 'system') return pref;
  return getLocales().map((l) => l.languageCode).find(isSupported) ?? 'en';
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: { it: { translation: it }, en: { translation: en } },
  lng: resolveLanguage('system'),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  // Le risorse sono in memoria: init sincrono, niente Suspense.
  initAsync: false,
  react: { useSuspense: false },
});

export default i18n;
