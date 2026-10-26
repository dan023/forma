import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Text } from './text';

/**
 * Chip filtro/scelta: selezionato = tinta forte dell'accento. `onCard`: dentro una card prende il colore del
 * fondo, sul fondo prende quello delle card. `leading` è un piccolo glifo prima del testo.
 */
export function Chip({
  label,
  selected,
  onPress,
  onCard,
  leading,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  onCard?: boolean;
  leading?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={`min-h-11 flex-row items-center justify-center gap-1.5 rounded-full pr-4 active:opacity-70 ${leading ? 'pl-2.5' : 'pl-4'} ${selected ? 'bg-tint-strong' : onCard ? 'bg-bg' : 'bg-card'}`}>
      {leading}
      <Text className={`font-sans-semibold text-sm ${selected ? 'text-accent-ink' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
