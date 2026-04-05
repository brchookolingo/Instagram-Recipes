import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Settings</Text>
      <Text className="text-gray-500 mt-2">Configure your app preferences</Text>
    </View>
  );
}
