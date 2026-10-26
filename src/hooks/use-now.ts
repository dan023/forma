import { useEffect, useState } from 'react';

/** L'istante attuale, aggiornato ogni `intervalMs` finché `active` è vero (orologi e timer a schermo). */
export function useNow(active = true, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const h = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(h);
  }, [active, intervalMs]);
  return now;
}
