import { create } from 'zustand';

/** Recupero predefinito tra le serie, in secondi (diventerà un'impostazione). */
export const DEFAULT_REST = 120;

type RestTimer = {
  /** Istante di fine in millisecondi; null = nessun recupero in corso. */
  endsAt: number | null;
  /** Durata totale del recupero in corso, in secondi (per l'anello). */
  total: number;
  start: (seconds?: number, now?: number) => void;
  /** Aggiunge (o toglie, se negativo) secondi al recupero in corso. */
  add: (seconds: number) => void;
  stop: () => void;
};

/** Timer di recupero: parte quando si segna una serie come fatta e resta attivo cambiando schermata. */
export const useRestTimer = create<RestTimer>((set, get) => ({
  endsAt: null,
  total: DEFAULT_REST,
  start: (seconds = DEFAULT_REST, now = Date.now()) => set({ endsAt: now + seconds * 1000, total: seconds }),
  add: (seconds) => {
    const { endsAt, total } = get();
    if (endsAt == null) return;
    set({ endsAt: endsAt + seconds * 1000, total: Math.max(15, total + seconds) });
  },
  stop: () => set({ endsAt: null }),
}));
