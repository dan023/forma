import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import type { ToastAction } from '@/components/ui/toast';

/**
 * Stato di un avviso (`Toast`): `show` lo mostra per 1,8 s, o per 4 s se ha un'azione (c'è il tempo di toccarla).
 * Un nuovo avviso sostituisce quello di prima. Lasciando la schermata l'avviso sparisce: resterebbe attivo sotto
 * la schermata nuova (e con lui il controllo della tastiera, che su Android lascia una fascia bianca in basso).
 */
export function useToast() {
  const [toast, setToast] = useState<{ message: string; action?: ToastAction; at: number } | null>(null);
  useEffect(() => {
    if (!toast) return;
    // Con un lettore di schermo un avviso con azione resta di più: c'è da trovare il pulsante.
    let h: ReturnType<typeof setTimeout> | undefined;
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .catch(() => false)
      .then((reader) => {
        if (alive) h = setTimeout(() => setToast(null), toast.action ? (reader ? 10000 : 4000) : 1800);
      });
    return () => {
      alive = false;
      if (h) clearTimeout(h);
    };
  }, [toast]);
  useFocusEffect(useCallback(() => () => setToast(null), []));
  return {
    message: toast?.message ?? null,
    action: toast?.action,
    show: (message: string, action?: ToastAction) => setToast({ message, action, at: Date.now() }),
    hide: () => setToast(null),
  };
}
