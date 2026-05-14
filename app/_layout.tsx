import "../src/styles/global.css";

import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { backfillImageCache, sweepOrphanedImages } from "../src/utils/image-cache";
import { useRecipeStore } from "../src/stores/recipe-store";
import { hasSeenOnboarding } from "../src/utils/onboarding";

export default function RootLayout() {
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const current = useRecipeStore.getState().recipes;
      await sweepOrphanedImages(current.map((r) => r.id));
      await backfillImageCache(
        current.map((r) => ({
          id: r.id,
          imageUrl: r.imageUrl,
          localImageUri: r.localImageUri,
        })),
        (id, localImageUri) => updateRecipe(id, { localImageUri }),
      );
    };
    const unsub = useRecipeStore.persist.onFinishHydration(() => {
      void run();
    });
    if (useRecipeStore.persist.hasHydrated()) void run();
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasSeenOnboarding()) {
      router.replace("/onboarding");
    }
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-recipe"
        options={{ title: "Add Recipe", presentation: "modal" }}
      />
      <Stack.Screen name="recipe/[id]" options={{ title: "Recipe", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="collection/[id]" options={{ title: "Collection", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}
