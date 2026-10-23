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

/** Barra composta: segmenti proporzionali (es. kcal di proteine, carboidrati, grassi di un pasto). */
export function StackBar({ parts }: { parts: { value: number; color: string }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  if (!total) return null;
  return (
    <View className="h-2 flex-row gap-[3px]" aria-hidden>
      {parts
        .filter((p) => p.value > 0)
        .map((p, i) => (
          <View key={i} className="min-w-1.5 rounded-full" style={{ flex: p.value / total, backgroundColor: p.color }} />
        ))}
    </View>
  );
}
