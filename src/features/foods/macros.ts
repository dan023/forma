import type { IconName } from '@/components/ui/icon';
import type { Nutrients } from '@/features/diary/diary';

/** I tre macro, nell'ordine in cui si mostrano ovunque, con le kcal per grammo. */
export const MACROS = [
  { key: 'protein', color: 'prot', kcalPerGram: 4 },
  { key: 'carbs', color: 'carb', kcalPerGram: 4 },
  { key: 'fat', color: 'fat', kcalPerGram: 9 },
] as const;
export type MacroColor = (typeof MACROS)[number]['color'];
type Macros = Pick<Nutrients, 'protein' | 'carbs' | 'fat'>;

/** Kcal portate da ciascun macro (4/4/9 kcal per grammo). */
export const macroKcal = (n: Macros) => MACROS.map((m) => ({ ...m, kcal: n[m.key] * m.kcalPerGram }));

/** Il macro che porta più kcal: dà il colore all'icona di un alimento. Senza macro, i carboidrati. */
export function dominantMacro(n: Macros): MacroColor {
  return macroKcal(n).reduce((a, b) => (b.kcal > a.kcal ? b : a)).color;
}

/** Quota delle kcal di ogni macro, da 0 a 1 (somma 1, o 0 se non ci sono macro). */
export function macroShares(n: Macros): Record<keyof Macros, number> {
  const parts = macroKcal(n);
  const total = parts.reduce((a, p) => a + p.kcal, 0);
  return Object.fromEntries(parts.map((p) => [p.key, total ? p.kcal / total : 0])) as Record<keyof Macros, number>;
}

// Categorie del catalogo (CIQUAL in minuscolo, USDA con le maiuscole), dalla più specifica alla più generica.
const CATEGORY_ICONS: [RegExp, IconName][] = [
  [/fish|shellfish/i, 'fish'],
  [/beef|lamb|veal|game|pork|poultry|sausage|meat/i, 'meat'],
  [/nut|seed/i, 'nut'],
  [/fruit/i, 'fruit'],
  [/vegetable|legume/i, 'leaf'],
  [/fats? and oils/i, 'drop'],
  [/milk|dairy|egg|ice cream/i, 'milk'],
  [/cereal|grain|pasta|baked|breakfast/i, 'grain'],
  [/sweet|sugar|confection|snack/i, 'candy'],
  [/beverage/i, 'cup'],
];

// Due categorie CIQUAL mettono insieme cose diverse: lì decide il nome inglese dell'alimento.
const FISH = /fish|salmon|tuna|cod|trout|sardine|anchov|mackerel|hake|sea bass|sole|shrimp|prawn|mussel|clam|oyster|squid|octopus|crab|lobster|scallop/i;
const NUTS = /\bnuts?\b|almond|walnut|hazelnut|pistachio|cashew|peanut|pecan|chestnut|seed|pine nut/i;
const FRUIT = /fruit|apple|banana|orange|pear|peach|apricot|plum|cherr|grape|berr|melon|kiwi|lemon|lime|mandarin|clementine|\bfig|mango|pineapple|papaya|pomegranate|date|raisin|prune/i;
const BROAD: Record<string, (name: string) => IconName> = {
  'meat, egg and fish': (name) => (FISH.test(name) ? 'fish' : /\begg/i.test(name) ? 'milk' : 'meat'),
  'fruits, vegetables, legumes and nuts': (name) => (NUTS.test(name) ? 'nut' : FRUIT.test(name) ? 'fruit' : 'leaf'),
};

/**
 * Icona della categoria di un alimento (con `nameEn` per le categorie CIQUAL larghe); per i piatti, le
 * minestre e ciò che non ha categoria, una ciotola.
 */
export function categoryIcon(category: string | null | undefined, nameEn = ''): IconName {
  if (!category) return 'bowl';
  if (category in BROAD) return BROAD[category](nameEn);
  return CATEGORY_ICONS.find(([re]) => re.test(category))?.[1] ?? 'bowl';
}
