import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { mix, RoutineColors } from '@/constants/theme';
import { ROUTINE_ICONS } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';

import type { RoutineStyle } from './routines';

// Ogni icona di una scheda deve esistere in `Icon`.
ROUTINE_ICONS satisfies readonly IconName[];

const SIZES = { sm: [32, 10, 18], md: [44, 14, 24], lg: [64, 20, 34] } as const;

/** Colore pieno di una scheda. */
export const routineHex = (color: RoutineStyle['color']) => RoutineColors[color] ?? RoutineColors.corallo;

/**
 * Tessera di una scheda: icona e colore scelti dall'utente (un dato, come il macro nella tessera di un alimento).
 * `onTint` la mette su una card già tinta del suo colore: fondo bianco invece della tinta.
 */
export function RoutineTile({ style, size = 'md', onTint }: { style: RoutineStyle; size?: keyof typeof SIZES; onTint?: boolean }) {
  const t = useTheme();
  const color = routineHex(style.color);
  const [box, radius, glyph] = SIZES[size];
  return (
    <View
      aria-hidden
      className="items-center justify-center"
      style={{
        width: box,
        height: box,
        borderRadius: radius,
        backgroundColor: onTint ? t.card : mix(color, t.card, t.scheme === 'dark' ? 0.22 : 0.15),
      }}>
      <Icon name={style.icon} color={t.scheme === 'dark' ? mix(color, '#FFFFFF', 0.55) : mix(color, t.ink, 0.78)} size={glyph} />
    </View>
  );
}
