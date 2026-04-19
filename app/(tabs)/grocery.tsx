import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const addItem = useGroceryStore((s) => s.addItem);
  const removeItem = useGroceryStore((s) => s.removeItem);
  const updateItem = useGroceryStore((s) => s.updateItem);
  const clearAll = useGroceryStore((s) => s.clearAll);
  const clearChecked = useGroceryStore((s) => s.clearChecked);

  const [isEditing, setIsEditing] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  const isEmpty = sections.length === 0 && !isLoading && !isEditing;

  const handleClearAll = () => {
    Alert.alert(
      "Clear Grocery List",
      "Are you sure you want to delete the entire grocery list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearAll();
            setIsEditing(false);
          },
        },
      ],
    );
  };

  const handleAddItem = (sectionName: string) => {
    const text = newItemTexts[sectionName]?.trim();
    if (!text) return;
    addItem(sectionName, text);
    setNewItemTexts((prev) => ({ ...prev, [sectionName]: "" }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      {/* Action buttons */}
      <View className="flex-row gap-3 px-4 pt-4 pb-2">
        <Pressable
          className={`flex-1 rounded-xl py-3 items-center ${isEditing ? "bg-black" : "bg-gray-100"}`}
          onPress={() => setIsEditing((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? "Finish editing" : "Edit grocery list"}
          accessibilityState={{ selected: isEditing }}
        >
          <Text className={`font-semibold text-sm ${isEditing ? "text-white" : "text-gray-700"}`}>
            {isEditing ? "Done" : "Edit List"}
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
          onPress={clearChecked}
          accessibilityRole="button"
          accessibilityLabel="Clear checked items"
        >
          <Text className="text-gray-700 font-semibold text-sm">Clear Crossed Out</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-red-50 rounded-xl py-3 items-center"
          onPress={handleClearAll}
          accessibilityRole="button"
          accessibilityLabel="Clear entire grocery list"
        >
          <Text className="text-red-600 font-semibold text-sm">Clear All</Text>
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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
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
                    accessibilityRole="link"
                    accessibilityLabel={`Open recipe ${ref.title}`}
                  >
                    <Text className="text-pink-600 text-sm font-medium">{ref.title}</Text>
                    <Text className="text-pink-400 text-xs">↗</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Manual section — shown in edit mode when list is empty */}
          {isEditing && sections.length === 0 && (
            <View className="mb-6 mt-4">
              <Text className="text-base font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">
                Manual
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <View className="w-[22px]" />
                <TextInput
                  className="flex-1 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-base text-gray-600"
                  placeholder="Add item..."
                  value={newItemTexts["Manual"] ?? ""}
                  onChangeText={(text) =>
                    setNewItemTexts((prev) => ({ ...prev, Manual: text }))
                  }
                  onSubmitEditing={() => handleAddItem("Manual")}
                  returnKeyType="done"
                  autoFocus
                />
                <Pressable
                  className="bg-pink-500 rounded-lg px-3 py-2"
                  onPress={() => handleAddItem("Manual")}
                  accessibilityRole="button"
                  accessibilityLabel="Add manual item"
                >
                  <Ionicons name="add" size={20} color="white" />
                </Pressable>
              </View>
            </View>
          )}

          {/* Grocery sections */}
          {sections.map((section) => (
            <View key={section.name} className="mb-6">
              <Text
                className="text-base font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1"
                accessibilityRole="header"
              >
                {section.name}
              </Text>

              {section.items.map((item) =>
                isEditing ? (
                  // Edit mode row
                  <View key={item.id} className="flex-row items-center py-1 gap-2">
                    <Pressable
                      onPress={() => removeItem(section.name, item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.text}`}
                    >
                      <Ionicons name="remove-circle" size={22} color="#f87171" />
                    </Pressable>
                    <TextInput
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-800"
                      value={item.text}
                      onChangeText={(text) => updateItem(section.name, item.id, text)}
                      placeholder="Item name"
                      accessibilityLabel="Edit item name"
                    />
                  </View>
                ) : (
                  // View mode row
                  <Pressable
                    key={item.id}
                    className="flex-row items-center py-2 gap-3"
                    onPress={() => toggleItem(section.name, item.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={item.text}
                    accessibilityState={{ checked: item.checked }}
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
                )
              )}

              {/* Add item row — only in edit mode */}
              {isEditing && (
                <View className="flex-row items-center gap-2 mt-2">
                  <View className="w-[22px]" />
                  <TextInput
                    className="flex-1 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-base text-gray-600"
                    placeholder="Add item..."
                    value={newItemTexts[section.name] ?? ""}
                    onChangeText={(text) =>
                      setNewItemTexts((prev) => ({ ...prev, [section.name]: text }))
                    }
                    onSubmitEditing={() => handleAddItem(section.name)}
                    returnKeyType="done"
                    accessibilityLabel={`Add item to ${section.name}`}
                  />
                  <Pressable
                    className="bg-pink-500 rounded-lg px-3 py-2"
                    onPress={() => handleAddItem(section.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add to ${section.name}`}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
