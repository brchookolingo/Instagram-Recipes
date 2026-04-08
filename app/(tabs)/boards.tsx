import { View, Text, FlatList, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useBoardStore } from "../../src/stores/board-store";
import { useRecipeStore } from "../../src/stores/recipe-store";
import { generateId } from "../../src/utils/uuid";
import { BoardCard } from "../../src/components/BoardCard";
import { EmptyState } from "../../src/components/EmptyState";
import { Board } from "../../src/types/recipe";

export default function BoardsScreen() {
  const boards = useBoardStore((s) => s.boards);
  const addBoard = useBoardStore((s) => s.addBoard);
  const recipes = useRecipeStore((s) => s.recipes);
  const router = useRouter();

  const handleNewBoard = () => {
    Alert.prompt("New Board", "Enter a name for your board:", (name) => {
      if (name?.trim()) {
        addBoard({
          id: generateId(),
          name: name.trim(),
          recipeIds: [],
          createdAt: new Date().toISOString(),
        });
      }
    });
  };

  const renderItem = ({ item }: { item: Board }) => {
    const recipeImages = item.recipeIds
      .slice(0, 4)
      .map((id) => recipes.find((r) => r.id === id))
      .filter(Boolean)
      .map((r) => r!.localImageUri || r!.imageUrl)
      .filter(Boolean) as string[];

    return (
      <BoardCard
        board={item}
        recipeCount={item.recipeIds.length}
        recipeImages={recipeImages}
        onPress={() => router.push(`/board/${item.id}`)}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {boards.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No boards yet"
          subtitle="Create a board to organize your recipes"
          actionLabel="Create Board"
          onAction={handleNewBoard}
        />
      ) : (
        <>
          <FlatList
            data={boards}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 4 }}
          />
          <Pressable
            className="absolute bottom-6 right-6 w-14 h-14 bg-pink-500 rounded-full items-center justify-center shadow-lg"
            onPress={handleNewBoard}
          >
            <Text className="text-white text-3xl font-light">+</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
