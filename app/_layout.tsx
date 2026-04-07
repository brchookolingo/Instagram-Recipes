import "../global.css";

import { Stack } from "expo-router";
import { ErrorBoundary } from "../src/components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-recipe"
          options={{ title: "Add Recipe", presentation: "modal" }}
        />
        <Stack.Screen name="recipe/[id]" options={{ title: "Recipe", headerBackButtonDisplayMode: "minimal" }} />
        <Stack.Screen name="board/[id]" options={{ title: "Board", headerBackButtonDisplayMode: "minimal" }} />
      </Stack>
    </ErrorBoundary>
  );
}
