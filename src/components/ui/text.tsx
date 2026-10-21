import { Text as RNText, type TextProps } from 'react-native';

type Variant = 'title' | 'titleSm' | 'h2' | 'body' | 'eyebrow' | 'num';

const variants: Record<Variant, string> = {
  title: 'font-display text-[41px] leading-[40px] tracking-[-1.4px]',
  /** Titolo più piccolo, per nomi lunghi (es. alimenti). */
  titleSm: 'font-display text-[32px] leading-[34px] tracking-[-1px]',
  h2: 'font-display-medium text-xl tracking-[-0.4px]',
  body: 'font-sans text-base leading-[22px]',
  eyebrow: 'font-sans-bold text-xs uppercase tracking-[1.2px]',
  num: 'font-display tracking-[-1px] tabular-nums',
};

export function Text({
  variant = 'body',
  muted,
  accent,
  inverse,
  className = '',
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean; accent?: boolean; /** Testo chiaro su sfondo scuro (es. avviso). */ inverse?: boolean; className?: string }) {
  const color = inverse ? 'text-bg' : accent ? 'text-accent' : muted ? 'text-ink-2' : 'text-ink';
  return <RNText {...rest} className={`${color} ${variants[variant]} ${className}`} />;
}
