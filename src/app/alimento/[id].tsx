import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Donut } from '@/components/ui/donut';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { addEntry, allMealSlotsQuery, dayEntriesQuery, deleteEntry, getEntry, nutrientsFor, updateEntry } from '@/features/diary/diary';
import { MealOptions, MealPill } from '@/features/diary/meal-picker';
import { mealName } from '@/features/diary/meal-name';
import { FoodTile } from '@/features/foods/food-tile';
import { categoryIcon, MACROS, macroShares } from '@/features/foods/macros';
import { portionLabel } from '@/features/foods/portions';
import { favoriteIds, getFood, getPortions, lastGrams, toggleFavorite } from '@/features/foods/queries';
import { foodName } from '@/features/foods/search';
import { useTheme } from '@/hooks/use-theme';
import { fromDayKey, toDayKey } from '@/lib/date';
import { formatNumber } from '@/lib/format';

const SOURCES = { ciqual: 'CIQUAL 2025', usda: 'USDA FoodData Central', off: 'Open Food Facts' } as const;
const MACRO_LABEL = { protein: 'meals.protein', carbs: 'meals.carbs', fat: 'meals.fat' } as const;
const clamp = (g: number) => Math.min(5000, Math.max(1, Math.round(g)));
/** Sale = sodio × 2,5 (il catalogo ha il sodio in mg per 100 g). */
const saltGrams = (sodiumMg: number) => (sodiumMg * 2.5) / 1000;

type Choice = { grams: number; title: string; sub: string; last?: boolean };

/**
 * Scheda di un alimento: quantità (− / campo / +) e porzioni come tessere, composizione nell'anello, valori per la
 * quantità scelta. In basso il pasto (si cambia dalla pillola) e "Aggiungi a …"; aperta da una voce del diario,
 * "Salva" ed "Elimina dal diario".
 */
export default function Alimento() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; slot?: string; date?: string; entry?: string }>();
  const food = useMemo(() => getFood(db, params.id), [params.id]);
  const entry = useMemo(() => (params.entry ? getEntry(db, params.entry) : undefined), [params.entry]);
  const portions = useMemo(() => getPortions(db, params.id), [params.id]);
  const last = useMemo(() => lastGrams(db, [params.id]).get(params.id), [params.id]);
  // Il pasto si cerca anche tra i nascosti (una voce già scritta resta nel suo); si sceglie tra i visibili.
  const { data: allSlots } = useLiveQuery(allMealSlotsQuery(db));
  const slots = allSlots.filter((s) => !s.archived);
  const [slotId, setSlotId] = useState(entry?.mealSlotId ?? params.slot);
  const [picking, setPicking] = useState(false);
  const slot = allSlots.find((s) => s.id === slotId) ?? slots[0];
  const date = entry?.date ?? params.date ?? toDayKey(new Date());
  const { data: dayRows } = useLiveQuery(dayEntriesQuery(db, date), [date]);

  const start = entry?.grams ?? (last != null ? Math.round(last) : 100);
  const [grams, setGrams] = useState(start);
  // Il testo del campo è separato dal valore: si può cancellare tutto e riscrivere; si ripristina uscendo dal campo.
  const [gramsText, setGramsText] = useState(String(start));
  const setG = (g: number) => {
    const v = clamp(g);
    setGrams(v);
    setGramsText(String(v));
  };
  const [fav, setFav] = useState(() => favoriteIds(db).includes(params.id));
  const n = (v: number, d = 1) => formatNumber(v, i18n.language, d);
  const meal = slot ? mealName(slot, t) : '';

  if (!food) return <Screen back tabBar={false} title={t('food.notFound')} />;

  const now = nutrientsFor(food, grams);
  const group = food.foodGroup ?? categoryIcon(food.category, food.nameEn ?? '');
  const source = food.source === 'custom' ? t('food.sourceCustom') : SOURCES[food.source];

  // Tessere delle quantità: l'ultima usata, le porzioni del catalogo (con il nome nella lingua dell'app se c'è),
  // 100 g. Una sola tessera per quantità.
  const choices: Choice[] = [];
  const push = (c: Choice) => !choices.some((x) => x.grams === c.grams) && choices.push(c);
  const named = portions.map((p) => ({ grams: Math.round(p.grams), label: portionLabel(p.label, i18n.language) }));
  if (last != null) {
    const g = Math.round(last);
    const label = named.find((p) => p.grams === g && p.label)?.label;
    push({ grams: g, title: label ?? t('common.grams', { value: n(g, 0) }), sub: label ? t('food.lastTimeGrams', { grams: n(g, 0) }) : t('food.lastTime'), last: true });
  }
  for (const p of named) push({ grams: p.grams, title: p.label ?? t('common.grams', { value: n(p.grams, 0) }), sub: p.label ? t('common.grams', { value: n(p.grams, 0) }) : `${n((food.kcal * p.grams) / 100, 0)} kcal` });
  push({ grams: 100, title: t('common.grams', { value: '100' }), sub: `${n(food.kcal, 0)} kcal` });

  const values: [string, string, string?, boolean?][] = [
    [t('food.calories'), `${n(now.kcal, 0)} kcal`],
    [t('meals.protein'), `${n(now.protein)} g`, theme.prot],
    [t('meals.carbs'), `${n(now.carbs)} g`, theme.carb],
    ...(food.sugar != null ? [[t('food.ofWhichSugar'), `${n((food.sugar * grams) / 100)} g`, undefined, true] as [string, string, undefined, boolean]] : []),
    [t('meals.fat'), `${n(now.fat)} g`, theme.fat],
    ...(food.saturatedFat != null ? [[t('food.ofWhichSaturated'), `${n((food.saturatedFat * grams) / 100)} g`, undefined, true] as [string, string, undefined, boolean]] : []),
    ...(food.fiber != null ? [[t('food.fiber'), `${n((food.fiber * grams) / 100)} g`] as [string, string]] : []),
    ...(food.sodium != null ? [[t('food.salt'), `${n((saltGrams(food.sodium) * grams) / 100, 2)} g`] as [string, string]] : []),
  ];

  // Kcal del giorno con questa quantità (senza contare due volte la voce che si sta modificando).
  const dayKcal = dayRows.reduce((a, r) => a + (r.entry.id === entry?.id ? 0 : nutrientsFor(r.food, r.entry.grams ?? 0).kcal), 0) + now.kcal;
  const isToday = date === toDayKey(new Date());
  const day = fromDayKey(date).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric' });

  const save = () => {
    if (!slot) return;
    if (entry) updateEntry(db, entry.id, { grams, mealSlotId: slot.id });
    else addEntry(db, { date, mealSlotId: slot.id, foodId: food.id, grams });
    router.back();
  };

  const shares = macroShares(now);
  const footer = (
    <View className="gap-3 border-t border-line bg-bg px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      {picking && (
        <MealOptions
          slots={slots}
          value={slot?.id}
          onChange={(id) => {
            setSlotId(id);
            setPicking(false);
          }}
        />
      )}
      <View className="flex-row items-center justify-between gap-3">
        <Text variant="label" className="flex-1">
          {isToday ? t('food.todayBecomes', { kcal: n(dayKcal, 0) }) : t('food.dayBecomes', { day, kcal: n(dayKcal, 0) })}
        </Text>
        <MealPill slot={slot} open={picking} onPress={() => setPicking((p) => !p)} />
      </View>
      <Button label={entry ? t('food.save') : t('food.addKcal', { meal, kcal: n(now.kcal, 0) })} onPress={save} />
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
        <View className="flex-1 gap-0.5">
          <Text variant="titleSm" accessibilityRole="header">
            {foodName(food, i18n.language)}
          </Text>
          <View className="flex-row items-center gap-1">
            <Icon name={group} color={theme.ink} size={16} />
            <Text className="font-sans-semibold text-sm">{t(`search.groups.${group}`)}</Text>
          </View>
          <Text variant="label">{t('food.sourceLine', { source, kcal: n(food.kcal, 0) })}</Text>
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
          <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup" accessibilityLabel={t('food.portions')}>
            {choices.map((c) => {
              const on = grams === c.grams;
              return (
                <Pressable
                  key={c.grams}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => setG(c.grams)}
                  className={`min-h-14 grow basis-[45%] justify-center rounded-inner px-3 py-2 active:opacity-70 ${on ? 'border-2 border-accent bg-tint-strong' : 'bg-bg'}`}>
                  <Text className={`font-sans-semibold text-[15px] ${on ? 'text-accent-ink' : ''}`} numberOfLines={1}>
                    {c.title}
                  </Text>
                  <Text variant="label" className={`tabular-nums ${on ? 'text-accent-ink' : ''}`} numberOfLines={1}>
                    {c.sub}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
          {t('food.valuesFor', { grams: n(grams, 0) })}
        </Text>
        {values.map(([k, v, dot, sub]) => (
          <View key={k} className={`flex-row items-center justify-between ${sub ? 'min-h-9 pl-4' : 'min-h-12 border-t border-line'}`}>
            <View className="flex-row items-center gap-1.5">
              {dot ? <View className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} /> : null}
              <Text muted={sub} className={sub ? 'text-sm' : ''}>
                {k}
              </Text>
            </View>
            <Text muted={sub} className={`font-sans-semibold tabular-nums ${sub ? 'text-sm' : ''}`}>
              {v}
            </Text>
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
