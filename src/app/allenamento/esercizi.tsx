import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { ListScreen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { BODY_PARTS, type BodyPart, type Equipment, type Muscle } from '@/db/catalog-exercise';
import { ExerciseTile, ZoneGlyph } from '@/features/training/exercise-tile';
import { equipmentIn, exerciseCount, searchExercises, type ExerciseListItem } from '@/features/training/exercises';
import { addExerciseToRoutine } from '@/features/training/routines';
import { activeWorkoutQuery, addExerciseToWorkout } from '@/features/training/workout';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format';

/**
 * Catalogo esercizi, filtrabile per zona e attrezzo. Con `pick=1` (aperto dalla sessione) il "+" aggiunge
 * l'esercizio all'allenamento in corso e torna indietro; con `routine=<id>` lo aggiunge alla scheda e resta qui,
 * per aggiungerne altri. Senza, la riga apre la scheda dell'esercizio.
 */
export default function Esercizi() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { pick, routine } = useLocalSearchParams<{ pick?: string; routine?: string }>();
  const picking = pick === '1' || !!routine;
  const [query, setQuery] = useState('');
  const [part, setPart] = useState<BodyPart | undefined>();
  const [equipment, setEquipment] = useState<Equipment | undefined>();
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  // Il chip si accende subito; la query (e il nuovo elenco) arrivano subito dopo, senza bloccare il tocco.
  const filter = useDeferredValue({ query, part, equipment });
  const results = useMemo(
    () => searchExercises(db, filter.query, { bodyPart: filter.part, equipment: filter.equipment }),
    [filter.query, filter.part, filter.equipment],
  );
  const tools = useMemo(() => equipmentIn(db, part), [part]);
  const total = useMemo(() => exerciseCount(db), []);

  const add = useCallback(
    (e: ExerciseListItem) => {
      if (routine) {
        addExerciseToRoutine(db, routine, e.id);
        setAdded((s) => new Set(s).add(e.id));
        return;
      }
      const w = activeWorkoutQuery(db).get();
      if (w) addExerciseToWorkout(db, w.id, e.id);
      router.back();
    },
    [routine],
  );
  const choosePart = (p?: BodyPart) => {
    setPart(p);
    // Un attrezzo che nella nuova zona non ha esercizi non resta selezionato.
    if (equipment && !equipmentIn(db, p).includes(equipment)) setEquipment(undefined);
  };

  const top = (
    <View className="gap-3">
      <View className="min-h-[52px] flex-row items-center gap-2.5 rounded-full bg-card pl-4">
        <Icon name="search" color={theme.ink2} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('training.search.placeholder')}
          placeholderTextColor={theme.ink2}
          accessibilityLabel={t('training.search.placeholder')}
          autoFocus={pick === '1'}
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
      <FilterRow label={t('training.search.bodyPart')}>
        <Chip label={t('training.search.all')} selected={!part} onPress={() => choosePart(undefined)} />
        {BODY_PARTS.map((p) => (
          <Chip
            key={p}
            label={t(`training.bodyParts.${p}`)}
            leading={<ZoneGlyph bodyPart={p} color={theme.accentInk} size={22} />}
            selected={part === p}
            onPress={() => choosePart(p)}
          />
        ))}
      </FilterRow>
      <FilterRow label={t('training.search.equipment')}>
        <Chip label={t('training.search.all')} selected={!equipment} onPress={() => setEquipment(undefined)} />
        {tools.map((e) => (
          <Chip key={e} label={t(`training.equipment.${e}`)} selected={equipment === e} onPress={() => setEquipment(e)} />
        ))}
      </FilterRow>
      {results.length > 0 && (
        <Text variant="label" className="mx-1 mt-1">
          {t('training.search.results', { count: results.length, n: formatNumber(results.length, i18n.language, 0) })}
        </Text>
      )}
    </View>
  );

  return (
    <ListScreen
      back
      tabBar={false}
      eyebrow={routine ? t('training.routine.addEyebrow') : t('training.catalogCount', { count: total, n: formatNumber(total, i18n.language, 0) })}
      title={t('training.catalog')}
      top={top}
      data={results}
      keyExtractor={(e) => e.id}
      renderItem={({ item, index }) => (
        <ExerciseRow
          e={item}
          first={index === 0}
          last={index === results.length - 1}
          picking={picking}
          added={added.has(item.id)}
          onAdd={add}
          onOpen={() => router.push({ pathname: '/esercizio/[id]', params: { id: item.id, pick, routine } })}
        />
      )}
      ListEmptyComponent={
        <Card>
          <Text variant="h2">{query.trim() ? t('training.search.noResults', { query: query.trim() }) : t('training.search.noneFiltered')}</Text>
          <Text muted className="mt-1.5">
            {t('training.search.noResultsHint')}
          </Text>
        </Card>
      }
    />
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text variant="label" className="mx-1">
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 grow-0" contentContainerClassName="items-center gap-2 px-5">
        {children}
      </ScrollView>
    </View>
  );
}

/** Riga dell'elenco: le righe insieme formano una card (angoli arrotondati solo sulla prima e sull'ultima). */
function ExerciseRow({
  e,
  first,
  last,
  picking,
  added,
  onAdd,
  onOpen,
}: {
  e: ExerciseListItem;
  first: boolean;
  last: boolean;
  picking: boolean;
  added: boolean;
  onAdd: (e: ExerciseListItem) => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const sub = [
    e.equipment && t(`training.equipment.${e.equipment}` as 'training.equipment.barbell'),
    ...(e.primaryMuscles as Muscle[]).slice(0, 1).map((m) => t(`training.muscles.${m}`)),
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <View className={`bg-card px-5 ${first ? 'rounded-t-card pt-1.5' : ''} ${last ? 'rounded-b-card pb-1.5' : ''}`}>
      <View className={`flex-row items-center gap-3 ${first ? '' : 'border-t border-line'}`}>
        <Pressable accessibilityRole="button" onPress={onOpen} className="min-h-14 flex-1 flex-row items-center gap-3 py-2.5 active:opacity-70">
          <ExerciseTile bodyPart={e.bodyPart} />
          <View className="flex-1">
            <Text className="font-sans-semibold text-[15px]">{e.name}</Text>
            <Text variant="label" className="mt-0.5">
              {sub}
            </Text>
          </View>
        </Pressable>
        {picking ? (
          <IconButton
            size={44}
            onCard
            selected={added}
            icon={added ? 'check' : 'plus'}
            label={added ? t('training.search.added', { name: e.name }) : t('training.search.add', { name: e.name })}
            onPress={() => !added && onAdd(e)}
          />
        ) : (
          <Icon name="forward" color={theme.ink2} size={18} />
        )}
      </View>
    </View>
  );
}
