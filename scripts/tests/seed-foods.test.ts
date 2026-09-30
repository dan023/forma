import { Database } from 'bun:sqlite';
import { beforeEach, describe, expect, test } from 'bun:test';
import { count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { join } from 'node:path';

import type { CatalogFood, CatalogMeta } from '../../src/db/catalog-food';
import * as schema from '../../src/db/schema';
import { seedFoods } from '../../src/db/seed-foods';

const ROOT = join(import.meta.dir, '..', '..');
const allFoods: CatalogFood[] = require(join(ROOT, 'assets/data/foods.json'));
const meta: CatalogMeta = require(join(ROOT, 'assets/data/foods.meta.json'));

let db: ReturnType<typeof makeDb>;
function makeDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  const d = drizzle(sqlite, { schema });
  migrate(d, { migrationsFolder: join(ROOT, 'drizzle') });
  return d;
}
const total = (table: typeof schema.foods | typeof schema.foodPortions) => db.select({ n: count() }).from(table).get()!.n;

beforeEach(() => {
  db = makeDb();
});

describe('seedFoods', () => {
  test('importa tutto il catalogo con nomi e porzioni', async () => {
    expect(await seedFoods(db, meta, () => allFoods)).toBe(true);
    expect(total(schema.foods)).toBe(meta.count);
    const apple = db.select().from(schema.foods).where(eq(schema.foods.id, 'ciqual:13039')).get()!;
    expect(apple.nameIt).toBe('Mela, polpa e pelle, crudo');
    expect(apple.nameFr).toBe('Pomme, chair et peau, crue');
    expect(apple.micros).toBeObject();
    const portions = allFoods.reduce((n, f) => n + f.portions.length, 0);
    expect(total(schema.foodPortions)).toBe(portions);
  });

  test('è idempotente: la seconda volta non fa nulla', async () => {
    await seedFoods(db, meta, () => allFoods);
    let loaded = false;
    expect(await seedFoods(db, meta, () => ((loaded = true), allFoods))).toBe(false);
    expect(loaded).toBe(false);
    expect(total(schema.foods)).toBe(meta.count);
  });

  test('un catalogo aggiornato aggiorna le righe senza duplicarle né rompere il diario', async () => {
    await seedFoods(db, meta, () => allFoods);
    db.insert(schema.diaryEntries).values({ date: '2026-09-30', foodId: 'ciqual:13039', grams: 150 }).run();
    db.insert(schema.foods).values({ id: 'mio', source: 'custom', nameIt: 'Il mio piatto', kcal: 100 }).run();

    const updated = allFoods.map((f) => (f.id === 'ciqual:13039' ? { ...f, nameIt: 'Mela (nuovo nome)' } : f));
    expect(await seedFoods(db, { ...meta, version: 'nuova' }, () => updated)).toBe(true);

    expect(total(schema.foods)).toBe(meta.count + 1);
    expect(db.select().from(schema.foods).where(eq(schema.foods.id, 'ciqual:13039')).get()!.nameIt).toBe('Mela (nuovo nome)');
    expect(db.select().from(schema.diaryEntries).all()).toHaveLength(1);
    expect(db.select().from(schema.foods).where(eq(schema.foods.id, 'mio')).get()!.nameIt).toBe('Il mio piatto');
  });

  test('non tocca le porzioni create dall’utente', async () => {
    await seedFoods(db, meta, () => allFoods);
    db.insert(schema.foodPortions).values({ id: 'porzione-mia', foodId: 'ciqual:13039', label: '1 mela grande', grams: 200 }).run();
    await seedFoods(db, { ...meta, version: 'nuova' }, () => allFoods);
    expect(db.select().from(schema.foodPortions).where(eq(schema.foodPortions.id, 'porzione-mia')).all()).toHaveLength(1);
  });
});
