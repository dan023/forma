import { eq, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type { CatalogFood, CatalogMeta } from './catalog-food';
import { foodPortions, foods, settings } from './schema';

type Db = BaseSQLiteDatabase<'sync', unknown, typeof import('./schema')>;

const VERSION_KEY = 'foodCatalogVersion';
// SQLite limita le variabili per statement: righe per insert = limite / colonne (foods: 19, food_portions: 4).
const FOODS_PER_INSERT = 40;
const PORTIONS_PER_INSERT = 200;
const FOODS_PER_TRANSACTION = 1500;

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Porta il catalogo alimenti incluso nell'app (`assets/data/foods.json`) nel DB locale.
 *
 * Si esegue solo se la versione in `foods.meta.json` è diversa da quella già importata, quindi
 * agli avvii successivi costa una lettura. Upsert per id: le voci del diario che puntano a un alimento
 * del catalogo restano valide anche quando il catalogo viene aggiornato. Gli alimenti personalizzati
 * (`source = 'custom'`) non vengono toccati.
 *
 * `loadFoods` è iniettato per caricare il file grosso (7 MB) solo quando serve.
 */
export async function seedFoods(
  db: Db,
  meta: CatalogMeta,
  loadFoods: () => CatalogFood[],
  onProgress?: (done: number, total: number) => void,
): Promise<boolean> {
  const current = db.select().from(settings).where(eq(settings.key, VERSION_KEY)).get();
  if (current && JSON.parse(current.value) === meta.version) return false;

  const catalog = loadFoods();
  for (let start = 0; start < catalog.length; start += FOODS_PER_TRANSACTION) {
    const chunk = catalog.slice(start, start + FOODS_PER_TRANSACTION);
    db.transaction((tx) => {
      for (let i = 0; i < chunk.length; i += FOODS_PER_INSERT) {
        tx.insert(foods)
          .values(
            chunk.slice(i, i + FOODS_PER_INSERT).map((f) => ({
              id: f.id,
              source: f.source,
              sourceId: f.sourceId,
              nameIt: f.nameIt,
              nameFr: f.nameFr,
              nameEn: f.nameEn,
              category: f.category,
              kcal: f.kcal,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
              fiber: f.fiber,
              sugar: f.sugar,
              saturatedFat: f.saturatedFat,
              sodium: f.sodium,
              micros: f.micros,
            })),
          )
          .onConflictDoUpdate({
            target: foods.id,
            set: {
              nameIt: sql`excluded.name_it`,
              nameFr: sql`excluded.name_fr`,
              nameEn: sql`excluded.name_en`,
              category: sql`excluded.category`,
              kcal: sql`excluded.kcal`,
              protein: sql`excluded.protein`,
              carbs: sql`excluded.carbs`,
              fat: sql`excluded.fat`,
              fiber: sql`excluded.fiber`,
              sugar: sql`excluded.sugar`,
              saturatedFat: sql`excluded.saturated_fat`,
              sodium: sql`excluded.sodium`,
              micros: sql`excluded.micros`,
            },
          })
          .run();
      }

      // Le porzioni del catalogo si rigenerano da zero (id `<alimento>#<n>`); quelle dell'utente hanno altri id.
      const ids = chunk.map((f) => f.id);
      for (let i = 0; i < ids.length; i += 500) {
        tx.delete(foodPortions)
          .where(sql`${foodPortions.foodId} in (${sql.join(ids.slice(i, i + 500).map((id) => sql`${id}`), sql`, `)}) and ${foodPortions.id} like '%#%'`)
          .run();
      }
      const portions = chunk.flatMap((f) =>
        f.portions.map((p, n) => ({ id: `${f.id}#${n}`, foodId: f.id, label: p.label, grams: p.grams })),
      );
      for (let i = 0; i < portions.length; i += PORTIONS_PER_INSERT) {
        tx.insert(foodPortions).values(portions.slice(i, i + PORTIONS_PER_INSERT)).run();
      }
    });
    onProgress?.(Math.min(start + FOODS_PER_TRANSACTION, catalog.length), catalog.length);
    await tick(); // lascia respirare il thread JS tra un blocco e l'altro
  }

  db.insert(settings)
    .values({ key: VERSION_KEY, value: JSON.stringify(meta.version) })
    .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } })
    .run();
  return true;
}
