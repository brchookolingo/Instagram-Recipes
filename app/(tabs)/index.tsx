import { useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../src/stores/recipe-store';
import { RecipeCard } from '../../src/components/RecipeCard';
import { Recipe } from '../../src/types/recipe';

export default function HomeScreen() {
  const recipes = useRecipeStore((s) => s.recipes);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = search
    ? recipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      )
    : recipes;

  const renderItem = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={() => router.push(`/recipe/${item.id}`)}
    />
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-2 pb-2">
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base"
          placeholder="Search recipes..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🍽️</Text>
          <Text className="text-xl font-bold text-gray-700">No recipes yet</Text>
          <Text className="text-gray-400 text-center mt-2">
            Tap the + button to save your first Instagram recipe
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 4 }}
        />
      )}

      <Pressable
        className="absolute bottom-6 right-6 w-14 h-14 bg-pink-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/add-recipe')}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>
    </View>
  );
}
