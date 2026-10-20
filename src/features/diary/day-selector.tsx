import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { raised } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { addDays, fromDayKey } from '@/lib/date';

/** Cinque giorni con quello scelto al centro: toccarne uno lo seleziona e lo centra. */
export function DaySelector({ value, onChange }: { value: string; onChange: (day: string) => void }) {
  const t = useTheme();
  const { i18n } = useTranslation();
  const days = [-2, -1, 0, 1, 2].map((n) => addDays(value, n));
  return (
    <View className="mb-1.5 flex-row gap-2" accessibilityRole="tablist">
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
            className={`min-h-[62px] flex-1 items-center justify-center rounded-inner ${selected ? 'bg-accent' : 'bg-card'}`}
            style={[
              selected
                ? { boxShadow: [{ offsetX: 0, offsetY: 8, blurRadius: 20, color: `${t.accent}73` }], transform: [{ translateY: -3 }] }
                : raised(t, 6),
            ]}>
            <Text className={`font-sans-bold text-[11px] uppercase tracking-[0.6px] ${selected ? 'text-accent-ink' : 'text-ink-2'}`}>
              {d.toLocaleDateString(i18n.language, { weekday: 'short' }).replace('.', '')}
            </Text>
            <Text variant="num" className={`text-lg ${selected ? 'text-accent-ink' : ''}`}>
              {d.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
