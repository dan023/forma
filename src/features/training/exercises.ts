import { and, asc, eq, sql, type SQL } from 'drizzle-orm';

import { EQUIPMENT, type BodyPart, type Equipment } from '@/db/catalog-exercise';
import { exercises } from '@/db/schema';
import type { Db } from '@/db/types';
import { queryWords, words } from '@/lib/text';

export type Exercise = typeof exercises.$inferSelect;

/** Colonne che servono all'elenco del catalogo: senza istruzioni né testo di ricerca, molto più leggere. */
const listColumns = {
  id: exercises.id,
  name: exercises.name,
  kind: exercises.kind,
  bodyPart: exercises.bodyPart,
  equipment: exercises.equipment,
  primaryMuscles: exercises.primaryMuscles,
};
export type ExerciseListItem = Pick<Exercise, keyof typeof listColumns>;

export type ExerciseFilter = { bodyPart?: BodyPart; equipment?: Equipment };

const filterWhere = ({ bodyPart, equipment }: ExerciseFilter) =>
  [bodyPart && eq(exercises.bodyPart, bodyPart), equipment && eq(exercises.equipment, equipment)].filter((w): w is SQL => !!w);

// Attrezzi più usati in palestra: a parità di parole trovate, "Barbell bench press" viene prima di "Band bench press".
const COMMON: Partial<Record<Equipment, number>> = { barbell: 30, dumbbell: 25, bodyweight: 20, cable: 15, machine: 12, smith: 8, ezBar: 8, kettlebell: 5 };

/**
 * Ricerca nel catalogo esercizi, come per gli alimenti: parole in qualsiasi ordine, ognuna come inizio di parola,
 * nel nome inglese, nei sinonimi italiani, nel muscolo principale, nella zona e nell'attrezzo.
 * Ordine: prima i nomi che contengono più parole cercate, poi gli attrezzi più comuni, poi i nomi più corti
 * (i generici prima delle varianti).
 * Senza testo elenca gli esercizi filtrati (zona e attrezzo) in ordine alfabetico.
 */
export function searchExercises(db: Db, query: string, { limit = 2000, ...filter }: ExerciseFilter & { limit?: number } = {}): ExerciseListItem[] {
  const toks = queryWords(query);
  const where: SQL[] = [...toks.map((t) => sql`${exercises.searchText} like ${`% ${t}%`}`), ...filterWhere(filter)];
  const rows = db
    .select(listColumns)
    .from(exercises)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(exercises.name))
    .limit(toks.length ? 400 : limit)
    .all();
  if (!toks.length) return rows;
  const score = (e: ExerciseListItem) => {
    const name = words(e.name);
    const inName = toks.filter((t) => name.some((w) => w.startsWith(t))).length;
    return inName * 1000 + (COMMON[e.equipment as Equipment] ?? 0) - e.name.length;
  };
  return rows.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

/** Attrezzi che hanno almeno un esercizio nella zona scelta (o in tutto il catalogo), nell'ordine di `EQUIPMENT`. */
export function equipmentIn(db: Db, bodyPart?: BodyPart): Equipment[] {
  const found = new Set(
    db
      .selectDistinct({ e: exercises.equipment })
      .from(exercises)
      .where(bodyPart ? eq(exercises.bodyPart, bodyPart) : undefined)
      .all()
      .map((r) => r.e),
  );
  return EQUIPMENT.filter((e) => found.has(e));
}

export const getExercise = (db: Db, id: string) => db.select().from(exercises).where(eq(exercises.id, id)).get();

export const exerciseCount = (db: Db) => db.select({ n: sql<number>`count(*)` }).from(exercises).get()?.n ?? 0;
