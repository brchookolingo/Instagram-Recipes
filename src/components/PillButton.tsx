import { Pressable, Text } from "react-native";

interface PillButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function PillButton({ label, active, onPress }: PillButtonProps) {
  return (
    <Pressable
      className={`rounded-full px-4 py-2 border ${active ? "bg-pink-500 border-pink-500" : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text className={`text-sm font-medium ${active ? "text-white" : "text-gray-600 dark:text-gray-200"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
