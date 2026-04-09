import { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";

interface CookingSpinnerProps {
  message?: string;
}

export function CookingSpinner({ message }: CookingSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Animated.Text style={[{ fontSize: 56 }, animatedStyle]}>🍳</Animated.Text>
      {message ? (
        <Text style={{ color: "#4b5563", fontSize: 15, textAlign: "center" }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}
