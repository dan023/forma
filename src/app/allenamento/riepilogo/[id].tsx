import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentScope } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { RoutineTile, routineHex } from '@/features/training/routine-tile';
import { routineOfWorkout, type RoutineStyle } from '@/features/training/routines';
import { minutesBetween } from '@/features/training/stats';
import { useTrainingFormat } from '@/features/training/use-training-format';
import { workoutSummary } from '@/features/training/workout';
import { useTheme } from '@/hooks/use-theme';

/** Riepilogo di un allenamento finito: si apre alla fine della sessione e dallo storico. Prende il colore della scheda. */
export default function Riepilogo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useMemo(() => routineOfWorkout(db, id), [id]);
  return (
    <AccentScope color={routine ? routineHex(routine.color) : null}>
      <Summary id={id} routine={routine} />
    </AccentScope>
  );
}

function Summary({ id, routine }: { id: string; routine?: RoutineStyle }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const f = useTrainingFormat();
  const sum = useMemo(() => workoutSummary(db, id), [id]);
  if (!sum) return <Screen back tabBar={false} title={t('training.summary.empty')} />;
  const { workout } = sum;

  const kpis = [
    [t('training.duration'), f.duration(minutesBetween(workout.startedAt ?? 0, workout.finishedAt ?? 0))],
    [t('training.volume'), f.volume(sum.volume)],
    [t('training.setsDone'), f.n(sum.sets, 0)],
  ];
  const footer = (
    <View className="border-t border-line bg-bg px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      <Button label={t('training.summary.done')} onPress={() => router.back()} />
    </View>
  );

  return (
    <Screen
      back
      tabBar={false}
      footer={footer}
      eyebrow={[workout.name, f.day(workout.startedAt ?? 0)].filter(Boolean).join(' · ')}
      title={t('training.summary.title')}
      leading={routine ? <RoutineTile style={routine} size="lg" /> : undefined}>
      <Card className="flex-row px-2 py-4">
        {kpis.map(([label, value], i) => (
          <View key={label} className={`flex-1 gap-1 px-3 ${i ? 'border-l border-line' : ''}`}>
            <Text variant="label">{label}</Text>
            <Text variant="num" className="text-[22px] leading-7">
              {value}
            </Text>
          </View>
        ))}
      </Card>

      {sum.records > 0 && (
        <Card tint className="flex-row items-center gap-3 py-4">
          <Icon name="star" color={theme.accentInk} size={22} />
          <Text className="flex-1 font-sans-semibold text-accent-ink">{t('training.summary.records', { count: sum.records })}</Text>
        </Card>
      )}

      {sum.exercises.map((ex) => (
        <Card key={ex.item.id} className="gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/esercizio/[id]', params: { id: ex.exercise.id } })}
            className="flex-row items-baseline justify-between gap-3 active:opacity-70">
            <Text variant="h2" className="flex-1">
              {ex.exercise.name}
            </Text>
            {ex.record && (
              <View className="rounded-full bg-tint px-2.5 py-1">
                <Text className="font-sans-semibold text-xs text-accent-ink">{t('training.summary.record')}</Text>
              </View>
            )}
          </Pressable>
          {ex.sets.map((s, i) => (
            <View key={s.id} className="min-h-10 flex-row items-center gap-3 border-t border-line">
              <Text variant="num" className="w-6 text-[15px] text-ink-2">
                {i + 1}
              </Text>
              <Text className={`flex-1 tabular-nums ${s === ex.best ? 'font-sans-bold' : ''}`}>{f.setText(s, ex.exercise.kind)}</Text>
            </View>
          ))}
          {ex.e1rm != null && (
            <Text variant="label" className="tabular-nums">
              {t('training.exercise.e1rm')} {f.n(ex.e1rm, 1)} kg
            </Text>
          )}
        </Card>
      ))}
    </Screen>
  );
}
