import { count } from 'drizzle-orm';

import { MEAL_PRESETS, mealSlots } from './schema';
import type { Db } from './types';

/** Al primo avvio crea i pasti predefiniti (colazione, pranzo, spuntino, cena). */
export function ensureDefaultMealSlots(db: Db) {
  const existing = db.select({ n: count() }).from(mealSlots).get()?.n ?? 0;
  if (existing > 0) return;
  db.insert(mealSlots)
    .values(MEAL_PRESETS.map((preset, position) => ({ id: `meal:${preset}`, name: '', preset, position })))
    .run();
}
