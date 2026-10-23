---
name: nuova-schermata
description: Crea una schermata nuova di Forma (route Expo Router, chiavi i18n it/en, logica in src/features, test). Si lancia con /nuova-schermata <nome> <descrizione>.
disable-model-invocation: true
argument-hint: <nome> <cosa mostra>
---

# /nuova-schermata

Argomenti: `$ARGUMENTS` (nome della schermata e cosa deve mostrare). Se manca uno dei due, chiedi.

## Prima di scrivere
1. Branch: se sei su `main` o `dev`, crea `feature/<nome>` da `dev` (`git switch dev && git switch -c feature/<nome>`). Non fare commit.
2. Leggi `design.md` e la skill `forma-convenzioni`: l'aspetto (token, rilievo, vetro, tema chiaro/scuro) viene da lì, **non** dalla memoria e non da questo file.
3. Guarda una schermata vicina già fatta (`src/app/(tabs)/pasti.tsx`, `src/app/alimento/[id].tsx`) e riusa i suoi componenti: `Screen`, `Card`, `Well`, `Text`, `Button`, `Chip`, `IconButton`, `Icon`, `Donut`, `Progress` in `src/components/ui/`. Prima di creare un componente nuovo controlla che non esista.
4. Per le API di Expo Router / Expo SDK **58** controlla la documentazione (Expo MCP o context7), non la memoria.

## Cosa creare
- **Route** in `src/app/`. Tab: `src/app/(tabs)/<nome>.tsx` (e voce in `(tabs)/_layout.tsx` **e** in `GlassTabs`/`PillTabBar` solo se è una tab nuova). Schermata dentro una tab: cartella o file a parte, con `<Screen back ...>`.
- **Logica** (query, calcoli, scritture) in `src/features/<area>/`, senza React e con il tipo `Db` di `src/db/types.ts`, così si testa con `bun:sqlite`. La schermata si limita a chiamarla (`useLiveQuery` per i dati che cambiano).
- **Stringhe**: tutte in `src/i18n/locales/it.ts` e le stesse chiavi in `en.ts`, raggruppate sotto un'unica chiave (es. `meals: {...}`). Plurali con `_one` / `_other`. Date e numeri con `i18n.language` e `formatNumber`.
- **Accessibilità**: `accessibilityRole` e etichetta su ogni controllo, bersagli ≥ 44 px, stato non solo con il colore.
- **Hermes**: niente `crypto.randomUUID`, `structuredClone`, `node:*` in `src/`.

## Test
Se c'è logica nuova in `src/features/`, aggiungi un test in `scripts/tests/<nome>.test.ts` (stile di `pasti.test.ts`: `:memory:` + `migrate` su `drizzle/`). **Aggiungi il file allo script `test` in `package.json`**: elenca i file uno per uno, un test non registrato non gira.

## Alla fine
Lancia `/verifica`, poi il subagent `rn-runtime-reviewer` sui file nuovi. Mostra un riepilogo delle modifiche (file creati, chiavi i18n aggiunte, cosa non è stato verificato su dispositivo) e **aspetta l'ok di Daniele prima di qualsiasi commit**.
