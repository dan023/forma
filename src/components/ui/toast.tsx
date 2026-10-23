import { GlassView } from 'expo-glass-effect';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { USE_LIQUID_GLASS } from '@/constants/glass';

import { Text } from './text';

/** Avviso breve in basso. Su iOS 26 è una capsula Liquid Glass, altrove una pillola quasi nera (il colore primario). */
export function Toast({ message }: { message: string | null }) {
  const insets = useSafeAreaInsets();
  // Con la tastiera aperta l'avviso salirebbe sotto di essa: lo si alza dell'altezza della tastiera.
  // L'app è a tutto schermo con barra di stato traslucida: va dichiarato, altrimenti Reanimated scala il layout.
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: -keyboard.height.value }] }));
  if (!message) return null;
  const text = (
    <Text inverse={!USE_LIQUID_GLASS} className="text-center font-sans-bold text-[15px]">{message}</Text>
  );
  return (
    <Animated.View className="absolute left-5 right-5" style={[{ bottom: insets.bottom + 24 }, lift]} pointerEvents="none">
      <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOut.duration(200)} accessibilityLiveRegion="polite" accessibilityRole="alert">
        {USE_LIQUID_GLASS ? (
          <GlassView style={{ borderRadius: 999, paddingVertical: 14, paddingHorizontal: 18 }}>{text}</GlassView>
        ) : (
          <View className="rounded-full bg-primary px-5 py-3.5">{text}</View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
