import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentScope } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Card, Well } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import type { Muscle } from '@/db/catalog-exercise';
import { ROUTINE_COLORS, ROUTINE_ICONS } from '@/db/schema';
import {
  deleteRoutine,
  linkRoutineExercise,
  moveRoutineExercise,
  removeRoutineExercise,
  renameRoutine,
  routineDaysQuery,
  routineExercisesQuery,
  routineQuery,
  setDayRoutine,
  setRoutineExerciseSets,
  setRoutineExerciseTarget,
  setRoutineStyle,
  startRoutineWorkout,
  weekPlanQuery,
  type RoutineStyle,
} from '@/features/training/routines';
import { estimateMinutes } from '@/features/training/estimate';
import { ExerciseTile } from '@/features/training/exercise-tile';
import type { Exercise } from '@/features/training/exercises';
import { RoutineTile, routineHex } from '@/features/training/routine-tile';
import { useTrainingFormat } from '@/features/training/use-training-format';
import { activeWorkoutQuery } from '@/features/training/workout';
import { useTableVersion } from '@/hooks/use-table-version';
import { useTheme } from '@/hooks/use-theme';

const WEEK = [0, 1, 2, 3, 4, 5, 6];

/**
 * Scheda: nome, giorni della settimana in cui farla, esercizi con le serie previste. Ogni modifica si salva subito.
 * Con `nuova=1` (appena creata) il nome è selezionato, pronto da riscrivere.
 */
export default function Scheda() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const f = useTrainingFormat();
  const { id, nuova } = useLocalSearchParams<{ id: string; nuova?: string }>();
  const { data: rows, updatedAt } = useLiveQuery(routineQuery(db, id), [id]);
  const routine = rows[0];
  const { data: items } = useLiveQuery(routineExercisesQuery(db, id), [id]);
  const { data: days } = useLiveQuery(routineDaysQuery(db, id), [id]);
  const { data: plan } = useLiveQuery(weekPlanQuery(db), [useTableVersion('routines')]);
  const [name, setName] = useState<string | null>(null);

  // `updatedAt` vuoto = la query non ha ancora risposto: niente "Scheda non trovata" per un istante.
  if (!routine) return <Screen back tabBar={false} title={updatedAt ? t('training.routine.missing') : undefined} />;

  const mine = new Set(days.map((d) => d.weekday));
  const others = new Map(plan.filter((p) => p.routineId !== id).map((p) => [p.weekday, p]));
  const minutes = estimateMinutes(items.map((r) => ({ ...r.item, kind: r.exercise.kind })));
  const toggleDay = (d: number) => setDayRoutine(db, d, mine.has(d) ? null : id);
  // Il nome si salva a ogni tasto: "Inizia allenamento" o "indietro" toccati con il campo ancora attivo non
  // aspettano che il campo perda il fuoco. Uscendo dal campo torna a valere quello salvato (vuoto = non cambia).
  const typeName = (v: string) => {
    setName(v);
    renameRoutine(db, id, v);
  };
  const saveName = () => setName(null);
  const start = () => {
    const active = activeWorkoutQuery(db).get();
    if (active) {
      Alert.alert(t('training.routine.activeTitle'), t('training.routine.activeBody'), [
        { text: t('training.resume'), onPress: () => router.push('/allenamento/sessione') },
      ]);
      return;
    }
    startRoutineWorkout(db, id);
    router.push('/allenamento/sessione');
  };
  const remove = () =>
    Alert.alert(t('training.routine.deleteTitle', { name: routine.name }), t('training.routine.deleteBody'), [
      { text: t('training.session.keepGoing'), style: 'cancel' },
      {
        text: t('training.routine.deleteYes'),
        style: 'destructive',
        onPress: () => {
          deleteRoutine(db, id);
          router.back();
        },
      },
    ]);

  const footer = (
    <View className="border-t border-line bg-bg px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      <Button label={t('training.routine.start')} onPress={start} disabled={items.length === 0} />
    </View>
  );

  return (
    <AccentScope color={routineHex(routine.color)}>
      <Screen
        back
        tabBar={false}
        footer={footer}
        eyebrow={t('training.routine.eyebrow')}
        title={name ?? routine.name}
        leading={<RoutineTile style={routine} size="lg" />}>
        <Card className="gap-2">
          <Text variant="label">{t('training.routine.name')}</Text>
          <Well className="px-4">
            <TextInput
              value={name ?? routine.name}
              onChangeText={typeName}
              onEndEditing={saveName}
              onSubmitEditing={saveName}
              autoFocus={nuova === '1'}
              selectTextOnFocus={nuova === '1'}
              accessibilityLabel={t('training.routine.name')}
              returnKeyType="done"
              maxLength={40}
              className="font-sans-semibold text-base text-ink"
              style={{ minHeight: 48 }}
            />
          </Well>
          <Text variant="label" className="mt-2">
            {t('training.routine.icon')}
          </Text>
          {/* due righe da sei, a qualunque larghezza */}
          <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel={t('training.routine.icon')}>
            {[ROUTINE_ICONS.slice(0, 6), ROUTINE_ICONS.slice(6)].map((row) => (
              <View key={row[0]} className="flex-row justify-between">
                {row.map((icon) => (
                  <IconChoice key={icon} icon={icon} selected={routine.icon === icon} onPress={() => setRoutineStyle(db, id, { icon })} />
                ))}
              </View>
            ))}
          </View>
          <Text variant="label" className="mt-2">
            {t('training.routine.color')}
          </Text>
          <View className="flex-row justify-between" accessibilityRole="radiogroup" accessibilityLabel={t('training.routine.color')}>
            {ROUTINE_COLORS.map((color) => (
              <ColorChoice key={color} color={color} selected={routine.color === color} onPress={() => setRoutineStyle(db, id, { color })} />
            ))}
          </View>
        </Card>

        <Card className="gap-3">
          <View>
            <Text variant="h2">{t('training.routine.days')}</Text>
            <Text variant="label" className="mt-0.5">
              {t('training.routine.daysHint')}
            </Text>
          </View>
          <View className="flex-row justify-between">
            {WEEK.map((d) => {
              const on = mine.has(d);
              const other = others.get(d);
              return (
                <Pressable
                  key={d}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={other && !on ? t('training.routine.dayTaken', { day: f.weekday(d, 'long'), name: other.name }) : f.weekday(d, 'long')}
                  onPress={() => toggleDay(d)}
                  className={`h-11 w-11 items-center justify-center rounded-full active:opacity-70 ${on ? 'bg-tint-strong' : 'bg-bg'}`}>
                  <Text className={`font-sans-semibold text-[15px] ${on ? 'text-accent-ink' : other ? 'text-ink-2' : 'text-ink'}`}>{f.weekday(d, 'narrow')}</Text>
                  {/* giorno di un'altra scheda: un puntino del suo colore */}
                  {other && !on ? (
                    <View className="absolute bottom-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: routineHex(other.color) }} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          {others.size > 0 && (
            <Text variant="label">
              {t('training.routine.othersDays', {
                list: [...others].map(([d, o]) => `${f.weekday(d)} ${o.name}`).join(', '),
              })}
            </Text>
          )}
        </Card>

        <Text variant="h2" className="mt-2">
          {items.length
            ? [t('training.exercises', { count: items.length }), minutes ? t('training.routine.estimate', { min: minutes }) : null].filter(Boolean).join(' · ')
            : t('training.catalog')}
        </Text>
        {items.length === 0 ? (
          <Text muted className="mx-1">
            {t('training.routine.empty')}
          </Text>
        ) : (
          <Card className="px-3 py-1.5">
            {items.map(({ item, exercise }, i) => {
              const muscle = (exercise.primaryMuscles as Muscle[])[0];
              const next = items[i + 1];
              return (
                <View key={item.id}>
                  <View className="gap-2 px-2 py-3">
                    <View className="flex-row items-center gap-1">
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push({ pathname: '/esercizio/[id]', params: { id: exercise.id } })}
                        className="flex-1 flex-row items-center gap-3 active:opacity-70">
                        <ExerciseTile bodyPart={exercise.bodyPart} />
                        <View className="flex-1">
                        <Text className="font-sans-semibold text-[15px]">{exercise.name}</Text>
                        {muscle ? <Text variant="label">{t(`training.muscles.${muscle}`)}</Text> : null}
                        </View>
                      </Pressable>
                      {i > 0 && <IconButton size={44} onCard icon="up" label={t('training.routine.moveUp', { name: exercise.name })} onPress={() => moveRoutineExercise(db, item.id, -1)} />}
                      {next && <IconButton size={44} onCard icon="down" label={t('training.routine.moveDown', { name: exercise.name })} onPress={() => moveRoutineExercise(db, item.id, 1)} />}
                      <IconButton size={44} onCard icon="close" label={t('training.session.removeExercise', { name: exercise.name })} onPress={() => removeRoutineExercise(db, item.id)} />
                    </View>
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Well className="flex-row items-center">
                        <Stepper icon="minus" label={t('training.routine.lessSets', { name: exercise.name })} onPress={() => setRoutineExerciseSets(db, item.id, item.sets - 1)} disabled={item.sets <= 1} />
                        <Text variant="num" className="min-w-16 text-center text-[15px]" accessibilityLiveRegion="polite">
                          {t('training.sets', { count: item.sets })}
                        </Text>
                        <Stepper icon="plus" label={t('training.routine.moreSets', { name: exercise.name })} onPress={() => setRoutineExerciseSets(db, item.id, item.sets + 1)} />
                      </Well>
                      <Text variant="label">×</Text>
                      <TargetFields item={item} kind={exercise.kind} name={exercise.name} />
                    </View>
                  </View>
                  {next && <SupersetLink linked={item.supersetGroup != null && item.supersetGroup === next.item.supersetGroup} a={exercise.name} b={next.exercise.name} onPress={(on) => linkRoutineExercise(db, item.id, on)} />}
                </View>
              );
            })}
          </Card>
        )}
        <Button variant="secondary" icon="plus" label={t('training.routine.addExercises')} onPress={() => router.push({ pathname: '/allenamento/esercizi', params: { routine: id } })} />
        <Button variant="danger" soft size="md" icon="trash" label={t('training.routine.delete')} onPress={remove} />
      </Screen>
    </AccentScope>
  );
}

/** Un'icona tra cui scegliere quella della scheda: scelta = tinta forte con bordo d'accento. */
function IconChoice({ icon, selected, onPress }: { icon: RoutineStyle['icon']; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t(`training.routine.icons.${icon}`)}
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center rounded-[14px] active:opacity-70 ${selected ? 'border-2 border-accent bg-tint-strong' : 'bg-bg'}`}>
      <Icon name={icon} color={selected ? theme.accentInk : theme.ink} size={24} />
    </Pressable>
  );
}

/** Un colore tra cui scegliere quello della scheda: scelto = spunta e anello. */
function ColorChoice({ color, selected, onPress }: { color: RoutineStyle['color']; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const hex = routineHex(color);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t(`training.routine.colors.${color}`)}
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-full active:opacity-70"
      style={{ borderWidth: 2, borderColor: selected ? hex : 'transparent' }}>
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: hex }}>
        {selected ? <Icon name="check" color="#FFFFFF" size={20} strokeWidth={2.4} /> : null}
      </View>
    </Pressable>
  );
}

function Stepper({ icon, label, onPress, disabled }: { icon: 'plus' | 'minus'; label: string; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center active:opacity-60 ${disabled ? 'opacity-40' : ''}`}>
      <Icon name={icon} color={theme.ink} size={20} />
    </Pressable>
  );
}

const parseCount = (s: string) => {
  const v = parseInt(s.replace(/\D/g, ''), 10);
  return Number.isFinite(v) ? v : null;
};

/**
 * Campo numerico che salva a ogni tasto (come il nome: niente modifiche perse se si tocca altro con il campo attivo).
 * Mentre si scrive mostra il testo scritto; fuori dal campo mostra il valore salvato, che il salvataggio può
 * correggere (un massimo uguale al minimo diventa "fisse": il campo si svuota).
 */
function CountInput({ value, onSave, label, placeholder }: { value: number | null; onSave: (v: number | null) => void; label: string; placeholder: string }) {
  const theme = useTheme();
  const [text, setText] = useState<string | null>(null);
  return (
    <TextInput
      value={text ?? (value == null ? '' : String(value))}
      onFocus={() => setText(value == null ? '' : String(value))}
      onChangeText={(v) => {
        setText(v);
        // Un campo vuoto si salva solo uscendo: cancellare per riscrivere non deve trasformare l'intervallo in fisse.
        const n = parseCount(v);
        if (n != null) onSave(n);
      }}
      onEndEditing={() => {
        if (text != null && parseCount(text) == null) onSave(null);
        setText(null);
      }}
      placeholder={placeholder}
      placeholderTextColor={theme.ink2}
      keyboardType="number-pad"
      returnKeyType="done"
      selectTextOnFocus
      maxLength={4}
      accessibilityLabel={label}
      className="h-11 w-11 text-center font-sans-semibold text-base tabular-nums text-ink"
    />
  );
}

/** Ripetizioni previste (minimo e, se è un intervallo, massimo) o secondi per gli esercizi a tempo. */
function TargetFields({ item, kind, name }: { item: { id: string; repsMin: number | null; repsMax: number | null; durationSec: number | null }; kind: Exercise['kind']; name: string }) {
  const { t } = useTranslation();
  if (kind === 'timed') {
    return (
      <Well className="flex-row items-center pr-3">
        <CountInput value={item.durationSec} placeholder="–" label={t('training.routine.secondsFor', { name })} onSave={(v) => setRoutineExerciseTarget(db, item.id, { durationSec: v })} />
        <Text variant="label">{t('training.session.seconds')}</Text>
      </Well>
    );
  }
  return (
    <Well className="flex-row items-center pr-3">
      <CountInput value={item.repsMin} placeholder={t('training.routine.minShort')} label={t('training.routine.repsMin', { name })} onSave={(v) => setRoutineExerciseTarget(db, item.id, { repsMin: v })} />
      <Text variant="label">-</Text>
      <CountInput value={item.repsMax} placeholder={t('training.routine.maxShort')} label={t('training.routine.repsMax', { name })} onSave={(v) => setRoutineExerciseTarget(db, item.id, { repsMax: v })} />
      <Text variant="label">{t('training.session.reps')}</Text>
    </Well>
  );
}

/**
 * Divisorio tra due esercizi che li collega in superserie (o li separa). Collegati, mostra "Superserie" in tinta.
 */
function SupersetLink({ linked, a, b, onPress }: { linked: boolean; a: string; b: string; onPress: (on: boolean) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: linked }}
      accessibilityLabel={linked ? t('training.routine.unlinkLabel', { a, b }) : t('training.routine.linkLabel', { a, b })}
      onPress={() => onPress(!linked)}
      className="h-11 flex-row items-center gap-2 px-2 active:opacity-60">
      <View className="h-px flex-1 bg-line" />
      <View className={`h-7 flex-row items-center gap-1.5 rounded-[14px] px-3 ${linked ? 'bg-tint' : ''}`}>
        <Icon name="link" size={16} color={linked ? theme.accentInk : theme.ink2} />
        <Text variant="label" className={linked ? 'font-sans-semibold text-accent-ink' : ''}>
          {linked ? t('training.routine.superset') : t('training.routine.link')}
        </Text>
      </View>
      <View className="h-px flex-1 bg-line" />
    </Pressable>
  );
}
