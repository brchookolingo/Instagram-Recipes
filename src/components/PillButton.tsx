import { Pressable, Text } from "react-native";

interface PillButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function PillButton({ label, active, onPress }: PillButtonProps) {
  return (
    <Pressable
      className={`rounded-full px-4 py-2 border ${active ? "bg-pink-500 border-pink-500" : "bg-white border-gray-300"}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text className={`text-sm font-medium ${active ? "text-white" : "text-gray-600"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
