import { and, eq, inArray, like, type SQL } from 'drizzle-orm';

import { foods } from '@/db/schema';
import type { Db } from '@/db/types';
import { normalize, queryWords, words } from '@/lib/text';

export type Food = typeof foods.$inferSelect;
export type SearchFilter = 'all' | 'recent' | 'favorites' | 'mine';
/** Una riga di risultato: lo stesso nome da fonti diverse è una riga sola con più versioni. */
export type FoodHit = { food: Food; versions: Food[] };

/** Nome da mostrare nella lingua corrente, con ripiego sull'altra. */
export const foodName = (f: Pick<Food, 'nameIt' | 'nameEn'>, lang: string) =>
  (lang === 'it' ? f.nameIt || f.nameEn : f.nameEn || f.nameIt) ?? '';

const CANDIDATES = 500;

/**
 * Ricerca alimenti (specifica: design.md, "Ricerca alimenti").
 * - Parole in qualsiasi ordine, ognuna come inizio di parola, senza accenti né maiuscole, su nomi IT/EN/FR.
 * - Ordine: nome nella lingua corrente > comincia con una parola cercata > parole intere > CIQUAL > nome corto.
 */
export function searchFoods(
  db: Db,
  query: string,
  { lang, filter = 'all', ids, limit = 20 }: { lang: string; filter?: SearchFilter; ids?: string[]; limit?: number },
): FoodHit[] {
  const toks = queryWords(query);
  if (!toks.length) return [];
  if ((filter === 'recent' || filter === 'favorites') && !ids?.length) return [];

  const where: SQL[] = toks.map((t) => like(foods.searchText, `% ${t}%`));
  if (filter === 'mine') where.push(eq(foods.source, 'custom'));
  if ((filter === 'recent' || filter === 'favorites') && ids) where.push(inArray(foods.id, ids));
  const rows = db.select().from(foods).where(and(...where)).limit(CANDIDATES).all();

  const scored = rows.map((f) => {
    const name = foodName(f, lang);
    const own = words(name);
    let score = toks.every((t) => own.some((w) => w.startsWith(t))) ? 0 : -50;
    if (own[0] && toks.some((t) => own[0].startsWith(t))) score += 30;
    score += toks.filter((t) => own.includes(t)).length * 10;
    if (f.source === 'ciqual') score += 5;
    score -= name.length / 4;
    return { f, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const groups = new Map<string, FoodHit>();
  for (const { f } of scored) {
    const key = normalize(foodName(f, lang));
    const g = groups.get(key);
    if (g) g.versions.push(f);
    else groups.set(key, { food: f, versions: [f] });
  }
  return [...groups.values()].slice(0, limit);
}
