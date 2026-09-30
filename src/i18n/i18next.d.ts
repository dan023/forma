import 'i18next';

import type { Translation } from './locales/it';

// Chiavi di traduzione tipizzate: `t('tabs.today')` è controllato dal compilatore.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: Translation };
  }
}
