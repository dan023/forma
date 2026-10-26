import { useTranslation } from 'react-i18next';

import type { Exercise } from './exercises';
import type { SetValues } from './workout';
import { formatNumber } from '@/lib/format';

/** Formati comuni delle schermate di allenamento, nella lingua corrente. */
export function useTrainingFormat() {
  const { t, i18n } = useTranslation();
  const n = (v: number, d = 1) => formatNumber(v, i18n.language, d);
  const duration = (minutes: number) =>
    minutes < 60 ? t('training.minutes', { count: minutes }) : t('training.hoursMinutes', { h: Math.floor(minutes / 60), m: minutes % 60 });
  /** Una serie in breve: "70 × 8", "× 12" (corpo libero), "45 s" (a tempo). */
  const setText = (s: SetValues, kind: Exercise['kind']) => {
    if (kind === 'timed') return s.durationSec != null ? `${n(s.durationSec, 0)} s` : '–';
    const reps = s.reps != null ? n(s.reps, 0) : '–';
    return s.weightKg ? `${n(s.weightKg, 2)} × ${reps}` : `× ${reps}`;
  };
  /** Obiettivo di una scheda: "8-12 rip", "5 rip", "45 s"; null se non c'è. */
  const target = (repsMin: number | null, repsMax: number | null, sec: number | null, kind: Exercise['kind']) => {
    if (kind === 'timed') return sec != null ? `${n(sec, 0)} s` : null;
    if (repsMin == null) return null;
    return t('training.repsShort', { reps: repsMax != null ? `${n(repsMin, 0)}-${n(repsMax, 0)}` : n(repsMin, 0) });
  };
  /** Kg di volume: in tonnellate sopra i 10.000. */
  const volume = (kg: number) => (kg >= 10000 ? `${n(kg / 1000, 1)} t` : `${n(kg, 0)} kg`);
  /** Data per esteso con l'iniziale maiuscola (in italiano `toLocaleDateString` la dà minuscola). */
  const day = (ms: number) => {
    const s = new Date(ms).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  /** Nome di un giorno della settimana (0 = lunedì): "L" (`narrow`), "lun" (`short`), "Lunedì" (`long`). */
  const weekday = (i: number, style: 'narrow' | 'short' | 'long' = 'short') => {
    // Il 1° gennaio 2024 era un lunedì.
    const s = new Date(2024, 0, 1 + i).toLocaleDateString(i18n.language, { weekday: style });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  return { n, duration, setText, target, volume, day, weekday };
}
