import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';
import { db } from '@/db/client';
import type { Muscle } from '@/db/catalog-exercise';
import { getExercise } from '@/features/training/exercises';
import { ExerciseTile } from '@/features/training/exercise-tile';
import { RoutineTile } from '@/features/training/routine-tile';
import {
  addExerciseToRoutine,
  createRoutine,
  isUntouched,
  routineItem,
  routinesQuery,
  routinesWithExerciseQuery,
  undoAddToRoutine,
  type RoutineItem,
} from '@/features/training/routines';
import { useTrainingFormat } from '@/features/training/use-training-format';
import { activeWorkoutQuery, addExerciseToWorkout, exerciseHistory } from '@/features/training/workout';
import { useTableVersion } from '@/hooks/use-table-version';
import { useTheme } from '@/hooks/use-theme';

/** Pillola neutra con un'etichetta (muscolo, attrezzo). */
function Tag({ label, strong }: { label: string; strong?: boolean }) {
  return (
    <View className={`rounded-full px-3 py-1.5 ${strong ? 'bg-tint' : 'bg-bg'}`}>
      <Text className={`font-sans-semibold text-sm ${strong ? 'text-accent-ink' : 'text-ink'}`}>{label}</Text>
    </View>
  );
}

export default function Esercizio() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const f = useTrainingFormat();
  const { id, pick, routine } = useLocalSearchParams<{ id: string; pick?: string; routine?: string }>();
  const exercise = useMemo(() => getExercise(db, id), [id]);
  const history = useMemo(() => exerciseHistory(db, id), [id]);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(h);
  }, [toast]);
  if (!exercise) return <Screen back tabBar={false} title={t('training.search.noResults', { query: id })} />;

  const steps = exercise.instructions?.[i18n.language === 'en' ? 'en' : 'it'] ?? [];
  const best = history.reduce<number | null>((a, h) => (h.e1rm != null && (a == null || h.e1rm > a) ? h.e1rm : a), null);
  const add = () => {
    if (routine) {
      addExerciseToRoutine(db, routine, exercise.id);
      router.dismissTo({ pathname: '/allenamento/scheda/[id]', params: { id: routine } });
      return;
    }
    const w = activeWorkoutQuery(db).get();
    if (w) addExerciseToWorkout(db, w.id, exercise.id);
    router.dismissTo('/allenamento/sessione');
  };
  const footer =
    pick === '1' || routine ? (
      <View className="border-t border-line bg-bg px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button icon="plus" label={routine ? t('training.exercise.addToRoutine') : t('training.exercise.add')} onPress={add} />
      </View>
    ) : (
      <Toast message={toast} />
    );

  return (
    <Screen
      back
      tabBar={false}
      footer={footer}
      compactTitle
      eyebrow={t(`training.kinds.${exercise.kind}`)}
      title={exercise.name}
      leading={<ExerciseTile bodyPart={exercise.bodyPart} size="lg" />}>
      {/* Dal catalogo (non dalla sessione né da una scheda): si aggiunge alle schede da qui. */}
      {!pick && !routine ? <AddToRoutines exerciseId={exercise.id} onChange={setToast} /> : null}
      <Card className="gap-4">
        <View className="gap-2">
          <Text variant="label">{t('training.exercise.primary')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {(exercise.primaryMuscles as Muscle[]).map((m) => (
              <Tag key={m} strong label={t(`training.muscles.${m}`)} />
            ))}
          </View>
        </View>
        {(exercise.secondaryMuscles as Muscle[]).length > 0 && (
          <View className="gap-2">
            <Text variant="label">{t('training.exercise.secondary')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {(exercise.secondaryMuscles as Muscle[]).map((m) => (
                <Tag key={m} label={t(`training.muscles.${m}`)} />
              ))}
            </View>
          </View>
        )}
        {exercise.equipment && (
          <View className="gap-2">
            <Text variant="label">{t('training.exercise.equipment')}</Text>
            <View className="flex-row">
              <Tag label={t(`training.equipment.${exercise.equipment}` as 'training.equipment.barbell')} />
            </View>
          </View>
        )}
      </Card>

      <Card>
        <View className="flex-row items-baseline justify-between">
          <Text variant="h2">{t('training.exercise.history')}</Text>
          {best != null && (
            <Text variant="label">
              {t('training.exercise.best')} <Text variant="num" className="text-[15px]">{f.n(best, 1)} kg</Text>
            </Text>
          )}
        </View>
        {history.length === 0 ? (
          <Text muted className="mt-1.5">
            {t('training.exercise.historyEmpty')}
          </Text>
        ) : (
          history.map((h) => (
            <View key={h.workout.id} className="mt-2 border-t border-line pt-2.5">
              <Text className="font-sans-semibold text-[15px]">{f.day(h.workout.startedAt ?? 0)}</Text>
              <Text variant="label" className="mt-0.5 tabular-nums">
                {h.sets.map((s) => f.setText(s, exercise.kind)).join(', ')}
                {h.e1rm != null ? ` · ${t('training.exercise.e1rm')} ${f.n(h.e1rm, 1)} kg` : ''}
              </Text>
            </View>
          ))
        )}
      </Card>

      {steps.length > 0 && (
        <Card className="gap-3">
          <Text variant="h2">{t('training.exercise.instructions')}</Text>
          {steps.map((s, i) => (
            <View key={i} className="flex-row gap-3">
              <Text variant="num" className="w-5 text-[15px] text-accent-ink">
                {i + 1}
              </Text>
              <Text className="flex-1">{s}</Text>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

/**
 * "Aggiungi a una scheda": si apre in un elenco delle schede con una casella ciascuna. Spuntata = l'esercizio è già
 * nella scheda; toccare una riga non spuntata lo aggiunge in fondo. Da qui si toglie solo un'aggiunta fatta mentre la
 * pagina è aperta e non ancora toccata (serie, ripetizioni, superserie, posizione): per annullare un tocco sbagliato.
 * Il resto si cambia dalla scheda. In fondo, una scheda nuova che parte da qui.
 */
function AddToRoutines({ exerciseId, onChange }: { exerciseId: string; onChange: (message: string) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  // Righe aggiunte da questa pagina, com'erano appena aggiunte (per scheda).
  const [added, setAdded] = useState<Map<string, RoutineItem>>(() => new Map());
  const { data: list } = useLiveQuery(routinesQuery(db), [useTableVersion('routine_exercises')]);
  const { data: rows } = useLiveQuery(routinesWithExerciseQuery(db, exerciseId), [exerciseId]);
  const inside = new Set(rows.map((r) => r.routineId));
  const names = list.filter((r) => inside.has(r.routine.id)).map((r) => r.routine.name);

  const removable = (id: string) => {
    const before = added.get(id);
    return !!before && isUntouched(db, before);
  };
  const forget = (id: string) =>
    setAdded((m) => {
      const next = new Map(m);
      next.delete(id);
      return next;
    });
  const toggle = (id: string, name: string) => {
    if (!inside.has(id)) {
      const item = routineItem(db, addExerciseToRoutine(db, id, exerciseId));
      if (item) setAdded((m) => new Map(m).set(id, item));
      onChange(t('training.exercise.addedTo', { name }));
      return;
    }
    const before = added.get(id);
    if (before && undoAddToRoutine(db, before)) {
      forget(id);
      onChange(t('training.exercise.removedFrom', { name }));
    } else {
      onChange(t('training.exercise.alreadyIn', { name }));
    }
  };
  const createWith = () => {
    const id = createRoutine(db, t('training.routine.defaultNameN', { n: list.length + 1 }));
    addExerciseToRoutine(db, id, exerciseId);
    router.push({ pathname: '/allenamento/scheda/[id]', params: { id, nuova: '1' } });
  };

  return (
    <Card className="py-1.5">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        className="min-h-16 flex-row items-center gap-3 py-2.5 active:opacity-70">
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-tint">
          <Icon name="plus" color={theme.accentInk} size={22} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-[15px]">{t('training.exercise.toRoutines')}</Text>
          <Text variant="label" className="mt-0.5" numberOfLines={1}>
            {names.length ? t('training.exercise.inRoutines', { count: names.length, list: names.join(', ') }) : t('training.exercise.inNoRoutine')}
          </Text>
        </View>
        <Icon name={open ? 'up' : 'down'} color={theme.ink2} size={20} />
      </Pressable>
      {open && (
        <>
          {list.map(({ routine, exercises }) => {
            const checked = inside.has(routine.id);
            const undo = checked && removable(routine.id);
            return (
              <Pressable
                key={routine.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={checked ? t('training.exercise.inRoutineLabel', { name: routine.name }) : routine.name}
                onPress={() => toggle(routine.id, routine.name)}
                className="min-h-14 flex-row items-center gap-3 border-t border-line py-2.5 active:opacity-70">
                <RoutineTile style={routine} size="sm" />
                <View className="flex-1">
                  <Text className="font-sans-semibold text-[15px]">{routine.name}</Text>
                  <Text variant="label">
                    {undo
                      ? t('training.exercise.justAdded')
                      : checked
                        ? t('training.exercise.alreadyInRow')
                        : t('training.exercises', { count: exercises })}
                  </Text>
                </View>
                {/* piena = si può ancora togliere; tinta = già nella scheda, si cambia da lì */}
                <View
                  className={`h-7 w-7 items-center justify-center rounded-full ${undo ? 'bg-accent' : checked ? 'bg-tint-strong' : 'border-2 border-line'}`}>
                  {checked ? <Icon name="check" color={undo ? '#FFFFFF' : theme.accentInk} size={16} strokeWidth={2.4} /> : null}
                </View>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            onPress={createWith}
            className="min-h-14 flex-row items-center gap-3 border-t border-line py-2.5 active:opacity-70">
            <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-bg">
              <Icon name="plus" color={theme.ink} size={18} />
            </View>
            <Text className="flex-1 font-sans-semibold text-[15px]">{t('training.exercise.newRoutineWith')}</Text>
          </Pressable>
        </>
      )}
    </Card>
  );
}
