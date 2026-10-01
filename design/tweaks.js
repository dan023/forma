/* Tweakbar: modifica dal vivo i token di stile del prototipo (colore, card, pulsanti, campi, tipografia, densità, movimento).
   Lo stato si salva in localStorage; "Copia token" esporta i valori da portare in src/constants/theme.ts e design.md. */
(() => {
  const KEY = "forma-tweaks";
  const root = document.documentElement;

  const ACCENTS = [["Arancio", 70, 0.17, 48], ["Corallo", 70, 0.16, 22], ["Ambra", 80, 0.15, 80], ["Salvia", 74, 0.12, 150], ["Oceano", 70, 0.12, 235], ["Viola", 68, 0.15, 300]];
  const FONTS = {
    "Bricolage + Figtree": ['"Bricolage Grotesque", "Avenir Next", sans-serif', '"Figtree", "Avenir Next", sans-serif'],
    "Outfit + DM Sans": ['"Outfit", "Avenir Next", sans-serif', '"DM Sans", "Avenir Next", sans-serif'],
    "Geist": ['"Geist", "Avenir Next", sans-serif', '"Geist", "Avenir Next", sans-serif'],
    "Sora + Figtree": ['"Sora", "Avenir Next", sans-serif', '"Figtree", "Avenir Next", sans-serif'],
  };
  const DEFAULTS = {
    theme: "neve", l: 70, c: 0.17, h: 48,
    surface: "neu", depth: 9, idepth: 2, rCard: 28, rInner: 20,
    btnStyle: "solid", btnShape: 999, btnH: 48, btnGlow: 45, navShape: 999,
    font: "Bricolage + Figtree", titleSize: 2.6,
    density: "normal", motion: "on",
  };

  let t;
  try { t = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { t = { ...DEFAULTS }; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch {} };

  const px = v => v + "px";
  function apply() {
    const s = root.style;
    s.setProperty("--accent", `oklch(${t.l}% ${t.c} ${t.h})`);
    s.setProperty("--depth", t.depth); s.setProperty("--idepth", t.idepth);
    s.setProperty("--r-lg", px(t.rCard)); s.setProperty("--r-md", px(t.rInner));
    s.setProperty("--r-btn", px(t.btnShape)); s.setProperty("--r-nav", px(t.navShape));
    s.setProperty("--btn-h", px(t.btnH)); s.setProperty("--btn-glow", t.btnGlow + "%");
    s.setProperty("--title-size", t.titleSize + "rem");
    const [display, body] = FONTS[t.font] || FONTS[DEFAULTS.font];
    s.setProperty("--font-display", display); s.setProperty("--font-body", body);
    root.dataset.surface = t.surface; root.dataset.btn = t.btnStyle;
    root.dataset.density = t.density; root.dataset.motion = t.motion;
  }

  /* ---------- UI ---------- */
  const el = (tag, attrs = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), attrs);
    kids.flat().forEach(k => n.append(k));
    return n;
  };
  const controls = []; // funzioni che riallineano la UI allo stato
  let navRow, navHint;

  const seg = (id, label, options) => {
    const box = el("div", { className: "tw-seg", role: "group", ariaLabel: label });
    const btns = options.map(([value, text]) => {
      const b = el("button", { type: "button", textContent: text });
      b.addEventListener("click", () => { t[id] = value; sync(); });
      return [value, b];
    });
    btns.forEach(([, b]) => box.append(b));
    controls.push(() => btns.forEach(([v, b]) => b.setAttribute("aria-pressed", v === t[id])));
    return el("div", { className: "tw-row" }, el("span", { className: "tw-label", textContent: label }), box);
  };
  const range = (id, label, min, max, step, unit = "", decimals = 0) => {
    const input = el("input", { type: "range", id: "tw-" + id, min, max, step });
    const out = el("output", { htmlFor: "tw-" + id });
    input.addEventListener("input", () => { t[id] = Number(input.value); sync(); });
    controls.push(() => { input.value = t[id]; out.textContent = Number(t[id]).toFixed(decimals) + unit; });
    return el("div", { className: "tw-row" }, el("label", { htmlFor: "tw-" + id }, label, out), input);
  };
  const section = (title, ...rows) => el("section", { className: "tw-sec" }, el("h3", { textContent: title }), ...rows);

  const swatches = el("div", { className: "tw-sw", role: "group", ariaLabel: "Colori d'accento" });
  const swBtns = ACCENTS.map(([name, l, c, h]) => {
    const b = el("button", { type: "button", title: name, ariaLabel: name });
    b.style.setProperty("--c", `oklch(${l}% ${c} ${h})`);
    b.addEventListener("click", () => { Object.assign(t, { l, c, h }); sync(); });
    swatches.append(b);
    return [[l, c, h], b];
  });
  controls.push(() => swBtns.forEach(([[l, c, h], b]) => b.setAttribute("aria-pressed", t.l === l && t.c === c && t.h === h)));

  const fontSel = el("select", { id: "tw-font" });
  Object.keys(FONTS).forEach(k => fontSel.append(el("option", { value: k, textContent: k })));
  fontSel.style.cssText = "font:inherit;font-size:.85rem;min-height:40px;border-radius:12px;background:transparent;color:inherit;border:1px solid oklch(100% 0 0 / .16);padding:0 10px";
  fontSel.addEventListener("change", () => { t.font = fontSel.value; sync(); });
  controls.push(() => (fontSel.value = t.font));
  fontSel.querySelectorAll("option").forEach(o => (o.style.color = "#222"));

  const body = el("div", { className: "tw-body" },
    section("Colore",
      seg("theme", "Tema", [["neve", "Chiaro"], ["neve-scura", "Scuro"]]),
      el("div", { className: "tw-row" }, el("span", { className: "tw-label", textContent: "Accento" }), swatches),
      range("h", "Tonalità", 0, 360, 1, "°"), range("c", "Intensità", 0.04, 0.25, 0.005, "", 3), range("l", "Luminosità", 55, 88, 1, "%")),
    section("Card e superfici",
      seg("surface", "Stile", [["neu", "Neumorfico"], ["flat", "Piatto"], ["outline", "Contorno"]]),
      range("rCard", "Raggio card", 0, 40, 1, " px"), range("rInner", "Raggio campi", 0, 32, 1, " px"),
      range("depth", "Rilievo", 0, 16, 1, " px"), range("idepth", "Incavo dei campi", 0, 10, 1, " px")),
    section("Pulsanti",
      seg("btnStyle", "Stile", [["solid", "Pieno"], ["soft", "Soffice"], ["outline", "Contorno"]]),
      seg("btnShape", "Forma", [[999, "Pillola"], [16, "Arrotondato"], [6, "Squadrato"]]),
      range("btnH", "Altezza", 44, 60, 1, " px"), range("btnGlow", "Alone colorato", 0, 80, 1, "%")),
    section("Navigazione", (navRow = seg("navShape", "Barra", [[999, "Pillola"], [24, "Arrotondata"], [8, "Squadrata"]])),
      (navHint = el("p", { className: "tw-hint", hidden: true, textContent: "Su iOS 26 la barra è di sistema e la sua forma non si cambia. Questa scelta vale per Android e iOS precedenti." }))),
    section("Tipografia",
      el("div", { className: "tw-row" }, el("label", { htmlFor: "tw-font", textContent: "Font" }), fontSel),
      range("titleSize", "Titoli", 2, 3.4, 0.05, " rem", 2)),
    section("Densità e movimento",
      seg("density", "Densità", [["compact", "Compatta"], ["normal", "Normale"], ["airy", "Ariosa"]]),
      seg("motion", "Movimento", [["on", "Attivo"], ["off", "Spento"]])),
  );

  const exportBox = el("div", { className: "tw-export" }, el("textarea", { readOnly: true, ariaLabel: "Token esportati" }));
  const foot = el("div", { className: "tw-foot" },
    el("button", { type: "button", textContent: "Ripristina", onclick: () => { t = { ...DEFAULTS }; sync(); } }),
    el("button", { type: "button", textContent: "Copia token", onclick: exportTokens }));
  const panel = el("aside", { className: "tw-panel", id: "tw-panel", ariaLabel: "Ritocchi allo stile" }, body, exportBox, foot);
  const toggle = el("button", { className: "tw-toggle", type: "button", ariaExpanded: "false", ariaControls: "tw-panel" }, "Ritocchi");
  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("open")) toggle.click(); });
  document.body.append(toggle, panel);

  /* ---------- tema e accento fuori dalla tweakbar ---------- */
  document.addEventListener("click", e => {
    const v = e.target.closest("#variants [data-v]"); // pulsanti Chiaro/Scuro della colonna sinistra
    if (v) { t.theme = v.dataset.v; controls.forEach(f => f()); save(); }
    const sw = e.target.closest(".sw");                  // colori d'accento (Impostazioni e onboarding del prototipo)
    if (sw) { const [l, c, h] = sw.dataset.c.split(" ").map(parseFloat); Object.assign(t, { l, c, h }); controls.forEach(f => f()); save(); }
  });

  function sync() {
    apply(); controls.forEach(f => f()); save();
    const themeBtn = document.querySelector(`#variants [data-v="${t.theme}"]`);
    if (themeBtn && root.dataset.theme !== t.theme) themeBtn.click();
  }

  /* ---------- esportazione ---------- */
  function exportTokens() {
    const out = {
      colore: { accento: `oklch(${t.l}% ${t.c} ${t.h})`, tema: t.theme },
      card: { stile: t.surface, raggio: t.rCard, raggioCampi: t.rInner, rilievoPx: t.depth, incavoPx: t.idepth },
      pulsanti: { stile: t.btnStyle, raggio: t.btnShape, altezza: t.btnH, alonePercento: t.btnGlow },
      navigazione: { raggio: t.navShape },
      tipografia: { display: FONTS[t.font][0].split(",")[0].replace(/"/g, ""), corpo: FONTS[t.font][1].split(",")[0].replace(/"/g, ""), titoloRem: t.titleSize },
      densita: t.density, movimento: t.motion,
    };
    const text = JSON.stringify(out, null, 2);
    exportBox.classList.add("open");
    exportBox.querySelector("textarea").value = text;
    navigator.clipboard?.writeText(text).then(() => (foot.lastChild.textContent = "Copiato"), () => {});
    setTimeout(() => (foot.lastChild.textContent = "Copia token"), 1600);
  }

  const platformHint = () => { const ios = root.dataset.platform === "ios"; navHint.hidden = !ios; navRow.classList.toggle("tw-dim", ios); };
  document.addEventListener("platformchange", platformHint);
  platformHint();
  // l'altra anteprima (vista "Affianca") ha cambiato i ritocchi: riallinea senza risalvare
  window.addEventListener("storage", e => {
    if (e.key !== KEY || !e.newValue) return;
    try { t = { ...DEFAULTS, ...JSON.parse(e.newValue) }; } catch { return; }
    apply(); controls.forEach(f => f());
    const b = document.querySelector(`#variants [data-v="${t.theme}"]`);
    if (b && root.dataset.theme !== t.theme) b.click();
  });

  apply();
  controls.forEach(f => f());
  // il tema salvato dalla tweakbar vince su quello di sistema scelto dal prototipo
  const themeBtn = document.querySelector(`#variants [data-v="${t.theme}"]`);
  if (themeBtn) themeBtn.click();
})();
