import { and, asc, count, desc, eq, gte, inArray, isNotNull } from 'drizzle-orm';

import { diaryEntries, favoriteFoods, foodPortions, foods } from '@/db/schema';
import type { Db } from '@/db/types';

import { quickAmount, type PortionRow, type QuickAmount } from './portions';
import type { Food } from './search';

/** Quanti alimenti ci sono (catalogo e personalizzati). */
export const foodCount = (db: Db) => db.select({ n: count() }).from(foods).get()?.n ?? 0;

export const getFood = (db: Db, id: string): Food | undefined => db.select().from(foods).where(eq(foods.id, id)).get();

export const getPortions = (db: Db, foodId: string) =>
  db.select().from(foodPortions).where(eq(foodPortions.foodId, foodId)).all();

/** Id degli alimenti usati di recente in un pasto, dal più recente, senza ripetizioni. */
export function recentFoodIds(db: Db, mealSlotId: string | undefined, limit = 8): string[] {
  const rows = db
    .select({ foodId: diaryEntries.foodId })
    .from(diaryEntries)
    .where(mealSlotId ? eq(diaryEntries.mealSlotId, mealSlotId) : undefined)
    .orderBy(desc(diaryEntries.createdAt))
    .limit(200)
    .all();
  return [...new Set(rows.map((r) => r.foodId).filter((id): id is string => !!id))].slice(0, limit);
}

export const getFoods = (db: Db, ids: string[]): Food[] => {
  if (!ids.length) return [];
  const rows = db.select().from(foods).where(inArray(foods.id, ids)).all();
  const byId = new Map(rows.map((f) => [f.id, f]));
  return ids.map((id) => byId.get(id)).filter((f): f is Food => !!f);
};

export const favoriteIds = (db: Db) => db.select({ id: favoriteFoods.foodId }).from(favoriteFoods).all().map((r) => r.id);

export function toggleFavorite(db: Db, foodId: string): boolean {
  const on = !!db.select().from(favoriteFoods).where(eq(favoriteFoods.foodId, foodId)).get();
  if (on) db.delete(favoriteFoods).where(eq(favoriteFoods.foodId, foodId)).run();
  else db.insert(favoriteFoods).values({ foodId }).run();
  return !on;
}

/** Ultima quantità usata di ogni alimento (la voce del giorno più recente, poi la più recente), per gli id dati. */
export function lastGrams(db: Db, foodIds: string[]): Map<string, number> {
  const out = new Map<string, number>();
  if (!foodIds.length) return out;
  const rows = db
    .select({ foodId: diaryEntries.foodId, grams: diaryEntries.grams })
    .from(diaryEntries)
    .where(and(inArray(diaryEntries.foodId, foodIds), isNotNull(diaryEntries.grams)))
    .orderBy(desc(diaryEntries.date), desc(diaryEntries.createdAt))
    .all();
  for (const r of rows) if (r.foodId && r.grams != null && !out.has(r.foodId)) out.set(r.foodId, r.grams);
  return out;
}

/** Porzioni di più alimenti, nell'ordine del catalogo. */
export function portionsFor(db: Db, foodIds: string[]): Map<string, PortionRow[]> {
  const out = new Map<string, PortionRow[]>();
  if (!foodIds.length) return out;
  const rows = db.select().from(foodPortions).where(inArray(foodPortions.foodId, foodIds)).orderBy(asc(foodPortions.id)).all();
  for (const r of rows) out.set(r.foodId, [...(out.get(r.foodId) ?? []), { label: r.label, grams: r.grams }]);
  return out;
}

/** Quanto aggiunge il "+" per ogni alimento (vedi `quickAmount`). */
export function quickAmounts(db: Db, foodIds: string[], lang: string): Map<string, QuickAmount> {
  const last = lastGrams(db, foodIds);
  const portions = portionsFor(db, foodIds);
  return new Map(foodIds.map((id) => [id, quickAmount(last.get(id), portions.get(id) ?? [], lang)]));
}

/**
 * "Di solito" per un pasto: gli alimenti messi più spesso in quel pasto dal giorno `since` (`YYYY-MM-DD`), a parità
 * il più recente, ognuno con l'ultima quantità usata in quel pasto.
 */
export function usualFoods(db: Db, mealSlotId: string, since: string, limit = 3): { food: Food; grams: number }[] {
  const rows = db
    .select({ foodId: diaryEntries.foodId, grams: diaryEntries.grams })
    .from(diaryEntries)
    .where(and(eq(diaryEntries.mealSlotId, mealSlotId), gte(diaryEntries.date, since), isNotNull(diaryEntries.foodId), isNotNull(diaryEntries.grams)))
    .orderBy(desc(diaryEntries.date), desc(diaryEntries.createdAt))
    .all();
  const stats = new Map<string, { n: number; grams: number; order: number }>();
  rows.forEach((r, order) => {
    const s = stats.get(r.foodId!);
    if (s) s.n++;
    else stats.set(r.foodId!, { n: 1, grams: r.grams!, order });
  });
  const top = [...stats].sort(([, a], [, b]) => b.n - a.n || a.order - b.order).slice(0, limit);
  const foodsById = new Map(getFoods(db, top.map(([id]) => id)).map((f) => [f.id, f]));
  return top.flatMap(([id, s]) => (foodsById.has(id) ? [{ food: foodsById.get(id)!, grams: s.grams }] : []));
}
