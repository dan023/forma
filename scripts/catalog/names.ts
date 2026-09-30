/**
 * Traduzione italiana dei nomi degli alimenti (usata da `build-food-catalog.ts` e `review-translations.ts`).
 *
 * Il nome inglese è una lista di descrittori ("Beef, loin, raw"): si traduce segmento per segmento.
 * Precedenza: glossario a mano (`glossary-it.json`) → traduzione automatica (`translations-it.json`,
 * generata da `translate-it.py`) → testo originale. Tutto avviene in build: a runtime non si traduce nulla.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = import.meta.dir;
const readJson = <T>(file: string): T => JSON.parse(readFileSync(join(DIR, file), 'utf8')) as T;

export const machine = readJson<Record<string, string>>('translations-it.json');
export const glossary = new Map(
  Object.entries(readJson<Record<string, string>>('glossary-it.json')).map(([k, v]) => [k.toLowerCase(), v]),
);

/** Divide sulle virgole fuori da parentesi. */
export function splitSegments(name: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of name) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
}

/** Marchi in maiuscolo (QUAKER, ABBOTT NUTRITION) restano invariati. */
export const isBrand = (s: string) => s.length > 1 && s === s.toUpperCase() && s !== s.toLowerCase();

/** "congelato congelato" → "congelato": la traduzione automatica a volte ripete le parole. */
export const dedupeWords = (s: string) => s.replace(/\b(\p{L}+)(?: \1\b)+/giu, '$1');

const lowerFirst = (s: string) => (/^\p{Lu}\p{Ll}/u.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Traduzione di un segmento (senza maiuscole/minuscole di posizione). */
export function translateSegment(seg: string): string {
  if (isBrand(seg)) return seg;
  const fixed = glossary.get(seg.toLowerCase());
  if (fixed !== undefined) return fixed;
  return dedupeWords((machine[seg] ?? seg).replace(/[.!]+$/, ''));
}

export function translateName(nameEn: string): string {
  return splitSegments(nameEn)
    .map((seg, i) => (i === 0 ? upperFirst(translateSegment(seg)) : lowerFirst(translateSegment(seg))))
    .join(', ');
}
