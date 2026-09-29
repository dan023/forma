import { real, sqliteTable } from 'drizzle-orm/sqlite-core';

import { createdAt, day, id } from './common';

export const bodyWeight = sqliteTable('body_weight', {
  id: id(),
  date: day('date'),
  kg: real('kg').notNull(),
  createdAt: createdAt(),
});
