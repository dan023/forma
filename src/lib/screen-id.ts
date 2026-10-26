/**
 * Identità di una schermata nello stack: il nome più i parametri (esclusi quelli interni di Expo Router).
 * Usata come `dangerouslySingular` delle schermate in `src/app/_layout.tsx`: con gli stessi parametri una schermata
 * c'è al più una volta, quindi un tocco ripetuto mentre si apre non la impila di nuovo. Con parametri diversi (il
 * catalogo per aggiungere a una scheda e quello normale, due esercizi) restano schermate distinte.
 */
export function screenId(name: string, params: Record<string, unknown> | undefined): string {
  const own = Object.entries(params ?? {})
    .filter(([k, v]) => !k.startsWith('__internal') && v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join('/') : String(v)}`);
  return [name, ...own].join('?');
}
