/* Forma "Calma": le schermate, costruite dai dati di data.js.
   Ogni schermata risponde a una domanda; la risposta è l'elemento più grande. */
(function () {
  const F = window.FORMA;
  const { fmt } = F;
  const kg = (n) => fmt(n, 1);

  // ---------- icone (contorno, tratto 1,75) ----------
  const P = {
    home: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
    bowl: '<path d="M3.5 11.5h17a8.5 8 0 0 1-17 0Z"/><path d="M9 8c0-1.6 1.2-2 1.2-3.6M13.5 8c0-1.6 1.2-2 1.2-3.6"/>',
    dumbbell: '<path d="M6.5 7.5v9M3.5 10v4M17.5 7.5v9M20.5 10v4M6.5 12h11"/>',
    chart: '<path d="M5 20v-6M12 20V5M19 20v-9"/>',
    sliders: '<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    barcode: '<path d="M4 6v12M7.5 6v12M11 6v12M13.5 6v12M17 6v12M20 6v12"/>',
    scale: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M8.5 10a5 5 0 0 1 7 0M12 12.5l1.6-2.6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    back: '<path d="m14.5 5-7 7 7 7"/>',
    star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6Z"/>',
    down: '<path d="m7 10 5 5 5-5"/>',
    cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="4"/><path d="M8 3.5v4M16 3.5v4M4 10.5h16"/>',
    grain: '<path d="M12 21V8.5"/><path d="M12 8.5c-2.4 0-4-1.7-4-4 2.4 0 4 1.7 4 4Zm0 0c2.4 0 4-1.7 4-4-2.4 0-4 1.7-4 4Zm0 5.5c-2.4 0-4-1.7-4-4 2.4 0 4 1.7 4 4Zm0 0c2.4 0 4-1.7 4-4-2.4 0-4 1.7-4 4Z"/>',
    milk: '<path d="M9 3h6M9.5 3v3L7 9.5V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5L14.5 6V3"/><path d="M7 13.5h10"/>',
    fruit: '<path d="M4.5 7c-.5 7 4.5 13 13.5 11.5 1.3-.2 1.2-1.5 0-1.7C11.5 15.7 8 12 7.6 7"/><path d="M4.5 7 5 4.3M7.6 7 7.4 4.3"/>',
    meat: '<path d="M4 13.5C4 8.5 8 5 13 5s7 3 7 6.5S17 19 11 19c-4 0-7-2.2-7-5.5Z"/><circle cx="14" cy="11" r="2.2"/>',
    drop: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z"/>',
    leaf: '<path d="M5 19C5 11 10 5 20 5c0 10-6 15-14 15"/><path d="m5 19 8-8"/>',
    cup: '<path d="M5 9h14l-1.5 11h-11Z"/><path d="M4 9h16M9 9V6h6v3"/>',
    nut: '<path d="M12 3c4 3 6 7 6 11a6 6 0 0 1-12 0c0-4 2-8 6-11Z"/><path d="M12 8.5v7"/>',
    flame: '<path d="M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.4 1.2-3.9 2.4-5 .2 1.6.9 2.6 2 3C11 9 11 6 12 3Z"/>',
    right: '<path d="m9.5 5 7 7-7 7"/>',
    more: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
    // schede: icone tra cui sceglie l'utente
    barbell: '<path d="M2.5 12h19M6 7.5v9M8.5 9v6M18 7.5v9M15.5 9v6"/>',
    kettlebell: '<path d="M8.6 9.2 8 6.6A2 2 0 0 1 10 4h4a2 2 0 0 1 2 2.6l-.6 2.6"/><circle cx="12" cy="14.5" r="5.5"/>',
    run: '<circle cx="15" cy="4.5" r="1.8"/><path d="m13 8-3.5 2.5L7 13.5M13 8l-1 5.5 3 3-1 4.5M12 13.5 8.5 21M13 8l3 3h3"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="m6 16 4-7h5l3 7M10 9l3 7H6M14 6h3"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-11h-6Z"/>',
    heart: '<path d="M12 19.5s-7.5-4.5-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10Z"/>',
    mountain: '<path d="M3 19 9.5 8l4 6.5L16 11l5 8Z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0ZM8 6H5.5a2.5 2.5 0 0 0 2.6 3.8M16 6h2.5a2.5 2.5 0 0 1-2.6 3.8M12 13v4M8.5 20.5h7M10 17h4v3.5h-4Z"/>',
    // pasti: icone tra cui sceglie l'utente (le prime quattro ai pasti predefiniti)
    mug: '<path d="M5 8h11v7.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 15.5Z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8.5 2.5c-.7 1 .7 2 0 3M12.5 2.5c-.7 1 .7 2 0 3"/>',
    plate: '<circle cx="12" cy="12.5" r="5.5"/><path d="M3.5 4v4.5a1.5 1.5 0 0 0 3 0V4M5 9v11M20.5 4c-1.6.8-2.5 3-2.5 6v2.5h2.5V20"/>',
    apple: '<path d="M12 8.5c-1.5-1.2-3.6-1.5-5.1-.4C4.7 9.6 4.4 13 5.9 16.4c1.2 2.7 3 4.3 4.5 3.8.7-.3 1.1-.5 1.6-.5s.9.2 1.6.5c1.5.5 3.3-1.1 4.5-3.8 1.5-3.4 1.2-6.8-1-8.3-1.5-1.1-3.6-.8-5.1.4Z"/><path d="M12 8.5c0-2 .8-3.6 2.6-4.5"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    coffee: '<path d="M6 9.5h10V13a4.5 4.5 0 0 1-4.5 4.5h-1A4.5 4.5 0 0 1 6 13Z"/><path d="M16 10.5h1.5a2 2 0 0 1 0 4H16M4 20.5h14M9 3.5c-.6.9.6 1.8 0 2.7M13 3.5c-.6.9.6 1.8 0 2.7"/>',
    shaker: '<path d="M8 8h8l-1 12.5H9Z"/><path d="M7.5 8h9M9 8V4.5h6V8M9.4 13h5.2"/>',
    eyeoff: '<path d="M3.5 12s3-6 8.5-6c1.6 0 3 .5 4.2 1.2M20.5 12s-3 6-8.5 6c-1.6 0-3-.5-4.2-1.2M4 4l16 16"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    link: '<path d="M10 14a3.5 3.5 0 0 0 5 0l3.5-3.5a3.5 3.5 0 0 0-5-5L12 7"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3.5 3.5a3.5 3.5 0 0 0 5 5L12 17"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    up: '<path d="m5 14.5 7-7 7 7"/>',
  };
  // ---------- figura delle zone del corpo ----------
  // Una figura a capsule sempre uguale, in tono tenue; la zona allenata è piena. Cardio usa il cuore con il battito.
  const FIG = {
    head: '<circle cx="12" cy="3.1" r="1.9" fill="currentColor" stroke="none"/>',
    neck: '<path d="M12 5.5v1" stroke-width="2.2"/>',
    shoulders: '<path d="M8 7.9h.01M16 7.9h.01" stroke-width="2.9"/>',
    chest: '<path d="M10.4 8.9h.9M12.7 8.9h.9" stroke-width="2.7"/>',
    back: '<path d="M9.4 7.8h5.2l-1.4 5h-2.4Z" fill="currentColor" stroke-width="1.2"/>',
    abs: '<path d="M12 11.2v2.8" stroke-width="3.3"/>',
    upperArms: '<path d="M7.3 9.6 6.8 12M16.7 9.6l.5 2.4" stroke-width="2.2"/>',
    lowerArms: '<path d="M6.6 13.6 6.2 16M17.4 13.6l.4 2.4" stroke-width="1.9"/>',
    hips: '<path d="M10.6 15.8h2.8" stroke-width="2.6"/>',
    thighs: '<path d="M10.4 17.2 10.1 19.6M13.6 17.2l.3 2.4" stroke-width="2.5"/>',
    calves: '<path d="M10.1 21 10 22.6M13.9 21l.1 1.6" stroke-width="2"/>',
  };
  const BASE = ['head', 'neck', 'shoulders', 'chest', 'abs', 'upperArms', 'lowerArms', 'hips', 'thighs', 'calves'];
  const figure = (on) => `<g opacity=".4">${BASE.filter((k) => !on.includes(k)).map((k) => FIG[k]).join('')}</g>${on.map((k) => FIG[k]).join('')}`;
  Object.assign(P, {
    zChest: figure(['chest']), zBack: figure(['back']), zShoulders: figure(['shoulders']), zArms: figure(['upperArms']),
    zForearms: figure(['lowerArms']), zAbs: figure(['abs']), zLegs: figure(['hips', 'thighs']), zCalves: figure(['calves']), zNeck: figure(['neck']),
    zCardio: '<path d="M12 19.5s-7.5-4.5-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10Z"/><path d="M7.5 12.5h2.2l1.1-2 1.9 4 1.1-2h2.7"/>',
  });
  // le zone si inquadrano da vicino: il busto per quelle alte, le gambe per quelle basse
  const VB = { zChest: '4 1 16 16', zBack: '4 1 16 16', zShoulders: '4 1 16 16', zArms: '4 1 16 16', zForearms: '3.5 4.5 17 17', zAbs: '4 3 16 16', zNeck: '4 -1 16 16',
    zLegs: '4 8 16 16', zCalves: '4 8 16 16' };
  const ic = (k) => `<svg viewBox="${VB[k] ?? '0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;

  // ---------- chrome ----------
  const statusBar = () => `<div class="sb"><span>${F.day.time}</span><span class="r">
    <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="15" height="8" rx="2"/><rect x="23.5" y="4" width="1.8" height="4" rx=".9" opacity=".4"/></svg></span></div><div class="island"></div>`;
  const TABS = [['oggi', 'Oggi', 'home'], ['pasti', 'Pasti', 'bowl'], ['allenamento', 'Allenamento', 'dumbbell'], ['statistiche', 'Statistiche', 'chart'], ['impostazioni', 'Impostazioni', 'sliders']];
  const tabBar = (cur) => `<nav class="tabs" aria-label="Sezioni">${TABS.map(([id, n, i]) =>
    `<a href="#${id}" ${id === cur ? 'aria-current="page"' : ''} aria-label="${n}">${ic(i)}<span>${n}</span></a>`).join('')}</nav>`;

  // ---------- colore che significa qualcosa ----------
  // Ogni macro ha il suo colore fisso (uguale in barre, anelli, icone); le kcal sono l'accento.
  const MAC = [['p', 'Proteine', '--prot', 4], ['c', 'Carboidrati', '--carb', 4], ['f', 'Grassi', '--fat', 9]];
  const GLYPH = { avena: 'grain', latte: 'milk', banana: 'fruit', pasta: 'bowl', pollo: 'meat', olio: 'drop', zucchine: 'leaf', yogurt: 'milk', mandorle: 'nut' };
  // l'icona di un alimento prende il colore del macro che porta più kcal
  const dominant = (x) => MAC.reduce((a, m) => (x[m[0]] * m[3] > x[a[0]] * a[3] ? m : a))[2];
  const tile = (key, size = '') => `<span class="tile ${size}" style="--m:var(${dominant(F.foods[key])})">${ic(GLYPH[key])}</span>`;
  const kcalOf = (x) => MAC.map(([k, , v, m]) => ({ v: x[k] * m, col: `var(${v})` }));
  const stack = (x) => { const parts = kcalOf(x), t = parts.reduce((a, b) => a + b.v, 0) || 1;
    return `<div class="stack" aria-hidden="true">${parts.map((q) => `<i style="flex:${(q.v / t).toFixed(3)};background:${q.col}"></i>`).join('')}</div>`; };
  // anello a segmenti: ogni segmento è una frazione del totale (es. kcal di ogni macro sull'obiettivo)
  const donut = (segs, { size = 140, stroke = 14 } = {}) => {
    const r = (size - stroke) / 2, c = size / 2, L = 2 * Math.PI * r, gap = segs.length > 1 ? 3 : 0;
    let off = 0;
    const arcs = segs.map((q) => { const len = Math.max(0, L * Math.min(q.v, 1) - gap);
      const el = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${q.col}" stroke-width="${stroke}" stroke-dasharray="${len.toFixed(1)} ${L.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${c} ${c})"/>`;
      off += L * q.v; return el; }).join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--track-n)" stroke-width="${stroke}"/>${arcs}</svg>`;
  };

  // ---------- pezzi ----------
  const prog = (v, max, cls = '') => `<div class="prog ${cls}" role="progressbar" aria-valuenow="${Math.round(v)}" aria-valuemax="${max}"><i style="width:${Math.min(100, (v / max) * 100).toFixed(1)}%"></i></div>`;
  const macros = (e) => `<div class="macros">${MAC.map(([k, n, v]) =>
    `<div class="m" style="--a:var(${v})"><span class="label"><i class="dot"></i>${n}</span><span class="v">${fmt(e[k])}<small> / ${fmt(F.goal[k])} g</small></span>${prog(e[k], F.goal[k], 'thin')}</div>`).join('')}</div>`;
  // arco (anello o semianello) disegnato a mano: un binario tinta e il pieno in accento
  const arc = ({ value, size, stroke, half, col = 'var(--accent)' }) => {
    const r = (size - stroke) / 2, c = size / 2;
    const len = half ? Math.PI * r : 2 * Math.PI * r;
    const d = half ? `M ${stroke / 2} ${c} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${c}` : null;
    const shape = (col, dash) => half
      ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${stroke}" stroke-linecap="round" ${dash}/>`
      : `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${col}" stroke-width="${stroke}" stroke-linecap="round" transform="rotate(-90 ${c} ${c})" ${dash}/>`;
    return `<svg width="${size}" height="${half ? c + stroke / 2 : size}" viewBox="0 0 ${size} ${half ? c + stroke / 2 : size}" aria-hidden="true">
      ${shape(col === 'var(--accent)' ? 'var(--track)' : 'var(--track-n)', '')}${shape(col, `stroke-dasharray="${(len * value).toFixed(1)} ${len.toFixed(1)}"`)}</svg>`;
  };

  // ---------- dati derivati ----------
  const pct = Math.round((F.eaten.k / F.goal.k) * 100);
  const doneW = F.stats.week.filter((d) => d.s === 'done').length;
  const planW = F.stats.week.filter((d) => d.s !== 'rest').length;
  const inGoal = F.stats.kcalWeek.filter((k) => Math.abs(k - F.goal.k) / F.goal.k <= 0.1).length;
  const avgK = Math.round(F.stats.kcalWeek.reduce((a, b) => a + b, 0) / F.stats.kcalWeek.length);
  const next = F.stats.week.find((d) => d.s === 'plan');
  const pasta = F.foods.pasta, portion = 90;
  const add = { k: Math.round(pasta.k * portion / 100), p: pasta.p * portion / 100, c: pasta.c * portion / 100, f: pasta.f * portion / 100 };
  // ultimi 7 giorni: 6 giorni chiusi (kcalWeek) + oggi, in corso
  const last7 = F.weight.days.map((d, i) => ({ d, k: i < 6 ? F.stats.kcalWeek[i] : F.eaten.k, today: i === 6 }));
  const vol = F.stats.volume, dVol = +(vol[6] - vol[5]).toFixed(1);
  console.assert(F.left === F.goal.k - F.eaten.k && F.left > 0, 'kcal rimanenti');
  console.assert(add.k === 324, 'kcal di 90 g di pasta');

  // ---------- schermate ----------
  const S = {};

  S.oggi = () => `<main class="page">
    <div class="top"><span class="when">${F.day.long}</span><button class="ibtn" aria-label="Calendario">${ic('cal')}</button></div>
    <h1 class="h1 center">Ti restano<br><span class="num">${fmt(F.left)}</span> kcal</h1>
    <p class="lead center">Giorno di allenamento</p>
    <section class="card" aria-label="Obiettivo di oggi">
      <div class="ends" style="align-items:baseline;margin-bottom:12px"><span class="label">Calorie di oggi</span><b style="font-size:17px">${pct}%</b></div>
      ${prog(F.eaten.k, F.goal.k)}
      <div class="ends" style="margin-top:10px"><span><b>${fmt(F.eaten.k)}</b> mangiate</span><span>obiettivo <b>${fmt(F.goal.k)}</b> kcal</span></div>
      ${macros(F.eaten)}
    </section>
    <nav class="quick" aria-label="Azioni rapide">
      <a href="#alimento"><span class="ibtn">${ic('plus')}</span>Alimento</a>
      <a href="#"><span class="ibtn">${ic('barcode')}</span>Codice</a>
      <a href="#"><span class="ibtn">${ic('scale')}</span>Peso</a>
      <a href="#allenamento"><span class="ibtn">${ic('dumbbell')}</span>Allenati</a>
    </nav>
    <h2 class="sect">Pasti di oggi <a href="#pasti">Diario</a></h2>
    <div class="meals-x">${F.meals.map((m) => m.items.length
      ? `<a class="card mini" href="#pasti"><span class="label">${m.n}</span><b class="num">${fmt(m.tot.k)}<small> kcal</small></b>${stack(m.tot)}
          <span class="tiles">${m.items.map((it) => tile(it.key, 'sm')).join('')}</span></a>`
      : `<a class="card mini add-mini" href="#alimento"><span class="label">${m.n}</span><span class="plus">${ic('plus')}</span><span class="label">Aggiungi</span></a>`).join('')}</div>
    <section class="card tint">
      <p class="label" style="color:var(--accent-ink)">Allenamento di oggi</p>
      <h2 style="font-size:24px;font-weight:700;letter-spacing:-.02em;margin-top:4px">${F.session.name}</h2>
      <p class="lead" style="margin-top:2px">${F.session.plan.length} esercizi: ${F.session.plan.map((p) => p[0]).join(', ')}</p>
      <div class="btns"><button class="btn quiet">Più tardi</button><button class="btn primary">Inizia</button></div>
    </section>
    <h2 class="sect">Riepilogo</h2>
    <div class="row2">
      <section class="card"><span class="label">Peso</span><span class="fig-m">${kg(F.weight.now)}<small>kg</small></span>
        <span class="pill" style="align-self:flex-start">${F.sign(F.weight.delta)} kg in 7 giorni</span>
        <span class="label end">Obiettivo ${kg(F.weight.target)} kg</span></section>
      <section class="card"><span class="label">Allenamenti</span><span class="fig-m">${doneW}<small>di ${planW}</small></span>
        ${prog(doneW, planW, 'thin')}
        <span class="label end">Prossimo: ${next.label}, giovedì</span></section>
    </div>
  </main><!--chrome-->${tabBar('oggi')}`;

  // ---------- pasti: icone dei pasti, righe con quantità e mini barra ----------
  // I pasti hanno un'icona (scelta tra 12) e nessun colore proprio: la tessera è nella tinta dell'accento, come
  // quella degli esercizi. Il colore in Pasti resta dei macro.
  const MEAL_ICON = { colazione: 'mug', pranzo: 'plate', spuntino: 'apple', cena: 'moon' };
  const MEAL_ICONS = ['mug', 'plate', 'apple', 'moon', 'sun', 'coffee', 'bolt', 'dumbbell', 'shaker', 'leaf', 'star', 'heart'];
  const mtile = (icon, size = '') => `<span class="tile acc ${size}">${ic(icon)}</span>`;
  // porzioni tipiche (dal catalogo) e ultima quantità usata (dal diario)
  const PORTIONS = {
    avena: [['1 cucchiaio', 10], ['1 tazza', 80]], latte: [['1 bicchiere', 200], ['1 tazza', 250]], banana: [['1 piccola', 90], ['1 media', 120]],
    pasta: [['1 porzione', 80]], pollo: [['1 fetta', 100]], olio: [['1 cucchiaino', 5], ['1 cucchiaio', 10]], yogurt: [['1 vasetto', 170]],
    mandorle: [['1 manciata', 20]], zucchine: [['1 media', 200]],
  };
  const kOf = (x) => Math.round(4 * x.p + 4 * x.c + 9 * x.f);
  const part = (x, g) => ({ g, k: Math.round(kOf(x) * g / 100), p: x.p * g / 100, c: x.c * g / 100, f: x.f * g / 100 });
  const ftile = (x, glyph, size = '') => `<span class="tile ${size}" style="--m:var(${dominant(x)})">${ic(glyph)}</span>`;
  // mini barra della composizione (quota di kcal di ogni macro)
  const mbar = (x) => { const q = kcalOf(x), t = q.reduce((a, b) => a + b.v, 0) || 1;
    return `<span class="mbar" aria-hidden="true">${q.map((m) => `<i style="flex:${(m.v / t).toFixed(3)};background:${m.col}"></i>`).join('')}</span>`; };
  const portionOf = (key, g) => (PORTIONS[key] ?? []).find(([, pg]) => pg === g)?.[0];
  const qtyText = (key, g) => { const p = portionOf(key, g); return p ? `${p} · ${fmt(g)} g` : `${fmt(g)} g`; };
  const CATS = [['grain', 'Cereali'], ['fruit', 'Frutta'], ['leaf', 'Verdura e legumi'], ['meat', 'Carne'], ['fish', 'Pesce'], ['milk', 'Latticini e uova'],
    ['nut', 'Frutta secca'], ['drop', 'Grassi e oli'], ['candy', 'Dolci'], ['cup', 'Bevande'], ['bowl', 'Piatti']];
  const CAT_NAME = Object.fromEntries(CATS);
  const USUAL = { cena: [['pollo', 150], ['zucchine', 200], ['pasta', 80]], colazione: [['avena', 60], ['latte', 200], ['banana', 120]],
    pranzo: [['pasta', 90], ['pollo', 150], ['olio', 10]], spuntino: [['yogurt', 170], ['mandorle', 20], ['banana', 120]] };

  const pastiPage = (empty) => {
    const e = empty ? { k: 0, p: 0, c: 0, f: 0 } : F.eaten;
    const shares = kcalOf(e), tot = shares.reduce((a, b) => a + b.v, 0) || 1;
    const meals = F.meals.map((m) => {
      const items = empty ? [] : m.items;
      const usual = USUAL[m.id];
      const rows = items.map((it, i) => {
        const li = `<li>${tile(it.key)}<div class="main"><div class="t">${it.name}</div><div class="s">${qtyText(it.key, it.g)}</div>${mbar(it)}</div>
          <div class="v">${fmt(it.k)}<small>kcal</small></div></li>`;
        // una riga scorsa verso sinistra: sotto c'è "Togli"
        return m.id === 'pranzo' && i === 2 ? `<li class="swipe"><span class="act">${ic('trash')}Togli</span><ul class="list foods">${li}</ul></li>` : li;
      }).join('');
      return `<section class="card">
        <div class="meal-h">${mtile(MEAL_ICON[m.id])}<h3>${m.n}</h3>
          ${items.length ? `<span class="k">${fmt(m.tot.k)}<small>kcal</small></span>` : ''}</div>
        ${items.length ? `${stack(m.tot)}<p class="mline">${MAC.map(([k, n, v]) => `<span style="--a:var(${v})"><i class="dot"></i>${n[0]} ${fmt(m.tot[k])} g</span>`).join('')}</p>` : ''}
        ${items.length ? `<ul class="list foods">${rows}</ul>`
          : `<p class="label" style="margin-top:12px">Di solito</p><div class="usual">${usual.map(([k, g]) => {
            const x = F.foods[k], q = part(x, g);
            return `<button aria-label="Aggiungi ${x.n}, ${fmt(g)} g">${tile(k, 'sm')}<b>${x.n.split(',')[0]}</b><small>${fmt(g)} g<br>${fmt(q.k)} kcal</small><span class="plus">${ic('plus')}</span></button>`;
          }).join('')}</div>`}
        <a class="add" href="#cerca"><span class="plus">${ic('plus')}</span>${items.length ? 'Aggiungi alimento' : 'Cerca un alimento'}</a>
      </section>`;
    }).join('');
    return `<main class="page">
      <div class="top"><div><span class="label">Alimentazione</span><h1 class="h1">Pasti</h1></div>
        <span class="tops"><button class="ibtn" aria-label="Modifica pasti">${ic('sliders')}</button><button class="ibtn" aria-label="Cerca un alimento">${ic('search')}</button></span></div>
      <section class="card tint week">
        <div class="ends" style="align-items:center"><b class="month">Ottobre 2026</b>
          <span class="arrows"><button class="ibtn sm" aria-label="Settimana precedente">${ic('back')}</button><button class="ibtn sm" aria-label="Settimana successiva">${ic('right')}</button></span></div>
        <div class="days" role="group" aria-label="Giorno">${F.week.map((d, i) => {
          const [w, n] = d.split(' ');
          return `<button ${i === 2 ? 'aria-pressed="true"' : ''} class="${!empty && i < 2 ? 'logged' : ''}"><span>${w}</span><b>${n}</b></button>`;
        }).join('')}</div>
      </section>
      <section class="card">
        <div class="sum">
          <div class="donut">${donut(shares.map((q) => ({ v: q.v / tot, col: q.col })))}
            <div class="in"><b class="num">${fmt(e.k)}</b><span>kcal</span></div></div>
          <ul class="mac">${MAC.map(([k, n, v], i) => `<li style="--a:var(${v})"><span class="label"><i class="dot"></i>${n}</span>
            <span class="v">${fmt(e[k])} g<small> · ${Math.round((shares[i].v / tot) * 100)}% kcal</small></span>${prog(shares[i].v, tot, 'thin')}</li>`).join('')}</ul>
        </div>
        <div class="mealrow">${F.meals.map((m) => {
          const k = empty ? 0 : m.tot.k;
          return `<div class="${k ? '' : 'off'}" aria-label="${m.n}: ${k ? `${fmt(k)} kcal` : 'vuoto'}">${mtile(MEAL_ICON[m.id], 'sm')}<b class="num">${fmt(k)}</b></div>`;
        }).join('')}</div>
      </section>
      ${meals}
    </main><!--chrome-->${tabBar('pasti')}`;
  };
  S.pasti = () => pastiPage(false);
  S.vuoto = () => pastiPage(true);

  // Ricerca aperta da Cena, con "yog" scritto e il filtro Latticini.
  S.cerca = () => {
    const extra = { yint: { n: 'Yogurt intero', p: 3.5, c: 4.7, f: 3.3 }, yfr: { n: 'Yogurt alla frutta', p: 3.0, c: 14.0, f: 2.5 }, ysoia: { n: 'Yogurt di soia', p: 4.0, c: 2.0, f: 2.2 } };
    const res = [
      { key: 'yogurt', x: F.foods.yogurt, g: 170, why: '1 vasetto · 170 g', added: true },
      { key: 'yint', x: extra.yint, g: 125, why: '1 vasetto · 125 g' },
      { key: 'yfr', x: extra.yfr, g: 125, why: '1 vasetto · 125 g' },
      { key: 'ysoia', x: extra.ysoia, g: 100, why: '100 g' },
    ];
    const hl = (n) => n.replace(/^(Yog)/, '<u>$1</u>');
    return `<main class="page no-tabs" style="padding-bottom:110px">
      <div class="top"><button class="ibtn" aria-label="Indietro">${ic('back')}</button>
        <button class="mpill" aria-label="Pasto: Cena, cambia">${mtile('moon', 'sm')}Cena${ic('down')}</button></div>
      <h1 class="sr">Cerca un alimento</h1>
      <div class="field search">${ic('search')}<span style="color:var(--ink)">yog</span></div>
      <div class="zones" role="group" aria-label="Elenco">${['Tutti', 'Recenti', 'Preferiti', 'Miei'].map((n, i) => `<button class="chip" aria-pressed="${i === 0}">${n}</button>`).join('')}</div>
      <div class="zones" role="group" aria-label="Categoria">${CATS.map(([g, n]) => `<button class="chip ico" aria-pressed="${g === 'milk'}">${ic(g)}${n}</button>`).join('')}</div>
      <p class="label">4 risultati · Latticini e uova</p>
      <section class="card list-card"><ul class="list foods">${res.map((r) => {
        const q = part(r.x, r.g);
        return `<li>${ftile(r.x, 'milk')}<div class="main"><div class="t">${hl(r.x.n)}</div><div class="s">${r.why} · ${fmt(q.k)} kcal</div>${mbar(r.x)}</div>
          <button class="ibtn sm ${r.added ? 'on' : ''}" aria-label="${r.added ? 'Aggiunto' : 'Aggiungi'} ${r.x.n}">${ic(r.added ? 'check' : 'plus')}</button></li>`;
      }).join('')}</ul></section>
      <p class="label" style="padding:0 4px">Il "+" aggiunge l'ultima quantità che hai usato o la porzione tipica; tocca il nome per sceglierla.</p>
    </main><!--chrome--><div class="toast">Aggiunto a Cena · 1 vasetto, 170 g</div>`;
  };

  S.alimento = () => {
    const key = 'yogurt', x = F.foods[key], g = 170, q = part(x, g);
    const nut = [['Energia', `${fmt(q.k)} kcal`], ['Proteine', `${fmt(q.p, 1)} g`, '--prot'], ['Carboidrati', `${fmt(q.c, 1)} g`, '--carb'], ['di cui zuccheri', '6,6 g', '', 'sub'],
      ['Grassi', `${fmt(q.f, 1)} g`, '--fat'], ['di cui saturi', '0,2 g', '', 'sub'], ['Fibre', '0 g'], ['Sale', '0,1 g']];
    return `<main class="page no-tabs">
    <div class="top"><button class="ibtn" aria-label="Indietro">${ic('back')}</button><button class="ibtn" aria-label="Aggiungi ai preferiti">${ic('star')}</button></div>
    <div class="food-h">${tile(key, 'lg')}<div><h1 class="h1">${x.n}</h1>
      <p class="meta"><span class="cat">${ic('milk')}${CAT_NAME.milk}</span></p><p class="lead">CIQUAL 2025 · ${fmt(x.k)} kcal per 100 g</p></div></div>
    <section class="card">
      <span class="label">Quantità</span>
      <div class="qty"><button class="ibtn" aria-label="Meno 10 g">${ic('minus')}</button>
        <span class="fig">${g}<small>g</small></span>
        <button class="ibtn" aria-label="Più 10 g">${ic('plus')}</button></div>
      <div class="ptiles" role="radiogroup" aria-label="Porzioni">
        <button aria-pressed="true"><b>1 vasetto</b><small>170 g · ultima volta</small></button>
        <button><b>2 vasetti</b><small>340 g</small></button>
        <button><b>1 cucchiaio</b><small>15 g</small></button>
        <button><b>100 g</b><small>${fmt(x.k)} kcal</small></button>
      </div>
    </section>
    <section class="card">
      <div class="sum">
        <div class="donut">${donut(kcalOf(q).map((m) => ({ v: m.v / q.k, col: m.col })), { size: 120, stroke: 12 })}
          <div class="in"><b class="num">${fmt(q.k)}</b><span>kcal</span></div></div>
        <ul class="mac">${MAC.map(([k, n, v, m]) => `<li style="--a:var(${v})"><span class="label"><i class="dot"></i>${n}</span>
          <span class="v">${fmt(q[k], 1)} g<small> · ${Math.round((q[k] * m / q.k) * 100)}%</small></span></li>`).join('')}</ul>
      </div>
    </section>
    <section class="card list-card"><span class="label" style="display:block;padding-top:10px">Valori per ${g} g</span>
      <ul class="list ntable">${nut.map(([n, v, col, cls]) => `<li class="${cls ?? ''}" ${col ? `style="--a:var(${col})"` : ''}><span>${col ? '<i class="dot"></i>' : ''}${n}</span><b class="num">${v}</b></li>`).join('')}</ul></section>
  </main><!--chrome-->
  <div class="dock"><div class="line"><span>Oggi diventa <b class="num">${fmt(F.eaten.k + q.k)}</b> kcal</span>
    <button class="mpill" aria-label="Pasto: Cena, cambia">${mtile('moon', 'sm')}Cena${ic('down')}</button></div>
    <button class="btn primary block">Aggiungi a Cena · ${fmt(q.k)} kcal</button></div>`;
  };

  S.modifica = () => `<main class="page no-tabs">
    <div class="top"><button class="ibtn" aria-label="Indietro">${ic('back')}</button></div>
    <div><span class="label">Modifica</span><h1 class="h1">Pasti</h1></div>
    <p class="lead">Nome, icona e ordine dei pasti del diario. Un pasto nascosto non compare più, ma quello che c'era nei giorni passati resta.</p>
    <section class="card list-card"><ul class="list">${F.meals.map((m, i) => {
      const open = m.id === 'spuntino';
      const head = `<li class="mrow">${mtile(MEAL_ICON[m.id])}<div class="main"><div class="t">${m.n}</div></div>
        ${i ? `<button class="ibtn sm" aria-label="Sposta su ${m.n}">${ic('up')}</button>` : ''}${i < F.meals.length - 1 ? `<button class="ibtn sm" aria-label="Sposta giù ${m.n}">${ic('down')}</button>` : ''}
        <button class="ibtn sm" aria-label="${open ? 'Chiudi' : 'Modifica'} ${m.n}" aria-expanded="${open}">${ic(open ? 'close' : 'sliders')}</button></li>`;
      return open ? `${head}<li class="medit"><span class="label">Nome</span><div class="field">Spuntino</div><span class="label">Icona</span>
        <div class="picker">${MEAL_ICONS.map((k) => `<button aria-pressed="${k === 'apple'}" aria-label="${k}">${ic(k)}</button>`).join('')}</div>
        <button class="btn quiet block" style="min-height:48px">${ic('eyeoff').replace('<svg', '<svg width="20" height="20"')} Nascondi Spuntino</button></li>` : head;
    }).join('')}</ul></section>
    <h2 class="sect">Nascosti</h2>
    <section class="card list-card"><ul class="list"><li>${mtile('bolt')}<div class="main"><div class="t">Pre-allenamento</div><div class="s">Nascosto dal 12 ottobre</div></div>
      <button class="btn quiet" style="min-height:44px">Mostra</button></li></ul></section>
    <button class="btn soft block">${ic('plus').replace('<svg', '<svg width="20" height="20"')} Aggiungi pasto</button>
  </main>`;

  // ---------- allenamento: identità delle schede ----------
  // Ogni scheda ha icona e colore scelti dall'utente (tavolozza lontana da blu, ambra e verde dei macro).
  // Nelle schermate di una scheda (editor, sessione) il suo colore fa da accento: tinte, spunte e recupero.
  // Gli esercizi hanno una tessera con il glifo della zona del corpo, nella tinta dell'accento.
  const RCOL = { corallo: ['Corallo', '#ef5f3c'], lampone: ['Lampone', '#e0446a'], fucsia: ['Fucsia', '#c93d9b'],
    viola: ['Viola', '#7c5ce0'], ardesia: ['Ardesia', '#4f5d73'], cacao: ['Cacao', '#9a6448'] };
  const RICONS = ['dumbbell', 'barbell', 'kettlebell', 'run', 'bike', 'flame', 'bolt', 'heart', 'mountain', 'target', 'trophy', 'leaf'];
  const ZONES = { chest: ['Petto', 'zChest'], back: ['Schiena', 'zBack'], shoulders: ['Spalle', 'zShoulders'], upperArms: ['Braccia', 'zArms'],
    lowerArms: ['Avambracci', 'zForearms'], waist: ['Addome', 'zAbs'], upperLegs: ['Cosce e glutei', 'zLegs'], lowerLegs: ['Polpacci', 'zCalves'],
    cardio: ['Cardio', 'zCardio'], neck: ['Collo', 'zNeck'] };
  const EX = {
    bench: ['Barbell bench press', 'chest', 'Bilanciere', 'Pettorali'],
    ohp: ['Dumbbell shoulder press', 'shoulders', 'Manubri', 'Deltoidi'],
    dips: ['Triceps dip', 'upperArms', 'Corpo libero', 'Tricipiti'],
    fly: ['Cable crossover', 'chest', 'Cavi', 'Pettorali'],
    pull: ['Pull-up', 'back', 'Corpo libero', 'Dorsali'],
    row: ['Barbell bent over row', 'back', 'Bilanciere', 'Parte alta della schiena'],
    curl: ['Dumbbell biceps curl', 'upperArms', 'Manubri', 'Bicipiti'],
    squat: ['Barbell full squat', 'upperLegs', 'Bilanciere', 'Quadricipiti'],
    calf: ['Standing calf raise', 'lowerLegs', 'Macchina', 'Polpacci'],
    crunch: ['Crunch floor', 'waist', 'Corpo libero', 'Addominali'],
    wrist: ['Barbell wrist curl', 'lowerArms', 'Bilanciere', 'Avambracci'],
  };
  const R = {
    push: { name: 'Push A', icon: 'barbell', col: 'viola', days: [0, 3], ex: ['bench', 'ohp', 'dips', 'fly'] },
    pull: { name: 'Pull A', icon: 'kettlebell', col: 'lampone', days: [1, 4], ex: ['pull', 'row', 'curl'] },
    legs: { name: 'Gambe', icon: 'mountain', col: 'cacao', days: [5], ex: ['squat', 'calf', 'crunch'] },
    run: { name: 'Corsa leggera', icon: 'run', col: 'ardesia', days: [], ex: [] },
  };
  const DAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  const DAYS_S = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const TODAY = 3; // giovedì: lunedì e martedì fatti, mercoledì riposo
  const DONE = [0, 1];
  const byDay = (d) => Object.values(R).find((r) => r.days.includes(d));
  const rc = (r) => RCOL[r.col][1];
  // tessera della scheda: il glifo e il colore li sceglie l'utente
  const rtile = (r, size = '') => `<span class="tile ${size}" style="--m:${rc(r)}">${ic(r.icon)}</span>`;
  // tessera dell'esercizio: glifo della zona, tinta dell'accento (quello della scheda, nelle sue schermate)
  const xtile = (k, size = '') => `<span class="tile acc ${size}">${ic(ZONES[EX[k][1]][1])}</span>`;
  // schermata "di" una scheda: il suo colore diventa l'accento
  const scope = (r, cls = '', st = '') => `class="r ${cls}" style="--accent:${rc(r)};${st}"`;
  const chev = ic('right').replace('<svg', '<svg class="chev"');

  S.allenamento = () => {
    const r = R.push;
    return `<main class="page">
    <div><span class="when label">Palestra</span><h1 class="h1">Allenamento</h1></div>
    <section ${scope(r, 'card tint today')}>
      <div class="today-h">${rtile(r, 'lg')}<div><span class="label" style="color:var(--accent-ink)">Oggi · Giovedì</span>
        <h2 class="h2">${r.name}</h2><p class="lead">${r.ex.length} esercizi · circa 55 min</p></div></div>
      <div class="zone-strip">${r.ex.map((k) => xtile(k, 'sm')).join('')}<span class="label">Petto, spalle, tricipiti</span></div>
      <button class="btn primary block">Inizia allenamento</button>
      <button class="btn ghost block">Allenamento libero</button>
    </section>

    <h2 class="sect">Settimana</h2>
    <section class="card wk-card"><div class="wk">${DAYS.map((d, i) => {
      const p = byDay(i), st = DONE.includes(i) ? 'done' : p ? 'plan' : 'rest';
      return `<a href="#" class="${st} ${i === TODAY ? 'today' : ''}" ${p ? `style="--m:${rc(p)}"` : ''} aria-label="${DAYS_S[i]}, ${p ? p.name : 'riposo'}${st === 'done' ? ', fatto' : ''}">
        <b>${d}</b><i>${st === 'done' ? ic('check') : p ? ic(p.icon) : ''}</i><small>${p ? p.name : 'Riposo'}</small></a>`;
    }).join('')}</div></section>

    <h2 class="sect">Schede <a href="#">+ Nuova scheda</a></h2>
    <section class="card list-card"><ul class="list">${Object.values(R).map((x) =>
      `<li>${rtile(x)}<div class="main"><div class="t">${x.name}</div><div class="s">${x.days.length ? x.days.map((d) => DAYS_S[d]).join(', ') : 'Nessun giorno'} · ${x.ex.length ? `${x.ex.length} esercizi` : 'vuota'}</div></div>${chev}</li>`).join('')}</ul></section>

    <h2 class="sect">Esercizi</h2>
    <section class="card list-card"><ul class="list"><li><span class="tile acc">${ic('search')}</span><div class="main"><div class="t">Catalogo esercizi</div>
      <div class="s">1.324 esercizi, per zona e attrezzo</div></div>${chev}</li></ul></section>

    <h2 class="sect">Storico</h2>
    <section class="card list-card"><ul class="list">
      <li>${rtile(R.pull, 'sm')}<div class="main"><div class="t">Martedì 27 ottobre</div><div class="s">Pull A · 48 min · 12 serie</div></div><div class="v">3,9 t</div></li>
      <li>${rtile(R.push, 'sm')}<div class="main"><div class="t">Lunedì 26 ottobre</div><div class="s">Push A · 56 min · 16 serie</div></div><div class="v">5,2 t</div></li>
      <li><span class="tile sm neutral">${ic('dumbbell')}</span><div class="main"><div class="t">Sabato 24 ottobre</div><div class="s">Allenamento libero · 31 min · 8 serie</div></div><div class="v">2,1 t</div></li>
    </ul></section>
  </main><!--chrome-->${tabBar('allenamento')}`;
  };

  S.scheda = () => {
    const r = R.push;
    const row = (k, i, sets, reps) => `<li class="ex">${xtile(k)}<div class="main"><div class="t">${EX[k][0]}</div><div class="s">${EX[k][3]}</div></div>
        ${i ? `<button class="ibtn sm" aria-label="Sposta su">${ic('up')}</button>` : ''}<button class="ibtn sm" aria-label="Togli">${ic('close')}</button>
        <div class="ex-ctl"><span class="well"><button aria-label="Una serie in meno">${ic('minus')}</button><b class="num">${sets} serie</b><button aria-label="Una serie in più">${ic('plus')}</button></span>
        <span class="label">×</span><span class="well reps num"><b>${reps[0]}</b><span class="label">-</span><b>${reps[1] ?? '<em>max</em>'}</b><span class="label">rip</span></span></div></li>`;
    const link = (on) => `<li class="link ${on ? 'on' : ''}"><span>${ic('link')}${on ? 'Superserie' : 'Collega'}</span></li>`;
    return `<main ${scope(r, 'page no-tabs')}>
    <div class="top"><button class="ibtn" aria-label="Indietro">${ic('back')}</button></div>
    <div class="food-h">${rtile(r, 'lg')}<div><span class="label">Scheda</span><h1 class="h1">${r.name}</h1></div></div>
    <section class="card stack-g">
      <span class="label">Nome</span><div class="field">${r.name}</div>
      <span class="label">Icona</span>
      <div class="picker" role="radiogroup" aria-label="Icona">${RICONS.map((k) => `<button role="radio" aria-checked="${k === r.icon}" aria-pressed="${k === r.icon}" aria-label="${k}">${ic(k)}</button>`).join('')}</div>
      <span class="label">Colore</span>
      <div class="swatches" role="radiogroup" aria-label="Colore">${Object.entries(RCOL).map(([k, [n, c]]) =>
        `<button role="radio" aria-checked="${k === r.col}" aria-pressed="${k === r.col}" aria-label="${n}" style="--c:${c}">${k === r.col ? ic('check') : ''}</button>`).join('')}</div>
    </section>
    <section class="card">
      <h2 class="h3">Giorni</h2><p class="label" style="margin:2px 0 12px">Ogni giorno ha una sola scheda: sceglierlo qui lo toglie da un’altra.</p>
      <div class="days7">${DAYS.map((d, i) => {
        const other = byDay(i);
        return `<button aria-pressed="${r.days.includes(i)}" ${other && other !== r ? `class="taken" style="--m:${rc(other)}"` : ''}>${d}</button>`;
      }).join('')}</div>
      <p class="label" style="margin-top:10px">Altre schede: Mar e Ven Pull A, Sab Gambe</p>
    </section>
    <h2 class="sect">4 esercizi</h2>
    <section class="card list-card"><ul class="list">
      ${row('bench', 0, 4, [6, 8])}${link(false)}${row('ohp', 1, 3, [8, 12])}${link(false)}${row('dips', 2, 3, [10, null])}${link(true)}${row('fly', 3, 3, [12, 15])}
    </ul></section>
    <button class="btn soft block">${ic('plus').replace('<svg', '<svg width="20" height="20"')} Aggiungi esercizi</button>
  </main><!--chrome-->
  <div ${scope(r, 'dock')}><button class="btn primary block">Inizia allenamento</button></div>`;
  };

  S.sessione = () => {
    const r = R.push;
    const head = (k, target) => `<div class="ex-h">${xtile(k)}<div class="main"><div class="t h3">${EX[k][0]}</div><div class="s">${EX[k][2]} · ${EX[k][3]} · ${target}</div></div><button class="ibtn sm" aria-label="Togli">${ic('close')}</button></div>
      <div class="st hd"><span>N°</span><span>Prima</span><span>kg</span><span>rip</span><span></span></div>`;
    const set = (n, prev, kg, reps, done) => `<div class="st ${done ? 'done' : ''}"><span class="n num">${n}</span><span class="label num">${prev}</span>
      <span class="in num ${kg[1] ? '' : 'ph'}">${kg[0]}</span><span class="in num ${reps[1] ? '' : 'ph'}">${reps[0]}</span>
      <button class="ibtn sm ${done ? 'on' : ''}" aria-label="Serie ${n} ${done ? 'fatta' : 'da fare'}">${ic('check')}</button></div>`;
    return `<main ${scope(r, 'page no-tabs', 'padding-bottom:300px')}>
    <div class="top"><button class="ibtn" aria-label="Indietro">${ic('back')}</button></div>
    <div class="food-h">${rtile(r, 'lg')}<div><span class="label num">18:42 · 5 di 13 serie</span><h1 class="h1">${r.name}</h1></div></div>
    <section class="card">
      ${head('bench', '6-8 rip')}
      ${set(1, '80 × 8', ['82,5', 1], ['8', 1], true)}${set(2, '80 × 7', ['82,5', 1], ['7', 1], true)}${set(3, '80 × 6', ['82,5', 1], ['6', 1], true)}${set(4, '75 × 8', ['75', 0], ['8', 0], false)}
    </section>
    <section class="card">
      <div class="ss"><span class="pill">${ic('link')}Superserie</span><span class="label">Una serie ciascuno, poi recupero</span></div>
      ${head('dips', '10 rip')}
      ${set(1, '× 12', ['', 0], ['12', 1], true)}${set(2, '× 11', ['', 0], ['11', 0], false)}
      <div class="sep"></div>
      ${head('fly', '12-15 rip')}
      ${set(1, '20 × 15', ['20', 1], ['14', 1], true)}${set(2, '20 × 15', ['20', 0], ['15', 0], false)}
    </section>
  </main><!--chrome-->
  <div ${scope(r, 'dock')}><section class="card tint rest-mini">
      <div class="rest">${arc({ value: 0.6, size: 64, stroke: 6 })}<div><span class="label" style="color:var(--accent-ink)">Recupero</span><p class="clock">1:12</p></div>
      <div class="btns"><button class="btn quiet">+15 s</button><button class="btn quiet">Salta</button></div></div></section>
    <button class="btn primary block">Termina</button></div>`;
  };

  S.catalogo = () => {
    const list = ['bench', 'fly', 'pull', 'row', 'curl', 'squat', 'calf', 'crunch', 'wrist'];
    return `<main class="page no-tabs" style="padding-bottom:40px">
    <div class="top"><button class="ibtn" aria-label="Indietro">${ic('back')}</button></div>
    <div><span class="label">Aggiungi alla scheda · Push A</span><h1 class="h1">Esercizi</h1></div>
    <div class="field search">${ic('search')}<span>Cerca un esercizio</span></div>
    <div class="zones" role="group" aria-label="Zona"><button class="chip" aria-pressed="true">Tutte</button>${Object.entries(ZONES).map(([k, [n, g]]) =>
      `<button class="chip ico">${ic(g)}${n}</button>`).join('')}</div>
    <p class="label">1.324 esercizi</p>
    <section class="card list-card"><ul class="list">${list.map((k) =>
      `<li>${xtile(k)}<div class="main"><div class="t">${EX[k][0]}</div><div class="s">${EX[k][2]} · ${EX[k][3]}</div></div><button class="ibtn sm" aria-label="Aggiungi">${ic('plus')}</button></li>`).join('')}</ul></section>
  </main>`;
  };

  S.statistiche = () => `<main class="page">
    <div class="top"><h1 class="h1">Statistiche</h1><button class="ibtn" aria-label="Altro">${ic('more')}</button></div>
    <div class="seg" role="group" aria-label="Periodo"><button aria-pressed="true">Settimana</button><button>Mese</button><button>Anno</button></div>
    <section class="card">
      <span class="label">Giorni nell’obiettivo calorie</span>
      <div class="arc-wrap">${arc({ value: inGoal / F.stats.kcalWeek.length, size: 230, stroke: 16, half: true })}
        <div class="in"><p class="fig">${inGoal}<small>di ${F.stats.kcalWeek.length}</small></p></div></div>
      <p class="lead" style="text-align:center;margin-bottom:16px">Ultimi 6 giorni chiusi, entro il 10% di ${fmt(F.goal.k)} kcal</p>
      <ul class="legend"><li><span class="k">Media giornaliera</span><span class="v">${fmt(avgK)}<small> kcal</small></span></li>
        <li><span class="k">Allenamenti fatti</span><span class="v">${doneW}<small> di ${planW}</small></span></li></ul>
    </section>
    <section class="card">
      <div class="chart-h"><div><span class="label">Calorie, ultimi 7 giorni</span><p class="fig-m">${fmt(avgK)}<small>kcal di media</small></p></div>
        <span class="pill neutral">Obiettivo ${fmt(F.goal.k)}</span></div>
      <div class="pbars" role="img" aria-label="Calorie degli ultimi 7 giorni">${last7.map((x) => {
        const h = Math.min(1, x.k / (F.goal.k * 1.2));
        return `<div class="pb ${x.today ? 'today' : ''}">${x.today ? `<span class="tip num">${fmt(x.k)}</span>` : ''}<div class="track"><i style="height:${(h * 100).toFixed(1)}%"></i></div><span>${x.d}</span></div>`;
      }).join('')}<div class="goal-line" style="bottom:calc(26px + ${((1 / 1.2) * 132).toFixed(1)}px)"></div></div>
    </section>
    <section class="card">
      <div class="chart-h"><div><span class="label">Peso</span><p class="fig-m">${kg(F.weight.now)}<small>kg</small></p></div>
        <span class="pill">${F.sign(F.weight.delta)} kg</span></div>
      <div id="ch-weight"></div>
    </section>
    <section class="card">
      <div class="chart-h"><div><span class="label">Volume, ultime 7 settimane</span><p class="fig-m">${kg(vol[6])}<small>t</small></p></div>
        <span class="pill">${F.sign(dVol)} t</span></div>
      <div id="ch-volume"></div>
    </section>
    <section class="card">
      <span class="label">Questa settimana</span>
      <div class="week-dots" style="margin-top:14px">${F.stats.week.map((d) =>
        `<span class="${d.s}" title="${d.label}"><i>${d.s === 'done' ? ic('check') : ''}</i>${d.d}</span>`).join('')}</div>
    </section>
  </main><!--chrome-->${tabBar('statistiche')}`;

  const charts = (root) => {
    const w = root.querySelector('#ch-weight'), v = root.querySelector('#ch-volume');
    if (w) Charts.line(w, { labels: F.weight.days, series: [{ name: 'Peso', values: F.weight.series }], format: Charts.fmt.dec(1), height: 160, min: 78, max: 79.5, xAt: [0, 3, 6] });
    if (v) Charts.bars(v, { labels: F.stats.weeks, values: vol, format: (x) => `${Charts.fmt.dec(1)(x)} t`, height: 160, highlight: 6, xAt: [0, 3, 6] });
  };

  window.FORMA_SCREENS = {
    order: [['oggi', 'Oggi'], ['pasti', 'Pasti'], ['cerca', 'Ricerca alimento'], ['alimento', 'Scheda alimento'], ['modifica', 'Modifica pasti'], ['allenamento', 'Allenamento'], ['scheda', 'Scheda'], ['sessione', 'Allenamento in corso'], ['catalogo', 'Catalogo esercizi'], ['statistiche', 'Statistiche'], ['vuoto', 'Pasti, primo giorno']],
    render: (id) => {
      const [body, chrome = ''] = S[id]().split('<!--chrome-->');
      return `${statusBar()}<div class="screen">${body}</div>${chrome}<div class="home-ind"></div>`;
    },
    charts,
  };
})();
