import { Database } from 'bun:sqlite';
import { beforeAll, describe, expect, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { join } from 'node:path';

import type { CatalogFood, CatalogMeta } from '../../src/db/catalog-food';
import { ensureDefaultMealSlots } from '../../src/db/meal-slots';
import * as schema from '../../src/db/schema';
import { seedFoods } from '../../src/db/seed-foods';
import { addEntry, allMealSlotsQuery, dayEntriesQuery, deleteEntry, getEntry, groupByMeal, mealSlotsQuery, nutrientsFor, restoreEntry, updateEntryGrams } from '../../src/features/diary/diary';
import { addMeal, hiddenMealSlotsQuery, mealIcon, moveMeal, renameMeal, setMealHidden, setMealIcon } from '../../src/features/diary/meal-slots';
import { portionLabel, quickAmount } from '../../src/features/foods/portions';
import { favoriteIds, getFood, quickAmounts, recentFoodIds, toggleFavorite, usualFoods } from '../../src/features/foods/queries';
import { browseGroup, foodName, searchFoods } from '../../src/features/foods/search';

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

describe('porzioni e quantità rapide', () => {
  test('unità USDA in italiano; misure imperiali ed etichette lunghe solo in grammi', () => {
    expect(portionLabel('1 cup', 'it')).toBe('1 tazza');
    expect(portionLabel('2 tablespoon', 'it')).toBe('2 cucchiai');
    expect(portionLabel('0.5 cup', 'it')).toBe('0,5 tazza');
    expect(portionLabel('5 tomatoes', 'it')).toBeNull(); // unità non nota
    expect(portionLabel('3 oz', 'it')).toBeNull();
    expect(portionLabel('1 cup, chopped', 'it')).toBeNull();
    expect(portionLabel('1 cup, chopped', 'en')).toBe('1 cup, chopped');
    expect(portionLabel('1 fl oz', 'en')).toBeNull();
  });
  test('il "+" aggiunge l\'ultima quantità, poi la prima porzione con un nome, poi 100 g', () => {
    const portions = [{ label: '1 oz', grams: 28.35 }, { label: '1 jar', grams: 170 }];
    expect(quickAmount(null, portions, 'it')).toEqual({ grams: 170, label: '1 vasetto' });
    expect(quickAmount(125, portions, 'it')).toEqual({ grams: 125, label: null });
    expect(quickAmount(170, portions, 'it')).toEqual({ grams: 170, label: '1 vasetto' });
    expect(quickAmount(undefined, [{ label: '3 oz', grams: 85 }], 'it')).toEqual({ grams: 100, label: null });
  });
  test('dal DB: ultima quantità usata, altrimenti porzione del catalogo', () => {
    const HUMMUS = 'usda:321358';
    expect(quickAmounts(db, [HUMMUS], 'it').get(HUMMUS)).toEqual({ grams: 34, label: '2 cucchiai' });
    addEntry(db, { date: '2026-10-07', mealSlotId: 'meal:snack', foodId: HUMMUS, grams: 50 });
    expect(quickAmounts(db, [HUMMUS], 'it').get(HUMMUS)).toEqual({ grams: 50, label: null });
  });
});

describe('gruppi e "di solito"', () => {
  test('ogni alimento del catalogo ha il suo gruppo; si filtra e si sfoglia per gruppo', () => {
    expect(getFood(db, 'ciqual:13039')?.foodGroup).toBe('fruit'); // mela (categoria CIQUAL larga: decide il nome)
    expect(getFood(db, 'ciqual:17270')?.foodGroup).toBe('drop');
    expect(searchFoods(db, 'yogurt', { lang: 'it', group: 'milk' }).every((h) => h.food.foodGroup === 'milk')).toBe(true);
    expect(searchFoods(db, 'yogurt', { lang: 'it', group: 'meat' })).toEqual([]);
    const fruit = browseGroup(db, 'fruit', { lang: 'it' });
    expect(fruit.length).toBe(40);
    expect(fruit.every((h) => h.food.foodGroup === 'fruit')).toBe(true);
  });
  test('"di solito": i più frequenti nel pasto, con l\'ultima quantità usata lì', () => {
    const slot = 'meal:dinner';
    expect(usualFoods(db, slot, '2026-09-01')).toEqual([]);
    for (const [d, g] of [['2026-10-01', 150], ['2026-10-02', 160]] as const) addEntry(db, { date: d, mealSlotId: slot, foodId: 'ciqual:9100', grams: g });
    addEntry(db, { date: '2026-10-03', mealSlotId: slot, foodId: 'ciqual:17270', grams: 10 });
    addEntry(db, { date: '2026-08-01', mealSlotId: slot, foodId: 'ciqual:13039', grams: 200 }); // troppo vecchio
    expect(usualFoods(db, slot, '2026-09-01').map((u) => [u.food.id, u.grams])).toEqual([['ciqual:9100', 160], ['ciqual:17270', 10]]);
  });
});

describe('pasti configurabili', () => {
  const order = () => mealSlotsQuery(db).all().map((s) => s.preset ?? s.name);
  test('icona predefinita, scelta, rinomina', () => {
    const lunch = mealSlotsQuery(db).all().find((s) => s.preset === 'lunch')!;
    expect(mealIcon(lunch)).toBe('plate');
    setMealIcon(db, lunch.id, 'sun');
    renameMeal(db, lunch.id, '  Pranzo al lavoro ');
    const now = mealSlotsQuery(db).all().find((s) => s.id === lunch.id)!;
    expect([mealIcon(now), now.name]).toEqual(['sun', 'Pranzo al lavoro']);
    renameMeal(db, lunch.id, ''); // vuoto: torna il nome tradotto
    expect(mealSlotsQuery(db).all().find((s) => s.id === lunch.id)!.name).toBe('');
  });
  test('aggiungi, sposta, nascondi e mostra; il diario dei giorni passati resta', () => {
    const id = addMeal(db, 'Pre-allenamento', 'bolt');
    expect(order()).toEqual(['breakfast', 'lunch', 'snack', 'dinner', 'Pre-allenamento']);
    moveMeal(db, id, -1);
    expect(order()).toEqual(['breakfast', 'lunch', 'snack', 'Pre-allenamento', 'dinner']);
    addEntry(db, { date: '2026-10-09', mealSlotId: id, foodId: 'ciqual:13039', grams: 150 });
    setMealHidden(db, id, true);
    expect(order()).toEqual(['breakfast', 'lunch', 'snack', 'dinner']);
    expect(hiddenMealSlotsQuery(db).all().map((s) => s.name)).toEqual(['Pre-allenamento']);
    expect(dayEntriesQuery(db, '2026-10-09').all().length).toBe(1);
    // nel diario di quel giorno il pasto nascosto c'è ancora, con le sue kcal; negli altri giorni no
    const day9 = groupByMeal(allMealSlotsQuery(db).all(), dayEntriesQuery(db, '2026-10-09').all());
    expect(day9.meals.map((m) => m.slot.name || m.slot.preset)).toContain('Pre-allenamento');
    expect(day9.totals.kcal).toBeGreaterThan(0);
    const day8 = groupByMeal(allMealSlotsQuery(db).all(), dayEntriesQuery(db, '2026-10-08').all());
    expect(day8.meals.map((m) => m.slot.name || m.slot.preset)).not.toContain('Pre-allenamento');
    setMealHidden(db, id, false); // torna in fondo
    expect(order()).toEqual(['breakfast', 'lunch', 'snack', 'dinner', 'Pre-allenamento']);
  });
  test('una voce tolta si rimette uguale con "Annulla"', () => {
    addEntry(db, { date: '2026-10-10', mealSlotId: 'meal:breakfast', foodId: 'ciqual:13039', grams: 120 });
    const row = dayEntriesQuery(db, '2026-10-10').all()[0].entry;
    deleteEntry(db, row.id);
    expect(getEntry(db, row.id)).toBeUndefined();
    restoreEntry(db, row);
    expect(getEntry(db, row.id)).toEqual(row);
  });
});
