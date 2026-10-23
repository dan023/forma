import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { mix } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { categoryIcon, dominantMacro } from './macros';
import type { Food } from './search';

const SIZES = { sm: [32, 10, 18], md: [44, 14, 24], lg: [64, 20, 34] } as const;

/**
 * Tessera di un alimento: il glifo dice la categoria, il colore il macro che gli dà più kcal.
 * Il colore è un'informazione, non un decoro: è l'unica icona su sfondo colorato ammessa nel contenuto.
 */
export function FoodTile({ food, size = 'md' }: { food: Pick<Food, 'category' | 'nameEn' | 'protein' | 'carbs' | 'fat'>; size?: keyof typeof SIZES }) {
  const t = useTheme();
  const color = t[dominantMacro(food)];
  const [box, radius, glyph] = SIZES[size];
  return (
    <View
      aria-hidden
      className="items-center justify-center"
      style={{ width: box, height: box, borderRadius: radius, backgroundColor: mix(color, t.card, t.scheme === 'dark' ? 0.2 : 0.15) }}>
      <Icon name={categoryIcon(food.category, food.nameEn ?? '')} color={mix(color, t.ink, 0.78)} size={glyph} />
    </View>
  );
}
