import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useRecipeStore } from '../../src/stores/recipe-store';
import { IngredientList } from '../../src/components/IngredientList';
import { InstructionList } from '../../src/components/InstructionList';

const SOURCE_LABELS = {
  caption: 'Caption AI',
  video: 'Video AI',
  manual: 'Manual',
} as const;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recipe = useRecipeStore((s) => s.getRecipeById(id ?? ''));
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Recipe not found</Text>
      </View>
    );
  }

  const handleToggleIngredient = (index: number) => {
    const updated = recipe.ingredients.map((ing, i) =>
      i === index ? { ...ing, checked: !ing.checked } : ing
    );
    updateRecipe(recipe.id, { ingredients: updated });
  };

  const handleDelete = () => {
    Alert.alert('Delete Recipe', `Are you sure you want to delete "${recipe.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRecipe(recipe.id);
          router.back();
        },
      },
    ]);
  };

  const imageUri = recipe.localImageUri || recipe.imageUrl;

  return (
    <ScrollView className="flex-1 bg-white">
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          className="w-full aspect-video"
          contentFit="cover"
        />
      ) : null}

      <View className="px-4 py-4">
        <Text className="text-2xl font-bold">{recipe.title}</Text>

        {recipe.author ? (
          <Text className="text-gray-500 mt-1">by {recipe.author}</Text>
        ) : null}

        <View className="flex-row items-center gap-2 mt-3">
          <View className="bg-purple-100 rounded-full px-3 py-1">
            <Text className="text-xs text-purple-700">
              {SOURCE_LABELS[recipe.extractionSource]}
            </Text>
          </View>
          {recipe.prepTime ? (
            <View className="bg-pink-50 rounded-full px-3 py-1">
              <Text className="text-xs text-pink-600">Prep: {recipe.prepTime}</Text>
            </View>
          ) : null}
          {recipe.cookTime ? (
            <View className="bg-orange-50 rounded-full px-3 py-1">
              <Text className="text-xs text-orange-600">Cook: {recipe.cookTime}</Text>
            </View>
          ) : null}
          {recipe.servings ? (
            <View className="bg-blue-50 rounded-full px-3 py-1">
              <Text className="text-xs text-blue-600">Serves: {recipe.servings}</Text>
            </View>
          ) : null}
        </View>

        {recipe.description ? (
          <Text className="text-gray-600 mt-4">{recipe.description}</Text>
        ) : null}

        {recipe.ingredients.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3">Ingredients</Text>
            <IngredientList
              ingredients={recipe.ingredients}
              onToggle={handleToggleIngredient}
            />
          </View>
        )}

        {recipe.instructions.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3">Instructions</Text>
            <InstructionList instructions={recipe.instructions} />
          </View>
        )}

        <View className="flex-row gap-3 mt-8 mb-8">
          <Pressable
            className="flex-1 bg-red-50 rounded-xl py-3 items-center"
            onPress={handleDelete}
          >
            <Text className="text-red-600 font-semibold">Delete Recipe</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
