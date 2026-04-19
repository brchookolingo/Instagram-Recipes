import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Recipe } from "../types/recipe";
import { colors } from "../utils/colors";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard = memo(function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const imageUri = recipe.localImageUri || recipe.imageUrl || null;
  const accessibilityLabel = [
    recipe.title,
    recipe.author ? `by ${recipe.author}` : null,
    recipe.prepTime ? `prep ${recipe.prepTime} minutes` : null,
    recipe.cookTime ? `cook ${recipe.cookTime} minutes` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      className="flex-1 m-1.5"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens recipe details"
    >
      <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", aspectRatio: 1, backgroundColor: colors.surfaceAlt }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={{ width: "100%", aspectRatio: 1, backgroundColor: colors.surfaceAlt }} />
        )}
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
                  Prep: {recipe.prepTime} min
                </Text>
              </View>
            ) : null}
            {recipe.cookTime ? (
              <View className="bg-orange-50 rounded-full px-2 py-0.5">
                <Text className="text-xs text-orange-600">
                  Cook: {recipe.cookTime} min
                </Text>
              </View>
            ) : null}
          </View>
          {recipe.description ? (
            <Text className="text-xs text-gray-400 mt-2" numberOfLines={2}>
              {recipe.description}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});
