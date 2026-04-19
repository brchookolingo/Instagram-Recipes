import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { markOnboardingSeen } from "../src/utils/onboarding";

const SLIDES = [
  {
    emoji: "🍽️",
    title: "Welcome to ReciGrams",
    description: "Save recipes from Instagram, TikTok & Pinterest in seconds.",
  },
  {
    emoji: "📲",
    title: "Just copy the link",
    description:
      "Tap Share on any post, copy the link, and paste it into ReciGrams — that's all it takes.",
  },
  {
    emoji: "✨",
    title: "Recipe extracted instantly",
    description:
      "We automatically pull out the title, ingredients, instructions, and timing.",
  },
  {
    emoji: "📚",
    title: "Stay organised",
    description: "Group your recipes into Collections to find them easily.",
  },
  {
    emoji: "🛒",
    title: "Smart grocery lists",
    description:
      "Add ingredients to your list and Claude organises them by store section.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isReview = mode === "review";

  const [currentIndex, setCurrentIndex] = useState(0);
  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (isReview) {
        router.back();
      } else {
        markOnboardingSeen();
        router.replace("/(tabs)");
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    if (isReview) {
      router.back();
    } else {
      markOnboardingSeen();
      router.replace("/(tabs)");
    }
  };

  const slide = SLIDES[currentIndex];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Skip button */}
      <View style={styles.skipRow}>
        {!isLast ? (
          <Pressable
            onPress={handleSkip}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isReview ? "Done" : "Skip onboarding"}
          >
            <Text style={styles.skipText}>{isReview ? "Done" : "Skip"}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      {/* Slide content */}
      <View style={styles.content}>
        <Text style={styles.emoji} accessibilityElementsHidden>
          {slide.emoji}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {slide.title}
        </Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      {/* Dots */}
      <View
        style={styles.dotsRow}
        accessibilityLabel={`Slide ${currentIndex + 1} of ${SLIDES.length}`}
      >
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleNext}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={
            isLast ? (isReview ? "Done" : "Get Started") : "Next slide"
          }
        >
          <Text style={styles.buttonText}>
            {isLast ? (isReview ? "Done" : "Get Started") : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipText: {
    color: "#9ca3af",
    fontSize: 15,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: "#ec4899",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#e5e7eb",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  button: {
    backgroundColor: "#ec4899",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
