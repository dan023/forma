import { inArray, sql } from 'drizzle-orm';
import { Appearance } from 'react-native';
import { create } from 'zustand';

import type { AccentName } from '@/constants/theme';
import { db } from '@/db/client';
import { settings } from '@/db/schema';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  accent: AccentName;
  setThemeMode: (m: ThemeMode) => void;
  setAccent: (a: AccentName) => void;
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
  setThemeMode: (themeMode) => {
    applyScheme(themeMode);
    set({ themeMode });
    persist('themeMode', themeMode);
  },
  setAccent: (accent) => {
    set({ accent });
    persist('accent', accent);
  },
  hydrate: async () => {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, ['themeMode', 'accent']));
    const saved = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)]));
    if (saved.themeMode) applyScheme(saved.themeMode);
    set({
      ...(saved.themeMode && { themeMode: saved.themeMode as ThemeMode }),
      ...(saved.accent && { accent: saved.accent as AccentName }),
    });
  },
}));
