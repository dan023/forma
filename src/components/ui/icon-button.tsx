import { GlassView } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { USE_LIQUID_GLASS } from '@/constants/glass';
import { useTheme } from '@/hooks/use-theme';

import { raised } from './surface';
import { Text } from './text';

type Props = {
  /** Etichetta accessibile: il pulsante mostra solo un simbolo. */
  label: string;
  onPress: () => void;
  children: ReactNode;
  /** Chrome di sistema (es. indietro nell'header): su iOS 26 diventa Liquid Glass. Mai per il contenuto. */
  glass?: boolean;
  selected?: boolean;
};

export function IconButton({ label, onPress, children, glass, selected }: Props) {
  const t = useTheme();
  const glyph = <Text className={`text-xl leading-6 ${selected ? 'text-accent-ink' : 'text-ink'}`}>{children}</Text>;

  if (glass && USE_LIQUID_GLASS) {
    return (
      <GlassView isInteractive style={{ width: 44, height: 44, borderRadius: 22 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="flex-1 items-center justify-center">
          {glyph}
        </Pressable>
      </GlassView>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center rounded-full ${selected ? 'bg-accent' : 'bg-card'}`}
      style={({ pressed }) => [
        selected ? { boxShadow: [{ offsetX: 0, offsetY: 6, blurRadius: 14, color: `${t.accent}73` }] } : raised(t, 5),
        { transform: [{ scale: pressed ? 0.93 : 1 }] },
      ]}>
      {glyph}
    </Pressable>
  );
}
