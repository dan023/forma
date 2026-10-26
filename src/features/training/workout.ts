import { and, asc, desc, eq, inArray, isNotNull, isNull, lt, max, ne, sql } from 'drizzle-orm';

import { exercises, routines, sets, workoutExercises, workouts } from '@/db/schema';
import type { Db } from '@/db/types';
import { toDayKey } from '@/lib/date';
import { uuid } from '@/lib/uuid';

import type { Exercise } from './exercises';
import { bestSet, e1rm, setVolume } from './stats';
import { normalizeSupersets } from './supersets';

export type Workout = typeof workouts.$inferSelect;
export type WorkoutSet = typeof sets.$inferSelect;
export type SetValues = Pick<WorkoutSet, 'weightKg' | 'reps' | 'durationSec'>;

// ---------- sessione in corso ----------

/** L'allenamento in corso (non finito), se c'è. Ce n'è al massimo uno. */
export const activeWorkoutQuery = (db: Db) =>
  db.select().from(workouts).where(isNull(workouts.finishedAt)).orderBy(desc(workouts.startedAt)).limit(1);

/** Inizia un allenamento libero; se ce n'è già uno in corso restituisce quello. */
export function startWorkout(db: Db, now = Date.now()): string {
  const active = activeWorkoutQuery(db).get();
  if (active) return active.id;
  const id = uuid();
  db.insert(workouts).values({ id, date: toDayKey(new Date(now)), startedAt: now }).run();
  return id;
}

/** Esercizi di un allenamento con i dati del catalogo, in ordine: per `useLiveQuery`. */
export const workoutExercisesQuery = (db: Db, workoutId: string) =>
  db
    .select({ item: workoutExercises, exercise: exercises })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.position));

/** Tutte le serie di un allenamento: per `useLiveQuery`. */
export const workoutSetsQuery = (db: Db, workoutId: string) =>
  db
    .select({ set: sets })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(sets.position));

export type SessionItem = { item: typeof workoutExercises.$inferSelect; exercise: Exercise };
export type SessionExercise = SessionItem & { sets: WorkoutSet[] };

/** Mette le serie sotto il loro esercizio. */
export function groupSession(items: SessionItem[], setRows: { set: WorkoutSet }[]): SessionExercise[] {
  return items.map((it) => ({ ...it, sets: setRows.map((r) => r.set).filter((s) => s.workoutExerciseId === it.item.id) }));
}

/**
 * Serie fatte l'ultima volta in un esercizio (l'allenamento finito più recente che lo contiene, escluso quello
 * indicato). Sono i suggerimenti mostrati nei campi vuoti della sessione.
 */
export function previousSets(db: Db, exerciseId: string, excludeWorkoutId?: string): WorkoutSet[] {
  const last = db
    .select({ we: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workoutExercises.exerciseId, exerciseId),
        isNotNull(workouts.finishedAt),
        excludeWorkoutId ? ne(workouts.id, excludeWorkoutId) : undefined,
      ),
    )
    .orderBy(desc(workouts.startedAt), desc(workoutExercises.position))
    .limit(1)
    .get();
  if (!last) return [];
  return db
    .select()
    .from(sets)
    .where(and(eq(sets.workoutExerciseId, last.we), isNotNull(sets.completedAt)))
    .orderBy(asc(sets.position))
    .all();
}

/** Aggiunge un esercizio in fondo alla sessione, con tante serie vuote quante l'ultima volta (almeno una). */
export function addExerciseToWorkout(db: Db, workoutId: string, exerciseId: string): string {
  const last = db.select({ p: max(workoutExercises.position) }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).get();
  const id = uuid();
  const count = Math.max(1, previousSets(db, exerciseId, workoutId).length);
  db.transaction((tx) => {
    tx.insert(workoutExercises).values({ id, workoutId, exerciseId, position: (last?.p ?? -1) + 1 }).run();
    tx.insert(sets)
      .values(Array.from({ length: count }, (_, position) => ({ workoutExerciseId: id, position })))
      .run();
  });
  return id;
}

/** Aggiunge una serie in fondo a un esercizio, con i valori della serie precedente come punto di partenza. */
export function addSet(db: Db, workoutExerciseId: string): string {
  const prev = db.select().from(sets).where(eq(sets.workoutExerciseId, workoutExerciseId)).orderBy(desc(sets.position)).limit(1).get();
  const id = uuid();
  db.insert(sets)
    .values({
      id,
      workoutExerciseId,
      position: (prev?.position ?? -1) + 1,
      weightKg: prev?.weightKg ?? null,
      reps: prev?.reps ?? null,
      durationSec: prev?.durationSec ?? null,
    })
    .run();
  return id;
}

export function updateSet(db: Db, setId: string, values: Partial<SetValues>) {
  db.update(sets).set(values).where(eq(sets.id, setId)).run();
}

/** Segna la serie come fatta, con i valori dati (quelli scritti o i suggerimenti accettati). */
export function completeSet(db: Db, setId: string, values: Partial<SetValues>, now = Date.now()) {
  db.update(sets).set({ ...values, completedAt: now }).where(eq(sets.id, setId)).run();
}

export function uncompleteSet(db: Db, setId: string) {
  db.update(sets).set({ completedAt: null }).where(eq(sets.id, setId)).run();
}

export function removeSet(db: Db, setId: string) {
  db.delete(sets).where(eq(sets.id, setId)).run();
}

/** Toglie un esercizio con le sue serie; se lascia da solo l'altro di una superserie, la superserie sparisce. */
export function removeWorkoutExercise(db: Db, workoutExerciseId: string) {
  const item = db.select().from(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId)).get();
  if (!item) return;
  db.transaction((tx) => {
    tx.delete(sets).where(eq(sets.workoutExerciseId, workoutExerciseId)).run();
    tx.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId)).run();
    const rest = tx.select().from(workoutExercises).where(eq(workoutExercises.workoutId, item.workoutId)).orderBy(asc(workoutExercises.position)).all();
    for (const it of normalizeSupersets(rest)) {
      tx.update(workoutExercises).set({ supersetGroup: it.supersetGroup }).where(eq(workoutExercises.id, it.id)).run();
    }
  });
}

/** Cancella un allenamento con esercizi e serie. */
export function discardWorkout(db: Db, workoutId: string) {
  db.transaction((tx) => {
    const ids = tx.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).all().map((r) => r.id);
    if (ids.length) tx.delete(sets).where(inArray(sets.workoutExerciseId, ids)).run();
    tx.delete(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).run();
    tx.delete(workouts).where(eq(workouts.id, workoutId)).run();
  });
}

/**
 * Chiude l'allenamento: toglie le serie non fatte e gli esercizi rimasti senza serie. Senza nessuna serie fatta
 * l'allenamento non si salva (restituisce `false`).
 */
export function finishWorkout(db: Db, workoutId: string, now = Date.now()): boolean {
  let saved = false;
  db.transaction((tx) => {
    const items = tx.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).all();
    const ids = items.map((r) => r.id);
    if (ids.length) tx.delete(sets).where(and(inArray(sets.workoutExerciseId, ids), isNull(sets.completedAt))).run();
    const kept = ids.length
      ? new Set(tx.selectDistinct({ id: sets.workoutExerciseId }).from(sets).where(inArray(sets.workoutExerciseId, ids)).all().map((r) => r.id))
      : new Set<string>();
    const empty = ids.filter((id) => !kept.has(id));
    if (empty.length) tx.delete(workoutExercises).where(inArray(workoutExercises.id, empty)).run();
    if (kept.size) {
      tx.update(workouts).set({ finishedAt: now }).where(eq(workouts.id, workoutId)).run();
      saved = true;
    } else {
      tx.delete(workouts).where(eq(workouts.id, workoutId)).run();
    }
  });
  return saved;
}

// ---------- storico e riepilogo ----------

/** Allenamenti finiti, dal più recente, con esercizi, serie, volume e lo stile della scheda (se c'è): per `useLiveQuery`. */
export const historyQuery = (db: Db, limit = 30) =>
  db
    .select({
      workout: workouts,
      icon: routines.icon,
      color: routines.color,
      exercises: sql<number>`count(distinct ${workoutExercises.id})`,
      sets: sql<number>`count(${sets.id})`,
      volume: sql<number>`coalesce(sum(coalesce(${sets.weightKg}, 0) * coalesce(${sets.reps}, 0)), 0)`,
    })
    .from(workouts)
    .leftJoin(routines, eq(workouts.routineId, routines.id))
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(isNotNull(workouts.finishedAt))
    .groupBy(workouts.id)
    .orderBy(desc(workouts.startedAt))
    .limit(limit);

/** Miglior 1RM stimato in un esercizio negli allenamenti finiti prima di un istante. */
function bestBefore(db: Db, exerciseId: string, before: number): number | null {
  const rows = db
    .select({ weightKg: sets.weightKg, reps: sets.reps })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(workoutExercises.exerciseId, exerciseId), isNotNull(workouts.finishedAt), lt(workouts.startedAt, before), isNotNull(sets.completedAt)))
    .all();
  const values = rows.map(e1rm).filter((v): v is number => v !== null);
  return values.length ? Math.max(...values) : null;
}

export type ExerciseSummary = SessionExercise & { best: WorkoutSet | null; e1rm: number | null; record: boolean };

/**
 * Riepilogo di un allenamento: per ogni esercizio la serie migliore e se è un record (1RM stimato più alto di
 * tutte le volte precedenti; la prima volta non conta come record), più volume e serie totali.
 */
export function workoutSummary(db: Db, workoutId: string) {
  const workout = db.select().from(workouts).where(eq(workouts.id, workoutId)).get();
  if (!workout) return null;
  const items = groupSession(workoutExercisesQuery(db, workoutId).all(), workoutSetsQuery(db, workoutId).all());
  const exercisesDone: ExerciseSummary[] = items.map((it) => {
    const done = it.sets.filter((s) => s.completedAt != null);
    const best = bestSet(done);
    const value = best ? e1rm(best) : null;
    const before = value !== null ? bestBefore(db, it.exercise.id, workout.startedAt ?? 0) : null;
    return { ...it, sets: done, best, e1rm: value, record: value !== null && before !== null && value > before };
  });
  const all = exercisesDone.flatMap((e) => e.sets);
  return {
    workout,
    exercises: exercisesDone,
    sets: all.length,
    volume: all.reduce((a, s) => a + setVolume(s), 0),
    records: exercisesDone.filter((e) => e.record).length,
  };
}

/** Le ultime volte in cui si è fatto un esercizio: data, serie fatte, 1RM stimato migliore. */
export function exerciseHistory(db: Db, exerciseId: string, limit = 5) {
  const rows = db
    .select({ workout: workouts, set: sets })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(workoutExercises.exerciseId, exerciseId), isNotNull(workouts.finishedAt), isNotNull(sets.completedAt)))
    .orderBy(desc(workouts.startedAt), asc(sets.position))
    .all();
  const byWorkout = new Map<string, { workout: Workout; sets: WorkoutSet[] }>();
  for (const r of rows) {
    const g = byWorkout.get(r.workout.id) ?? { workout: r.workout, sets: [] };
    g.sets.push(r.set);
    byWorkout.set(r.workout.id, g);
  }
  return [...byWorkout.values()].slice(0, limit).map((g) => ({ ...g, e1rm: e1rm(bestSet(g.sets) ?? { weightKg: null, reps: null }) }));
}
