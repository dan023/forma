import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createdAt, day, id } from './common';

export const EXERCISE_KINDS = ['weight', 'bodyweight', 'timed'] as const;
export const PROGRESSION_KINDS = ['linear', 'greyskull', 'double'] as const;

/** Catalogo esercizi (incluso) + esercizi personalizzati. */
export const exercises = sqliteTable(
  'exercises',
  {
    id: id(),
    /** Id nel dataset di origine; null per gli esercizi personalizzati. */
    sourceId: text('source_id'),
    name: text('name').notNull(),
    nameIt: text('name_it'),
    /** Zona del corpo (`BODY_PARTS` in catalog-exercise.ts): il filtro del catalogo. */
    bodyPart: text('body_part'),
    kind: text('kind', { enum: EXERCISE_KINDS }).notNull().default('weight'),
    equipment: text('equipment'),
    /** Muscoli primari e secondari, JSON array di chiavi. */
    primaryMuscles: text('primary_muscles', { mode: 'json' }).$type<string[]>().notNull().default([]),
    secondaryMuscles: text('secondary_muscles', { mode: 'json' }).$type<string[]>().notNull().default([]),
    instructions: text('instructions', { mode: 'json' }).$type<{ it: string[]; en: string[] }>(),
    /** Parole del nome, dei sinonimi italiani, dei muscoli e dell'attrezzo (come `foods.search_text`). */
    searchText: text('search_text').notNull().default(''),
    isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index('exercises_name_idx').on(t.name),
    index('exercises_body_part_idx').on(t.bodyPart),
    index('exercises_equipment_idx').on(t.equipment),
  ],
);

export const ROUTINE_ICONS = ['dumbbell', 'barbell', 'kettlebell', 'run', 'bike', 'flame', 'bolt', 'heart', 'mountain', 'target', 'trophy', 'leaf'] as const;
export const ROUTINE_COLORS = ['corallo', 'lampone', 'fucsia', 'viola', 'ardesia', 'cacao'] as const;

/** Scheda: elenco di esercizi con le serie previste, da cui iniziare un allenamento. */
export const routines = sqliteTable('routines', {
  id: id(),
  name: text('name').notNull(),
  /** Icona e colore scelti dall'utente: la tessera della scheda; il colore fa da accento nelle sue schermate. */
  icon: text('icon', { enum: ROUTINE_ICONS }).notNull().default('dumbbell'),
  color: text('color', { enum: ROUTINE_COLORS }).notNull().default('corallo'),
  createdAt: createdAt(),
});

export const routineExercises = sqliteTable(
  'routine_exercises',
  {
    id: id(),
    routineId: text('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    position: integer('position').notNull(),
    sets: integer('sets').notNull().default(3),
    /** Ripetizioni previste: fisse (`repsMax` null) o un intervallo (8-12). Null = da decidere in palestra. */
    repsMin: integer('reps_min'),
    repsMax: integer('reps_max'),
    /** Secondi previsti per gli esercizi a tempo. */
    durationSec: integer('duration_sec'),
    /** Come `workout_exercises.superset_group`: esercizi vicini con lo stesso numero sono una superserie. */
    supersetGroup: integer('superset_group'),
  },
  (t) => [index('routine_exercises_routine_idx').on(t.routineId)],
);

/** Settimana tipo: al massimo una scheda per giorno (0 = lunedì … 6 = domenica); un giorno assente è riposo. */
export const routineDays = sqliteTable('routine_days', {
  weekday: integer('weekday').primaryKey(),
  routineId: text('routine_id')
    .notNull()
    .references(() => routines.id, { onDelete: 'cascade' }),
});

export const workouts = sqliteTable(
  'workouts',
  {
    id: id(),
    date: day('date'),
    name: text('name'),
    /** Scheda da cui è partito; null per l'allenamento libero (o se la scheda è stata cancellata). */
    routineId: text('routine_id').references(() => routines.id, { onDelete: 'set null' }),
    startedAt: integer('started_at', { mode: 'number' }),
    finishedAt: integer('finished_at', { mode: 'number' }),
    notes: text('notes'),
  },
  (t) => [index('workouts_date_idx').on(t.date)],
);

/** Esercizio dentro un allenamento; vicini con lo stesso `supersetGroup` = stessa superserie. */
export const workoutExercises = sqliteTable(
  'workout_exercises',
  {
    id: id(),
    workoutId: text('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    position: integer('position').notNull(),
    supersetGroup: integer('superset_group'),
    /** Obiettivo copiato dalla scheda all'inizio (come in `routine_exercises`); null nell'allenamento libero. */
    targetRepsMin: integer('target_reps_min'),
    targetRepsMax: integer('target_reps_max'),
    targetSec: integer('target_sec'),
    notes: text('notes'),
  },
  (t) => [index('workout_exercises_workout_idx').on(t.workoutId)],
);

export const sets = sqliteTable(
  'sets',
  {
    id: id(),
    workoutExerciseId: text('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    weightKg: real('weight_kg'),
    reps: integer('reps'),
    durationSec: integer('duration_sec'),
    rir: real('rir'),
    rpe: real('rpe'),
    isWarmup: integer('is_warmup', { mode: 'boolean' }).notNull().default(false),
    completedAt: integer('completed_at', { mode: 'number' }),
  },
  (t) => [index('sets_workout_exercise_idx').on(t.workoutExerciseId)],
);

/** Regola di progressione per esercizio; i parametri dipendono dal tipo (JSON). */
export const progressionRules = sqliteTable('progression_rules', {
  exerciseId: text('exercise_id')
    .primaryKey()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  kind: text('kind', { enum: PROGRESSION_KINDS }).notNull(),
  params: text('params', { mode: 'json' }).$type<Record<string, number>>().notNull().default({}),
});
