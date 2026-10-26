import { eq, sql } from 'drizzle-orm';

import { en } from '@/i18n/locales/en';
import { it } from '@/i18n/locales/it';
import { searchText } from '@/lib/text';

import type { CatalogExercise, ExerciseCatalogMeta } from './catalog-exercise';
import { exercises, settings } from './schema';
import type { Db } from './types';

const VERSION_KEY = 'exerciseCatalogVersion';
/** Da aumentare quando cambia il modo di importare (es. le etichette usate per la ricerca): forza un nuovo import. */
const SEED_REVISION = 1;
const PER_INSERT = 60; // 13 colonne: resta sotto il limite di variabili di SQLite

/**
 * Testo di ricerca di un esercizio: nome inglese, sinonimi italiani, muscolo principale, zona e attrezzo in
 * italiano e in inglese. Così "panca manubri" e "petto" trovano "Dumbbell bench press".
 */
export function exerciseSearchText(e: Pick<CatalogExercise, 'name' | 'aliasesIt' | 'primaryMuscles' | 'bodyPart' | 'equipment'>) {
  const labels = [it, en].flatMap((l) => [
    ...e.primaryMuscles.map((m) => l.training.muscles[m]),
    l.training.bodyParts[e.bodyPart],
    l.training.equipment[e.equipment],
  ]);
  return searchText(e.name, e.aliasesIt, ...labels);
}

/**
 * Porta il catalogo esercizi incluso nell'app (`assets/data/exercises.json`) nel DB locale, come `seedFoods`:
 * solo se la versione è cambiata, upsert per id (lo storico resta valido), esercizi personalizzati intatti.
 */
export function seedExercises(db: Db, meta: ExerciseCatalogMeta, load: () => CatalogExercise[]): boolean {
  const current = db.select().from(settings).where(eq(settings.key, VERSION_KEY)).get();
  const version = `${meta.version}:${SEED_REVISION}`;
  if (current && JSON.parse(current.value) === version) return false;

  const catalog = load();
  db.transaction((tx) => {
    for (let i = 0; i < catalog.length; i += PER_INSERT) {
      tx.insert(exercises)
        .values(
          catalog.slice(i, i + PER_INSERT).map((e) => ({
            id: e.id,
            sourceId: e.sourceId,
            name: e.name,
            kind: e.kind,
            bodyPart: e.bodyPart,
            equipment: e.equipment,
            primaryMuscles: e.primaryMuscles,
            secondaryMuscles: e.secondaryMuscles,
            instructions: e.instructions,
            searchText: exerciseSearchText(e),
          })),
        )
        .onConflictDoUpdate({
          target: exercises.id,
          set: {
            name: sql`excluded.name`,
            kind: sql`excluded.kind`,
            bodyPart: sql`excluded.body_part`,
            equipment: sql`excluded.equipment`,
            primaryMuscles: sql`excluded.primary_muscles`,
            secondaryMuscles: sql`excluded.secondary_muscles`,
            instructions: sql`excluded.instructions`,
            searchText: sql`excluded.search_text`,
          },
        })
        .run();
    }
    tx.insert(settings)
      .values({ key: VERSION_KEY, value: JSON.stringify(version) })
      .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } })
      .run();
  });
  return true;
}
