import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Card, Inset } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { addEntry, deleteEntry, getEntry, mealSlotsQuery, nutrientsFor, updateEntryGrams } from '@/features/diary/diary';
import { mealName } from '@/features/diary/meal-name';
import { favoriteIds, getFood, getPortions, toggleFavorite } from '@/features/foods/queries';
import { foodName } from '@/features/foods/search';
import { fromDayKey, toDayKey } from '@/lib/date';
import { formatNumber } from '@/lib/format';

const SOURCES = { ciqual: 'CIQUAL 2025', usda: 'USDA FoodData Central', off: 'Open Food Facts' } as const;
const clamp = (g: number) => Math.min(5000, Math.max(1, Math.round(g)));

export default function Alimento() {
  const { t, i18n } = useTranslation();
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

  return (
    <Screen
      back
      tabBar={false}
      eyebrow={`${meal} · ${day}`}
      right={
        <IconButton label={fav ? t('food.favoriteRemove') : t('food.favoriteAdd')} selected={fav} onPress={() => setFav(toggleFavorite(db, food.id))}>
          {fav ? '★' : '☆'}
        </IconButton>
      }
      title={<Text className="font-display text-[32px] leading-[34px] tracking-[-1px] text-ink">{foodName(food, i18n.language)}</Text>}>
      <Card className="gap-[22px]">
        <View className="flex-row items-center justify-center gap-[18px]">
          <IconButton label={t('food.less')} onPress={() => setG(grams - 10)}>
            −
          </IconButton>
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
              className="min-w-[90px] text-center font-display text-[52px] text-ink"
            />
            <Text muted className="font-sans-bold text-lg">
              g
            </Text>
          </View>
          <IconButton label={t('food.more')} onPress={() => setG(grams + 10)}>
            +
          </IconButton>
        </View>
        {choices.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-[18px]" contentContainerClassName="gap-2.5 px-[18px] py-1">
            {choices.map(([g, label]) => (
              <Chip key={g} label={label} selected={grams === g} onPress={() => setG(g)} />
            ))}
          </ScrollView>
        )}
        <View className="flex-row gap-2">
          {[
            [n(now.kcal, 0), t('common.kcal')],
            [n(now.protein, 0), t('meals.proteinShort')],
            [n(now.carbs, 0), t('meals.carbsShort')],
            [n(now.fat), t('meals.fatShort')],
          ].map(([v, l]) => (
            <Inset key={l} className="flex-1 items-center rounded-2xl px-1 py-3">
              <Text variant="num" className="text-lg">
                {v}
              </Text>
              <Text muted className="text-xs">
                {l}
              </Text>
            </Inset>
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="eyebrow" muted className="mb-1">
          {t('food.per100', { source })}
        </Text>
        {per100.map(([k, v], i) => (
          <View key={k} className={`min-h-12 flex-row items-center justify-between ${i ? 'border-t border-line' : ''}`}>
            <Text>{k}</Text>
            <Text className="font-sans-bold">{v}</Text>
          </View>
        ))}
      </Card>

      <Button label={entry ? t('food.save') : t('food.add', { meal })} onPress={save} />
      {entry && (
        <Button
          variant="ghost"
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
