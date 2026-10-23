import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { formatNumber } from '@/lib/format';
import { normalize } from '@/lib/text';

import { FoodTile } from './food-tile';
import { foodName, type Food } from './search';

/** Nome con le parole cercate in evidenza (grassetto sottolineato), come nel prototipo. */
function Highlighted({ name, toks }: { name: string; toks: string[] }) {
  const parts = name.split(/([\p{L}\p{N}]+)/u);
  return (
    <Text className="font-sans-semibold text-[15px] text-ink">
      {parts.map((p, i) =>
        toks.length && toks.some((t) => normalize(p).startsWith(t)) ? (
          <Text key={i} className="font-sans-bold underline">
            {p}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

/** Riga di un alimento: tocco = scheda, "+" = aggiunge 100 g al pasto. */
export function FoodRow({
  food,
  versions = 1,
  toks = [],
  first,
  meal,
  added,
  onOpen,
  onAdd,
}: {
  food: Food;
  versions?: number;
  toks?: string[];
  first?: boolean;
  meal: string;
  added?: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const { t, i18n } = useTranslation();
  const n = (v: number, d = 1) => formatNumber(v, i18n.language, d);
  const name = foodName(food, i18n.language);
  return (
    <View className={`flex-row items-center gap-3 py-2 ${first ? '' : 'border-t border-line'}`}>
      <FoodTile food={food} />
      <Pressable accessibilityRole="button" onPress={onOpen} className="min-h-11 flex-1 justify-center py-1.5">
        <Highlighted name={name} toks={toks} />
        <Text variant="label" className="mt-0.5">
          {t('search.line', { kcal: n(food.kcal, 0), protein: n(food.protein), carbs: n(food.carbs), fat: n(food.fat) })}
          {versions > 1 ? ` · ${t('search.versions', { count: versions })}` : ''}
        </Text>
      </Pressable>
      <IconButton onCard size={44} icon={added ? 'check' : 'plus'} label={t('search.add', { name, meal })} onPress={onAdd} selected={added} />
    </View>
  );
}
