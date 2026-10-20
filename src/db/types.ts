import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type * as schema from './schema';

/**
 * Database sincrono di Forma. Lo sono sia expo-sqlite (app) sia bun:sqlite (test), quindi le funzioni
 * che lo ricevono si possono testare fuori dal telefono.
 */
export type Db = BaseSQLiteDatabase<'sync', unknown, typeof schema>;
