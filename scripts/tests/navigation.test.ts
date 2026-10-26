import { describe, expect, test } from 'bun:test';

import { screenId } from '../../src/lib/screen-id';

describe('identità delle schermate (niente doppioni con i tocchi ripetuti)', () => {
  test('stessi parametri, in qualsiasi ordine, danno la stessa schermata', () => {
    expect(screenId('esercizio/[id]', { id: 'ex:1', pick: '1' })).toBe(screenId('esercizio/[id]', { pick: '1', id: 'ex:1' }));
    expect(screenId('allenamento/sessione', undefined)).toBe(screenId('allenamento/sessione', {}));
  });
  test('parametri diversi restano schermate distinte', () => {
    expect(screenId('esercizio/[id]', { id: 'ex:1' })).not.toBe(screenId('esercizio/[id]', { id: 'ex:2' }));
    expect(screenId('allenamento/esercizi', {})).not.toBe(screenId('allenamento/esercizi', { routine: 'r1' }));
  });
  test('i parametri interni di Expo Router e quelli vuoti non contano', () => {
    expect(screenId('cerca', { meal: 'pranzo', __internal_expo_router_no_animation: true, x: undefined })).toBe(screenId('cerca', { meal: 'pranzo' }));
  });
});
