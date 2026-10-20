/** Testo per la ricerca: minuscolo, senza accenti, diviso in parole (lettere e cifre). */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const words = (s: string) => normalize(s).split(/[^a-z0-9]+/).filter(Boolean);

/** Parole ignorate nelle ricerche: "petto di pollo" deve trovare "Pollo, petto, ...". */
const STOP = new Set(['di', 'del', 'della', 'dei', 'delle', 'da', 'con', 'e', 'il', 'la', 'le', 'in', 'al', 'a', 'of', 'and', 'with', 'the']);

/** Parole significative di una ricerca; se sono tutte parole vuote, le tiene. */
export function queryWords(q: string): string[] {
  const all = words(q);
  const kept = all.filter((w) => !STOP.has(w));
  return kept.length ? kept : all;
}

/**
 * Colonna `search_text` di un alimento: tutte le parole dei nomi (IT, EN, FR), con uno spazio
 * prima di ognuna, così `LIKE '% pol%'` trova solo gli inizi di parola.
 */
export const searchText = (...names: (string | null | undefined)[]) =>
  ` ${words(names.filter(Boolean).join(' ')).join(' ')} `;
