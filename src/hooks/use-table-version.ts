import { addDatabaseChangeListener } from 'expo-sqlite';
import { useEffect, useState } from 'react';

/**
 * Numero che cresce a ogni modifica delle tabelle indicate. `useLiveQuery` si aggiorna solo quando cambia la
 * tabella del `from`: per le query con join si passa questo numero nelle sue dipendenze.
 */
export function useTableVersion(...tables: string[]) {
  const [version, setVersion] = useState(0);
  const key = tables.join(',');
  useEffect(() => {
    const names = new Set(key.split(','));
    const sub = addDatabaseChangeListener(({ tableName }) => {
      if (names.has(tableName)) setVersion((v) => v + 1);
    });
    return () => sub.remove();
  }, [key]);
  return version;
}
