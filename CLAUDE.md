# Forma

App mobile open per tracciare allenamenti e alimentazione in un'unica app. Owner: Daniele (GitHub `dan023`), scrive in italiano: rispondi in italiano.

## Workflow Git
- `main`: solo codice stabile. `dev`: integrazione, parte da `main`.
- Ogni funzionalità o modifica va su una branch dedicata creata da `dev`: `feature/<nome>` (nuove funzioni), `fix/<nome>` (bug), `chore/<nome>` (config, dipendenze, docs). Mai lavorare direttamente su `main` o `dev`.
- **Mai fare commit senza l'approvazione esplicita di Daniele**: si preparano le modifiche nella working tree, si mostra un riepilogo e si aspetta il via libera.
- Prima di iniziare una modifica: `git switch dev && git switch -c feature/<nome>`. Commit piccoli e descrittivi (`feat:`, `fix:`, `chore:`).
- Finita la modifica: merge della branch in `dev`; `dev` confluisce in `main` solo quando stabile. Non fare merge né push senza che Daniele lo chieda.

## Obiettivo
Unire le funzionalità di openGym (github.com/arvids-unavailable/openGym) con un tracker alimentare stile FatSecret (pasti, macro), con catalogo alimenti esteso quanto il catalogo esercizi di openGym. Tutto molto personalizzabile e open.

## Decisioni già prese
- Nome: **Forma** (icona da definire più avanti).
- Riscrittura da zero (NO fork di openGym), Expo SDK più recente (57) + TypeScript.
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
Direzione **scelta: Neve** (grigio morbido/neumorfico, accento arancione, titoli grandi, nav a pillola), con tema chiaro e **Neve scura**. Glassmorfismo scartato. Regole e token in `design.md`; prototipo navigabile in `design/index.html` (`cd design && python3 -m http.server 8080`).

## i18n
- `i18next` + `react-i18next` + `expo-localization`. Lingue: **it** (base) ed **en**; preferenza `language` (`system` | `it` | `en`) nello store `useSettings`, salvata in DB.
- Nessuna stringa visibile hardcoded: `const { t } = useTranslation()` e chiavi in `src/i18n/locales/it.ts`. `en.ts` deve avere le stesse chiavi (lo impone il tipo `Translation`). Chiavi tipizzate via `src/i18n/i18next.d.ts`.
- Date e numeri con `toLocaleDateString(i18n.language, ...)` / `Intl`, mai formati fissi.
- I nomi degli alimenti seguono la lingua (`nameIt`/`nameEn`); traduzione italiana del catalogo ancora da fare.

## Prossimi passi
1. ~~Design~~ fatto. ~~LICENSE AGPL + NOTICE, README, scheletro app (token, tab a pillola, 5 schermate segnaposto)~~ fatto.
2. ~~Schema DB (expo-sqlite + Drizzle), persistenza impostazioni~~ fatto: schema in `src/db/schema/`, client in `src/db/client.ts`, migrazioni in `drizzle/` (dopo ogni modifica allo schema: `bunx drizzle-kit generate`), impostazioni salvate in tabella `settings` da `useSettings`. Da verificare su dispositivo/emulatore.
3. Catalogo alimenti: ~~script di build~~ fatto (`bun run catalog:build` → `assets/data/foods.json`, 11.512 alimenti; sorgenti con `scripts/catalog/fetch-sources.sh`). Mancano: nomi italiani, seed nel DB al primo avvio, Open Food Facts. Poi catalogo esercizi.
4. Schermate reali, in ordine: Pasti/diario, Allenamento, Oggi, Statistiche, Impostazioni, onboarding.
5. Styling: **NativeWind v5 RC** (Tailwind v4). Token in `src/global.css` (`@theme`) + valori runtime (tema chiaro/scuro, accento) in `src/constants/theme.ts` via `ThemeProvider`. Ogni nuovo colore va aggiunto anche a `inlineVariables.exclude` in `metro.config.js`. Solo le ombre neumorfiche restano helper JS (`raised`/`inset`). Non rimuovere gli override `lightningcss` 1.30.1 in package.json (senza, la build native fallisce).
