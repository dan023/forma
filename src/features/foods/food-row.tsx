import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { StackBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format';
import { normalize } from '@/lib/text';

import { FoodTile } from './food-tile';
import { macroKcal } from './macros';
import type { QuickAmount } from './portions';
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

/**
 * Riga di un alimento: tessera, nome, quanto aggiunge il "+" con le sue kcal, mini barra dei macro. Tocco = scheda
 * (per scegliere un'altra quantità), "+" = aggiunge quella quantità al pasto.
 */
export function FoodRow({
  food,
  amount,
  versions = 1,
  toks = [],
  first,
  meal,
  added,
  onOpen,
  onAdd,
}: {
  food: Food;
  amount: QuickAmount;
  versions?: number;
  toks?: string[];
  first?: boolean;
  meal: string;
  added?: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const n = (v: number) => formatNumber(v, i18n.language, 0);
  const name = foodName(food, i18n.language);
  const grams = t('common.grams', { value: n(amount.grams) });
  const qty = amount.label ? t('meals.portionGrams', { portion: amount.label, grams: n(amount.grams) }) : grams;
  return (
    <View className={`flex-row items-center gap-3 py-2 ${first ? '' : 'border-t border-line'}`}>
      <FoodTile food={food} />
      <Pressable accessibilityRole="button" onPress={onOpen} className="min-h-11 flex-1 justify-center py-1.5">
        <Highlighted name={name} toks={toks} />
        <Text variant="label" className="mt-0.5 tabular-nums">
          {t('search.amountLine', { amount: qty, kcal: n((food.kcal * amount.grams) / 100) })}
          {versions > 1 ? ` · ${t('search.versions', { count: versions })}` : ''}
        </Text>
        <StackBar mini parts={macroKcal(food).map((m) => ({ value: m.kcal, color: theme[m.color] }))} />
      </Pressable>
      <IconButton
        onCard
        size={44}
        icon={added ? 'check' : 'plus'}
        label={t('search.addAmount', { name, meal, amount: qty })}
        onPress={onAdd}
        selected={added}
      />
    </View>
  );
}
