/* Schermate aggiuntive del prototipo. app.js le unisce a `pages` passando i suoi helper. */
window.extraPages = ({ bar, svg, ico }) => {
  const back = (to, label) => `<div class="back"><button class="icon-btn" data-go="${to}" aria-label="Indietro">‹</button><span class="eyebrow">${label}</span></div>`;
  const fld = (label, value, unit = "", hint = "", cls = "") => `
    <label class="fld ${cls}"><span>${label}</span><div class="fld-box"><input value="${value}" inputmode="decimal" aria-label="${label}"><em>${unit}</em></div>${hint ? `<small>${hint}</small>` : ""}</label>`;
  const seg = (opts, on = 0) => `<div class="seg card" data-seg style="padding:4px;border-radius:var(--r-btn);margin:0">${opts.map((t, i) => `<button aria-pressed="${i === on}">${t}</button>`).join("")}</div>`;
  const sw = () => `<div class="swatches" data-accents>${[["Arancio", "70% 0.17 48"], ["Corallo", "70% 0.16 22"], ["Ambra", "80% 0.15 80"], ["Salvia", "74% 0.12 150"], ["Oceano", "70% 0.12 235"], ["Viola", "68% 0.15 300"]].map(([n, c], i) => `<button class="sw" aria-label="${n}" aria-pressed="${i === 0}" data-c="${c}" style="--c:oklch(${c})"></button>`).join("")}</div>`;
  const dots = n => `<div class="dots">${[1, 2, 3, 4].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
  const sw2 = (label, sub, on) => `<div class="li"><div><b>${label}</b>${sub ? `<small>${sub}</small>` : ""}</div><button class="switch" aria-pressed="${on}" aria-label="${label}"></button></div>`;
  const nav = (label, sub, to, right = "›") => `<div class="li" data-go="${to}" role="button" tabindex="0" style="cursor:pointer"><div><b>${label}</b>${sub ? `<small>${sub}</small>` : ""}</div><span class="muted">${right}</span></div>`;
  const chart = pts => {
    const lo = Math.min(...pts) - 2, hi = Math.max(...pts) + 2;
    const x = i => 8 + (i / (pts.length - 1)) * 304, y = n => 130 - ((n - lo) / (hi - lo)) * 110;
    const d = pts.map((n, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(n).toFixed(1)}`).join(" ");
    return `<svg viewBox="0 0 320 150" role="img" aria-label="Andamento">${[0, 1, 2].map(k => `<line class="gridline" x1="0" x2="320" y1="${20 + k * 55}" y2="${20 + k * 55}"/>`).join("")}<path class="line" d="${d}"/><circle cx="${x(pts.length - 1)}" cy="${y(pts[pts.length - 1])}" r="6" fill="var(--accent)" stroke="var(--bg)" stroke-width="3"/></svg>`;
  };

  return {
    /* ======== ALLENAMENTO ======== */
    allenamento: `
      <div><div class="eyebrow">Palestra</div><h1 class="title">Allenamento</h1></div>
      <section class="card workout-today">
        <div class="row between"><span class="eyebrow">Oggi</span><span class="pill-tag">Push A</span></div>
        <div><div class="h2">Petto, spalle, tricipiti</div><div class="muted" style="font-size:.85rem;margin-top:4px">6 esercizi, circa 55 min. Panca: 82,5 kg, +2,5 dall’ultima volta</div></div>
        <div class="stack"><button class="btn" data-go="sessione">Inizia allenamento</button><button class="btn ghost" data-go="esercizi">Allenamento libero</button></div>
      </section>
      <section class="card">
        <div class="meal-head"><h2 class="h2">Programmi</h2><button class="add-line" data-go="programma">Modifica</button></div>
        <div class="list">
          ${[["Push A", "Petto, spalle, tricipiti · 6 esercizi", "3 giorni fa"], ["Pull A", "Schiena, bicipiti · 6 esercizi", "5 giorni fa"], ["Gambe A", "Quadricipiti, femorali · 5 esercizi", "8 giorni fa"]].map(([a, b, c]) => `<div class="li" data-go="programma" role="button" tabindex="0" style="cursor:pointer"><div><b>${a}</b><small>${b}</small></div><span class="muted" style="font-size:.8rem">${c}</span></div>`).join("")}
        </div>
        <button class="add-line" data-go="programma">+ Crea programma</button>
      </section>
      <section class="card">
        <div class="eyebrow" style="margin-bottom:6px">Ultimi allenamenti</div>
        <div class="list">
          ${[["Pull A", "Sab 27 · 9,4 t · 58 min", ""], ["Push A", "Mer 24 · 8,1 t · 52 min", "Record"], ["Gambe A", "Lun 22 · 12,6 t · 64 min", ""]].map(([a, b, c]) => `<div class="li" data-go="riepilogo" role="button" tabindex="0" style="cursor:pointer"><div><b>${a}</b><small>${b}</small></div>${c ? `<span class="pill-tag">${c}</span>` : `<span class="muted">›</span>`}</div>`).join("")}
        </div>
      </section>`,

    riepilogo: `
      ${back("allenamento", "Push A · Lun 29")}
      <h1 class="title">Allenamento<br><em>completato</em></h1>
      <section class="card"><div class="kv k3"><div><b>58</b><span>minuti</span></div><div><b>9,4</b><span>tonnellate</span></div><div><b>21</b><span>serie</span></div></div></section>
      <section class="card">
        <div class="eyebrow" style="margin-bottom:6px">Record</div>
        <div class="list">
          <div class="li"><div><b>Panca piana</b><small>82,5 kg × 5 · 1RM stimato 98 kg</small></div><span class="pill-tag">Nuovo</span></div>
          <div class="li"><div><b>Military press</b><small>45 kg × 8</small></div><span class="muted">+2,5 kg</span></div>
        </div>
      </section>
      <section class="card stack"><h2 class="h2">Muscoli lavorati</h2>
        ${bar("Petto", 12, 20, "var(--accent)")}${bar("Spalle", 6, 20, "oklch(72% 0.11 85)")}${bar("Tricipiti", 6, 20, "oklch(66% 0.09 20)")}
      </section>
      <div class="stack"><button class="btn" data-go="allenamento">Salva allenamento</button><button class="btn ghost">Aggiungi una nota</button></div>`,

    programma: `
      ${back("allenamento", "Programma")}
      <h1 class="title">Push <em>A</em></h1>
      <section class="card">
        <div class="list">
          ${[["Panca piana con bilanciere", "4 × 8-10 · doppia progressione", ""], ["Military press", "3 × 6-8 · lineare, +2,5 kg", ""], ["Alzate laterali", "3 × 12-15 · superset con French press", "A"], ["French press", "3 × 10-12 · superset con alzate", "A"], ["Dip alle parallele", "3 × al cedimento · corpo libero", ""]].map(([a, b, g]) => `
          <div class="li"><div class="row" style="min-width:0"><span class="handle" aria-hidden="true">⠿</span><div style="min-width:0"><b>${a}</b><small>${b}</small></div></div>${g ? `<span class="pill-tag" title="Superset">SS ${g}</span>` : `<button class="icon-btn" data-go="esercizio" aria-label="Apri ${a}">›</button>`}</div>`).join("")}
        </div>
        <button class="add-line" data-go="esercizi">+ Aggiungi esercizio</button>
      </section>
      <p class="hint" style="margin-top:0">Tieni premuto e trascina per cambiare l’ordine. Due esercizi con lo stesso SS formano un superset.</p>
      <button class="btn" data-go="sessione">Avvia questo programma</button>`,

    esercizio: `
      ${back("programma", "Petto · Bilanciere")}
      <h1 class="title" style="font-size:calc(var(--title-size) * .85)">Panca piana<br><em>con bilanciere</em></h1>
      <section class="card chart">
        <div class="row between"><h2 class="h2">1RM stimato</h2><span class="pill-tag">98 kg</span></div>
        ${chart([88, 90, 90, 92, 93, 94, 95, 96, 96, 97, 98, 98])}
      </section>
      <section class="card stack">
        <div><h2 class="h2">Progressione</h2><div class="muted" style="font-size:.85rem;margin-top:3px">Come decide il carico della prossima volta.</div></div>
        <div class="stack" data-single>
          <button class="choice" aria-pressed="false"><span>Lineare<small>Aggiungi peso ogni sessione riuscita</small></span></button>
          <button class="choice" aria-pressed="false"><span>Greyskull LP<small>Ultima serie a cedimento, poi sale</small></span></button>
          <button class="choice" aria-pressed="true"><span>Doppia progressione<small>Prima le ripetizioni, poi il peso</small></span></button>
        </div>
        ${fld("Ripetizioni obiettivo", "8-10", "rip")}
        ${fld("Aumento di carico", "2,5", "kg")}
        ${fld("Ripetizioni in riserva", "2", "RIR", "Quante ne lasci prima del cedimento.")}
      </section>
      <section class="card">
        <div class="eyebrow" style="margin-bottom:6px">Storico</div>
        <div class="list">
          ${[["Lun 29", "80 × 10 · 80 × 9 · 80 × 8"], ["Gio 25", "77,5 × 10 · 77,5 × 10 · 77,5 × 9"], ["Lun 22", "77,5 × 9 · 77,5 × 8 · 77,5 × 8"]].map(([a, b]) => `<div class="li"><div><b>${a}</b><small>${b}</small></div></div>`).join("")}
        </div>
      </section>`,

    "crea-esercizio": `
      ${back("esercizi", "Nuovo esercizio")}
      <h1 class="title">Crea<br><em>esercizio</em></h1>
      <section class="card stack gap-lg">
        ${fld("Nome", "Panca inclinata con manubri", "")}
        <div class="stack"><span class="lbl">Tipo</span>${seg(["Con carico", "Corpo libero", "A tempo"])}</div>
        <div class="stack"><span class="lbl">Muscolo principale</span>
          <div class="filters" style="margin:0 -18px;padding:4px 18px 8px">${["Petto", "Schiena", "Gambe", "Spalle", "Braccia", "Core"].map((t, i) => `<button class="fchip" aria-pressed="${i === 0}">${t}</button>`).join("")}</div></div>
        <div class="stack"><span class="lbl">Attrezzo</span>
          <div class="filters" style="margin:0 -18px;padding:4px 18px 8px">${["Manubri", "Bilanciere", "Cavi", "Macchina", "Nessuno"].map((t, i) => `<button class="fchip" aria-pressed="${i === 0}">${t}</button>`).join("")}</div></div>
      </section>
      <button class="btn" data-go="esercizi">Salva esercizio</button>`,

    /* ======== PASTI ======== */
    versioni: `
      ${back("cibo", "Broccoli, crudo")}
      <h1 class="title" style="font-size:calc(var(--title-size) * .85)">Scegli la<br><em>versione</em></h1>
      <p class="muted" style="line-height:1.45">Lo stesso alimento arriva da più fonti e i valori cambiano di poco. Puoi cambiarla quando vuoi.</p>
      <div class="stack" data-single>
        <button class="choice" aria-pressed="true" style="min-height:80px"><span>CIQUAL 2025<small>32 kcal · P 3,0 · C 2,7 · G 0,6 · media francese</small></span></button>
        <button class="choice" aria-pressed="false" style="min-height:80px"><span>USDA Foundation<small>32 kcal · P 2,6 · C 4,5 · G 0,4 · analisi di laboratorio</small></span></button>
        <button class="choice" aria-pressed="false" style="min-height:80px"><span>USDA SR Legacy<small>34 kcal · P 2,8 · C 6,6 · G 0,4 · tabella storica</small></span></button>
      </div>
      <button class="btn" data-go="cibo">Usa questa versione</button>`,

    "crea-alimento": `
      ${back("cerca", "Nuovo alimento")}
      <h1 class="title">Crea<br><em>alimento</em></h1>
      <section class="card stack gap-lg">
        ${fld("Nome", "Granola della nonna", "")}
        ${fld("Marca (facoltativa)", "", "")}
        <div class="stack"><span class="lbl">Valori per 100 g</span>
          <div class="grid2">${fld("Calorie", "452", "kcal")}${fld("Proteine", "9,5", "g")}${fld("Carboidrati", "62", "g", "", "err")}${fld("Grassi", "18", "g")}</div>
          <small class="errtxt" role="alert">Con questi macro le calorie sarebbero circa 480, non 452. Controlla i valori.</small>
        </div>
        <details class="more"><summary>Fibre, zuccheri, sodio</summary><div class="grid2" style="margin-top:12px">${fld("Fibre", "", "g")}${fld("Zuccheri", "", "g")}${fld("Sodio", "", "mg")}${fld("Grassi saturi", "", "g")}</div></details>
      </section>
      <section class="card stack">
        <div><h2 class="h2">Porzioni</h2><div class="muted" style="font-size:.85rem;margin-top:3px">Per scegliere quantità senza pesare.</div></div>
        <div class="list"><div class="li" style="min-height:50px"><b>1 ciotola</b><span class="muted">45 g</span></div></div>
        <button class="add-line">+ Aggiungi porzione</button>
      </section>
      <button class="btn" data-go="pasti">Salva alimento</button>`,

    "pasti-config": `
      ${back("impostazioni", "Diario")}
      <h1 class="title">Pasti<br><em>configurabili</em></h1>
      <section class="card">
        <div class="list">
          ${[["Colazione", true], ["Pranzo", true], ["Spuntino", true], ["Cena", true]].map(([a, on]) => `<div class="li"><div class="row"><span class="handle" aria-hidden="true">⠿</span><b>${a}</b></div>${`<button class="switch" aria-pressed="${on}" aria-label="Mostra ${a}"></button>`}</div>`).join("")}
        </div>
        <button class="add-line">+ Aggiungi pasto</button>
      </section>
      <p class="hint" style="margin-top:0">Un pasto nascosto resta nel diario passato. Trascina per cambiare l’ordine.</p>`,

    /* ======== OGGI / PESO ======== */
    "oggi-vuoto": `
      <div><div class="eyebrow">Lunedì 29 settembre</div><h1 class="title">Ciao, <em>Daniele</em></h1></div>
      <section class="card hero" aria-label="Calorie di oggi">
        <div class="ring" style="--off:402"><svg viewBox="0 0 148 148"><circle class="track" cx="74" cy="74" r="64"/><circle class="fill" cx="74" cy="74" r="64"/></svg><div class="ring-c"><div class="num">0</div><span>di 2.650 kcal</span></div></div>
        <div class="stack" style="gap:10px">${bar("Proteine", 0, 170, "var(--accent)")}${bar("Carboidrati", 0, 320, "oklch(72% 0.11 85)")}${bar("Grassi", 0, 80, "oklch(66% 0.09 20)")}</div>
      </section>
      <section class="card stack"><div><h2 class="h2">Da dove partire</h2><div class="muted" style="font-size:.85rem;margin-top:3px">Tre passi, quando vuoi.</div></div>
        <button class="btn" data-go="cerca">Registra il primo pasto</button>
        <button class="btn ghost" data-go="allenamento">Scegli un programma</button>
        <button class="btn ghost" data-go="peso">Registra il peso</button>
      </section>`,

    peso: `
      ${back("oggi", "Lun 29 settembre")}
      <h1 class="title">Registra<br>il <em>peso</em></h1>
      <section class="card stack gap-lg">
        <div class="stepper"><button class="icon-btn" data-w="-0.1" aria-label="Meno 0,1 chilogrammi">−</button><div class="num" id="wval" style="font-size:3.2rem">78,2<small> kg</small></div><button class="icon-btn" data-w="0.1" aria-label="Più 0,1 chilogrammi">+</button></div>
        <div class="muted" style="text-align:center;font-size:.85rem;margin-top:-8px">Ultima misura: 78,6 kg, 2 giorni fa</div>
        ${fld("Nota (facoltativa)", "A digiuno", "")}
      </section>
      <button class="btn" data-go="oggi">Salva</button>
      <section class="card"><div class="eyebrow" style="margin-bottom:6px">Recenti</div><div class="list">
        ${[["Sab 27", "78,6 kg", "−0,2"], ["Gio 25", "78,8 kg", "−0,3"], ["Mar 23", "79,1 kg", "+0,1"]].map(([a, b, c]) => `<div class="li"><div><b>${b}</b><small>${a}</small></div><span class="muted">${c}</span></div>`).join("")}
      </div></section>`,

    /* ======== IMPOSTAZIONI ======== */
    obiettivi: `
      ${back("impostazioni", "Impostazioni")}
      <h1 class="title">Obiettivi<br><em>giornalieri</em></h1>
      ${seg(["Allenamento", "Riposo"])}
      <section class="card stack gap-lg">
        <div class="row between"><div><div class="eyebrow">Calorie</div><div class="num" style="font-size:2.6rem">2.650<small class="muted" style="font-size:1rem;font-weight:600"> kcal</small></div></div><span class="pill-tag">Ricomposizione</span></div>
        <div class="grid2">${fld("Proteine", "170", "g", "2,1 g per kg")}${fld("Grassi", "80", "g")}${fld("Carboidrati", "312", "g", "Il resto delle calorie")}${fld("Fibre", "35", "g")}</div>
        <div class="muted" style="font-size:.8rem;line-height:1.4">4 × 170 + 4 × 312 + 9 × 80 = 2.648 kcal. Se cambi un macro, i carboidrati si adattano.</div>
      </section>
      <section class="card"><div class="list">${sw2("Stessi obiettivi tutti i giorni", "Ignora la differenza tra allenamento e riposo", false)}${sw2("Suggerisci in base al peso", "Aggiorna le calorie quando il peso cambia", true)}</div></section>
      <button class="btn" data-go="impostazioni">Salva obiettivi</button>`,

    promemoria: `
      ${back("impostazioni", "Impostazioni")}
      <h1 class="title">Promemoria</h1>
      <section class="card"><div class="eyebrow" style="margin-bottom:6px">Pasti</div><div class="list">
        ${sw2("Colazione", "8:00", true)}${sw2("Pranzo", "13:00", true)}${sw2("Cena", "20:00", true)}${sw2("Spuntino", "17:00", false)}
      </div></section>
      <section class="card"><div class="eyebrow" style="margin-bottom:6px">Allenamento e corpo</div><div class="list">
        ${sw2("Allenamento", "Nei giorni di allenamento, 18:30", true)}${sw2("Peso", "Ogni mattina, 7:30", false)}${sw2("Fine del recupero", "Suono e vibrazione col telefono in tasca", true)}
      </div></section>
      <p class="hint" style="margin-top:0">Le notifiche restano sul telefono. Puoi cambiare l’autorizzazione dalle impostazioni di sistema.</p>`,

    dati: `
      ${back("impostazioni", "Impostazioni")}
      <h1 class="title">I tuoi<br><em>dati</em></h1>
      <section class="card stack"><div><h2 class="h2">Esporta</h2><div class="muted" style="font-size:.88rem;margin-top:4px;line-height:1.45">Un solo file JSON con diario, allenamenti e impostazioni. Resta sul telefono finché non lo condividi.</div></div>
        <button class="btn">Esporta in JSON</button></section>
      <section class="card"><div class="eyebrow" style="margin-bottom:6px">Importa</div><div class="list">
        ${nav("Forma", "File JSON esportato da Forma", "dati")}${nav("Strong", "File CSV", "dati")}${nav("Hevy", "File CSV", "dati")}${nav("FitNotes", "File CSV", "dati")}
      </div></section>
      <section class="card"><div class="list">
        ${nav("Alimenti e porzioni personalizzati", "3 alimenti", "crea-alimento")}${nav("Fonti dei dati e licenze", "CIQUAL 2025, USDA FoodData Central", "dati")}
      </div></section>`,

    /* ======== ONBOARDING (passi 2-4; il passo 1 è `onb`) ======== */
    onb2: `
      <div class="onb">${dots(2)}
        <div class="eyebrow">Passo 2 di 4</div>
        <h1 class="title" style="margin-bottom:10px">Un po’ <em>di te</em></h1>
        <p class="muted" style="margin-bottom:22px;line-height:1.45">Servono solo per calcolare le calorie. Restano sul telefono.</p>
        <section class="card stack gap-lg">
          <div class="stack"><span class="lbl">Sesso</span>${seg(["Uomo", "Donna", "Preferisco non dire"])}</div>
          <div class="grid2">${fld("Età", "28", "anni")}${fld("Altezza", "178", "cm")}</div>
          ${fld("Peso", "78,2", "kg")}
        </section>
        <div style="flex:1;min-height:20px"></div>
        <button class="btn" style="width:100%" data-go="onb3">Continua</button>
      </div>`,
    onb3: `
      <div class="onb">${dots(3)}
        <div class="eyebrow">Passo 3 di 4</div>
        <h1 class="title" style="margin-bottom:10px">Quando ti <em>alleni?</em></h1>
        <p class="muted" style="margin-bottom:22px;line-height:1.45">Nei giorni di allenamento ti proponiamo più calorie. Puoi cambiare i giorni in ogni momento.</p>
        <div class="wk" data-multi>${["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d, i) => `<button class="day" aria-pressed="${[0, 2, 4, 5].includes(i)}" aria-label="${d}"><b>${d[0]}</b></button>`).join("")}</div>
        <section class="card" style="margin-top:18px"><div class="list">${sw2("Programma già pronto", "Push, Pull e Gambe da adattare", true)}</div></section>
        <div style="flex:1;min-height:20px"></div>
        <button class="btn" style="width:100%" data-go="onb4">Continua</button>
      </div>`,
    onb4: `
      <div class="onb">${dots(4)}
        <div class="eyebrow">Passo 4 di 4</div>
        <h1 class="title" style="margin-bottom:10px">Rendila <em>tua</em></h1>
        <section class="card stack gap-lg">
          <div class="stack"><span class="lbl">Tema</span><div class="seg card" data-seg style="padding:4px;border-radius:var(--r-btn);margin:0">${[["Chiaro", "neve"], ["Scuro", "neve-scura"]].map(([t, v], i) => `<button aria-pressed="${i === 0}" data-theme-set="${v}">${t}</button>`).join("")}</div></div>
          <div class="stack"><span class="lbl">Colore d’accento</span>${sw()}</div>
        </section>
        <section class="card"><div class="eyebrow" style="margin-bottom:6px">Il tuo punto di partenza</div>
          <div class="kv k3"><div><b>2.650</b><span>kcal allen.</span></div><div><b>2.250</b><span>kcal riposo</span></div><div><b>170</b><span>g proteine</span></div></div></section>
        <div style="flex:1;min-height:20px"></div>
        <button class="btn" style="width:100%" data-go="oggi-vuoto">Inizia</button>
      </div>`,
  };
};
