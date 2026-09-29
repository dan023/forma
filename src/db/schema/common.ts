import { integer, text } from 'drizzle-orm/sqlite-core';

/** Chiave primaria testuale (uuid): stabile tra dispositivi, comoda per export/import JSON. */
export const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID());

/** Timestamp in millisecondi. */
export const createdAt = () =>
  integer('created_at', { mode: 'number' })
    .notNull()
    .$defaultFn(() => Date.now());

/** Giorno di calendario locale come `YYYY-MM-DD`. */
export const day = (name: string) => text(name).notNull();
