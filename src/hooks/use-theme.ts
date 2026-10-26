import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

import { accentScale, Accents, DEFAULT_ACCENT, Palette, statusScale, type Colors, type Scheme } from '@/constants/theme';
import { useSettings } from '@/stores/settings';

export type Theme = Colors & { scheme: Scheme } & ReturnType<typeof accentScale> & { status: ReturnType<typeof statusScale> };

/** Accento locale (`AccentScope`): nelle schermate di una scheda il suo colore prende il posto dell'accento. */
export const AccentOverride = createContext<string | null>(null);

export function useTheme(): Theme {
  const system = useColorScheme();
  const mode = useSettings((s) => s.themeMode);
  const accent = useSettings((s) => s.accent);
  const override = useContext(AccentOverride);
  const scheme: Scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return { ...Palette[scheme], scheme, ...accentScale(override ?? Accents[accent] ?? Accents[DEFAULT_ACCENT], scheme), status: statusScale(scheme) };
}
