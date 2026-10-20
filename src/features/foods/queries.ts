import { desc, eq, inArray } from 'drizzle-orm';

import { diaryEntries, favoriteFoods, foodPortions, foods } from '@/db/schema';
import type { Db } from '@/db/types';

import type { Food } from './search';

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
