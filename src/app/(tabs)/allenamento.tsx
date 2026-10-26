import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { AccentScope } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LinkRow, TintIcon } from "@/components/ui/link-row";
import { Screen } from "@/components/ui/screen";
import { Card } from "@/components/ui/surface";
import { Text } from "@/components/ui/text";
import { db } from "@/db/client";
import { estimateMinutes } from "@/features/training/estimate";
import { ExerciseTile } from "@/features/training/exercise-tile";
import { exerciseCount } from "@/features/training/exercises";
import { RoutineTile, routineHex } from "@/features/training/routine-tile";
import {
  createRoutine,
  routineEstimates,
  routineExercisesQuery,
  routineQuery,
  routinesQuery,
  startRoutineWorkout,
  trainedDaysQuery,
  weekPlanQuery,
  weekStart,
  weekdayOf,
  type RoutineStyle,
} from "@/features/training/routines";
import { clock, minutesBetween } from "@/features/training/stats";
import { useTrainingFormat } from "@/features/training/use-training-format";
import {
  activeWorkoutQuery,
  historyQuery,
  startWorkout,
  workoutExercisesQuery,
  workoutSetsQuery,
} from "@/features/training/workout";
import { useNow } from "@/hooks/use-now";
import { useTableVersion } from "@/hooks/use-table-version";
import { useTheme } from "@/hooks/use-theme";
import { addDays, toDayKey } from "@/lib/date";

const WEEK = [0, 1, 2, 3, 4, 5, 6];

/**
 * Allenamento: in alto cosa fare oggi (allenamento in corso, scheda del giorno o allenamento libero), poi la
 * settimana tipo, le schede, il catalogo esercizi e lo storico.
 */
export default function Allenamento() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const f = useTrainingFormat();
  const today = new Date();
  const todayKey = toDayKey(today);
  const todayIdx = weekdayOf(today);
  const monday = weekStart(today);

  const { data: active } = useLiveQuery(activeWorkoutQuery(db));
  const current = active[0];
  // Le query con join non si aggiornano da sole quando cambia l'altra tabella.
  const routinesVersion = useTableVersion("routines");
  const itemsVersion = useTableVersion("routine_exercises");
  const { data: plan } = useLiveQuery(weekPlanQuery(db), [routinesVersion]);
  const { data: list } = useLiveQuery(routinesQuery(db), [itemsVersion]);
  const { data: trained } = useLiveQuery(trainedDaysQuery(db, monday), [
    monday,
  ]);
  const { data: history } = useLiveQuery(historyQuery(db), [routinesVersion]);
  const todayPlan = plan.find((p) => p.weekday === todayIdx);
  const { data: todayItems } = useLiveQuery(
    routineExercisesQuery(db, todayPlan?.routineId ?? ""),
    [todayPlan?.routineId, itemsVersion],
  );
  const total = useMemo(() => exerciseCount(db), []);
  const trainedSet = new Set(trained.map((r) => r.date));
  const estimates = useMemo(
    () =>
      routineEstimates(
        db,
        list.map((r) => r.routine.id),
      ),
    // `itemsVersion`: serie, ripetizioni e superserie cambiano la stima senza cambiare l'elenco.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list, itemsVersion],
  );
  const todayMinutes = estimateMinutes(
    todayItems.map((r) => ({ ...r.item, kind: r.exercise.kind })),
  );
  // Zone del corpo della scheda di oggi, nell'ordine degli esercizi.
  const todayZones = [
    ...new Set(
      todayItems
        .map((r) => r.exercise.bodyPart)
        .filter((z): z is string => !!z),
    ),
  ];
  const zoneList = (zones: string[]) =>
    zones
      .map((z, i) => {
        const n = t(`training.bodyParts.${z}` as "training.bodyParts.chest");
        return i ? n.toLocaleLowerCase(i18n.language) : n;
      })
      .join(", ");

  const startFree = () => {
    startWorkout(db);
    router.push("/allenamento/sessione");
  };
  const startToday = () => {
    if (!todayPlan) return;
    startRoutineWorkout(db, todayPlan.routineId);
    router.push("/allenamento/sessione");
  };
  const newRoutine = () => {
    const id = createRoutine(
      db,
      t("training.routine.defaultNameN", { n: list.length + 1 }),
    );
    router.push({
      pathname: "/allenamento/scheda/[id]",
      params: { id, nuova: "1" },
    });
  };

  return (
    <Screen eyebrow={t("training.eyebrow")} title={t("training.title")}>
      {current ? (
        <ActiveCard workout={current} />
      ) : todayPlan ? (
        <AccentScope color={routineHex(todayPlan.color)}>
          <Card tint className="gap-4">
            <View className="flex-row items-center gap-3.5">
              <RoutineTile style={todayPlan} size="lg" onTint />
              <View className="flex-1">
                <Text variant="label" accent>
                  {t("training.today", { day: f.weekday(todayIdx, "long") })}
                </Text>
                <Text variant="h2" className="text-2xl">
                  {todayPlan.name}
                </Text>
                <Text muted>
                  {todayMinutes
                    ? t("training.todaySummary", {
                        count: todayItems.length,
                        min: todayMinutes,
                      })
                    : t("training.routine.empty")}
                </Text>
              </View>
            </View>
            {todayZones.length > 0 && (
              <View className="flex-row flex-wrap items-center gap-1.5">
                {todayZones.map((z) => (
                  <ExerciseTile key={z} bodyPart={z} size="sm" onTint />
                ))}
                <Text variant="label" accent className="ml-1.5 flex-1">
                  {zoneList(todayZones)}
                </Text>
              </View>
            )}
            <View className="gap-1">
              <Button
                label={t("training.routine.start")}
                onPress={startToday}
                disabled={todayItems.length === 0}
              />
              <Button
                variant="ghost"
                size="sm"
                label={t("training.freeWorkout")}
                onPress={startFree}
              />
            </View>
          </Card>
        </AccentScope>
      ) : (
        <Card tint className="gap-1">
          <Text variant="label" accent>
            {t("training.today", { day: f.weekday(todayIdx, "long") })}
          </Text>
          <Text variant="h2" className="text-2xl">
            {plan.length ? t("training.week.rest") : t("training.noPlan")}
          </Text>
          <Text muted>
            {plan.length ? t("training.restHint") : t("training.noPlanHint")}
          </Text>
          <Button
            className="mt-4"
            icon="plus"
            label={t("training.start")}
            onPress={startFree}
          />
        </Card>
      )}

      <Text variant="h2" className="mt-2">
        {t("training.week.title")}
      </Text>
      <Card className="flex-row px-2 py-3">
        {WEEK.map((d) => {
          const key = addDays(monday, d);
          const done = trainedSet.has(key);
          const isToday = key === todayKey;
          const dayPlan = plan.find((p) => p.weekday === d);
          const name = dayPlan?.name;
          return (
            <Pressable
              key={d}
              accessibilityRole="button"
              accessibilityLabel={[
                f.weekday(d, "long"),
                name ?? t("training.week.rest"),
                done ? t("training.week.done") : "",
              ]
                .filter(Boolean)
                .join(", ")}
              onPress={() =>
                router.push({
                  pathname: "/allenamento/giorno/[d]",
                  params: { d: String(d) },
                })
              }
              className="min-h-11 flex-1 items-center gap-1.5 px-1 active:opacity-70"
            >
              <Text
                variant="label"
                className={isToday ? "font-sans-bold text-accent-ink" : ""}
              >
                {f.weekday(d, "narrow")}
              </Text>
              <DayMark style={dayPlan} done={done} today={isToday} />
              <Text
                numberOfLines={1}
                className={`text-center text-[11px] ${name ? "font-sans-semibold text-ink" : "text-ink-2"}`}
              >
                {name ?? "–"}
              </Text>
            </Pressable>
          );
        })}
      </Card>

      <View className="mt-2 flex-row items-center justify-between">
        <Text variant="h2">{t("training.routine.title")}</Text>
        {list.length > 0 && (
          <Button
            variant="link"
            size="sm"
            icon="plus"
            label={t("training.routine.new")}
            onPress={newRoutine}
          />
        )}
      </View>
      {list.length === 0 ? (
        <Card className="gap-4">
          <Text muted>{t("training.routine.intro")}</Text>
          <Button
            variant="secondary"
            icon="plus"
            label={t("training.routine.new")}
            onPress={newRoutine}
          />
        </Card>
      ) : (
        <Card className="py-2">
          {list.map(({ routine, exercises }, i) => {
            const days = plan
              .filter((p) => p.routineId === routine.id)
              .map((p) => f.weekday(p.weekday));
            return (
              <LinkRow
                key={routine.id}
                first={i === 0}
                leading={<RoutineTile style={routine} />}
                title={routine.name}
                sub={[
                  days.length ? days.join(", ") : t("training.routine.noDays"),
                  t("training.exercises", { count: exercises }),
                  estimates.get(routine.id)
                    ? t("training.routine.estimate", {
                        min: estimates.get(routine.id),
                      })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                onPress={() =>
                  router.push({
                    pathname: "/allenamento/scheda/[id]",
                    params: { id: routine.id },
                  })
                }
              />
            );
          })}
        </Card>
      )}

      <Text variant="h2" className="mt-2">
        {t("training.catalog")}
      </Text>
      <Card className="py-2">
        <LinkRow
          first
          leading={<TintIcon name="search" />}
          title={t("training.catalogRow")}
          sub={t("training.catalogRowHint", {
            count: total,
            n: f.n(total, 0),
          })}
          onPress={() => router.push("/allenamento/esercizi")}
        />
      </Card>

      <Text variant="h2" className="mt-2">
        {t("training.history")}
      </Text>
      {history.length === 0 ? (
        <Text muted className="mx-1">
          {t("training.historyEmpty")}
        </Text>
      ) : (
        <Card className="py-2">
          {history.map(
            ({ workout, icon, color, exercises, sets, volume }, i) => (
              <LinkRow
                key={workout.id}
                first={i === 0}
                leading={
                  icon && color ? (
                    <RoutineTile style={{ icon, color }} size="sm" />
                  ) : (
                    <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-bg">
                      <Icon name="dumbbell" color={theme.ink2} size={18} />
                    </View>
                  )
                }
                title={
                  workout.name
                    ? `${workout.name} · ${f.day(workout.startedAt ?? 0)}`
                    : f.day(workout.startedAt ?? 0)
                }
                sub={[
                  f.duration(
                    minutesBetween(
                      workout.startedAt ?? 0,
                      workout.finishedAt ?? 0,
                    ),
                  ),
                  t("training.exercises", { count: exercises }),
                  t("training.sets", { count: sets }),
                ].join(" · ")}
                value={volume > 0 ? f.volume(volume) : undefined}
                onPress={() =>
                  router.push({
                    pathname: "/allenamento/riepilogo/[id]",
                    params: { id: workout.id },
                  })
                }
              />
            ),
          )}
        </Card>
      )}
    </Screen>
  );
}

/** Allenamento in corso: card tinta con tempo, esercizi e serie fatte. */
function ActiveCard({
  workout,
}: {
  workout: {
    id: string;
    name: string | null;
    routineId: string | null;
    startedAt: number | null;
  };
}) {
  const { t } = useTranslation();
  const { data: items } = useLiveQuery(workoutExercisesQuery(db, workout.id), [
    workout.id,
  ]);
  const { data: setRows } = useLiveQuery(workoutSetsQuery(db, workout.id), [
    workout.id,
  ]);
  const { data: routineRows } = useLiveQuery(
    routineQuery(db, workout.routineId ?? ""),
    [workout.routineId],
  );
  const routine = routineRows[0];
  const now = useNow(true);
  const done = setRows.filter((r) => r.set.completedAt != null).length;
  return (
    <AccentScope color={routine ? routineHex(routine.color) : null}>
      <Card tint className="gap-4">
        <View className="flex-row items-center gap-3.5">
          {routine ? <RoutineTile style={routine} size="lg" onTint /> : null}
          <View className="flex-1">
            <Text variant="label" accent>
              {t("training.active")}
            </Text>
            <Text variant="h2" className="text-2xl">
              {workout.name ?? t("training.freeWorkout")}
            </Text>
            <Text muted className="tabular-nums">
              {[
                clock((now - (workout.startedAt ?? now)) / 1000),
                t("training.exercises", { count: items.length }),
                t("training.session.progress", { done, total: setRows.length }),
              ].join(" · ")}
            </Text>
          </View>
        </View>
        <Button
          label={t("training.resume")}
          onPress={() => router.push("/allenamento/sessione")}
        />
      </Card>
    </AccentScope>
  );
}

/**
 * Segno del giorno nella settimana: l'icona della scheda sulla sua tinta; pieno del suo colore con la spunta se
 * ci si è allenati; un anello oggi. Riposo = cerchio vuoto.
 */
function DayMark({
  style,
  done,
  today,
}: {
  style?: RoutineStyle;
  done: boolean;
  today: boolean;
}) {
  const theme = useTheme();
  const color = style ? routineHex(style.color) : theme.accent;
  return (
    <View
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ borderWidth: 2, borderColor: today ? color : "transparent" }}
    >
      {done ? (
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          <Icon name="check" color="#FFFFFF" size={18} strokeWidth={2.4} />
        </View>
      ) : style ? (
        <View className="overflow-hidden rounded-full">
          <RoutineTile style={style} size="sm" />
        </View>
      ) : (
        <View className="h-9 w-9 rounded-full bg-bg" />
      )}
    </View>
  );
}
