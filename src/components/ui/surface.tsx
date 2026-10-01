import type { ReactNode } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme, type Theme } from '@/hooks/use-theme';

/**
 * Ombre neumorfiche: rialzato = azionabile/contenitore, incassato = campo/valore.
 * Restano helper JS perché le ombre doppie dipendono dal tema (chiaro/scuro).
 */
export function raised(t: Theme, size = 9): ViewStyle {
  return {
    boxShadow: [
      { offsetX: size, offsetY: size, blurRadius: size * 2.2, color: t.shadowDark },
      { offsetX: -size, offsetY: -size, blurRadius: size * 2.2, color: t.shadowLight },
    ],
  };
}

export function inset(t: Theme, size = 2): ViewStyle {
  return {
    boxShadow: [
      { offsetX: size, offsetY: size, blurRadius: size * 2.2, color: t.shadowDark, inset: true },
      { offsetX: -size, offsetY: -size, blurRadius: size * 2.2, color: t.shadowLight, inset: true },
    ],
  };
}

export function Card({
  className = '',
  style,
  children,
  ...rest
}: ViewProps & { className?: string; children?: ReactNode }) {
  const t = useTheme();
  return (
    <View {...rest} className={`bg-card rounded-card p-[18px] ${className}`} style={[raised(t), style]}>
      {children}
    </View>
  );
}

export function Inset({
  className = '',
  style,
  children,
  ...rest
}: ViewProps & { className?: string; children?: ReactNode }) {
  const t = useTheme();
  return (
    <View {...rest} className={`rounded-inner ${className}`} style={[inset(t), style]}>
      {children}
    </View>
  );
}
