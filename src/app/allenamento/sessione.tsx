import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { AccentScope } from '@/components/theme-provider';
import { Icon, type IconName } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import type { Muscle } from '@/db/catalog-exercise';
import { ExerciseTile } from '@/features/training/exercise-tile';
import { RestCard } from '@/features/training/rest-card';
import { RoutineTile, routineHex } from '@/features/training/routine-tile';
import { routineQuery } from '@/features/training/routines';
import { COLS, SetRow } from '@/features/training/set-row';
import { clock } from '@/features/training/stats';
import { restAfterSet, supersetBlocks } from '@/features/training/supersets';
import { useTrainingFormat } from '@/features/training/use-training-format';
import {
  activeWorkoutQuery,
  addSet,
  completeSet,
  discardWorkout,
  finishWorkout,
  groupSession,
  previousSets,
  removeWorkoutExercise,
  startWorkout,
  uncompleteSet,
  updateSet,
  workoutExercisesQuery,
  workoutSetsQuery,
  type SessionExercise,
  type WorkoutSet,
} from '@/features/training/workout';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { useRestTimer } from '@/stores/rest-timer';

export default function Sessione() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: active, updatedAt } = useLiveQuery(activeWorkoutQuery(db));
  const workout = active[0];
  const id = workout?.id ?? '';
  const { data: items } = useLiveQuery(workoutExercisesQuery(db, id), [id]);
  const { data: setRows } = useLiveQuery(workoutSetsQuery(db, id), [id]);
  const session = useMemo(() => groupSession(items, setRows), [items, setRows]);
  const blocks = useMemo(() => supersetBlocks(session, (ex) => ex.item.supersetGroup), [session]);
  // Serie dell'ultima volta per ogni esercizio: suggerimenti nei campi vuoti. Non cambiano durante la sessione.
  const exerciseIds = items.map((i) => i.exercise.id).join(',');
  const hints = useMemo(
    () => new Map(exerciseIds.split(',').filter(Boolean).map((e) => [e, previousSets(db, e, id)])),
    [exerciseIds, id],
  );
  const { data: routineRows } = useLiveQuery(routineQuery(db, workout?.routineId ?? ''), [workout?.routineId]);
  const routine = routineRows[0];
  const now = useNow(!!workout);
  const startRest = useRestTimer((s) => s.start);
  const stopRest = useRestTimer((s) => s.stop);
  const done = setRows.filter((r) => r.set.completedAt != null).length;

  // Finché la query non risponde non si sa se c'è un allenamento in corso: niente card "Inizia" per un istante.
  if (!updatedAt) return <Screen back tabBar={false} />;
  if (!workout) {
    return (
      <Screen back tabBar={false} title={t('training.freeWorkout')}>
        <Card className="gap-4">
          <Text muted>{t('training.startHint')}</Text>
          <Button icon="plus" label={t('training.start')} onPress={() => startWorkout(db)} />
        </Card>
      </Screen>
    );
  }

  const finish = () => {
    stopRest();
    if (finishWorkout(db, id)) {
      router.replace({ pathname: '/allenamento/riepilogo/[id]', params: { id } });
    } else {
      Alert.alert(t('training.summary.empty'));
      router.back();
    }
  };
  const discard = () =>
    Alert.alert(t('training.session.discardTitle'), t('training.session.discardBody'), [
      { text: t('training.session.keepGoing'), style: 'cancel' },
      {
        text: t('training.session.discardYes'),
        style: 'destructive',
        onPress: () => {
          stopRest();
          discardWorkout(db, id);
          router.back();
        },
      },
    ]);
  /** In una superserie il recupero parte solo quando il giro è finito (vedi `restAfterSet`). */
  const toggle = (block: SessionExercise[], exIndex: number, setIndex: number, values: Parameters<typeof completeSet>[2] | null) => {
    const s = block[exIndex].sets[setIndex];
    if (values) {
      completeSet(db, s.id, values);
      if (restAfterSet(block, exIndex, setIndex)) startRest();
      else stopRest();
    } else uncompleteSet(db, s.id);
  };

  const footer = (
    <View className="gap-3 border-t border-line bg-bg px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      <RestCard />
      <Button label={t('training.session.finish')} onPress={finish} />
    </View>
  );

  return (
    <AccentScope color={routine ? routineHex(routine.color) : null}>
      <Screen
        back
        tabBar={false}
        footer={footer}
        eyebrow={[clock((now - (workout.startedAt ?? now)) / 1000), t('training.session.progress', { done, total: setRows.length })].join(' · ')}
        title={workout.name ?? t('training.freeWorkout')}
        leading={routine ? <RoutineTile style={routine} size="lg" /> : undefined}>
        {session.length === 0 && (
          <Text muted className="mx-1">
            {t('training.session.empty')}
          </Text>
        )}
        {blocks.map((block) => (
          <Card key={block[0].item.id} className="gap-1.5 px-3 pb-3 pt-4">
            {block.length > 1 && (
              <View className="mb-1 flex-row items-center gap-1.5 px-2">
                <AccentIcon name="link" size={16} />
                <Text variant="label" className="font-sans-semibold text-accent-ink">
                  {t('training.session.superset')}
                </Text>
                <Text variant="label">· {t('training.session.supersetHint')}</Text>
              </View>
            )}
            {block.map((ex, i) => (
              <ExerciseSection
                key={ex.item.id}
                ex={ex}
                divider={i > 0}
                hints={hints.get(ex.exercise.id) ?? []}
                onToggle={(setIndex, values) => toggle(block, i, setIndex, values)}
              />
            ))}
          </Card>
        ))}
        <Button variant="secondary" icon="plus" label={t('training.session.addExercise')} onPress={() => router.push({ pathname: '/allenamento/esercizi', params: { pick: '1' } })} />
        <Button variant="danger" soft size="md" icon="trash" label={t('training.session.discard')} onPress={discard} />
      </Screen>
    </AccentScope>
  );
}

/** Un esercizio della sessione: intestazione, colonne e serie. Più sezioni nella stessa card sono una superserie. */
function ExerciseSection({
  ex,
  divider,
  hints,
  onToggle,
}: {
  ex: SessionExercise;
  divider: boolean;
  hints: WorkoutSet[];
  onToggle: (setIndex: number, values: Parameters<typeof completeSet>[2] | null) => void;
}) {
  const { t } = useTranslation();
  const f = useTrainingFormat();
  const { exercise, item, sets } = ex;
  const muscle = (exercise.primaryMuscles as Muscle[])[0];
  const target = f.target(item.targetRepsMin, item.targetRepsMax, item.targetSec, exercise.kind);
  const meta = [
    exercise.equipment && t(`training.equipment.${exercise.equipment}` as 'training.equipment.barbell'),
    muscle && t(`training.muscles.${muscle}`),
    target,
  ]
    .filter(Boolean)
    .join(' · ');
  const head = (text: string, width: string) => (
    <Text variant="label" className={`${width} text-center text-xs`}>
      {text}
    </Text>
  );
  return (
    <View className={`gap-1.5 ${divider ? 'mt-2 border-t border-line pt-4' : ''}`}>
      <View className="mb-1 flex-row items-center gap-2 px-2">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/esercizio/[id]', params: { id: exercise.id } })}
          className="flex-1 flex-row items-center gap-3 active:opacity-70">
          <ExerciseTile bodyPart={exercise.bodyPart} />
          <View className="flex-1">
            <Text variant="h2">{exercise.name}</Text>
            {meta ? <Text variant="label">{meta}</Text> : null}
          </View>
        </Pressable>
        <IconButton size={44} onCard icon="close" label={t('training.session.removeExercise', { name: exercise.name })} onPress={() => removeWorkoutExercise(db, item.id)} />
      </View>
      <View className="flex-row items-center gap-2 px-2" aria-hidden>
        {head(t('training.session.set'), COLS.n)}
        <Text variant="label" className={`${COLS.prev} text-xs`}>
          {t('training.session.previous')}
        </Text>
        {exercise.kind === 'timed' ? (
          head(t('training.session.seconds'), COLS.sec)
        ) : (
          <>
            {exercise.kind === 'weight' && head(t('training.session.kg'), COLS.kg)}
            {head(t('training.session.reps'), COLS.reps)}
          </>
        )}
        <View className={COLS.done} />
      </View>
      {sets.map((s, i) => (
        <SetRow
          key={s.id}
          set={s}
          index={i}
          kind={exercise.kind}
          hint={hints[i] ?? hints[hints.length - 1]}
          target={{ reps: item.targetRepsMin, durationSec: item.targetSec }}
          onChange={(v) => updateSet(db, s.id, v)}
          onToggle={(v) => onToggle(i, v)}
        />
      ))}
      <Button variant="ghost" size="sm" icon="plus" label={t('training.session.addSet')} onPress={() => addSet(db, item.id)} />
    </View>
  );
}

/** Icona nell'inchiostro dell'accento: dentro `AccentScope` prende quello della scheda. */
function AccentIcon({ name, size }: { name: IconName; size: number }) {
  const theme = useTheme();
  return <Icon name={name} color={theme.accentInk} size={size} />;
}
