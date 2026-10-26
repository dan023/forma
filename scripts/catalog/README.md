# Cataloghi

## Esercizi

Genera `assets/data/exercises.json` dal dataset [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
(dati MIT, licenza in `assets/data/exercises.LICENSE`; i media © Gym visual non si scaricano né si includono).

| Comando | Cosa fa |
|---|---|
| `bash scripts/catalog/fetch-sources.sh` | scarica anche `data/raw/exercises/exercises.json` |
| `bun run catalog:exercises` | normalizza e scrive `assets/data/exercises.json` + `exercises.meta.json` |

- **Nomi:** restano in inglese (in palestra si usano così). La ricerca capisce l'italiano grazie a
  `exercise-aliases-it.json` (parola inglese → sinonimi italiani: `bench` → `panca`) e alle etichette tradotte di
  muscoli, zone e attrezzi, aggiunte al testo di ricerca quando il catalogo entra nel DB (`src/db/seed-exercises.ts`).
- **Muscoli, attrezzi, zone:** il dataset usa sinonimi ("delts", "deltoids", "shoulders"); lo script li porta su chiavi
  fisse (`src/db/catalog-exercise.ts`), tradotte in `training.muscles`, `training.equipment`, `training.bodyParts`. Un
  valore nuovo senza chiave ferma lo script con un errore che dice dove aggiungerlo.
- **Tipo:** cardio, stretching, plank e tenute isometriche sono a tempo; il corpo libero registra le ripetizioni; il resto kg × rip.
- Gli id sono `ex:<id del dataset>`: lo storico degli allenamenti resta valido quando il catalogo si rigenera.

## Alimenti

Genera `assets/data/foods.json` (CIQUAL 2025 + USDA FDC) con nomi italiani precalcolati.

| Comando | Cosa fa |
|---|---|
| `bash scripts/catalog/fetch-sources.sh` | scarica i dati grezzi in `data/raw/` (ignorata da git) |
| `bun run catalog:build` | unisce le fonti e scrive `assets/data/foods.json` |
| `bun run catalog:review` | elenca i segmenti non ancora corretti, dal più frequente |
| `bun run typecheck:scripts` | controllo di tipi degli script |

### Nomi italiani

Il nome inglese è una lista di descrittori (`Beef, loin, raw`) e si traduce **segmento per segmento**.
Precedenza: `glossary-it.json` (a mano) → `translations-it.json` (automatica) → testo originale.

### Correggere una traduzione sbagliata

1. Aggiungi (o cambia) la voce in `glossary-it.json`: `"segmento inglese": "traduzione italiana"`.
   Le chiavi non distinguono maiuscole/minuscole; scrivi la traduzione in minuscolo (la prima lettera del
   nome viene messa maiuscola in automatico). I marchi tutti in maiuscolo (QUAKER) restano invariati.
2. `bun run catalog:build`.
3. Per trovare cosa correggere: `bun run catalog:review [--limit 250] [--offset 0] [--flagged]`.
   Mostra frequenza, traduzione automatica e i sospetti (parola inglese rimasta, ripetizioni, una sola parola…).

Una voce corregge tutti gli alimenti che contengono quel segmento.

### Rigenerare la traduzione automatica (raro)

Serve solo se cambiano le fonti. Richiede `pip install ctranslate2 sentencepiece` e il modello Argos en→it
(<https://argos-net.com/v1/translate-en_it-1_0.argosmodel>, da scompattare):
`ARGOS_MODEL_DIR=/percorso/en_it python3 scripts/catalog/translate-it.py`. Traduce solo i segmenti nuovi.
