import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

/**
 * Superfici piatte (direzione "Calma"): niente ombre, la profondità è un solo gradino di tono.
 * `Card`: bianca sul fondo. `tint`: tinta pallida dell'accento, per la card da notare (una per schermata).
 */
export function Card({
  className = '',
  tint,
  children,
  ...rest
}: ViewProps & { className?: string; tint?: boolean; children?: ReactNode }) {
  return (
    <View {...rest} className={`rounded-card p-5 ${tint ? 'bg-tint' : 'bg-card'} ${className}`}>
      {children}
    </View>
  );
}

/** Blocco del colore del fondo dentro una card (valori, campi, segmenti). */
export function Well({ className = '', children, ...rest }: ViewProps & { className?: string; children?: ReactNode }) {
  return (
    <View {...rest} className={`rounded-inner bg-bg ${className}`}>
      {children}
    </View>
  );
}
