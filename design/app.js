const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const notes = {
  neve: "Neve chiaro: grigio morbido, ombre neumorfiche, un solo accento arancione.",
  "neve-scura": "Neve scura: stessa grammatica tattile su carbone caldo. Meno abbagliante in palestra e la sera.",
};

const icon = {
  oggi: '<path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  allenamento: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  pasti: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 21V3c-2 1-3 4-3 8h3"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  impostazioni: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
};
const svg = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
const ico = {
  press: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  leg: '<path d="M9 3h6l-1 9 1 9h-3l-1-7-1 7H7l1-9z"/>',
  back: '<path d="M4 8c2-3 6-3 8 0 2-3 6-3 8 0v4c-2 4-6 6-8 8-2-2-6-4-8-8z"/>',
  arm: '<path d="M5 15c0-6 4-10 9-10v5c-3 0-4 2-4 4v5H5z"/>',
  run: '<circle cx="14" cy="5" r="2"/><path d="M6 21l4-6 3 2 2-6-4-2-3 4M15 11l3 3"/>',
};
const tabs = [
  ["oggi", "Oggi"], ["allenamento", "Allena"], ["pasti", "Pasti"], ["stats", "Stats"], ["impostazioni", "Altro"],
];

const bar = (label, val, max, color) => `
  <div class="macro"><div class="row"><span>${label}</span><span class="muted">${val} / ${max} g</span></div>
  <div class="bar"><i style="--w:${Math.min(100, (val / max) * 100)}%;--c:${color}"></i></div></div>`;

/* ---------- SCHERMATE ---------- */
const pages = {
  oggi: `
    <div><div class="eyebrow">Lunedì 29 settembre · giorno di allenamento</div>
    <h1 class="title">Ciao, <em>Daniele</em></h1></div>
    <section class="card hero" aria-label="Calorie di oggi">
      <div class="ring" style="--off:${402 - 402 * 0.64}">
        <svg viewBox="0 0 148 148"><circle class="track" cx="74" cy="74" r="64"/><circle class="fill" cx="74" cy="74" r="64"/></svg>
        <div class="ring-c"><div class="num">1.240</div><span>di 2.650 kcal</span></div>
      </div>
      <div class="stack" style="gap:10px">
        ${bar("Proteine", 92, 170, "var(--accent)")}
        ${bar("Carboidrati", 118, 320, "oklch(72% 0.11 85)")}
        ${bar("Grassi", 31, 80, "oklch(66% 0.09 20)")}
      </div>
    </section>
    <section class="card workout-today">
      <div class="row between"><span class="eyebrow">Oggi in palestra</span><span class="pill-tag">Push A</span></div>
      <div><div class="h2">Panca piana, Military press, Dip</div><div class="muted" style="font-size:.85rem;margin-top:4px">6 esercizi · ~55 min · Panca: 82,5 kg, +2,5 dall’ultima volta</div></div>
      <button class="btn" data-go="sessione">Inizia allenamento</button>
    </section>
    <section class="card">
      <div class="row between"><h2 class="h2">Peso</h2><span class="pill-tag">−0,4 kg / 7 gg</span></div>
      <div class="row between" style="margin-top:12px"><div class="num" style="font-size:2.4rem">78,2<small class="muted" style="font-size:1rem;font-weight:600"> kg</small></div><button class="btn ghost" style="min-height:44px" data-go="peso">Registra</button></div>
    </section>`,

  sessione: `
    <div><div class="eyebrow">Push A · 00:24:18</div><h1 class="title">Panca<br><em>piana</em></h1></div>
    <section class="card timer glass" aria-label="Recupero">
      <div class="eyebrow">Recupero</div><div class="num" id="rest">1:30</div>
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn ghost" data-rest="-15">−15 s</button><button class="btn" data-rest="0">Salta</button><button class="btn ghost" data-rest="15">+15 s</button></div>
    </section>
    <section class="card">
      <div class="ex-head"><div><div class="h2">Doppia progressione</div><div class="muted" style="font-size:.85rem;margin-top:3px">Obiettivo 8-10 rip · RIR 2</div></div><span class="pill-tag">1RM 98 kg</span></div>
      <div class="sets" id="sets">
        ${[["80", "10"], ["80", "9"], ["80", "8"], ["77,5", "-"]].map((s, i) => `
        <div class="set"><span>${i + 1}</span><div class="field">${s[0]} kg</div><div class="field">${s[1]} rip</div><button class="check" aria-pressed="${i < 2}" aria-label="Serie ${i + 1} completata">✓</button></div>`).join("")}
      </div>
      <div class="row between"><button class="add-line" style="margin-top:8px">+ Aggiungi serie</button><button class="add-line" style="margin-top:8px;color:var(--ink-2)" data-go="esercizi">Cambia esercizio</button></div>
    </section>
    <section class="card">
      <div class="eyebrow" style="margin-bottom:6px">Prossimi</div>
      <div class="list">
        <div class="li"><div><b>Military press</b><small>3 × 6-8 · 45 kg</small></div><span class="muted">›</span></div>
        <div class="li"><div><b>Dip alle parallele</b><small>3 × al cedimento · corpo libero</small></div><span class="muted">›</span></div>
        <div class="li"><div><b>Alzate laterali</b><small>Superset con French press</small></div><span class="muted">›</span></div>
      </div>
    </section>`,

  pasti: `
    <div><div class="eyebrow">Diario alimentare</div><h1 class="title">I tuoi <em>pasti</em></h1></div>
    <div class="dayslider" id="days">${["Sab 27", "Dom 28", "Lun 29", "Mar 30", "Mer 1"].map((d, i) => `<button class="day" aria-pressed="${i === 2}"><small>${d.split(" ")[0]}</small><b>${d.split(" ")[1]}</b></button>`).join("")}</div>
    <div class="row" style="margin-bottom:18px"><label class="search sfield"><span aria-hidden="true">⌕</span><input placeholder="Cerca un alimento" aria-label="Cerca alimento" data-focus-go="cerca"></label><button class="icon-btn" data-go="scan" aria-label="Scansiona barcode">▥</button><button class="icon-btn" data-go="ricette" aria-label="Ricette">☰</button></div>
    ${[
      ["Colazione", 420, [["Yogurt greco 0%", "200 g", 118], ["Avena in fiocchi", "60 g", 228], ["Mirtilli", "80 g", 46]]],
      ["Pranzo", 820, [["Riso basmati", "90 g crudo", 320], ["Petto di pollo", "180 g", 297], ["Olio extravergine", "1 cucchiaio", 90], ["Zucchine grigliate", "200 g", 40]]],
      ["Spuntino", 0, []],
    ].map(([n, k, items]) => `
    <section class="card">
      <div class="meal-head"><h2 class="h2">${n}</h2><span class="num" style="font-size:1.2rem">${k} <small class="muted" style="font-size:.75rem;font-weight:600">kcal</small></span></div>
      <div class="list">${items.map(([a, b, c]) => `<div class="li"><div><b>${a}</b><small>${b}</small></div><span class="muted">${c}</span></div>`).join("")}</div>
      <button class="add-line" data-go="cerca">+ ${items.length ? "Aggiungi alimento" : "Registra il primo alimento"}</button>
    </section>`).join("")}
    <button class="add-line" style="justify-self:center" data-go="pasti-config">Configura i pasti</button>`,

  stats: `
    <div><div class="eyebrow">Ultimi 90 giorni</div><h1 class="title">Statistiche</h1></div>
    <div class="seg card" style="padding:4px;border-radius:99px" id="seg">${["Peso", "Calorie", "Volume"].map((t, i) => `<button aria-pressed="${i === 0}">${t}</button>`).join("")}</div>
    <section class="card chart">
      <div class="row between"><h2 class="h2" id="chart-t">Peso corporeo</h2><span class="pill-tag" id="chart-d">−2,1 kg</span></div>
      <svg id="chart" viewBox="0 0 320 150" role="img" aria-label="Grafico"></svg>
    </section>
    <section class="card">
      <div class="row between"><h2 class="h2">Volume settimanale</h2><span class="muted" style="font-size:.85rem">tonnellate</span></div>
      <div class="vol" style="margin-top:14px">${[5.2, 6.1, 5.8, 7.0, 6.6, 7.4, 8.1, 7.7].map((v, i, a) => `<i class="${i === a.length - 1 ? "hi" : ""}" style="--h:${(v / 8.4) * 100}%"></i>`).join("")}</div>
    </section>
    <button class="card row between" style="width:100%;font:inherit;color:inherit;cursor:pointer;text-align:left" data-go="muscoli"><div><h2 class="h2">Mappa muscolare</h2><div class="muted" style="font-size:.85rem;margin-top:3px">Petto e spalle in testa questa settimana</div></div><span class="muted">›</span></button>
    <section class="card">
      <h2 class="h2" style="margin-bottom:12px">Costanza</h2>
      <div class="heat">${Array.from({ length: 70 }, (_, i) => `<i style="--a:${[0, 0, 0.9, 0, 0.7, 0.9, 0][i % 7] * (0.5 + ((i * 37) % 10) / 20)}"></i>`).join("")}</div>
    </section>`,

  impostazioni: `
    <div><div class="eyebrow">Tutto tuo</div><h1 class="title">Impostazioni</h1></div>
    <section class="card"><div class="list">
      <div class="li" data-go="obiettivi" role="button" tabindex="0" style="cursor:pointer"><div><b>Obiettivi giornalieri</b><small>2.650 kcal allenamento · 2.250 riposo</small></div><span class="muted">›</span></div>
      <div class="li" data-go="promemoria" role="button" tabindex="0" style="cursor:pointer"><div><b>Promemoria</b><small>Pasti, allenamento, peso</small></div><span class="muted">›</span></div>
      <div class="li" data-go="pasti-config" role="button" tabindex="0" style="cursor:pointer"><div><b>Pasti configurabili</b><small>Colazione, pranzo, spuntino, cena</small></div><span class="muted">›</span></div>
    </div></section>
    <section class="card stack">
      <div><h2 class="h2">Lingua</h2></div>
      <div class="seg card" data-seg style="padding:4px;border-radius:var(--r-btn);margin:0"><button aria-pressed="true">Sistema</button><button aria-pressed="false">Italiano</button><button aria-pressed="false">English</button></div>
    </section>
    <section class="card stack">
      <div><h2 class="h2">Colore d’accento</h2><div class="muted" style="font-size:.85rem;margin:3px 0 14px">Cambia l’intera app, subito.</div>
      <div class="swatches" id="sw">${[["Arancio", "70% 0.17 48"], ["Corallo", "70% 0.16 22"], ["Ambra", "80% 0.15 80"], ["Salvia", "74% 0.12 150"], ["Oceano", "70% 0.12 235"], ["Viola", "68% 0.15 300"]].map(([n, c], i) => `<button class="sw" style="--c:oklch(${c})" data-c="${c}" aria-label="${n}" aria-pressed="${i === 0}"></button>`).join("")}</div></div>
    </section>
    <section class="card">
      <div class="list">
        ${[["Obiettivi kcal per giorno di riposo", "2.250 kcal · allenamento 2.650", true], ["Promemoria pasti", "Colazione 8:00 · Pranzo 13:00", true], ["Timer di recupero automatico", "Parte a fine serie", true], ["Unità di misura", "Kg · cm · kcal", false]].map(([a, b, on]) => `
        <div class="li"><div><b>${a}</b><small>${b}</small></div><button class="switch" aria-pressed="${on}" aria-label="${a}"></button></div>`).join("")}
      </div>
    </section>
    <section class="card">
      <div class="list">
        <div class="li" data-go="dati" role="button" tabindex="0" style="cursor:pointer"><div><b>Esporta dati</b><small>JSON, tutto resta sul telefono</small></div><span class="muted">›</span></div>
        <div class="li" data-go="dati" role="button" tabindex="0" style="cursor:pointer"><div><b>Importa da Strong, Hevy, FitNotes</b></div><span class="muted">›</span></div>
        <div class="li" data-go="crea-alimento" role="button" tabindex="0" style="cursor:pointer"><div><b>Alimenti e porzioni personalizzati</b></div><span class="muted">›</span></div>
      </div>
    </section>`,


  esercizi: `
    <div class="back"><button class="icon-btn" data-go="allenamento" aria-label="Indietro">‹</button><span class="eyebrow">1.324 esercizi</span></div>
    <h1 class="title">Catalogo</h1>
    <label class="search sfield"><span aria-hidden="true">⌕</span><input placeholder="Cerca esercizio" aria-label="Cerca esercizio"></label>
    <div class="filters" id="ef">${["Tutti", "Petto", "Schiena", "Gambe", "Spalle", "Braccia", "Core", "Corpo libero"].map((t, i) => `<button class="fchip" aria-pressed="${i === 0}">${t}</button>`).join("")}</div>
    <section class="card"><div class="list">
      ${[["Panca piana con bilanciere", "Petto · Bilanciere", "press"], ["Squat con bilanciere", "Quadricipiti · Bilanciere", "leg"], ["Trazioni alla sbarra", "Dorsali · Corpo libero", "back"], ["Curl con manubri", "Bicipiti · Manubri", "arm"], ["Stacco rumeno", "Femorali · Bilanciere", "leg"], ["Plank", "Core · A tempo", "run"], ["Military press", "Spalle · Bilanciere", "press"]].map(([a, b, i]) => `
      <div class="li"><div class="row"><div class="thumb">${svg(ico[i])}</div><div><b>${a}</b><small>${b}</small></div></div><span class="muted">＋</span></div>`).join("")}
    </div></section>
    <button class="add-line" style="justify-self:center" data-go="crea-esercizio">+ Crea esercizio personalizzato</button>`,

  muscoli: `
    <div class="back"><button class="icon-btn" data-go="stats" aria-label="Indietro">‹</button><span class="eyebrow">Ultimi 7 giorni</span></div>
    <h1 class="title">Mappa<br><em>muscolare</em></h1>
    <div class="seg card" style="padding:4px;border-radius:99px" id="side">${["Fronte", "Retro"].map((t, i) => `<button aria-pressed="${i === 0}">${t}</button>`).join("")}</div>
    <section class="card">
      <div class="body-wrap"><svg id="body" viewBox="0 0 200 330" role="img" aria-label="Mappa muscolare"></svg></div>
      <div class="legend" style="margin-top:8px"><span>Riposo</span><i></i><span>Molto lavoro</span></div>
    </section>
    <section class="card" id="mdetail">
      <div class="row between"><h2 class="h2" id="mname">Petto</h2><span class="pill-tag" id="msets">14 serie</span></div>
      <div class="muted" style="font-size:.88rem;margin-top:6px" id="mnote">Ottimo volume: rientri nella fascia 10-20 serie a settimana.</div>
    </section>`,

  cerca: `
    <div class="back"><button class="icon-btn" data-go="pasti" aria-label="Indietro">‹</button><span class="eyebrow">Pranzo · Lun 29</span></div>
    <h1 class="sr">Cerca alimento</h1>
    <div class="row" style="margin-bottom:14px">
      <label class="search sfield"><span aria-hidden="true">⌕</span><input id="q" type="search" placeholder="Cerca un alimento" aria-label="Cerca alimento" autocomplete="off"><button class="clear" id="q-clear" aria-label="Cancella ricerca" hidden>✕</button></label>
      <button class="icon-btn" data-go="scan" aria-label="Scansiona barcode">▥</button>
    </div>
    <div class="filters" id="sfilters" role="group" aria-label="Filtra">${["Tutti", "Recenti", "Preferiti", "Miei"].map((t, i) => `<button class="fchip" aria-pressed="${i === 0}" data-sf="${t}">${t}</button>`).join("")}</div>
    <div id="s-body" aria-live="polite"></div>
    <div class="toast" id="toast" role="status" hidden></div>`,

  cibo: `
    <div class="back"><button class="icon-btn" data-go="pasti" aria-label="Indietro">‹</button><span class="eyebrow">Pranzo · Lun 29</span></div>
    <h1 class="title" style="font-size:2.2rem">Petto di pollo<br><em>alla piastra</em></h1>
    <section class="card stack gap-lg">
      <div class="stepper"><button class="icon-btn" data-g="-10" aria-label="Meno">−</button><div class="num" id="g">180<small> g</small></div><button class="icon-btn" data-g="10" aria-label="Più">+</button></div>
      <div class="filters" style="margin:0 -18px;padding:4px 18px 8px" id="portions">${[["Grammi", 1, 0], ["1 fetta · 120 g", 120, 1], ["1 petto · 200 g", 200, 0], ["+ Porzione", 0, 0]].map(([t, , x]) => `<button class="fchip" aria-pressed="${t === "Grammi"}" data-p="${t}">${t}</button>`).join("")}</div>
      <div class="kv" id="kv"></div>
    </section>
    <section class="card">
      <div class="row between" style="margin-bottom:4px"><div class="eyebrow">Per 100 g · CIQUAL 2025</div><button class="add-line" data-go="versioni">3 versioni ›</button></div>
      <div class="list">
        ${[["Calorie", "165 kcal"], ["Proteine", "31,0 g"], ["Grassi", "3,6 g"], ["Carboidrati", "0 g"], ["Sodio", "74 mg"]].map(([a, b]) => `<div class="li" style="min-height:48px"><span>${a}</span><b>${b}</b></div>`).join("")}
      </div>
    </section>
    <button class="btn" style="width:100%" data-go="pasti">Aggiungi al pranzo</button>`,

  scan: `
    <div class="back"><button class="icon-btn" data-go="pasti" aria-label="Indietro">‹</button><span class="eyebrow">Barcode</span></div>
    <h1 class="title" style="font-size:2.2rem">Inquadra<br>il <em>codice</em></h1>
    <div class="scan"><div class="frame"><i></i><i></i><i></i><i></i><div class="laser"></div></div><p>Open Food Facts · i risultati restano salvati sul telefono</p></div>
    <button class="btn ghost" data-go="cibo">Inserisci il codice a mano</button>`,

  ricette: `
    <div class="back"><button class="icon-btn" data-go="pasti" aria-label="Indietro">‹</button><span class="eyebrow">12 ricette</span></div>
    <h1 class="title">Ricette</h1>
    <section class="card stack">
      <div class="row between"><div><div class="eyebrow">Nuova ricetta</div><h2 class="h2" style="margin-top:4px">Riso, pollo e zucchine</h2></div><span class="pill-tag">4 porzioni</span></div>
      <div class="list">
        ${[["Riso basmati", "360 g"], ["Petto di pollo", "720 g"], ["Zucchine", "800 g"], ["Olio extravergine", "40 g"]].map(([a, b]) => `<div class="li" style="min-height:50px"><b>${a}</b><span class="muted">${b}</span></div>`).join("")}
      </div>
      <button class="add-line">+ Ingrediente</button>
      <div class="kv" style="margin-top:2px"><div><b>612</b><span>kcal</span></div><div><b>48</b><span>prot</span></div><div><b>74</b><span>carb</span></div><div><b>13</b><span>grassi</span></div></div>
      <div class="muted" style="font-size:.8rem;text-align:center;margin-top:-6px">per porzione</div>
    </section>
    <section class="card"><div class="eyebrow" style="margin-bottom:6px">Salvate</div><div class="list">
      ${[["Overnight oats ai mirtilli", "410 kcal · 1 porzione"], ["Frittata di albumi", "280 kcal · 1 porzione"], ["Pasta al pomodoro", "540 kcal · 1 porzione"]].map(([a, b]) => `<div class="li"><div><b>${a}</b><small>${b}</small></div><span class="muted">›</span></div>`).join("")}
    </div></section>`,

  onb: `
    <div class="onb">
      <div class="dots"><i class="on"></i><i></i><i></i><i></i></div>
      <div class="eyebrow">Passo 1 di 4</div>
      <h1 class="title" style="margin-bottom:10px">Qual è il tuo <em>obiettivo?</em></h1>
      <p class="muted" style="margin-bottom:22px;line-height:1.45">Useremo questo per suggerirti calorie e macro. Puoi cambiare tutto dopo.</p>
      <div class="stack" id="goals">
        <button class="choice" aria-pressed="false"><span>Mettere massa<small>Surplus leggero, proteine alte</small></span></button>
        <button class="choice" aria-pressed="true"><span>Ricomposizione<small>Mantenimento, allenamento intenso</small></span></button>
        <button class="choice" aria-pressed="false"><span>Perdere grasso<small>Deficit moderato</small></span></button>
        <button class="choice" aria-pressed="false"><span>Solo tenere traccia<small>Nessun obiettivo</small></span></button>
      </div>
      <div style="flex:1;min-height:20px"></div>
      <button class="btn" style="width:100%" data-go="onb2">Continua</button>
    </div>`,
};

/* ---------- BUILD ---------- */
if (window.extraPages) Object.assign(pages, window.extraPages({ bar, svg, ico }));
const pagesEl = $("#pages"), navEl = $("#nav");
for (const [k, html] of Object.entries(pages)) {
  const p = document.createElement("section");
  p.className = "page"; p.id = "p-" + k; p.innerHTML = html;
  pagesEl.append(p);
}
navEl.innerHTML = '<div class="nav-blob" id="blob"></div>' + tabs.map(([k, l]) =>
  `<button class="tab" role="tab" data-go="${k}" aria-selected="false"><svg viewBox="0 0 24 24">${icon[k]}</svg>${l}</button>`).join("");

let current = null;
function go(k, silent) {
  if (current === k) return;
  current = k;
  lastTop = 0; navEl.classList.remove("min");
  $$(".page").forEach(p => p.classList.toggle("on", p.id === "p-" + k));
  const parent = {
    sessione: "allenamento", riepilogo: "allenamento", programma: "allenamento", esercizio: "allenamento", esercizi: "allenamento", "crea-esercizio": "allenamento",
    cibo: "pasti", cerca: "pasti", scan: "pasti", ricette: "pasti", versioni: "pasti", "crea-alimento": "pasti", "pasti-config": "pasti",
    muscoli: "stats", peso: "oggi", "oggi-vuoto": "oggi", obiettivi: "impostazioni", promemoria: "impostazioni", dati: "impostazioni",
  }[k] || k;
  const idx = tabs.findIndex(t => t[0] === parent);
  $$(".tab").forEach((t, i) => t.setAttribute("aria-selected", i === idx));
  $("#blob").style.opacity = idx < 0 ? 0 : 1;
  if (idx >= 0) $("#blob").style.translate = `calc(${idx} * 100%) 0`;
  navEl.style.display = k.startsWith("onb") ? "none" : "";
  $$(".chips [data-s]").forEach(c => c.setAttribute("aria-pressed", c.dataset.s === k));
  $("#p-" + k).scrollTop = 0;
  if (k === "stats") drawChart(chartKind);
  if (!silent) syncOut(k);
}

document.addEventListener("click", e => {
  const g = e.target.closest("[data-go]");
  if (g) go(g.dataset.go);
  const s = e.target.closest(".chips [data-s]");
  if (s) go(s.dataset.s);
});


/* ---------- RICERCA ALIMENTI ----------
   Questa logica è la specifica della ricerca reale (vedi design.md, "Ricerca alimenti"):
   parole in qualsiasi ordine, ognuna come inizio di parola; accenti e maiuscole ignorati; nomi IT, EN e FR. */
const norm = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const words = t => norm(t).split(/[^a-z0-9]+/).filter(Boolean);
// Parole vuote ignorate nella ricerca: "petto di pollo" deve trovare "Pollo, petto, ...".
const STOP = new Set(["di", "del", "della", "dei", "delle", "da", "con", "e", "il", "la", "le", "in", "al", "a"]);
const queryWords = q => { const w = words(q), k = w.filter(x => !STOP.has(x)); return k.length ? k : w; };
const num = (n, d = 1) => n.toLocaleString("it-IT", { maximumFractionDigits: d });
const esc = t => t.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const RECENTI = ["usda:171477", "ciqual:9100", "ciqual:17270"];
let sQuery = "", sFilter = "Tutti", sForced = null;

function searchFoods(q) {
  const toks = queryWords(q);
  if (!toks.length) return [];
  const scored = [];
  for (const f of SAMPLE_FOODS) {
    const it = words(f.nameIt), other = words(f.nameEn + " " + (f.nameFr || ""));
    const inIt = toks.every(t => it.some(w => w.startsWith(t)));
    if (!inIt && !toks.every(t => it.concat(other).some(w => w.startsWith(t)))) continue;
    let sc = inIt ? 0 : -50;
    if (it[0] && toks.some(t => it[0].startsWith(t))) sc += 30; // il nome comincia con una delle parole cercate
    sc += toks.filter(t => it.includes(t)).length * 10;
    sc += f.source === "ciqual" ? 5 : 0;
    sc -= f.nameIt.length / 4;
    scored.push({ f, sc });
  }
  scored.sort((a, b) => b.sc - a.sc);
  // Stesso nome italiano da fonti diverse: una riga sola, con il numero di versioni.
  const groups = new Map();
  for (const { f } of scored) {
    const k = norm(f.nameIt);
    if (groups.has(k)) groups.get(k).versions++; else groups.set(k, { f, versions: 1 });
  }
  return [...groups.values()];
}

const hl = (name, toks) => esc(name).replace(/[\p{L}\p{N}]+/gu, w => toks.some(t => norm(w).startsWith(t)) ? `<mark>${w}</mark>` : w);
const foodRow = ({ f, versions }, toks = []) => `
  <div class="li result">
    <button class="res-main" data-go="cibo"><b>${hl(f.nameIt, toks)}</b>
      <small>100 g · ${num(f.kcal, 0)} kcal · P ${num(f.protein)} · C ${num(f.carbs)} · G ${num(f.fat)}${versions > 1 ? ` · ${versions} versioni` : ""}</small></button>
    <button class="icon-btn add" data-add aria-label="Aggiungi ${esc(f.nameIt)} al pranzo">+</button>
  </div>`;
const skeleton = () => `<div role="status" aria-label="Cerco…">${"<div class='li'><div style='flex:1'><i class='sk' style='width:62%'></i><i class='sk' style='width:38%;height:10px;margin-top:8px'></i></div><i class='sk' style='width:44px;height:44px;border-radius:99px'></i></div>".repeat(5)}</div>`;
const emptyBox = (title, text, actions = "") => `<section class="card empty"><h2 class="h2">${title}</h2><p class="muted">${text}</p>${actions}</section>`;

function renderSearch() {
  const q = sQuery.trim(), toks = queryWords(q), body = $("#s-body");
  $("#q").value = sQuery;
  $("#q-clear").hidden = !q;
  $$("#sfilters .fchip").forEach(c => c.setAttribute("aria-pressed", c.dataset.sf === sFilter));
  let html = "";
  if (sForced === "caricamento") html = skeleton();
  else if (!q) {
    if (sFilter === "Preferiti") html = emptyBox("Nessun preferito", "Tocca la stella nella scheda di un alimento per ritrovarlo qui.");
    else if (sFilter === "Miei") html = emptyBox("Nessun alimento tuo", "Crea un alimento con i tuoi valori: resta solo sul telefono.", `<button class="btn" style="margin-top:14px">Crea alimento</button>`);
    else html = `<section class="card"><div class="meal-head"><h2 class="h2">Recenti</h2><span class="muted" style="font-size:.85rem">per il pranzo</span></div><div class="list">${RECENTI.map(id => foodRow({ f: SAMPLE_FOODS.find(x => x.id === id), versions: 1 })).join("")}</div></section>
      <p class="hint">Scrivi le parole che ricordi, in qualsiasi ordine. Anche in inglese o francese.</p>`;
  } else {
    let res = searchFoods(q);
    if (sFilter === "Recenti") res = res.filter(r => RECENTI.includes(r.f.id));
    else if (sFilter === "Preferiti" || sFilter === "Miei") res = [];
    if (!res.length) html = emptyBox(`Nessun alimento per “${esc(q)}”`, sFilter === "Tutti" ? "Controlla l’ortografia o scrivi solo una parte del nome." : `Niente in “${sFilter}” con questa ricerca. Prova con “Tutti”.`,
      sFilter === "Tutti" ? `<div class="stack" style="margin-top:14px"><button class="btn">Crea “${esc(q)}”</button><button class="btn ghost" data-go="scan">Scansiona il barcode</button></div>` : "");
    else html = `<div class="eyebrow" style="margin-bottom:6px">${res.length} ${res.length === 1 ? "risultato" : "risultati"}</div><section class="card"><div class="list">${res.slice(0, 20).map(r => foodRow(r, toks)).join("")}</div></section>`;
  }
  if (sForced === "offline") html = `<div class="notice" role="status"><b>Sei offline.</b> Cerco solo tra gli alimenti sul telefono.<small>I prodotti confezionati online tornano con la connessione.</small></div>` + html;
  body.innerHTML = html;
}

document.addEventListener("input", e => { if (e.target.id !== "q") return; sQuery = e.target.value; sForced = null; renderSearch(); });
document.addEventListener("click", e => {
  if (e.target.closest("#q-clear")) { sQuery = ""; sForced = null; renderSearch(); $("#q").focus(); }
  const c = e.target.closest("[data-sf]"); if (c) { sFilter = c.dataset.sf; renderSearch(); }
  const a = e.target.closest("[data-add]");
  if (a) {
    a.classList.add("done"); a.textContent = "✓"; a.setAttribute("aria-label", "Aggiunto");
    const t = $("#toast"); t.textContent = "Aggiunto al pranzo · 100 g"; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => (t.hidden = true), 1800);
  }
  const st = e.target.closest("#search-states [data-ss]");
  if (st) {
    const k = st.dataset.ss;
    sFilter = "Tutti"; sForced = ["caricamento", "offline"].includes(k) ? k : null;
    sQuery = { vuoto: "", risultati: "pollo petto", nessuno: "sushiroll", caricamento: "yogurt", offline: "riso" }[k];
    go("cerca"); renderSearch();
    $$("#search-states .chip").forEach(x => x.setAttribute("aria-pressed", x === st));
  }
});
renderSearch();

/* variante */
document.addEventListener("focusin", e => { const f = e.target.closest("[data-focus-go]"); if (f) go(f.dataset.focusGo); });
$("#variants").addEventListener("click", e => {
  const c = e.target.closest(".chip"); if (!c) return;
  document.documentElement.dataset.theme = c.dataset.v;
  $$("#variants .chip").forEach(x => x.setAttribute("aria-pressed", x === c));
  $("#note").textContent = notes[c.dataset.v];
  try { localStorage.setItem("forma-v", c.dataset.v); } catch {}
});
let saved = matchMedia("(prefers-color-scheme: dark)").matches ? "neve-scura" : "neve"; try { saved = localStorage.getItem("forma-v") || saved; } catch {}
$(`#variants [data-v="${saved}"]`).click();

/* interazioni */
$("#sets").addEventListener("click", e => {
  const b = e.target.closest(".check"); if (!b) return;
  const on = b.getAttribute("aria-pressed") !== "true";
  b.setAttribute("aria-pressed", on); b.closest(".set").classList.toggle("done", on);
  if (on) { restLeft = 90; }
});
$$("#sets .check").forEach(b => b.closest(".set").classList.toggle("done", b.getAttribute("aria-pressed") === "true"));

let restLeft = 90;
setInterval(() => {
  restLeft = Math.max(0, restLeft - 1);
  $("#rest").textContent = `${Math.floor(restLeft / 60)}:${String(restLeft % 60).padStart(2, "0")}`;
}, 1000);
document.addEventListener("click", e => {
  const r = e.target.closest("[data-rest]"); if (!r) return;
  const v = +r.dataset.rest; restLeft = v === 0 ? 0 : Math.max(0, restLeft + v);
});

$("#days").addEventListener("click", e => {
  const d = e.target.closest(".day"); if (!d) return;
  $$("#days .day").forEach(x => x.setAttribute("aria-pressed", x === d));
});
$$(".switch").forEach(s => s.addEventListener("click", () => s.setAttribute("aria-pressed", s.getAttribute("aria-pressed") !== "true")));
$("#goals").addEventListener("click", e => {
  const c = e.target.closest(".choice"); if (!c) return;
  $$("#goals .choice").forEach(x => x.setAttribute("aria-pressed", x === c));
});
document.addEventListener("click", e => {
  const sw = e.target.closest(".sw"); if (!sw) return;
  $$(".sw", sw.parentElement).forEach(x => x.setAttribute("aria-pressed", x === sw));
  document.documentElement.style.setProperty("--accent", `oklch(${sw.dataset.c})`);
});
/* controlli generici: segmenti, scelta singola, scelta multipla, tema, peso; Invio/Spazio sulle righe cliccabili */
document.addEventListener("click", e => {
  const sg = e.target.closest("[data-seg] button");
  if (sg) $$("button", sg.parentElement).forEach(x => x.setAttribute("aria-pressed", x === sg));
  const th = e.target.closest("[data-theme-set]");
  if (th) $(`#variants [data-v="${th.dataset.themeSet}"]`).click();
  const ch = e.target.closest("[data-single] .choice");
  if (ch) $$(".choice", ch.parentElement).forEach(x => x.setAttribute("aria-pressed", x === ch));
  const dy = e.target.closest("[data-multi] .day");
  if (dy) dy.setAttribute("aria-pressed", dy.getAttribute("aria-pressed") !== "true");
  const w = e.target.closest("[data-w]");
  if (w) { weight = Math.round((weight + +w.dataset.w) * 10) / 10; $("#wval").firstChild.nodeValue = weight.toLocaleString("it-IT", { minimumFractionDigits: 1 }); }
});
let weight = 78.2;
document.addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const r = e.target.closest('[role="button"][data-go]');
  if (r) { e.preventDefault(); r.click(); }
});

/* grafico */
let chartKind = 0;
const series = [
  ["Peso corporeo", "−2,1 kg", [80.3, 80.1, 79.8, 79.9, 79.4, 79.2, 79.3, 78.9, 78.7, 78.8, 78.4, 78.2], 78, 81],
  ["Calorie medie", "2.480 kcal", [2350, 2600, 2450, 2700, 2500, 2400, 2650, 2550, 2450, 2500, 2600, 2480], 2200, 2800],
  ["Volume totale", "+18%", [5.2, 6.1, 5.8, 7.0, 6.6, 7.4, 8.1, 7.7, 8.0, 8.3, 8.6, 9.1], 5, 9.5],
];
function drawChart(i) {
  const [t, d, v, lo, hi] = series[i];
  $("#chart-t").textContent = t; $("#chart-d").textContent = d;
  const x = j => 8 + (j / (v.length - 1)) * 304, y = n => 130 - ((n - lo) / (hi - lo)) * 110;
  const path = v.map((n, j) => `${j ? "L" : "M"}${x(j).toFixed(1)} ${y(n).toFixed(1)}`).join(" ");
  const grid = [0, 1, 2].map(k => `<line class="gridline" x1="0" x2="320" y1="${20 + k * 55}" y2="${20 + k * 55}"/>`).join("");
  const last = v.length - 1;
  $("#chart").innerHTML = `${grid}<path class="line" d="${path}"/><circle cx="${x(last)}" cy="${y(v[last])}" r="6" fill="var(--accent)" stroke="var(--bg)" stroke-width="3"/>
    <text x="0" y="148">lug</text><text x="150" y="148">ago</text><text x="292" y="148">set</text>`;
  const p = $("#chart path.line"); p.style.animation = "none"; void p.getBoundingClientRect(); p.style.animation = "";
}
$("#seg").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  chartKind = $$("#seg button").indexOf(b);
  $$("#seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
  drawChart(chartKind);
});

/* filtri, porzioni, mappa */
document.addEventListener("click", e => {
  const f = e.target.closest(".fchip"); if (!f) return;
  $$(".fchip", f.parentElement).forEach(x => x.setAttribute("aria-pressed", x === f));
});
let grams = 180;
const foodKv = () => {
  const r = grams / 100;
  $("#g").firstChild.nodeValue = grams;
  $("#kv").innerHTML = [[Math.round(165 * r), "kcal"], [(31 * r).toFixed(0), "prot"], [(0 * r).toFixed(0), "carb"], [(3.6 * r).toFixed(1).replace(".", ","), "grassi"]].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("");
};
document.addEventListener("click", e => {
  const g = e.target.closest("[data-g]");
  if (g) { grams = Math.max(10, grams + +g.dataset.g); foodKv(); }
  const p = e.target.closest("[data-p]");
  if (p) { const m = p.dataset.p.match(/(\d+) g/); grams = m ? +m[1] : grams; foodKv(); }
});
foodKv();

const front = [["Spalle", 0.75, "M46 70a20 20 0 0 1 22-16l-4 34-24 6z M154 70a20 20 0 0 0-22-16l4 34 24 6z", 12], ["Petto", 0.95, "M68 56h64l-4 46-28 8-28-8z", 14], ["Bicipiti", 0.5, "M38 96l22-4-6 52-18-2z M162 96l-22-4 6 52 18-2z", 8], ["Addome", 0.3, "M76 114l24 6 24-6 0 54-24 8-24-8z", 5], ["Quadricipiti", 0.6, "M72 182l26 2-4 84-22 0z M128 182l-26 2 4 84 22 0z", 10], ["Polpacci", 0.2, "M74 274h20l-2 40H78z M126 274h-20l2 40h14z", 3]];
const rear = [["Trapezi", 0.55, "M74 50l26-10 26 10-8 40h-36z", 8], ["Dorsali", 0.85, "M66 92h68l-8 54h-52z", 13], ["Tricipiti", 0.6, "M38 96l22-4-6 52-18-2z M162 96l-22-4 6 52 18-2z", 9], ["Glutei", 0.45, "M70 156h60l4 32-34 8-34-8z", 7], ["Femorali", 0.5, "M72 198l26 2-4 74-22 0z M128 198l-26 2 4 74 22 0z", 8], ["Polpacci", 0.35, "M74 280h20l-2 34H78z M126 280h-20l2 34h-14z", 5]];
let side = 0;
function drawBody() {
  const set = side ? rear : front;
  $("#body").innerHTML = `<circle class="m base" cx="100" cy="24" r="17"/><rect class="m base" x="90" y="40" width="20" height="14" rx="5"/>` +
    set.map(([n, a, d, k], i) => `<path class="m" data-i="${i}" style="--a:${a}" d="${d}"/>`).join("");
  showM(0);
}
function showM(i) {
  const [n, a, , k] = (side ? rear : front)[i];
  $$("#body .m[data-i]").forEach(x => x.classList.toggle("sel", +x.dataset.i === i));
  $("#mname").textContent = n; $("#msets").textContent = k + " serie";
  $("#mnote").textContent = k >= 10 ? "Ottimo volume: sei nella fascia 10-20 serie a settimana." : k >= 6 ? "Volume sufficiente per mantenere. Per crescere punta a 10+ serie." : "Poco allenato questa settimana.";
}
$("#body").addEventListener("click", e => { const m = e.target.closest("[data-i]"); if (m) showM(+m.dataset.i); });
$("#side").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  side = $$("#side button").indexOf(b);
  $$("#side button").forEach(x => x.setAttribute("aria-pressed", x === b));
  drawBody();
});
drawBody();

/* ---------- PIATTAFORMA: iOS 26 (Liquid Glass) / Android ---------- */
const root = document.documentElement;
const qs = new URLSearchParams(location.search);
const SOLO = qs.has("solo"); // anteprima incorporata nell'altra (vista "Affianca")
if (SOLO) document.body.classList.add("solo");
const PLATFORM_NOTES = {
  ios: "iOS 26: barra delle tab di sistema in Liquid Glass. Si riduce quando scorri e si riapre toccandola. Tasto indietro in vetro. Card e campi restano Neve. Il browser imita il vetro, non è identico a quello di Apple.",
  android: "Android e iOS precedenti: barra a pillola Neve con indicatore d'accento, freccia di ritorno e avviso in stile Material.",
  both: "A sinistra iOS 26, a destra Android. Le due anteprime navigano insieme.",
};
const SB = {
  signal: '<svg viewBox="0 0 18 12" width="17" height="11" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>',
  wifi: '<svg viewBox="0 0 16 12" width="16" height="12" aria-hidden="true"><path d="M8 11.5 5.8 9.1a3.2 3.2 0 0 1 4.4 0zM2.9 6.2a7.2 7.2 0 0 1 10.2 0l-1.3 1.4a5.3 5.3 0 0 0-7.6 0zM.3 3.4a10.9 10.9 0 0 1 15.4 0l-1.3 1.4a9 9 0 0 0-12.8 0z"/></svg>',
  battery: '<svg viewBox="0 0 27 12" width="26" height="12" aria-hidden="true"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="17" height="8" rx="2"/><rect x="24" y="4" width="2" height="4" rx="1" opacity=".45"/></svg>',
};
function setPlatform(p) {
  root.dataset.platform = p;
  $("#statusbar").innerHTML = p === "ios"
    ? `<span>9:41</span><span class="sb-r">${SB.signal}${SB.wifi}${SB.battery}</span>`
    : `<span>12:30</span><span class="sb-r">${SB.wifi}${SB.signal}${SB.battery}</span>`;
  navEl.classList.remove("min");
  document.dispatchEvent(new CustomEvent("platformchange", { detail: p }));
}
function applyPlatformChoice(c) {
  $$("#platforms .chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.plat === c));
  const both = c === "both", twin = $("#twin");
  document.body.classList.toggle("compare", both);
  setPlatform(both ? "ios" : c);
  twin.hidden = !both;
  if (both) { const u = new URL(location.href); u.search = `?solo=1&p=android&s=${current}`; twin.src = u.href; }
  else twin.removeAttribute("src");
  $("#plat-note").textContent = PLATFORM_NOTES[c];
  try { localStorage.setItem("forma-platform", c); } catch {}
}
if (SOLO) setPlatform(qs.get("p") === "ios" ? "ios" : "android");
else {
  $("#platforms").addEventListener("click", e => { const c = e.target.closest("[data-plat]"); if (c) applyPlatformChoice(c.dataset.plat); });
  let saved = "ios"; try { saved = localStorage.getItem("forma-platform") || saved; } catch {}
  applyPlatformChoice(["ios", "android", "both"].includes(saved) ? saved : "ios");
}

/* le due anteprime navigano insieme; tema e ritocchi si propagano con l'evento `storage` */
const otherWin = () => (SOLO ? window.parent : $("#twin").hidden ? null : $("#twin").contentWindow);
function syncOut(k) {
  const w = otherWin();
  if (w && w !== window) w.postMessage({ forma: "go", k }, location.origin === "null" ? "*" : location.origin);
}
window.addEventListener("message", e => {
  if (e.data?.forma !== "go" || e.source !== otherWin()) return;
  go(e.data.k, true);
});
window.addEventListener("storage", e => {
  if (e.key === "forma-v" && e.newValue) $(`#variants [data-v="${e.newValue}"]`)?.click();
});

/* iOS 26: la barra di sistema si riduce scorrendo verso il basso e si riapre toccandola o scorrendo verso l'alto */
let lastTop = 0;
$("#pages").addEventListener("scroll", e => {
  if (root.dataset.platform !== "ios") return;
  const top = e.target.scrollTop, d = top - lastTop; lastTop = top;
  if (top > 80 && d > 6) navEl.classList.add("min");
  else if (d < -6 || top < 40) navEl.classList.remove("min");
}, true);
navEl.addEventListener("click", e => { if (navEl.classList.contains("min")) { navEl.classList.remove("min"); e.stopPropagation(); } }, true);

const init = qs.get("s") || "oggi";
go(pages[init] ? init : "oggi", true);
