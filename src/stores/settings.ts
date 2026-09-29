import { Appearance } from 'react-native';
import { create } from 'zustand';

import type { AccentName } from '@/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  accent: AccentName;
  setThemeMode: (m: ThemeMode) => void;
  setAccent: (a: AccentName) => void;
};

// TODO: persistere su expo-sqlite quando arriva lo schema DB.
export const useSettings = create<SettingsState>((set) => ({
  themeMode: 'system',
  accent: 'arancio',
  setThemeMode: (themeMode) => {
    // Sincronizza anche il sistema (status bar, componenti nativi). Su web non ha effetto.
    Appearance.setColorScheme(themeMode === 'system' ? 'unspecified' : themeMode);
    set({ themeMode });
  },
  setAccent: (accent) => set({ accent }),
}));
