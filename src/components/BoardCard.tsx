import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Board } from "../types/recipe";

interface BoardCardProps {
  board: Board;
  recipeCount: number;
  onPress: () => void;
}

export function BoardCard({ board, recipeCount, onPress }: BoardCardProps) {
  return (
    <Pressable className="flex-1 m-1.5" onPress={onPress}>
      <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {board.coverImageUri ? (
          <Image
            source={{ uri: board.coverImageUri }}
            className="w-full aspect-video"
            contentFit="cover"
          />
        ) : (
          <View className="w-full aspect-video bg-gray-100 items-center justify-center">
            <Text className="text-4xl">📋</Text>
          </View>
        )}
        <View className="p-3">
          <Text className="text-base font-semibold" numberOfLines={1}>
            {board.name}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
