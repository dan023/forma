import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Donut } from '@/components/ui/donut';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { addEntry, deleteEntry, getEntry, mealSlotsQuery, nutrientsFor, updateEntryGrams } from '@/features/diary/diary';
import { mealName } from '@/features/diary/meal-name';
import { favoriteIds, getFood, getPortions, toggleFavorite } from '@/features/foods/queries';
import { FoodTile } from '@/features/foods/food-tile';
import { MACROS, macroShares } from '@/features/foods/macros';
import { foodName } from '@/features/foods/search';
import { useTheme } from '@/hooks/use-theme';
import { fromDayKey, toDayKey } from '@/lib/date';
import { formatNumber } from '@/lib/format';

const SOURCES = { ciqual: 'CIQUAL 2025', usda: 'USDA FoodData Central', off: 'Open Food Facts' } as const;
const MACRO_LABEL = { protein: 'meals.protein', carbs: 'meals.carbs', fat: 'meals.fat' } as const;
const clamp = (g: number) => Math.min(5000, Math.max(1, Math.round(g)));

export default function Alimento() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; slot?: string; date?: string; entry?: string }>();
  const food = useMemo(() => getFood(db, params.id), [params.id]);
  const entry = useMemo(() => (params.entry ? getEntry(db, params.entry) : undefined), [params.entry]);
  const portions = useMemo(() => getPortions(db, params.id), [params.id]);
  const { data: slots } = useLiveQuery(mealSlotsQuery(db));
  const slot = slots.find((s) => s.id === (entry?.mealSlotId ?? params.slot)) ?? slots[0];
  const date = entry?.date ?? params.date ?? toDayKey(new Date());

  const [grams, setGrams] = useState(entry?.grams ?? 100);
  // Il testo del campo è separato dal valore: si può cancellare tutto e riscrivere; si ripristina uscendo dal campo.
  const [gramsText, setGramsText] = useState(String(entry?.grams ?? 100));
  const setG = (g: number) => {
    const v = clamp(g);
    setGrams(v);
    setGramsText(String(v));
  };
  const [fav, setFav] = useState(() => favoriteIds(db).includes(params.id));
  const n = (v: number, d = 1) => formatNumber(v, i18n.language, d);
  const meal = slot ? mealName(slot, t) : '';
  const day = fromDayKey(date).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric' });

  if (!food) return <Screen back tabBar={false} eyebrow={meal} title={t('food.notFound')} />;

  const now = nutrientsFor(food, grams);
  // Le etichette delle porzioni USDA sono in inglese: in italiano si mostrano solo i grammi.
  const choices = [...new Map([[100, '100 g'], ...portions.map((p) => [Math.round(p.grams), i18n.language === 'en' ? `${p.label} · ${Math.round(p.grams)} g` : `${Math.round(p.grams)} g`] as const)]).entries()];
  const per100 = [
    [t('food.calories'), `${n(food.kcal, 0)} kcal`],
    [t('meals.protein'), `${n(food.protein)} g`],
    [t('meals.carbs'), `${n(food.carbs)} g`],
    [t('meals.fat'), `${n(food.fat)} g`],
    food.fiber != null && [t('food.fiber'), `${n(food.fiber)} g`],
    food.sugar != null && [t('food.sugar'), `${n(food.sugar)} g`],
    food.sodium != null && [t('food.sodium'), `${n(food.sodium, 0)} mg`],
  ].filter(Boolean) as [string, string][];
  const source = food.source === 'custom' ? t('food.sourceCustom') : SOURCES[food.source];

  const save = () => {
    if (entry) updateEntryGrams(db, entry.id, grams);
    else if (slot) addEntry(db, { date, mealSlotId: slot.id, foodId: food.id, grams });
    router.back();
  };

  const shares = macroShares(now);
  const footer = (
    <View className="border-t border-line bg-bg px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      <Button label={entry ? t('food.save') : t('food.add', { meal })} onPress={save} />
    </View>
  );

  return (
    <Screen
      back
      tabBar={false}
      footer={footer}
      right={
        <IconButton
          icon="star"
          label={fav ? t('food.favoriteRemove') : t('food.favoriteAdd')}
          selected={fav}
          onPress={() => setFav(toggleFavorite(db, food.id))}
        />
      }>
      <View className="mb-1 flex-row items-center gap-3.5">
        <FoodTile food={food} size="lg" />
        <View className="flex-1">
          <Text variant="label">{`${meal} · ${day}`}</Text>
          <Text variant="titleSm" accessibilityRole="header">
            {foodName(food, i18n.language)}
          </Text>
        </View>
      </View>

      <Card className="gap-4">
        <Text variant="label">{t('food.gramsInput')}</Text>
        <View className="flex-row items-center justify-between">
          <IconButton onCard size={56} icon="minus" label={t('food.less')} onPress={() => setG(grams - 10)} />
          <View className="flex-row items-baseline">
            <TextInput
              value={gramsText}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, '');
                setGramsText(digits);
                if (digits) setGrams(clamp(Number(digits)));
              }}
              onBlur={() => setGramsText(String(grams))}
              returnKeyType="done"
              keyboardType="number-pad"
              accessibilityLabel={t('food.gramsInput')}
              selectTextOnFocus
              className="min-w-[90px] text-center font-sans-bold text-[40px] tabular-nums text-ink"
            />
            <Text muted className="font-sans-semibold text-[17px]">
              g
            </Text>
          </View>
          <IconButton onCard size={56} icon="plus" label={t('food.more')} onPress={() => setG(grams + 10)} />
        </View>
        {choices.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerClassName="gap-2 px-5">
            {choices.map(([g, label]) => (
              <Chip onCard key={g} label={label} selected={grams === g} onPress={() => setG(g)} />
            ))}
          </ScrollView>
        )}
      </Card>

      <Card className="flex-row items-center gap-5">
        <Donut size={120} stroke={12} segments={MACROS.map((m) => ({ value: shares[m.key], color: theme[m.color] }))}>
          <Text variant="num" className="text-[28px] leading-8">
            {n(now.kcal, 0)}
          </Text>
          <Text variant="label">{t('common.kcal')}</Text>
        </Donut>
        <View className="flex-1 gap-2.5">
          <Text variant="label">{t('food.inGrams', { value: n(grams, 0) })}</Text>
          {MACROS.map((m) => (
            <View key={m.key}>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: theme[m.color] }} />
                <Text variant="label">{t(MACRO_LABEL[m.key])}</Text>
              </View>
              <Text variant="num" className="text-base">
                {n(now[m.key])} g <Text variant="label">· {n(shares[m.key] * 100, 0)}%</Text>
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card className="py-3">
        <Text variant="label" className="mb-1 mt-1">
          {t('food.per100', { source })}
        </Text>
        {per100.map(([k, v]) => (
          <View key={k} className="min-h-12 flex-row items-center justify-between border-t border-line">
            <Text>{k}</Text>
            <Text className="font-sans-semibold tabular-nums">{v}</Text>
          </View>
        ))}
      </Card>

      {entry && (
        <Button
          variant="danger"
          soft
          icon="trash"
          label={t('food.delete')}
          onPress={() => {
            deleteEntry(db, entry.id);
            router.back();
          }}
        />
      )}
    </Screen>
  );
}
