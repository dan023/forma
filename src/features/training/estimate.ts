import { DEFAULT_REST } from '@/stores/rest-timer';

import { supersetBlocks } from './supersets';

export type EstimateItem = {
  sets: number;
  repsMin: number | null;
  repsMax: number | null;
  durationSec: number | null;
  supersetGroup: number | null;
  kind: 'weight' | 'bodyweight' | 'timed';
};

/** Secondi per ripetizione e per preparare una serie (carico, posizione), più il cambio di esercizio. */
const SEC_PER_REP = 3;
const SET_SETUP = 30;
const SUPERSET_SWITCH = 15;
const EXERCISE_SWITCH = 90;

/** Durata di una serie: i secondi previsti, o le ripetizioni previste (la media dell'intervallo; 10 se mancano). */
function setSeconds(it: EstimateItem) {
  if (it.kind === 'timed') return (it.durationSec ?? 30) + SET_SETUP;
  const reps = it.repsMin == null ? 10 : (it.repsMin + (it.repsMax ?? it.repsMin)) / 2;
  return reps * SEC_PER_REP + SET_SETUP;
}

/**
 * Minuti stimati per una scheda, arrotondati a 5 (almeno 5). Ogni giro di serie è seguito dal recupero, tranne
 * l'ultimo; in una superserie il giro è una serie per esercizio, con un breve cambio tra l'uno e l'altro. Tra un
 * blocco e il successivo si conta il cambio di esercizio. Null senza esercizi.
 */
export function estimateMinutes(items: EstimateItem[], restSec = DEFAULT_REST): number | null {
  if (!items.length) return null;
  let total = 0;
  let rounds = 0;
  const blocks = supersetBlocks(items, (it) => it.supersetGroup);
  for (const block of blocks) {
    const max = Math.max(...block.map((it) => it.sets));
    for (let r = 0; r < max; r++) {
      const inRound = block.filter((it) => it.sets > r);
      total += inRound.reduce((a, it) => a + setSeconds(it), 0) + (inRound.length - 1) * SUPERSET_SWITCH;
      rounds++;
    }
  }
  total += (rounds - 1) * restSec + (blocks.length - 1) * EXERCISE_SWITCH;
  return Math.max(5, Math.round(total / 60 / 5) * 5);
}
