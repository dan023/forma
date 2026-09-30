/** Lingua di base: le altre lingue devono avere le stesse chiavi (vedi `en.ts`). */
export const it = {
  common: {
    soon: 'Presto',
  },
  tabs: {
    today: 'Oggi',
    training: 'Allena',
    meals: 'Pasti',
    stats: 'Stats',
    more: 'Altro',
  },
  today: {
    greeting: 'Ciao, {{name}}',
    soon: 'Anello calorie, macro, allenamento del giorno.',
  },
  training: {
    eyebrow: 'Palestra',
    title: 'Allenamento',
    soon: 'Sessione, serie, timer di recupero.',
  },
  meals: {
    eyebrow: 'Diario alimentare',
    title: 'I tuoi pasti',
    soon: 'Diario per pasto, ricerca alimenti, barcode.',
  },
  stats: {
    eyebrow: 'Ultimi 90 giorni',
    title: 'Statistiche',
    soon: 'Peso, calorie, volume.',
  },
  settings: {
    eyebrow: 'Tutto tuo',
    title: 'Impostazioni',
    soon: 'Tema, accento, obiettivi, export.',
    language: {
      title: 'Lingua',
      system: 'Sistema',
    },
  },
};

export type Translation = typeof it;
