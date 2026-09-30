import { inArray, sql } from 'drizzle-orm';
import { Appearance } from 'react-native';
import { create } from 'zustand';

import type { AccentName } from '@/constants/theme';
import { db } from '@/db/client';
import i18n, { LANGUAGES, resolveLanguage, type LanguagePreference } from '@/i18n';
import { settings } from '@/db/schema';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  accent: AccentName;
  language: LanguagePreference;
  setThemeMode: (m: ThemeMode) => void;
  setAccent: (a: AccentName) => void;
  setLanguage: (l: LanguagePreference) => void;
  /** Carica le impostazioni salvate; da chiamare dopo le migrazioni. */
  hydrate: () => Promise<void>;
};

// Sincronizza anche il sistema (status bar, componenti nativi). Su web non ha effetto.
const applyScheme = (m: ThemeMode) => Appearance.setColorScheme(m === 'system' ? 'unspecified' : m);

const persist = (key: string, value: unknown) =>
  db
    .insert(settings)
    .values({ key, value: JSON.stringify(value) })
    .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } })
    .catch((e) => console.warn(`Impossibile salvare l'impostazione "${key}"`, e));

export const useSettings = create<SettingsState>((set) => ({
  themeMode: 'system',
  accent: 'arancio',
  language: 'system',
  setThemeMode: (themeMode) => {
    applyScheme(themeMode);
    set({ themeMode });
    persist('themeMode', themeMode);
  },
  setAccent: (accent) => {
    set({ accent });
    persist('accent', accent);
  },
  setLanguage: (language) => {
    i18n.changeLanguage(resolveLanguage(language));
    set({ language });
    persist('language', language);
  },
  hydrate: async () => {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, ['themeMode', 'accent', 'language']));
    const saved = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)]));
    if (saved.themeMode) applyScheme(saved.themeMode);
    const language: LanguagePreference | undefined = [...LANGUAGES, 'system'].includes(saved.language)
      ? saved.language
      : undefined;
    if (language) i18n.changeLanguage(resolveLanguage(language));
    set({
      ...(saved.themeMode && { themeMode: saved.themeMode as ThemeMode }),
      ...(saved.accent && { accent: saved.accent as AccentName }),
      ...(language && { language }),
    });
  },
}));
