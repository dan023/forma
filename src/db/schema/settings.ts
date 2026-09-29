import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Impostazioni chiave/valore; il valore è JSON serializzato. */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
