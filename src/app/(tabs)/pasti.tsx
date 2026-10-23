import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Donut } from '@/components/ui/donut';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Progress, StackBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { dayEntriesQuery, groupByMeal, mealSlotsQuery } from '@/features/diary/diary';
import { DaySelector } from '@/features/diary/day-selector';
import { mealName } from '@/features/diary/meal-name';
import { FoodTile } from '@/features/foods/food-tile';
import { MACROS, macroKcal, macroShares } from '@/features/foods/macros';
import { foodName } from '@/features/foods/search';
import { useTheme } from '@/hooks/use-theme';
import { toDayKey } from '@/lib/date';
import { formatNumber } from '@/lib/format';

const MACRO_LABEL = { protein: 'meals.protein', carbs: 'meals.carbs', fat: 'meals.fat' } as const;

export default function Pasti() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const today = toDayKey(new Date());
  const [date, setDate] = useState(today);
  const { data: slots } = useLiveQuery(mealSlotsQuery(db));
  const { data: entries } = useLiveQuery(dayEntriesQuery(db, date), [date]);
  const { meals, totals } = useMemo(() => groupByMeal(slots, entries), [slots, entries]);
  const n = (v: number, d = 0) => formatNumber(v, i18n.language, d);
  // Senza obiettivi (ancora da fare) l'anello mostra la composizione del giorno: quota di kcal di ogni macro.
  const shares = macroShares(totals);
  const parts = (x: typeof totals) => macroKcal(x).map((m) => ({ value: m.kcal, color: theme[m.color] }));

  return (
    <Screen
      eyebrow={t('meals.eyebrow')}
      title={t('meals.title')}
      right={<IconButton icon="search" label={t('search.title')} onPress={() => router.push({ pathname: '/cerca', params: { date } })} />}>
      <DaySelector value={date} onChange={setDate} />
      {date !== today && (
        <Pressable accessibilityRole="button" onPress={() => setDate(today)} className="min-h-11 justify-center self-center">
          <Text accent className="font-sans-semibold">
            {t('meals.backToToday')}
          </Text>
        </Pressable>
      )}

      <Card className="gap-4">
        <View className="flex-row items-center gap-5">
          <Donut segments={MACROS.map((m) => ({ value: shares[m.key], color: theme[m.color] }))}>
            <Text variant="num" className="text-[28px] leading-8">
              {n(totals.kcal)}
            </Text>
            <Text variant="label">{t('common.kcal')}</Text>
          </Donut>
          <View className="flex-1 gap-3">
            {MACROS.map((m) => (
              <View key={m.key} className="gap-1" accessibilityLabel={`${t(MACRO_LABEL[m.key])}: ${n(totals[m.key])} g`}>
                <View className="flex-row items-center gap-1.5">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: theme[m.color] }} />
                  <Text variant="label">{t(MACRO_LABEL[m.key])}</Text>
                </View>
                <Text variant="num" className="text-base">
                  {n(totals[m.key])} g{' '}
                  <Text variant="label" className="font-sans-medium">
                    · {t('meals.kcalShare', { value: n(shares[m.key] * 100) })}
                  </Text>
                </Text>
                <Progress thin value={shares[m.key]} max={1} color={theme[m.color]} />
              </View>
            ))}
          </View>
        </View>
        <View className="flex-row items-center justify-between border-t border-line pt-3.5">
          <View className="flex-row items-center gap-1.5">
            <Icon name="flame" color={theme.accent} size={18} />
            <Text variant="label" className="text-ink">
              {t('meals.dayTotal')}
            </Text>
          </View>
          <Text variant="label">{t('meals.mealsLogged', { count: meals.filter((m) => m.items.length).length, total: meals.length })}</Text>
        </View>
      </Card>

      {meals.map(({ slot, items, totals: mt }) => {
        const name = mealName(slot, t);
        const add = () => router.push({ pathname: '/cerca', params: { slot: slot.id, date } });
        return (
          <Card key={slot.id}>
            <View className="flex-row items-baseline justify-between">
              <Text variant="h2">{name}</Text>
              {items.length > 0 && (
                <Text variant="num" className="text-[17px]">
                  {n(mt.kcal)} <Text variant="label">{t('common.kcal')}</Text>
                </Text>
              )}
            </View>
            {items.length > 0 ? (
              <View className="mb-1 mt-2.5 gap-2">
                <StackBar parts={parts(mt)} />
                <View className="flex-row gap-4">
                  {MACROS.map((m) => (
                    <View key={m.key} className="flex-row items-center gap-1.5">
                      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: theme[m.color] }} />
                      <Text variant="label">{t('meals.macroGrams', { macro: t(`meals.${m.key}Short`), value: n(mt[m.key]) })}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text muted className="mt-1.5">
                {t('meals.empty')}
              </Text>
            )}
            {items.map(({ entry, food, nutrients }) => (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/alimento/[id]', params: { id: food.id, entry: entry.id } })}
                className="min-h-14 flex-row items-center gap-3.5 border-t border-line py-2.5 active:opacity-70">
                <FoodTile food={food} />
                <View className="flex-1">
                  <Text className="font-sans-semibold text-[15px]" numberOfLines={2}>
                    {foodName(food, i18n.language)}
                  </Text>
                  <Text variant="label" className="mt-0.5">
                    {t('common.grams', { value: n(entry.grams ?? 0) })}
                  </Text>
                </View>
                <Text variant="num" className="text-[15px]">
                  {n(nutrients.kcal)}
                </Text>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={add} className="mt-1 min-h-12 flex-row items-center gap-2.5 border-t border-line pt-1 active:opacity-70">
              <Icon name="plus" color={theme.accentInk} size={20} strokeWidth={2.2} />
              <Text className="font-sans-semibold text-[15px]">{items.length ? t('meals.addFood') : t('meals.addFirst')}</Text>
            </Pressable>
          </Card>
        );
      })}
    </Screen>
  );
}
