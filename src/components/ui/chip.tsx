import { Pressable } from 'react-native';

import { Text } from './text';

/**
 * Chip filtro/scelta: selezionato = tinta forte dell'accento. `onCard`: dentro una card prende il colore del
 * fondo, sul fondo prende quello delle card.
 */
export function Chip({ label, selected, onPress, onCard }: { label: string; selected?: boolean; onPress: () => void; onCard?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={`min-h-11 justify-center rounded-full px-4 active:opacity-70 ${selected ? 'bg-tint-strong' : onCard ? 'bg-bg' : 'bg-card'}`}>
      <Text className={`font-sans-semibold text-sm ${selected ? 'text-accent-ink' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
