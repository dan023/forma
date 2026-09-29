# Forma

App mobile open source per tracciare **allenamenti e alimentazione** in un'unica app: diario dei pasti con macro, schede di allenamento con progressione, e statistiche unificate (peso, calorie, volume). Tutto locale sul telefono, dati esportabili in JSON, nessun account.

> Stato: in sviluppo iniziale. Il design è prototipato in [`design/`](design/) e descritto in [`design.md`](design.md).

## Funzionalità previste
- **Palestra:** catalogo di ~1.300 esercizi, regole di progressione (lineare, Greyskull LP, doppia progressione), 1RM, RIR/RPE, superset, mappa muscolare, import da Strong/Hevy/FitNotes.
- **Alimentazione:** diario per pasto, obiettivi kcal/macro diversi tra giorni di allenamento e riposo, alimenti e porzioni personalizzati, ricette, barcode.
- **Personalizzazione:** tema chiaro/scuro, colore d'accento, pasti configurabili.

## Stack
Expo SDK 57 · TypeScript · Expo Router · NativeWind v5 · expo-sqlite + Drizzle ORM (in arrivo) · Zustand · Reanimated.

## Sviluppo
```bash
bun install
bunx expo start        # poi i/a/w per iOS, Android, web
bunx tsc --noEmit      # typecheck
bunx expo lint
```

Anteprima del design (HTML statico):
```bash
cd design && python3 -m http.server 8080
```

## Struttura
```
src/app/(tabs)/     Oggi · Allenamento · Pasti · Statistiche · Impostazioni
src/components/     ui/ (Card, Text, Screen…) e pill-tab-bar
src/constants/      token di design (theme.ts)
src/hooks/  stores/ tema e impostazioni (Zustand)
design/  design.md  prototipo e linee guida
scripts/            (in arrivo) build del catalogo alimenti
```

## Licenza
[AGPL v3](LICENSE) con eccezione per la distribuzione negli app store, vedi [NOTICE.md](NOTICE.md). Dati e media di terze parti hanno licenze proprie, elencate lì.
