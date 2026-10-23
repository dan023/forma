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
  };
  const ic = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;

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
  const GLYPH = { avena: 'grain', latte: 'milk', banana: 'fruit', pasta: 'bowl', pollo: 'meat', olio: 'drop', zucchine: 'leaf', yogurt: 'cup', mandorle: 'nut' };
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
  const cur = F.session.sets.findIndex((s) => s.current);
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

  const pastiPage = (empty) => {
    const e = empty ? { k: 0, p: 0, c: 0, f: 0 } : F.eaten;
    const meals = F.meals.map((m) => {
      const items = empty ? [] : m.items;
      return `<section class="card">
        <div class="meal-h"><h3>${m.n}${items.length ? `<span class="s num">${m.time}</span>` : ''}</h3>
          ${items.length ? `<span class="k">${fmt(m.tot.k)}<small>kcal</small></span>` : ''}</div>
        ${items.length ? `${stack(m.tot)}<p class="mline">${MAC.map(([k, n, v]) => `<span style="--a:var(${v})"><i class="dot"></i>${n[0]} ${fmt(m.tot[k])} g</span>`).join('')}</p>` : ''}
        ${items.length ? `<ul class="list foods">${items.map((it) => `<li>${tile(it.key)}<div class="main"><div class="t">${it.name}</div><div class="s">${fmt(it.g)} g</div></div><div class="v">${fmt(it.k)}<small>kcal</small></div></li>`).join('')}</ul>`
          : `<p class="empty-meal">Ancora niente.</p>`}
        <a class="add" href="#alimento"><span class="plus">${ic('plus')}</span>Aggiungi alimento</a>
      </section>`;
    }).join('');
    return `<main class="page">
      <div class="top"><h1 class="h1">Pasti</h1><button class="ibtn" aria-label="Cerca un alimento">${ic('search')}</button></div>
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
          <div class="donut">${donut(kcalOf(e).map((q) => ({ v: q.v / F.goal.k, col: q.col })))}
            <div class="in"><b class="num">${fmt(e.k)}</b><span>di ${fmt(F.goal.k)} kcal</span></div></div>
          <ul class="mac">${MAC.map(([k, n, v]) => `<li style="--a:var(${v})"><span class="label"><i class="dot"></i>${n}</span>
            <span class="v">${fmt(e[k])}<small> / ${fmt(F.goal[k])} g</small></span>${prog(e[k], F.goal[k], 'thin')}</li>`).join('')}</ul>
        </div>
        <p class="rest-line"><span>${ic('flame')}Restano <b class="num">${fmt(F.goal.k - e.k)}</b> kcal</span><span>${empty ? 'Nessun pasto' : `${F.meals.filter((m) => m.items.length).length} pasti su ${F.meals.length}`}</span></p>
      </section>
      ${empty ? '<p class="lead" style="padding:4px 4px 0">Il diario di oggi è vuoto. Cerca un alimento o scansiona un codice a barre per iniziare.</p>' : ''}
      ${meals}
    </main><!--chrome-->${tabBar('pasti')}`;
  };
  S.pasti = () => pastiPage(false);
  S.vuoto = () => pastiPage(true);

  S.alimento = () => `<main class="page no-tabs">
    <div class="top"><button class="ibtn" aria-label="Indietro">${ic('back')}</button><button class="ibtn" aria-label="Aggiungi ai preferiti">${ic('star')}</button></div>
    <div class="food-h">${tile('pasta', 'lg')}<div><h1 class="h1">${pasta.n}</h1>
      <p class="lead">Cereali · CIQUAL 2025 · ${fmt(pasta.k)} kcal per 100 g</p></div></div>
    <section class="card">
      <span class="label">Quantità</span>
      <div class="qty"><button class="ibtn" aria-label="Meno 10 g">${ic('minus')}</button>
        <span class="fig">${portion}<small>g</small></span>
        <button class="ibtn" aria-label="Più 10 g">${ic('plus')}</button></div>
      <div class="chips" role="group" aria-label="Porzioni">
        <button class="chip">Piccola<small>60 g</small></button><button class="chip" aria-pressed="true">Media<small>90 g</small></button>
        <button class="chip">Grande<small>120 g</small></button><button class="chip">100 g</button></div>
    </section>
    <section class="card">
      <div class="sum">
        <div class="donut">${donut(kcalOf(add).map((q) => ({ v: q.v / add.k, col: q.col })), { size: 120, stroke: 12 })}
          <div class="in"><b class="num">${fmt(add.k)}</b><span>kcal</span></div></div>
        <ul class="mac">${MAC.map(([k, n, v, m]) => `<li style="--a:var(${v})"><span class="label"><i class="dot"></i>${n}</span>
          <span class="v">${fmt(add[k], 1)} g<small> · ${Math.round((add[k] * m / add.k) * 100)}%</small></span></li>`).join('')}</ul>
      </div>
    </section>
    <h2 class="sect">Sulla giornata</h2>
    <div class="row3">${MAC.map(([k, n, v]) => `<section class="card mcard" style="--a:var(${v})">${arc({ value: Math.min(1, add[k] / F.goal[k]), size: 56, stroke: 6, col: `var(${v})` })}
      <b class="num">${fmt(add[k], 0)} g</b><span class="label">${n}</span><span class="pct num">${Math.round((add[k] / F.goal[k]) * 100)}% del giorno</span></section>`).join('')}</div>
  </main><!--chrome-->
  <div class="dock"><div class="line"><span>Oggi diventa <b class="num">${fmt(F.eaten.k + add.k)}</b> / ${fmt(F.goal.k)} kcal</span><a href="#" aria-label="Cambia pasto">Cena ${ic('down').replace('<svg', '<svg width="18" height="18"')}</a></div>
    <button class="btn primary block">Aggiungi a Cena · ${fmt(add.k)} kcal</button></div>`;

  S.allenamento = () => {
    const s = F.session, c = s.sets[cur];
    return `<main class="page">
    <div class="top"><span class="when">${s.name} · <span class="num">${s.elapsed}</span></span><button class="btn quiet" style="min-height:44px">Termina</button></div>
    <h1 class="h1">${s.ex}</h1>
    <p class="lead" style="margin-top:-6px">${s.equip} · ${s.rule.toLowerCase()}</p>
    <section class="card">
      <span class="label">Prossima serie · ${cur + 1} di ${s.sets.length}</span>
      <p class="fig" style="margin:8px 0 4px">${c.kg}<small>kg</small> × ${c.reps}<small>rip</small></p>
      <p class="label">1RM stimato ${s.e1rm} kg · volume finora ${fmt(s.volume)} kg</p>
      <ul class="list sets" style="margin:12px 0 16px">${s.sets.map((x, i) => {
        const st = x.done ? 'done' : x.current ? 'cur' : 'todo';
        return `<li class="${st}"><span class="n">${x.done ? ic('check') : i + 1}</span><div class="main t">Serie ${i + 1}</div><div class="v">${x.kg} kg × ${x.reps}</div></li>`;
      }).join('')}</ul>
      <button class="btn primary block">Serie fatta</button>
    </section>
    <section class="card tint">
      <div class="rest">${arc({ value: s.rest.left / s.rest.total, size: 76, stroke: 7 })}
        <div><span class="label" style="color:var(--accent-ink)">Recupero</span>
          <p class="clock">${Math.floor(s.rest.left / 60)}:${String(s.rest.left % 60).padStart(2, '0')}</p>
          <span class="label">di ${s.rest.total / 60}:00</span></div></div>
      <div class="btns"><button class="btn quiet">−15 s</button><button class="btn quiet">+15 s</button><button class="btn quiet">Salta</button></div>
    </section>
    <h2 class="sect">Dopo</h2>
    <section class="card" style="padding-top:8px;padding-bottom:8px"><ul class="list">${s.plan.slice(1).map(([n, sch]) =>
      `<li><div class="main t">${n}</div><div class="s num">${sch}</div></li>`).join('')}</ul></section>
  </main><!--chrome-->${tabBar('allenamento')}`;
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
    order: [['oggi', 'Oggi'], ['pasti', 'Pasti'], ['alimento', 'Scheda alimento'], ['allenamento', 'Allenamento in corso'], ['statistiche', 'Statistiche'], ['vuoto', 'Pasti, primo giorno']],
    render: (id) => {
      const [body, chrome = ''] = S[id]().split('<!--chrome-->');
      return `${statusBar()}<div class="screen">${body}</div>${chrome}<div class="home-ind"></div>`;
    },
    charts,
  };
})();
