import { asc, eq, max } from 'drizzle-orm';

import { MEAL_ICONS, MEAL_PRESETS, mealSlots } from '@/db/schema';
import type { Db } from '@/db/types';
import { uuid } from '@/lib/uuid';

import type { MealSlot } from './diary';

export type MealIcon = (typeof MEAL_ICONS)[number];

/** Icona dei pasti predefiniti finché l'utente non ne sceglie un'altra. */
const PRESET_ICON: Record<(typeof MEAL_PRESETS)[number], MealIcon> = { breakfast: 'mug', lunch: 'plate', snack: 'apple', dinner: 'moon' };

/** Icona di un pasto: quella scelta, altrimenti quella del predefinito, altrimenti il piatto. */
export const mealIcon = (slot: Pick<MealSlot, 'icon' | 'preset'>): MealIcon => slot.icon ?? (slot.preset ? PRESET_ICON[slot.preset] : 'plate');

/** Pasti nascosti, in ordine: per `useLiveQuery`. */
export const hiddenMealSlotsQuery = (db: Db) =>
  db.select().from(mealSlots).where(eq(mealSlots.archived, true)).orderBy(asc(mealSlots.position));

/** Rinomina un pasto; vuoto = torna al nome tradotto del predefinito (per un pasto nuovo, non cambia). */
export function renameMeal(db: Db, id: string, name: string) {
  const slot = db.select().from(mealSlots).where(eq(mealSlots.id, id)).get();
  if (!slot) return;
  const trimmed = name.trim();
  if (!trimmed && !slot.preset) return;
  db.update(mealSlots).set({ name: trimmed }).where(eq(mealSlots.id, id)).run();
}

export function setMealIcon(db: Db, id: string, icon: MealIcon) {
  db.update(mealSlots).set({ icon }).where(eq(mealSlots.id, id)).run();
}

/** Nuovo pasto in fondo ai visibili. */
export function addMeal(db: Db, name: string, icon: MealIcon = 'plate'): string {
  const last = db.select({ p: max(mealSlots.position) }).from(mealSlots).get();
  const id = uuid();
  db.insert(mealSlots).values({ id, name: name.trim(), icon, position: (last?.p ?? -1) + 1 }).run();
  return id;
}

/** Nasconde o mostra un pasto. Le voci di diario restano: i giorni passati non cambiano. */
export function setMealHidden(db: Db, id: string, hidden: boolean) {
  if (!hidden) {
    // Torna in fondo ai visibili.
    const last = db.select({ p: max(mealSlots.position) }).from(mealSlots).get();
    db.update(mealSlots).set({ archived: false, position: (last?.p ?? -1) + 1 }).where(eq(mealSlots.id, id)).run();
    return;
  }
  db.update(mealSlots).set({ archived: true }).where(eq(mealSlots.id, id)).run();
}

/** Sposta un pasto visibile di un posto (-1 su, +1 giù) scambiandolo con il vicino. */
export function moveMeal(db: Db, id: string, dir: -1 | 1) {
  const list = db.select().from(mealSlots).where(eq(mealSlots.archived, false)).orderBy(asc(mealSlots.position)).all();
  const i = list.findIndex((s) => s.id === id);
  const other = list[i + dir];
  if (i < 0 || !other) return;
  db.transaction((tx) => {
    // Posizioni riscritte in ordine (0, 1, 2…) con i due scambiati: niente posizioni uguali.
    const order = list.map((s) => s.id);
    [order[i], order[i + dir]] = [order[i + dir], order[i]];
    order.forEach((sid, position) => tx.update(mealSlots).set({ position }).where(eq(mealSlots.id, sid)).run());
  });
}
