/**
 * Elenca i segmenti dei nomi non ancora nel glossario, dal più frequente, con la traduzione automatica
 * e i segnali di sospetto, per correggerli in `glossary-it.json`.
 *
 * Uso: bun run catalog:review [--limit 250] [--offset 0] [--flagged]
 *   --limit    quanti segmenti mostrare (default 250)
 *   --offset   da quale posizione della classifica partire (default 0)
 *   --flagged  mostra solo i segmenti con almeno un sospetto
 *
 * Flusso: `catalog:review` → aggiungi le voci a glossary-it.json → `catalog:build` → ripeti.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { glossary, isBrand, machine, splitSegments } from './names';

type Food = { nameEn: string };

const arg = (name: string, fallback: number) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? Number(process.argv[i + 1]) : fallback;
};
const limit = arg('limit', 250);
const offset = arg('offset', 0);
const onlyFlagged = process.argv.includes('--flagged');

const foods: Food[] = JSON.parse(readFileSync(join(import.meta.dir, '..', '..', 'assets', 'data', 'foods.json'), 'utf8'));
const counts = new Map<string, number>();
for (const f of foods) for (const seg of splitSegments(f.nameEn)) counts.set(seg, (counts.get(seg) ?? 0) + 1);

const words = (s: string) => s.toLowerCase().match(/\p{L}+/gu) ?? [];

/** Motivi per cui una traduzione automatica è probabilmente sbagliata. */
function suspicions(en: string, it: string): string[] {
  const out: string[] = [];
  if (it === en && !/^[\d\p{P}\s]+$/u.test(en)) out.push('uguale all’originale');
  if (/\b(\p{L}+)(?: \1\b)+/iu.test(it)) out.push('parola ripetuta');
  if (words(en).length === 1) out.push('una sola parola');
  if (words(it).length > words(en).length * 2 + 1) out.push('molto più lunga');
  if (/[.!?]$/.test(it)) out.push('punteggiatura finale');
  const enWords = new Set(words(en));
  if (words(it).some((w) => w.length > 3 && enWords.has(w))) out.push('parola inglese rimasta');
  return out;
}

let total = 0;
let covered = 0;
const pending: { seg: string; n: number; it: string; flags: string[] }[] = [];
for (const [seg, n] of [...counts].sort((a, b) => b[1] - a[1])) {
  total += n;
  if (isBrand(seg) || glossary.has(seg.toLowerCase())) { covered += n; continue; }
  const it = machine[seg] ?? seg;
  pending.push({ seg, n, it, flags: suspicions(seg, it) });
}

console.log(`Coperti dal glossario: ${((covered / total) * 100).toFixed(1)}% delle occorrenze (${glossary.size} voci).`);
console.log(`Segmenti da rivedere: ${pending.length}${onlyFlagged ? ' (filtro: sospetti)' : ''}\n`);

const shown = (onlyFlagged ? pending.filter((p) => p.flags.length) : pending).slice(offset, offset + limit);
for (const p of shown) console.log(`${p.n}× ${p.seg} => ${p.it}${p.flags.length ? `   [${p.flags.join(', ')}]` : ''}`);
