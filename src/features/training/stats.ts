/** Calcoli dell'allenamento, senza DB: 1RM stimato, volume, durata. */

type SetValues = { weightKg: number | null; reps: number | null };

/** 1RM stimato con la formula di Epley; con una ripetizione è il carico stesso. Null senza carico o rip. */
export function e1rm({ weightKg, reps }: SetValues): number | null {
  if (!weightKg || !reps || weightKg <= 0 || reps <= 0) return null;
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30);
}

/** Volume di una serie: kg × rip (0 per corpo libero senza sovraccarico e serie a tempo). */
export const setVolume = ({ weightKg, reps }: SetValues) => (weightKg ?? 0) * (reps ?? 0);

/** Serie migliore di un elenco: quella con il 1RM stimato più alto. */
export function bestSet<T extends SetValues>(list: T[]): T | null {
  let best: T | null = null;
  let top = -1;
  for (const s of list) {
    const v = e1rm(s) ?? -1;
    if (v > top) [best, top] = [s, v];
  }
  return top >= 0 ? best : null;
}

/** Durata in minuti interi tra due istanti in millisecondi. */
export const minutesBetween = (start: number, end: number) => Math.max(0, Math.round((end - start) / 60000));

/** Orologio `m:ss` o `h:mm:ss` per un tempo in secondi (timer di recupero, durata della sessione in corso). */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
