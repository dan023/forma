import type { TFunction } from 'i18next';

import type { MealSlot } from './diary';

/** Nome di un pasto: quello scelto dall'utente, oppure la traduzione del pasto predefinito. */
export const mealName = (slot: Pick<MealSlot, 'name' | 'preset'>, t: TFunction) =>
  slot.name || (slot.preset ? t(`meals.slots.${slot.preset}`) : '');
