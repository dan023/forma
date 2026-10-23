/* Dati di esempio uguali per tutte le versioni: cambia il design, non i numeri.
   Le kcal di ogni alimento e i totali si calcolano dai macro e dalle righe del diario,
   mai scritti a mano (le asserzioni in fondo lo controllano). */
(function () {
  const it = new Intl.NumberFormat('it-IT');
  const fmt = (n, d = 0) => new Intl.NumberFormat('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const sign = (n, d = 1) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), d);

  // Valori per 100 g (p = proteine, c = carboidrati, f = grassi). kcal = 4p + 4c + 9f.
  const foods = {
    avena: { n: 'Fiocchi d’avena', p: 13.5, c: 58.7, f: 7.0 },
    latte: { n: 'Latte parzialmente scremato', p: 3.4, c: 4.9, f: 1.6 },
    banana: { n: 'Banana', p: 1.1, c: 22.8, f: 0.3 },
    pasta: { n: 'Pasta di semola, cruda', p: 12.5, c: 74.0, f: 1.5 },
    pollo: { n: 'Pollo, petto, crudo', p: 23.0, c: 0, f: 1.2 },
    olio: { n: 'Olio di oliva, extra vergine', p: 0, c: 0, f: 100 },
    zucchine: { n: 'Zucchine, crude', p: 1.2, c: 3.1, f: 0.3 },
    yogurt: { n: 'Yogurt greco 0%', p: 10.0, c: 3.9, f: 0.2 },
    mandorle: { n: 'Mandorle', p: 21.0, c: 10.0, f: 50.0 },
  };
  Object.values(foods).forEach((f) => { f.k = Math.round(4 * f.p + 4 * f.c + 9 * f.f); });

  const mealsRaw = [
    { id: 'colazione', n: 'Colazione', time: '07:40', items: [['avena', 60], ['latte', 200], ['banana', 120]] },
    { id: 'pranzo', n: 'Pranzo', time: '13:05', items: [['pasta', 90], ['pollo', 150], ['olio', 10], ['zucchine', 200]] },
    { id: 'spuntino', n: 'Spuntino', time: '16:30', items: [['yogurt', 170], ['mandorle', 20]] },
    { id: 'cena', n: 'Cena', time: '', items: [] },
  ];
  const calc = (key, g) => (foods[key]) ? {
    g, k: Math.round(foods[key].k * g / 100), p: +(foods[key].p * g / 100).toFixed(1),
    c: +(foods[key].c * g / 100).toFixed(1), f: +(foods[key].f * g / 100).toFixed(1),
  } : null;
  const sum = (rows) => rows.reduce((a, r) => ({ k: a.k + r.k, p: a.p + r.p, c: a.c + r.c, f: a.f + r.f }), { k: 0, p: 0, c: 0, f: 0 });
  const meals = mealsRaw.map((m) => {
    const items = m.items.map(([key, g]) => ({ key, name: foods[key].n, ...calc(key, g) }));
    const t = sum(items);
    return { ...m, items, tot: { k: t.k, p: +t.p.toFixed(1), c: +t.c.toFixed(1), f: +t.f.toFixed(1) } };
  });
  const eaten = sum(meals.map((m) => m.tot));
  eaten.p = +eaten.p.toFixed(1); eaten.c = +eaten.c.toFixed(1); eaten.f = +eaten.f.toFixed(1);

  const goal = { p: 160, c: 260, f: 70 };
  goal.k = 4 * goal.p + 4 * goal.c + 9 * goal.f; // 2.310

  // Allenamento di oggi: Push A, doppia progressione 6-10 rip.
  const sets = [
    { kg: 60, reps: 10, done: true }, { kg: 70, reps: 8, done: true },
    { kg: 75, reps: 6, done: false, current: true }, { kg: 75, reps: 6, done: false },
  ];
  const volume = sets.filter((s) => s.done).reduce((a, s) => a + s.kg * s.reps, 0); // 60*10 + 70*8
  const session = {
    name: 'Push A', ex: 'Panca piana', equip: 'Bilanciere', rule: 'Doppia progressione 6–10',
    sets, rest: { left: 92, total: 120 }, volume, elapsed: '41:12',
    next: ['Military press', 'Croci ai cavi', 'French press'],
    e1rm: Math.round(75 * (1 + 6 / 30)), // Epley sull’ultima serie in corso
    plan: [['Panca piana', '4 × 6–10'], ['Military press', '3 × 8–12'], ['Croci ai cavi', '3 × 12–15'], ['French press', '3 × 10–12']],
  };

  const weight = {
    now: 78.4, target: 76.0,
    days: ['gio', 'ven', 'sab', 'dom', 'lun', 'mar', 'mer'],
    series: [79.1, 79.0, 78.8, 78.9, 78.6, 78.5, 78.4],
  };
  weight.delta = +(weight.series[6] - weight.series[0]).toFixed(1);

  const stats = {
    weeks: ['set 2', 'set 9', 'set 16', 'set 23', 'ott 7', 'ott 14', 'ott 21'],
    volume: [9.8, 10.4, 11.1, 10.2, 12.0, 12.6, 13.1], // tonnellate a settimana
    kcalWeek: [2210, 2380, 2290, 2150, 2410, 2060], // lun-sab precedenti: giorni chiusi
    week: [ // lun → dom
      { d: 'L', s: 'done', label: 'Push A' }, { d: 'M', s: 'rest', label: 'Riposo' },
      { d: 'M', s: 'today', label: 'Push A' }, { d: 'G', s: 'plan', label: 'Pull A' },
      { d: 'V', s: 'rest', label: 'Riposo' }, { d: 'S', s: 'plan', label: 'Gambe' }, { d: 'D', s: 'rest', label: 'Riposo' },
    ],
  };

  const day = { label: 'mer 21 ott', long: 'Mercoledì 21 ottobre', type: 'Giorno di allenamento', time: '18:20' };
  const week = ['lun 19', 'mar 20', 'mer 21', 'gio 22', 'ven 23', 'sab 24', 'dom 25'];

  // Controlli di coerenza: se un dato non torna, lo si vede in console.
  console.assert(Math.round(meals.reduce((a, m) => a + m.tot.k, 0)) === eaten.k, 'kcal: pasti ≠ totale');
  console.assert(volume === 1160, 'volume serie fatte');
  console.assert(goal.k === 2310, 'obiettivo kcal');

  window.FORMA = { it, fmt, sign, foods, meals, eaten, goal, session, weight, stats, day, week, left: goal.k - eaten.k };
})();
