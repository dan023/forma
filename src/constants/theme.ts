/**
 * Token di design di Forma, direzione "Calma" (vedi design.md). Font, raggi e utility stanno in src/global.css.
 * Superfici piatte: card (`card`) su fondo (`bg`) con un solo gradino di tono, nessuna ombra.
 * L'accento è una scala: pieno solo sui piccoli segni, le sue tinte (`tint`, `tintStrong`) sulle aree.
 */

export type Scheme = 'light' | 'dark';

export const Palette = {
  light: {
    bg: '#F2F0EE',
    card: '#FFFFFF',
    ink: '#18181B',
    ink2: '#6A6A70',
    line: '#EBE8E5',
    control: '#E6E3E0',
    primary: '#1C1C1F',
    onPrimary: '#FFFFFF',
    track: '#EEECEA',
    prot: '#3B7FD9',
    carb: '#E9A019',
    fat: '#33A46C',
  },
  dark: {
    bg: '#0F0F10',
    card: '#1B1B1D',
    ink: '#F3F2F0',
    ink2: '#A3A2A7',
    line: '#2A2A2D',
    control: '#2C2C2F',
    primary: '#F3F2F0',
    onPrimary: '#141416',
    track: '#2A2A2D',
    prot: '#5D9CF2',
    carb: '#F2B440',
    fat: '#4DBF86',
  },
} as const;

export type Colors = (typeof Palette)[Scheme];

/**
 * Accenti tra cui sceglie l'utente. Niente blu, verdi o ambra: sono i colori fissi dei macro
 * (proteine, grassi, carboidrati) e l'accento non deve confondersi con loro.
 */
export const Accents = {
  corallo: '#EF5F3C',
  lampone: '#E0446A',
  fucsia: '#C93D9B',
  ardesia: '#4F5D73',
} as const;
export type AccentName = keyof typeof Accents;
export const DEFAULT_ACCENT: AccentName = 'corallo';

/** Mescola due colori `#RRGGBB` (come `color-mix` in sRGB): `amount` = quota di `a`. */
export function mix(a: string, b: string, amount: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) => Math.round(ch(a, i) * amount + ch(b, i) * (1 - amount)));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Colori di stato, solo per pulsanti e avvisi (mai nei dati: il verde e l'ambra dei macro sono un'altra cosa).
 * Uguali nei due temi: il testo sopra è bianco (pericolo, successo) o quasi nero (avviso), con contrasto ≥ 4,5:1.
 */
export const Status = { danger: '#C93535', warning: '#EBA21C', success: '#0F7A69' } as const;
export const ON_WARNING = '#2B1B00';

/** Scala di un colore di stato: pieno, tinta per le aree, inchiostro per il testo sopra la tinta. */
export function statusScale(scheme: Scheme) {
  const card = Palette[scheme].card;
  const one = (c: string) => ({
    solid: c,
    tint: mix(c, card, scheme === 'dark' ? 0.16 : 0.11),
    ink: scheme === 'dark' ? mix(c, '#FFFFFF', 0.7) : mix(c, '#000000', 0.5),
  });
  return { danger: one(Status.danger), warning: one(Status.warning), success: one(Status.success), onWarning: ON_WARNING };
}

/** La scala dell'accento sul tema corrente: tinte per le aree, inchiostro per il testo sopra le tinte. */
export function accentScale(accent: string, scheme: Scheme) {
  const p = Palette[scheme];
  return {
    accent,
    tint: mix(accent, p.card, scheme === 'dark' ? 0.16 : 0.11),
    tintStrong: mix(accent, p.card, scheme === 'dark' ? 0.3 : 0.22),
    accentInk: scheme === 'dark' ? mix(accent, '#FFFFFF', 0.55) : mix(accent, '#000000', 0.62),
  };
}
