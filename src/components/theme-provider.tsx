import { VariableContextProvider } from 'nativewind';
import { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Espone i token del tema corrente (chiaro/scuro + accento) come variabili CSS a tutto l'albero. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const t = useTheme();
  const vars = useMemo(
    () => ({
      '--color-bg': t.bg,
      '--color-card': t.card,
      '--color-ink': t.ink,
      '--color-ink-2': t.ink2,
      '--color-line': t.line,
      '--color-accent': t.accent,
      '--color-accent-ink': t.accentInk,
      '--color-ok': t.ok,
    }),
    [t],
  );
  return (
    <VariableContextProvider value={vars}>
      <View className="flex-1 bg-bg">{children}</View>
    </VariableContextProvider>
  );
}
