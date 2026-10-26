import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import { RoutineTile } from '@/features/training/routine-tile';
import { createRoutine, routinesQuery, setDayRoutine, weekPlanQuery, type RoutineStyle } from '@/features/training/routines';
import { useTrainingFormat } from '@/features/training/use-training-format';
import { useTableVersion } from '@/hooks/use-table-version';
import { useTheme } from '@/hooks/use-theme';

/** Sceglie cosa fare in un giorno della settimana (`d`: 0 = lunedì): una delle schede o riposo. */
export default function Giorno() {
  const { t } = useTranslation();
  const theme = useTheme();
  const f = useTrainingFormat();
  const weekday = Number(useLocalSearchParams<{ d: string }>().d);
  const { data: list } = useLiveQuery(routinesQuery(db), [useTableVersion('routine_exercises')]);
  const { data: plan } = useLiveQuery(weekPlanQuery(db), [useTableVersion('routines')]);
  const current = plan.find((p) => p.weekday === weekday)?.routineId ?? null;

  const choose = (routineId: string | null) => {
    setDayRoutine(db, weekday, routineId);
    router.back();
  };
  const create = () => {
    const id = createRoutine(db, t('training.routine.defaultNameN', { n: list.length + 1 }));
    setDayRoutine(db, weekday, id);
    router.replace({ pathname: '/allenamento/scheda/[id]', params: { id, nuova: '1' } });
  };
  const options: { id: string | null; title: string; sub?: string; style?: RoutineStyle }[] = [
    { id: null, title: t('training.week.rest') },
    ...list.map(({ routine, exercises }) => ({ id: routine.id, title: routine.name, sub: t('training.exercises', { count: exercises }), style: routine })),
  ];

  return (
    <Screen back tabBar={false} eyebrow={t('training.week.chooseEyebrow')} title={f.weekday(weekday, 'long')}>
      <Card className="py-1.5">
        {options.map((o, i) => {
          const selected = o.id === current;
          return (
            <Pressable
              key={o.id ?? 'rest'}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => choose(o.id)}
              className={`min-h-14 flex-row items-center gap-3 py-2.5 active:opacity-70 ${i ? 'border-t border-line' : ''}`}>
              {o.style ? (
                <RoutineTile style={o.style} />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-bg">
                  <Icon name="minus" color={theme.ink2} size={20} />
                </View>
              )}
              <View className="flex-1">
                <Text className="font-sans-semibold text-[15px]">{o.title}</Text>
                {o.sub ? (
                  <Text variant="label" className="mt-0.5">
                    {o.sub}
                  </Text>
                ) : null}
              </View>
              {selected && <Icon name="check" color={theme.accent} size={22} />}
            </Pressable>
          );
        })}
      </Card>
      <Button variant="secondary" icon="plus" label={t('training.routine.new')} onPress={create} />
    </Screen>
  );
}
