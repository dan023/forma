# .taste-skill

File di lavoro della skill **design-taste-frontend** per Forma. `direction.json` è lo stile distribuito dalla skill
(`draw.mjs --app --kind analytics --style accent-ladder --keep palette,type`); le cartelle con gli screenshot e i
report dell'ispettore sono rigenerabili e restano fuori da git.

## Stile scelto: `accent-ladder`
Un solo colore d'accento: pieno solo sui piccoli segni (giorno scelto, anelli, spunte), tinte pallide sulle aree
(la card da notare, chip selezionati). Azione principale quasi nera. Scelto perché l'accento è personalizzabile:
la struttura deve reggere con qualsiasi accento. Palette e carattere sono di Forma (`--keep palette,type`).

## Eccezioni volute alle regole della skill
- **Colori dei macro** (proteine blu, carboidrati ambra, grassi verde) accanto all'accento: richiesti da Daniele
  ("dare un po' più di colore") e portano un dato, non decorano.
- **Tessera dell'alimento** (glifo su tinta): l'ispettore la segnala come `icon-chips`. Il colore è il macro che
  porta più kcal, quindi è informazione. Gli altri pulsanti rotondi restano neutri.
- **Barre a pillola tratteggiate** nelle statistiche: il tratteggio è un `repeating-linear-gradient` (la parte
  mancante all'obiettivo), non una sfumatura. Marcato `taste-skill-ignore`.
- **Vetro** solo nella barra delle tab di iOS 26 (chrome di sistema).

## Come verificare il prototipo
```bash
cd design && python3 -m http.server 8093 &
CHROME=$(ls -d ~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome | tail -1)
for s in oggi pasti alimento allenamento statistiche vuoto; do
  CHROME_PATH=$CHROME node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs \
    "http://localhost:8093/?s=$s" --app --widths 390 --out .taste-skill/$s
done
node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs --app design/style.css design/screens.js
```
Risultato atteso: lint senza FAIL; ispettore pulito tranne `icon-chips` su Oggi e Pasti (eccezione sopra).
