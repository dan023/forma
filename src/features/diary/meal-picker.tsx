import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

import type { MealSlot } from './diary';
import { mealIcon } from './meal-slots';
import { mealName } from './meal-name';
import { MealTile } from './meal-tile';

/** Pillola del pasto scelto (tessera, nome, freccia): si tocca per aprire `MealOptions`. */
export function MealPill({ slot, open, onPress }: { slot: MealSlot | undefined; open: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!slot) return null;
  const name = mealName(slot, t);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={t('meals.pickerLabel', { meal: name })}
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 active:opacity-70">
      <MealTile icon={mealIcon(slot)} size="sm" />
      <Text className="font-sans-semibold text-[15px]">{name}</Text>
      <Icon name={open ? 'up' : 'down'} color={theme.ink2} size={18} />
    </Pressable>
  );
}

/** Elenco dei pasti per sceglierne un altro; quello scelto ha la spunta. */
export function MealOptions({ slots, value, onChange }: { slots: MealSlot[]; value: string | undefined; onChange: (id: string) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card className="py-1.5" accessibilityRole="radiogroup">
      {slots.map((s, i) => {
        const on = s.id === value;
        return (
          <Pressable
            key={s.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(s.id)}
            className={`min-h-14 flex-row items-center gap-3 py-2 active:opacity-70 ${i ? 'border-t border-line' : ''}`}>
            <MealTile icon={mealIcon(s)} size="sm" />
            <Text className="flex-1 font-sans-semibold text-[15px]">{mealName(s, t)}</Text>
            {on ? <Icon name="check" color={theme.accentInk} size={20} strokeWidth={2.2} /> : <View className="w-5" />}
          </Pressable>
        );
      })}
    </Card>
  );
}
