---
name: forma-convenzioni
description: Convenzioni di codice e di design di Forma da rispettare quando si scrive o modifica codice dell'app (stringhe, i18n, colori, direzione Calma e Liquid Glass, API di runtime, bun). Da usare per componenti, schermate, schema DB e script.
user-invocable: false
---

# Convenzioni di Forma

La fonte di verità sono `CLAUDE.md` e `design.md`; qui l'elenco da controllare prima di consegnare.

**Stringhe e lingua**
- Nessuna stringa visibile hardcoded: `useTranslation()`, chiavi in `src/i18n/locales/it.ts` (base) e le stesse in `en.ts`. Plurali con `_one` / `_other`.
- Date e numeri con `toLocaleDateString(i18n.language, ...)` e `formatNumber` (`src/lib/format.ts`). I nomi degli alimenti seguono la lingua (`foodName`).
- Testi dell'interfaccia: italiano chiaro, niente trattini lunghi (usa il trattino normale), niente frasi da marketing.

**Design (Calma)**
- Colori solo da token (`bg-card`, `text-ink`, `bg-tint`, `text-accent-ink`, `bg-primary`…) o da `useTheme()` per SVG e colori calcolati. Un colore nuovo va in `src/global.css`, `src/constants/theme.ts`, `ThemeProvider` **e** `inlineVariables.exclude` in `metro.config.js`.
- Piatto: niente ombre, gradienti o vetro nel contenuto; profondità = card bianca su fondo grigio. Mai card dentro card.
- Accento a scala: pieno solo su piccoli segni (giorno scelto, anello, spunte); tinte (`bg-tint`, `bg-tint-strong`) sulle aree, una card tinta per schermata. `Button` ha le varianti `primary` (quasi nero, una per schermata), `secondary`, `accent`, `outline`, `ghost`, `link`, `danger`, `warning`, `success` (+ `soft`): azioni distruttive sempre `danger`, mai un `primary` colorato a mano. I colori di stato (`danger`, `warning`, `success`) servono solo a pulsanti e avvisi, mai ai dati.
- Macro: sempre proteine, carboidrati, grassi in quest'ordine e con i colori fissi `prot`/`carb`/`fat` (`MACROS` in `src/features/foods/macros.ts`). Un alimento si mostra con `FoodTile`. Niente altre icone su riquadri colorati: i pulsanti rotondi sono neutri.
- Un solo carattere (Figtree) con le varianti di `Text` (`title` 28, `titleSm`, `h2`, `label`, `num`); titoli ≤ 28 px, cifre ≤ 40 px, cifre tabulari. Bersagli ≥ 44 px.
- Il **vetro (Liquid Glass) è solo chrome di sistema su iOS 26** (barra tab, tasto indietro, avvisi, sheet): usa `USE_LIQUID_GLASS` (`src/constants/glass.ts`) e `GlassView`. Mai dentro le card. Guarda ogni schermata nuova su iOS **e** Android (selettori "Piattaforma" e "Tema" in `design/index.html`).
- Ogni controllo ha etichetta accessibile e stato (`accessibilityRole`, `accessibilityState`), mai solo colore o ombra.

**Codice**
- Codice usato sia dall'app sia dai test deve girare in **Hermes**: niente `crypto.randomUUID`, `structuredClone`, `node:*`, `Buffer`. Se serve, due file: `x.ts` (Bun/Node) e `x.native.ts` (telefono). `bun run check:runtime` lo controlla.
- Logica di dati (ricerca, diario, seed) in `src/features/` e `src/db/`, senza React, così si testa con `bun:sqlite` (tipo `Db` in `src/db/types.ts`). Le schermate la chiamano.
- Modifica allo schema = `bunx drizzle-kit generate`. Mai a mano: `drizzle/`, `assets/data/foods*.json`, `translations-it.json`, `.expo/types` (c'è un hook che lo blocca).
- Pacchetti Expo con `bunx expo install`; tutto il resto con `bun add`. Mai `npx`/`npm` per il progetto. Non rimuovere gli override `lightningcss` 1.30.1.
- Prima di usare un'API Expo/React Native: SDK **58**, controlla la documentazione (Expo MCP o docs.expo.dev/versions/v58.0.0), non la memoria.

**Git**
- Una branch per modifica da `dev` (`feature/`, `fix/`, `chore/`). **Mai commit, merge o push senza l'ok esplicito di Daniele.**
