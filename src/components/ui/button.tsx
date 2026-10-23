import { Pressable } from 'react-native';

import { Text } from './text';

type Props = {
  label: string;
  onPress: () => void;
  /** `primary`: pillola quasi nera (bianca nel tema scuro), una per schermata. `ghost`: azione secondaria con bordo. */
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  className?: string;
};

export function Button({ label, onPress, variant = 'primary', disabled, className = '' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-14 items-center justify-center rounded-full px-6 active:opacity-80 ${primary ? 'bg-primary' : 'border border-control'} ${disabled ? 'opacity-50' : ''} ${className}`}>
      <Text className={`font-sans-semibold ${primary ? 'text-on-primary' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
