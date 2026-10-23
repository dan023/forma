import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Icone di Forma: contorno, tratto 1,75, griglia 24 (come nel prototipo `design/screens.js`).
 * Il colore si passa esplicito: le icone SVG non ereditano il colore del testo.
 */
const GLYPHS = {
  home: <Path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" />,
  bowl: (
    <>
      <Path d="M3.5 11.5h17a8.5 8 0 0 1-17 0Z" />
      <Path d="M9 8c0-1.6 1.2-2 1.2-3.6M13.5 8c0-1.6 1.2-2 1.2-3.6" />
    </>
  ),
  dumbbell: <Path d="M6.5 7.5v9M3.5 10v4M17.5 7.5v9M20.5 10v4M6.5 12h11" />,
  chart: <Path d="M5 20v-6M12 20V5M19 20v-9" />,
  sliders: (
    <>
      <Path d="M4 7h9M19 7h1M4 17h3M13 17h7" />
      <Circle cx="16" cy="7" r="2.5" />
      <Circle cx="10" cy="17" r="2.5" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  minus: <Path d="M5 12h14" />,
  check: <Path d="m5 12.5 4.5 4.5L19 7.5" />,
  trash: (
    <>
      <Path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7" />
      <Path d="M10 11v5M14 11v5" />
    </>
  ),
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="m16 16 4.5 4.5" />
    </>
  ),
  back: <Path d="m14.5 5-7 7 7 7" />,
  forward: <Path d="m9.5 5 7 7-7 7" />,
  star: <Path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6Z" />,
  flame: <Path d="M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.4 1.2-3.9 2.4-5 .2 1.6.9 2.6 2 3C11 9 11 6 12 3Z" />,
  // categorie di alimenti
  grain: (
    <>
      <Path d="M12 21V8.5" />
      <Path d="M12 8.5c-2.4 0-4-1.7-4-4 2.4 0 4 1.7 4 4Zm0 0c2.4 0 4-1.7 4-4-2.4 0-4 1.7-4 4Zm0 5.5c-2.4 0-4-1.7-4-4 2.4 0 4 1.7 4 4Zm0 0c2.4 0 4-1.7 4-4-2.4 0-4 1.7-4 4Z" />
    </>
  ),
  milk: (
    <>
      <Path d="M9 3h6M9.5 3v3L7 9.5V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5L14.5 6V3" />
      <Path d="M7 13.5h10" />
    </>
  ),
  fruit: (
    <>
      <Path d="M4.5 7c-.5 7 4.5 13 13.5 11.5 1.3-.2 1.2-1.5 0-1.7C11.5 15.7 8 12 7.6 7" />
      <Path d="M4.5 7 5 4.3M7.6 7 7.4 4.3" />
    </>
  ),
  meat: (
    <>
      <Path d="M4 13.5C4 8.5 8 5 13 5s7 3 7 6.5S17 19 11 19c-4 0-7-2.2-7-5.5Z" />
      <Circle cx="14" cy="11" r="2.2" />
    </>
  ),
  fish: (
    <>
      <Path d="M3 12c3-4.5 7-6 10.5-6S19 9 21 12c-2 3-4 6-7.5 6S6 16.5 3 12Z" />
      <Path d="M3 12 1.5 9M3 12l-1.5 3" />
      <Circle cx="16.5" cy="11" r=".9" />
    </>
  ),
  drop: <Path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />,
  leaf: (
    <>
      <Path d="M5 19C5 11 10 5 20 5c0 10-6 15-14 15" />
      <Path d="m5 19 8-8" />
    </>
  ),
  cup: (
    <>
      <Path d="M5 9h14l-1.5 11h-11Z" />
      <Path d="M4 9h16M9 9V6h6v3" />
    </>
  ),
  nut: (
    <>
      <Path d="M12 3c4 3 6 7 6 11a6 6 0 0 1-12 0c0-4 2-8 6-11Z" />
      <Path d="M12 8.5v7" />
    </>
  ),
  candy: (
    <>
      <Rect x="7" y="8" width="10" height="8" rx="4" />
      <Path d="M7 12 3.5 9v6ZM17 12l3.5-3v6Z" />
    </>
  ),
} as const;

export type IconName = keyof typeof GLYPHS;

export function Icon({ name, color, size = 22, strokeWidth = 1.75 }: { name: IconName; color: string; size?: number; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {GLYPHS[name]}
    </Svg>
  );
}
