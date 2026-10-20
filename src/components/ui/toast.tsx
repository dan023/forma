import { GlassView } from 'expo-glass-effect';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { USE_LIQUID_GLASS } from '@/constants/glass';

import { Text } from './text';

/** Avviso breve in basso. Su iOS 26 è una capsula Liquid Glass, altrove una barra scura. */
export function Toast({ message }: { message: string | null }) {
  const insets = useSafeAreaInsets();
  // Con la tastiera aperta l'avviso salirebbe sotto di essa: lo si alza dell'altezza della tastiera.
  const keyboard = useAnimatedKeyboard();
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: -keyboard.height.value }] }));
  if (!message) return null;
  const text = (
    <Text className={`text-center font-sans-bold text-[15px] ${USE_LIQUID_GLASS ? 'text-ink' : 'text-bg'}`}>{message}</Text>
  );
  return (
    <Animated.View className="absolute left-5 right-5" style={[{ bottom: insets.bottom + 24 }, lift]} pointerEvents="none">
      <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOut.duration(200)} accessibilityLiveRegion="polite" accessibilityRole="alert">
        {USE_LIQUID_GLASS ? (
          <GlassView style={{ borderRadius: 999, paddingVertical: 14, paddingHorizontal: 18 }}>{text}</GlassView>
        ) : (
          <View className="rounded-[14px] bg-ink px-[18px] py-3.5">{text}</View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
