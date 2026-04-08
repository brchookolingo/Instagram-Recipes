import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
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
