import { useColorScheme } from 'react-native';

import { accentScale, Accents, DEFAULT_ACCENT, Palette, statusScale, type Colors, type Scheme } from '@/constants/theme';
import { useSettings } from '@/stores/settings';

export type Theme = Colors & { scheme: Scheme } & ReturnType<typeof accentScale> & { status: ReturnType<typeof statusScale> };

export function useTheme(): Theme {
  const system = useColorScheme();
  const mode = useSettings((s) => s.themeMode);
  const accent = useSettings((s) => s.accent);
  const scheme: Scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return { ...Palette[scheme], scheme, ...accentScale(Accents[accent] ?? Accents[DEFAULT_ACCENT], scheme), status: statusScale(scheme) };
}
