import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { MEAL_ICONS } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';

import type { MealIcon } from './meal-slots';

// Ogni icona di un pasto deve esistere in `Icon`.
MEAL_ICONS satisfies readonly IconName[];

const SIZES = { sm: [32, 10, 18], md: [44, 14, 24] } as const;

/**
 * Tessera di un pasto: la sua icona nella tinta dell'accento, come la tessera di un esercizio. I pasti non hanno un
 * colore proprio: in Pasti il colore è dei macro. `muted` per un pasto ancora vuoto.
 */
export function MealTile({ icon, size = 'md', muted }: { icon: MealIcon; size?: keyof typeof SIZES; muted?: boolean }) {
  const t = useTheme();
  const [box, radius, glyph] = SIZES[size];
  return (
    <View
      aria-hidden
      className="items-center justify-center"
      style={{ width: box, height: box, borderRadius: radius, backgroundColor: muted ? t.bg : t.tint }}>
      <Icon name={icon} color={muted ? t.ink2 : t.accentInk} size={glyph} />
    </View>
  );
}
