import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { Icon } from '@/components/ui/icon';
import type { BodyPart } from '@/db/catalog-exercise';
import { useTheme } from '@/hooks/use-theme';

// Figura a capsule sempre uguale: le parti in tono tenue, la zona allenata piena (una piccola mappa muscolare).
const FIG = {
  head: <Circle key="head" cx="12" cy="3.1" r="1.9" fill="currentColor" stroke="none" />,
  neck: <Path key="neck" d="M12 5.5v1" strokeWidth={2.2} />,
  shoulders: <Path key="shoulders" d="M8 7.9h.01M16 7.9h.01" strokeWidth={2.9} />,
  chest: <Path key="chest" d="M10.4 8.9h.9M12.7 8.9h.9" strokeWidth={2.7} />,
  back: <Path key="back" d="M9.4 7.8h5.2l-1.4 5h-2.4Z" fill="currentColor" strokeWidth={1.2} />,
  abs: <Path key="abs" d="M12 11.2v2.8" strokeWidth={3.3} />,
  upperArms: <Path key="upperArms" d="M7.3 9.6 6.8 12M16.7 9.6l.5 2.4" strokeWidth={2.2} />,
  lowerArms: <Path key="lowerArms" d="M6.6 13.6 6.2 16M17.4 13.6l.4 2.4" strokeWidth={1.9} />,
  hips: <Path key="hips" d="M10.6 15.8h2.8" strokeWidth={2.6} />,
  thighs: <Path key="thighs" d="M10.4 17.2 10.1 19.6M13.6 17.2l.3 2.4" strokeWidth={2.5} />,
  calves: <Path key="calves" d="M10.1 21 10 22.6M13.9 21l.1 1.6" strokeWidth={2} />,
} satisfies Record<string, ReactNode>;
type Part = keyof typeof FIG;
const BASE: Part[] = ['head', 'neck', 'shoulders', 'chest', 'abs', 'upperArms', 'lowerArms', 'hips', 'thighs', 'calves'];

/** Parti evidenziate e inquadratura (il busto per le zone alte, le gambe per quelle basse) di ogni zona. */
const ZONES: Record<Exclude<BodyPart, 'cardio'>, [Part[], string]> = {
  chest: [['chest'], '4 1 16 16'],
  back: [['back'], '4 1 16 16'],
  shoulders: [['shoulders'], '4 1 16 16'],
  upperArms: [['upperArms'], '4 1 16 16'],
  lowerArms: [['lowerArms'], '3.5 4.5 17 17'],
  waist: [['abs'], '4 3 16 16'],
  neck: [['neck'], '4 -1 16 16'],
  upperLegs: [['hips', 'thighs'], '4 8 16 16'],
  lowerLegs: [['calves'], '4 8 16 16'],
};

/** Glifo di una zona del corpo; il cardio è un cuore con il battito, senza zona un manubrio. */
export function ZoneGlyph({ bodyPart, color, size }: { bodyPart: string | null; color: string; size: number }) {
  if (bodyPart === 'cardio') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 19.5s-7.5-4.5-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10Z" />
        <Path d="M7.5 12.5h2.2l1.1-2 1.9 4 1.1-2h2.7" />
      </Svg>
    );
  }
  const zone = bodyPart ? ZONES[bodyPart as keyof typeof ZONES] : undefined;
  if (!zone) return <Icon name="dumbbell" color={color} size={size} />;
  const [on, viewBox] = zone;
  return (
    <Svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color} color={color} strokeLinecap="round" strokeLinejoin="round">
      <G opacity={0.4}>{BASE.filter((p) => !on.includes(p)).map((p) => FIG[p])}</G>
      {on.map((p) => FIG[p])}
    </Svg>
  );
}

const SIZES = { sm: [32, 10, 22], md: [44, 14, 28], lg: [64, 20, 40] } as const;

/**
 * Tessera di un esercizio: la figura con la zona allenata, nella tinta dell'accento (quello della scheda, nelle sue
 * schermate). `onTint` la mette su una card tinta: fondo della card.
 */
export function ExerciseTile({ bodyPart, size = 'md', onTint }: { bodyPart: string | null; size?: keyof typeof SIZES; onTint?: boolean }) {
  const t = useTheme();
  const [box, radius, glyph] = SIZES[size];
  return (
    <View
      aria-hidden
      className="items-center justify-center"
      style={{ width: box, height: box, borderRadius: radius, backgroundColor: onTint ? t.card : t.tint }}>
      <ZoneGlyph bodyPart={bodyPart} color={t.accentInk} size={glyph} />
    </View>
  );
}
