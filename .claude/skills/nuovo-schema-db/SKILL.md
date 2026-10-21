---
name: nuovo-schema-db
description: Aggiunge o modifica una tabella del database di Forma (schema Drizzle, migrazione generata, logica e test). Si lancia con /nuovo-schema-db <tabella> <descrizione>.
disable-model-invocation: true
argument-hint: <tabella> <a cosa serve>
---

# /nuovo-schema-db

Argomenti: `$ARGUMENTS` (tabella e scopo). Se mancano, chiedi.

## Prima di scrivere
1. Branch: se sei su `main` o `dev`, crea `feature/<nome>` da `dev`. Non fare commit.
2. Leggi `src/db/schema/` (file per area: `body`, `nutrition`, `settings`, `training`; helper in `common.ts`) e scegli il file giusto, o uno nuovo da esportare in `schema/index.ts`.
3. Per Drizzle e expo-sqlite controlla la documentazione (context7), non la memoria.

## Regole dello schema
- Chiave primaria `id()` (uuid testuale) e `createdAt()` da `common.ts`; giorni di calendario con `day('nome')` (`YYYY-MM-DD`). Nomi di colonna in `snake_case`, proprietà in `camelCase`.
- Gli id sono testo perché i dati devono poter fare export/import JSON tra dispositivi: niente interi autoincrementali.
- Valori enumerati con una costante `as const` esportata e `text('col', { enum: ... })`, come `FOOD_SOURCES`.
- Indici per ciò che si cerca (giorno, chiave esterna, barcode…), `uniqueIndex` per i vincoli. Commento `/** ... */` che spiega unità di misura e scelte non ovvie.
- Chiavi esterne con `onDelete` scelto in modo esplicito: cosa succede ai dati se si cancella il genitore?

## Migrazione
1. `bunx drizzle-kit generate`. **Mai** modificare a mano `drizzle/` (c'è un hook che lo blocca).
2. Controlla il `.sql` generato: niente `DROP` o ricostruzioni di tabella inattese su dati utente. Se la modifica non è additiva, dillo a Daniele prima di andare avanti, perché le app già installate hanno dati reali.
3. Riesegui `bunx drizzle-kit generate`: deve rispondere "No schema changes".

## Logica e test
- Query e scritture in `src/features/<area>/` o `src/db/`, senza React, con il tipo `Db` di `src/db/types.ts`.
- Se serve un dato iniziale (come `ensureDefaultMealSlots`), una funzione idempotente chiamata all'avvio.
- Test in `scripts/tests/` (stile di `pasti.test.ts`: `:memory:` + `migrate`), **registrato nello script `test` di `package.json`**. Prova anche il caso di database già popolato.
- Se la tabella entra nell'export/import JSON, aggiornalo.

## Alla fine
Lancia `/verifica` (include il controllo "No schema changes"). Riepilogo: tabelle e colonne aggiunte, migrazione generata, cosa non è stato provato su dispositivo (la migrazione su un database esistente in particolare). **Aspetta l'ok di Daniele prima di qualsiasi commit.**
