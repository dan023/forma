# Forma

App mobile open per tracciare allenamenti e alimentazione in un'unica app. Owner: Daniele (GitHub `dan023`), scrive in italiano: rispondi in italiano.

## Workflow Git
- `main`: solo codice stabile. `dev`: integrazione, parte da `main`.
- Ogni funzionalità o modifica va su una branch dedicata creata da `dev`: `feature/<nome>` (nuove funzioni), `fix/<nome>` (bug), `chore/<nome>` (config, dipendenze, docs). Mai lavorare direttamente su `main` o `dev`.
- **Mai fare commit senza l'approvazione esplicita di Daniele**: si preparano le modifiche nella working tree, si mostra un riepilogo e si aspetta il via libera.
- Prima di iniziare una modifica: `git switch dev && git switch -c feature/<nome>`. Commit piccoli e descrittivi (`feat:`, `fix:`, `chore:`).
- Finita la modifica: merge della branch in `dev`; `dev` confluisce in `main` solo quando stabile. Non fare merge né push senza che Daniele lo chieda.

## Strumenti per Claude Code (`.claude/`, `.mcp.json`)
- **Permessi** (`.claude/settings.json`): `git commit`, `merge`, `push`, `rebase` e `reset --hard` chiedono sempre conferma. La regola "niente commit senza approvazione" è così imposta dall'harness, non solo scritta qui.
- **Hook** (`.claude/hooks/block-generated-files.sh`): blocca le modifiche a mano ai file generati (`drizzle/`, `assets/data/foods*.json`, `scripts/catalog/translations-it.json`, `.expo/types`) e dice quale comando usare.
- **Skill**: `/verifica` (tipi, lint, `check:runtime`, test, bundle iOS e Android, da lanciare a fine lavoro) e `forma-convenzioni` (le regole di codice e design, caricata da Claude quando serve).
- **Subagent**: `rn-runtime-reviewer` cerca ciò che funziona nei test (Bun/Node) ma non sul telefono (Hermes). Va lanciato sui file modificati prima di un commit.
- **MCP** (`.mcp.json`, da approvare al primo avvio): `playwright` per aprire e fare screenshot del prototipo `design/` (serve `npx playwright install chromium`), `context7` per la documentazione delle librerie. In più il plugin Expo (da autenticare con `/mcp`).
- **Emulatore Android** (`bun run emulator start|stop|status|shot`): AVD `forma_pixel` (Pixel 7, Android 15) senza finestra, per far girare l'app (`bunx expo start --go --android`) e fare screenshot con `shot`. Usa `-gpu swangle_indirect`: con le altre modalità qemu va in crash su questo computer. Per iOS non c'è alternativa locale (niente Mac).
- `bun run check:runtime` cerca in `src/` API assenti in Hermes (`crypto.randomUUID`, `structuredClone`, `node:*`…). Un file usato sia dall'app sia dai test ha due versioni: `x.ts` e `x.native.ts`.

## Obiettivo
Unire le funzionalità di openGym (github.com/arvids-unavailable/openGym) con un tracker alimentare stile FatSecret (pasti, macro), con catalogo alimenti esteso quanto il catalogo esercizi di openGym. Tutto molto personalizzabile e open.

## Decisioni già prese
- Nome: **Forma** (icona da definire più avanti).
- Riscrittura da zero (NO fork di openGym), Expo SDK **58** (React Native 0.88, React 19.3) + TypeScript.
- Licenza: **AGPL v3** con la stessa eccezione per gli store di openGym. Il codice di openGym è AGPL: reimplementare la logica in TS, non copiare.
- Repo: `dan023/forma`.
- MVP **solo locale** sul telefono, export/import dati in JSON, nessun backend.
- Prima di costruire la UI si prototipa il design (in corso).

## Stack previsto
Expo Router (tab: Oggi / Allenamento / Pasti / Statistiche / Impostazioni), expo-sqlite + Drizzle ORM, Zustand, NativeWind, expo-notifications, EAS Build.

## Funzionalità
Palestra (da openGym): catalogo esercizi (~1.324, dataset MIT hasaneyldrm/exercises-dataset; i media sono © Gym visual, attribuzione richiesta, verificare prima dello store), regole di progressione (lineare, Greyskull LP, doppia progressione), 1RM, RIR/RPE, superset, esercizi a tempo/corpo libero, heatmap, mappa muscolare, importer Strong/Hevy/FitNotes, multilingua.

Alimentazione: diario per pasto (grammi/porzioni), totali giornalieri, obiettivi kcal/macro (diversi giorni di allenamento/riposo), alimenti e porzioni personalizzati, ricette, pasti configurabili, preferiti, barcode.

Home e statistiche unificate: peso, calorie, volume di allenamento.

## Catalogo alimenti
Script che unisce CIQUAL 2025 (Licence Ouverte) + USDA FDC (CC0, da verificare) in un dataset unico (nomi IT/EN, categoria, macro/micro per 100 g, porzioni tipiche) incluso nell'app. Open Food Facts (ODbL, da verificare) per il barcode online con cache locale. Evitare CREA (licenza poco chiara).

## Design
Direzione **scelta: Neve** (grigio morbido/neumorfico, accento arancione, titoli grandi, nav a pillola), con tema chiaro e **Neve scura**. Glassmorfismo scartato nel contenuto; su **iOS 26 la barra delle tab è nativa con Liquid Glass** (ibrido, vedi `design.md`). Regole e token in `design.md`; prototipo navigabile in `design/index.html` (`cd design && python3 -m http.server 8080`).

## Aggiornamenti di SDK (note dal passaggio 57 → 58)
- Procedura: `bunx expo install expo@^58.0.0`, `bunx expo install --fix`, `rm -rf node_modules && bun install` (dopo un aggiornamento parziale restano moduli duplicati), `bunx expo-doctor@latest`, poi `tsc`, lint, `bun run test`, `bun run check:runtime` e una prova su emulatore (`bun run emulator start`, `bunx expo start --go --android`). Leggere sempre il changelog su expo.dev/changelog e la guida di migrazione di Expo Router.
- **Workaround in `metro.config.js`**: `react-native-css` 3.1.0-rc.0 (NativeWind v5 RC) reindirizza `react-native` a un modulo che perde `AssetRegistry` (novità di RN 0.88). `expo-asset` ed `expo-font` importano quindi il vero `react-native`. Senza, `useFonts` fallisce e l'app resta sulla splash. Da togliere quando `react-native-css` lo risolve.
- `src/app/_layout.tsx` non aspetta più i font all'infinito: se falliscono si prosegue con quelli di sistema.
- La barra personalizzata (`PillTabBar`) usa l'interfaccia di SDK 58: `emitter`, `navigateToTab(route.key)` e `insets` come proprietà (non c'è più `navigation`). Le tab native vengono da `expo-router/native-tabs` (il percorso `unstable-native-tabs` è deprecato).
- I `Pressable` con `style` come funzione perdono lo stile con questa combinazione di versioni: usare `style` statico e `active:` di NativeWind per la pressione (vedi `Button`, `Chip`, `IconButton`).
- Nel componente `Text` la variante di base (`font-sans`) vince su una `className` con `font-display`: per un titolo diverso aggiungere una variante (es. `titleSm`), non una classe.

## i18n
- `i18next` + `react-i18next` + `expo-localization`. Lingue: **it** (base) ed **en**; preferenza `language` (`system` | `it` | `en`) nello store `useSettings`, salvata in DB.
- Nessuna stringa visibile hardcoded: `const { t } = useTranslation()` e chiavi in `src/i18n/locales/it.ts`. `en.ts` deve avere le stesse chiavi (lo impone il tipo `Translation`). Chiavi tipizzate via `src/i18n/i18next.d.ts`.
- Date e numeri con `toLocaleDateString(i18n.language, ...)` / `Intl`, mai formati fissi.
- I nomi degli alimenti seguono la lingua (`nameIt`/`nameEn`); la traduzione italiana è precalcolata nel catalogo (`nameIt`); si migliora aggiungendo voci a `scripts/catalog/glossary-it.json` (flusso in `scripts/catalog/README.md`).

## Prossimi passi
1. ~~Design~~ fatto. ~~LICENSE AGPL + NOTICE, README, scheletro app (token, tab a pillola, 5 schermate segnaposto)~~ fatto.
2. ~~Schema DB (expo-sqlite + Drizzle), persistenza impostazioni~~ fatto: schema in `src/db/schema/`, client in `src/db/client.ts`, migrazioni in `drizzle/` (dopo ogni modifica allo schema: `bunx drizzle-kit generate`), impostazioni salvate in tabella `settings` da `useSettings`. Da verificare su dispositivo/emulatore.
3. Catalogo alimenti: ~~script di build e nomi italiani~~ fatti (`bun run catalog:build` → `assets/data/foods.json`, 11.512 alimenti; sorgenti con `scripts/catalog/fetch-sources.sh`). Nomi italiani (`nameIt`) precalcolati in build: traduzione automatica offline per segmento + `glossary-it.json` a mano (precedenza), `bun run catalog:review` per trovare cosa correggere; nessuna traduzione a runtime. Seed nel DB al primo avvio fatto (`src/db/seed-foods.ts`, colonna `search_text` per la ricerca). Mancano: Open Food Facts, correzione del nome in-app (override locale), accordo di genere nelle traduzioni. Poi catalogo esercizi.
4. Schermate reali, in ordine: Pasti/diario, Allenamento, Oggi, Statistiche, Impostazioni, onboarding. **Pasti** in corso: diario per giorno e pasto con totali, ricerca (`src/features/foods/search.ts`, specifica in `design.md`), scheda alimento con grammi/porzioni, preferiti e recenti fatti; mancano crea alimento, versioni, ricette, barcode, obiettivi. Componenti base in `src/components/ui/` (Button, Chip, IconButton con vetro su iOS 26, Toast, Screen con indietro). Test: `bun run test`.
5. Styling: **NativeWind v5 RC** (Tailwind v4). Token in `src/global.css` (`@theme`) + valori runtime (tema chiaro/scuro, accento) in `src/constants/theme.ts` via `ThemeProvider`. Ogni nuovo colore va aggiunto anche a `inlineVariables.exclude` in `metro.config.js`. Solo le ombre neumorfiche restano helper JS (`raised`/`inset`). Non rimuovere gli override `lightningcss` 1.30.1 in package.json (senza, la build native fallisce).
