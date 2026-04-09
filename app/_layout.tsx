import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { sweepOrphanedImages } from "../src/utils/image-cache";
import { useRecipeStore } from "../src/stores/recipe-store";

export default function RootLayout() {
  const recipes = useRecipeStore((s) => s.recipes);

  useEffect(() => {
    const ids = recipes.map((r) => r.id);
    sweepOrphanedImages(ids);
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-recipe"
        options={{ title: "Add Recipe", presentation: "modal" }}
      />
      <Stack.Screen name="recipe/[id]" options={{ title: "Recipe", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="board/[id]" options={{ title: "Board", headerBackButtonDisplayMode: "minimal" }} />
    </Stack>
  );
}
