/** Token di design di Forma (vedi design.md). Valori in OKLCH convertiti in sRGB. Font, raggi e spaziature stanno in src/global.css (Tailwind). */

export type Scheme = 'light' | 'dark';

export const Palette = {
  light: {
    bg: '#EBEAE8',
    card: '#EEEDEB',
    ink: '#262320',
    ink2: '#5C5751',
    line: '#D6D3CF',
    shadowDark: 'rgba(196,190,182,0.75)',
    shadowLight: 'rgba(255,253,250,0.95)',
    frame: '#1F1D1B',
    ok: '#4FA57B',
  },
  dark: {
    bg: '#2C2A28',
    card: '#302E2C',
    ink: '#F1EFEC',
    ink2: '#C1BCB6',
    line: '#4A4744',
    shadowDark: 'rgba(28,26,24,0.9)',
    shadowLight: 'rgba(80,76,72,0.55)',
    frame: '#151413',
    ok: '#6BC496',
  },
} as const;

export type Colors = (typeof Palette)[Scheme];

/** Accenti preset. `ink` = testo sopra l'accento (sempre scuro). */
export const Accents = {
  arancio: '#F0863A',
  corallo: '#EE7F72',
  ambra: '#E9B23C',
  salvia: '#6DBE8C',
  oceano: '#4BA6D8',
  viola: '#A67DD9',
} as const;
export type AccentName = keyof typeof Accents;
export const ACCENT_INK = '#3B1E0A';

