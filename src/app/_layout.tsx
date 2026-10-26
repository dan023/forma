import "@/global.css";
import "@/i18n";

import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import type { CatalogExercise } from "@/db/catalog-exercise";
import type { CatalogFood } from "@/db/catalog-food";
import { db } from "@/db/client";
import { ensureDefaultMealSlots } from "@/db/meal-slots";
import { seedExercises } from "@/db/seed-exercises";
import { seedFoods } from "@/db/seed-foods";
import { useTheme } from "@/hooks/use-theme";
import { screenId } from "@/lib/screen-id";
import { useSettings } from "@/stores/settings";

import exercisesMeta from "../../assets/data/exercises.meta.json";
import foodsMeta from "../../assets/data/foods.meta.json";
import migrations from "../../drizzle/migrations";

SplashScreen.preventAutoHideAsync();

/**
 * Schermate che si aprono sopra le tab. Con gli stessi parametri ce n'è al più una (`screenId`): toccare due volte
 * un collegamento mentre la schermata si carica non la apre due volte.
 */
const PUSHED_SCREENS = [
  "cerca",
  "alimento/[id]",
  "allenamento/esercizi",
  "allenamento/sessione",
  "allenamento/giorno/[d]",
  "allenamento/scheda/[id]",
  "allenamento/riepilogo/[id]",
  "esercizio/[id]",
];

export default function RootLayout() {
  const t = useTheme();
  const [loaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  const { success: migrated, error: migrationError } = useMigrations(
    db,
    migrations,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!migrated) return;
    (async () => {
      await useSettings.getState().hydrate();
      ensureDefaultMealSlots(db);
      // Catalogo esercizi (1,6 MB): stesso meccanismo degli alimenti, si carica solo se è cambiato.
      seedExercises(
        db,
        exercisesMeta,
        () => require("../../assets/data/exercises.json") as CatalogExercise[],
      );
      // Primo avvio (o catalogo aggiornato): importa gli alimenti. foods.json (7 MB) si carica solo qui.
      await seedFoods(
        db,
        foodsMeta,
        () => require("../../assets/data/foods.json") as CatalogFood[],
      );
    })()
      .catch((e) =>
        console.warn("Avvio: impostazioni o cataloghi non caricati", e),
      )
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
      <StatusBar style={t.scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        {PUSHED_SCREENS.map((name) => (
          <Stack.Screen key={name} name={name} dangerouslySingular={screenId} />
        ))}
      </Stack>
    </ThemeProvider>
  );
}
