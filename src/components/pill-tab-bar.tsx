import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { Icon, type IconName } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { mix } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "tabs.today", icon: "home" },
  allenamento: { label: "tabs.training", icon: "dumbbell" },
  pasti: { label: "tabs.meals", icon: "bowl" },
  statistiche: { label: "tabs.stats", icon: "chart" },
  impostazioni: { label: "tabs.more", icon: "sliders" },
};

const layout = LinearTransition.springify().damping(40).stiffness(400);

/**
 * Barra delle tab su Android (e iOS prima del 26): pillola scura flottante; la voce attiva è una pillola
 * chiara con icona ed etichetta, le altre solo icona. Su iOS 26 c'è la barra nativa (GlassTabs).
 */
export function PillTabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const idle = mix(t.onPrimary, t.primary, 0.62);

  return (
    <View
      className="absolute left-4 right-4 h-16 flex-row items-center justify-between rounded-full bg-primary p-2"
      style={{ bottom: insets.bottom + 12 }}
    >
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const tab = TABS[route.name];
        const label = tab ? tr(tab.label as "tabs.today") : route.name;
        return (
          <Animated.View key={route.key} layout={layout}>
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const e = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !e.defaultPrevented) navigateToTab(route.key);
              }}
              className={`h-12 min-w-12 flex-row items-center justify-center gap-2 rounded-full ${focused ? "bg-on-primary pl-3.5 pr-[18px]" : ""}`}
            >
              {tab && <Icon name={tab.icon} color={focused ? t.primary : idle} />}
              {focused && (
                <Text className="font-sans-semibold text-sm text-primary">{label}</Text>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
