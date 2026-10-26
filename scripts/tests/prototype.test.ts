/**
 * Regressioni del prototipo di design (`design/`): dati coerenti, schermate, controlli, schermata singola.
 * Uso: `node --test scripts/tests/prototype.test.ts` (jsdom non funziona bene sotto Bun, per questo usa Node).
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

const DIR = join(import.meta.dirname, '..', '..', 'design');
const read = (f: string) => readFileSync(join(DIR, f), 'utf8');
const page = read('index.html');
// Gli script esterni si eseguono a mano (jsdom non carica file locali); quello in linea resta per ultimo.
const inline = page.match(/<script>([\s\S]*?)<\/script>/)![1];
const html = page.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<link[^>]*>/g, '');

/* eslint-disable @typescript-eslint/no-explicit-any */
function boot(search = '') {
  const errors: string[] = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e: Error) => errors.push(e.message));
  // console.assert dei dati: un'asserzione fallita è un errore del test
  virtualConsole.on('assert', (ok: boolean, msg: string) => ok || errors.push(`assert: ${msg}`));
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: `http://localhost/index.html${search}`, pretendToBeVisual: true, virtualConsole });
  const w = dom.window as any;
  w.document.fonts = { ready: Promise.resolve() };
  for (const f of ['data.js', 'charts.js', 'screens.js']) w.eval(read(f));
  w.eval(inline);
  const $ = (s: string): any => w.document.querySelector(s);
  const $$ = (s: string): any[] => [...w.document.querySelectorAll(s)];
  const click = (el: any) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  return { w, errors, $, $$, click, root: w.document.documentElement as any };
}

describe('dati di esempio', () => {
  const p = boot();
  test('nessun errore e nessuna asserzione fallita', () => assert.deepEqual(p.errors, []));
  test('il totale del giorno è la somma dei pasti, le kcal rimanenti tornano', () => {
    const F = p.w.FORMA;
    const sum = F.meals.reduce((a: number, m: any) => a + m.tot.k, 0);
    assert.equal(sum, F.eaten.k);
    assert.equal(F.left, F.goal.k - F.eaten.k);
  });
});

describe('galleria', () => {
  const p = boot();
  test('nove schermate, ognuna con un solo h1', () => {
    const phones = p.$$('.phone');
    assert.equal(phones.length, 9);
    assert.deepEqual(phones.filter((ph) => ph.querySelectorAll('h1').length !== 1).map((ph) => ph.dataset.s), []);
  });
  test('la barra delle tab segna la sezione giusta e manca nella scheda alimento', () => {
    const cur = (s: string) => p.$(`.phone[data-s="${s}"] .tabs [aria-current]`)?.getAttribute('aria-label') ?? null;
    assert.equal(cur('oggi'), 'Oggi');
    assert.equal(cur('pasti'), 'Pasti');
    assert.equal(cur('statistiche'), 'Statistiche');
    assert.equal(cur('allenamento'), 'Allenamento');
    assert.equal(p.$('.phone[data-s="sessione"] .tabs'), null);
    assert.equal(p.$('.phone[data-s="alimento"] .tabs'), null);
  });
  test('nei testi niente trattini lunghi, salvo negli intervalli tra numeri', () => {
    const bad = p.$$('.phone').filter((ph) => /[—–]/.test(ph.textContent.replace(/\d–\d/g, ''))).map((ph) => ph.dataset.s);
    assert.deepEqual(bad, []);
  });
  test('piattaforma, tema e accento cambiano la pagina', () => {
    p.click(p.$('[data-k="os"][data-v="ios"]'));
    p.click(p.$('[data-k="theme"][data-v="dark"]'));
    p.click(p.$('[data-k="accent"][data-v="#e0446a"]'));
    assert.equal(p.root.dataset.os, 'ios');
    assert.equal(p.root.dataset.theme, 'dark');
    assert.equal(p.root.style.getPropertyValue('--accent'), '#e0446a');
    assert.equal(p.$('[data-k="theme"][data-v="dark"]').getAttribute('aria-pressed'), 'true');
  });
});

describe('schermata singola', () => {
  test('?s=pasti mostra solo Pasti, a tutta pagina', () => {
    const p = boot('?s=pasti');
    assert.ok(p.w.document.body.classList.contains('solo'));
    assert.deepEqual(p.$$('.phone').map((ph) => ph.dataset.s), ['pasti']);
  });
});
