import { and, asc, eq, gte, inArray, isNotNull, max, sql } from 'drizzle-orm';

import { exercises, ROUTINE_COLORS, routineDays, routineExercises, routines, sets, workoutExercises, workouts } from '@/db/schema';
import type { Db } from '@/db/types';
import { addDays, toDayKey } from '@/lib/date';
import { uuid } from '@/lib/uuid';

import { estimateMinutes } from './estimate';
import { linkWithNext, moveInList, normalizeSupersets, type Grouped } from './supersets';
import { activeWorkoutQuery } from './workout';

export type Routine = typeof routines.$inferSelect;
export type RoutineStyle = Pick<Routine, 'icon' | 'color'>;

/** Giorno della settimana con il lunedì = 0 (come `routine_days.weekday`). */
export const weekdayOf = (d: Date) => (d.getDay() + 6) % 7;

/** Chiave del lunedì della settimana che contiene `d`. */
export const weekStart = (d: Date) => addDays(toDayKey(d), -weekdayOf(d));

// ---------- elenco e settimana ----------

/** Schede in ordine di nome, con il numero di esercizi: per `useLiveQuery`. */
export const routinesQuery = (db: Db) =>
  db
    .select({ routine: routines, exercises: sql<number>`count(${routineExercises.id})` })
    .from(routines)
    .leftJoin(routineExercises, eq(routineExercises.routineId, routines.id))
    .groupBy(routines.id)
    .orderBy(asc(sql`${routines.name} collate nocase`));

/** Giorni assegnati, con il nome della scheda: per `useLiveQuery`. */
export const weekPlanQuery = (db: Db) =>
  db
    .select({ weekday: routineDays.weekday, routineId: routines.id, name: routines.name, icon: routines.icon, color: routines.color })
    .from(routineDays)
    .innerJoin(routines, eq(routineDays.routineId, routines.id))
    .orderBy(asc(routineDays.weekday));

/** Giorni (`YYYY-MM-DD`) con almeno un allenamento finito, da un giorno in poi: per `useLiveQuery`. */
export const trainedDaysQuery = (db: Db, from: string) =>
  db.selectDistinct({ date: workouts.date }).from(workouts).where(and(isNotNull(workouts.finishedAt), gte(workouts.date, from)));

/** La scheda di un giorno della settimana, se c'è. */
export const routineForWeekday = (db: Db, weekday: number) =>
  db
    .select({ routine: routines })
    .from(routineDays)
    .innerJoin(routines, eq(routineDays.routineId, routines.id))
    .where(eq(routineDays.weekday, weekday))
    .get()?.routine;

/**
 * Assegna una scheda a un giorno (null = riposo). Un giorno ha al massimo una scheda: assegnarne un'altra
 * sostituisce la precedente.
 */
export function setDayRoutine(db: Db, weekday: number, routineId: string | null) {
  if (routineId == null) {
    db.delete(routineDays).where(eq(routineDays.weekday, weekday)).run();
    return;
  }
  db.insert(routineDays)
    .values({ weekday, routineId })
    .onConflictDoUpdate({ target: routineDays.weekday, set: { routineId } })
    .run();
}

// ---------- una scheda ----------

export const routineQuery = (db: Db, id: string) => db.select().from(routines).where(eq(routines.id, id));

/** Esercizi di una scheda con i dati del catalogo, in ordine: per `useLiveQuery`. */
export const routineExercisesQuery = (db: Db, routineId: string) =>
  db
    .select({ item: routineExercises, exercise: exercises })
    .from(routineExercises)
    .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
    .where(eq(routineExercises.routineId, routineId))
    .orderBy(asc(routineExercises.position));

export const routineDaysQuery = (db: Db, routineId: string) =>
  db.select({ weekday: routineDays.weekday }).from(routineDays).where(eq(routineDays.routineId, routineId));

/** Crea una scheda; prende il primo colore non ancora usato da un'altra (finiti i colori, si ricomincia). */
export function createRoutine(db: Db, name: string): string {
  const used = db.select({ color: routines.color }).from(routines).all().map((r) => r.color);
  const color = ROUTINE_COLORS.find((c) => !used.includes(c)) ?? ROUTINE_COLORS[used.length % ROUTINE_COLORS.length];
  const id = uuid();
  db.insert(routines).values({ id, name: name.trim(), color }).run();
  return id;
}

export function setRoutineStyle(db: Db, id: string, style: Partial<RoutineStyle>) {
  if (style.icon || style.color) db.update(routines).set(style).where(eq(routines.id, id)).run();
}

export function renameRoutine(db: Db, id: string, name: string) {
  if (name.trim()) db.update(routines).set({ name: name.trim() }).where(eq(routines.id, id)).run();
}

/** Cancella una scheda; gli allenamenti fatti con quella restano nello storico. */
export function deleteRoutine(db: Db, id: string) {
  db.transaction((tx) => {
    tx.delete(routineExercises).where(eq(routineExercises.routineId, id)).run();
    tx.delete(routineDays).where(eq(routineDays.routineId, id)).run();
    tx.update(workouts).set({ routineId: null }).where(eq(workouts.routineId, id)).run();
    tx.delete(routines).where(eq(routines.id, id)).run();
  });
}

export type RoutineTarget = { repsMin: number | null; repsMax: number | null; durationSec: number | null };

/** Obiettivo di partenza di un esercizio aggiunto: 8-12 ripetizioni, 30 secondi per quelli a tempo. */
const DEFAULT_TARGET: RoutineTarget = { repsMin: 8, repsMax: 12, durationSec: null };
const DEFAULT_TIMED: RoutineTarget = { repsMin: null, repsMax: null, durationSec: 30 };

export function addExerciseToRoutine(db: Db, routineId: string, exerciseId: string, setCount = 3): string {
  const last = db.select({ p: max(routineExercises.position) }).from(routineExercises).where(eq(routineExercises.routineId, routineId)).get();
  const kind = db.select({ kind: exercises.kind }).from(exercises).where(eq(exercises.id, exerciseId)).get()?.kind;
  const id = uuid();
  db.insert(routineExercises)
    .values({ id, routineId, exerciseId, position: (last?.p ?? -1) + 1, sets: setCount, ...(kind === 'timed' ? DEFAULT_TIMED : DEFAULT_TARGET) })
    .run();
  return id;
}

export function setRoutineExerciseSets(db: Db, id: string, count: number) {
  db.update(routineExercises).set({ sets: Math.max(1, Math.min(20, Math.round(count))) }).where(eq(routineExercises.id, id)).run();
}

const clampInt = (v: number | null | undefined, min: number, maxV: number) =>
  v == null || !Number.isFinite(v) || v < min ? null : Math.min(maxV, Math.round(v));

/**
 * Ripetizioni (fisse o intervallo) o secondi previsti. Un massimo non più grande del minimo vale "fisse"; con il
 * solo massimo diventa fisso a quel numero.
 */
export function setRoutineExerciseTarget(db: Db, id: string, target: Partial<RoutineTarget>): RoutineTarget | undefined {
  const cur = db.select().from(routineExercises).where(eq(routineExercises.id, id)).get();
  if (!cur) return;
  let repsMin = clampInt(target.repsMin !== undefined ? target.repsMin : cur.repsMin, 1, 100);
  let repsMax = clampInt(target.repsMax !== undefined ? target.repsMax : cur.repsMax, 1, 100);
  if (repsMin == null && repsMax != null) [repsMin, repsMax] = [repsMax, null];
  if (repsMin != null && repsMax != null && repsMax <= repsMin) repsMax = null;
  const durationSec = clampInt(target.durationSec !== undefined ? target.durationSec : cur.durationSec, 1, 3600);
  db.update(routineExercises).set({ repsMin, repsMax, durationSec }).where(eq(routineExercises.id, id)).run();
  return { repsMin, repsMax, durationSec };
}

/** Riscrive posizioni e superserie di una scheda secondo l'elenco dato (in ordine). */
function writeOrder(db: Db, list: Grouped[]) {
  db.transaction((tx) => {
    list.forEach((it, position) =>
      tx.update(routineExercises).set({ position, supersetGroup: it.supersetGroup }).where(eq(routineExercises.id, it.id)).run(),
    );
  });
}

/** Elenco di una scheda (in ordine) e indice dell'esercizio indicato. */
function locate(db: Db, id: string) {
  const item = db.select().from(routineExercises).where(eq(routineExercises.id, id)).get();
  if (!item) return null;
  const list = routineExercisesQuery(db, item.routineId).all().map((r) => r.item);
  return { list, index: list.findIndex((r) => r.id === id) };
}

export function removeRoutineExercise(db: Db, id: string) {
  const found = locate(db, id);
  db.delete(routineExercises).where(eq(routineExercises.id, id)).run();
  if (found) writeOrder(db, normalizeSupersets(found.list.filter((r) => r.id !== id)));
}

/** Schede che contengono un esercizio (una riga per volta in cui compare): per `useLiveQuery`. */
export const routinesWithExerciseQuery = (db: Db, exerciseId: string) =>
  db.select({ routineId: routineExercises.routineId }).from(routineExercises).where(eq(routineExercises.exerciseId, exerciseId));

export type RoutineItem = typeof routineExercises.$inferSelect;

/** Una riga di una scheda così com'è ora (per ricordarla appena aggiunta). */
export const routineItem = (db: Db, id: string): RoutineItem | undefined =>
  db.select().from(routineExercises).where(eq(routineExercises.id, id)).get();

/** Se una riga c'è ancora ed è come allora: stesse serie, ripetizioni, secondi, superserie e posizione. */
export function isUntouched(db: Db, before: RoutineItem): boolean {
  const now = routineItem(db, before.id);
  if (!now) return false;
  const keys = ['sets', 'repsMin', 'repsMax', 'durationSec', 'supersetGroup', 'position'] as const;
  return keys.every((k) => now[k] === before[k]);
}

/**
 * Toglie una riga appena aggiunta, solo se nessuno l'ha cambiata (vedi `isUntouched`). Restituisce se l'ha tolta.
 * Serve ad annullare un'aggiunta per sbaglio: quello che si è sistemato nella scheda si toglie dalla scheda.
 */
export function undoAddToRoutine(db: Db, before: RoutineItem): boolean {
  if (!isUntouched(db, before)) return false;
  removeRoutineExercise(db, before.id);
  return true;
}

/**
 * Sposta un esercizio di un posto (-1 su, +1 giù). Dentro una superserie scambia con il vicino; fuori scavalca
 * l'intera superserie vicina (vedi `moveInList`).
 */
export function moveRoutineExercise(db: Db, id: string, dir: -1 | 1) {
  const found = locate(db, id);
  const next = found && moveInList(found.list, found.index, dir);
  if (next) writeOrder(db, next);
}

/** Mette in superserie (`on`) un esercizio con il successivo, o li separa. */
export function linkRoutineExercise(db: Db, id: string, on: boolean) {
  const found = locate(db, id);
  if (found) writeOrder(db, linkWithNext(found.list, found.index, on));
}

/**
 * Inizia un allenamento da una scheda: nome della scheda, i suoi esercizi in ordine con superserie e obiettivo,
 * ognuno con le serie previste (vuote: i valori dell'ultima volta restano i suggerimenti). Se c'è già un allenamento in corso restituisce quello.
 */
export function startRoutineWorkout(db: Db, routineId: string, now = Date.now()): string {
  const active = activeWorkoutQuery(db).get();
  if (active) return active.id;
  const routine = routineQuery(db, routineId).get();
  const items = routineExercisesQuery(db, routineId).all();
  const id = uuid();
  db.transaction((tx) => {
    tx.insert(workouts).values({ id, date: toDayKey(new Date(now)), name: routine?.name ?? null, routineId, startedAt: now }).run();
    items.forEach(({ item }, position) => {
      const weId = uuid();
      tx.insert(workoutExercises)
        .values({
          id: weId,
          workoutId: id,
          exerciseId: item.exerciseId,
          position,
          supersetGroup: item.supersetGroup,
          targetRepsMin: item.repsMin,
          targetRepsMax: item.repsMax,
          targetSec: item.durationSec,
        })
        .run();
      tx.insert(sets)
        .values(Array.from({ length: Math.max(1, item.sets) }, (_, p) => ({ workoutExerciseId: weId, position: p })))
        .run();
    });
  });
  return id;
}

/** Nomi degli esercizi di più schede, in ordine: per le righe dell'elenco. */
export function routineExerciseNames(db: Db, routineIds: string[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  if (!routineIds.length) return out;
  const rows = db
    .select({ routineId: routineExercises.routineId, name: exercises.name })
    .from(routineExercises)
    .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
    .where(inArray(routineExercises.routineId, routineIds))
    .orderBy(asc(routineExercises.position))
    .all();
  for (const r of rows) out.set(r.routineId, [...(out.get(r.routineId) ?? []), r.name]);
  return out;
}

/** Minuti stimati di più schede (vedi `estimateMinutes`): per le righe dell'elenco. */
export function routineEstimates(db: Db, routineIds: string[]): Map<string, number | null> {
  const out = new Map<string, number | null>();
  if (!routineIds.length) return out;
  const rows = db
    .select({ item: routineExercises, kind: exercises.kind })
    .from(routineExercises)
    .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
    .where(inArray(routineExercises.routineId, routineIds))
    .orderBy(asc(routineExercises.position))
    .all();
  for (const id of routineIds) {
    out.set(id, estimateMinutes(rows.filter((r) => r.item.routineId === id).map((r) => ({ ...r.item, kind: r.kind }))));
  }
  return out;
}

/** La scheda da cui è partito un allenamento, se c'è ancora. */
export const routineOfWorkout = (db: Db, workoutId: string) =>
  db.select({ routine: routines }).from(workouts).innerJoin(routines, eq(workouts.routineId, routines.id)).where(eq(workouts.id, workoutId)).get()?.routine;
