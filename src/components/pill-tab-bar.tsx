import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';
import { inset } from '@/components/ui/surface';

const LABELS: Record<string, string> = {
  index: 'Oggi',
  allenamento: 'Allena',
  pasti: 'Pasti',
  statistiche: 'Stats',
  impostazioni: 'Altro',
};

/** Nav a pillola: vaschetta incassata + indicatore accento che scorre. */
export function PillTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const pad = 6; // = p-1.5
  const slot = (width - pad * 2) / state.routes.length;

  const blob = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(state.index * slot, { damping: 22, stiffness: 240 }) }],
  }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className="absolute left-4 right-4 flex-row rounded-full bg-card p-1.5"
      style={[{ bottom: insets.bottom + 10 }, inset(t)]}>
      {width > 0 && (
        <Animated.View
          className="absolute bottom-1.5 left-1.5 top-1.5 rounded-full bg-accent"
          style={[
            { width: slot, boxShadow: [{ offsetX: 0, offsetY: 6, blurRadius: 18, color: `${t.accent}80` }] },
            blob,
          ]}
        />
      )}
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            className="min-h-[52px] flex-1 items-center justify-center">
            <Text className={`font-sans-bold text-[13px] ${focused ? 'text-accent-ink' : 'text-ink-2'}`}>
              {LABELS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
