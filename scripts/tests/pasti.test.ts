import { Database } from 'bun:sqlite';
import { beforeAll, describe, expect, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { join } from 'node:path';

import type { CatalogFood, CatalogMeta } from '../../src/db/catalog-food';
import { ensureDefaultMealSlots } from '../../src/db/meal-slots';
import * as schema from '../../src/db/schema';
import { seedFoods } from '../../src/db/seed-foods';
import { addEntry, dayEntriesQuery, deleteEntry, groupByMeal, mealSlotsQuery, nutrientsFor, updateEntryGrams } from '../../src/features/diary/diary';
import { favoriteIds, recentFoodIds, toggleFavorite } from '../../src/features/foods/queries';
import { foodName, searchFoods } from '../../src/features/foods/search';

const ROOT = join(import.meta.dir, '..', '..');
const db = drizzle(new Database(':memory:'), { schema });
const names = (q: string, opts = {}) => searchFoods(db, q, { lang: 'it', ...opts }).map((h) => foodName(h.food, 'it'));

beforeAll(async () => {
  migrate(db, { migrationsFolder: join(ROOT, 'drizzle') });
  const meta: CatalogMeta = require(join(ROOT, 'assets/data/foods.meta.json'));
  await seedFoods(db, meta, () => require(join(ROOT, 'assets/data/foods.json')) as CatalogFood[]);
  ensureDefaultMealSlots(db);
});

describe('ricerca alimenti', () => {
  test('parole in qualsiasi ordine, parole vuote ignorate', () => {
    expect(names('petto di pollo')[0]).toBe('Pollo, petto, senza pelle, crudo');
    expect(names('pol pet')[0]).toBe('Pollo, petto, senza pelle, crudo');
  });
  test('accenti e maiuscole ignorati', () => {
    expect(names('CAFFE')[0]).toStartWith('Caffè');
  });
  test('gli alimenti generici vengono prima di quelli specifici', () => {
    expect(names('tonno')[0]).toBe('Tonno, crudo');
    expect(names('olio oliva')[0]).toBe('Olio di oliva, extra vergine');
  });
  test('stesso nome da fonti diverse: una riga sola con le versioni', () => {
    const hit = searchFoods(db, 'broccoli crudo', { lang: 'it' }).find((h) => foodName(h.food, 'it') === 'Broccoli, crudo');
    expect(hit?.versions.length).toBeGreaterThan(1);
    expect(hit?.food.source).toBe('ciqual'); // la versione proposta per prima
  });
  test('in inglese cerca nei nomi inglesi', () => {
    expect(searchFoods(db, 'chicken breast', { lang: 'en' }).length).toBeGreaterThan(0);
  });
  test('nessun risultato e ricerca vuota', () => {
    expect(names('zzzz')).toEqual([]);
    expect(names('   ')).toEqual([]);
  });
});

describe('diario', () => {
  const date = '2026-10-05';
  test('ci sono i 4 pasti predefiniti, una volta sola', () => {
    ensureDefaultMealSlots(db);
    expect(mealSlotsQuery(db).all().map((s) => s.preset)).toEqual(['breakfast', 'lunch', 'snack', 'dinner']);
  });
  test('aggiungo, modifico ed elimino una voce; i totali seguono', () => {
    addEntry(db, { date, mealSlotId: 'meal:lunch', foodId: 'ciqual:9100', grams: 80 }); // riso bianco crudo
    addEntry(db, { date, mealSlotId: 'meal:lunch', foodId: 'ciqual:17270', grams: 10 }); // olio extravergine
    const day = () => groupByMeal(mealSlotsQuery(db).all(), dayEntriesQuery(db, date).all());
    const lunch = () => day().meals.find((m) => m.slot.id === 'meal:lunch')!;
    expect(lunch().items).toHaveLength(2);
    expect(Math.round(day().totals.kcal)).toBe(Math.round(350 * 0.8 + 899 * 0.1));

    updateEntryGrams(db, lunch().items[0].entry.id, 100);
    expect(Math.round(lunch().items[0].nutrients.kcal)).toBe(350);
    deleteEntry(db, lunch().items[1].entry.id);
    expect(lunch().items).toHaveLength(1);
    expect(day().meals.find((m) => m.slot.id === 'meal:dinner')!.items).toHaveLength(0);
  });
  test('valori per una quantità', () => {
    expect(nutrientsFor({ kcal: 200, protein: 10, carbs: 20, fat: 5 }, 150)).toEqual({ kcal: 300, protein: 15, carbs: 30, fat: 7.5 });
  });
  test('recenti del pasto, dal più recente, senza ripetizioni', () => {
    addEntry(db, { date, mealSlotId: 'meal:breakfast', foodId: 'ciqual:13039', grams: 150 });
    addEntry(db, { date, mealSlotId: 'meal:breakfast', foodId: 'ciqual:13039', grams: 120 });
    expect(recentFoodIds(db, 'meal:breakfast')).toEqual(['ciqual:13039']);
    expect(names('mela', { filter: 'recent', ids: recentFoodIds(db, 'meal:breakfast') })).toEqual(['Mela, polpa e pelle, crudo']);
  });
  test('preferiti: si accendono, si spengono e filtrano la ricerca', () => {
    expect(toggleFavorite(db, 'ciqual:9100')).toBe(true);
    expect(names('riso', { filter: 'favorites', ids: favoriteIds(db) })).toEqual(['Riso, bianco, crudo']);
    expect(toggleFavorite(db, 'ciqual:9100')).toBe(false);
    expect(names('riso', { filter: 'favorites', ids: favoriteIds(db) })).toEqual([]);
  });
});
