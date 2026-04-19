import "../global.css";

import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { sweepOrphanedImages } from "../src/utils/image-cache";
import { useRecipeStore } from "../src/stores/recipe-store";
import { hasSeenOnboarding } from "../src/utils/onboarding";

export default function RootLayout() {
  const recipes = useRecipeStore((s) => s.recipes);
  const router = useRouter();

  useEffect(() => {
    const ids = recipes.map((r) => r.id);
    sweepOrphanedImages(ids).catch(() => {
      // Already logs internally; swallow so the tree mounts regardless.
    });
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
