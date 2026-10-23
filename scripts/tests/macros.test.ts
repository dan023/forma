import { describe, expect, test } from 'bun:test';

import { categoryIcon, dominantMacro, macroShares } from '@/features/foods/macros';

describe('macro di un alimento', () => {
  test('il colore viene dal macro che porta più kcal, non da quello con più grammi', () => {
    expect(dominantMacro({ protein: 23, carbs: 0, fat: 1.2 })).toBe('prot'); // pollo
    expect(dominantMacro({ protein: 12.5, carbs: 74, fat: 1.5 })).toBe('carb'); // pasta
    // mandorle: più proteine in grammi che grassi in kcal? no: 21×4 = 84 contro 50×9 = 450
    expect(dominantMacro({ protein: 21, carbs: 10, fat: 50 })).toBe('fat');
  });
  test('le quote delle kcal sommano 1, o sono tutte 0 senza macro', () => {
    const s = macroShares({ protein: 10, carbs: 20, fat: 5 });
    expect(s.protein + s.carbs + s.fat).toBeCloseTo(1);
    expect(macroShares({ protein: 0, carbs: 0, fat: 0 })).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });
});

describe('icona per categoria del catalogo', () => {
  test('categorie CIQUAL e USDA', () => {
    expect(categoryIcon('Finfish and Shellfish Products')).toBe('fish');
    expect(categoryIcon('Poultry Products')).toBe('meat');
    expect(categoryIcon('Nut and Seed Products')).toBe('nut');
    expect(categoryIcon('Cereal Grains and Pasta')).toBe('grain');
    expect(categoryIcon('milk and milk products')).toBe('milk');
    expect(categoryIcon('Fats and Oils')).toBe('drop');
    expect(categoryIcon('Beverages')).toBe('cup');
  });
  test('le categorie CIQUAL larghe guardano il nome', () => {
    expect(categoryIcon('meat, egg and fish', 'Chicken, breast, raw')).toBe('meat');
    expect(categoryIcon('meat, egg and fish', 'Salmon, raw')).toBe('fish');
    expect(categoryIcon('meat, egg and fish', 'Egg, boiled')).toBe('milk');
    expect(categoryIcon('fruits, vegetables, legumes and nuts', 'Banana, pulp, raw')).toBe('fruit');
    expect(categoryIcon('fruits, vegetables, legumes and nuts', 'Almond, dried')).toBe('nut');
    expect(categoryIcon('fruits, vegetables, legumes and nuts', 'Zucchini, raw')).toBe('leaf');
  });
  test('piatti, minestre e categorie mancanti: ciotola', () => {
    expect(categoryIcon('starters and dishes')).toBe('bowl');
    expect(categoryIcon(null)).toBe('bowl');
  });
});
