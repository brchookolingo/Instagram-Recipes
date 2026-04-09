import { View, Text } from "react-native";
import { Ingredient } from "../types/recipe";

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <View className="gap-2">
      {ingredients.map((ingredient) => (
        <View key={ingredient.id} className="flex-row items-start gap-3 py-1 px-3">
          <Text className="text-gray-400 mt-1">•</Text>
          <Text className="flex-1 text-base text-gray-800">
            {ingredient.text}
          </Text>
        </View>
      ))}
    </View>
  );
}
