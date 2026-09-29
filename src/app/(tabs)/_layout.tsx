import { Tabs } from 'expo-router/js-tabs';

import { PillTabBar } from '@/components/pill-tab-bar';

export default function TabsLayout() {
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
