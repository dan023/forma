import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type Props = {
  label: string;
  onPress: () => void;
  /** `primary`: pillola d'accento, una per schermata. `ghost`: azione secondaria con bordo. */
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  className?: string;
};

export function Button({ label, onPress, variant = 'primary', disabled, className = '' }: Props) {
  const t = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-full px-6 active:scale-[0.97] ${primary ? 'bg-accent' : 'border border-line'} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={primary ? { boxShadow: [{ offsetX: 0, offsetY: 8, blurRadius: 20, color: `${t.accent}73` }] } : undefined}>
      <Text className={`font-sans-bold ${primary ? 'text-accent-ink' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
