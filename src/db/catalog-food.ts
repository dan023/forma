/** Forma di una voce di `assets/data/foods.json` (generato da `scripts/catalog/build-food-catalog.ts`). Valori per 100 g. */
export type CatalogFood = {
  /** Deterministico (`ciqual:<codice>`, `usda:<fdc_id>`): le voci del diario restano valide se il catalogo cambia. */
  id: string;
  source: 'ciqual' | 'usda';
  sourceId: string;
  nameFr: string | null;
  nameIt: string;
  nameEn: string;
  category: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  saturatedFat: number | null;
  sodium: number | null;
  micros: Record<string, number>;
  portions: { label: string; grams: number }[];
};

export type CatalogMeta = { version: string; count: number };
