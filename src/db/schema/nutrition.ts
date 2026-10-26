import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { createdAt, day, id } from './common';

export const FOOD_SOURCES = ['ciqual', 'usda', 'off', 'custom'] as const;
export const DAY_TYPES = ['training', 'rest'] as const;
/** Pasti predefiniti: il nome si traduce finché l'utente non lo rinomina. */
export const MEAL_PRESETS = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
/** Icone tra cui scegliere quella di un pasto; le prime quattro vanno ai predefiniti (vedi `mealIcon`). */
export const MEAL_ICONS = ['mug', 'plate', 'apple', 'moon', 'sun', 'coffee', 'bolt', 'dumbbell', 'shaker', 'leaf', 'star', 'heart'] as const;
/** Gruppi di alimenti: il glifo della tessera e il filtro per categoria della ricerca (`categoryIcon`). */
export const FOOD_GROUPS = ['grain', 'fruit', 'leaf', 'meat', 'fish', 'milk', 'nut', 'drop', 'candy', 'cup', 'bowl'] as const;

/** Alimenti: catalogo incluso (ciqual/usda), cache Open Food Facts e alimenti personalizzati. Valori per 100 g. */
export const foods = sqliteTable(
  'foods',
  {
    id: id(),
    source: text('source', { enum: FOOD_SOURCES }).notNull(),
    /** Id nella fonte originale (codice CIQUAL, fdcId, barcode OFF). */
    sourceId: text('source_id'),
    nameIt: text('name_it'),
    nameFr: text('name_fr'),
    nameEn: text('name_en'),
    brand: text('brand'),
    category: text('category'),
    /** Gruppo calcolato all'import da categoria e nome (`categoryIcon`): filtro della ricerca. */
    foodGroup: text('food_group', { enum: FOOD_GROUPS }),
    barcode: text('barcode'),
    kcal: real('kcal').notNull(),
    protein: real('protein').notNull().default(0),
    carbs: real('carbs').notNull().default(0),
    fat: real('fat').notNull().default(0),
    fiber: real('fiber'),
    sugar: real('sugar'),
    saturatedFat: real('saturated_fat'),
    sodium: real('sodium'),
    /** Altri micronutrienti per 100 g, JSON `{ chiave: valore }`. */
    micros: text('micros', { mode: 'json' }).$type<Record<string, number>>(),
    /** Parole di tutti i nomi, normalizzate (vedi `searchText` in src/lib/text.ts). */
    searchText: text('search_text'),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('foods_source_idx').on(t.source, t.sourceId),
    index('foods_barcode_idx').on(t.barcode),
    index('foods_name_it_idx').on(t.nameIt),
    index('foods_name_en_idx').on(t.nameEn),
    index('foods_group_idx').on(t.foodGroup),
  ],
);

/** Porzioni tipiche o personalizzate ("1 fetta", "1 cucchiaio"). */
export const foodPortions = sqliteTable(
  'food_portions',
  {
    id: id(),
    foodId: text('food_id')
      .notNull()
      .references(() => foods.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    grams: real('grams').notNull(),
  },
  (t) => [index('food_portions_food_idx').on(t.foodId)],
);

/** Pasti configurabili (colazione, pranzo, ...). */
export const mealSlots = sqliteTable('meal_slots', {
  id: id(),
  /** Vuoto per i pasti predefiniti non rinominati: si mostra la traduzione di `preset`. */
  name: text('name').notNull(),
  preset: text('preset', { enum: MEAL_PRESETS }),
  /** Icona scelta; null = quella del predefinito (`mealIcon`). */
  icon: text('icon', { enum: MEAL_ICONS }),
  position: integer('position').notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
});

export const recipes = sqliteTable('recipes', {
  id: id(),
  name: text('name').notNull(),
  /** Numero di porzioni in cui è divisa la ricetta. */
  servings: real('servings').notNull().default(1),
  notes: text('notes'),
  createdAt: createdAt(),
});

export const recipeItems = sqliteTable(
  'recipe_items',
  {
    id: id(),
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    foodId: text('food_id')
      .notNull()
      .references(() => foods.id),
    grams: real('grams').notNull(),
  },
  (t) => [index('recipe_items_recipe_idx').on(t.recipeId)],
);

/**
 * Riga del diario. Punta a un alimento oppure a una ricetta (con `servings` porzioni).
 * `grams` è sempre la quantità effettiva per gli alimenti.
 */
export const diaryEntries = sqliteTable(
  'diary_entries',
  {
    id: id(),
    date: day('date'),
    mealSlotId: text('meal_slot_id').references(() => mealSlots.id, { onDelete: 'set null' }),
    foodId: text('food_id').references(() => foods.id),
    recipeId: text('recipe_id').references(() => recipes.id),
    grams: real('grams'),
    servings: real('servings'),
    createdAt: createdAt(),
  },
  (t) => [index('diary_entries_date_idx').on(t.date)],
);

export const favoriteFoods = sqliteTable('favorite_foods', {
  foodId: text('food_id')
    .primaryKey()
    .references(() => foods.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
});

/** Obiettivi giornalieri, uno per tipo di giorno (allenamento / riposo). */
export const nutritionGoals = sqliteTable('nutrition_goals', {
  dayType: text('day_type', { enum: DAY_TYPES }).primaryKey(),
  kcal: real('kcal').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fat: real('fat').notNull(),
});
