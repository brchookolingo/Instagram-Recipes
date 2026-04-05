import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Recipe } from "../types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/300x300.png?text=No+Image";

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const imageUri = recipe.localImageUri || recipe.imageUrl || PLACEHOLDER_IMAGE;
  const ingredientPreview = recipe.ingredients
    .slice(0, 2)
    .map((i) => i.text)
    .join(", ");

  return (
    <Pressable className="flex-1 m-1.5" onPress={onPress}>
      <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Image
          source={{ uri: imageUri }}
          className="w-full aspect-square"
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          transition={200}
        />
        <View className="p-3">
          <Text className="text-base font-semibold" numberOfLines={2}>
            {recipe.title}
          </Text>
          {recipe.author ? (
            <Text className="text-xs text-gray-500 mt-1">
              by {recipe.author}
            </Text>
          ) : null}
          <View className="flex-row mt-2 gap-2">
            {recipe.prepTime ? (
              <View className="bg-pink-50 rounded-full px-2 py-0.5">
                <Text className="text-xs text-pink-600">
                  Prep: {recipe.prepTime}
                </Text>
              </View>
            ) : null}
            {recipe.cookTime ? (
              <View className="bg-orange-50 rounded-full px-2 py-0.5">
                <Text className="text-xs text-orange-600">
                  Cook: {recipe.cookTime}
                </Text>
              </View>
            ) : null}
          </View>
          {ingredientPreview ? (
            <Text className="text-xs text-gray-400 mt-2" numberOfLines={1}>
              {ingredientPreview}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
