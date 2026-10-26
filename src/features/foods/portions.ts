/**
 * Porzioni e quantità rapide. Le porzioni del catalogo vengono dall'USDA e sono in inglese ("1 cup", "2 tbsp",
 * "3 oz"): in italiano si traducono le unità comuni; le misure imperiali e le etichette lunghe si mostrano solo
 * in grammi (`portionLabel` restituisce null).
 */

type Unit = [singular: string, plural: string];

// Unità USDA (al singolare, minuscolo) → italiano. Solo quelle che hanno senso in cucina.
const UNITS_IT: Record<string, Unit> = {
  cup: ['tazza', 'tazze'],
  tbsp: ['cucchiaio', 'cucchiai'],
  tablespoon: ['cucchiaio', 'cucchiai'],
  tsp: ['cucchiaino', 'cucchiaini'],
  teaspoon: ['cucchiaino', 'cucchiaini'],
  slice: ['fetta', 'fette'],
  piece: ['pezzo', 'pezzi'],
  serving: ['porzione', 'porzioni'],
  jar: ['vasetto', 'vasetti'],
  container: ['vasetto', 'vasetti'],
  can: ['lattina', 'lattine'],
  bar: ['barretta', 'barrette'],
  fillet: ['filetto', 'filetti'],
  steak: ['bistecca', 'bistecche'],
  chop: ['costoletta', 'costolette'],
  egg: ['uovo', 'uova'],
  bottle: ['bottiglia', 'bottiglie'],
  packet: ['bustina', 'bustine'],
  cookie: ['biscotto', 'biscotti'],
  muffin: ['muffin', 'muffin'],
  roll: ['panino', 'panini'],
  medium: ['medio', 'medi'],
  large: ['grande', 'grandi'],
  small: ['piccolo', 'piccoli'],
};
const IMPERIAL = /\b(oz|lb|pound|quart|pint|gallon|fl)\b/i;

/** Singolare di una parola inglese semplice ("tomatoes" → "tomato", "slices" → "slice"). */
const singular = (w: string) => (w.endsWith('oes') ? w.slice(0, -2) : w.endsWith('es') && UNITS_IT[w.slice(0, -2)] ? w.slice(0, -2) : w.endsWith('s') ? w.slice(0, -1) : w);

const formatAmount = (n: number, lang: string) => new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(n);

/**
 * Etichetta di una porzione nella lingua dell'app, o null se si mostra solo in grammi. In inglese resta quella del
 * catalogo (senza misure imperiali); in italiano solo "<quantità> <unità>" con un'unità nota.
 */
export function portionLabel(label: string, lang: string): string | null {
  const clean = label.trim();
  if (!clean || IMPERIAL.test(clean)) return null;
  if (lang === 'en') return clean;
  const m = /^(\d+(?:[.,]\d+)?|½|¼)\s+([a-z]+)$/i.exec(clean);
  if (!m) return null;
  const amount = m[1] === '½' ? 0.5 : m[1] === '¼' ? 0.25 : Number(m[1].replace(',', '.'));
  const unit = UNITS_IT[singular(m[2].toLowerCase())];
  if (!unit || !Number.isFinite(amount) || amount <= 0) return null;
  return `${formatAmount(amount, lang)} ${amount > 1 ? unit[1] : unit[0]}`;
}

export type QuickAmount = { grams: number; label: string | null };
export type PortionRow = { label: string; grams: number };

/**
 * Quanto aggiunge il "+" della ricerca: l'ultima quantità usata di quell'alimento; se non c'è, la prima porzione
 * del catalogo con un nome; altrimenti 100 g. L'etichetta è quella di una porzione con gli stessi grammi, se c'è.
 */
export function quickAmount(lastGrams: number | null | undefined, portions: PortionRow[], lang: string): QuickAmount {
  const named = portions.map((p) => ({ grams: Math.round(p.grams), label: portionLabel(p.label, lang) }));
  // Senza un'ultima volta: la prima porzione con un nome leggibile ("1 oz" da sola non direbbe niente), o 100 g.
  const grams = lastGrams != null && lastGrams > 0 ? Math.round(lastGrams) : (named.find((p) => p.label)?.grams ?? 100);
  return { grams, label: named.find((p) => p.grams === grams && p.label)?.label ?? null };
}
