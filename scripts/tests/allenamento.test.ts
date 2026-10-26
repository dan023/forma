import { Database } from 'bun:sqlite';
import { beforeAll, describe, expect, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { join } from 'node:path';

import type { CatalogExercise, ExerciseCatalogMeta } from '../../src/db/catalog-exercise';
import * as schema from '../../src/db/schema';
import { seedExercises } from '../../src/db/seed-exercises';
import { equipmentIn, exerciseCount, getExercise, searchExercises } from '../../src/features/training/exercises';
import {
  addExerciseToRoutine,
  createRoutine,
  deleteRoutine,
  linkRoutineExercise,
  moveRoutineExercise,
  removeRoutineExercise,
  restoreRoutineExercise,
  routineItem,
  routinesWithExerciseQuery,
  undoAddToRoutine,
  routineDaysQuery,
  routineExercisesQuery,
  routineForWeekday,
  routinesQuery,
  setDayRoutine,
  setRoutineExerciseSets,
  setRoutineExerciseTarget,
  setRoutineStyle,
  routineEstimates,
  routineOfWorkout,
  startRoutineWorkout,
  weekPlanQuery,
  weekStart,
  weekdayOf,
} from '../../src/features/training/routines';
import { RoutineColors } from '../../src/constants/theme';
import { estimateMinutes, type EstimateItem } from '../../src/features/training/estimate';
import { clock, e1rm } from '../../src/features/training/stats';
import { linkWithNext, moveInList, restAfterSet, supersetBlocks, type Grouped } from '../../src/features/training/supersets';
import {
  activeWorkoutQuery,
  addExerciseToWorkout,
  addSet,
  completeSet,
  discardWorkout,
  exerciseHistory,
  finishWorkout,
  groupSession,
  historyQuery,
  previousSets,
  removeWorkoutExercise,
  startWorkout,
  workoutExercisesQuery,
  workoutSetsQuery,
  workoutSummary,
} from '../../src/features/training/workout';

const ROOT = join(import.meta.dir, '..', '..');
const db = drizzle(new Database(':memory:'), { schema });
const names = (q: string, opts = {}) => searchExercises(db, q, opts).map((e) => e.name);
const BENCH = 'ex:0025'; // Barbell bench press
const PULLUP = 'ex:0652'; // Pull-up
const SQUAT = 'ex:0043'; // Barbell full squat
const CURL = 'ex:0294'; // Dumbbell biceps curl
const PLANK = 'ex:0464'; // Front plank with twist (a tempo)
const session = (id: string) => groupSession(workoutExercisesQuery(db, id).all(), workoutSetsQuery(db, id).all());

const MIN = 60_000;
const DAY = 24 * 60 * MIN;
const T0 = new Date(2026, 9, 19, 18, 0).getTime();

beforeAll(() => {
  migrate(db, { migrationsFolder: join(ROOT, 'drizzle') });
  const meta: ExerciseCatalogMeta = require(join(ROOT, 'assets/data/exercises.meta.json'));
  seedExercises(db, meta, () => require(join(ROOT, 'assets/data/exercises.json')) as CatalogExercise[]);
});

describe('catalogo esercizi', () => {
  test('importa tutto una volta sola', () => {
    const meta: ExerciseCatalogMeta = require(join(ROOT, 'assets/data/exercises.meta.json'));
    expect(exerciseCount(db)).toBe(meta.count);
    expect(seedExercises(db, meta, () => [])).toBe(false); // stessa versione: non ricarica
  });
  test('ricerca in inglese, parole in qualsiasi ordine', () => {
    expect(names('bench press')[0]).toBe('Barbell bench press');
    expect(names('press bench')).toContain('Barbell bench press');
    expect(names('pull-up')).toContain('Pull-up');
  });
  test('ricerca in italiano con sinonimi, muscoli e attrezzi', () => {
    expect(names('panca bilanciere')).toContain('Barbell bench press');
    expect(names('trazioni')).toContain('Pull-up');
    expect(names('alzate laterali manubri')).toContain('Dumbbell lateral raise');
    expect(names('petto').length).toBeGreaterThan(20);
    expect(names('multipower squat').every((n) => /smith/i.test(n))).toBe(true);
  });
  test('filtro per zona e nessun risultato', () => {
    const chest = searchExercises(db, '', { bodyPart: 'chest', limit: 500 });
    expect(chest.length).toBeGreaterThan(100);
    expect(chest.every((e) => e.bodyPart === 'chest')).toBe(true);
    expect(names('zzzz')).toEqual([]);
  });
  test('filtro per attrezzo, anche insieme a zona e testo', () => {
    const db2 = searchExercises(db, '', { bodyPart: 'chest', equipment: 'dumbbell' });
    expect(db2.length).toBeGreaterThan(10);
    expect(db2.every((e) => e.bodyPart === 'chest' && e.equipment === 'dumbbell')).toBe(true);
    expect(searchExercises(db, 'press', { equipment: 'barbell' }).every((e) => e.equipment === 'barbell')).toBe(true);
    expect(equipmentIn(db)).toContain('barbell');
    expect(equipmentIn(db, 'cardio')).not.toContain('ezBar');
  });
  test('senza filtri e senza testo elenca tutto il catalogo', () => {
    expect(searchExercises(db, '').length).toBe(exerciseCount(db));
  });
  test('istruzioni in italiano e inglese', () => {
    const e = getExercise(db, BENCH)!;
    expect(e.instructions!.it.length).toBeGreaterThan(2);
    expect(e.instructions!.en.length).toBe(e.instructions!.it.length);
  });
});

describe('allenamento libero', () => {
  let first = '';
  test('si inizia una volta sola: un secondo "inizia" riprende quello in corso', () => {
    first = startWorkout(db, T0);
    expect(startWorkout(db, T0 + MIN)).toBe(first);
    expect(activeWorkoutQuery(db).get()?.id).toBe(first);
  });
  test('un esercizio nuovo parte con una serie vuota', () => {
    addExerciseToWorkout(db, first, BENCH);
    const [bench] = session(first);
    expect(bench.exercise.name).toBe('Barbell bench press');
    expect(bench.sets).toHaveLength(1);
    expect(bench.sets[0].weightKg).toBeNull();
  });
  test('una serie aggiunta copia i valori della precedente', () => {
    const [bench] = session(first);
    completeSet(db, bench.sets[0].id, { weightKg: 60, reps: 10 }, T0 + 5 * MIN);
    addSet(db, bench.item.id);
    const sets = session(first)[0].sets;
    expect(sets).toHaveLength(2);
    expect([sets[1].weightKg, sets[1].reps, sets[1].completedAt]).toEqual([60, 10, null]);
    completeSet(db, sets[1].id, { weightKg: 70, reps: 8 }, T0 + 8 * MIN);
    addSet(db, bench.item.id); // terza serie lasciata da fare
  });
  test('alla fine le serie non fatte e gli esercizi vuoti spariscono', () => {
    addExerciseToWorkout(db, first, PULLUP); // nessuna serie fatta
    expect(finishWorkout(db, first, T0 + 45 * MIN)).toBe(true);
    const s = session(first);
    expect(s.map((e) => e.exercise.id)).toEqual([BENCH]);
    expect(s[0].sets.map((x) => [x.weightKg, x.reps])).toEqual([[60, 10], [70, 8]]);
    expect(activeWorkoutQuery(db).get()).toBeUndefined();
  });
  test('la volta dopo propone tante serie quante l\'ultima volta, con i valori come suggerimento', () => {
    const second = startWorkout(db, T0 + 2 * DAY);
    expect(second).not.toBe(first);
    addExerciseToWorkout(db, second, BENCH);
    expect(session(second)[0].sets).toHaveLength(2);
    expect(previousSets(db, BENCH, second).map((x) => [x.weightKg, x.reps])).toEqual([[60, 10], [70, 8]]);
    const [a, b] = session(second)[0].sets;
    completeSet(db, a.id, { weightKg: 70, reps: 8 }, T0 + 2 * DAY + 5 * MIN);
    completeSet(db, b.id, { weightKg: 75, reps: 6 }, T0 + 2 * DAY + 9 * MIN); // 1RM 90 > 88,7 di prima
    expect(finishWorkout(db, second, T0 + 2 * DAY + 50 * MIN)).toBe(true);

    const sum = workoutSummary(db, second)!;
    expect(sum.sets).toBe(2);
    expect(sum.volume).toBe(70 * 8 + 75 * 6);
    expect(sum.records).toBe(1);
    expect(sum.exercises[0].e1rm).toBe(90);
    // il primo allenamento non ha record: era la prima volta
    expect(workoutSummary(db, first)!.records).toBe(0);
  });
  test('senza serie fatte l\'allenamento non si salva; annullare cancella tutto', () => {
    const empty = startWorkout(db, T0 + 3 * DAY);
    addExerciseToWorkout(db, empty, PULLUP);
    expect(finishWorkout(db, empty, T0 + 3 * DAY + MIN)).toBe(false);
    expect(workoutSummary(db, empty)).toBeNull();

    const gone = startWorkout(db, T0 + 4 * DAY);
    const item = addExerciseToWorkout(db, gone, PULLUP);
    removeWorkoutExercise(db, item);
    expect(session(gone)).toEqual([]);
    discardWorkout(db, gone);
    expect(activeWorkoutQuery(db).get()).toBeUndefined();
  });
  test('storico e ultime volte di un esercizio', () => {
    const h = historyQuery(db).all();
    expect(h).toHaveLength(2);
    expect(h[0].workout.startedAt).toBe(T0 + 2 * DAY); // il più recente prima
    expect([h[0].exercises, h[0].sets, h[0].volume]).toEqual([1, 2, 70 * 8 + 75 * 6]);
    const ex = exerciseHistory(db, BENCH);
    expect(ex.map((x) => x.sets.length)).toEqual([2, 2]);
    expect(ex[0].e1rm).toBe(90);
  });
});

describe('schede e settimana', () => {
  test('una scheda tiene gli esercizi in ordine, con le serie previste', () => {
    const r = createRoutine(db, '  Push A ');
    const a = addExerciseToRoutine(db, r, BENCH, 4);
    addExerciseToRoutine(db, r, PULLUP);
    expect(routineExercisesQuery(db, r).all().map((x) => [x.exercise.id, x.item.sets])).toEqual([[BENCH, 4], [PULLUP, 3]]);
    moveRoutineExercise(db, a, 1);
    expect(routineExercisesQuery(db, r).all().map((x) => x.exercise.id)).toEqual([PULLUP, BENCH]);
    moveRoutineExercise(db, a, 1); // già ultimo: niente
    expect(routineExercisesQuery(db, r).all().map((x) => x.exercise.id)).toEqual([PULLUP, BENCH]);
    setRoutineExerciseSets(db, a, 0);
    expect(routineExercisesQuery(db, r).all()[1].item.sets).toBe(1);
    expect(routinesQuery(db).all().find((x) => x.routine.id === r)).toMatchObject({ routine: { name: 'Push A' }, exercises: 2 });
    deleteRoutine(db, r);
  });
  test('un giorno ha una sola scheda; riposo = nessuna', () => {
    const a = createRoutine(db, 'A');
    const b = createRoutine(db, 'B');
    setDayRoutine(db, 0, a);
    setDayRoutine(db, 3, a);
    setDayRoutine(db, 0, b); // lunedì passa a B
    expect(weekPlanQuery(db).all().map((p) => [p.weekday, p.name])).toEqual([[0, 'B'], [3, 'A']]);
    expect(routineDaysQuery(db, a).all().map((d) => d.weekday)).toEqual([3]);
    expect(routineForWeekday(db, 3)?.name).toBe('A');
    setDayRoutine(db, 3, null);
    expect(routineForWeekday(db, 3)).toBeUndefined();
    deleteRoutine(db, b); // via anche dai giorni
    expect(weekPlanQuery(db).all()).toEqual([]);
    deleteRoutine(db, a);
  });
  test('iniziare da una scheda prepara esercizi e serie vuote; cancellarla non tocca lo storico', () => {
    const r = createRoutine(db, 'Pull A');
    addExerciseToRoutine(db, r, PULLUP, 2);
    addExerciseToRoutine(db, r, BENCH, 3);
    const w = startRoutineWorkout(db, r, T0 + 30 * DAY);
    expect(startRoutineWorkout(db, r)).toBe(w); // uno alla volta
    expect(activeWorkoutQuery(db).get()).toMatchObject({ id: w, name: 'Pull A', routineId: r });
    const s = session(w);
    expect(s.map((x) => [x.exercise.id, x.sets.length])).toEqual([[PULLUP, 2], [BENCH, 3]]);
    expect(s.every((x) => x.sets.every((set) => set.completedAt == null && set.reps == null))).toBe(true);
    completeSet(db, s[0].sets[0].id, { reps: 8 });
    finishWorkout(db, w, T0 + 30 * DAY + 40 * MIN);
    deleteRoutine(db, r);
    expect(workoutSummary(db, w)?.workout).toMatchObject({ name: 'Pull A', routineId: null });
  });
  test('ripetizioni previste: intervallo, fisse o secondi', () => {
    const r = createRoutine(db, 'Reps');
    const a = addExerciseToRoutine(db, r, BENCH);
    const p = addExerciseToRoutine(db, r, PLANK);
    const target = () => routineExercisesQuery(db, r).all().map((x) => [x.item.repsMin, x.item.repsMax, x.item.durationSec]);
    expect(target()).toEqual([[8, 12, null], [null, null, 30]]); // valori di partenza
    setRoutineExerciseTarget(db, a, { repsMin: 5, repsMax: 5 }); // massimo = minimo: fisse
    setRoutineExerciseTarget(db, p, { durationSec: 45 });
    expect(target()).toEqual([[5, null, null], [null, null, 45]]);
    setRoutineExerciseTarget(db, a, { repsMax: 10 });
    expect(target()[0]).toEqual([5, 10, null]);
    setRoutineExerciseTarget(db, a, { repsMin: null }); // solo il massimo: diventa fisso
    expect(target()[0]).toEqual([10, null, null]);
    setRoutineExerciseTarget(db, a, { repsMin: 0 }); // non valido = da decidere
    expect(target()[0]).toEqual([null, null, null]);
    deleteRoutine(db, r);
  });
  test('superserie nella scheda: collegare, spostare, togliere', () => {
    const r = createRoutine(db, 'Superserie');
    const [a, b, c, d] = [BENCH, PULLUP, SQUAT, CURL].map((e) => addExerciseToRoutine(db, r, e));
    const state = () => routineExercisesQuery(db, r).all().map((x) => [x.exercise.id, x.item.supersetGroup]);
    linkRoutineExercise(db, a, true);
    linkRoutineExercise(db, b, true); // tre in fila
    expect(state()).toEqual([[BENCH, 1], [PULLUP, 1], [SQUAT, 1], [CURL, null]]);
    linkRoutineExercise(db, a, false); // via il primo
    expect(state()).toEqual([[BENCH, null], [PULLUP, 1], [SQUAT, 1], [CURL, null]]);
    moveRoutineExercise(db, d, -1); // scavalca tutta la superserie
    expect(state()).toEqual([[BENCH, null], [CURL, null], [PULLUP, 1], [SQUAT, 1]]);
    moveRoutineExercise(db, c, -1); // dentro la superserie: scambio
    expect(state()).toEqual([[BENCH, null], [CURL, null], [SQUAT, 1], [PULLUP, 1]]);
    removeRoutineExercise(db, c); // resta da solo: niente superserie
    expect(state()).toEqual([[BENCH, null], [CURL, null], [PULLUP, null]]);
    expect(routineExercisesQuery(db, r).all().map((x) => x.item.position)).toEqual([0, 1, 2]);
    deleteRoutine(db, r);
  });
  test('"Annulla" rimette un esercizio tolto: posto, serie, obiettivo e superserie', () => {
    const r = createRoutine(db, 'Annulla');
    const [a, b] = [BENCH, PULLUP, SQUAT].map((e) => addExerciseToRoutine(db, r, e));
    setRoutineExerciseSets(db, b, 5);
    setRoutineExerciseTarget(db, b, { repsMin: 6, repsMax: 8 });
    linkRoutineExercise(db, a, true); // panca + trazioni
    const state = () => routineExercisesQuery(db, r).all().map((x) => [x.exercise.id, x.item.supersetGroup, x.item.sets, x.item.repsMin]);
    const before = state();
    const removed = removeRoutineExercise(db, b)!;
    expect(state()).toEqual([[BENCH, null, 3, 8], [SQUAT, null, 3, 8]]); // superserie rimasta da sola: sparita
    restoreRoutineExercise(db, removed);
    expect(state()).toEqual(before);
    // tolto, poi aggiunto un altro esercizio: torna al suo posto, il nuovo resta in fondo
    const again = removeRoutineExercise(db, b)!;
    addExerciseToRoutine(db, r, CURL);
    restoreRoutineExercise(db, again);
    expect(state().map((x) => x[0])).toEqual([BENCH, PULLUP, SQUAT, CURL]);
    expect(state()[0][1]).toBe(state()[1][1]);
    deleteRoutine(db, r);
  });
  test('l\'allenamento da una scheda copia superserie e obiettivi', () => {
    const r = createRoutine(db, 'Copia');
    const a = addExerciseToRoutine(db, r, BENCH, 2);
    addExerciseToRoutine(db, r, PULLUP, 2);
    setRoutineExerciseTarget(db, a, { repsMin: 6, repsMax: 8 });
    linkRoutineExercise(db, a, true);
    const w = startRoutineWorkout(db, r, T0 + 40 * DAY);
    expect(session(w).map((x) => [x.item.supersetGroup, x.item.targetRepsMin, x.item.targetRepsMax])).toEqual([[1, 6, 8], [1, 8, 12]]);
    removeWorkoutExercise(db, session(w)[1].item.id);
    expect(session(w)[0].item.supersetGroup).toBeNull();
    discardWorkout(db, w);
    deleteRoutine(db, r);
  });
  test('icona e colore: ogni scheda nuova prende un colore libero; lo stile arriva a settimana e storico', () => {
    expect(Object.keys(RoutineColors).sort()).toEqual([...schema.ROUTINE_COLORS].sort());
    const ids = ['A', 'B', 'C'].map((n) => createRoutine(db, n));
    const style = () => routinesQuery(db).all().filter((r) => ids.includes(r.routine.id)).map((r) => [r.routine.icon, r.routine.color]);
    expect(style()).toEqual([['dumbbell', 'corallo'], ['dumbbell', 'lampone'], ['dumbbell', 'fucsia']]);
    setRoutineStyle(db, ids[0], { icon: 'kettlebell', color: 'viola' });
    expect(style()[0]).toEqual(['kettlebell', 'viola']);
    setDayRoutine(db, 2, ids[0]);
    expect(weekPlanQuery(db).all()).toEqual([{ weekday: 2, routineId: ids[0], name: 'A', icon: 'kettlebell', color: 'viola' }]);
    addExerciseToRoutine(db, ids[0], BENCH, 1);
    const w = startRoutineWorkout(db, ids[0], T0 + 50 * DAY);
    completeSet(db, session(w)[0].sets[0].id, { weightKg: 50, reps: 5 });
    finishWorkout(db, w, T0 + 50 * DAY + 30 * MIN);
    expect(routineOfWorkout(db, w)?.color).toBe('viola');
    expect(historyQuery(db).all().find((h) => h.workout.id === w)).toMatchObject({ icon: 'kettlebell', color: 'viola' });
    ids.forEach((id) => deleteRoutine(db, id));
    expect(historyQuery(db).all().find((h) => h.workout.id === w)).toMatchObject({ icon: null, color: null });
  });
  test('dalla scheda dell\'esercizio: si aggiunge; si toglie solo un\'aggiunta appena fatta e non toccata', () => {
    const a = createRoutine(db, 'A');
    const b = createRoutine(db, 'B');
    const inRoutines = () => routinesWithExerciseQuery(db, BENCH).all().map((r) => r.routineId).filter((id) => [a, b].includes(id));
    expect(inRoutines()).toEqual([]);
    addExerciseToRoutine(db, a, PULLUP);
    const added = routineItem(db, addExerciseToRoutine(db, a, BENCH))!;
    const other = routineItem(db, addExerciseToRoutine(db, b, BENCH))!;
    expect(inRoutines().sort()).toEqual([a, b].sort());
    // A: appena aggiunta e non toccata, si toglie
    expect(undoAddToRoutine(db, added)).toBe(true);
    expect(inRoutines()).toEqual([b]);
    expect(undoAddToRoutine(db, added)).toBe(false); // non c'è più
    // B: cambiate le ripetizioni (o le serie, la superserie, la posizione), resta
    setRoutineExerciseTarget(db, other.id, { repsMin: 5 });
    expect(undoAddToRoutine(db, other)).toBe(false);
    expect(inRoutines()).toEqual([b]);
    deleteRoutine(db, a);
    deleteRoutine(db, b);
  });
  test('durata stimata di una scheda', () => {
    const r = createRoutine(db, 'Stima');
    expect(routineEstimates(db, [r]).get(r)).toBeNull(); // vuota
    const a = addExerciseToRoutine(db, r, BENCH, 3);
    addExerciseToRoutine(db, r, PULLUP, 3);
    const solo = routineEstimates(db, [r]).get(r)!;
    linkRoutineExercise(db, a, true); // in superserie: meno recuperi
    expect(routineEstimates(db, [r]).get(r)!).toBeLessThan(solo);
    deleteRoutine(db, r);
  });
  test('giorni della settimana dal lunedì', () => {
    expect(weekdayOf(new Date(2026, 9, 19))).toBe(0); // lunedì 19 ottobre 2026
    expect(weekdayOf(new Date(2026, 9, 25))).toBe(6);
    expect(weekStart(new Date(2026, 9, 25))).toBe('2026-10-19');
  });
});

describe('superserie (logica pura)', () => {
  const list = (groups: (number | null)[]): Grouped[] => groups.map((g, i) => ({ id: 'abcdef'[i], supersetGroup: g }));
  const show = (l: Grouped[] | null) => l?.map((it) => `${it.id}${it.supersetGroup ?? ''}`).join(' ');
  test('collegare unisce i blocchi, separare li divide', () => {
    expect(show(linkWithNext(list([null, 7, 7, null]), 0, true))).toBe('a1 b1 c1 d');
    expect(show(linkWithNext(list([1, 1, 1, 1]), 1, false))).toBe('a1 b1 c2 d2');
    expect(show(linkWithNext(list([1, 1, null]), 2, true))).toBe('a1 b1 c'); // l'ultimo non ha un successivo
  });
  test('spostare scavalca una superserie intera e ne fa uscire chi va fuori', () => {
    expect(show(moveInList(list([null, 1, 1]), 0, 1))).toBe('b1 c1 a');
    expect(show(moveInList(list([1, 1, null]), 1, 1))).toBe('a c b'); // b esce: a resta da solo
    expect(show(moveInList(list([1, 1, 1]), 2, -1))).toBe('a1 c1 b1');
    expect(moveInList(list([null, null]), 0, -1)).toBeNull();
  });
  test('blocchi e recupero: in superserie si recupera dopo l\'ultimo esercizio del giro', () => {
    expect(supersetBlocks(list([null, 1, 1, null]), (it) => it.supersetGroup).map((b) => b.length)).toEqual([1, 2, 1]);
    const sets = (...done: boolean[]) => ({ sets: done.map((d) => ({ completedAt: d ? 1 : null })) });
    const block = [sets(true, false, false), sets(false, false)];
    expect(restAfterSet(block, 0, 0)).toBe(false); // ora tocca al secondo esercizio
    expect(restAfterSet(block, 1, 0)).toBe(true);
    expect(restAfterSet(block, 0, 2)).toBe(true); // il secondo non ha una terza serie
    expect(restAfterSet([sets(true)], 0, 0)).toBe(true);
  });
});

describe('calcoli', () => {
  test('stima della durata: serie, recuperi, superserie e cambi', () => {
    const ex = (sets: number, more: Partial<EstimateItem> = {}): EstimateItem => ({ sets, repsMin: 10, repsMax: null, durationSec: null, supersetGroup: null, kind: 'weight', ...more });
    expect(estimateMinutes([])).toBeNull();
    // 3 serie da 10 (60 s l'una) + 2 recuperi da 2 min = 7 min → 5
    expect(estimateMinutes([ex(3)])).toBe(5);
    // due esercizi da 4 serie: 8 serie (8 min) + 7 recuperi (14 min) + cambio (1,5 min) = 23,5 → 25
    expect(estimateMinutes([ex(4), ex(4)])).toBe(25);
    // gli stessi in superserie: 4 giri da 2 serie + 15 s di cambio (9 min) + 3 recuperi (6 min) = 15
    expect(estimateMinutes([ex(4, { supersetGroup: 1 }), ex(4, { supersetGroup: 1 })])).toBe(15);
    // a tempo: 60 s + 30 di preparazione; l'intervallo 8-12 vale come 10
    expect(estimateMinutes([ex(10, { kind: 'timed', durationSec: 60 })])).toBe(35);
    expect(estimateMinutes([ex(4, { repsMin: 8, repsMax: 12 })])).toBe(estimateMinutes([ex(4)]));
  });
  test('1RM stimato (Epley) e orologio', () => {
    expect(e1rm({ weightKg: 100, reps: 1 })).toBe(100);
    expect(e1rm({ weightKg: 75, reps: 6 })).toBe(90);
    expect(e1rm({ weightKg: null, reps: 10 })).toBeNull();
    expect(clock(92)).toBe('1:32');
    expect(clock(3725)).toBe('1:02:05');
  });
});
