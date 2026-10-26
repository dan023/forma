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
- **Hook** (`.claude/hooks/block-generated-files.sh`): blocca le modifiche a mano ai file generati (`drizzle/`, `assets/data/foods*.json`, `scripts/catalog/translations-it.json`, `.expo/types`) e dice quale comando usare. Dopo ogni modifica (`PostToolUse`): `check-hardcoded-strings.sh` segnala le stringhe visibili scritte a mano nei `.tsx` di `src/` (euristica su una riga, può dare falsi positivi), `remind-drizzle-generate.sh` ricorda `bunx drizzle-kit generate` quando si tocca `src/db/schema/`.
- **Skill**: `/verifica` (tipi, lint, `check:runtime`, test, bundle iOS e Android, da lanciare a fine lavoro), `/nuova-schermata` e `/nuovo-schema-db` (flussi guidati per una schermata o una tabella nuova, con test e riepilogo) e `forma-convenzioni` (le regole di codice e design, caricata da Claude quando serve).
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
Direzione **scelta: Calma** (ottobre 2026, sostituisce Neve): la tipografia guida (solo Figtree), superfici piatte (card bianche su grigio caldo, niente ombre), accento corallo usato a scala (pieno sui piccoli segni, tinte sulle aree), pulsante principale e barra delle tab quasi neri, colori fissi per i macro (proteine blu, carboidrati ambra, grassi verde) in anelli, barre e tessere degli alimenti. Le schede di allenamento hanno icona e colore scelti dall'utente, che nelle loro schermate fa da accento. Tema chiaro e scuro; accenti scelti lontani dai colori dei macro. Su **iOS 26 la barra delle tab è nativa con Liquid Glass** (ibrido, vedi `design.md`). Regole e token in `design.md`; prototipo in `design/index.html` (`cd design && python3 -m http.server 8080`, `?s=pasti` per una schermata sola); contesto per le skill di design in `.impeccable.md` e `.taste-skill/README.md`.

## Aggiornamenti di SDK (note dal passaggio 57 → 58)
- Procedura: `bunx expo install expo@^58.0.0`, `bunx expo install --fix`, `rm -rf node_modules && bun install` (dopo un aggiornamento parziale restano moduli duplicati), `bunx expo-doctor@latest`, poi `tsc`, lint, `bun run test`, `bun run check:runtime` e una prova su emulatore (`bun run emulator start`, `bunx expo start --go --android`). Leggere sempre il changelog su expo.dev/changelog e la guida di migrazione di Expo Router.
- **Workaround in `metro.config.js`**: `react-native-css` 3.1.0-rc.0 (NativeWind v5 RC) reindirizza `react-native` a un modulo che perde `AssetRegistry` (novità di RN 0.88). `expo-asset` ed `expo-font` importano quindi il vero `react-native`. Senza, `useFonts` fallisce e l'app resta sulla splash. Da togliere quando `react-native-css` lo risolve.
- La barra personalizzata (`PillTabBar`) usa l'interfaccia di SDK 58: `emitter`, `navigateToTab(route.key)` e `insets` come proprietà (non c'è più `navigation`). Le tab native vengono da `expo-router/native-tabs` (il percorso `unstable-native-tabs` è deprecato).
- I `Pressable` con `style` come funzione perdono lo stile con questa combinazione di versioni: usare `style` statico e `active:` di NativeWind per la pressione (vedi `Button`, `Chip`, `IconButton`, `DaySelector`).
- Nel componente `Text` la classe della variante vincerebbe su quella passata in `className`: per questo `Text` toglie font e colore della variante quando `className` ne indica uno suo (`font-sans-*`, `text-ink`, `text-accent-ink`…).

## i18n
- `i18next` + `react-i18next` + `expo-localization`. Lingue: **it** (base) ed **en**; preferenza `language` (`system` | `it` | `en`) nello store `useSettings`, salvata in DB.
- Nessuna stringa visibile hardcoded: `const { t } = useTranslation()` e chiavi in `src/i18n/locales/it.ts`. `en.ts` deve avere le stesse chiavi (lo impone il tipo `Translation`). Chiavi tipizzate via `src/i18n/i18next.d.ts`.
- Date e numeri con `toLocaleDateString(i18n.language, ...)` / `Intl`, mai formati fissi.
- I nomi degli alimenti seguono la lingua (`nameIt`/`nameEn`); la traduzione italiana è precalcolata nel catalogo (`nameIt`); si migliora aggiungendo voci a `scripts/catalog/glossary-it.json` (flusso in `scripts/catalog/README.md`).

## Prossimi passi
1. ~~Design~~ fatto. ~~LICENSE AGPL + NOTICE, README, scheletro app (token, tab a pillola, 5 schermate segnaposto)~~ fatto.
2. ~~Schema DB (expo-sqlite + Drizzle), persistenza impostazioni~~ fatto: schema in `src/db/schema/`, client in `src/db/client.ts`, migrazioni in `drizzle/` (dopo ogni modifica allo schema: `bunx drizzle-kit generate`), impostazioni salvate in tabella `settings` da `useSettings`. Da verificare su dispositivo/emulatore.
3. Catalogo alimenti: ~~script di build e nomi italiani~~ fatti (`bun run catalog:build` → `assets/data/foods.json`, 11.512 alimenti; sorgenti con `scripts/catalog/fetch-sources.sh`). Nomi italiani (`nameIt`) precalcolati in build: traduzione automatica offline per segmento + `glossary-it.json` a mano (precedenza), `bun run catalog:review` per trovare cosa correggere; nessuna traduzione a runtime. Seed nel DB al primo avvio fatto (`src/db/seed-foods.ts`, colonna `search_text` per la ricerca). Mancano: Open Food Facts, correzione del nome in-app (override locale), accordo di genere nelle traduzioni.
   Catalogo esercizi fatto: `bun run catalog:exercises` → `assets/data/exercises.json` (1.324 esercizi, dati MIT; media © Gym visual **non** inclusi, servirebbe il loro permesso). Nomi in inglese per scelta (in palestra si usano così); la ricerca capisce l'italiano con `scripts/catalog/exercise-aliases-it.json` e le etichette tradotte di muscoli/attrezzi/zone. Seed in `src/db/seed-exercises.ts`, flusso in `scripts/catalog/README.md`.
4. Schermate reali, in ordine: Pasti/diario, Allenamento, Oggi, Statistiche, Impostazioni, onboarding. **Pasti** in corso: diario per giorno e pasto con totali, ricerca (`src/features/foods/search.ts`, specifica in `design.md`), scheda alimento con grammi/porzioni, preferiti e recenti fatti; poi icone dei pasti e "Modifica pasti" (`meal_slots.icon`, `src/features/diary/meal-slots.ts`, `src/app/pasti/modifica.tsx`), filtro per gruppo (`foods.food_group` calcolato all'import, `SEED_REVISION` 3), quantità rapida (`src/features/foods/portions.ts`), "Di solito", cestino per togliere con "Annulla" (`useToast`; anche togliere un esercizio da una scheda si annulla); mancano crea alimento, versioni, ricette, barcode, obiettivi. Componenti base in `src/components/ui/` (Card, Well, Text, Screen, Button, Chip, IconButton con vetro su iOS 26, Icon in SVG, Donut, Progress/StackBar, Toast); tessera dell'alimento e logica dei macro in `src/features/foods/` (`food-tile.tsx`, `macros.ts`). **Allenamento** (prima versione, allenamento libero) fatto: tab con allenamento in corso e storico, sessione (`src/app/allenamento/sessione.tsx`: serie kg × rip con i valori dell'ultima volta come suggerimento, spunta, recupero da 2 min fisso in basso), catalogo con ricerca e zone, scheda esercizio (muscoli, ultime volte, 1RM stimato, istruzioni it/en), riepilogo con record personali. Logica in `src/features/training/` (testata in `scripts/tests/allenamento.test.ts`), timer in `src/stores/rest-timer.ts`. **Schede** fatte: tabelle `routines`, `routine_exercises`, `routine_days` (settimana tipo, una scheda per giorno), logica in `src/features/training/routines.ts`, editor in `src/app/allenamento/scheda/[id].tsx`, scelta del giorno in `src/app/allenamento/giorno/[d].tsx`; il catalogo filtra per zona e attrezzo con elenco virtualizzato (`ListScreen`). Le schermate aperte sopra le tab sono elencate in `PUSHED_SCREENS` (`src/app/_layout.tsx`): con gli stessi parametri ce n'è al più una (`src/lib/screen-id.ts`), così un tocco ripetuto non le apre due volte; **una schermata nuova va aggiunta lì**. `useLiveQuery` si aggiorna solo per la tabella del `from`: per le join usare `useTableVersion` (`src/hooks/use-table-version.ts`) nelle dipendenze. **Ripetizioni previste** (fisse, intervallo o secondi) e **superserie** nelle schede: logica pura in `src/features/training/supersets.ts` (blocchi contigui, recupero solo a fine giro), obiettivo copiato in `workout_exercises.target_*` all'inizio. **Personalità**: ogni scheda ha icona e colore (`routines.icon`/`color`); il suo colore fa da accento nelle sue schermate con `AccentScope`; esercizi con tessera della zona del corpo (`exercise-tile.tsx`); durata stimata in `estimate.ts` (regole in `design.md`). Mancano: regole di progressione, superserie nell'allenamento libero, RIR/RPE, notifica di fine recupero, impostazione del recupero, esercizi personalizzati. Oggi e Statistiche sono ancora segnaposto: il loro aspetto è nel prototipo. Test: `bun run test`.
5. Styling: **NativeWind v5 RC** (Tailwind v4). Token in `src/global.css` (`@theme`) + valori runtime (tema chiaro/scuro, accento) in `src/constants/theme.ts` via `ThemeProvider`. Ogni nuovo colore va aggiunto anche a `inlineVariables.exclude` in `metro.config.js`. Colori calcolati (tinte dell'accento, macro per gli SVG) da `useTheme()`. Non rimuovere gli override `lightningcss` 1.30.1 in package.json (senza, la build native fallisce).
