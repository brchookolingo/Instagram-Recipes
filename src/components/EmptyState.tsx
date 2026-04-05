import { View, Text, Pressable } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-gray-700">{title}</Text>
      <Text className="text-gray-400 text-center mt-2">{subtitle}</Text>
      {actionLabel && onAction && (
        <Pressable
          className="mt-6 bg-pink-500 rounded-xl px-6 py-3"
          onPress={onAction}
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
