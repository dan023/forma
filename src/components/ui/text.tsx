import { Text as RNText, type TextProps } from 'react-native';

type Variant = 'title' | 'h2' | 'body' | 'eyebrow' | 'num';

const variants: Record<Variant, string> = {
  title: 'font-display text-[41px] leading-[40px] tracking-[-1.4px]',
  h2: 'font-display-medium text-xl tracking-[-0.4px]',
  body: 'font-sans text-base leading-[22px]',
  eyebrow: 'font-sans-bold text-xs uppercase tracking-[1.2px]',
  num: 'font-display tracking-[-1px] tabular-nums',
};

export function Text({
  variant = 'body',
  muted,
  accent,
  className = '',
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean; accent?: boolean; className?: string }) {
  const color = accent ? 'text-accent' : muted ? 'text-ink-2' : 'text-ink';
  return <RNText {...rest} className={`${color} ${variants[variant]} ${className}`} />;
}
