import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { accentScale, Accents, mix, ON_WARNING, Palette, RoutineColors, statusScale, type Scheme } from '@/constants/theme';

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const SCHEMES: Scheme[] = ['light', 'dark'];

describe('mix', () => {
  test('mescola due colori e rispetta gli estremi', () => {
    expect(mix('#FF0000', '#0000FF', 1)).toBe('#ff0000');
    expect(mix('#FF0000', '#0000FF', 0)).toBe('#0000ff');
    expect(mix('#FFFFFF', '#000000', 0.5)).toBe('#808080');
  });
});

describe('contrasto del testo (≥ 4,5:1)', () => {
  test('testo e testo secondario sulle superfici', () => {
    for (const s of SCHEMES) {
      const p = Palette[s];
      for (const bg of [p.bg, p.card]) {
        expect(contrast(p.ink, bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.ink2, bg)).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(p.onPrimary, p.primary)).toBeGreaterThanOrEqual(4.5);
    }
  });
  test('testo sulle tinte di ogni accento (anche i colori delle schede, che fanno da accento)', () => {
    for (const s of SCHEMES) for (const accent of [...Object.values(Accents), ...Object.values(RoutineColors)]) {
      const a = accentScale(accent, s);
      expect(contrast(a.accentInk, a.tint)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(a.accentInk, a.tintStrong)).toBeGreaterThanOrEqual(4.5);
    }
  });
  test('spunta bianca sul colore pieno di una scheda (giorno fatto): segno grafico, almeno 3:1', () => {
    for (const c of Object.values(RoutineColors)) expect(contrast('#FFFFFF', c)).toBeGreaterThanOrEqual(3);
  });
  test('testo sui pulsanti di stato pieni', () => {
    const st = statusScale('light');
    expect(contrast('#FFFFFF', st.danger.solid)).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#FFFFFF', st.success.solid)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ON_WARNING, st.warning.solid)).toBeGreaterThanOrEqual(4.5);
  });
  test('testo colorato sulle tinte di stato, su card e su fondo, in entrambi i temi', () => {
    for (const s of SCHEMES) {
      const st = statusScale(s);
      for (const k of ['danger', 'warning', 'success'] as const) {
        expect(contrast(st[k].ink, st[k].tint)).toBeGreaterThanOrEqual(4.5);
        // il pulsante soft può stare su una card o direttamente sul fondo: la tinta è calcolata sulla card,
        // quindi sul fondo (più scuro in chiaro) il contrasto è un po' più basso: controllo anche quel caso
        const onBg = mix(st[k].solid, Palette[s].bg, s === 'dark' ? 0.16 : 0.11);
        expect(contrast(st[k].ink, onBg)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe('global.css', () => {
  const css = readFileSync(join(import.meta.dirname, '..', '..', 'src', 'global.css'), 'utf8');
  const root = css.slice(css.indexOf(':root'));
  const value = (name: string) => root.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1].toLowerCase();
  test('i valori predefiniti (tema chiaro, accento corallo) coincidono con theme.ts', () => {
    const p = Palette.light;
    const a = accentScale(Accents.corallo, 'light');
    const st = statusScale('light');
    const expected: Record<string, string> = {
      bg: p.bg, card: p.card, ink: p.ink, 'ink-2': p.ink2, line: p.line, control: p.control, primary: p.primary,
      'on-primary': p.onPrimary, track: p.track, accent: a.accent, 'accent-ink': a.accentInk, tint: a.tint,
      'tint-strong': a.tintStrong, prot: p.prot, carb: p.carb, fat: p.fat,
      danger: st.danger.solid, 'danger-tint': st.danger.tint, 'danger-ink': st.danger.ink,
      warning: st.warning.solid, 'warning-tint': st.warning.tint, 'warning-ink': st.warning.ink, 'warning-on': st.onWarning,
      success: st.success.solid, 'success-tint': st.success.tint, 'success-ink': st.success.ink,
    };
    const wrong = Object.entries(expected).filter(([k, v]) => value(k) !== v.toLowerCase()).map(([k, v]) => `${k}: css ${value(k)} ≠ theme ${v}`);
    expect(wrong).toEqual([]);
  });
});
