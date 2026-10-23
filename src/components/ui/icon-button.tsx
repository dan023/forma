import { GlassView } from 'expo-glass-effect';
import { Pressable } from 'react-native';

import { USE_LIQUID_GLASS } from '@/constants/glass';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';

type Props = {
  /** Etichetta accessibile: il pulsante mostra solo un simbolo. */
  label: string;
  icon: IconName;
  onPress: () => void;
  /** Chrome di sistema (es. indietro nell'header): su iOS 26 diventa Liquid Glass. Mai per il contenuto. */
  glass?: boolean;
  selected?: boolean;
  /** Dentro una card: prende il colore del fondo invece di quello delle card. */
  onCard?: boolean;
  size?: 44 | 48 | 56;
};

/** Pulsante rotondo con un'icona: neutro (mai icone in riquadri colorati), selezionato = tinta dell'accento. */
export function IconButton({ label, icon, onPress, glass, selected, onCard, size = 48 }: Props) {
  const t = useTheme();
  const glyph = <Icon name={icon} color={selected ? t.accentInk : t.ink} size={size >= 56 ? 24 : 22} />;

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
      className={`items-center justify-center rounded-full active:opacity-70 ${selected ? 'bg-tint-strong' : onCard ? 'bg-bg' : 'bg-card'}`}
      style={{ width: size, height: size }}>
      {glyph}
    </Pressable>
  );
}
