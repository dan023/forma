import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/icon-button';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { addDays, fromDayKey, toDayKey } from '@/lib/date';

/** Lunedì della settimana che contiene `day`. */
const monday = (day: string) => addDays(day, -((fromDayKey(day).getDay() + 6) % 7));

/**
 * La settimana del giorno scelto, in una card tinta: mese in alto con le frecce per la settimana prima e dopo,
 * sette giorni come pillole; quello scelto è pieno d'accento, oggi ha un punto sotto.
 */
export function DaySelector({ value, onChange }: { value: string; onChange: (day: string) => void }) {
  const { t, i18n } = useTranslation();
  const start = monday(value);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const today = toDayKey(new Date());
  const month = fromDayKey(value).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
  return (
    <Card tint className="gap-3 px-4 pb-3.5 pt-3">
      <View className="flex-row items-center justify-between">
        <Text className="pl-1 font-sans-bold text-[17px]">{month.charAt(0).toUpperCase() + month.slice(1)}</Text>
        <View className="flex-row gap-1.5">
          <IconButton size={44} icon="back" label={t('meals.prevWeek')} onPress={() => onChange(addDays(value, -7))} />
          <IconButton size={44} icon="forward" label={t('meals.nextWeek')} onPress={() => onChange(addDays(value, 7))} />
        </View>
      </View>
      <View className="flex-row gap-1" accessibilityRole="tablist">
        {days.map((day) => {
          const d = fromDayKey(day);
          const selected = day === value;
          return (
            <Pressable
              key={day}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={d.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
              onPress={() => onChange(day)}
              className={`min-h-[62px] flex-1 items-center justify-center gap-0.5 rounded-full active:opacity-70 ${selected ? 'bg-accent' : 'bg-card'}`}>
              <Text className={`font-sans-medium text-xs ${selected ? 'text-white' : 'text-ink-2'}`}>
                {d.toLocaleDateString(i18n.language, { weekday: 'short' }).replace('.', '')}
              </Text>
              <Text variant="num" className={`text-[17px] ${selected ? 'text-white' : ''}`}>
                {d.getDate()}
              </Text>
              <View className={`h-1 w-1 rounded-full ${day === today ? (selected ? 'bg-white' : 'bg-accent') : ''}`} />
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
