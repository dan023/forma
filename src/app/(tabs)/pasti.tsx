import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Donut } from '@/components/ui/donut';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { LinkRow, TintIcon } from '@/components/ui/link-row';
import { Progress, StackBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';
import { db } from '@/db/client';
import { addEntry, allMealSlotsQuery, dayEntriesQuery, deleteEntry, groupByMeal, restoreEntry, type DayEntry, type MealSlot, type Nutrients } from '@/features/diary/diary';
import { DaySelector } from '@/features/diary/day-selector';
import { mealIcon } from '@/features/diary/meal-slots';
import { mealName } from '@/features/diary/meal-name';
import { MealTile } from '@/features/diary/meal-tile';
import { FoodTile } from '@/features/foods/food-tile';
import { MACROS, macroKcal, macroShares } from '@/features/foods/macros';
import { portionLabel } from '@/features/foods/portions';
import { foodCount, portionsFor, usualFoods } from '@/features/foods/queries';
import { foodName, type Food } from '@/features/foods/search';
import { useTableVersion } from '@/hooks/use-table-version';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { addDays, toDayKey } from '@/lib/date';
import { formatNumber } from '@/lib/format';

const MACRO_LABEL = { protein: 'meals.protein', carbs: 'meals.carbs', fat: 'meals.fat' } as const;
/** "Di solito" guarda gli ultimi 60 giorni. */
const USUAL_DAYS = 60;

export default function Pasti() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const today = toDayKey(new Date());
  const [date, setDate] = useState(today);
  // Anche i nascosti: nei giorni in cui hanno voci si vedono ancora (`groupByMeal`).
  const { data: slots } = useLiveQuery(allMealSlotsQuery(db));
  const { data: entries } = useLiveQuery(dayEntriesQuery(db, date), [date]);
  const { meals, totals } = useMemo(() => groupByMeal(slots, entries), [slots, entries]);
  const toast = useToast();
  const total = useMemo(() => foodCount(db), []);
  const n = (v: number, d = 0) => formatNumber(v, i18n.language, d);
  // Senza obiettivi (ancora da fare) l'anello mostra la composizione del giorno: quota di kcal di ogni macro.
  const shares = macroShares(totals);
  const parts = (x: Nutrients) => macroKcal(x).map((m) => ({ value: m.kcal, color: theme[m.color] }));

  // Porzioni degli alimenti del giorno: "1 vasetto · 170 g" quando i grammi sono quelli di una porzione.
  const foodIds = entries.map((e) => e.food.id).join(',');
  const portions = useMemo(() => portionsFor(db, foodIds ? foodIds.split(',') : []), [foodIds]);
  const amount = (food: Food, grams: number) => {
    const p = (portions.get(food.id) ?? []).find((x) => Math.round(x.grams) === Math.round(grams));
    const label = p && portionLabel(p.label, i18n.language);
    return label ? t('meals.portionGrams', { portion: label, grams: n(grams) }) : t('common.grams', { value: n(grams) });
  };
  // "Di solito" per i pasti vuoti; si aggiorna quando cambia il diario.
  const diaryVersion = useTableVersion('diary_entries');
  const usual = useMemo(
    () => new Map(slots.filter((s) => !s.archived).map((s) => [s.id, usualFoods(db, s.id, addDays(date, -USUAL_DAYS))])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, date, diaryVersion],
  );

  const remove = ({ entry }: DayEntry, meal: string) => {
    deleteEntry(db, entry.id);
    toast.show(t('meals.removed', { meal }), {
      label: t('meals.undo'),
      onPress: () => {
        restoreEntry(db, entry);
        toast.hide();
      },
    });
  };
  const addUsual = (slot: MealSlot, food: Food, grams: number) => {
    addEntry(db, { date, mealSlotId: slot.id, foodId: food.id, grams });
    toast.show(t('meals.addedUsual', { meal: mealName(slot, t), grams: n(grams) }));
  };

  return (
    <Screen
      eyebrow={t('meals.eyebrow')}
      title={t('meals.title')}
      footer={<Toast message={toast.message} action={toast.action} bottomOffset={84} />}
      right={<IconButton icon="sliders" label={t('mealsEdit.open')} onPress={() => router.push('/pasti/modifica')} />}>
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
        {/* I pasti del giorno: tessera e kcal; quelli vuoti attenuati. */}
        <View className="flex-row border-t border-line pt-3.5">
          {meals.map(({ slot, totals: mt, items }) => (
            <View
              key={slot.id}
              accessible
              accessibilityLabel={items.length ? t('meals.mealKcal', { meal: mealName(slot, t), kcal: n(mt.kcal) }) : t('meals.mealEmpty', { meal: mealName(slot, t) })}
              className="flex-1 items-center gap-1.5">
              <MealTile icon={mealIcon(slot)} size="sm" muted={!items.length} />
              <Text variant="num" className={`text-[15px] ${items.length ? '' : 'text-ink-2'}`}>
                {n(mt.kcal)}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* La ricerca come il catalogo esercizi in Allenamento: una riga in card sotto il riepilogo. */}
      <Card className="py-2">
        <LinkRow
          first
          leading={<TintIcon name="search" />}
          title={t('meals.searchRow')}
          sub={t('meals.searchRowHint', { count: total, n: n(total) })}
          onPress={() => router.push({ pathname: '/cerca', params: { date } })}
        />
      </Card>

      {meals.map(({ slot, items, totals: mt }) => {
        const name = mealName(slot, t);
        const add = () => router.push({ pathname: '/cerca', params: { slot: slot.id, date } });
        const usualHere = usual.get(slot.id) ?? [];
        return (
          <Card key={slot.id}>
            <View className="flex-row items-center gap-3">
              <MealTile icon={mealIcon(slot)} />
              <Text variant="h2" className="flex-1">
                {name}
              </Text>
              {items.length > 0 && (
                <Text variant="num" className="text-[17px]">
                  {n(mt.kcal)} <Text variant="label">{t('common.kcal')}</Text>
                </Text>
              )}
            </View>
            {items.length > 0 ? (
              <View className="mb-1 mt-3 gap-2">
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
            ) : usualHere.length > 0 ? (
              <View className="mt-3 gap-2">
                <Text variant="label">{t('meals.usual')}</Text>
                <View className="flex-row gap-2">
                  {usualHere.map(({ food, grams }) => (
                    <UsualTile key={food.id} food={food} grams={grams} onPress={() => addUsual(slot, food, grams)} />
                  ))}
                  {/* tre colonne anche con meno alimenti */}
                  {Array.from({ length: 3 - usualHere.length }, (_, i) => (
                    <View key={i} className="flex-1" />
                  ))}
                </View>
              </View>
            ) : (
              <Text muted className="mt-1.5">
                {t('meals.empty')}
              </Text>
            )}
            {items.map((item) => (
              <EntryRow
                key={item.entry.id}
                item={item}
                amount={amount(item.food, item.entry.grams ?? 0)}
                meal={name}
                onRemove={() => remove(item, name)}
              />
            ))}
            <Pressable accessibilityRole="button" onPress={add} className="mt-1 min-h-12 flex-row items-center gap-2.5 border-t border-line pt-1 active:opacity-70">
              <Icon name="plus" color={theme.accentInk} size={20} strokeWidth={2.2} />
              <Text className="font-sans-semibold text-[15px]">{items.length ? t('meals.addFood') : t('meals.searchFood')}</Text>
            </Pressable>
          </Card>
        );
      })}
    </Screen>
  );
}

/** Una voce del diario: tessera, nome, quantità, mini barra dei macro, kcal e cestino. Tocco = scheda dell'alimento. */
function EntryRow({ item, amount, meal, onRemove }: { item: DayEntry & { nutrients: Nutrients }; amount: string; meal: string; onRemove: () => void }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { entry, food, nutrients } = item;
  const name = foodName(food, i18n.language);
  const parts = macroKcal(nutrients).map((m) => ({ value: m.kcal, color: theme[m.color] }));
  return (
    <View className="min-h-14 flex-row items-center gap-2 border-t border-line py-2.5">
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/alimento/[id]', params: { id: food.id, entry: entry.id } })}
        className="flex-1 flex-row items-center gap-3.5 active:opacity-70">
        <FoodTile food={food} />
        <View className="flex-1">
          <Text className="font-sans-semibold text-[15px]" numberOfLines={2}>
            {name}
          </Text>
          <Text variant="label" className="mt-0.5">
            {amount}
          </Text>
          <StackBar mini parts={parts} />
        </View>
        <Text variant="num" className="text-[15px]">
          {formatNumber(nutrients.kcal, i18n.language, 0)}
        </Text>
      </Pressable>
      <IconButton size={44} onCard icon="trash" label={t('meals.removeLabel', { name, meal })} onPress={onRemove} />
    </View>
  );
}

/** Un alimento "di solito" in un pasto vuoto: un tocco lo aggiunge con l'ultima quantità usata lì. */
function UsualTile({ food, grams, onPress }: { food: Food; grams: number; onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const name = foodName(food, i18n.language);
  const n = (v: number) => formatNumber(v, i18n.language, 0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('meals.usualAdd', { name, grams: n(grams) })}
      onPress={onPress}
      className="min-h-24 flex-1 gap-1.5 rounded-inner bg-bg p-2.5 active:opacity-70">
      <View className="flex-row items-start justify-between">
        <FoodTile food={food} size="sm" />
        <Icon name="plus" color={theme.accentInk} size={18} strokeWidth={2.2} />
      </View>
      <Text className="font-sans-semibold text-[13px] leading-4" numberOfLines={2}>
        {name.split(',')[0]}
      </Text>
      <Text variant="label" className="text-xs tabular-nums">
        {t('common.grams', { value: n(grams) })}
        {'\n'}
        {`${n((food.kcal * grams) / 100)} ${t('common.kcal')}`}
      </Text>
    </Pressable>
  );
}
