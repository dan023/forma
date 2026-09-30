/**
 * Unisce CIQUAL 2025 + USDA FoodData Central (Foundation + SR Legacy) in `assets/data/foods.json`.
 * Uso: bun run catalog:build   (dopo `bash scripts/catalog/fetch-sources.sh`)
 *
 * Tutti i valori nutrizionali sono per 100 g. Gli id sono deterministici (`ciqual:<codice>`,
 * `usda:<fdc_id>`) così le voci del diario restano valide se il catalogo viene rigenerato.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { translateName } from './names';

const ROOT = join(import.meta.dir, '..', '..');
const RAW = join(ROOT, 'data', 'raw');
const OUT = join(ROOT, 'assets', 'data', 'foods.json');

type CatalogFood = {
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

const round = (n: number) => Math.round(n * 100) / 100;

// ---------- CSV ----------
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const readCsv = (path: string) => parseCsv(readFileSync(path, 'utf8'));

// ---------- CIQUAL ----------
const decode = (s: string) =>
  s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();

/** Estrae i blocchi `<TAG>...</TAG>` come oggetti { campo: testo }. */
function* xmlRecords(text: string, tag: string) {
  const block = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  const field = /<(\w+)(?: missing="[^"]*")?\s*(?:\/>|>([\s\S]*?)<\/\1>)/g;
  for (const m of text.matchAll(block)) {
    const rec: Record<string, string> = {};
    for (const f of m[1].matchAll(field)) rec[f[1]] = decode(f[2] ?? '');
    yield rec;
  }
}

/** "12,5" → 12.5 · "< 0,1" / "traces" → 0 · "-" o vuoto → null. */
function ciqualNumber(raw: string | undefined): number | null {
  if (!raw || raw === '-') return null;
  if (raw === 'traces' || raw.startsWith('<')) return 0;
  const n = Number(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const CIQUAL_MICROS: Record<string, string> = {
  '10200': 'calcium_mg', '10260': 'iron_mg', '10190': 'potassium_mg', '10120': 'magnesium_mg',
  '10300': 'zinc_mg', '10150': 'phosphorus_mg', '55100': 'vitaminC_mg', '52100': 'vitaminD_ug',
  '56600': 'vitaminB12_ug', '75100': 'cholesterol_mg', '51104': 'vitaminA_ug', '53100': 'vitaminE_mg',
  '56700': 'folate_ug', '60000': 'alcohol_g',
};

function buildCiqual(): CatalogFood[] {
  const dir = join(RAW, 'ciqual');
  const read = (f: string) => readFileSync(join(dir, f), 'utf8');

  const groups = new Map<string, string>();
  for (const g of xmlRecords(read('alim_grp.xml'), 'ALIM_GRP')) groups.set(g.alim_grp_code, g.alim_grp_nom_eng);

  const values = new Map<string, Map<string, number>>();
  for (const c of xmlRecords(read('compo.xml'), 'COMPO')) {
    const v = ciqualNumber(c.teneur);
    if (v === null) continue;
    let m = values.get(c.alim_code);
    if (!m) values.set(c.alim_code, (m = new Map()));
    m.set(c.const_code, v);
  }

  const foods: CatalogFood[] = [];
  for (const a of xmlRecords(read('alim.xml'), 'ALIM')) {
    const v = values.get(a.alim_code);
    if (!v) continue;
    const kcal = v.get('328') ?? v.get('333') ?? (v.has('327') ? v.get('327')! / 4.184 : undefined);
    if (kcal === undefined) continue;
    const micros: Record<string, number> = {};
    for (const [code, key] of Object.entries(CIQUAL_MICROS)) {
      const x = v.get(code);
      if (x !== undefined) micros[key] = round(x);
    }
    foods.push({
      id: `ciqual:${a.alim_code}`,
      source: 'ciqual',
      sourceId: a.alim_code,
      nameFr: a.alim_nom_fr || null,
      nameIt: translateName(a.alim_nom_eng || a.alim_nom_fr),
      nameEn: a.alim_nom_eng || a.alim_nom_fr,
      category: groups.get(a.alim_grp_code) ?? null,
      kcal: round(kcal),
      protein: round(v.get('25000') ?? v.get('25003') ?? 0),
      carbs: round(v.get('31000') ?? 0),
      fat: round(v.get('40000') ?? 0),
      fiber: v.has('34100') ? round(v.get('34100')!) : null,
      sugar: v.has('32000') ? round(v.get('32000')!) : null,
      saturatedFat: v.has('40302') ? round(v.get('40302')!) : null,
      sodium: v.has('10110') ? round(v.get('10110')!) : null,
      micros,
      portions: [],
    });
  }
  return foods;
}

// ---------- USDA ----------
const USDA_MICROS: Record<string, string> = {
  '1087': 'calcium_mg', '1089': 'iron_mg', '1092': 'potassium_mg', '1090': 'magnesium_mg',
  '1095': 'zinc_mg', '1091': 'phosphorus_mg', '1162': 'vitaminC_mg', '1114': 'vitaminD_ug',
  '1178': 'vitaminB12_ug', '1253': 'cholesterol_mg', '1106': 'vitaminA_ug', '1109': 'vitaminE_mg',
  '1190': 'folate_ug', '1018': 'alcohol_g',
};

function findDataset(base: string) {
  const dir = join(RAW, 'usda', base);
  const sub = existsSync(dir) ? readdirSync(dir).find((d) => existsSync(join(dir, d, 'food.csv'))) : undefined;
  if (!sub) throw new Error(`Dataset USDA mancante in ${dir}: esegui scripts/catalog/fetch-sources.sh`);
  return join(dir, sub);
}

function cleanPortionLabel(amount: string, unit: string, description: string, modifier: string) {
  const what = [unit && unit !== 'undetermined' ? unit : '', description, modifier].filter(Boolean).join(' ').trim();
  const n = Number(amount);
  const qty = Number.isFinite(n) && n > 0 ? String(round(n)) : '1';
  return `${qty} ${what || 'porzione'}`.replace(/\s+/g, ' ').trim();
}

function buildUsda(base: string, dataType: string): CatalogFood[] {
  const dir = findDataset(base);
  const rows = readCsv(join(dir, 'food.csv')).filter((r) => r.data_type === dataType);
  const ids = new Set(rows.map((r) => r.fdc_id));
  const categories = new Map(readCsv(join(dir, 'food_category.csv')).map((r) => [r.id, r.description]));
  const units = new Map(readCsv(join(dir, 'measure_unit.csv')).map((r) => [r.id, r.name]));

  const nutrients = new Map<string, Map<string, number>>();
  for (const r of readCsv(join(dir, 'food_nutrient.csv'))) {
    if (!ids.has(r.fdc_id) || r.amount === '') continue;
    let m = nutrients.get(r.fdc_id);
    if (!m) nutrients.set(r.fdc_id, (m = new Map()));
    m.set(r.nutrient_id, Number(r.amount));
  }

  const portions = new Map<string, { label: string; grams: number }[]>();
  for (const r of readCsv(join(dir, 'food_portion.csv'))) {
    const grams = Number(r.gram_weight);
    if (!ids.has(r.fdc_id) || !(grams > 0)) continue;
    const label = cleanPortionLabel(r.amount, units.get(r.measure_unit_id) ?? '', r.portion_description, r.modifier);
    const list = portions.get(r.fdc_id) ?? [];
    if (list.length < 6 && !list.some((p) => p.label === label)) list.push({ label, grams: round(grams) });
    portions.set(r.fdc_id, list);
  }

  const foods: CatalogFood[] = [];
  for (const r of rows) {
    const v = nutrients.get(r.fdc_id);
    if (!v) continue;
    const kcal = v.get('1008') ?? v.get('2047') ?? v.get('2048');
    if (kcal === undefined) continue;
    const micros: Record<string, number> = {};
    for (const [id, key] of Object.entries(USDA_MICROS)) {
      const x = v.get(id);
      if (x !== undefined) micros[key] = round(x);
    }
    const sugar = v.get('1063') ?? v.get('2000');
    foods.push({
      id: `usda:${r.fdc_id}`,
      source: 'usda',
      sourceId: r.fdc_id,
      nameFr: null,
      nameIt: translateName(r.description),
      nameEn: r.description,
      category: categories.get(r.food_category_id) ?? null,
      kcal: round(kcal),
      protein: round(v.get('1003') ?? 0),
      carbs: round(v.get('1005') ?? 0),
      fat: round(v.get('1004') ?? 0),
      fiber: v.has('1079') ? round(v.get('1079')!) : null,
      sugar: sugar === undefined ? null : round(sugar),
      saturatedFat: v.has('1258') ? round(v.get('1258')!) : null,
      sodium: v.has('1093') ? round(v.get('1093')!) : null,
      micros,
      portions: portions.get(r.fdc_id) ?? [],
    });
  }
  return foods;
}

// ---------- main ----------
const ciqual = buildCiqual();
const foundation = buildUsda('foundation', 'foundation_food');
const sr = buildUsda('sr', 'sr_legacy_food');

const foods = [...ciqual, ...foundation, ...sr];
writeFileSync(OUT, JSON.stringify(foods));

console.log(`CIQUAL: ${ciqual.length} · USDA Foundation: ${foundation.length} · USDA SR Legacy: ${sr.length}`);
console.log(`Totale: ${foods.length} alimenti → ${OUT} (${(readFileSync(OUT).length / 1e6).toFixed(1)} MB)`);
