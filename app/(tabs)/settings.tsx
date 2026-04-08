import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRecipeStore } from "../../src/stores/recipe-store";
import { useBoardStore } from "../../src/stores/board-store";
import { useGroceryStore } from "../../src/stores/grocery-store";

export default function SettingsScreen() {
  const clearRecipes = useRecipeStore((s) => s.clearAll);
  const clearBoards = useBoardStore((s) => s.clearAll);
  const clearGrocery = useGroceryStore((s) => s.clearAll);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all saved recipes, boards, and your grocery list. This cannot be undone.",
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
