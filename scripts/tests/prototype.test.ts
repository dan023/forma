/**
 * Regressioni del prototipo di design (`design/`): schermate, ricerca, tweakbar, piattaforme.
 * Uso: `node --test scripts/tests/prototype.test.ts` (jsdom non funziona bene sotto Bun, per questo usa Node).
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';

/** Piccolo `expect` sopra node:assert, con la stessa sintassi dei test Bun. */
function expect(actual: any) {
  const api = {
    toBe: (v: any) => assert.equal(actual, v),
    toEqual: (v: any) => assert.deepEqual(actual, v),
    toHaveLength: (n: number) => assert.equal(actual.length, n),
    toBeGreaterThan: (n: number) => assert.ok(actual > n, `${actual} non è maggiore di ${n}`),
    toContain: (v: string) => assert.ok(String(actual).includes(v), `"${actual}" non contiene "${v}"`),
    toBeNull: () => assert.equal(actual, null),
    not: { toBeNull: () => assert.notEqual(actual, null) },
  };
  return api;
}

const DIR = join(import.meta.dirname, '..', '..', 'design');
const read = (f: string) => readFileSync(join(DIR, f), 'utf8');
const html = read('index.html').replace(/<script src="[^"]*"><\/script>/g, '').replace(/<link[^>]*>/g, '');

/* eslint-disable @typescript-eslint/no-explicit-any */
const windows: any[] = [];
// Il prototipo ha un setInterval (timer di recupero): senza chiudere le finestre Node non termina.
after(() => windows.forEach((w) => w.close()));

function boot(search = '') {
  const errors: string[] = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e: Error) => errors.push(e.message));
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: `http://localhost/index.html${search}`, pretendToBeVisual: true, virtualConsole });
  const w = dom.window as any;
  windows.push(w);
  w.matchMedia = () => ({ matches: false });
  for (const f of ['sample-foods.js', 'screens-extra.js', 'app.js', 'tweaks.js']) w.eval(read(f).replace('const SAMPLE_FOODS', 'var SAMPLE_FOODS'));
  const $ = (s: string): any => w.document.querySelector(s);
  const $$ = (s: string): any[] => [...w.document.querySelectorAll(s)];
  const click = (el: any) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  return { w, errors, $, $$, click, root: w.document.documentElement as any };
}

describe('schermate', () => {
  const p = boot();
  test('ogni voce della colonna sinistra apre la sua pagina', () => {
    const chips = p.$$('.chips [data-s]');
    expect(chips.length).toBe(28);
    const bad = chips.filter((c) => (p.click(c), p.$('.page.on').id !== 'p-' + c.dataset.s)).map((c) => c.dataset.s);
    expect(bad).toEqual([]);
  });
  test('nessun link porta a una pagina inesistente', () => {
    const ids = new Set(p.$$('.page').map((e) => e.id.slice(2)));
    const missing = p.$$('[data-go]').map((e) => e.dataset.go).filter((k) => !ids.has(k));
    expect(missing).toEqual([]);
  });
  test('onboarding in 4 passi fino a "Oggi vuoto", con la barra nascosta', () => {
    p.click(p.$('[data-s="onb"]'));
    const path = [p.$('.page.on').id];
    for (let i = 0; i < 4; i++) (p.click(p.$('.page.on .btn')), path.push(p.$('.page.on').id));
    expect(path).toEqual(['p-onb', 'p-onb2', 'p-onb3', 'p-onb4', 'p-oggi-vuoto']);
    p.click(p.$('[data-s="onb2"]'));
    expect(p.$('#nav').style.display).toBe('none');
  });
  test('una pagina figlia evidenzia la voce della sua sezione', () => {
    for (const [k, tab] of [['sessione', 1], ['versioni', 2], ['dati', 4], ['peso', 0]] as const) {
      p.click(p.$(`[data-s="${k}"]`));
      expect(p.$$('.tab').findIndex((t) => t.getAttribute('aria-selected') === 'true')).toBe(tab);
    }
  });
  test('un solo h1 per pagina e nessun trattino lungo nei testi', () => {
    expect(p.$$('.page').filter((e) => e.querySelectorAll('h1').length !== 1).map((e) => e.id)).toEqual([]);
    expect(p.$$('.page').filter((e) => /[—–]/.test(e.textContent)).map((e) => e.id)).toEqual([]);
  });
  test('nessun errore JS', () => expect(p.errors).toEqual([]));
});

describe('ricerca alimenti', () => {
  const p = boot();
  const search = (q: string) => {
    p.click(p.$('[data-s="cerca"]'));
    const input = p.$('#q');
    input.value = q;
    input.dispatchEvent(new p.w.Event('input', { bubbles: true }));
    return p.$$('#s-body .result b').map((b) => b.textContent as string);
  };
  test('parole in qualsiasi ordine e parole vuote ignorate', () => {
    expect(search('petto di pollo')[0]).toBe('Pollo, petto, senza pelle, crudo');
    expect(search('pol pet')[0]).toBe('Pollo, petto, senza pelle, crudo');
  });
  test('cerca anche in inglese e francese', () => {
    expect(search('egg').length).toBeGreaterThan(0);
    expect(search('pomme').some((n) => n.startsWith('Mela'))).toBe(true);
  });
  test('stesso nome da fonti diverse: una riga con il numero di versioni', () => {
    expect(search('broccoli')).toHaveLength(1);
    expect(p.$('#s-body .result small').textContent).toContain('3 versioni');
  });
  test('nessun risultato propone di creare l’alimento', () => {
    expect(search('sushiroll')).toHaveLength(0);
    expect(p.$('#s-body .empty').textContent).toContain('Crea “sushiroll”');
  });
  test('aggiunta rapida: bottone con spunta e avviso', () => {
    search('riso');
    p.click(p.$('[data-add]'));
    expect(p.$('[data-add]').textContent).toBe('✓');
    expect(p.$('#toast').hidden).toBe(false);
  });
  test('nessun errore JS', () => expect(p.errors).toEqual([]));
});

describe('tweakbar', () => {
  const p = boot();
  const seg = (txt: string) => p.$$('.tw-seg button').find((b) => b.textContent === txt);
  const range = (id: string, v: number) => {
    const i = p.$('#tw-' + id);
    i.value = String(v);
    i.dispatchEvent(new p.w.Event('input', { bubbles: true }));
  };
  test('i controlli cambiano i token e si salvano', () => {
    p.$('.tw-toggle').click();
    expect(p.$('#tw-panel').classList.contains('open')).toBe(true);
    p.click(seg('Piatto'));
    expect(p.root.dataset.surface).toBe('flat');
    p.click(seg('Squadrato'));
    expect(p.root.style.getPropertyValue('--r-btn')).toBe('6px');
    range('rCard', 12);
    range('h', 200);
    expect(p.root.style.getPropertyValue('--r-lg')).toBe('12px');
    expect(p.root.style.getPropertyValue('--accent')).toBe('oklch(70% 0.17 200)');
    expect(Object.keys(JSON.parse(p.w.localStorage.getItem('forma-tweaks'))).length).toBe(18);
  });
  test('l’accento scelto nelle Impostazioni riallinea gli slider', () => {
    p.click(p.$$('#sw .sw')[3]);
    expect(p.$('#tw-h').value).toBe('150');
  });
  test('"Copia token" esporta e "Ripristina" torna a Neve', () => {
    p.click(p.$$('.tw-foot button').find((b) => b.textContent === 'Copia token'));
    expect(JSON.parse(p.$('.tw-export textarea').value).colore.accento).toBe('oklch(74% 0.12 150)');
    p.click(p.$$('.tw-foot button').find((b) => b.textContent === 'Ripristina'));
    expect(p.root.dataset.surface).toBe('neu');
    expect(p.root.style.getPropertyValue('--r-lg')).toBe('28px');
  });
  test('nessun errore JS', () => expect(p.errors).toEqual([]));
});

describe('piattaforme iOS 26 / Android', () => {
  const p = boot();
  const plat = (k: string) => p.click(p.$(`[data-plat="${k}"]`));
  test('iOS è il default, Android cambia barra di stato', () => {
    expect(p.root.dataset.platform).toBe('ios');
    expect(p.$('#statusbar').textContent.trim().startsWith('9:41')).toBe(true);
    plat('android');
    expect(p.root.dataset.platform).toBe('android');
    expect(p.$('#statusbar').textContent.trim().startsWith('12:30')).toBe(true);
  });
  test('"Affianca" mostra iOS e l’anteprima Android incorporata', () => {
    plat('both');
    expect(p.w.document.body.classList.contains('compare')).toBe(true);
    expect(p.root.dataset.platform).toBe('ios');
    expect(p.$('#twin').hidden).toBe(false);
    expect(p.$('#twin').src).toContain('solo=1&p=android');
  });
  test('le due anteprime navigano insieme, ma un messaggio estraneo è ignorato', () => {
    const msg = (k: string, source: any) => p.w.dispatchEvent(new p.w.MessageEvent('message', { data: { forma: 'go', k }, source }));
    msg('peso', p.$('#twin').contentWindow);
    expect(p.$('.page.on').id).toBe('p-peso');
    msg('dati', p.w);
    expect(p.$('.page.on').id).toBe('p-peso');
  });
  test('la tweakbar avvisa che su iOS 26 la forma della barra è di sistema', () => {
    plat('ios');
    expect(p.$('.tw-hint').hidden).toBe(false);
    expect(p.$('.tw-dim')).not.toBeNull();
    plat('android');
    expect(p.$('.tw-hint').hidden).toBe(true);
    expect(p.$('.tw-dim')).toBeNull();
  });
  test('su iOS la barra si riduce scorrendo e si riapre toccandola', () => {
    plat('ios');
    p.click(p.$('[data-s="oggi"]'));
    const page = p.$('.page.on');
    let top = 0;
    Object.defineProperty(page, 'scrollTop', { get: () => top, configurable: true });
    const scroll = (v: number) => ((top = v), page.dispatchEvent(new p.w.Event('scroll')));
    scroll(40), scroll(120), scroll(200);
    expect(p.$('#nav').classList.contains('min')).toBe(true);
    p.click(p.$$('#nav .tab')[0]);
    expect(p.$('#nav').classList.contains('min')).toBe(false);
    scroll(300), scroll(400), scroll(380);
    expect(p.$('#nav').classList.contains('min')).toBe(false);
  });
  test('l’anteprima incorporata parte su Android, nella schermata richiesta', () => {
    const s = boot('?solo=1&p=android&s=cerca');
    expect(s.w.document.body.classList.contains('solo')).toBe(true);
    expect(s.root.dataset.platform).toBe('android');
    expect(s.$('.page.on').id).toBe('p-cerca');
    expect(s.errors).toEqual([]);
  });
  test('nessun errore JS', () => expect(p.errors).toEqual([]));
});
