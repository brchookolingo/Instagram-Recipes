import { View, Text } from 'react-native';

export default function AddRecipeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Add Recipe</Text>
      <Text className="text-gray-500 mt-2">Paste an Instagram link to get started</Text>
    </View>
  );
}
