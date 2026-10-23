import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

/**
 * Anello a segmenti: ogni segmento è una frazione (0–1) del giro, nell'ordine dato, con uno stacco di 3 px.
 * Al centro va il valore principale (`children`).
 */
export function Donut({
  segments,
  size = 136,
  stroke = 14,
  children,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const c = size / 2;
  const L = 2 * Math.PI * r;
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 3 : 0;
  // inizio di ogni segmento: la somma dei precedenti
  const arcs = segments.map((s, i) => {
    const v = Math.max(0, Math.min(1, s.value));
    const start = segments.slice(0, i).reduce((a, p) => a + Math.max(0, Math.min(1, p.value)), 0);
    return { v, start, color: s.color };
  });
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={c} cy={c} r={r} fill="none" stroke={t.track} strokeWidth={stroke} />
        {arcs.map(
          ({ v, start, color }, i) =>
            v > 0 && (
              <Circle
                key={i}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={[Math.max(0, L * v - gap), L]}
                strokeDashoffset={-L * start}
                transform={`rotate(-90 ${c} ${c})`}
              />
            ),
        )}
      </Svg>
      {children}
    </View>
  );
}
