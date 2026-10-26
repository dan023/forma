import { Pressable, View } from 'react-native';

import { useTheme, type Theme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

/**
 * Varianti, sul modello di shadcn/ui:
 * - `primary`: pillola quasi nera (bianca nel tema scuro), una per schermata.
 * - `secondary`: grigia, per l'azione di fianco alla principale.
 * - `accent`: tinta dell'accento (l'accento pieno resta sui piccoli segni).
 * - `outline`: solo bordo. `ghost`: nessuno sfondo. `link`: testo sottolineato.
 * - `danger`, `warning`, `success`: colori di stato; con `soft` diventano tinta + testo colorato.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link' | 'danger' | 'warning' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Look = { box: string; text: string; icon: (t: Theme) => string };

const SOLID = (bg: string, text: string, icon: (t: Theme) => string): Look => ({ box: bg, text, icon });

const LOOKS: Record<ButtonVariant, Look> = {
  primary: SOLID('bg-primary', 'text-on-primary', (t) => t.onPrimary),
  secondary: SOLID('bg-control', 'text-ink', (t) => t.ink),
  accent: SOLID('bg-tint-strong', 'text-accent-ink', (t) => t.accentInk),
  outline: SOLID('border border-control', 'text-ink', (t) => t.ink),
  ghost: SOLID('', 'text-ink', (t) => t.ink),
  link: SOLID('', 'text-accent-ink underline', (t) => t.accentInk),
  danger: SOLID('bg-danger', 'text-white', () => '#FFFFFF'),
  warning: SOLID('bg-warning', 'text-warning-on', (t) => t.status.onWarning),
  success: SOLID('bg-success', 'text-white', () => '#FFFFFF'),
};

const SOFT: Partial<Record<ButtonVariant, Look>> = {
  danger: SOLID('bg-danger-tint', 'text-danger-ink', (t) => t.status.danger.ink),
  warning: SOLID('bg-warning-tint', 'text-warning-ink', (t) => t.status.warning.ink),
  success: SOLID('bg-success-tint', 'text-success-ink', (t) => t.status.success.ink),
};

// Tutte le altezze sono bersagli ≥ 44 px. `lg` è l'azione principale in fondo alla schermata.
const SIZES: Record<ButtonSize, { box: string; text: string; icon: number }> = {
  sm: { box: 'min-h-11 px-4 gap-1.5', text: 'text-sm', icon: 18 },
  md: { box: 'min-h-12 px-5 gap-2', text: 'text-[15px]', icon: 20 },
  lg: { box: 'min-h-14 px-6 gap-2', text: 'text-base', icon: 22 },
};

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Per `danger`, `warning` e `success`: tinta pallida con testo colorato invece del colore pieno. */
  soft?: boolean;
  /** Icona prima del testo. */
  icon?: IconName;
  disabled?: boolean;
  /** Etichetta per i lettori di schermo, se il testo visibile non basta (es. "−15 s"). */
  accessibilityLabel?: string;
  className?: string;
};

export function Button({ label, onPress, variant = 'primary', size = 'lg', soft, icon, disabled, accessibilityLabel, className = '' }: Props) {
  const t = useTheme();
  const look = (soft && SOFT[variant]) || LOOKS[variant];
  const s = SIZES[size];
  const link = variant === 'link';
  return (
    <Pressable
      accessibilityRole={link ? 'link' : 'button'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center justify-center active:opacity-80 ${link ? 'min-h-11 self-center' : `rounded-full ${s.box}`} ${look.box} ${disabled ? 'opacity-50' : ''} ${className}`}>
      {icon && !link ? (
        <View aria-hidden>
          <Icon name={icon} color={look.icon(t)} size={s.icon} />
        </View>
      ) : null}
      <Text className={`font-sans-semibold ${s.text} ${look.text}`}>{label}</Text>
    </Pressable>
  );
}
