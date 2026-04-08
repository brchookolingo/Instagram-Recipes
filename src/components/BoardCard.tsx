import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Board } from "../types/recipe";

interface BoardCardProps {
  board: Board;
  recipeCount: number;
  recipeImages: string[];
  onPress: () => void;
}

export const BoardCard = memo(function BoardCard({ board, recipeCount, recipeImages, onPress }: BoardCardProps) {
  const slots = [0, 1, 2, 3];

  return (
    <Pressable className="flex-1 m-1.5" onPress={onPress}>
      <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {recipeImages.length === 0 ? (
          <View className="w-full aspect-square bg-gray-100 items-center justify-center">
            <Text className="text-4xl">📋</Text>
          </View>
        ) : (
          <View className="w-full aspect-square flex-row flex-wrap">
            {slots.map((i) => (
              <View key={i} style={{ width: "50%", height: "50%" }}>
                {recipeImages[i] ? (
                  <Image
                    source={{ uri: recipeImages[i] }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <View style={{ width: "100%", height: "100%", backgroundColor: "#f3f4f6" }} />
                )}
              </View>
            ))}
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
});
