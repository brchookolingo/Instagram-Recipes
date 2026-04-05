import { View, Text, FlatList, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useBoardStore } from '../../src/stores/board-store';
import { BoardCard } from '../../src/components/BoardCard';
import { Board } from '../../src/types/recipe';

export default function BoardsScreen() {
  const boards = useBoardStore((s) => s.boards);
  const addBoard = useBoardStore((s) => s.addBoard);
  const router = useRouter();

  const handleNewBoard = () => {
    Alert.prompt('New Board', 'Enter a name for your board:', (name) => {
      if (name?.trim()) {
        addBoard({
          id: Date.now().toString(),
          name: name.trim(),
          recipeIds: [],
          createdAt: new Date().toISOString(),
        });
      }
    });
  };

  const renderItem = ({ item }: { item: Board }) => (
    <BoardCard
      board={item}
      recipeCount={item.recipeIds.length}
      onPress={() => router.push(`/board/${item.id}`)}
    />
  );

  return (
    <View className="flex-1 bg-gray-50">
      {boards.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📋</Text>
          <Text className="text-xl font-bold text-gray-700">No boards yet</Text>
          <Text className="text-gray-400 text-center mt-2">
            Create a board to organize your recipes
          </Text>
          <Pressable
            className="mt-6 bg-pink-500 rounded-xl px-6 py-3"
            onPress={handleNewBoard}
          >
            <Text className="text-white font-semibold">Create Board</Text>
          </Pressable>
        </View>
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
