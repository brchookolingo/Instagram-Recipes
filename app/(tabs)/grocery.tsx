import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGroceryStore } from "../../src/stores/grocery-store";
import { EmptyState } from "../../src/components/EmptyState";

export default function GroceryScreen() {
  const router = useRouter();
  const sections = useGroceryStore((s) => s.sections);
  const recipeRefs = useGroceryStore((s) => s.recipeRefs);
  const isLoading = useGroceryStore((s) => s.isLoading);
  const toggleItem = useGroceryStore((s) => s.toggleItem);
  const clearAll = useGroceryStore((s) => s.clearAll);
  const clearChecked = useGroceryStore((s) => s.clearChecked);

  const isEmpty = sections.length === 0 && !isLoading;

  const handleClearAll = () => {
    Alert.alert(
      "Clear Grocery List",
      "Are you sure you want to delete the entire grocery list?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: clearAll },
      ],
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Action buttons */}
      <View className="flex-row gap-3 px-4 pt-4 pb-2">
        <Pressable
          className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
          onPress={clearChecked}
        >
          <Text className="text-gray-700 font-semibold text-sm">Clear Crossed Out</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-red-50 rounded-xl py-3 items-center"
          onPress={handleClearAll}
        >
          <Text className="text-red-600 font-semibold text-sm">Clear Entire List</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="text-gray-500 mt-3">Organizing your grocery list...</Text>
        </View>
      ) : isEmpty ? (
        <EmptyState
          icon="🛒"
          title="No groceries yet"
          subtitle="Open a recipe and tap 'Add to Grocery List' to get started"
        />
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {/* Recipe refs */}
          {recipeRefs.length > 0 && (
            <View className="mt-4 mb-6">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Added from
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {recipeRefs.map((ref) => (
                  <Pressable
                    key={ref.id}
                    onPress={() => router.push(`/recipe/${ref.id}`)}
                    className="bg-pink-50 rounded-full px-3 py-1 flex-row items-center gap-1"
                  >
                    <Text className="text-pink-600 text-sm font-medium">{ref.title}</Text>
                    <Text className="text-pink-400 text-xs">↗</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Grocery sections */}
          {sections.map((section) => (
            <View key={section.name} className="mb-6">
              <Text className="text-base font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">
                {section.name}
              </Text>
              {section.items.map((item) => (
                <Pressable
                  key={item.id}
                  className="flex-row items-center py-2 gap-3"
                  onPress={() => toggleItem(section.name, item.id)}
                >
                  <Ionicons
                    name={item.checked ? "checkbox" : "checkbox-outline"}
                    size={22}
                    color={item.checked ? "#9ca3af" : "#ec4899"}
                  />
                  <Text
                    className={`flex-1 text-base ${item.checked ? "text-gray-400 line-through" : "text-gray-800"}`}
                  >
                    {item.quantity ? `${item.quantity}${item.unit ? " " + item.unit : ""} ` : ""}
                    {item.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
