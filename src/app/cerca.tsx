import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';
import { db } from '@/db/client';
import { foods } from '@/db/schema';
import { addEntry, mealSlotsQuery } from '@/features/diary/diary';
import { mealName } from '@/features/diary/meal-name';
import { FoodRow } from '@/features/foods/food-row';
import { favoriteIds, getFoods, recentFoodIds } from '@/features/foods/queries';
import { searchFoods, type Food, type SearchFilter } from '@/features/foods/search';
import { useTheme } from '@/hooks/use-theme';
import { toDayKey } from '@/lib/date';
import { queryWords } from '@/lib/text';

const FILTERS: SearchFilter[] = ['all', 'recent', 'favorites', 'mine'];
const QUICK_GRAMS = 100;

export default function Cerca() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ slot?: string; date?: string }>();
  const date = params.date ?? toDayKey(new Date());
  const { data: slots } = useLiveQuery(mealSlotsQuery(db));
  const slot = slots.find((s) => s.id === params.slot) ?? slots[0];
  const meal = slot ? mealName(slot, t) : '';

  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);
  // Si aggiorna tornando dalla scheda (preferiti cambiati) e dopo ogni aggiunta (recenti).
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
  const hits = useMemo(() => (q ? searchFoods(db, q, { lang: i18n.language, filter, ids }) : []), [q, filter, ids, i18n.language]);

  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(h);
  }, [toast]);

  const open = (f: Food) => router.push({ pathname: '/alimento/[id]', params: { id: f.id, slot: slot?.id ?? '', date } });
  const quickAdd = (f: Food) => {
    if (!slot) return;
    addEntry(db, { date, mealSlotId: slot.id, foodId: f.id, grams: QUICK_GRAMS });
    setAdded((s) => new Set(s).add(f.id));
    setToast(t('search.added', { meal, grams: QUICK_GRAMS }));
    setRefresh((r) => r + 1);
  };
  const rows = (list: { food: Food; versions?: number }[], withToks = false) =>
    list.map(({ food, versions }, i) => (
      <FoodRow
        key={food.id}
        food={food}
        versions={versions}
        toks={withToks ? toks : []}
        first={i === 0}
        meal={meal}
        added={added.has(food.id)}
        onOpen={() => open(food)}
        onAdd={() => quickAdd(food)}
      />
    ));
  const empty = (title: string, text: string) => (
    <Card>
      <Text variant="h2">{title}</Text>
      <Text muted className="mt-1.5">
        {text}
      </Text>
    </Card>
  );

  let body;
  if (q) {
    if (hits.length) {
      body = (
        <>
          <Text variant="label" className="mx-1">
            {t('search.results', { count: hits.length })}
          </Text>
          <Card>{rows(hits.map((h) => ({ food: h.food, versions: h.versions.length })), true)}</Card>
        </>
      );
    } else {
      body = empty(
        t('search.noResults', { query: q }),
        filter === 'all' ? t('search.noResultsHint') : t('search.noResultsFiltered', { filter: t(`search.filters.${filter}`) }),
      );
    }
  } else if (filter === 'favorites') {
    body = favs.length ? <Card>{rows(favFoods.map((food) => ({ food })))}</Card> : empty(t('search.noFavorites'), t('search.noFavoritesHint'));
  } else if (filter === 'mine') {
    body = mine.length ? <Card>{rows(mine.map((food) => ({ food })))}</Card> : empty(t('search.noMine'), t('search.noMineHint'));
  } else {
    const list = recentFoods;
    body = (
      <>
        <Card>
          <View className="mb-1 flex-row items-baseline justify-between">
            <Text variant="h2">{t('search.recent')}</Text>
            <Text variant="label">
              {t('search.recentFor', { meal })}
            </Text>
          </View>
          {list.length ? rows(list.map((food) => ({ food }))) : (
            <Text muted className="mt-1">
              {t('search.noRecent', { meal })}
            </Text>
          )}
        </Card>
        <Text muted className="mx-1 text-sm">
          {t('search.hint')}
        </Text>
      </>
    );
  }

  return (
    <Screen eyebrow={`${meal}`} back tabBar={false} footer={<Toast message={toast} />}>
      <Text className="absolute h-px w-px opacity-0" accessibilityRole="header">
        {t('search.title')}
      </Text>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerClassName="items-center gap-2 px-5 py-1">
        {FILTERS.map((f) => (
          <Chip key={f} label={t(`search.filters.${f}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
      {body}
    </Screen>
  );
}
