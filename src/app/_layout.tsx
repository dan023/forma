import '@/global.css';
import '@/i18n';

import { BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { Figtree_400Regular, Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import type { CatalogFood } from '@/db/catalog-food';
import { db } from '@/db/client';
import { seedFoods } from '@/db/seed-foods';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/stores/settings';

import foodsMeta from '../../assets/data/foods.meta.json';
import migrations from '../../drizzle/migrations';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const t = useTheme();
  const [loaded] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  const { success: migrated, error: migrationError } = useMigrations(db, migrations);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!migrated) return;
    (async () => {
      await useSettings.getState().hydrate();
      // Primo avvio (o catalogo aggiornato): importa gli alimenti. foods.json (7 MB) si carica solo qui.
      await seedFoods(db, foodsMeta, () => require('../../assets/data/foods.json') as CatalogFood[]);
    })()
      .catch((e) => console.warn('Avvio: impostazioni o catalogo alimenti non caricati', e))
      .finally(() => setHydrated(true));
  }, [migrated]);

  const ready = loaded && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (migrationError) throw migrationError;
  if (!ready) return null;

  return (
    <ThemeProvider>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }} />
    </ThemeProvider>
  );
}
