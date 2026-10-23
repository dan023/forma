import { Text as RNText, type TextProps } from 'react-native';

type Variant = 'title' | 'titleSm' | 'h2' | 'body' | 'label' | 'num';

// Un solo carattere (Figtree): la gerarchia la fanno dimensione e peso. Titoli fino a 28 px, cifre fino a 40 px.
const variants: Record<Variant, string> = {
  title: 'font-sans-bold text-[28px] leading-[32px] tracking-[-0.6px]',
  /** Titolo più piccolo, per nomi lunghi (es. alimenti). */
  titleSm: 'font-sans-bold text-2xl leading-[28px] tracking-[-0.5px]',
  h2: 'font-sans-bold text-[19px] leading-6 tracking-[-0.2px]',
  body: 'font-sans text-base leading-[22px]',
  /** Etichetta piccola sopra un valore: grigia, in tondo, mai maiuscolo. */
  label: 'font-sans-medium text-[13px] leading-[18px]',
  num: 'font-sans-bold tracking-[-0.6px] tabular-nums',
};

export function Text({
  variant = 'body',
  muted,
  accent,
  inverse,
  className = '',
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean; accent?: boolean; /** Testo sopra il colore primario (es. avviso). */ inverse?: boolean; className?: string }) {
  // Con NativeWind la classe della variante vince su quella passata: un font o un colore in `className`
  // sostituisce quello della variante, invece di sommarsi.
  const ownFont = /(^|\s)font-sans/.test(className);
  const ownColor = /(^|\s)text-(ink|ink-2|on-primary|primary|accent|accent-ink|white)(\s|$)/.test(className);
  const color = ownColor ? '' : inverse ? 'text-on-primary' : accent ? 'text-accent-ink' : muted || variant === 'label' ? 'text-ink-2' : 'text-ink';
  const base = ownFont ? variants[variant].replace(/font-sans\S*/, '') : variants[variant];
  return <RNText {...rest} className={`${color} ${base} ${className}`} />;
}
