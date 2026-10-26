import { VariableContextProvider } from 'nativewind';
import { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';

import { AccentOverride, useTheme } from '@/hooks/use-theme';

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
      '--color-control': t.control,
      '--color-primary': t.primary,
      '--color-on-primary': t.onPrimary,
      '--color-track': t.track,
      '--color-accent': t.accent,
      '--color-accent-ink': t.accentInk,
      '--color-tint': t.tint,
      '--color-tint-strong': t.tintStrong,
      '--color-prot': t.prot,
      '--color-carb': t.carb,
      '--color-fat': t.fat,
      '--color-danger': t.status.danger.solid,
      '--color-danger-tint': t.status.danger.tint,
      '--color-danger-ink': t.status.danger.ink,
      '--color-warning': t.status.warning.solid,
      '--color-warning-tint': t.status.warning.tint,
      '--color-warning-ink': t.status.warning.ink,
      '--color-warning-on': t.status.onWarning,
      '--color-success': t.status.success.solid,
      '--color-success-tint': t.status.success.tint,
      '--color-success-ink': t.status.success.ink,
    }),
    [t],
  );
  return (
    <VariableContextProvider value={vars}>
      <View className="flex-1 bg-bg">{children}</View>
    </VariableContextProvider>
  );
}

/**
 * Cambia l'accento per una parte dell'albero (la schermata di una scheda prende il suo colore): tinte, spunte e
 * anelli si ricalcolano da lì, sia nelle classi (`bg-tint`, `text-accent-ink`) sia in `useTheme()`. Senza colore
 * resta l'accento dell'utente.
 */
export function AccentScope({ color, children }: { color: string | null | undefined; children: ReactNode }) {
  // Sempre gli stessi due provider, anche senza colore (resta l'accento dell'utente): il colore arriva da una query
  // asincrona e cambiare la forma dell'albero smonterebbe e rimonterebbe tutta la schermata.
  return (
    <AccentOverride value={color ?? null}>
      <AccentVars>{children}</AccentVars>
    </AccentOverride>
  );
}

function AccentVars({ children }: { children: ReactNode }) {
  const t = useTheme();
  const vars = useMemo(
    () => ({ '--color-accent': t.accent, '--color-accent-ink': t.accentInk, '--color-tint': t.tint, '--color-tint-strong': t.tintStrong }),
    [t.accent, t.accentInk, t.tint, t.tintStrong],
  );
  return <VariableContextProvider value={vars}>{children}</VariableContextProvider>;
}
