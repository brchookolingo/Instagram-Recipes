import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  FlatList,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRecipeStore } from "../../src/stores/recipe-store";
import { useBoardStore } from "../../src/stores/board-store";
import { useGroceryStore } from "../../src/stores/grocery-store";
import { IngredientList } from "../../src/components/IngredientList";
import { InstructionList } from "../../src/components/InstructionList";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recipe = useRecipeStore((s) => s.getRecipeById(id ?? ""));
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const boards = useBoardStore((s) => s.boards);
  const addRecipeToBoard = useBoardStore((s) => s.addRecipeToBoard);
  const removeRecipeFromBoard = useBoardStore((s) => s.removeRecipeFromBoard);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  const addRecipeIngredients = useGroceryStore((s) => s.addRecipeIngredients);

  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "";

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Recipe not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRecipe(recipe.id);
            router.back();
          },
        },
      ],
    );
  };

  const handleAddToGrocery = async () => {
    if (!recipe.ingredients.length) {
      Alert.alert("No Ingredients", "This recipe has no ingredients to add.");
      return;
    }
    setAddingToGrocery(true);
    try {
      await addRecipeIngredients(recipe.id, recipe.title, recipe.ingredients, apiKey);
      Alert.alert("Added!", "Ingredients added to your grocery list.");
    } catch {
      Alert.alert("Error", "Failed to add ingredients. Check your Claude API key in Settings.");
    } finally {
      setAddingToGrocery(false);
    }
  };

  const handleToggleBoard = (boardId: string) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;
    if (board.recipeIds.includes(recipe.id)) {
      removeRecipeFromBoard(boardId, recipe.id);
    } else {
      addRecipeToBoard(boardId, recipe.id);
    }
  };

  const imageUri = recipe.localImageUri || recipe.imageUrl;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold">{recipe.title}</Text>

        {recipe.author ? (
          <Text className="text-gray-500 mt-1">by {recipe.author}</Text>
        ) : null}

        {recipe.sourceUrl ? (
          <Pressable onPress={() => Linking.openURL(recipe.sourceUrl)}>
            <Text className="text-pink-500 text-sm mt-1">
              View on Instagram ↗
            </Text>
          </Pressable>
        ) : null}

        <View className="flex-row items-center mt-3">
          <View className="flex-1 flex-row flex-wrap gap-2">
            {recipe.prepTime ? (
              <View className="bg-pink-50 rounded-full px-3 py-1">
                <Text className="text-xs text-pink-600">
                  Prep: {recipe.prepTime} min
                </Text>
              </View>
            ) : null}
            {recipe.cookTime ? (
              <View className="bg-orange-50 rounded-full px-3 py-1">
                <Text className="text-xs text-orange-600">
                  Cook: {recipe.cookTime} min
                </Text>
              </View>
            ) : null}
            {recipe.servings ? (
              <View className="bg-blue-50 rounded-full px-3 py-1">
                <Text className="text-xs text-blue-600">
                  Serves: {recipe.servings}
                </Text>
              </View>
            ) : null}
          </View>
          <Pressable
            className="p-2"
            hitSlop={8}
            onPress={() => updateRecipe(recipe.id, { isFavourite: !recipe.isFavourite })}
          >
            <Ionicons
              name={recipe.isFavourite ? "heart" : "heart-outline"}
              size={24}
              color={recipe.isFavourite ? "#ef4444" : "#000000"}
            />
          </Pressable>
        </View>

        {recipe.description ? (
          <Text className="text-gray-600 mt-4">{recipe.description}</Text>
        ) : null}

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", aspectRatio: 1, borderRadius: 16, marginTop: 16 }}
            contentFit="cover"
          />
        ) : null}

        {recipe.ingredients.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3">Ingredients</Text>
            <IngredientList ingredients={recipe.ingredients} />
          </View>
        )}

        {recipe.instructions.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3">Instructions</Text>
            <InstructionList instructions={recipe.instructions} />
          </View>
        )}

        {recipe.notes ? (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3">Notes</Text>
            <Text className="text-base text-gray-700 leading-relaxed">{recipe.notes}</Text>
          </View>
        ) : null}

        <View className="gap-3 mt-8 mb-8">
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-pink-50 rounded-xl py-3 items-center"
              onPress={() => setShowBoardModal(true)}
            >
              <Text className="text-pink-600 font-semibold">Add to Board</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-green-50 rounded-xl py-3 items-center flex-row justify-center gap-2"
              onPress={handleAddToGrocery}
              disabled={addingToGrocery}
            >
              {addingToGrocery ? (
                <ActivityIndicator size="small" color="#16a34a" />
              ) : null}
              <Text className="text-green-700 font-semibold">
                {addingToGrocery ? "Adding..." : "Add to Grocery List"}
              </Text>
            </Pressable>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              onPress={() => router.push(`/recipe/edit/${recipe.id}`)}
            >
              <Text className="text-gray-700 font-semibold">Edit Recipe</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-red-50 rounded-xl py-3 items-center"
              onPress={handleDelete}
            >
              <Text className="text-red-600 font-semibold">Delete Recipe</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal visible={showBoardModal} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <Pressable
            className="flex-1"
            onPress={() => setShowBoardModal(false)}
          />
          <View className="bg-white rounded-t-3xl px-4 pt-6 pb-10 max-h-96">
            <Text className="text-lg font-bold mb-4">Add to Board</Text>
            {boards.length === 0 ? (
              <Text className="text-gray-400 text-center py-4">
                No boards yet. Create one from the Boards tab.
              </Text>
            ) : (
              <FlatList
                data={boards}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isInBoard = item.recipeIds.includes(recipe.id);
                  return (
                    <Pressable
                      className="flex-row items-center py-3 border-b border-gray-100"
                      onPress={() => handleToggleBoard(item.id)}
                    >
                      <View
                        className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                          isInBoard
                            ? "bg-pink-500 border-pink-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isInBoard && (
                          <Text className="text-white text-xs font-bold">
                            ✓
                          </Text>
                        )}
                      </View>
                      <Text className="text-base flex-1">{item.name}</Text>
                      <Text className="text-xs text-gray-400">
                        {item.recipeIds.length} recipes
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}
            <Pressable
              className="mt-4 bg-gray-100 rounded-xl py-3 items-center"
              onPress={() => setShowBoardModal(false)}
            >
              <Text className="text-gray-600 font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
