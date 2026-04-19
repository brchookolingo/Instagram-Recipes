import { View } from "react-native";

function SkeletonCard() {
  return (
    <View className="flex-1 m-1.5">
      <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <View style={{ width: "100%", aspectRatio: 1, backgroundColor: "#f3f4f6" }} />
        <View className="p-3 gap-2">
          <View className="h-4 rounded bg-gray-100" />
          <View className="h-3 w-1/2 rounded bg-gray-100" />
        </View>
      </View>
    </View>
  );
}

export function SkeletonRecipeGrid() {
  return (
    <View className="flex-1 p-1">
      <View className="flex-row">
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <View className="flex-row">
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <View className="flex-row">
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
}
