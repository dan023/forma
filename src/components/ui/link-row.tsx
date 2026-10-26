import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

/** Riga di un elenco in card che porta altrove: elemento a sinistra, titolo, riga secondaria, valore e freccia. */
export function LinkRow({
  leading,
  title,
  sub,
  value,
  first,
  onPress,
}: {
  leading?: ReactNode;
  title: string;
  sub: string;
  value?: string;
  first?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`min-h-16 flex-row items-center gap-3 py-3 active:opacity-70 ${first ? '' : 'border-t border-line'}`}>
      {leading}
      <View className="flex-1">
        <Text className="font-sans-semibold text-[15px]">{title}</Text>
        <Text variant="label" className="mt-0.5" numberOfLines={1}>
          {sub}
        </Text>
      </View>
      {value ? (
        <Text variant="num" className="text-[15px]">
          {value}
        </Text>
      ) : null}
      <Icon name="forward" color={theme.ink2} size={18} />
    </Pressable>
  );
}

/** Icona su tinta dell'accento (44 px), a sinistra di una `LinkRow` (es. la ricerca di un catalogo). */
export function TintIcon({ name }: { name: IconName }) {
  const theme = useTheme();
  return (
    <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-tint">
      <Icon name={name} color={theme.accentInk} size={22} />
    </View>
  );
}
