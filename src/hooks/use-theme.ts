import { useColorScheme } from 'react-native';

import { ACCENT_INK, Accents, Palette, type Colors, type Scheme } from '@/constants/theme';
import { useSettings } from '@/stores/settings';

export type Theme = Colors & { scheme: Scheme; accent: string; accentInk: string };

export function useTheme(): Theme {
  const system = useColorScheme();
  const mode = useSettings((s) => s.themeMode);
  const accent = useSettings((s) => s.accent);
  const scheme: Scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return { ...Palette[scheme], scheme, accent: Accents[accent], accentInk: ACCENT_INK };
}
