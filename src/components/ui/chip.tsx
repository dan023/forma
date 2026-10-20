import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { raised } from './surface';
import { Text } from './text';

/** Chip filtro/scelta: rialzato; selezionato = accento. */
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={`min-h-11 justify-center rounded-full px-[18px] ${selected ? 'bg-accent' : 'bg-card'}`}
      style={({ pressed }) => [
        selected ? { boxShadow: [{ offsetX: 0, offsetY: 6, blurRadius: 16, color: `${t.accent}73` }] } : raised(t, 5),
        { transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}>
      <Text className={`font-sans-bold text-sm ${selected ? 'text-accent-ink' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
