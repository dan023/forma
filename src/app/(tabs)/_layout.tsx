import { Tabs } from 'expo-router/js-tabs';

import { GlassTabs } from '@/components/glass-tabs';
import { PillTabBar } from '@/components/pill-tab-bar';
import { USE_LIQUID_GLASS } from '@/constants/glass';

export default function TabsLayout() {
  if (USE_LIQUID_GLASS) return <GlassTabs />;

  return (
    <Tabs tabBar={(props) => <PillTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="allenamento" />
      <Tabs.Screen name="pasti" />
      <Tabs.Screen name="statistiche" />
      <Tabs.Screen name="impostazioni" />
    </Tabs>
  );
}
