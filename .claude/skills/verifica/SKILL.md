---
name: verifica
description: Controllo completo prima di dichiarare finito un lavoro in Forma (tipi, lint, test, API non disponibili sul telefono, bundle iOS e Android). Si lancia con /verifica.
disable-model-invocation: true
---

# /verifica

Esegui in ordine, da `/home/dani/Documents/projects/forma`, e **riporta il risultato di ognuno**. Se uno fallisce, non passare al successivo: mostra l'errore, correggi o chiedi.

1. `bunx tsc --noEmit` (app)
2. `bun run typecheck:scripts`
3. `bunx expo lint`
4. `bun run check:runtime`: cerca in `src/` API che ci sono in Bun/Node ma non in Hermes (es. `crypto.randomUUID`). I test **non** le vedono, per questo esiste.
5. `bun run test`: DB, ricerca, diario (Bun) e prototipo (Node)
6. Bundle di entrambe le piattaforme, in una cartella temporanea:
   `bunx expo export --platform ios --platform android --output-dir <scratchpad>/export` poi eliminala. Cerca righe con `error`.

Se il lavoro tocca lo schema (`src/db/schema/`), verifica che `bunx drizzle-kit generate` risponda "No schema changes".

## Riepilogo finale
Una tabella con i 6 passi e un esito (ok / fallito / saltato, con il perché). Aggiungi cosa **non** è stato verificato: l'app non gira su dispositivo né su emulatore in questo ambiente, quindi l'aspetto reale resta da guardare.

Non fare commit: chiedi prima l'approvazione, come da `CLAUDE.md`.
