import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';
import { db } from '@/db/client';
import { FOOD_GROUPS, foods } from '@/db/schema';
import { addEntry, deleteEntry, mealSlotsQuery } from '@/features/diary/diary';
import { mealName } from '@/features/diary/meal-name';
import { MealOptions, MealPill } from '@/features/diary/meal-picker';
import { FoodRow } from '@/features/foods/food-row';
import type { CategoryIcon } from '@/features/foods/macros';
import { favoriteIds, getFoods, quickAmounts, recentFoodIds } from '@/features/foods/queries';
import { browseGroup, searchFoods, type Food, type FoodHit, type SearchFilter } from '@/features/foods/search';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { toDayKey } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { queryWords } from '@/lib/text';

const FILTERS: SearchFilter[] = ['all', 'recent', 'favorites', 'mine'];

/**
 * Ricerca alimenti per un pasto (cambiabile dalla pillola in alto). Due righe di filtri: elenco (tutti, recenti,
 * preferiti, miei) e gruppo con il suo glifo; senza parole, un gruppo si sfoglia. Il "+" aggiunge l'ultima quantità
 * usata o la porzione tipica (`quickAmount`), con "Annulla" nell'avviso.
 */
export default function Cerca() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ slot?: string; date?: string }>();
  const date = params.date ?? toDayKey(new Date());
  const { data: slots } = useLiveQuery(mealSlotsQuery(db));
  const [slotId, setSlotId] = useState(params.slot);
  const [picking, setPicking] = useState(false);
  const slot = slots.find((s) => s.id === slotId) ?? slots[0];
  const meal = slot ? mealName(slot, t) : '';

  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [group, setGroup] = useState<CategoryIcon | undefined>();
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const toast = useToast();
  // Si aggiorna tornando dalla scheda (preferiti, quantità) e dopo ogni aggiunta (recenti).
  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((r) => r + 1), []));

  const recent = useMemo(() => recentFoodIds(db, slot?.id), [slot?.id, refresh]); // eslint-disable-line react-hooks/exhaustive-deps
  const favs = useMemo(() => favoriteIds(db), [refresh]); // eslint-disable-line react-hooks/exhaustive-deps
  const mine = useMemo(() => db.select().from(foods).where(eq(foods.source, 'custom')).all(), [refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const favFoods = useMemo(() => getFoods(db, favs), [favs]);
  const recentFoods = useMemo(() => getFoods(db, recent), [recent]);
  const q = deferred.trim();
  const toks = queryWords(q);
  const ids = filter === 'recent' ? recent : filter === 'favorites' ? favs : undefined;
  const hits = useMemo(
    () => (q ? searchFoods(db, q, { lang: i18n.language, filter, ids, group }) : []),
    [q, filter, ids, group, i18n.language],
  );
  const browsed = useMemo(() => (!q && group && filter === 'all' ? browseGroup(db, group, { lang: i18n.language }) : []), [q, group, filter, i18n.language]);
  const inGroup = (list: Food[]) => (group ? list.filter((f) => f.foodGroup === group) : list);

  // Elenco mostrato (righe e titolo), poi le quantità del "+" per quelle righe.
  let list: FoodHit[] = [];
  let title: string | null = null;
  let emptyBody: [string, string] | null = null;
  if (q) {
    list = hits;
    if (!hits.length) {
      emptyBody = [
        t('search.noResults', { query: q }),
        group ? t('search.noResultsGroup', { group: t(`search.groups.${group}`) }) : filter === 'all' ? t('search.noResultsHint') : t('search.noResultsFiltered', { filter: t(`search.filters.${filter}`) }),
      ];
    }
  } else if (filter === 'favorites') {
    list = inGroup(favFoods).map((food) => ({ food, versions: [food] }));
    if (!list.length) emptyBody = [t('search.noFavorites'), t('search.noFavoritesHint')];
  } else if (filter === 'mine') {
    list = inGroup(mine).map((food) => ({ food, versions: [food] }));
    if (!list.length) emptyBody = [t('search.noMine'), t('search.noMineHint')];
  } else if (group && filter === 'all') {
    list = browsed;
  } else {
    list = inGroup(recentFoods).map((food) => ({ food, versions: [food] }));
    title = t('search.recent');
  }
  const listIds = list.map((h) => h.food.id).join(',');
  const amounts = useMemo(() => quickAmounts(db, listIds ? listIds.split(',') : [], i18n.language), [listIds, i18n.language, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (f: Food) => router.push({ pathname: '/alimento/[id]', params: { id: f.id, slot: slot?.id ?? '', date } });
  const quickAdd = (f: Food) => {
    const amount = amounts.get(f.id);
    if (!slot || !amount) return;
    const id = addEntry(db, { date, mealSlotId: slot.id, foodId: f.id, grams: amount.grams });
    setAdded((s) => new Set(s).add(f.id));
    const qty = amount.label
      ? t('meals.portionGrams', { portion: amount.label, grams: formatNumber(amount.grams, i18n.language, 0) })
      : t('common.grams', { value: formatNumber(amount.grams, i18n.language, 0) });
    toast.show(t('search.addedAmount', { meal, amount: qty }), {
      label: t('meals.undo'),
      onPress: () => {
        deleteEntry(db, id);
        setAdded((s) => {
          const next = new Set(s);
          next.delete(f.id);
          return next;
        });
        toast.hide();
      },
    });
    setRefresh((r) => r + 1);
  };

  const count = q || (group && filter === 'all') ? list.length : 0;
  return (
    <Screen
      back
      tabBar={false}
      right={<MealPill slot={slot} open={picking} onPress={() => setPicking((p) => !p)} />}
      footer={<Toast message={toast.message} action={toast.action} />}>
      <Text className="absolute h-px w-px opacity-0" accessibilityRole="header">
        {t('search.title')}
      </Text>
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
      <View className="min-h-[52px] flex-row items-center gap-2.5 rounded-full bg-card pl-4">
        <Icon name="search" color={theme.ink2} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.ink2}
          accessibilityLabel={t('search.placeholder')}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 font-sans-medium text-base text-ink"
          style={{ minHeight: 48 }}
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('search.clear')} onPress={() => setQuery('')} className="h-11 w-11 items-center justify-center">
            <Icon name="close" color={theme.ink2} size={18} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 grow-0" contentContainerClassName="items-center gap-2 px-5">
        {FILTERS.map((f) => (
          <Chip key={f} label={t(`search.filters.${f}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 grow-0" contentContainerClassName="items-center gap-2 px-5">
        {FOOD_GROUPS.map((g) => (
          <Chip
            key={g}
            label={t(`search.groups.${g}`)}
            leading={<Icon name={g} color={theme.accentInk} size={20} />}
            selected={group === g}
            onPress={() => setGroup(group === g ? undefined : g)}
          />
        ))}
      </ScrollView>

      {count > 0 && (
        <Text variant="label" className="mx-1">
          {[t('search.results', { count }), group ? t(`search.groups.${group}`) : null].filter(Boolean).join(' · ')}
        </Text>
      )}
      {emptyBody ? (
        <Card>
          <Text variant="h2">{emptyBody[0]}</Text>
          <Text muted className="mt-1.5">
            {emptyBody[1]}
          </Text>
        </Card>
      ) : title != null ? (
        <>
          <Card>
            <View className="mb-1 flex-row items-baseline justify-between">
              <Text variant="h2">{title}</Text>
              <Text variant="label">{t('search.recentFor', { meal })}</Text>
            </View>
            {list.length ? (
              rows()
            ) : (
              <Text muted className="mt-1">
                {t('search.noRecent', { meal })}
              </Text>
            )}
          </Card>
          <Text muted className="mx-1 text-sm">
            {t('search.hint')}
          </Text>
        </>
      ) : (
        <Card>{rows()}</Card>
      )}
    </Screen>
  );

  function rows() {
    return list.map(({ food, versions }, i) => (
      <FoodRow
        key={food.id}
        food={food}
        amount={amounts.get(food.id) ?? { grams: 100, label: null }}
        versions={versions.length}
        toks={q ? toks : []}
        first={i === 0}
        meal={meal}
        added={added.has(food.id)}
        onOpen={() => open(food)}
        onAdd={() => quickAdd(food)}
      />
    ));
  }
}
