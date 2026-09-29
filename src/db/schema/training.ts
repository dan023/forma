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
    kind: text('kind', { enum: EXERCISE_KINDS }).notNull().default('weight'),
    equipment: text('equipment'),
    /** Muscoli primari e secondari, JSON array di chiavi. */
    primaryMuscles: text('primary_muscles', { mode: 'json' }).$type<string[]>().notNull().default([]),
    secondaryMuscles: text('secondary_muscles', { mode: 'json' }).$type<string[]>().notNull().default([]),
    instructions: text('instructions'),
    isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index('exercises_name_idx').on(t.name)],
);

export const workouts = sqliteTable(
  'workouts',
  {
    id: id(),
    date: day('date'),
    name: text('name'),
    startedAt: integer('started_at', { mode: 'number' }),
    finishedAt: integer('finished_at', { mode: 'number' }),
    notes: text('notes'),
  },
  (t) => [index('workouts_date_idx').on(t.date)],
);

/** Esercizio dentro un allenamento; `supersetGroup` uguale = stesso superset. */
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
