import { asc, eq } from 'drizzle-orm';

import { diaryEntries, foods, mealSlots } from '@/db/schema';
import type { Db } from '@/db/types';
import type { Food } from '@/features/foods/search';

export type Nutrients = { kcal: number; protein: number; carbs: number; fat: number };
export const ZERO: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
export type MealSlot = typeof mealSlots.$inferSelect;

/** Valori per una quantità in grammi (gli alimenti hanno valori per 100 g). */
export const nutrientsFor = (f: Pick<Food, 'kcal' | 'protein' | 'carbs' | 'fat'>, grams: number): Nutrients => {
  const r = grams / 100;
  return { kcal: f.kcal * r, protein: f.protein * r, carbs: f.carbs * r, fat: f.fat * r };
};

export const sum = (list: Nutrients[]): Nutrients =>
  list.reduce((a, n) => ({ kcal: a.kcal + n.kcal, protein: a.protein + n.protein, carbs: a.carbs + n.carbs, fat: a.fat + n.fat }), ZERO);

/** Query delle voci di un giorno con l'alimento: si usa con `useLiveQuery` (si aggiorna da sola). */
export const dayEntriesQuery = (db: Db, date: string) =>
  db
    .select({ entry: diaryEntries, food: foods })
    .from(diaryEntries)
    .innerJoin(foods, eq(diaryEntries.foodId, foods.id))
    .where(eq(diaryEntries.date, date))
    .orderBy(asc(diaryEntries.createdAt));

export type DayEntry = { entry: typeof diaryEntries.$inferSelect; food: Food };

export const mealSlotsQuery = (db: Db) =>
  db.select().from(mealSlots).where(eq(mealSlots.archived, false)).orderBy(asc(mealSlots.position));

/** Raggruppa le voci per pasto e calcola i totali di ogni pasto e del giorno. */
export function groupByMeal(slots: MealSlot[], entries: DayEntry[]) {
  const meals = slots.map((slot) => {
    const items = entries
      .filter((e) => e.entry.mealSlotId === slot.id)
      .map((e) => ({ ...e, nutrients: nutrientsFor(e.food, e.entry.grams ?? 0) }));
    return { slot, items, totals: sum(items.map((i) => i.nutrients)) };
  });
  return { meals, totals: sum(meals.map((m) => m.totals)) };
}

export function addEntry(db: Db, v: { date: string; mealSlotId: string; foodId: string; grams: number }) {
  db.insert(diaryEntries).values(v).run();
}
export function updateEntryGrams(db: Db, id: string, grams: number) {
  db.update(diaryEntries).set({ grams }).where(eq(diaryEntries.id, id)).run();
}
export function deleteEntry(db: Db, id: string) {
  db.delete(diaryEntries).where(eq(diaryEntries.id, id)).run();
}
export const getEntry = (db: Db, id: string) => db.select().from(diaryEntries).where(eq(diaryEntries.id, id)).get();
