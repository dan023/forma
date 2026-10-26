import { GlassView } from 'expo-glass-effect';
import { useEffect } from 'react';
import { AccessibilityInfo, Platform, Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, SlideInDown, SlideOutDown, useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { USE_LIQUID_GLASS } from '@/constants/glass';

import { Text } from './text';

export type ToastAction = { label: string; onPress: () => void };

/**
 * Avviso breve in basso. Su iOS 26 è una capsula Liquid Glass, altrove una pillola quasi nera (il colore primario).
 * `action` aggiunge un pulsante a destra (es. "Annulla"); `bottomOffset` lo alza sopra ciò che c'è in basso (la
 * barra delle tab, un pulsante fisso).
 */
export function Toast({ message, action, bottomOffset = 0 }: { message: string | null; action?: ToastAction; bottomOffset?: number }) {
  // `useAnimatedKeyboard` attivo cambia la gestione degli inset su Android e la barra di sistema diventa una fascia
  // bianca: l'hook vive solo mentre l'avviso è visibile.
  return message ? <ToastBody message={message} action={action} lift={bottomOffset} /> : null;
}

function ToastBody({ message, action, lift: extra }: { message: string; action?: ToastAction; lift: number }) {
  const insets = useSafeAreaInsets();
  // Con la tastiera aperta l'avviso salirebbe sotto di essa: lo si alza dell'altezza della tastiera.
  // L'app è a tutto schermo con barra di stato traslucida: va dichiarato, altrimenti Reanimated scala il layout.
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: -keyboard.height.value }] }));
  // `accessibilityLiveRegion` vale solo su Android: su iOS l'avviso si annuncia a VoiceOver.
  useEffect(() => {
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(action ? `${message}. ${action.label}` : message);
  }, [message, action]);
  const text = (
    <View className="min-h-11 flex-row items-center gap-3">
      <Text inverse={!USE_LIQUID_GLASS} className={`flex-1 font-sans-bold text-[15px] ${action ? '' : 'text-center'}`}>
        {message}
      </Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={8} className="min-h-11 justify-center px-1 active:opacity-60">
          <Text inverse={!USE_LIQUID_GLASS} className="font-sans-bold text-[15px] underline">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
  return (
    <Animated.View className="absolute left-5 right-5" style={[{ bottom: insets.bottom + 24 + extra }, lift]} pointerEvents={action ? 'box-none' : 'none'}>
      <Animated.View
        // Il vetro si disegna male con l'opacità sotto 1: con Liquid Glass l'avviso entra ed esce scorrendo.
        entering={USE_LIQUID_GLASS ? SlideInDown.duration(250) : FadeInDown.duration(250)}
        exiting={USE_LIQUID_GLASS ? SlideOutDown.duration(200) : FadeOut.duration(200)} accessibilityLiveRegion="polite" accessibilityRole="alert">
        {USE_LIQUID_GLASS ? (
          <GlassView style={{ borderRadius: 999, paddingVertical: 4, paddingHorizontal: 18 }}>{text}</GlassView>
        ) : (
          <View className="rounded-full bg-primary px-5 py-1">{text}</View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
