import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRecipeStore } from "../../src/stores/recipe-store";
import { useBoardStore } from "../../src/stores/board-store";
import { useGroceryStore } from "../../src/stores/grocery-store";

export default function SettingsScreen() {
  const router = useRouter();
  const clearRecipes = useRecipeStore((s) => s.clearAll);
  const clearBoards = useBoardStore((s) => s.clearAll);
  const clearGrocery = useGroceryStore((s) => s.clearAll);
  const recipes = useRecipeStore((s) => s.recipes);

  const [imageCacheSize, setImageCacheSize] = useState<string | null>(null);

  useEffect(() => {
    async function calcCacheSize() {
      try {
        const dir = `${FileSystem.documentDirectory}images/`;
        const files = await FileSystem.readDirectoryAsync(dir);
        let totalBytes = 0;
        for (const file of files) {
          const info = await FileSystem.getInfoAsync(`${dir}${file}`);
          if (info.exists && "size" in info) {
            totalBytes += (info as FileSystem.FileInfo & { size: number }).size;
          }
        }
        setImageCacheSize((totalBytes / (1024 * 1024)).toFixed(1) + " MB");
      } catch {
        setImageCacheSize("0.0 MB");
      }
    }
    calcCacheSize();
  }, []);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all saved recipes, collections, and your grocery list. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: () => {
            clearRecipes();
            clearBoards();
            clearGrocery();
            Alert.alert("Done", "All data has been cleared.");
          },
        },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="mt-6 px-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 ml-1">
          App Info
        </Text>
        <View className="bg-white rounded-2xl px-4 py-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">App Name</Text>
            <Text className="text-gray-800 font-medium">ReciGrams</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Version</Text>
            <Text className="text-gray-800 font-medium">1.0.0</Text>
          </View>
        </View>
      </View>

      <View className="mt-6 px-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 ml-1">
          Storage
        </Text>
        <View className="bg-white rounded-2xl px-4 py-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Recipes saved</Text>
            <Text className="text-gray-800 font-medium">{recipes.length}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Image cache</Text>
            <Text className="text-gray-800 font-medium">
              {imageCacheSize ?? "Calculating\u2026"}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-6 px-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 ml-1">
          Support
        </Text>
        <View className="bg-white rounded-2xl px-4 divide-y divide-gray-100">
          <Pressable
            className="flex-row items-center py-4 gap-3"
            onPress={() => router.push("/onboarding?mode=review")}
          >
            <Ionicons name="help-circle-outline" size={22} color="#ec4899" />
            <Text className="text-gray-800 flex-1">How to Use</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
          <Pressable
            className="flex-row items-center py-4 gap-3"
            onPress={() =>
              Linking.openURL(
                "https://docs.google.com/forms/d/e/1FAIpQLSetETqXQ0aU5zb7PiaTtsWrKaV2bdjkkttPYdPUNKpApPiOqQ/viewform?usp=publish-editor",
              )
            }
          >
            <Ionicons name="chatbubble-outline" size={22} color="#ec4899" />
            <Text className="text-gray-800 flex-1">Send Feedback</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        </View>
      </View>

      <View className="mt-6 px-4 mb-10">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 ml-1">
          Data
        </Text>
        <View className="bg-white rounded-2xl px-4 py-4 gap-3">
          <Pressable
            className="bg-red-50 rounded-xl py-3 items-center"
            onPress={handleClearData}
          >
            <Text className="text-red-600 font-semibold">Clear All Data</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
