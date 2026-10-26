/**
 * Forma di una voce di `assets/data/exercises.json` (generato da `scripts/catalog/build-exercise-catalog.ts`
 * dal dataset hasaneyldrm/exercises-dataset, dati MIT). Muscoli, attrezzi e zone sono chiavi fisse, tradotte
 * nell'app (`training.muscles`, `training.equipment`, `training.bodyParts`).
 */
export const MUSCLES = [
  'chest', 'shoulders', 'rearDelts', 'lats', 'upperBack', 'traps', 'lowerBack', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'serratus', 'hipFlexors', 'glutes', 'quads', 'hamstrings', 'adductors', 'abductors', 'calves',
  'neck', 'cardio',
] as const;
export type Muscle = (typeof MUSCLES)[number];

export const EQUIPMENT = [
  'bodyweight', 'barbell', 'ezBar', 'dumbbell', 'kettlebell', 'cable', 'machine', 'smith', 'band', 'plate', 'ball',
  'cardioMachine', 'assisted', 'other',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const BODY_PARTS = ['chest', 'back', 'shoulders', 'upperArms', 'lowerArms', 'waist', 'upperLegs', 'lowerLegs', 'cardio', 'neck'] as const;
export type BodyPart = (typeof BODY_PARTS)[number];

export type CatalogExercise = {
  /** Deterministico (`ex:<id del dataset>`): lo storico resta valido se il catalogo viene rigenerato. */
  id: string;
  sourceId: string;
  /** Nome inglese del dataset, con l'iniziale maiuscola (i nomi non si traducono: in palestra si usano così). */
  name: string;
  kind: 'weight' | 'bodyweight' | 'timed';
  bodyPart: BodyPart;
  equipment: Equipment;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  instructions: { it: string[]; en: string[] };
  /** Sinonimi italiani per la ricerca ("panca", "manubri"…), da `scripts/catalog/exercise-aliases-it.json`. */
  aliasesIt: string;
};

export type ExerciseCatalogMeta = { version: string; count: number };
