import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Board Detail</Text>
      <Text className="text-gray-500 mt-2">Board ID: {id}</Text>
    </View>
  );
}
