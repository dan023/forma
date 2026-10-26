import { View } from 'react-native';

/**
 * Barra di avanzamento: pieno nel colore (accento o macro), binario nella sua tinta.
 * `color` è un colore del tema già risolto (es. `theme.prot`), perché la tinta si calcola da lì.
 */
export function Progress({ value, max, color, thin, label }: { value: number; max: number; color: string; thin?: boolean; label?: string }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: Math.round(max), now: Math.round(value) }}
      className={`overflow-hidden rounded-full ${thin ? 'h-1.5' : 'h-2.5'}`}
      style={{ backgroundColor: `${color}29` }}>
      <View className="h-full rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
    </View>
  );
}

/**
 * Barra composta: segmenti proporzionali (es. kcal di proteine, carboidrati, grassi di un pasto). `mini`: sottile e
 * corta, sotto il nome di un alimento in un elenco.
 */
export function StackBar({ parts, mini }: { parts: { value: number; color: string }[]; mini?: boolean }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  if (!total) return null;
  return (
    <View className={mini ? 'mt-1.5 h-1 w-[72px] flex-row gap-[2px]' : 'h-2 flex-row gap-[3px]'} aria-hidden>
      {parts
        .filter((p) => p.value > 0)
        .map((p, i) => (
          <View key={i} className={`rounded-full ${mini ? 'min-w-[3px]' : 'min-w-1.5'}`} style={{ flex: p.value / total, backgroundColor: p.color }} />
        ))}
    </View>
  );
}
