import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Card, Inset } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { dayEntriesQuery, groupByMeal, mealSlotsQuery } from '@/features/diary/diary';
import { DaySelector } from '@/features/diary/day-selector';
import { mealName } from '@/features/diary/meal-name';
import { foodName } from '@/features/foods/search';
import { toDayKey } from '@/lib/date';
import { formatNumber } from '@/lib/format';

export default function Pasti() {
  const { t, i18n } = useTranslation();
  const today = toDayKey(new Date());
  const [date, setDate] = useState(today);
  const { data: slots } = useLiveQuery(mealSlotsQuery(db));
  const { data: entries } = useLiveQuery(dayEntriesQuery(db, date), [date]);
  const { meals, totals } = useMemo(() => groupByMeal(slots, entries), [slots, entries]);
  const n = (v: number, d = 0) => formatNumber(v, i18n.language, d);

  return (
    <Screen eyebrow={t('meals.eyebrow')} title={t('meals.title')}>
      <DaySelector value={date} onChange={setDate} />
      {date !== today && (
        <Pressable accessibilityRole="button" onPress={() => setDate(today)} className="min-h-11 justify-center self-center">
          <Text accent className="font-sans-bold">
            {t('meals.backToToday')}
          </Text>
        </Pressable>
      )}

      <Card>
        <View className="flex-row items-baseline justify-between">
          <Text variant="h2">{t('meals.dayTotal')}</Text>
          <Text variant="num" className="text-[28px]">
            {n(totals.kcal)} <Text muted className="font-sans-bold text-sm">{t('common.kcal')}</Text>
          </Text>
        </View>
        <View className="mt-3 flex-row gap-2">
          {[
            [totals.protein, t('meals.proteinShort'), t('meals.protein')],
            [totals.carbs, t('meals.carbsShort'), t('meals.carbs')],
            [totals.fat, t('meals.fatShort'), t('meals.fat')],
          ].map(([v, short, long]) => (
            <Inset key={String(short)} className="flex-1 items-center py-3" accessibilityLabel={`${long}: ${n(Number(v))} g`}>
              <Text variant="num" className="text-lg">
                {n(Number(v))}
              </Text>
              <Text muted className="text-xs">
                {String(short)} · g
              </Text>
            </Inset>
          ))}
        </View>
      </Card>

      {meals.map(({ slot, items, totals: mt }) => {
        const name = mealName(slot, t);
        const add = () => router.push({ pathname: '/cerca', params: { slot: slot.id, date } });
        return (
          <Card key={slot.id}>
            <View className="mb-1 flex-row items-baseline justify-between">
              <Text variant="h2">{name}</Text>
              <Text variant="num" className="text-lg">
                {n(mt.kcal)} <Text muted className="font-sans-bold text-xs">{t('common.kcal')}</Text>
              </Text>
            </View>
            {items.map(({ entry, food, nutrients }, i) => (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/alimento/[id]', params: { id: food.id, entry: entry.id } })}
                className={`min-h-14 flex-row items-center justify-between gap-3 py-3 ${i ? 'border-t border-line' : ''}`}>
                <View className="flex-1">
                  <Text className="font-sans-bold" numberOfLines={2}>
                    {foodName(food, i18n.language)}
                  </Text>
                  <Text muted className="mt-0.5 text-[13px]">
                    {t('common.grams', { value: n(entry.grams ?? 0) })}
                  </Text>
                </View>
                <Text muted>{n(nutrients.kcal)}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={add} className="min-h-11 justify-center">
              <Text accent className="font-sans-bold">
                {items.length ? t('meals.addFood') : t('meals.addFirst')}
              </Text>
            </Pressable>
          </Card>
        );
      })}
    </Screen>
  );
}
