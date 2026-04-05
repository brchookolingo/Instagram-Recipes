import { View, Text, Pressable } from "react-native";
import { Ingredient } from "../types/recipe";

interface IngredientListProps {
  ingredients: Ingredient[];
  onToggle: (index: number) => void;
}

export function IngredientList({ ingredients, onToggle }: IngredientListProps) {
  return (
    <View className="gap-2">
      {ingredients.map((ingredient, index) => (
        <Pressable
          key={index}
          className="flex-row items-center gap-3 py-2 px-3"
          onPress={() => onToggle(index)}
        >
          <View
            className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
              ingredient.checked
                ? "bg-pink-500 border-pink-500"
                : "border-gray-300"
            }`}
          >
            {ingredient.checked && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
          <Text
            className={`flex-1 text-base ${
              ingredient.checked
                ? "line-through text-gray-400"
                : "text-gray-800"
            }`}
          >
            {ingredient.text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
