import { View, Text, FlatList, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBoardStore } from '../../src/stores/board-store';
import { useRecipeStore } from '../../src/stores/recipe-store';
import { RecipeCard } from '../../src/components/RecipeCard';
import { Recipe } from '../../src/types/recipe';

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const boards = useBoardStore((s) => s.boards);
  const board = boards.find((b) => b.id === id);
  const updateBoard = useBoardStore((s) => s.updateBoard);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const removeRecipeFromBoard = useBoardStore((s) => s.removeRecipeFromBoard);
  const recipes = useRecipeStore((s) => s.recipes);

  if (!board) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Board not found</Text>
      </View>
    );
  }

  const boardRecipes = recipes.filter((r) => board.recipeIds.includes(r.id));

  const handleRename = () => {
    Alert.prompt('Rename Board', 'Enter a new name:', (name) => {
      if (name?.trim()) {
        updateBoard(board.id, { name: name.trim() });
      }
    });
  };

  const handleDeleteBoard = () => {
    Alert.alert('Delete Board', `Delete "${board.name}"? Recipes won't be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBoard(board.id);
          router.back();
        },
      },
    ]);
  };

  const handleLongPressRecipe = (recipeId: string) => {
    Alert.alert('Remove from Board', 'Remove this recipe from the board?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeRecipeFromBoard(board.id, recipeId),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <Pressable
      className="flex-1"
      onLongPress={() => handleLongPressRecipe(item.id)}
    >
      <RecipeCard
        recipe={item}
        onPress={() => router.push(`/recipe/${item.id}`)}
      />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 py-3 flex-row items-center justify-between bg-white border-b border-gray-100">
        <Text className="text-lg font-bold flex-1" numberOfLines={1}>
          {board.name}
        </Text>
        <View className="flex-row gap-3">
          <Pressable onPress={handleRename}>
            <Text className="text-pink-500 font-semibold">Rename</Text>
          </Pressable>
          <Pressable onPress={handleDeleteBoard}>
            <Text className="text-red-500 font-semibold">Delete</Text>
          </Pressable>
        </View>
      </View>

      {boardRecipes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📂</Text>
          <Text className="text-xl font-bold text-gray-700">Board is empty</Text>
          <Text className="text-gray-400 text-center mt-2">
            Add recipes from the recipe detail screen
          </Text>
        </View>
      ) : (
        <FlatList
          data={boardRecipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 4 }}
        />
      )}
    </View>
  );
}
